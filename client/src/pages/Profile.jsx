import React from 'react'
import { useSelector } from 'react-redux'

function Profile() {
    const {currentUser} = useSelector((state)=>state.user);
    return <>
    <div className='max-w-lg mx-auto p-3'>
    <h1 className='text-3xl font-semibold text-center my-3'>Profile</h1>
    
    <form className='flex flex-col gap-4'>
        <img src={currentUser.avatar} alt='profile'
        className='rounded-full w-25 h-25  self-center object-cover mt-2 cursor-pointer'></img>
       <input type='text' placeholder='username' id='username' className='border p-3 rounded-lg' />
       <input type='email' placeholder='email' id='email' className='border p-3 rounded-lg' />
       <input type='text' placeholder='password' id='password' className='border p-3 rounded-lg' />
       <button className='bg-slate-700 rounded-lg text-white p-3 
       uppercase hover:opacity-90 disabled:opacity-70 cursor-pointer'>Update</button>
    </form>
    <div className='flex justify-between mt-3 cursor-pointer'>
        <span className='text-red-600'>Delete account</span>
        <span className='text-red-600'>Sign out</span>
    </div>
    </div>
    </>
}

export default Profile
