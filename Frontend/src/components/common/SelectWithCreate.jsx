import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const SelectWithCreate = ({ label, name, options, value, onChange, placeholder, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleChange = (e) => {
     onChange(e);
     setIsOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          required={required}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
          placeholder={placeholder}
          autoComplete="off"
        />
        <div 
            className="absolute right-3 top-3 text-gray-400 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
            <FaChevronDown />
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options
            .filter(opt => opt.toLowerCase().includes(value.toLowerCase()))
            .map((opt, idx) => (
            <div
              key={idx}
              className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-gray-700"
              onClick={() => {
                  onChange({ target: { name: name, value: opt } });
                  setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectWithCreate;
