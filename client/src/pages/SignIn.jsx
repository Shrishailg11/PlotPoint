import React, { useState } from 'react'
import {Link , useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { signInStart,singInFailure, singInSuccess } from '../redux/user/userSlice.js';


function SignIn() {
    const [formData, setFormData] = useState({});
    const {loading, error} = useSelector((state)=> state.user)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange =(e)=>{
        setFormData({
            ...formData,
            [e.target.id] :e.target.value 
        })
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        dispatch(signInStart());
        const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        });

        const data = await res.json();
        console.log(data);
        if(data.success === false){
            dispatch(singInFailure(data.message));
            return ;
        }
        dispatch(singInSuccess(data))
        navigate('/');
        console.log("✅ Success:", data);
    } catch (err) {
        dispatch(singInFailure(err.message))
    }
    };

    console.log(formData);
    return <>
    <div className='p-3 max-w-lg mx-auto'>
        <h1 className='font-semibold text-3xl text-center my-6'>Sign Up</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input type='email' placeholder='email' id='email'
            onChange={handleChange} className='border p-3 rounded-lg'/>
            <input type='password' placeholder='password' id='password'
            onChange={handleChange} className='border p-3 rounded-lg'/>
            <button disabled={loading}type='submit' className='bg-slate-700 text-white p-3 rounded-lg 
            uppercase hover:opacity-88 disabled:opacity-75'>{loading ? "Loading..." :"Sign In"}</button>
        </form>
        <div className='flex gap-3 mt-2 '>
            <p>Dont have an account? </p>
            <Link to={'/sign-up'} className='text-blue-700 hover:underline'>SignUp</Link>
        </div>
        {error && <p className='text-red-500'>{error}</p>}
    </div>
    </>
}

export default SignIn
