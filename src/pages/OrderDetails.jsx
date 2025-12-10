import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendURL, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const OrderDetails = ({ token }) => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrderDetails = async () => {
    if (!token) return

    try {
      const response = await axios.post(
        backendURL + '/api/order/list',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        const foundOrder = response.data.orders.find(o => o._id === orderId)
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          toast.error('Order not found')
          navigate('/orders')
        }
      } else {
        toast.error('Failed to fetch order details')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculatePriceBreakdown = () => {
    if (!order) return null

    let subtotal = 0
    let totalGST = 0

    order.items.forEach(item => {
      const itemPrice = item.price * item.quantity
      subtotal += itemPrice

      // Calculate GST based on category
      const gstRate = item.category === 'Apparels' ? 0.05 : 0.18
      const gstAmount = itemPrice * gstRate
      totalGST += gstAmount
    })

    const shippingFee = order.shippingFee || 100
    const total = subtotal + totalGST + shippingFee

    return {
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const statusHandler = async (e) => {
    try {
      const response = await axios.put(
        backendURL + '/api/order/status',
        { orderId: order._id, status: e.target.value },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Status updated')
        await fetchOrderDetails()
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [token, orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Order not found</p>
      </div>
    )
  }

  const priceBreakdown = calculatePriceBreakdown()

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <span>←</span> Back to Orders
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Order ID:</span> {order._id}</p>
              <p><span className="font-medium">Date:</span> {new Date(order.date).toLocaleString()}</p>
              <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
              <p>
                <span className="font-medium">Payment Status:</span>{' '}
                <span className={order.payment ? 'text-green-600' : 'text-orange-600'}>
                  {order.payment ? 'Paid' : 'Pending'}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="font-medium">Order Status:</span>
                <select
                  onChange={statusHandler}
                  value={order.status}
                  className="border border-gray-300 rounded px-3 py-1.5 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Shipping Address</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-base">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state}
              </p>
              <p>
                {order.address.country} - {order.address.zipcode}
              </p>
              <p className="mt-2">
                <span className="font-medium">Phone:</span> {order.address.phone}
              </p>
              {order.address.email && (
                <p>
                  <span className="font-medium">Email:</span> {order.address.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => {
            const itemTotal = item.price * item.quantity
            const gstRate = item.category === 'Apparels' ? 0.05 : 0.18
            const gstAmount = itemTotal * gstRate
            const itemWithGST = itemTotal + gstAmount

            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src={item.image?.[0] || assets.parcel_icon}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Category: {item.category} {item.subCategory && `| ${item.subCategory}`}
                  </p>
                  {item.size && item.size !== 'default' && (
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                  )}
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700">
                      Price: {currency}{item.price} × {item.quantity} = {currency}{itemTotal.toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      GST ({gstRate === 0.05 ? '5%' : '18%'}): {currency}{gstAmount.toFixed(2)}
                    </p>
                    <p className="font-semibold text-gray-800 mt-1">
                      Subtotal: {currency}{itemWithGST.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="text-lg font-bold text-gray-800">{item.quantity}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Price Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal (Products):</span>
            <span className="font-medium">{currency}{priceBreakdown.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total GST:</span>
            <span className="font-medium">{currency}{priceBreakdown.totalGST}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping Fee:</span>
            <span className="font-medium">{currency}{priceBreakdown.shippingFee}</span>
          </div>
          <div className="border-t border-gray-300 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-gray-800">Total Amount:</span>
              <span className="text-lg font-bold text-gray-800">
                {currency}{priceBreakdown.total}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>* GST: 5% for Apparels, 18% for other categories</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
