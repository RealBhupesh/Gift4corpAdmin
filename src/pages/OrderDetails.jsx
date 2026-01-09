import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendURL, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  const downloadInvoice = () => {
    if (!order) return

    const doc = new jsPDF()
    const priceBreakdown = calculatePriceBreakdown()

    // Company Header
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('GIFT4CORP', 105, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Your Trusted Corporate Gifting Partner', 105, 28, { align: 'center' })
    doc.text('Email: sales@gifts4corp.com | Phone: +91-9620044002', 105, 34, { align: 'center' })

    // Invoice Title
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TAX INVOICE', 105, 52, { align: 'center' })

    // Invoice Details Box
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(15, 60, 180, 30)
    
    // Left side - Invoice Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice No:', 20, 68)
    doc.setFont('helvetica', 'normal')
    doc.text(order._id.slice(-8).toUpperCase(), 45, 68)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice Date:', 20, 75)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(order.date).toLocaleDateString('en-IN'), 45, 75)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Payment:', 20, 82)
    doc.setFont('helvetica', 'normal')
    doc.text(order.paymentMethod, 45, 82)

    // Right side - Order Status
    doc.setFont('helvetica', 'bold')
    doc.text('Order Status:', 120, 68)
    doc.setFont('helvetica', 'normal')
    doc.text(order.status, 150, 68)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Status:', 120, 75)
    doc.setFont('helvetica', 'normal')
    if (order.payment) {
      doc.setTextColor(0, 128, 0)
    } else {
      doc.setTextColor(255, 140, 0)
    }
    doc.text(order.payment ? 'Paid' : 'Pending', 150, 75)
    doc.setTextColor(0, 0, 0)

    // Bill To Section
    doc.setFillColor(240, 240, 240)
    doc.rect(15, 95, 180, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('BILL TO:', 20, 100)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`${order.address.firstName} ${order.address.lastName}`, 20, 108)
    doc.setFont('helvetica', 'normal')
    doc.text(order.address.street, 20, 114)
    doc.text(`${order.address.city}, ${order.address.state}`, 20, 120)
    doc.text(`${order.address.country} - ${order.address.zipcode}`, 20, 126)
    doc.text(`Phone: ${order.address.phone}`, 20, 132)
    if (order.address.email) {
      doc.text(`Email: ${order.address.email}`, 20, 138)
    }

    // Items Table
    const tableStartY = order.address.email ? 145 : 139
    const tableData = []
    
    order.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity
      const gstRate = item.category === 'Apparels' ? 0.05 : 0.18
      const gstAmount = itemTotal * gstRate
      const itemWithGST = itemTotal + gstAmount
      
      tableData.push([
        index + 1,
        item.name,
        item.category,
        item.size && item.size !== 'default' ? item.size : '-',
        'Rs.' + item.price.toFixed(2),
        item.quantity,
        'Rs.' + itemTotal.toFixed(2),
        `${(gstRate * 100).toFixed(0)}%`,
        'Rs.' + gstAmount.toFixed(2),
        'Rs.' + itemWithGST.toFixed(2)
      ])
    })

    autoTable(doc, {
      startY: tableStartY,
      head: [['#', 'Product Name', 'Category', 'Size', 'Price', 'Qty', 'Amount', 'GST', 'GST Amt', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 40 },
        2: { cellWidth: 22 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'right', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 10 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 12 },
        8: { halign: 'right', cellWidth: 18 },
        9: { halign: 'right', cellWidth: 22 }
      },
      margin: { left: 15, right: 15 }
    })

    // Price Summary
    const finalY = doc.lastAutoTable.finalY + 10
    const summaryX = 120
    
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(summaryX - 5, finalY - 5, 75, 35)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', summaryX, finalY)
    doc.text('Rs.' + priceBreakdown.subtotal, 188, finalY, { align: 'right' })
    
    doc.text('Total GST:', summaryX, finalY + 6)
    doc.text('Rs.' + priceBreakdown.totalGST, 188, finalY + 6, { align: 'right' })
    
    doc.text('Shipping:', summaryX, finalY + 12)
    doc.text('Rs.' + priceBreakdown.shippingFee, 188, finalY + 12, { align: 'right' })
    
    // Total with background
    doc.setFillColor(41, 128, 185)
    doc.rect(summaryX - 5, finalY + 16, 75, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', summaryX, finalY + 22)
    doc.text('Rs.' + priceBreakdown.total, 188, finalY + 22, { align: 'right' })
    
    // Footer
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    const footerY = finalY + 35
    doc.text('* GST: 5% for Apparels, 18% for other categories', 15, footerY)
    doc.text('Thank you for your business!', 105, footerY + 5, { align: 'center' })
    
    // Authorized Signature
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('For GIFTS4CORP', 150, footerY + 15)
    
    // Signature image placeholder (you can add actual signature image here)
    const signatureBase64 = 'data:image/png;base64,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vbF69erXy8rK3iwuLl5RWlq6ory8/K1t27at2LVr14rt27evOHjw4Io9e/as2Lt375v79u178/Dhw28eO3bszWPHjr15+PDhN0Hcl6qqqpbU1NT8/vDhw3937Nixv0DH/kG70VPT745oLdaeV155Zc/+/fu/3rlz5/effvrpl5s3b/5qxYoVX3388cdf/vnPf/5izZo1f6mvr/+qrq7uq0uXLn3Z1tb25dOnT79MT09fGE2PuHv37pdaW1vfpuVxOp2vDQ8PL3E6ncucTudS7M/S7u7uZV1dXcs6OjqW3bhxY1lTU9OyixcvLqutrV1WU1OzrKamZtnJkyeXHTlyZNmpU6eWnT9/ftmFCxeWNzY2Lr9+/fryi5cvL7dYLMu7urqW37x5czm0vfvChQsr9u7du+Knn37667Vr1/5+/fr1/wFlnHp+UwhiIdaBAwc+/vrrrzd//fXXmzdt2vT5li1b/nbw4MHP9+zZ89c9e/Z8sX379i927tz52e7duz/btWvXZ5988skXBw4c+ALkytK+Nzw8/MWaNWu+KCsr+wJE+uLjjz/+4ssvv/ykoqLi87S0tE/z8/P/WlxcvGndunXrNmzYsO6bb75Zt3///nWvvvrqunXr1q3bvHnzunfeeWfd3//+93Xbt29f9+2331bs2rVr9Y4dO1ZXV1ev/t3vfvfH9evX//Hbb79dD/qtrq+vX/X555+vOn369KqLFy+u+u9//7u6tbV11d27d1fdvXt39YEDB1Z/++23/9jX1/ePhoaGzdevX//bs2fP/j40NPT/QSgTPTGJVV1d/beqqqovKioqPgc51gNRVm7evHn91q1b1//1r39dv3v37vUff/zx+h07dqzfvn37BrS0A9BUKwBRQK8VIFy50pf/C8gJeq0AoVa8+eabK6qqqlaUl5evqKysXAG6rXjvvfdWfPLJJyv++Mc/rvjggw9WfPnllyuOHz++4uzZsytBvBU3btxYAbqt6O7uXtHR0bHi1q1bK65du7bi8uXLK+rr61ecP39+RU1NzQoQdsWZM2dWnD17dsXFixdXgLgrrl+/vhL02YiZgZOm2SQa90+PHDlS/P7771cUFRVVLF26tGLlypXlpaWl5cuWLStfvXp1+fr168vXrVu3bvPmzeUg1vqNGzeW7969u3zXrl3lu3btKt+zZ0851lFeTLjH/tT7V/Xs/VH8rVy3bt26jRs3ru/o6Fh/+fLl9Tdu3Fj/448/ru/p6Vl//PjxDdXV1Rs+/PDDDbm5uRv+8Ic/bPjqq682HDx4cMP+/fs37Nmzp+LgwYMbkG/D4cOHN+zatWsDAGrFihUbwfcfzp07937Uc9o0q0Rlsdrb2z9saGj4S0lJyV+WLl36l5UrV5aVlZWVFRQUrMnNzV2TlZW1ZsWKFWuWL19eBv1VBr1VBkKt2bx58xqQas3WrVvXfPvtt2v+8Y9/rHn33XfXvPPOO2tKS0vfqKysfAOE+r/8FfnTqtTr+TGsKyoq1oJoa7dt27YBfT1/9OjRddevX1938eLFdTU1NRsOHz684c/Dhzf+fMDLzJ06de3atX+FLv47psx96FPTjMQiKlXz8cUXX3xSVFT0WlZW1qvQTa8UFBSsnjdv3qrk5OTy+fPnl8+ZM6ccx1aiBcvz8vJK8vLySqDPSrKzs8vy8/MroN9KQKp1mzdvXrdly5Z1INg67M/a6upqkKt87dq1a6E7y7dt21Ze1de3prq6eg30Xvm+ffvWVlVVlfX09JU1NTWVHThwoOzAgQNlp06dKjt37lx5TU1NOU61lNfW1pafPXu2/Ny5c+Xnz5//1+HDh8uLi4vL8/Pzy0E8yx9++OHzv/71r583NTX9pa+v7//6+/v/r7Ozc21XV1f5d99994fBwcGvb9269Ulra+vn9+7d+3xkZMRpmj4xE8tUZksuS0hISEtNTU0rKChIy8rKSsvMzExLT09PKywsTIdfaSUlJWn4llpcXJw2d+7ctIKCgrS5c+em5eTkpAMm/QGlRU+DLt1eXFzstVgsrnv37rlBKPetW7e8Fy5c8J49e9Z7+vRpr81m87a0tHgbGxu9Fy5c8J48edJ7/Phxb01Njff48ePec+fOeevr673Xrl3z3rlzx9vR0eFtbW311tfXex89euTt7+/3Pn782Ds4OOi12+1eh8PhHR4e9vb19Xn7+vq8IyMj3r6+Pm9/f7/X4XB4h4aGvHa73Ts8POzt7e31dnV1ee/du+e9c+eO98aNG95r1655L1++7L127Zr31q1b3ps3b3pbW1u9PB86dMi1f//+B319fe8+fvz4OwnfDOhf/wBNLT5qVAsAAAAASUVORK5CYII='
    
    try {
      // Add signature image if available
      doc.addImage(signatureBase64, 'PNG', 145, footerY + 18, 30, 10)
    } catch (e) {
      // If image fails, just add placeholder text
      doc.setFont('helvetica', 'italic')
      doc.text('(Authorized Signature)', 150, footerY + 25)
    }
    
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text('This is a computer generated invoice and does not require a signature', 105, 292, { align: 'center' })

    // Save PDF
    doc.save(`Invoice_${order._id.slice(-8).toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Invoice downloaded successfully!')
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [token, orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card px-6 py-5">
          <p className="text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card px-6 py-5">
          <p className="text-lg">Order not found</p>
        </div>
      </div>
    )
  }

  const priceBreakdown = calculatePriceBreakdown()

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-ghost flex items-center gap-2 text-sm"
        >
          <span>←</span> Back to Orders
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadInvoice}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice
          </button>
          <h2 className="text-2xl font-bold">Order Details</h2>
        </div>
      </div>

      {/* Order Info Card */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="section-title mb-3">Order Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Order ID:</span> {order._id}</p>
              <p><span className="font-medium">Date:</span> {new Date(order.date).toLocaleString()}</p>
              <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
              <p>
                <span className="font-medium">Payment Status:</span>{' '}
                <span className={order.payment ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>
                  {order.payment ? 'Paid' : 'Pending'}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="font-medium">Order Status:</span>
                <select
                  onChange={statusHandler}
                  value={order.status}
                  className="glass-input text-sm font-semibold"
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
            <h3 className="section-title mb-3">Shipping Address</h3>
            <div className="space-y-1 text-sm text-muted">
              <p className="font-medium text-base text-[var(--text)]">
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
                <span className="font-medium text-[var(--text)]">Phone:</span> {order.address.phone}
              </p>
              {order.address.email && (
                <p>
                  <span className="font-medium text-[var(--text)]">Email:</span> {order.address.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="glass-card p-6">
        <h3 className="section-title mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => {
            const itemTotal = item.price * item.quantity
            const gstRate = item.category === 'Apparels' ? 0.05 : 0.18
            const gstAmount = itemTotal * gstRate
            const itemWithGST = itemTotal + gstAmount

            return (
              <div
                key={index}
                className="glass-card flex items-start gap-4 p-4"
              >
                <img
                  src={item.image?.[0] || assets.parcel_icon}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded border border-[var(--glass-stroke)]"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted mt-1">
                    Category: {item.category} {item.subCategory && `| ${item.subCategory}`}
                  </p>
                  {item.size && item.size !== 'default' && (
                    <p className="text-sm text-muted">Size: {item.size}</p>
                  )}
                  <div className="mt-2 text-sm">
                    <p className="text-[var(--text)]">
                      Price: {currency}{item.price} × {item.quantity} = {currency}{itemTotal.toFixed(2)}
                    </p>
                    <p className="text-muted">
                      GST ({gstRate === 0.05 ? '5%' : '18%'}): {currency}{gstAmount.toFixed(2)}
                    </p>
                    <p className="font-semibold mt-1">
                      Subtotal: {currency}{itemWithGST.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Quantity</p>
                  <p className="text-lg font-bold">{item.quantity}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="glass-card p-6">
        <h3 className="section-title mb-4">Price Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal (Products):</span>
            <span className="font-medium">{currency}{priceBreakdown.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total GST:</span>
            <span className="font-medium">{currency}{priceBreakdown.totalGST}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Shipping Fee:</span>
            <span className="font-medium">{currency}{priceBreakdown.shippingFee}</span>
          </div>
          <div className="border-t border-[var(--glass-stroke)] pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-lg font-bold">
                {currency}{priceBreakdown.total}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted mt-2">
            <p>* GST: 5% for Apparels, 18% for other categories</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
