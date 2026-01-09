import React, { useState } from 'react';
import ManageCategories from './ManageCategories';
import ManageMerchandise from './ManageMerchandise';

const Settings = ({ token }) => {
  const [tab, setTab] = useState('categories');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-muted">Manage categories and college merchandise lists.</p>
      </div>
      <div className="glass-surface inline-flex gap-3 p-2 rounded-full">
        <button
          className={`btn ${tab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('categories')}
        >
          Manage Categories
        </button>
        <button
          className={`btn ${tab === 'merchandise' ? 'btn-primary' : 'btn-secondary'}`}
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
