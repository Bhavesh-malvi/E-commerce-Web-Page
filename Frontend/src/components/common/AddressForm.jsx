import React, { useState, useEffect } from 'react';
import { FaHome, FaBriefcase, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AddressForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        label: 'home',
        isDefault: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phone: initialData.phone || '',
                street: initialData.street || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                landmark: initialData.landmark || '',
                label: initialData.label || 'home',
                isDefault: initialData.isDefault || false
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-2xl relative"
        >
            <button 
                onClick={onCancel}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
            >
                <FaTimes size={20} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                {initialData ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input 
                            required
                            type="text"
                            placeholder="Receiver's Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                        <input 
                            required
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Street Address</label>
                    <textarea 
                        required
                        rows="2"
                        placeholder="House No, Building Name, Street, Area"
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City</label>
                        <input 
                            required
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">State</label>
                        <input 
                            required
                            type="text"
                            placeholder="State"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pincode</label>
                        <input 
                            required
                            maxLength="6"
                            type="text"
                            placeholder="6 Digits"
                            value={formData.pincode}
                            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Landmark (Optional)</label>
                    <input 
                        type="text"
                        placeholder="E.g. Near Apollo Hospital"
                        value={formData.landmark}
                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#FF8F9C] transition-all text-sm font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
                    <div className="space-y-3 w-full sm:w-auto">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 block">Address Label</label>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {['home', 'office', 'other'].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setFormData({...formData, label: l})}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 transition-all ${
                                        formData.label === l 
                                        ? 'bg-[#FF8F9C] text-white shadow-lg shadow-[#FF8F9C]/20' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {l === 'home' && <FaHome size={11} />}
                                    {l === 'office' && <FaBriefcase size={11} />}
                                    {l === 'other' && <FaMapMarkerAlt size={11} />}
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors ${formData.isDefault ? 'bg-[#FF8F9C]' : 'bg-gray-200'}`}></div>
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isDefault ? 'translate-x-6' : ''}`}></div>
                        </div>
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest group-hover:text-gray-900 transition-colors">Set as Default</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-8">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="px-4 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={loading}
                        type="submit"
                        className="bg-gray-900 text-white px-6 sm:px-8 py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Save Address'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default AddressForm;
