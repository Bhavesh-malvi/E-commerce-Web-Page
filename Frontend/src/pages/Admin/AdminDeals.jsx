import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaPlus, FaTrash, FaCalendarAlt, FaTag, FaCheck, FaSearch } from "react-icons/fa";

const AdminDeals = () => {
  const { getAllDeals, createDeal, deleteDeal, getAdminProducts } = useContext(AppContext);
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
    products: []
  });

  // Product Selection
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetchDeals();
    fetchProducts();
    // Set default dates (1st Feb to 8th Feb current year as requested)
    const year = new Date().getFullYear();
    setFormData(prev => ({
      ...prev,
      startDate: `${year}-02-01`,
      endDate: `${year}-02-08`
    }));
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    const res = await getAllDeals();
    if (res?.success) setDeals(res.deals);
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

    const res = await createDeal(formData);
    if (res?.success) {
      toast.success("Deal created successfully");
      setShowModal(false);
      fetchDeals();
      setFormData({
        title: "",
        description: "",
        discountPercentage: "",
        startDate: "",
        endDate: "",
        products: []
      });
    } else {
      toast.error(res?.message || "Failed to create deal");
    }
  };

  const handleDelete = async () => {
    const res = await deleteDeal(deleteModal.id);
    if (res?.success) {
      toast.success("Deal deleted");
      setDeals(prev => prev.filter(d => d._id !== deleteModal.id));
    } else {
      toast.error(res?.message);
    }
    setDeleteModal({ isOpen: false, id: null });
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Deals Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage special offers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <FaPlus /> Create Deal
        </button>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white/50 rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No active deals found. Create one now!</p>
          </div>
        )}
        
        {deals.map(deal => (
          <div key={deal._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden group hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{deal.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-1 ${
                    new Date(deal.startDate) > new Date() 
                      ? 'bg-blue-100 text-blue-700' 
                      : new Date(deal.endDate) < new Date() 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {new Date(deal.startDate) > new Date() 
                      ? 'Upcoming' 
                      : new Date(deal.endDate) < new Date() 
                        ? 'Expired' 
                        : 'Active'}
                  </span>
                </div>
                <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold text-sm">
                  {deal.discountPercentage}% OFF
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-400" />
                  <span>
                    {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTag className="text-purple-400" />
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

              <button
                onClick={() => setDeleteModal({ isOpen: true, id: deal._id })}
                className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash size={14} /> Delete Deal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Create New Deal</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Valentine's Special"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Products</label>
                  <span className="text-sm text-purple-600 font-medium">{formData.products.length} selected</span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-80 flex flex-col">
                  <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
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
                            ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-500'
                            : 'bg-white border-gray-100 hover:border-purple-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          formData.products.includes(prod._id)
                            ? 'bg-purple-600 border-purple-600'
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md"
              >
                Create Deal
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Deal"
        message="Are you sure you want to delete this deal? Products will revert to their original prices."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminDeals;
