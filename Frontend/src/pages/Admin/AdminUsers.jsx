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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <p className="text-gray-600 mt-1">Manage platform users and their access</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-blue-100">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-green-100">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => !u.isBlocked).length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-red-100">
          <p className="text-sm text-gray-600">Blocked Users</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.isBlocked).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaEnvelope size={10} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaShieldAlt className="text-purple-400" />
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal('block', user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? <FaCheck /> : <FaBan />}
                        </button>
                        <button
                          onClick={() => openModal('delete', user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
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
