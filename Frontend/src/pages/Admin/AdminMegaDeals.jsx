import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaPlus, FaTrash, FaCalendarAlt, FaTag, FaCheck, FaSearch, FaPowerOff } from "react-icons/fa";

const AdminMegaDeals = () => {
  const { getAllMegaDeals, createMegaDeal, deleteMegaDeal, toggleMegaDealStatus, getAdminProducts, fetchActiveMegaDeal } = useContext(AppContext);
  const toast = useToast();

  const [megaDeals, setMegaDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    maxDiscount: 70,
    startDate: "",
    endDate: "",
    products: []
  });

  // Product Selection
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetchMegaDeals();
    fetchProducts();
  }, []);

  const fetchMegaDeals = async () => {
    setLoading(true);
    const res = await getAllMegaDeals();
    if (res?.success) setMegaDeals(res.megaDeals);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await getAdminProducts();
    if (res?.success) setAllProducts(res.products);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.products.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const res = await createMegaDeal(formData);
    if (res?.success) {
      toast.success("Mega deal created successfully");
      setShowModal(false);
      fetchMegaDeals();
      fetchActiveMegaDeal(); // Refresh active mega deal
      setFormData({
        title: "",
        description: "",
        discountPercentage: "",
        maxDiscount: 70,
        startDate: "",
        endDate: "",
        products: []
      });
    } else {
      toast.error(res?.message || "Failed to create mega deal");
    }
  };

  const handleDelete = async () => {
    const res = await deleteMegaDeal(deleteModal.id);
    if (res?.success) {
      toast.success("Mega deal deleted");
      setMegaDeals(prev => prev.filter(d => d._id !== deleteModal.id));
      fetchActiveMegaDeal(); // Refresh active mega deal
    } else {
      toast.error(res?.message);
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleToggleStatus = async (id) => {
    const res = await toggleMegaDealStatus(id);
    if (res?.success) {
      toast.success(res.message);
      fetchMegaDeals();
      fetchActiveMegaDeal(); // Refresh active mega deal
    } else {
      toast.error(res?.message);
    }
  };

  const toggleProduct = (id) => {
    setFormData(prev => {
      const exists = prev.products.includes(id);
      return {
        ...prev,
        products: exists 
          ? prev.products.filter(p => p !== id)
          : [...prev.products, id]
      };
    });
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const activeMegaDeal = megaDeals.find(d => d.isActive && new Date() >= new Date(d.startDate) && new Date() <= new Date(d.endDate));

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent uppercase tracking-tight">
             Mega Deals
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage festival mega sales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!!activeMegaDeal}
          className={`w-full md:w-auto px-8 py-4 rounded-2xl shadow-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 ${
            activeMegaDeal 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
              : 'bg-orange-600 text-white shadow-orange-100/50 hover:bg-orange-700 active:scale-95'
          }`}
        >
          <FaPlus size={14} /> Create Mega Deal
        </button>
      </div>

      {activeMegaDeal && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
             <FaTag size={16} />
          </div>
          <p className="text-orange-950 font-semibold text-sm">
             Wait: A mega deal is already active. Please deactivate it before creating a new one.
          </p>
        </div>
      )}

      {/* Mega Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {megaDeals.length === 0 && !loading && (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
               <FaTag className="text-slate-200 text-4xl" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No mega deals found</p>
          </div>
        )}
        
        {megaDeals.map(deal => {
          const isActive = deal.isActive && new Date() >= new Date(deal.startDate) && new Date() <= new Date(deal.endDate);
          
          return (
            <div key={deal._id} className={`bg-white rounded-[2rem] shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 ${
              isActive ? 'border-orange-500 shadow-orange-100' : 'border-transparent shadow-slate-200/40'
            }`}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight leading-tight">{deal.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-orange-500 animate-pulse' : deal.isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-orange-600' : deal.isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isActive ? 'Active Now' : deal.isActive ? 'Scheduled' : 'Inactive'}
                       </span>
                    </div>
                  </div>
                  <div className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-orange-100 whitespace-nowrap">
                    {deal.discountPercentage}% OFF
                  </div>
                </div>
                
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <FaCalendarAlt className="text-orange-500" />
                    <span className="uppercase tracking-wider">
                       {new Date(deal.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} — {new Date(deal.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <FaTag className="text-orange-500" />
                    <span className="uppercase tracking-widest">{deal.products.length} Products Included</span>
                  </div>
                </div>

                <div className="flex -space-x-3 overflow-hidden mb-8 pl-1">
                  {deal.products.slice(0, 5).map((prod, i) => (
                    <div key={i} className="h-10 w-10 rounded-2xl ring-4 ring-white shadow-sm overflow-hidden border border-slate-100 bg-slate-100">
                       <img
                         src={prod.mainImages?.[0]?.url}
                         alt=""
                         className="h-full w-full object-cover"
                       />
                    </div>
                  ))}
                  {deal.products.length > 5 && (
                    <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold ring-4 ring-white shadow-lg uppercase tracking-widest">
                      +{deal.products.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleStatus(deal._id)}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      deal.isActive 
                        ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-xl shadow-slate-200' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-100'
                    }`}
                  >
                    <FaPowerOff size={10} /> {deal.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: deal._id })}
                    className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-50 shrink-0"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Create New Mega Deal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Diwali Mega Sale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your mega deal..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Products</label>
                  <span className="text-sm text-orange-600 font-medium">{formData.products.length} selected</span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-80 flex flex-col">
                  <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredProducts.map(prod => (
                      <div 
                        key={prod._id}
                        onClick={() => toggleProduct(prod._id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                          formData.products.includes(prod._id)
                            ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-500'
                            : 'bg-white border-gray-100 hover:border-orange-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          formData.products.includes(prod._id)
                            ? 'bg-orange-600 border-orange-600'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {formData.products.includes(prod._id) && <FaCheck className="text-white text-xs" />}
                        </div>
                        <img 
                          src={prod.mainImages?.[0]?.url} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                          <p className="text-xs text-gray-500">₹{prod.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 shadow-md"
              >
                Create Mega Deal
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Mega Deal"
        message="Are you sure you want to delete this mega deal? All product discounts will be removed."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminMegaDeals;
