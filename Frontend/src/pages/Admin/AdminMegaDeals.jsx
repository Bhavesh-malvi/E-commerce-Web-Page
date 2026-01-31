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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Mega Deals Management
          </h1>
          <p className="text-gray-600 mt-1">Create festival-style mega sale campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!!activeMegaDeal}
          className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            activeMegaDeal 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
          }`}
        >
          <FaPlus /> Create Mega Deal
        </button>
      </div>

      {activeMegaDeal && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
          <p className="text-orange-800 font-medium">
            ⚠️ Only one mega deal can be active at a time. Deactivate the current mega deal to create a new one.
          </p>
        </div>
      )}

      {/* Mega Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {megaDeals.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white/50 rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No mega deals found. Create one now!</p>
          </div>
        )}
        
        {megaDeals.map(deal => {
          const isActive = deal.isActive && new Date() >= new Date(deal.startDate) && new Date() <= new Date(deal.endDate);
          
          return (
            <div key={deal._id} className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border overflow-hidden group hover:shadow-xl transition-all ${
              isActive ? 'border-orange-300 ring-2 ring-orange-400' : 'border-gray-100'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{deal.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-1 ${
                      isActive ? 'bg-green-100 text-green-700' : deal.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isActive ? 'Active Now' : deal.isActive ? 'Scheduled' : 'Inactive'}
                    </span>
                  </div>
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                    {deal.discountPercentage}% OFF
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-400" />
                    <span>
                      {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTag className="text-orange-400" />
                    <span>{deal.products.length} Products Included</span>
                  </div>
                </div>

                <div className="flex -space-x-2 overflow-hidden mb-4 p-1">
                  {deal.products.slice(0, 5).map((prod, i) => (
                    <img
                      key={i}
                      src={prod.mainImages?.[0]?.url}
                      alt={prod.name}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                  {deal.products.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium ring-2 ring-white">
                      +{deal.products.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(deal._id)}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      deal.isActive 
                        ? 'border border-orange-200 text-orange-600 hover:bg-orange-50' 
                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <FaPowerOff size={14} /> {deal.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: deal._id })}
                    className="flex-1 py-2 border border-red-200 text red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTrash size={14} /> Delete
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
