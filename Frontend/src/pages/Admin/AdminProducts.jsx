import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaBox, FaSearch, FaTrash, FaStore, FaTag } from "react-icons/fa";
import Pagination from "../../components/common/Pagination";

const AdminProducts = () => {
  const { getAdminProducts, deleteProduct } = useContext(AppContext);
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [serverTotal, setServerTotal] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    data: null,
    loading: false
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getAdminProducts({ page: currentPage, limit: itemsPerPage });
    if (res?.success) {
      setProducts(res.products);
      setTotalPages(res.pages || 1);
      setServerTotal(res.total || 0);
    } else {
      toast.error(res?.message || "Failed to fetch products");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setModal(prev => ({ ...prev, loading: true }));
    const res = await deleteProduct(modal.data._id);
    if (res?.success) {
      toast.success("Product deleted successfully");
      setProducts(prev => prev.filter(p => p._id !== modal.data._id));
    } else {
      toast.error(res?.message || "Failed to delete product");
    }
    setModal({ isOpen: false, data: null, loading: false });
  };

  const openDeleteModal = (product) => {
    setModal({ isOpen: true, data: product, loading: false });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.seller?.shopName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const StatCard = ({ label, value, color }) => {
    const colors = {
      blue: "from-blue-500 to-indigo-600 shadow-blue-100",
      green: "from-emerald-500 to-teal-600 shadow-emerald-100",
      red: "from-rose-500 to-pink-600 shadow-rose-100"
    };

    return (
      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 group transition-all">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center justify-between mt-2">
           <p className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${colors[color]} shadow-md flex items-center justify-center text-white`}>
             <FaBox size={16} />
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Inventory Page
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage all platform products</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Total Products" value={serverTotal} color="blue" />
        <StatCard label="Active Items" value={products.filter(p => p.isActive !== false).length} color="green" />
        <StatCard label="Low Stock (<10)" value={products.filter(p => p.stock < 10).length} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products or sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
          />
        </div>

        <div className="relative w-full md:w-64">
          <FaTag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaBox className="text-slate-300 text-3xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-5 text-left">Product Info</th>
                    <th className="px-6 py-5 text-left md:table-cell hidden">Category</th>
                    <th className="px-6 py-5 text-left">Seller</th>
                    <th className="px-6 py-5 text-left">Price</th>
                    <th className="px-6 py-5 text-left">Stock</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-6 border-slate-50">
                        <div className="flex items-center gap-4">
                          <img 
                            src={product.mainImages?.[0]?.url || 'https://via.placeholder.com/40'} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-100 shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm line-clamp-1">{product.name}</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">ID: {product._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 md:table-cell hidden">
                        <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-slate-700 text-sm truncate max-w-[120px]">{product.seller?.shopName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-slate-800 tracking-tight text-sm">₹{product.discountPrice.toLocaleString()}</p>
                        {product.price > product.discountPrice && (
                          <p className="text-[10px] text-slate-300 line-through font-semibold mt-0.5">₹{product.price.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                            {product.stock} Units
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          onClick={() => openDeleteModal(product)}
                          title="Delete Product"
                          className="w-8 h-8 md:w-9 md:h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all ml-auto opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${modal.data?.name}" from "${modal.data?.seller?.shopName}"? This information will be removed from the platform.`}
        confirmText="Delete Product"
        type="danger"
        loading={modal.loading}
      />
    </div>
  );
};

export default AdminProducts;
