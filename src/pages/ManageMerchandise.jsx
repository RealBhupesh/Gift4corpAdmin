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
    <div className='space-y-6'>
      <div>
        <h1 className='page-title'>Manage College Merchandise</h1>
        <p className='text-sm text-muted'>Update the list used for college merchandise selection.</p>
      </div>

      {/* Add New Merchandise Form */}
      <form onSubmit={handleAddMerchandise} className='glass-card p-6'>
        <h2 className='section-title mb-4'>Add New Merchandise</h2>
        <div className='flex gap-4'>
          <input
            type='text'
            value={newMerchandise}
            onChange={(e) => setNewMerchandise(e.target.value)}
            placeholder='Enter college merchandise name'
            className='glass-input flex-1'
          />
          <button
            type='submit'
            className='btn btn-primary'
          >
            Add Merchandise
          </button>
        </div>
      </form>

      {/* Merchandise List */}
      <div className='glass-card p-6'>
        <h2 className='section-title mb-4'>Current Merchandise List</h2>
        
        {merchandiseList.length === 0 ? (
          <p className='text-muted'>No merchandise added yet.</p>
        ) : (
          <div className='grid gap-3'>
            {merchandiseList.map((item) => (
              <div
                key={item._id}
                className='glass-card flex items-center justify-between p-4'
              >
                <div>
                  <p className='font-medium text-lg'>{item.name}</p>
                  <p className='text-sm text-muted'>
                    Added on: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMerchandise(item._id)}
                  className='btn btn-danger'
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
