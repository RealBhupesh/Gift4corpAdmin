import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendURL, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Orders = ({ token }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

     if(!token) return null;

    try {
    const response=await axios.post(backendURL+'/api/order/list',{},{headers:{token}})
    console.log("Orders response ",response.data)
    
    if(response.data.success){
      setOrders(response.data.orders.reverse()) 
    }else {
      toast.error('Failed to fetch orders')
    }
   


    }
    catch (error) {
    
      toast.error(error.message )
    }

  }

  const statusHandler =async(e,orderId)=>{
    try{
      const response=await axios.put(backendURL+'/api/order/status',{orderId,status:e.target.value},{headers:{token}})
        if(response.data.success){
          toast.success("Status updated")
          await fetchAllOrders()
        }
        else{
          
          toast.error("Failed to update status")

        }
    }catch(err){
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])
  return (
    <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='page-title'>Orders</h3>
            <p className='text-sm text-muted'>Track order status and fulfillment updates.</p>
          </div>
        </div>
        <div className='space-y-4'>
          {
            orders.map((order,index)=>(
              <div 
                className='glass-card grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start p-5 md:p-8 text-xs sm:text-sm text-[var(--text)] cursor-pointer transition-colors relative' 
                key={index}
                onClick={() => navigate(`/orders/${order._id}`)}
              >
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
              <div>
                {
                order.items.map((item,index)=>{
                  if(index === order.items.length -1){
                     return <p className="py-0.5" key={index}> {item.name} x {item.quantity} <span>{item.size}</span></p>
                  }else{
                       return <p className="py-0.5" key={index}> {item.name} x {item.quantity} <span>{item.size}</span>,</p>
                  } 
                })
                }
              </div>
              <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " +order.address.lastName}</p>
              <div>
                <p className='text-muted'>{order.address.street+ " , " }</p>
                <p className='text-muted'>{order.address.city+ " , " +order.address.state + " , " + order.address.country + " , " +  order.address.zipcode }</p>
              </div>
              <p className='text-muted'>{order.address.phone}</p>
              </div>

              <div>
                <p className='text-sm sm:text-[15px] '>Items: {order.items.length}</p>
                <p className='mt-3 text-muted'>Method: {order.paymentMethod}</p>
                <p className='text-muted'>Payment : {order.payment ? "Done" : "Pending" }</p>
                <p className='text-muted'>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px] font-semibold'>{currency }{order.amount}</p>
              <select
              onChange={(e)=>statusHandler(e,order._id)}
              onClick={(e)=>e.stopPropagation()}
              value={order.status} className='glass-input text-sm'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              </div>
            ))
          }
        </div>
    </div>
  )
}

export default Orders
