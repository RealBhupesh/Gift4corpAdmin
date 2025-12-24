import React, { useState } from 'react';
import ManageCategories from './ManageCategories';
import ManageMerchandise from './ManageMerchandise';

const Settings = ({ token }) => {
  const [tab, setTab] = useState('categories');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition border ${tab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
          onClick={() => setTab('categories')}
        >
          Manage Categories
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition border ${tab === 'merchandise' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
          onClick={() => setTab('merchandise')}
        >
          Manage Merchandise
        </button>
      </div>
      <div>
        {tab === 'categories' && <ManageCategories token={token} />}
        {tab === 'merchandise' && <ManageMerchandise token={token} />}
      </div>
    </div>
  );
};

export default Settings;
