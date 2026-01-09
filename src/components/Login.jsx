import React, { useState } from 'react'
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';
const Login = ({setToken}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

const onSubmitHandler =async (e)=>{
    try{
     e.preventDefault();
     const res=await axios.post(backendURL+'/api/user/admin', { email, password })

     if(res.data.success){
        setToken(res.data.token)
     }else{
        toast.error(res.data.message)
     }
    }catch(err){
        console.log(err);
        toast.error('Something went wrong. Please try again later.')
    }
}



  return (
    <div className='auth-shell'>
        <div className='auth-card'>
            <div className='mb-6'>
              <p className='text-sm text-muted'>Welcome back</p>
              <h1 className='text-3xl font-semibold'>Admin Portal</h1>
              <p className='text-sm text-muted mt-2'>Sign in to manage orders, inventory, and settings.</p>
            </div>
            <form onSubmit={onSubmitHandler} className='space-y-4'>
                <div>
                    <p className='text-sm font-medium text-muted mb-2'>Email Address</p>
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} className='glass-input'  type="email" placeholder='you@company.com' required />
                </div>
                <div>
                    <p className='text-sm font-medium text-muted mb-2'>Password</p>
                    <input onChange={(e)=>setPassword(e.target.value)} value={password} className='glass-input'  type="password" placeholder='Enter your password' required />
                </div>

                <button className="btn btn-primary w-full" type='submit'>Login</button >
            </form>
        </div>
    </div>
  )
}

export default Login
