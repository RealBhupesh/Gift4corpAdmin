// Category to subcategory mapping
// Hardcoded subcategories for each category (copied from Add.jsx)
const subCategoryOptions = {
  Apparels: [
    'T-shirts (crew neck, polo, oversized, dri-fit)',
    'Hoodies & Sweatshirts',
    'Jackets & Windcheaters',
    'Caps',
    'Formal Wear (shirts)',
    'Sports Jerseys',
  ],
  Accessories: [
    'Bags & Backpacks',
    'Tote Bags / Sling Bags',
    'Caps & Bandanas',
    'Lanyards & ID Card Holders',
    'Badges & Pins',
    'Keychains'
  ],
  'Stationery & Academic Supplies': [
    'Notebooks / Journals',
    'Pens / Pencils / Highlighters',
    'Folders / Files',
    'Sticky Notes / Planners',
    'Desk Organizers',
    'Calendars',
    'Bookmarks'
  ],
  'Tech & Gadgets': [
    'Pendrives / Hard Drives (custom branded)',
    'Mousepads',
    'Phone Covers / Pop Sockets',
    'Laptop Sleeves / Skins',
    'Earphones / Bluetooth Speakers'
  ],
  'Event & Souvenir Merchandise': [
    'Custom T-shirts / Hoodies for Events',
    'Medals / Trophies / Plaques',
    'Certificates / Frames',
    'Photo Frames / Collages',
    'Commemorative Coins or Pins',
    'Batch / Alumni Gift Sets'
  ],
  'Eco-Friendly & Sustainable Merchandise': [
    'Jute / Canvas Bags',
    'Bamboo / Wooden Stationery',
    'Plantable Notebooks / Seed Pens',
    'Recycled Paper Products',
    'Steel / Glass Bottles',
    'Eco Gift Kits'
  ],
  'Gift Sets & Combos': [
    'Welcome Kits',
    'Corporate / Alumni Gift Sets',
    'Fest Merchandise Boxes',
    'Achievement / Graduation Boxes'
  ],
  'Sports & Fitness Merchandise': [
    'Sports Kits / Jerseys',
    'Gym Towels / Bottles',
    'Yoga Mats',
    'Fitness Bands',
    'Sports Bags',
    'Arm Bands / Headbands'
  ]
};


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({token}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(backendURL + '/api/category/list');
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.log(err);
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

 const [list, setList] = useState([]);
 const [filteredList, setFilteredList] = useState([]);
 const [stockFilter, setStockFilter] = useState('all');
 const [priceSort, setPriceSort] = useState('default');
 const [lowStockThreshold, setLowStockThreshold] = useState(10);
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [subCategoryFilter, setSubCategoryFilter] = useState('all');
 const [availableCategories, setAvailableCategories] = useState([]);
 const [availableSubCategories, setAvailableSubCategories] = useState([]);
 const [showEditDialog, setShowEditDialog] = useState(false);
 const [editProduct, setEditProduct] = useState(null);
 const [formData, setFormData] = useState({
   name: '',
   description: '',
   price: '',
   Mrpprice: '',
   category: 'Apparels',
   subCategory: 'Men',
   bestseller: false,
   collegeMerchandise: '',
   sizes: [],
   quantity: 0,
   color: '',
   brand: '',
   useSizeVariants: false,
   sizeVariants: []
 });
 const [images, setImages] = useState([null, null, null, null]);
 const [deletedImages, setDeletedImages] = useState([]);

 const fetchList = async() => {
  try{

    const response=await axios.get(backendURL+ '/api/product/list')
    console.log(response.data);
    if(response.data.success){
      const products = response.data.products;
      setList(products);
      setFilteredList(products);
      
      // Extract unique categories
      const categories = [...new Set(products.map(p => p.category))].sort();
      setAvailableCategories(categories);
      
      // Extract unique subcategories
      const subCategories = [...new Set(products.map(p => p.subCategory).filter(Boolean))].sort();
      setAvailableSubCategories(subCategories);

    }else{
      toast.error(response.data.message);
    }


  }catch(err){
    console.log(err);
    toast.error(err.message);
  }
 }
const removeProduct=async(id)=>{
  try{
    const response=await axios.delete(backendURL+ '/api/product/remove',{data:{id},headers:{token}})
    console.log(response.data);
    
    if(response.data.success){
      toast.success(response.data.message);
      await fetchList();
    }else{
      toast.error(response.data.message);
    }
  }catch(err){
    console.log(err);
    toast.error(err.message);
  }
}

const openEditDialog = (product) => {
  setEditProduct(product);
  const hasSizeVariants = product.sizeVariants && product.sizeVariants.length > 0;
  // Determine valid subcategory
  let validSubCategory = product.subCategory;
  const hardcodedSubcategories = subCategoryOptions[product.category] || [];
  // If subCategory is missing or not in the list, use first available
  if (!validSubCategory || ![...hardcodedSubcategories].includes(validSubCategory)) {
    validSubCategory = hardcodedSubcategories[0] || '';
  }
  setFormData({
    name: product.name,
    description: product.description,
    price: product.price,
    Mrpprice: product.Mrpprice,
    category: product.category,
    subCategory: validSubCategory,
    bestseller: product.bestseller,
    collegeMerchandise: product.collegeMerchandise || '',
    sizes: product.sizes || [],
    quantity: product.quantity || 0,
    color: product.color || '',
    brand: product.brand || '',
    useSizeVariants: hasSizeVariants,
    sizeVariants: hasSizeVariants ? product.sizeVariants : []
  });
  setImages([null, null, null, null]);
  setDeletedImages([]);
  setShowEditDialog(true);
}

const closeEditDialog = () => {
  setShowEditDialog(false);
  setEditProduct(null);
  setFormData({
    name: '',
    description: '',
    price: '',
    Mrpprice: '',
    category: 'Apparels',
    subCategory: 'Men',
    bestseller: false,
    collegeMerchandise: '',
    sizes: [],
    quantity: 0,
    color: '',
    brand: '',
    useSizeVariants: false,
    sizeVariants: []
  });
  setImages([null, null, null, null]);
}

const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
}

