import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import ImageUpload from '../common/ImageUpload';
import SelectWithCreate from '../common/SelectWithCreate';
import { FaPlus, FaTimes, FaSave } from 'react-icons/fa';

const ProductForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProduct, updateProduct, getUniqueCategories, getUniqueSubCategories } = useContext(AppContext);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getUniqueCategories();
    if (res.success) {
        setCategories(res.categories);
    }
  };

  const fetchSubCategories = async (cat) => {
    const res = await getUniqueSubCategories(cat);
    if (res.success) {
        setSubCategories(res.subCategories);
    }
  };

  useEffect(() => {
     if (initialData?.category) {
        fetchSubCategories(initialData.category);
     }
  }, [initialData]);
  
  // Initialize form with calculated discount percent for Edit Mode
  const initPrice = initialData?.price || 0;
  const initDiscountPrice = initialData?.discountPrice || 0;
  const initPercent = initDiscountPrice && initPrice 
    ? Math.round(((initPrice - initDiscountPrice) / initPrice) * 100) 
    : '';

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    subCategory: initialData?.subCategory || '',
    brand: initialData?.brand || '',
    gender: initialData?.gender || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    discountPercent: initPercent,
    stock: initialData?.stock || '',
    tags: initialData?.tags || [],
    badges: initialData?.badges || [],
    warranty: initialData?.warranty || '',
    returnable: initialData?.returnable !== undefined ? initialData.returnable : true,
    minOrderQty: initialData?.minOrderQty || 1,
    avgDeliveryTime: initialData?.avgDeliveryTime || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    specifications: initialData?.specifications || [],
    variants: initialData?.variants || [],
    descriptionBlocks: initialData?.descriptionBlocks || [],
    shortDescription: initialData?.shortDescription || ''
  });

  const [images, setImages] = useState(initialData?.mainImages || []);
  const [tagInput, setTagInput] = useState('');
  const [badgeInput, setBadgeInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'category') {
        fetchSubCategories(value);
    }
  };



  // Tags Management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagPaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    // Split by newlines, spaces, or #
    // This regex looks for any combination of whitespaces, newlines, or hashes as delimiters
    const rawTags = pasteData.split(/[\s\r\n#]+/).filter(tag => tag.trim() !== '');
    
    const cleanedTags = rawTags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !formData.tags.includes(tag));

    if (cleanedTags.length > 0) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, ...cleanedTags])]
      }));
      toast.success(`Added ${cleanedTags.length} tags!`);
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Badges Management
  const addBadge = () => {
    if (badgeInput.trim() && !formData.badges.includes(badgeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        badges: [...prev.badges, badgeInput.trim()]
      }));
      setBadgeInput('');
    }
  };

  const removeBadge = (index) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index)
    }));
  };

  // Specifications Management
  // Ensure at least one empty spec exists
  useEffect(() => {
    if (formData.specifications.length === 0) {
      setFormData(prev => ({
        ...prev,
        specifications: [{ key: '', value: '' }]
      }));
    }
  }, [formData.specifications.length]);

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData(prev => {
      const newSpecs = prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      );
      
      // Auto-add new row if typing in the last row
      if (index === prev.specifications.length - 1 && value.trim() !== '') {
        newSpecs.push({ key: '', value: '' });
      }
      
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSpecificationPaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');
    
    const newSpecs = [];
    
    lines.forEach(line => {
      let key = '';
      let value = '';
      
      // Handle Markdown table format | Key | Value |
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
        if (parts.length >= 2) {
          // Skip header separator rows like | --- | --- |
          if (parts[0].includes('---') || parts[1].includes('---')) return;
          // Skip header rows if they are exactly "Key" and "Value"
          if (parts[0].toLowerCase() === 'key' && parts[1].toLowerCase() === 'value') return;
          
          key = parts[0];
          value = parts[1];
        }
      } 
      // Handle Tab separated values
      else if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        key = parts[0];
        value = parts[1] || '';
      }
      // Handle Colon separated values
      else if (line.includes(':')) {
        const parts = line.split(':');
        key = parts[0].trim();
        value = parts.slice(1).join(':').trim();
      }

      if (key && value) {
        newSpecs.push({ key, value });
      }
    });

    if (newSpecs.length > 0) {
      // If we found valid pairs, prevent default and batch add
      e.preventDefault();
      setFormData(prev => {
        // Remove any completely empty rows from existing specs
        const existingSpecs = prev.specifications.filter(s => s.key.trim() || s.value.trim());
        const mergedSpecs = [...existingSpecs, ...newSpecs];
        // Always keep an empty row at the end for fresh manual entry
        mergedSpecs.push({ key: '', value: '' });
        return { ...prev, specifications: mergedSpecs };
      });
      toast.success(`Successfully added ${newSpecs.length} specifications!`);
    }
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', colorCode: '#000000', size: '', price: '', stock: '', variantImages: [] }]
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleVariantImages = (index, files) => {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const newVariants = [...prev.variants];
          const variant = { ...newVariants[index] };
          variant.variantImages = [...variant.variantImages, { file, preview: reader.result }];
          newVariants[index] = variant;
          return { ...prev, variants: newVariants };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const variant = { ...newVariants[variantIndex] };
      variant.variantImages = variant.variantImages.filter((_, i) => i !== imageIndex);
      newVariants[variantIndex] = variant;
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Description Blocks Management
  const addDescriptionBlock = (type) => {
    setFormData(prev => ({
      ...prev,
      descriptionBlocks: [
        ...prev.descriptionBlocks,
        { type, title: '', content: '', order: prev.descriptionBlocks.length }
      ]
    }));
  };
  const updateDescriptionBlock = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      descriptionBlocks: prev.descriptionBlocks.map((block, i) =>
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  const handleDescriptionImage = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => {
        const newBlocks = [...prev.descriptionBlocks];
        newBlocks[index] = { ...newBlocks[index], file, preview: reader.result };
        return { ...prev, descriptionBlocks: newBlocks };
      });
    };
    reader.readAsDataURL(file);
  };

  const removeDescriptionBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      descriptionBlocks: prev.descriptionBlocks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Basic fields
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock || 0);
      
      // Optional fields
      if (formData.subCategory) submitData.append('subCategory', formData.subCategory);
      if (formData.brand) submitData.append('brand', formData.brand);
      if (formData.gender) submitData.append('gender', formData.gender);
      if (formData.discountPrice) submitData.append('discountPrice', formData.discountPrice);
      if (formData.warranty) submitData.append('warranty', formData.warranty);
      if (formData.avgDeliveryTime) submitData.append('avgDeliveryTime', formData.avgDeliveryTime);
      if (formData.metaTitle) submitData.append('metaTitle', formData.metaTitle);
      if (formData.metaDescription) submitData.append('metaDescription', formData.metaDescription);
      if (formData.shortDescription) submitData.append('shortDescription', formData.shortDescription);
      
      submitData.append('returnable', formData.returnable);
      submitData.append('minOrderQty', formData.minOrderQty);

      // Arrays as JSON
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('badges', JSON.stringify(formData.badges));
      
      // Filter out empty specifications
      const cleanSpecs = formData.specifications.filter(s => s.key.trim() || s.value.trim());
      submitData.append('specifications', JSON.stringify(cleanSpecs));
      
      // Process variants (exclude variantImages from JSON string)
      const variantsToSubmit = formData.variants.map(v => {
        const { variantImages, ...vData } = v;
        return vData;
      });
      submitData.append('variants', JSON.stringify(variantsToSubmit));

      // Append Variant Images with specific fieldnames
      formData.variants.forEach((variant, vIndex) => {
        if (variant.variantImages) {
          variant.variantImages.forEach((img) => {
            if (img.file) {
              submitData.append(`variant_image_${vIndex}`, img.file);
            }
          });
        }
      });

      // Description Blocks (exclude local file/preview from JSON)
      const blocksToSubmit = formData.descriptionBlocks.map(b => {
        const { file, preview, ...bData } = b;
        return bData;
      });
      submitData.append('descriptionBlocks', JSON.stringify(blocksToSubmit));

      // Append Description Block Images
      formData.descriptionBlocks.forEach((block, bIndex) => {
        if (block.type === 'image' && block.file) {
          submitData.append(`description_block_image_${bIndex}`, block.file);
        }
      });

      // Images
      images.forEach((img) => {
        if (img.file) {
          submitData.append('images', img.file);
        }
      });

      let result;
      if (isEdit) {
        result = await updateProduct(id, submitData);
      } else {
        result = await addProduct(submitData);
      }

      if (result.success) {
        toast.success(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
        navigate('/seller/products');
      } else {
        toast.error(result.message || 'Failed to save product');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 pb-24">
      
      {/* Basic Information */}
      <section className="bg-white rounded-[2rem] shadow-xl shadow-purple-100/20 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
             <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
             Core Details
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-5">Essential product identification</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium"
                placeholder="Ex: Premium Leather Handbag"
              />
            </div>

            <div className="space-y-2">
               <SelectWithCreate
                  label="Category"
                  name="category"
                  options={categories}
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Select or Create..."
                  required
              />
            </div>

            <div className="space-y-2">
              <SelectWithCreate
                  label="Sub-Category"
                  name="subCategory"
                  options={subCategories}
                  value={formData.subCategory}
                  onChange={handleChange}
                  placeholder="Select or Create..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Brand Name</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium"
                placeholder="Ex: Adidas"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Target Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium appearance-none"
              >
                <option value="">Choose Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Short Description (One-liner)</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all text-sm font-medium resize-none"
                placeholder="Briefly describe your product (shows near price area)..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="bg-white rounded-[2rem] shadow-xl shadow-pink-100/20 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
             <div className="w-2 h-6 bg-pink-600 rounded-full"></div>
             Pricing & Inventory
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-5">Configure your profit margins</p>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                Base Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    price: e.target.value,
                    discountPrice: price - (price * (formData.discountPercent || 0) / 100)
                  }));
                }}
                required
                min="0"
                step="0.01"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-bold"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Offer (%)</label>
              <input
                type="number"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={(e) => {
                   const percent = parseFloat(e.target.value) || 0;
                   const price = parseFloat(formData.price) || 0;
                   setFormData(prev => ({
                     ...prev,
                     discountPercent: e.target.value,
                     discountPrice: price - (price * percent / 100)
                   }));
                }}
                min="0"
                max="100"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-bold text-pink-600"
                placeholder="0%"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Sale Price</label>
              <div className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-sm font-bold flex items-center">
                ₹{(formData.discountPrice || formData.price || 0).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Live Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-400 focus:bg-white transition-all text-sm font-bold"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Images */}
      <section className="bg-white rounded-[2rem] shadow-xl shadow-blue-100/20 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
             <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
             Visual Assets
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-5">Upload high-quality product images</p>
        </div>
        <div className="p-8">
           <ImageUpload images={images} onChange={setImages} maxImages={10} />
        </div>
      </section>

      {/* Advanced Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tags & Badges */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Tags & Badges</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  onPaste={handleTagPaste}
                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 text-sm"
                  placeholder="New Arrivals, Silk..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-purple-100">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="hover:text-rose-500"><FaTimes /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Featured Badges</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 text-sm"
                  placeholder="Top Rated, Eco-Friendly..."
                />
                <button
                  type="button"
                  onClick={addBadge}
                  className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.badges.map((badge, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    {badge}
                    <button type="button" onClick={() => removeBadge(index)} className="hover:text-rose-500"><FaTimes /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Specifications</h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase">Auto-Saves while typing</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    onPaste={handleSpecificationPaste}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 text-xs font-bold"
                    placeholder="Material"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    onPaste={handleSpecificationPaste}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 text-xs font-semibold"
                    placeholder="Premium Cotton"
                  />
                  {formData.specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Variants Section */}
      <section className="bg-white rounded-[2rem] shadow-xl shadow-purple-100/20 border border-slate-100 overflow-hidden">
         <div className="bg-slate-900 px-8 py-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Product Variants</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Colors, Sizes, and Stocks</p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl flex items-center gap-3 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <FaPlus size={10} /> Add New Variant
            </button>
        </div>

        <div className="p-8">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {formData.variants.map((variant, index) => (
                <div key={index} className="group p-6 border border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-purple-100/20 transition-all duration-500 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Variant Config</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color Name</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-xs font-bold"
                        placeholder="Red"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color HEX</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={variant.colorCode || '#000000'}
                          onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                          className="w-10 h-10 border-0 p-0 bg-transparent cursor-pointer rounded-lg overflow-hidden flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={variant.colorCode || '#000000'}
                          onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-[10px] font-bold"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 space-y-2">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Size</label>
                       <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-xs font-bold"
                        placeholder="M"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                       <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stock</label>
                       <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-xs font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Variant Images upload UI ... simplified */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-3">Variant Gallery</label>
                    <div className="flex flex-wrap gap-2">
                       {variant.variantImages && variant.variantImages.map((img, imgIndex) => (
                          <div key={imgIndex} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 group">
                             <img src={img.preview || img.url} alt="" className="w-full h-full object-cover" />
                             <button
                               type="button"
                               onClick={() => removeVariantImage(index, imgIndex)}
                               className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                             >
                               <FaTimes size={12} />
                             </button>
                          </div>
                       ))}
                       <label className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-400 flex items-center justify-center text-slate-300 hover:text-purple-500 cursor-pointer transition-all">
                          <FaPlus size={14} />
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleVariantImages(index, e.target.files)} />
                       </label>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Description Blocks Section */}
      <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detailed Description</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rich content blocks for the product page</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addDescriptionBlock('text')}
              className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <FaPlus size={10} /> Text Block
            </button>
            <button
              type="button"
              onClick={() => addDescriptionBlock('image')}
              className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <FaPlus size={10} /> Image Block
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {formData.descriptionBlocks.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
               <p className="text-sm font-medium text-slate-400">No description blocks added yet.</p>
            </div>
          )}
          {formData.descriptionBlocks.map((block, index) => (
            <div key={index} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/30 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.2em]">{block.type} Block</span>
                <button
                  type="button"
                  onClick={() => removeDescriptionBlock(index)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                >
                  <FaTimes size={12} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) => updateDescriptionBlock(index, 'title', e.target.value)}
                  className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-sm font-bold"
                  placeholder="Block Title (Optional)"
                />
                
                {block.type === 'text' ? (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateDescriptionBlock(index, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-sm"
                    placeholder="Detailed description content..."
                  />
                ) : (
                  <div className="space-y-4">
                     {/* Image Preview or Existing URL */}
                     {(block.preview || block.content) && (
                        <div className="relative w-full max-w-md h-48 rounded-2xl overflow-hidden border border-slate-100 group">
                           <img 
                             src={block.preview || block.content} 
                             alt="preview" 
                             className="w-full h-full object-cover" 
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</p>
                           </div>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             onChange={(e) => handleDescriptionImage(index, e.target.files[0])}
                           />
                        </div>
                     )}
                     
                     {!(block.preview || block.content) && (
                        <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-100 hover:border-purple-400 flex flex-col items-center justify-center text-slate-300 hover:text-purple-500 cursor-pointer transition-all gap-2 bg-white">
                           <FaPlus size={20} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Upload Description Image</span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={(e) => handleDescriptionImage(index, e.target.files[0])} 
                           />
                        </label>
                     )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logistics & SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Logistics & Policy</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warranty Term</label>
                    <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" placeholder="1 Year" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Delivery</label>
                    <input type="number" name="avgDeliveryTime" value={formData.avgDeliveryTime} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" placeholder="5 Days" />
                 </div>
                 <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Return Policy Applicable</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="returnable" checked={formData.returnable} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                 </div>
              </div>
          </section>

          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Search SEO</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Title</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold" placeholder="Search friendly title" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium" placeholder="Search snippet..." />
                 </div>
              </div>
          </section>
      </div>

      {/* Sticky Submit Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-50">
         <div className="bg-white/70 backdrop-blur-2xl p-4 rounded-[2rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              disabled={loading}
              className="px-8 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-800 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-10 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaSave size={12} />
                  {isEdit ? 'Sync Changes' : 'Publish Product'}
                </>
              )}
            </button>
         </div>
      </div>
    </form>
  );
};

export default ProductForm;
