import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <aside className='glass-surface w-[20%] min-h-[calc(100vh-8rem)] rounded-[28px] px-4 py-6'>
        <div className='flex flex-col gap-2 text-[15px]'>
            <NavLink to='/' className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} >
                 <p className='text-xl'>📊</p>
                 <p className='hidden md:block'>Home</p>
            </NavLink>
            <NavLink to='/add' className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} >
                 <img className='w-5 h-5' src={assets.add_icon} alt="" />
                 <p className='hidden md:block'>Add Items</p>
            </NavLink>
            <NavLink to='/list' className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} >
                 <img className='w-5 h-5' src={assets.order_icon} alt="" />
                 <p className='hidden md:block'>List Items</p>
            </NavLink>
           
            <NavLink to='/orders' className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} >
                 <img className='w-5 h-5' src={assets.order_icon} alt="" />
                 <p className='hidden md:block'>Orders</p>
            </NavLink>
            <NavLink to='/settings' className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} >
                 <span className='text-xl'>⚙️</span>
                 <p className='hidden md:block'>Settings</p>
            </NavLink>
        </div>
    </aside>
  )
}

export default Sidebar
