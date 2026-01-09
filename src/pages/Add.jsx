import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';
const Add = ({token}) => {

 const [image1, setImage1] = useState(false);
 const [image2, setImage2] = useState(false);
 const [image3, setImage3] = useState(false);
 const [image4, setImage4] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);


 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
  const [Mrpprice, setMrpprice] = useState('');
 const [category, setCategory] = useState('Apparels');
 const [subCategory, setSubCategory] = useState('Men');
 const [collegeMerchandise, setCollegeMerchandise] = useState('');
 const [merchandiseList, setMerchandiseList] = useState([]);
 const [newMerchandise, setNewMerchandise] = useState('');
 const [showAddMerchandise, setShowAddMerchandise] = useState(false);
 const [quantity, setQuantity] = useState(0);
 const [color, setColor] = useState('');
 const [brand, setBrand] = useState('');
 const [weight, setWeight] = useState(400);
 const [length, setLength] = useState(30);
 const [breadth, setBreadth] = useState(27);
 const [height, setHeight] = useState(2);


 const [bestseller, setBestseller] = useState(false);
 const [sizes,setSizes]=useState([]);
 const [useSizeVariants, setUseSizeVariants] = useState(false);
 const [sizeVariants, setSizeVariants] = useState([]);
 // sizeVariants: [{ size: 'S', price: 500, mrpPrice: 700, quantity: 10 }]

 // State for dynamic categories
 const [categories, setCategories] = useState([]);
 const [showAddCategory, setShowAddCategory] = useState(false);
 const [newCategory, setNewCategory] = useState('');
 const [showAddSubcategory, setShowAddSubcategory] = useState(false);
 const [newSubcategory, setNewSubcategory] = useState('');

 // Define subcategories for each category
 const subCategoryOptions = {
   'Apparels': [
     'T-shirts (crew neck, polo, oversized, dri-fit)',
     'Hoodies & Sweatshirts',
     'Jackets & Windcheaters',
     'Caps',
     'Formal Wear (shirts)',
     'Sports Jerseys',
   ],
   'Accessories': [
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
     'Welcome Kits (T-shirt, Notebook, Mug, ID Holder)',
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

 // Handle category change
 const handleCategoryChange = (newCategory) => {
   setCategory(newCategory);
   // Get subcategories from dynamic data or fallback to hardcoded
   const categoryData = categories.find(cat => cat.name === newCategory);
   const dynamicSubcategories = categoryData?.subcategories || [];
   const hardcodedSubcategories = subCategoryOptions[newCategory] || [];
   
   // Combine both and remove duplicates
   const allSubcategories = [...new Set([...dynamicSubcategories, ...hardcodedSubcategories])];
   
   setSubCategory(allSubcategories[0] || '');
   // Clear sizes if non-apparel category
   if (newCategory !== 'Apparels') {
     setSizes([]);
   }
 };

 const handleAddCategory = async () => {
   if (!newCategory.trim()) {
     toast.error('Please enter a category name');
     return;
   }

   try {
     const response = await axios.post(
       backendURL + '/api/category/add',
       { name: newCategory, subcategories: [] },
       { headers: { token } }
     );

     if (response.data.success) {
       toast.success(response.data.message);
       setNewCategory('');
       setShowAddCategory(false);
       fetchCategories();
     } else {
       toast.error(response.data.message);
     }
   } catch (err) {
     console.log(err);
     toast.error(err.response?.data?.message || 'Failed to add category');
   }
 };

 const handleAddSubcategory = async () => {
   if (!newSubcategory.trim()) {
     toast.error('Please enter a subcategory name');
     return;
   }

   try {
     const response = await axios.post(
       backendURL + '/api/category/add-subcategory',
       { categoryName: category, subcategory: newSubcategory },
       { headers: { token } }
     );

     if (response.data.success) {
       toast.success(response.data.message);
       setNewSubcategory('');
       setShowAddSubcategory(false);
       fetchCategories();
       setSubCategory(newSubcategory);
     } else {
       toast.error(response.data.message);
     }
   } catch (err) {
     console.log(err);
     toast.error(err.response?.data?.message || 'Failed to add subcategory');
   }
 };

 // Fetch merchandise list on component mount
 useEffect(() => {
   fetchMerchandiseList();
   fetchCategories();
 }, []);

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

 const fetchMerchandiseList = async () => {
   try {
     const response = await axios.get(backendURL + '/api/college-merchandise/list');
     if (response.data.success) {
       setMerchandiseList(response.data.merchandises);
       if (response.data.merchandises.length > 0) {
         setCollegeMerchandise(response.data.merchandises[0].name);
       }
     }
   } catch (err) {
     console.log(err);
     toast.error('Failed to fetch merchandise list');
   }
 };

 const handleAddMerchandise = async () => {
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
       setShowAddMerchandise(false);
       fetchMerchandiseList();
     } else {
       toast.error(response.data.message);
     }
   } catch (err) {
     console.log(err);
     toast.error(err.response?.data?.message || 'Failed to add merchandise');
   }
 };

 const validateForm = () => {
    // Image validation
    if (!image1) {
      toast.error('Please upload the first image');
      return false;
    }

    // Name validation
    if (!name.trim()) {
      toast.error('Please enter product name');
      return false;
    }

    // Description validation
    if (!description.trim()) {
      toast.error('Please enter product description');
      return false;
    }

    // Price validation
    if (!price || price <= 0) {
      toast.error('Please enter a valid product price');
      return false;
    }

    // MRP Price validation
    if (!Mrpprice || Mrpprice <= 0) {
      toast.error('Please enter a valid MRP price');
      return false;
    }

    // Category validation
    if (!category) {
      toast.error('Please select a category');
      return false;
    }

    // SubCategory validation
    if (!subCategory) {
      toast.error('Please select a subcategory');
      return false;
    }

    // College Merchandise validation
    if (!collegeMerchandise) {
      toast.error('Please select college merchandise');
      return false;
    }

    // Quantity or Size Variants validation
    if (!useSizeVariants) {
      if (quantity === '' || quantity < 0) {
        toast.error('Please enter a valid quantity');
        return false;
      }
    }

    // Color validation
    if (!color.trim()) {
      toast.error('Please enter product color');
      return false;
    }

    // Brand validation
    if (!brand.trim()) {
      toast.error('Please enter product brand');
      return false;
    }

    // Weight validation
    if (!weight || weight <= 0) {
      toast.error('Please enter a valid weight');
      return false;
    }

    // Length validation
    if (!length || length <= 0) {
      toast.error('Please enter a valid length');
      return false;
    }

    // Breadth validation
    if (!breadth || breadth <= 0) {
      toast.error('Please enter a valid breadth');
      return false;
    }

    // Height validation
    if (!height || height <= 0) {
      toast.error('Please enter a valid height');
      return false;
    }

    // Apparel-specific validation
    if (category === 'Apparels' && sizes.length === 0) {
      toast.error('Please select at least one size for Apparels');
      return false;
    }

    // Size Variants validation
    if (useSizeVariants && sizeVariants.length === 0) {
      toast.error('Please add at least one size variant');
      return false;
    }

    return true;
  };

 const onSubmitHandler = async(e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try{
      const formData = new FormData();
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('Mrpprice', Mrpprice);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('useSizeVariants', useSizeVariants);
      formData.append('sizeVariants', JSON.stringify(sizeVariants));
      formData.append('collegeMerchandise', collegeMerchandise);
      if (!useSizeVariants) {
        formData.append('quantity', quantity);
      }
      formData.append('color', color);
      formData.append('brand', brand);
      formData.append('weight', weight);
      formData.append('length', length);
      formData.append('breadth', breadth);
      formData.append('height', height);
      console.log([...formData]);
      const response=await axios.post(backendURL+'/api/product/add', formData,{headers:{token}})
      if(response.data.success){
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setPrice('');     
        setMrpprice('');
        setQuantity(0);
        setColor('');
        setBrand('');
        setWeight(400);
        setLength(30);
        setBreadth(27);
        setHeight(2);
        setSizes([]);
        setSizeVariants([]);
        setUseSizeVariants(false);
        setBestseller(false);
        setImage1('');  
        setImage2('');                 
        setImage3('');
        setImage4('');
      }else{
        toast.error(response.data.message );
      }
    } catch(err){
      console.log(err);
      toast.error(err.response?.data?.message || 'Error adding product');
    }   
  }


  return (
    <div className='space-y-6'>
      <div>
        <h2 className='page-title'>Add New Product</h2>
        <p className='text-sm text-muted'>Upload images and define pricing, inventory, and variants.</p>
      </div>
      <form
      onSubmit={onSubmitHandler}
      className='glass-card flex flex-col w-full items-start gap-4 p-6' >
         <div>
          <p className='mb-2'>Upload Image</p>
          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])}  type="file" id='image1' hidden />
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=> setImage2(e.target.files[0])} type="file" id='image2' hidden />
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=> setImage3(e.target.files[0])} type="file" id='image3' hidden />
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=> setImage4(e.target.files[0])} type="file" id='image4' hidden />
            </label>
            
            </div>   
         </div>

         <div className='w-full'>
          <p className='mb-2'>Product Name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='Type here' required/>
         </div>
         <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 ' type="text" placeholder='write content here' required/>
         </div>


         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8 '>
           <div className='flex-1'>

            <p className='mb-2'>Product category</p>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <select 
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddCategory(true);
                    } else {
                      handleCategoryChange(e.target.value);
                    }
                  }} 
                  value={category} 
                  className="w-full px-3 py-2"
                >
                  {/* Hardcoded categories */}
                  <option value="Apparels">Apparels</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Stationery & Academic Supplies">Stationery & Academic Supplies</option>
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Event & Souvenir Merchandise">Event & Souvenir Merchandise</option>
                  <option value="Eco-Friendly & Sustainable Merchandise">Eco-Friendly & Sustainable Merchandise</option>
                  <option value="Gift Sets & Combos">Gift Sets & Combos</option>
                  <option value="Sports & Fitness Merchandise">Sports & Fitness Merchandise</option>
                  
                  {/* Dynamic categories from database */}
                  {categories
                    .filter(cat => !['Apparels', 'Accessories', 'Stationery & Academic Supplies', 'Tech & Gadgets', 'Event & Souvenir Merchandise', 'Eco-Friendly & Sustainable Merchandise', 'Gift Sets & Combos', 'Sports & Fitness Merchandise'].includes(cat.name))
                    .map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))
                  }
                  
                  <option value="__add_new__" style={{color: '#4CAF50', fontWeight: 'bold'}}>
                    + Add New Category
                  </option>
                </select>
              </div>
            </div>

            {showAddCategory && (
              <div className='mt-2 p-3 bg-gray-100 rounded'>
                <input 
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder='Enter new category name'
                  className='w-full px-3 py-2 mb-2'
                />
                <div className='flex gap-2'>
                  <button 
                    type='button'
                    onClick={handleAddCategory}
                    className='bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600'
                  >
                    Add
                  </button>
                  <button 
                    type='button'
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory('');
                    }}
                    className='bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
           </div>
           
           <div className='flex-1'>

            <p className='mb-2'>Sub category</p>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <select 
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddSubcategory(true);
                    } else {
                      setSubCategory(e.target.value);
                    }
                  }} 
                  value={subCategory} 
                  className="w-full px-3 py-2"
                >
                  {(() => {
                    const categoryData = categories.find(cat => cat.name === category);
                    const dynamicSubcategories = categoryData?.subcategories || [];
                    const hardcodedSubcategories = subCategoryOptions[category] || [];
                    const allSubcategories = [...new Set([...hardcodedSubcategories, ...dynamicSubcategories])];
                    
                    return allSubcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ));
                  })()}
                  <option value="__add_new__" style={{color: '#4CAF50', fontWeight: 'bold'}}>
                    + Add New Subcategory
                  </option>
                </select>
              </div>
            </div>

            {showAddSubcategory && (
              <div className='mt-2 p-3 bg-gray-100 rounded'>
                <input 
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder='Enter new subcategory name'
                  className='w-full px-3 py-2 mb-2'
                />
                <div className='flex gap-2'>
                  <button 
                    type='button'
                    onClick={handleAddSubcategory}
                    className='bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600'
                  >
                    Add
                  </button>
                  <button 
                    type='button'
                    onClick={() => {
                      setShowAddSubcategory(false);
                      setNewSubcategory('');
                    }}
                    className='bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
           </div>
         </div>

         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
           <div className='flex-1'>

            <p className='mb-2'>College Merchandise</p>
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <select 
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddMerchandise(true);
                    } else {
                      setCollegeMerchandise(e.target.value);
                    }
                  }} 
                  value={collegeMerchandise}
                  className="w-full px-3 py-2" 
                  name="collegeMerchandise"
                >
                  <option value="">Select College Merchandise</option>
                  {merchandiseList.map((item) => (
                    <option key={item._id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  <option value="__add_new__" style={{color: '#4CAF50', fontWeight: 'bold'}}>
                    + Add New Merchandise
                  </option>
                </select>
              </div>
            </div>

            {showAddMerchandise && (
              <div className='mt-2 p-3 border rounded bg-gray-50'>
                <p className='text-sm font-medium mb-2'>Add New Merchandise</p>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newMerchandise}
                    onChange={(e) => setNewMerchandise(e.target.value)}
                    placeholder='Enter merchandise name'
                    className='flex-1 px-3 py-2 border rounded'
                  />
                  <button
                    type='button'
                    onClick={handleAddMerchandise}
                    className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowAddMerchandise(false);
                      setNewMerchandise('');
                    }}
                    className='px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
           </div>
         </div>

         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
           <div>
             <p className='mb-2 '>Product price</p>
             <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
           </div>

           <div>
             <p className='mb-2 '>MRP price</p>
             <input onChange={(e)=>setMrpprice(e.target.value)} value={Mrpprice} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
           </div>

           {/* Quantity field is only shown if not using size variants */}
           {!useSizeVariants && (
             <div>
               <p className='mb-2 '>Quantity</p>
               <input onChange={(e)=>setQuantity(e.target.value)} value={quantity} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='0' min='0' />
             </div>
           )}

           <div>
             <p className='mb-2 '>Color</p>
             <input onChange={(e)=>setColor(e.target.value)} value={color} className='w-full px-3 py-2 sm:w-[120px]' type="text" placeholder='Red' />
           </div>

           <div>
             <p className='mb-2 '>Brand</p>
             <input onChange={(e)=>setBrand(e.target.value)} value={brand} className='w-full px-3 py-2 sm:w-[120px]' type="text" placeholder='Nike' />
           </div>
         </div>

         <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
           <div>
             <p className='mb-2 '>Weight (g)</p>
             <input onChange={(e)=>setWeight(e.target.value)} value={weight} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='400' min='1' required />
           </div>

           <div>
             <p className='mb-2 '>Length (cm)</p>
             <input onChange={(e)=>setLength(e.target.value)} value={length} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='30' min='1' required />
           </div>

           <div>
             <p className='mb-2 '>Breadth (cm)</p>
             <input onChange={(e)=>setBreadth(e.target.value)} value={breadth} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='27' min='1' required />
           </div>

           <div>
             <p className='mb-2 '>Height (cm)</p>
             <input onChange={(e)=>setHeight(e.target.value)} value={height} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='2' min='1' required />
           </div>
         </div>



 {category === 'Apparels' && (
 <>
 <div className='mb-4'>
  <div className='flex items-center gap-3 mb-3'>
    <input 
      type="checkbox" 
      id='useSizeVariants' 
      checked={useSizeVariants}
      onChange={(e) => {
        setUseSizeVariants(e.target.checked);
        if (e.target.checked && sizes.length > 0) {
          // Initialize size variants with selected sizes
          const variants = sizes.map(size => ({
            size,
            price: price || '',
            mrpPrice: Mrpprice || '',
            quantity: 0
          }));
          setSizeVariants(variants);
        } else {
          setSizeVariants([]);
        }
      }}
      className='cursor-pointer'
    />
    <label htmlFor='useSizeVariants' className='cursor-pointer font-medium'>
      Enable different pricing for each size
    </label>
  </div>
</div>

 <div>
  <p className='mb-2'>Product Sizes</p>
  <div className='flex gap-3'>
    <div onClick={()=>{
      const newSizes = sizes.includes("S") ? sizes.filter(item=>item !== "S") : [...sizes,"S"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("S")) {
          setSizeVariants([...sizeVariants, { size: "S", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "S"));
        }
      }
    }}>
      <p className={`${sizes.includes("S") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>S</p>
    </div>
    <div onClick={()=>{
      const newSizes = sizes.includes("M") ? sizes.filter(item=>item !== "M") : [...sizes,"M"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("M")) {
          setSizeVariants([...sizeVariants, { size: "M", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "M"));
        }
      }
    }}>
      <p className={`${sizes.includes("M") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>M</p>
    </div>
    <div onClick={()=>{
      const newSizes = sizes.includes("L") ? sizes.filter(item=>item !== "L") : [...sizes,"L"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("L")) {
          setSizeVariants([...sizeVariants, { size: "L", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "L"));
        }
      }
    }}>
      <p className={`${sizes.includes("L") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>L</p>
    </div>
    <div onClick={()=>{
      const newSizes = sizes.includes("XL") ? sizes.filter(item=>item !== "XL") : [...sizes,"XL"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("XL")) {
          setSizeVariants([...sizeVariants, { size: "XL", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "XL"));
        }
      }
    }}>
      <p className={`${sizes.includes("XL") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>XL</p>
    </div>
    <div onClick={()=>{
      const newSizes = sizes.includes("XXL") ? sizes.filter(item=>item !== "XXL") : [...sizes,"XXL"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("XXL")) {
          setSizeVariants([...sizeVariants, { size: "XXL", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "XXL"));
        }
      }
    }}>
      <p className={`${sizes.includes("XXL") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>XXL</p>
    </div>
    <div onClick={()=>{
      const newSizes = sizes.includes("XXXL") ? sizes.filter(item=>item !== "XXXL") : [...sizes,"XXXL"];
      setSizes(newSizes);
      if (useSizeVariants) {
        if (!sizes.includes("XXXL")) {
          setSizeVariants([...sizeVariants, { size: "XXXL", price: price || '', mrpPrice: Mrpprice || '', quantity: 0 }]);
        } else {
          setSizeVariants(sizeVariants.filter(v => v.size !== "XXXL"));
        }
      }
    }}>
      <p className={`${sizes.includes("XXXL") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>XXXL</p>
    </div>
  </div>
 </div>

 {useSizeVariants && sizeVariants.length > 0 && (
  <div className='mt-4 p-4 bg-gray-50 border rounded'>
    <p className='mb-3 font-medium'>Set Price & Quantity for Each Size</p>
    <div className='space-y-3'>
      {sizeVariants.map((variant, index) => (
        <div key={variant.size} className='flex gap-3 items-center bg-white p-3 rounded border'>
          <div className='w-12 font-bold text-center'>{variant.size}</div>
          <div className='flex-1'>
            <label className='text-xs text-gray-600'>Price</label>
            <input 
              type="number"
              value={variant.price}
              onChange={(e) => {
                const updated = [...sizeVariants];
                updated[index].price = e.target.value;
                setSizeVariants(updated);
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
                const updated = [...sizeVariants];
                updated[index].mrpPrice = e.target.value;
                setSizeVariants(updated);
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
                const updated = [...sizeVariants];
                updated[index].quantity = e.target.value;
                setSizeVariants(updated);
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


 <div className='flex gap-2 mt-2 '>
  <input  onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
  <label className='cursor-pointer ' htmlFor="bestseller">Add to bestseller</label>

 </div>
        

        <button type='submit' className='btn btn-primary mt-4 w-32' disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
    </form>
    </div>
  )
}

export default Add
