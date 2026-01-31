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
    descriptionBlocks: initialData?.descriptionBlocks || []
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

      submitData.append('descriptionBlocks', JSON.stringify(formData.descriptionBlocks));

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
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Basic Information */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <SelectWithCreate
                label="Category"
                name="category"
                options={categories}
                value={formData.category}
                onChange={handleChange}
                placeholder="Select or add category"
                required
            />
          </div>

          <div>
            <SelectWithCreate
                label="Sub Category"
                name="subCategory"
                options={subCategories}
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="Select or add sub category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing & Stock</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
            <div className="flex gap-2">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0%"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Final Price (Calculated)</label>
            <input
              type="number"
              value={formData.discountPrice || formData.price}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Product Images <span className="text-red-500">*</span>
        </h2>
        <ImageUpload images={images} onChange={setImages} maxImages={10} />
      </div>

      {/* Tags & Badges */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tags & Badges</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                onPaste={handleTagPaste}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(index)}>
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badges</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={badgeInput}
                onChange={(e) => setBadgeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add badge"
              />
              <button
                type="button"
                onClick={addBadge}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.badges.map((badge, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {badge}
                  <button type="button" onClick={() => removeBadge(index)}>
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Specifications</h2>
        </div>

        <div className="space-y-3">
          {formData.specifications.map((spec, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                onPaste={handleSpecificationPaste}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Key (e.g., Material)"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                onPaste={handleSpecificationPaste}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Value (e.g., Cotton)"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Variants</h2>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add Variant
          </button>
        </div>

        <div className="space-y-6">
          {formData.variants.map((variant, index) => (
            <div key={index} className="p-4 border border-purple-100 rounded-xl bg-purple-50/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-700">Variant #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color Name</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Red"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color Code</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={variant.colorCode || '#000000'}
                      onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                      className="w-10 h-10 border-0 p-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={variant.colorCode || '#000000'}
                      onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="M, L, XL"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price Override (₹)</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Optional"
                    min="0"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Variant Images */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Variant Images</label>
                <div className="flex flex-wrap gap-3">
                   {/* Preview existing or newly uploaded images */}
                   {variant.variantImages && variant.variantImages.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative w-16 h-16 group">
                         <img 
                           src={img.preview || img.url} 
                           alt="preview" 
                           className="w-full h-full object-cover rounded-lg border border-gray-200" 
                         />
                         <button
                           type="button"
                           onClick={() => removeVariantImage(index, imgIndex)}
                           className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <FaTimes size={10} />
                         </button>
                      </div>
                   ))}
                   
                   {/* Upload Trigger */}
                   <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-white transition-all">
                      <FaPlus className="text-gray-400" />
                      <span className="text-[8px] text-gray-500 mt-1">Upload</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => handleVariantImages(index, e.target.files)}
                        className="hidden" 
                      />
                   </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
            <input
              type="text"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 1 Year"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avg Delivery Time (days)</label>
            <input
              type="number"
              name="avgDeliveryTime"
              value={formData.avgDeliveryTime}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
            <input
              type="number"
              name="minOrderQty"
              value={formData.minOrderQty}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="1"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="returnable"
              checked={formData.returnable}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">Returnable Product</label>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">SEO Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="SEO title for search engines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="SEO description for search engines"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/seller/products')}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FaSave />
              {isEdit ? 'Update Product' : 'Add Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
