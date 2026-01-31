import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaPlus, FaTrash, FaTicketAlt, FaCopy } from "react-icons/fa";

const AdminCoupons = () => {
  const { getAllCoupons, createCoupon, deleteCoupon } = useContext(AppContext);
  const toast = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Form
  const [formData, setFormData] = useState({
    code: "",
    type: "percent", // percent or flat
    value: "",
    expiry: "",
    minAmount: "",
    usageLimit: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await getAllCoupons();
    if (res?.success) setCoupons(res.coupons);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createCoupon(formData);
    if (res?.success) {
      toast.success("Coupon created successfully");
      setShowModal(false);
      fetchCoupons();
      setFormData({
        code: "",
        type: "percent",
        value: "",
        expiry: "",
        minAmount: "",
        usageLimit: ""
      });
    } else {
      toast.error(res?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async () => {
    const res = await deleteCoupon(deleteModal.id);
    if (res?.success) {
      toast.success("Coupon deleted");
      setCoupons(prev => prev.filter(c => c._id !== deleteModal.id));
    } else {
      toast.error(res?.message);
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Coupons Management
          </h1>
          <p className="text-gray-600 mt-1">Create discount codes for users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <FaPlus /> Create Coupon
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white/50 rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No active coupons. Create one now!</p>
          </div>
        )}

        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden relative group hover:shadow-xl transition-all">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <FaTicketAlt size={100} />
            </div>

            <div className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div 
                  onClick={() => copyCode(coupon.code)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  title="Click to copy"
                >
                  <span className="font-mono font-bold text-gray-800 tracking-wider">{coupon.code}</span>
                  <FaCopy className="text-gray-400" size={12} />
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  new Date(coupon.expiry) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                }`}>
                  {new Date(coupon.expiry) < new Date() ? 'Expired' : 'Active'}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                  <span className="text-sm font-normal text-gray-500 ml-1">OFF</span>
                </div>
                <p className="text-sm text-gray-500">
                  Min purchase: ₹{coupon.minAmount || 0}
                </p>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-4">
                <span>Exp: {new Date(coupon.expiry).toLocaleDateString()}</span>
                <span>Used: {coupon.usedCount} times</span>
              </div>

              <button
                onClick={() => setDeleteModal({ isOpen: true, id: coupon._id })}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Coupon</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  uppercase="true"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none uppercase font-mono"
                  placeholder="e.g. SAVE20"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.minAmount}
                    onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.expiry}
                    onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                  />
                </div>
              </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.usageLimit}
                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure? Users won't be able to use this code anymore."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminCoupons;
