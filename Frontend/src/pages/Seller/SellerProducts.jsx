import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaBoxOpen } from 'react-icons/fa';
import Pagination from '../../components/common/Pagination';

const SellerProducts = () => {
  const { getSellerProducts, deleteProduct } = useContext(AppContext);
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getSellerProducts({ page: currentPage, limit: itemsPerPage });
    if (res?.success) {
      setProducts(res.products || []);
      setTotalPages(res.pages || 1);
    } else {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const res = await deleteProduct(deleteModal.productId);
    
    if (res?.success) {
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== deleteModal.productId));
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    } else {
      toast.error(res?.message || 'Failed to delete product');
    }
    setDeleteLoading(false);
  };

  const openDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product._id,
      productName: product.name
    });
  };

  const closeDeleteModal = () => {
    if (!deleteLoading) {
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-medium">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-tight">
            Inventory Management
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Catalog Control & Statistics</p>
        </div>
        <Link
          to="/seller/products/add"
          className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-100/50 hover:scale-[1.02] active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3"
        >
          <FaPlus /> Add New Item
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-50 p-6 flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-50 p-6 flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-50 p-6 flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock</p>
          <p className="text-xl md:text-2xl font-bold text-orange-600 mt-1">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</p>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-50 p-6 flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Out</p>
          <p className="text-xl md:text-2xl font-bold text-rose-600 mt-1">{products.filter(p => p.stock === 0).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold appearance-none cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
               <FaBoxOpen className="text-slate-200 text-4xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No items found</p>
            <Link
              to="/seller/products/add"
              className="inline-block mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Add Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="px-8 py-5 text-left">Item Info</th>
                  <th className="px-8 py-5 text-left">Category</th>
                  <th className="px-8 py-5 text-left">Pricing</th>
                  <th className="px-8 py-5 text-left">Inventory</th>
                  <th className="px-8 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-purple-50/20 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                           <img
                             src={product.mainImages?.[0]?.url || 'https://via.placeholder.com/150'}
                             alt={product.name}
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.isActive ? 'Active' : 'Archived'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                         {product.category}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-800 text-sm">₹{product.price.toLocaleString()}</span>
                         {product.discountPrice && (
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Sale: ₹{product.discountPrice.toLocaleString()}</span>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center w-24">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock:</span>
                             <span className={`text-[11px] font-bold ${
                               product.stock > 10 ? 'text-emerald-500' : product.stock > 0 ? 'text-orange-500' : 'text-rose-500'
                             }`}>{product.stock}</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${
                                 product.stock > 10 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-orange-400' : 'bg-rose-400'
                               }`}
                               style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
                             ></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/seller/products/edit/${product._id}`}
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default SellerProducts;

