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

  const StatItem = ({ label, value, color }) => {
    const colors = {
      blue: "from-blue-500 to-indigo-600 shadow-blue-100",
      yellow: "from-amber-400 to-orange-500 shadow-amber-100",
      green: "from-emerald-500 to-teal-600 shadow-emerald-100"
    };

    return (
      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center justify-between group transition-all">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${colors[color]} shadow-md flex items-center justify-center text-white`}>
          <FaStore size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            Seller Partners
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage vendor profiles and status</p>
        </div>
        <div className="flex items-center w-full xl:w-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
           {['all', 'pending', 'active'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                 filter === f 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                 : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {f} Sellers
             </button>
           ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatItem label="Total Partners" value={sellers.length} color="blue" />
        <StatItem label="Pending" value={sellers.filter(s => s.status === 'pending').length} color="yellow" />
        <StatItem label="Verified" value={sellers.filter(s => s.status === 'active').length} color="green" />
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 overflow-hidden">
        {filteredSellers.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaStore className="text-slate-300 text-3xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No sellers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">Seller Info</th>
                  <th className="px-6 py-5 text-left md:table-cell hidden">Shop Name</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-left md:table-cell hidden">Registered</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSellers.map((seller) => (
                  <tr key={seller._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-100 shrink-0">
                          {seller.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{seller.user?.name}</p>
                          <div className="flex flex-col md:hidden">
                             <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">{seller.shopName}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 max-w-[150px] md:max-w-none">
                            <FaEnvelope size={10} className="shrink-0" />
                            <span className="truncate">{seller.user?.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 md:table-cell hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 text-sm">{seller.shopName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          seller.status === 'active' ? 'bg-green-500' : 
                          seller.status === 'pending' ? 'bg-amber-400 pulse' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          seller.status === 'active' ? 'text-green-600' : 
                          seller.status === 'pending' ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {seller.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest md:table-cell hidden">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6 text-right">
                      {seller.status === 'pending' ? (
                        <button
                          onClick={() => openApproveModal(seller)}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2"
                        >
                          <FaCheck size={10} /> Approve
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Verified</span>
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
