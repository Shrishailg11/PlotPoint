import React, { useState, useRef, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailure, signOut,
  deleteUserStart, deleteUserSuccess, deleteUserFailure
 } from '../redux/user/userSlice.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    password: '',
  });

  const [uploading, setUploading] = useState(false);

  // Initialize formData when currentUser loads
  // Initialize formData when currentUser loads
  useEffect(() => {
  if (currentUser) {
    setFormData({
      username: currentUser.username || '',
      email: currentUser.email || '',
      avatar: currentUser.avatar || '',
      password: '', // Always start with empty password
    });
  }
}, [currentUser]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, avatar: result.url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
  
    try {
      const updates = {};
  
      // Check each field individually - allow empty strings for optional fields
      if (formData.username !== undefined && formData.username !== currentUser.username) {
        updates.username = formData.username;
      }
      if (formData.email !== undefined && formData.email !== currentUser.email) {
        updates.email = formData.email;
      }
      if (formData.password && formData.password.trim() !== '') {
        updates.password = formData.password;
      }
      if (formData.avatar !== undefined && formData.avatar !== currentUser.avatar) {
        updates.avatar = formData.avatar;
      }
  
      console.log('Updates object:', updates); // Debug log
  
      // Check if there are any changes to submit
      if (Object.keys(updates).length === 0) {
        dispatch(updateUserFailure('No changes detected'));
        return;
      }
  
      if (!currentUser || !currentUser._id) {
        dispatch(updateUserFailure('User ID missing'));
        return;
      }
  
      console.log('Making request to:', `http://localhost:3000/api/user/update/${currentUser._id}`); // Debug log
  
      const res = await fetch(`http://localhost:3000/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
  
      console.log('Response status:', res.status); // Debug log
  
      const data = await res.json();
      console.log('Response data:', data); // Debug log
  
      // Check if the response was successful first
      if (!res.ok) {
        const errorMessage = data.message || `Server error: ${res.status}`;
        console.error('Update failed:', errorMessage);
        
        if(res.status === 401 || errorMessage.includes("Unauthorized")){
          dispatch(signOut());
          alert("Your session has expired, please sign in again");
          navigate('/signin');
          return;
        }

        dispatch(updateUserFailure(errorMessage));
        return;
      }

      



  
      // Now check for valid user data
      if (!data._id) {
        console.error('Invalid response data:', data);
        dispatch(updateUserFailure('Invalid response from server'));
        return;
      }
  
      console.log('Update successful:', data); // Debug log
      dispatch(updateUserSuccess(data));
  
      // Update form data with the new values, but keep password empty
      setFormData({
        username: data.username || '',
        email: data.email || '',
        avatar: data.avatar || '',
        password: '', // Always keep password field empty after update
      });
  
      // Show success message
      alert('Profile updated successfully!');
  
    } catch (err) {
      console.error('Network error:', err); // Debug log
      const errorMessage = err.message || 'Network error - please check if server is running';
      dispatch(updateUserFailure(errorMessage));
    }
  };

  const handleDeleteUser = async () => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    );

    if (!confirmDelete) {
      return; // User cancelled the deletion
    }

    // Show second confirmation for extra safety
    const finalConfirm = window.confirm(
      'This is your final warning. Your account and all associated data will be permanently deleted. Are you absolutely sure?'
    );

    if (!finalConfirm) {
      return; // User cancelled the deletion
    }

    dispatch(deleteUserStart());

    try {
      const res = await fetch(`http://localhost:3000/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message || `Server error: ${res.status}`;
        console.error('Delete failed:', errorMessage);
        dispatch(deleteUserFailure(errorMessage));
        alert(`Failed to delete account: ${errorMessage}`);
        return;
      }

      console.log('Account deleted successfully');
      dispatch(deleteUserSuccess());
      alert('Your account has been successfully deleted.');
      
      // Redirect to home page or sign-in page
      navigate('/');

    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err.message || 'Network error occurred';
      dispatch(deleteUserFailure(errorMessage));
      alert(`Failed to delete account: ${errorMessage}`);
    }
  };

  const handleSignOut = async () => {
    try {
      // Call backend to clear the cookie
      const res = await fetch('/api/auth/signout', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Sign out failed on server');
      }

      // Clear Redux state regardless of server response
      dispatch(signOut());
      navigate('/');
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear Redux state even if server call fails
      dispatch(signOut());
      navigate('/');
    }
  };


  return (
    <div className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl font-semibold text-center my-3">Profile</h1>
  
      {/* Display error messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
  
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleFileUpload} />
        <img
          src={formData.avatar || currentUser?.avatar}
          alt="profile"
          className="rounded-full w-24 h-24 self-center object-cover mt-2 cursor-pointer"
          onClick={() => fileRef.current.click()}
        />
        {uploading && <p className="text-center text-blue-600">Uploading...</p>}
  
        <input
          type="text"
          id="username"
          placeholder="Username"
          className={`border p-3 rounded-lg ${
            formData.username !== (currentUser?.username || '') ? 'border-blue-500' : ''
          }`}
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          className={`border p-3 rounded-lg ${
            formData.email !== (currentUser?.email || '') ? 'border-blue-500' : ''
          }`}
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="New Password (leave empty to keep current)"
          className="border p-3 rounded-lg"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-slate-700 rounded-lg text-white p-3 uppercase hover:opacity-90 disabled:opacity-70 cursor-pointer"
          disabled={loading || uploading}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
  
      <div className="flex justify-between mt-3 cursor-pointer">
        <span onClick={handleDeleteUser} 
        className="text-red-600">Delete account</span>
        <span onClick={handleSignOut} 
        className="text-red-600">Sign out</span>
      </div>
    </div>
  );
}

export default Profile;
