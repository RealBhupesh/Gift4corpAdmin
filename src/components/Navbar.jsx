import React from 'react'
import {assets} from '../assets/assets'

const Navbar = ({setToken}) => {
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <div className='flex items-center justify-between'>
        <img  className='w-[max(10%,70px)]' src={assets.logo} alt="" />
        <button onClick={handleLogout} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm  cursor-pointer'>Logout</button>

    </div>
  )
}

export default Navbar