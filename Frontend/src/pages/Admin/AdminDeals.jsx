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
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Deals Management
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage special offers and discounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100/50 hover:bg-blue-700 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <FaPlus size={14} /> Create Deal
        </button>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {deals.length === 0 && !loading && (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
               <FaTag className="text-slate-200 text-4xl" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No deals found</p>
          </div>
        )}
        
        {deals.map(deal => (
          <div key={deal._id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight leading-tight">{deal.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      new Date(deal.startDate) > new Date() ? 'bg-blue-500' : 
                      new Date(deal.endDate) < new Date() ? 'bg-slate-400' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      new Date(deal.startDate) > new Date() ? 'text-blue-600' : 
                      new Date(deal.endDate) < new Date() ? 'text-slate-400' : 'text-green-600'
                    }`}>
                      {new Date(deal.startDate) > new Date() ? 'Upcoming' : 
                       new Date(deal.endDate) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-100 whitespace-nowrap">
                  {deal.discountPercentage}% OFF
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                  <FaCalendarAlt className="text-blue-500" />
                  <span className="uppercase tracking-wider">
                    {new Date(deal.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} — {new Date(deal.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                  <FaTag className="text-blue-500" />
                  <span className="uppercase tracking-widest">{deal.products.length} Product(s) Included</span>
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

              <button
                onClick={() => setDeleteModal({ isOpen: true, id: deal._id })}
                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-50"
              >
                Delete Deal
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
