import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';

const ManageMerchandise = ({ token }) => {
  const [merchandiseList, setMerchandiseList] = useState([]);
  const [newMerchandise, setNewMerchandise] = useState('');

  useEffect(() => {
    fetchMerchandiseList();
  }, []);

  const fetchMerchandiseList = async () => {
    try {
      const response = await axios.get(backendURL + '/api/college-merchandise/list');
      if (response.data.success) {
        setMerchandiseList(response.data.merchandises);
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch merchandise list');
    }
  };

  const handleAddMerchandise = async (e) => {
    e.preventDefault();
    if (!newMerchandise.trim()) {
      toast.error('Please enter a merchandise name');
      return;
    }

    try {
      const response = await axios.post(
        backendURL + '/api/college-merchandise/add',
        { name: newMerchandise },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNewMerchandise('');
        fetchMerchandiseList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || 'Failed to add merchandise');
    }
  };

  const handleDeleteMerchandise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchandise?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendURL + '/api/college-merchandise/delete',
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchMerchandiseList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete merchandise');
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Manage College Merchandise</h1>

      {/* Add New Merchandise Form */}
      <form onSubmit={handleAddMerchandise} className='mb-8 bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Add New Merchandise</h2>
        <div className='flex gap-4'>
          <input
            type='text'
            value={newMerchandise}
            onChange={(e) => setNewMerchandise(e.target.value)}
            placeholder='Enter college merchandise name'
            className='flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='submit'
            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
          >
            Add Merchandise
          </button>
        </div>
      </form>

      {/* Merchandise List */}
      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Current Merchandise List</h2>
        
        {merchandiseList.length === 0 ? (
          <p className='text-gray-500'>No merchandise added yet.</p>
        ) : (
          <div className='grid gap-3'>
            {merchandiseList.map((item) => (
              <div
                key={item._id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div>
                  <p className='font-medium text-lg'>{item.name}</p>
                  <p className='text-sm text-gray-500'>
                    Added on: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMerchandise(item._id)}
                  className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMerchandise;
