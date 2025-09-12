import { useState } from "react";
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export default function CreateListing() {
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [imageUploadError, setImageUploadError] = useState(false)
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    })

    const handleChange = (e) => {
        if (e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id
            })
        }

        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }

        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value
            })
        }
    }

    const handleImageSubmit = async (e) => {
        e.preventDefault();

        if (files.length === 0) {
            setImageUploadError('Please select at least one image');
            return;
        }

        if (files.length > 6) {
            setImageUploadError('Maximum 6 images allowed');
            return;
        }

        // Check if adding these images would exceed the limit
        if (formData.imageUrls.length + files.length > 6) {
            setImageUploadError('Total images cannot exceed 6');
            return;
        }

        // Validate file types and sizes
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith('image/')) {
                setImageUploadError('Only image files are allowed');
                return;
            }
            if (files[i].size > 5 * 1024 * 1024) { // 5MB limit
                setImageUploadError('Each image must be less than 5MB');
                return;
            }
        }

        setUploading(true);
        setImageUploadError(false);

        try {
            const promises = [];

            // Create upload promises for each file
            for (let i = 0; i < files.length; i++) {
                promises.push(uploadToCloudinary(files[i]));
            }

            // Wait for all uploads to complete
            const results = await Promise.all(promises);

            // Extract URLs from results
            const urls = results.map(result => result.url);

            // Update form data with new image URLs
            setFormData(prevData => ({
                ...prevData,
                imageUrls: [...prevData.imageUrls, ...urls]
            }));

            // Clear the file input
            setFiles([]);

            console.log('Images uploaded successfully:', urls);

        } catch (error) {
            console.error('Upload failed:', error);
            setImageUploadError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prevData => ({
            ...prevData,
            imageUrls: prevData.imageUrls.filter((_, index) => index !== indexToRemove)
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.imageUrls.length === 0) {
            setError('Please upload at least one image');
            return;
        }
        
        if (formData.imageUrls.length > 6) {
            setError('Maximum 6 images allowed');
            return;
        }

        if (formData.regularPrice < formData.discountPrice) {
            setError('Discounted price cannot be higher than regular price');
            return;
        }

        setLoading(true);
        setError(false);

        try {
            const res = await fetch('/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: 'currentUser._id', // This should come from Redux state
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to create listing');
                return;
            }

            console.log('Listing created successfully:', data);
            // Redirect to listing page or show success message
            alert('Listing created successfully!');
            
        } catch (error) {
            console.error('Create listing failed:', error);
            setError('Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='p-3 max-w-4xl mx-auto'>
          <h1 className='text-3xl font-semibold text-center my-7'>
            Create a Listing
          </h1>
          <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
              <input
                type='text'
                placeholder='Name'
                className='border p-3 rounded-lg'
                id='name'
                maxLength='62'
                minLength='10'
                required
                onChange={handleChange}
                value={formData.name}
              />
              <textarea
                type='text'
                placeholder='Description'
                className='border p-3 rounded-lg'
                id='description'
                required
                onChange={handleChange}
                value={formData.description}
              />
              <input
                type='text'
                placeholder='Address'
                className='border p-3 rounded-lg'
                id='address'
                required
                onChange={handleChange}
                value={formData.address}
              />
              <div className='flex gap-6 flex-wrap'>
                <div className='flex gap-2'>
                  <input
                    type='checkbox'
                    id='sale'
                    className='w-5'
                    onChange={handleChange}
                    checked={formData.type === 'sale'}
                  />
                  <span>Sell</span>
                </div>
                <div className='flex gap-2'>
                  <input
                    type='checkbox'
                    id='rent'
                    className='w-5'
                    onChange={handleChange}
                    checked={formData.type === 'rent'}
                  />
                  <span>Rent</span>
                </div>
                <div className='flex gap-2'>
                  <input
                    type='checkbox'
                    id='parking'
                    className='w-5'
                    onChange={handleChange}
                    checked={formData.parking}
                  />
                  <span>Parking spot</span>
                </div>
                <div className='flex gap-2'>
                  <input
                    type='checkbox'
                    id='furnished'
                    className='w-5'
                    onChange={handleChange}
                    checked={formData.furnished}
                  />
                  <span>Furnished</span>
                </div>
                <div className='flex gap-2'>
                  <input
                    type='checkbox'
                    id='offer'
                    className='w-5'
                    onChange={handleChange}
                    checked={formData.offer}
                  />
                  <span>Offer</span>
                </div>
              </div>
              <div className='flex flex-wrap gap-6'>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    id='bedrooms'
                    min='1'
                    max='10'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.bedrooms}
                  />
                  <p>Beds</p>
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    id='bathrooms'
                    min='1'
                    max='10'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.bathrooms}
                  />
                  <p>Baths</p>
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    id='regularPrice'
                    min='50'
                    max='10000000'
                    required
                    className='p-3 border border-gray-300 rounded-lg'
                    onChange={handleChange}
                    value={formData.regularPrice}
                  />
                  <div className='flex flex-col items-center'>
                    <p>Regular price</p>
                    {formData.type === 'rent' && (
                      <span className='text-xs'>($ / month)</span>
                    )}
                  </div>
                </div>
                {formData.offer && (
                  <div className='flex items-center gap-2'>
                    <input
                      type='number'
                      id='discountPrice'
                      min='0'
                      max='10000000'
                      required
                      className='p-3 border border-gray-300 rounded-lg'
                      onChange={handleChange}
                      value={formData.discountPrice}
                    />
                    <div className='flex flex-col items-center'>
                      <p>Discounted price</p>
                      {formData.type === 'rent' && (
                        <span className='text-xs'>($ / month)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className='flex flex-col flex-1 gap-4'>
              <p className='font-semibold'>
                Images:
                <span className='font-normal text-gray-600 ml-2'>
                  The first image will be the cover (max 6)
                </span>
              </p>
              <div className="flex gap-4">
                <input
                    onChange={(e) => setFiles(e.target.files)}
                    className="p-3 border border-gray-300 rounded w-full 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded file:border-0 
                            file:text-sm file:font-semibold 
                            file:bg-blue-600 file:text-white 
                            hover:file:bg-blue-300 "
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                />
                <button
                    type="button"
                    disabled={uploading || files.length === 0}
                    onClick={handleImageSubmit}
                    className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                </div>

              <p className='text-red-700 text-sm'>
                {imageUploadError && imageUploadError}
              </p>
              {formData.imageUrls.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className='relative group'>
                      <img
                        src={url}
                        alt={`Listing ${index + 1}`}
                        className='w-full h-32 object-cover rounded-lg'
                      />
                      <button
                        type='button'
                        onClick={() => handleRemoveImage(index)}
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className='absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs'>
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className='text-sm text-gray-600'>
                Images uploaded: {formData.imageUrls.length}/6
              </p>
              <button
                type='submit'
                disabled={loading || uploading}
                className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
              >
                {loading ? 'Creating...' : 'Create listing'}
              </button>
              {error && <p className='text-red-700 text-sm'>{error}</p>}
            </div>
          </form>
        </main>
      );
}