const handleSizeToggle = (size) => {
  setFormData(prev => {
    const sizes = prev.sizes.includes(size)
      ? prev.sizes.filter(s => s !== size)
      : [...prev.sizes, size];
    
    let sizeVariants = prev.sizeVariants;
    if (prev.useSizeVariants) {
      if (!prev.sizes.includes(size)) {
        // Adding new size
        sizeVariants = [...sizeVariants, { size, price: prev.price || '', mrpPrice: prev.Mrpprice || '', quantity: 0 }];
      } else {
        // Removing size
        sizeVariants = sizeVariants.filter(v => v.size !== size);
      }
    }
    
    return { ...prev, sizes, sizeVariants };
  });
}

const handleImageChange = (index, e) => {
  const file = e.target.files[0];
  if (file) {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  }
}

const handleUpdateProduct = async (e) => {
  e.preventDefault();
  setIsUpdating(true);
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('id', editProduct._id);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('Mrpprice', formData.Mrpprice);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('subCategory', formData.subCategory);
    formDataToSend.append('bestseller', formData.bestseller);
    formDataToSend.append('collegeMerchandise', formData.collegeMerchandise);
    if (!formData.useSizeVariants) {
      formDataToSend.append('quantity', formData.quantity);
    }
    formDataToSend.append('color', formData.color);
    formDataToSend.append('brand', formData.brand);
    formDataToSend.append('useSizeVariants', formData.useSizeVariants);
    formDataToSend.append('sizeVariants', JSON.stringify(formData.sizeVariants));
    if (formData.sizes.length > 0) {
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
    }
    images.forEach((image, index) => {
      if (image) {
        formDataToSend.append(`image${index + 1}`, image);
      }
    });
    if (deletedImages.length > 0) {
      formDataToSend.append('deletedImages', JSON.stringify(deletedImages));
    }
    const response = await axios.put(
      backendURL + '/api/product/update',
      formDataToSend,
      { headers: { token } }
    );
    if (response.data.success) {
      toast.success(response.data.message);
      closeEditDialog();
      await fetchList();
    } else {
      toast.error(response.data.message);
    }
  } catch (err) {
    console.log(err);
    toast.error(err.message);
  } finally {
    setIsUpdating(false);
  }
}
``



 useEffect(() => {
  fetchList();
 }, []);

 useEffect(() => {
  applyFilters();
 }, [list, stockFilter, priceSort, lowStockThreshold, categoryFilter, subCategoryFilter]);

 const applyFilters = () => {
  let filtered = [...list];

  // Apply category filter
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(item => item.category === categoryFilter);
  }

  // Apply subcategory filter
  if (subCategoryFilter !== 'all') {
    filtered = filtered.filter(item => item.subCategory === subCategoryFilter);
  }

  // Apply stock filter
  if (stockFilter === 'low') {
    filtered = filtered.filter(item => item.quantity <= lowStockThreshold);
  } else if (stockFilter === 'out') {
    filtered = filtered.filter(item => item.quantity === 0);
  }

  // Apply price sort
  if (priceSort === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  }

  setFilteredList(filtered);
 };



  return (
    <div className='space-y-6'>
    <div>
      <h2 className='page-title'>All Products</h2>
      <p className='text-sm text-muted'>Filter, sort, and manage product inventory.</p>
    </div>
    {/* Filter Controls */}
    <div className='glass-surface flex flex-wrap gap-4 p-4'>
      <div className='flex flex-col gap-1'>
        <label className='text-sm font-medium text-muted'>Category</label>
        <select 
          value={categoryFilter} 
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setSubCategoryFilter('all'); // Reset subcategory when category changes
          }}
          className='glass-input'
        >
          <option value='all'>All Categories</option>
          {availableCategories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-sm font-medium text-muted'>Subcategory</label>
        <select 
          value={subCategoryFilter} 
          onChange={(e) => setSubCategoryFilter(e.target.value)}
          className='glass-input'
        >
          <option value='all'>All Subcategories</option>
          {availableSubCategories.map((subCat, index) => (
            <option key={index} value={subCat}>{subCat}</option>
          ))}
        </select>
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-sm font-medium text-muted'>Stock Filter</label>
        <select 
          value={stockFilter} 
          onChange={(e) => setStockFilter(e.target.value)}
          className='glass-input'
        >
          <option value='all'>All Products</option>
          <option value='low'>Low Stock</option>
          <option value='out'>Out of Stock</option>
        </select>
      </div>

      {stockFilter === 'low' && (
        <div className='flex flex-col gap-1'>
          <label className='text-sm font-medium text-muted'>Low Stock Threshold</label>
          <input
            type='number'
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            min='1'
            className='glass-input w-24'
          />
        </div>
      )}

      <div className='flex flex-col gap-1'>
        <label className='text-sm font-medium text-muted'>Sort by Price</label>
        <select 
          value={priceSort} 
          onChange={(e) => setPriceSort(e.target.value)}
          className='glass-input'
        >
          <option value='default'>Default</option>
          <option value='low-high'>Price: Low to High</option>
          <option value='high-low'>Price: High to Low</option>
        </select>
      </div>

      <div className='flex flex-col gap-1 justify-end'>
        <p className='text-sm font-medium text-muted'>
          Showing {filteredList.length} of {list.length} products
        </p>
      </div>
    </div>

        <div className='glass-card flex flex-col gap-2 p-4'>


 {/*  list table title */}

 
  <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center py-2 px-2 text-sm text-muted'>
    <b>Image</b>
    <b>Name</b>
    <b>Category</b>
    <b>Price</b>
    <b className='text-center'>Stock</b>
    <b className='text-center'>Edit</b>
    <b className='text-center'>Delete</b>
  </div>

   {/*  ------------products list ----------- */}
   {
    filteredList.map((item,index)=>{
      // Calculate available stock: sum of all size variant stocks if present, else overall quantity
      let displayStock = (item.sizeVariants && item.sizeVariants.length > 0)
        ? item.sizeVariants.reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0)
        : (typeof item.quantity === 'number' ? item.quantity : 0);
      let stockTooltip = '';
      if(item.sizeVariants && item.sizeVariants.length > 0){
        stockTooltip = item.sizeVariants.map(v => `${v.size}: ${v.quantity}`).join(', ');
      }
      
      return (
               <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-3 px-2 text-sm border-t border-[var(--glass-stroke)]' key={index}>
                 <img className='w-12 rounded border border-[var(--glass-stroke)]' src={item.image[0]} alt="" />
                 <p>{item.name}</p>
                 <p>{item.category}</p>
                 <p>{currency}{item.price}</p>
                 <p 
                   className={`text-center font-medium ${
                     displayStock === 0 ? 'text-[var(--danger)]' : 
                     displayStock <= 10 ? 'text-[var(--warning)]' : 
                     'text-[var(--success)]'
                   }`}
                   title={stockTooltip || `Total stock: ${displayStock}`}
                 >
                   {displayStock}
                   {item.sizeVariants && item.sizeVariants.length > 0 && (
                     <span className='text-xs block text-muted'>({item.sizeVariants.length} sizes)</span>
                   )}
                 </p>
                 <button
                   onClick={() => openEditDialog(item)}
                   className='text-[var(--accent)] hover:text-[color-mix(in_srgb,var(--accent)_85%,black)] text-center cursor-pointer'
                 >
                   Edit
                 </button>
                 <p
                 onClick={()=>removeProduct(item._id)}
                 className='text-right md:text-center cursor-pointer text-lg text-[var(--danger)] hover:text-[color-mix(in_srgb,var(--danger)_85%,black)]'>X</p>
               </div>
      )
    }
  )
   }
        </div>

        {/* Edit Dialog */}
        {showEditDialog && (
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold'>Edit Product</h2>
                <button
                  onClick={closeEditDialog}
                  className='text-muted hover:text-[var(--text)] text-2xl font-bold'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className='flex flex-col gap-4'>
                {/* Product Name */}
                <div>
                  <label className='block mb-2 font-medium'>Product Name</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border rounded'
                    required
                  />
                </div>

                {/* Product Description */}
                <div>
                  <label className='block mb-2 font-medium'>Product Description</label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border rounded'
                    rows='4'
                    required
                  />
                </div>

                {/* Category and SubCategory */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2 font-medium'>Category</label>
                    <select
                      name='category'
                      value={formData.category}
                      onChange={e => {
                        const newCategory = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          category: newCategory,
                          subCategory: (subCategoryOptions[newCategory] && subCategoryOptions[newCategory][0]) || ''
                        }));
                      }}
                      className='w-full px-3 py-2 border rounded'
                    >
                      {Object.keys(subCategoryOptions).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block mb-2 font-medium'>Sub Category</label>
                    <select
                      name='subCategory'
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border rounded'
                    >
                      {(() => {
                        const categoryData = categories.find(cat => cat.name === formData.category);
                        const dynamicSubcategories = categoryData?.subcategories || [];
                        const hardcodedSubcategories = subCategoryOptions[formData.category] || [];
                        const allSubcategories = [...new Set([...hardcodedSubcategories, ...dynamicSubcategories])];
                        return allSubcategories.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ));
                      })()}
                    </select>
                  </div>
                </div>

                {/* Price and MRP */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block mb-2 font-medium'>Price</label>
                    <input
                      type='number'
                      name='price'
                      value={formData.price}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border rounded'
                      required
                    />
                  </div>

                  <div>
                    <label className='block mb-2 font-medium'>MRP Price</label>
                    <input
                      type='number'
                      name='Mrpprice'
                      value={formData.Mrpprice}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border rounded'
                      required
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Only show general quantity if not using size variants */}
                  {!formData.useSizeVariants && (
                    <div>
                      <label className='block mb-2 font-medium'>Quantity</label>
                      <input
                        type='number'
                        name='quantity'
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min='0'
                        className='w-full px-3 py-2 border rounded'
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className='block mb-2 font-medium'>Color</label>
                    <input
                      type='text'
                      name='color'
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder='e.g., Red, Blue'
                      className='w-full px-3 py-2 border rounded'
                    />
                  </div>

                  <div>
                    <label className='block mb-2 font-medium'>Brand</label>
                    <input
                      type='text'
                      name='brand'
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder='e.g., Nike, Adidas'
                      className='w-full px-3 py-2 border rounded'
                    />
                  </div>
                </div>

                {/* College Merchandise */}
                <div>
                  <label className='block mb-2 font-medium'>College Merchandise (Optional)</label>
                  <input
                    type='text'
                    name='collegeMerchandise'
                    value={formData.collegeMerchandise}
                    onChange={handleInputChange}
                    placeholder='e.g., IIT Delhi, IIM Ahmedabad'
                    className='w-full px-3 py-2 border rounded'
                  />
                </div>

                {/* Sizes - Only show for Apparels category */}
                {formData.category === 'Apparels' && (
                  <>
                  <div className='mb-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <input 
                        type="checkbox" 
                        checked={formData.useSizeVariants}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => {
                            if (checked && prev.sizes.length > 0) {
                              // Initialize size variants with selected sizes
                              const variants = prev.sizes.map(size => {
                                const existing = prev.sizeVariants.find(v => v.size === size);
                                return existing || {
                                  size,
                                  price: prev.price || '',
                                  mrpPrice: prev.Mrpprice || '',
                                  quantity: 0
                                };
                              });
                              return { ...prev, useSizeVariants: checked, sizeVariants: variants };
                            } else {
                              return { ...prev, useSizeVariants: checked, sizeVariants: [] };
                            }
                          });
                        }}
                        className='cursor-pointer'
                      />
                      <label className='cursor-pointer font-medium'>
                        Enable different pricing for each size
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 font-medium'>Sizes</label>
                    <div className='flex gap-2 flex-wrap'>
                      {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                        <button
                          key={size}
                          type='button'
                          onClick={() => handleSizeToggle(size)}
                          className={`px-4 py-2 border rounded ${
                            formData.sizes.includes(size)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.useSizeVariants && formData.sizeVariants.length > 0 && (
                    <div className='mt-4 p-4 bg-gray-50 border rounded'>
                      <p className='mb-3 font-medium'>Set Price & Quantity for Each Size</p>
                      <div className='space-y-3'>
                        {formData.sizeVariants.map((variant, index) => (
                          <div key={variant.size} className='flex gap-3 items-center bg-white p-3 rounded border'>
                            <div className='w-12 font-bold text-center'>{variant.size === 'XXXL' ? '3XL' : variant.size}</div>
                            <div className='flex-1'>
                              <label className='text-xs text-gray-600'>Price</label>
                              <input 
                                type="number"
                                value={variant.price}
                                onChange={(e) => {
                                  const updated = [...formData.sizeVariants];
                                  updated[index].price = e.target.value;
                                  setFormData(prev => ({ ...prev, sizeVariants: updated }));
                                }}
                                className='w-full px-2 py-1 border rounded'
                                placeholder='Price'
                              />
                            </div>
                            <div className='flex-1'>
                              <label className='text-xs text-gray-600'>MRP Price</label>
                              <input 
                                type="number"
                                value={variant.mrpPrice}
                                onChange={(e) => {
                                  const updated = [...formData.sizeVariants];
                                  updated[index].mrpPrice = e.target.value;
                                  setFormData(prev => ({ ...prev, sizeVariants: updated }));
                                }}
                                className='w-full px-2 py-1 border rounded'
                                placeholder='MRP'
                              />
                            </div>
                            <div className='flex-1'>
                              <label className='text-xs text-gray-600'>Quantity</label>
                              <input 
                                type="number"
                                value={variant.quantity}
                                onChange={(e) => {
                                  const updated = [...formData.sizeVariants];
                                  updated[index].quantity = e.target.value;
                                  setFormData(prev => ({ ...prev, sizeVariants: updated }));
                                }}
                                className='w-full px-2 py-1 border rounded'
                                placeholder='Stock'
                                min='0'
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                )}

                {/* Bestseller */}
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='bestseller'
                    checked={formData.bestseller}
                    onChange={handleInputChange}
                    className='w-4 h-4'
                  />
                  <label className='font-medium'>Add to Bestseller</label>
                </div>

                {/* Current Images with delete option */}
                <div>
                  <label className='block mb-2 font-medium'>Current Images</label>
                  <div className='flex gap-2 flex-wrap'>
                    {editProduct.image.map((img, idx) => (
                      <div key={idx} className='relative w-20 h-20'>
                        {img ? (
                          <>
                            <img src={img} alt='' className='w-20 h-20 object-cover border rounded' />
                            <button
                              type='button'
                              className='absolute top-1 right-1 bg-white text-red-600 border rounded-full w-6 h-6 flex items-center justify-center shadow'
                              onClick={() => {
                                // Remove image from editProduct and formData only if user clicks delete
                                // Mark image as deleted and remove from display
                                const updatedImages = [...editProduct.image];
                                updatedImages[idx] = null;
                                setEditProduct(prev => ({ ...prev, image: updatedImages }));
                                setDeletedImages(prev => [...prev, idx]);
                              }}
                              title='Delete image'
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <div className='w-20 h-20 flex items-center justify-center border rounded bg-gray-100 text-gray-400'>No Image</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload New Images (replaces deleted or empty slots) */}
                <div>
                  <label className='block mb-2 font-medium'>Upload New Images (Optional)</label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx}>
                        <label className='block text-sm mb-1'>Image {idx + 1}</label>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleImageChange(idx, e)}
                          className='w-full text-sm'
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-4 justify-end pt-4 border-t'>
                  <button
                    type='button'
                    onClick={closeEditDialog}
                    className='px-6 py-2 border rounded hover:bg-gray-100'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}

export default List;

