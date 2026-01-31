import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaStore, FaEnvelope, FaCheck, FaFilter, FaClock } from "react-icons/fa";

const AdminSellers = () => {
  const { getAllSellers, approveSeller } = useContext(AppContext);
  const toast = useToast();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [modal, setModal] = useState({ 
    isOpen: false, 
    data: null,
    loading: false
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    const res = await getAllSellers();
    if (res?.success) {
      setSellers(res.sellers);
    } else {
      toast.error(res?.message || "Failed to fetch sellers");
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setModal(prev => ({ ...prev, loading: true }));
    
    const res = await approveSeller(modal.data._id);
    
    if (res?.success) {
      toast.success("Seller approved successfully");
      setSellers(prev => prev.map(s => 
        s._id === modal.data._id ? { ...s, status: 'active' } : s
      ));
    } else {
      toast.error(res?.message || "Failed to approve seller");
    }

    setModal({ isOpen: false, data: null, loading: false });
  };

  const openApproveModal = (seller) => {
    setModal({ isOpen: true, data: seller, loading: false });
  };

  const filteredSellers = sellers.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

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
          Sellers Management
        </h1>
        <p className="text-gray-600 mt-1">Manage seller requests and accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-blue-100">
          <p className="text-sm text-gray-600">Total Sellers</p>
          <p className="text-2xl font-bold text-blue-600">{sellers.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-yellow-100">
          <p className="text-sm text-gray-600">Pending Requests</p>
          <p className="text-2xl font-bold text-yellow-600">
            {sellers.filter(s => s.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-green-100">
          <p className="text-sm text-gray-600">Active Sellers</p>
          <p className="text-2xl font-bold text-green-600">
            {sellers.filter(s => s.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-12 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white font-medium text-gray-700"
            >
              <option value="all">All Sellers</option>
              <option value="pending">Pending Requests</option>
              <option value="active">Active Sellers</option>
              <option value="suspended">Suspended Sellers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        {filteredSellers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStore className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600">No sellers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Seller Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Shop Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {seller.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{seller.user?.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaEnvelope size={10} />
                            {seller.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-700">
                        <FaStore className="text-purple-400" />
                        {seller.shopName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex-inline items-center gap-1 ${
                        seller.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : seller.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {seller.status === 'pending' && <FaClock className="inline mr-1 text-[10px]" />}
                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {seller.status === 'pending' && (
                        <button
                          onClick={() => openApproveModal(seller)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2 ml-auto"
                        >
                          <FaCheck size={12} /> Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleApprove}
        title="Approve Seller Request"
        message={`Are you sure you want to approve "${modal.data?.shopName}"? This will give them access to seller dashboard.`}
        confirmText="Approve Seller"
        type="success"
        loading={modal.loading}
      />
    </div>
  );
};

export default AdminSellers;
