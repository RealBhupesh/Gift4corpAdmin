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


 const [bestseller, setBestseller] = useState(false);
 const [sizes,setSizes]=useState([]);

 // Define subcategories for each category
 const subCategoryOptions = {
   'Apparels': ['Men', 'Women', 'Kids'],
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
   'Lifestyle & Utility Items': [
     'Mugs / Sippers / Tumblers',
     'Water Bottles / Flasks',
     'Umbrellas'
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
   ],
   'Home & Dorm Essentials': [
     'Bedsheets / Pillow Covers',
     'Dorm Room Decor',
     'Wall Clocks / Lamps',
     'Storage Bins',
     'Laundry Bags'
   ]
 };

 // Handle category change
 const handleCategoryChange = (newCategory) => {
   setCategory(newCategory);
   // Set first subcategory of the new category
   const newSubCategories = subCategoryOptions[newCategory] || [];
   setSubCategory(newSubCategories[0] || '');
   // Clear sizes if non-apparel category
   if (newCategory !== 'Apparels') {
     setSizes([]);
   }
 };

 // Fetch merchandise list on component mount
 useEffect(() => {
   fetchMerchandiseList();
 }, []);

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

 const onSubmitHandler = async(e) => {
    e.preventDefault();

    try{
      const formData = new FormData();
     image1&& formData.append('image1', image1);
      image2&& formData.append('image2', image2);
      image3&& formData.append('image3', image3);
      image4&& formData.append('image4', image4);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('Mrpprice', Mrpprice);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('collegeMerchandise', collegeMerchandise);
      formData.append('quantity', quantity);
      formData.append('color', color);

         
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
        setSizes([]);
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
       toast.error(err.response.data.message );
    }   

  } 


  return (
    <form
    onSubmit={onSubmitHandler}
    className='flex flex-col w-full items-start gap-3 ' >
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
           <div>

            <p className='mb-2'>Product category</p>
            <select onChange={(e)=>handleCategoryChange(e.target.value)} value={category} className="w-full px-3 py-2" name="category" id="">
              <option value="Apparels">Apparels</option>
              <option value="Accessories">Accessories</option>
              <option value="Stationery & Academic Supplies">Stationery & Academic Supplies</option>
              <option value="Lifestyle & Utility Items">Lifestyle & Utility Items</option>
              <option value="Tech & Gadgets">Tech & Gadgets</option>
              <option value="Event & Souvenir Merchandise">Event & Souvenir Merchandise</option>
              <option value="Eco-Friendly & Sustainable Merchandise">Eco-Friendly & Sustainable Merchandise</option>
              <option value="Gift Sets & Combos">Gift Sets & Combos</option>
              <option value="Sports & Fitness Merchandise">Sports & Fitness Merchandise</option>
              <option value="Home & Dorm Essentials">Home & Dorm Essentials</option>
            </select>
           </div>
           <div>

            <p className='mb-2'>Sub category</p>
            <select onChange={(e)=>setSubCategory(e.target.value)} value={subCategory} className="w-full px-3 py-2" name="subCategory" id="">
              {(subCategoryOptions[category] || []).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
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

           <div>
             <p className='mb-2 '>Quantity</p>
             <input onChange={(e)=>setQuantity(e.target.value)} value={quantity} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='0' min='0' />
           </div>

           <div>
             <p className='mb-2 '>Color</p>
             <input onChange={(e)=>setColor(e.target.value)} value={color} className='w-full px-3 py-2 sm:w-[120px]' type="text" placeholder='Red' />
           </div>
         </div>



 {category === 'Apparels' && (
 <div>
  <p className='mb-2'>Product Sizes</p>
  <div className='flex gap-3'>
    <div onClick={()=>setSizes(prev => prev.includes("S") ? (prev.filter(item=>item !== "S")): [...prev,"S"])}>
      <p className={`${sizes.includes("S") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>S</p>
    </div>
    <div onClick={()=>setSizes(prev => prev.includes("M") ? (prev.filter(item=>item !== "M")): [...prev,"M"])}>
      <p className={`${sizes.includes("M") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>M</p>
    </div>
    <div onClick={()=>setSizes(prev => prev.includes("L") ? (prev.filter(item=>item !== "L")): [...prev,"L"])}>
      <p className={`${sizes.includes("L") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>L</p>
    </div>
    <div onClick={()=>setSizes(prev => prev.includes("XL") ? (prev.filter(item=>item !== "XL")): [...prev,"XL"])}>
      <p className={`${sizes.includes("XL") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>XL</p>
    </div>
    <div onClick={()=>setSizes(prev => prev.includes("XXL") ? (prev.filter(item=>item !== "XXL")): [...prev,"XXL"])}>
      <p className={`${sizes.includes("XXL") ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer `}>XXL</p>
    </div>
  </div>
 </div>
 )}


 <div className='flex gap-2 mt-2 '>
  <input  onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
  <label className='cursor-pointer ' htmlFor="bestseller">Add to bestseller</label>

 </div>
        

        <button type='submit ' className='w-28 py-3 mt-4 bg-black text-white  '>Add Product</button>
    </form>
  )
}

export default Add