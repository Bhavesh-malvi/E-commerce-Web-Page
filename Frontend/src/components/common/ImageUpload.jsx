import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';

const ImageUpload = ({ 
  images = [], 
  onChange, 
  maxImages = 10,
  maxSizeMB = 5 
}) => {
  const [previews, setPreviews] = useState(images);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (previews.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate and process files
    const validFiles = [];
    fileArray.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }

      validFiles.push(file);
    });

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => {
          const newPreviews = [...prev, { file, preview: reader.result }];
          onChange(newPreviews);
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index) => {
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      onChange(newPreviews);
      return newPreviews;
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
        <p className="text-gray-700 font-medium mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to {maxSizeMB}MB (Max {maxImages} images)
        </p>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((item, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={item.preview || item.url || item}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FaTimes size={12} />
              </button>

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        {previews.length} / {maxImages} images uploaded
      </p>
    </div>
  );
};

export default ImageUpload;
