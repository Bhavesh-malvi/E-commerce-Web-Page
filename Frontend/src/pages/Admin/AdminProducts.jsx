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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Products Management
        </h1>
        <p className="text-gray-600 mt-1">Manage all products across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-blue-100">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{serverTotal}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-green-100">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.isActive !== false).length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-red-100">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock < 10).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Seller</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.mainImages?.[0]?.url || 'https://via.placeholder.com/40'} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">ID: {product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaTag size={10} className="text-purple-400" />
                          {product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaStore className="text-gray-400" />
                          <span className="font-medium">{product.seller?.shopName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">₹{product.discountPrice.toLocaleString()}</p>
                        {product.discountPrice && (
                          <p className="text-xs text-green-600 line-through">₹{product.price.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock} Units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
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
