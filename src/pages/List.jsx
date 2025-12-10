import axios from 'axios';
import React, {  useEffect, useState } from 'react'
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({token}) => {

 const [list, setList] = useState([]);
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
   color: ''
 });
 const [images, setImages] = useState([null, null, null, null]);

 const fetchList = async() => {
  try{

    const response=await axios.get(backendURL+ '/api/product/list')
    console.log(response.data);
    if(response.data.success){
      setList(response.data.products);

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
  setFormData({
    name: product.name,
    description: product.description,
    price: product.price,
    Mrpprice: product.Mrpprice,
    category: product.category,
    subCategory: product.subCategory,
    bestseller: product.bestseller,
    collegeMerchandise: product.collegeMerchandise || '',
    sizes: product.sizes || [],
    quantity: product.quantity || 0,
    color: product.color || ''
  });
  setImages([null, null, null, null]);
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
    color: ''
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
    return { ...prev, sizes };
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
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('color', formData.color);
    
    if (formData.sizes.length > 0) {
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
    }

    images.forEach((image, index) => {
      if (image) {
        formDataToSend.append(`image${index + 1}`, image);
      }
    });

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
  }
}
``



 useEffect(() => {
  fetchList();
 }, []);



  return (
    <>

    <p className='mb-2 '>All Products List</p>
        <div className='flex flex-col gap-2'>


 {/*  list table title */}

 
  <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm '>
    <b>Image</b>
    <b>Name</b>
    <b>Category</b>
    <b>Price</b>
    <b className='text-center'>Edit</b>
    <b className='text-center'>Delete</b>
  </div>

   {/*  ------------products list ----------- */}
   {
    list.map((item,index)=>(
               <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ' key={index}>
                 <img className='w-12' src={item.image[0]} alt="" />
                 <p>{item.name}</p>
                 <p>{item.category}</p>
                 <p>{currency}{item.price}</p>
                 <button
                   onClick={() => openEditDialog(item)}
                   className='text-blue-600 hover:text-blue-800 text-center cursor-pointer'
                 >
                   Edit
                 </button>
                 <p
                 onClick={()=>removeProduct(item._id)}
                 className='text-right md:text-center cursor-pointer text-lg text-red-600 hover:text-red-800'>X</p>
               </div>
    )
  )
   }
        </div>

        {/* Edit Dialog */}
        {showEditDialog && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold'>Edit Product</h2>
                <button
                  onClick={closeEditDialog}
                  className='text-gray-500 hover:text-gray-700 text-2xl font-bold'
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
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border rounded'
                    >
                      <option value='Apparels'>Apparels</option>
                      <option value='Accessories'>Accessories</option>
                      <option value='Stationery & Academic Supplies'>Stationery & Academic Supplies</option>
                      <option value='Tech & Gadgets'>Tech & Gadgets</option>
                      <option value='Event & Souvenir Merchandise'>Event & Souvenir Merchandise</option>
                      <option value='Eco-Friendly & Sustainable Merchandise'>Eco-Friendly & Sustainable Merchandise</option>
                      <option value='Gift Sets & Combos'>Gift Sets & Combos</option>
                      <option value='Sports & Fitness Merchandise'>Sports & Fitness Merchandise</option>
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
                      <option value='Men'>Men</option>
                      <option value='Women'>Women</option>
                      <option value='Kids'>Kids</option>
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
                  <div>
                    <label className='block mb-2 font-medium'>Sizes</label>
                    <div className='flex gap-2 flex-wrap'>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
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

                {/* Current Images */}
                <div>
                  <label className='block mb-2 font-medium'>Current Images</label>
                  <div className='flex gap-2 flex-wrap'>
                    {editProduct.image.map((img, idx) => (
                      <img key={idx} src={img} alt='' className='w-20 h-20 object-cover border rounded' />
                    ))}
                  </div>
                </div>

                {/* Upload New Images */}
                <div>
                  <label className='block mb-2 font-medium'>Upload New Images (Optional)</label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                    {[1, 2, 3, 4].map((num, idx) => (
                      <div key={num}>
                        <label className='block text-sm mb-1'>Image {num}</label>
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
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  )
}

export default List;