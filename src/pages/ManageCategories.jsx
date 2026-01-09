import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendURL } from '../App';

const ManageCategories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/add`,
        { name: newCategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Category added successfully');
        setNewCategory('');
        setShowAddCategory(false);
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/delete`,
        { id: categoryId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Category deleted successfully');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  // Add subcategory
  const handleAddSubcategory = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!newSubcategory.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/add-subcategory`,
        { id: selectedCategoryId, subcategory: newSubcategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Subcategory added successfully');
        setNewSubcategory('');
        setShowAddSubcategory(false);
        setSelectedCategoryId('');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error(error.response?.data?.message || 'Failed to add subcategory');
    }
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (categoryId, subcategory) => {
    if (!confirm(`Are you sure you want to delete "${subcategory}" from this category?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/remove-subcategory`,
        { id: categoryId, subcategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Subcategory deleted successfully');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Manage Categories & Subcategories</h1>
        <p className="text-sm text-muted">Organize products with clear category groupings.</p>
      </div>

      {/* Add Category Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Categories</h2>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="btn btn-primary"
          >
            {showAddCategory ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="mb-4 p-4 glass-card">
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="glass-input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-muted text-center py-4">No categories found. Add one to get started!</p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="glass-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="btn btn-danger text-sm"
                  >
                    Delete Category
                  </button>
                </div>

                {/* Subcategories */}
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted mb-2">Subcategories:</p>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, index) => (
                        <div
                          key={index}
                          className="glass-pill flex items-center gap-2"
                        >
                          <span className="text-sm">{sub}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(category._id, sub)}
                            className="text-[var(--danger)] hover:text-[color-mix(in_srgb,var(--danger)_80%,black)] text-lg leading-none"
                            title="Delete subcategory"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted italic">No subcategories</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Subcategory Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Add Subcategory</h2>
          <button
            onClick={() => setShowAddSubcategory(!showAddSubcategory)}
            className="btn btn-secondary"
          >
            {showAddSubcategory ? 'Cancel' : '+ Add Subcategory'}
          </button>
        </div>

        {/* Add Subcategory Form */}
        {showAddSubcategory && (
          <div className="p-4 glass-card">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Select Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="glass-input"
                >
                  <option value="">-- Choose a category --</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="Enter subcategory name"
                  className="glass-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
                />
              </div>

              <button
                onClick={handleAddSubcategory}
                className="btn btn-primary w-full"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
