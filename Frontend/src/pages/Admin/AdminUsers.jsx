import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaTrash, FaBan, FaCheck, FaUser, FaEnvelope, FaShieldAlt } from "react-icons/fa";

const AdminUsers = () => {
  const { getAllUsers, blockUser, deleteUser } = useContext(AppContext);
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: null, // 'block' or 'delete'
    data: null,
    loading: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    if (res?.success) {
      setUsers(res.users);
    } else {
      toast.error(res?.message || "Failed to fetch users");
    }
    setLoading(false);
  };

  const handleAction = async () => {
    setModal(prev => ({ ...prev, loading: true }));
    
    let res;
    if (modal.type === 'delete') {
      res = await deleteUser(modal.data._id);
      if (res?.success) {
        toast.success("User deleted successfully");
        setUsers(prev => prev.filter(u => u._id !== modal.data._id));
      } else {
        toast.error(res?.message || "Failed to delete user");
      }
    } else if (modal.type === 'block') {
      res = await blockUser(modal.data._id);
      if (res?.success) {
        toast.success(res.message);
        setUsers(prev => prev.map(u => 
          u._id === modal.data._id ? { ...u, isBlocked: !u.isBlocked } : u
        ));
      } else {
        toast.error(res?.message || "Failed to update user status");
      }
    }

    setModal({ isOpen: false, type: null, data: null, loading: false });
  };

  const openModal = (type, user) => {
    setModal({ isOpen: true, type, data: user, loading: false });
  };

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
      green: "from-emerald-500 to-teal-600 shadow-emerald-100",
      red: "from-rose-500 to-pink-600 shadow-rose-100"
    };

    return (
      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center justify-between group transition-all">
        <div>
          <p className="text-[10px] font-bold text-slate-400 upper-tracking-widest">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${colors[color]} shadow-md flex items-center justify-center text-white`}>
          <FaUser size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
            User Accounts
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Manage customer access and status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatItem label="Total Users" value={users.length} color="blue" />
        <StatItem label="Active" value={users.filter(u => !u.isBlocked).length} color="green" />
        <StatItem label="Blocked" value={users.filter(u => u.isBlocked).length} color="red" />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaUser className="text-slate-300 text-3xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">User Info</th>
                  <th className="px-6 py-5 text-left">Role</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-left md:table-cell hidden">Joined</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-100 shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 min-w-0">
                            <FaEnvelope size={10} className="shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-semibold">
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                         {user.role}
                       </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${user.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 md:table-cell hidden">
                       <p className="text-xs font-semibold text-slate-400 uppercase">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-2 md:gap-3">
                        <button
                          onClick={() => openModal('block', user)}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all ${
                            user.isBlocked 
                              ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' 
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                          }`}
                        >
                          {user.isBlocked ? <FaCheck size={14} /> : <FaBan size={14} />}
                        </button>
                        <button
                          onClick={() => openModal('delete', user)}
                          title="Delete"
                          className="w-8 h-8 md:w-9 md:h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
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
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleAction}
        title={modal.type === 'delete' ? 'Delete User' : modal.data?.isBlocked ? 'Unblock User' : 'Block User'}
        message={
          modal.type === 'delete' 
            ? `Are you sure you want to delete "${modal.data?.name}"? This action cannot be undone.`
            : `Are you sure you want to ${modal.data?.isBlocked ? 'unblock' : 'block'} "${modal.data?.name}"?`
        }
        confirmText={
          modal.type === 'delete' ? 'Delete' : modal.data?.isBlocked ? 'Unblock' : 'Block'
        }
        type={
          modal.type === 'delete' ? 'danger' : modal.data?.isBlocked ? 'success' : 'warning'
        }
        loading={modal.loading}
      />
    </div>
  );
};

export default AdminUsers;
