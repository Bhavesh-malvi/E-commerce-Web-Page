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
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Coupons
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage discount codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100/50 hover:bg-blue-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <FaPlus size={14} /> Create Coupon
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {coupons.length === 0 && !loading && (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
               <FaTicketAlt className="text-slate-200 text-4xl" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No coupons found</p>
          </div>
        )}

        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 relative">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <FaTicketAlt size={120} />
            </div>

            <div className="p-8 relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div 
                  onClick={() => copyCode(coupon.code)}
                  className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all border border-slate-100 active:scale-90"
                  title="Click to copy"
                >
                  <span className="font-bold text-slate-800 tracking-wider text-xs uppercase">{coupon.code}</span>
                  <FaCopy className="text-slate-300" size={10} />
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                  new Date(coupon.expiry) < new Date() ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600 shadow-sm'
                }`}>
                  {new Date(coupon.expiry) < new Date() ? 'Expired' : 'Active'}
                </div>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-slate-800 tracking-tighter">
                  {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                  <span className="text-[10px] font-bold text-slate-300 ml-2 uppercase tracking-widest">Off</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-4 h-[1px] bg-slate-200"></div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                     Min purchase: ₹{coupon.minAmount || 0}
                   </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-6">
                <div className="flex flex-col gap-1">
                   <span className="opacity-40">Expiry Date</span>
                   <span className="text-slate-500 font-semibold">{new Date(coupon.expiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                   <span className="opacity-40">Usage Count</span>
                   <span className="text-slate-500 font-semibold">{coupon.usedCount} Times Used</span>
                </div>
              </div>

              <button
                onClick={() => setDeleteModal({ isOpen: true, id: coupon._id })}
                className="absolute top-8 right-8 w-10 h-10 bg-rose-50/50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <FaTrash size={12} />
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
