import React from 'react'
import {assets} from '../assets/assets'

const Navbar = ({setToken}) => {
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <div className='glass-surface flex items-center justify-between px-6 py-4 mx-6 mt-4'>
        <div className='flex items-center gap-3'>
          <img className='w-[max(10%,70px)]' src={assets.logo} alt="Gift4Corp" />
          <div className='hidden sm:block'>
            <p className='text-sm text-muted'>Admin Console</p>
            <p className='text-lg font-semibold'>Gift4Corp</p>
          </div>
        </div>
        <button onClick={handleLogout} className='btn btn-secondary text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar
