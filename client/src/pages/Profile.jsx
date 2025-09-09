import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../redux/user/userSlice';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

function Profile() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    username: currentUser.username || '',
    email: currentUser.email || '',
    avatar: currentUser.avatar || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, avatar: result.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      dispatch(updateUserStart());
      
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      
      dispatch(updateUserSuccess(data));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <>
      <div className='max-w-lg mx-auto p-3'>
        <h1 className='text-3xl font-semibold text-center my-3'>Profile</h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input 
            type='file' 
            ref={fileRef} 
            accept='image/*' 
            hidden 
            onChange={handleFileUpload}
          />
          
          <img 
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar} 
            alt='profile'
            className='rounded-full w-25 h-25 self-center object-cover mt-2 cursor-pointer'
          />
          
          {uploading && <p className='text-center text-blue-600'>Uploading...</p>}
          
          <input 
            type='text' 
            placeholder='username' 
            id='username' 
            className='border p-3 rounded-lg'
            value={formData.username}
            onChange={handleChange}
          />
          
          <input 
            type='email' 
            placeholder='email' 
            id='email' 
            className='border p-3 rounded-lg'
            value={formData.email}
            onChange={handleChange}
          />
          
          <input 
            type='password' 
            placeholder='password' 
            id='password' 
            className='border p-3 rounded-lg'
            onChange={handleChange}
          />
          
          <button 
            type='submit'
            className='bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-90 disabled:opacity-70 cursor-pointer'
            disabled={loading || uploading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </form>
        
        <div className='flex justify-between mt-3 cursor-pointer'>
          <span className='text-red-600'>Delete account</span>
          <span className='text-red-600'>Sign out</span>
        </div>
      </div>
    </>
  );
}

export default Profile;
