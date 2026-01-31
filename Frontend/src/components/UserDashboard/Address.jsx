import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaPlus, FaHome, FaBriefcase, FaMapMarkerAlt, FaEdit, FaTrash, FaCheckCircle, FaLocationArrow } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AddressForm from '../common/AddressForm';

const Address = () => {
    const { addresses, addAddress, updateAddress, deleteAddress, loading } = useContext(AppContext);
    
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleEdit = (addr) => {
        setEditingAddress(addr);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    const handleSubmit = async (formData) => {
        let res;
        if (editingAddress) {
            res = await updateAddress(editingAddress._id, formData);
        } else {
            res = await addAddress(formData);
        }

        if (res.success) {
            handleCancel();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Shipping Addresses</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your delivery locations for faster checkout.</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-[#FF8F9C] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#ff7a8a] transition-all shadow-lg shadow-[#FF8F9C]/20 active:scale-95"
                    >
                        <FaPlus size={14} />
                        <span>Add New</span>
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <AddressForm 
                        initialData={editingAddress}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {addresses.length > 0 ? (
                            addresses.map((addr) => (
                                <div 
                                    key={addr._id}
                                    className={`relative group bg-white border rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                                        addr.isDefault ? 'border-[#FF8F9C]/30 ring-4 ring-[#FF8F9C]/5 ring-opacity-50' : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FF8F9C]/10 rounded-xl flex items-center justify-center text-[#FF8F9C]">
                                                {addr.label === 'office' ? <FaBriefcase /> : addr.label === 'home' ? <FaHome /> : <FaMapMarkerAlt />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase tracking-tighter text-base">{addr.label || 'Home'}</h4>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] bg-[#FF8F9C] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Default</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleEdit(addr)}
                                                className="p-2 text-gray-400 hover:text-[#FF8F9C] transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => deleteAddress(addr._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">{addr.name}</p>
                                            <p className="text-gray-500 text-xs font-bold font-mono">{addr.phone}</p>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 leading-relaxed font-semibold">
                                            <p>{addr.street}</p>
                                            {addr.landmark && <p className="text-gray-400 italic text-xs">Landmark: {addr.landmark}</p>}
                                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                        </div>
                                    </div>

                                    {addr.isDefault && (
                                        <div className="absolute top-4 right-4 text-[#FF8F9C] opacity-20 group-hover:opacity-100 transition-opacity">
                                            <FaCheckCircle size={20} />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-[2.5rem]">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                                    <FaLocationArrow className="text-4xl text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 font-serif mb-3 tracking-tight">Where should we deliver?</h3>
                                <p className="text-gray-500 max-w-sm text-center font-medium leading-relaxed px-6">
                                    No saved addresses found. Add a delivery location to experience faster checkout.
                                </p>
                                <button 
                                    onClick={() => setShowForm(true)}
                                    className="mt-10 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-95"
                                >
                                    Add Address Now
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Address;
