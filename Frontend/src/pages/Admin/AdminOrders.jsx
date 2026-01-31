import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useToast } from "../../components/common/Toast";
import { FaBox, FaShippingFast, FaCheckCircle, FaFilter, FaSearch, FaEye } from "react-icons/fa";

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus } = useContext(AppContext);
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getAllOrders();
    if (res?.success) {
      setOrders(res.orders || []);
    } else {
      toast.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res?.success) {
      toast.success('Order status updated');
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus, orderStatus: newStatus } : order
      ));
    } else {
      toast.error(res?.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    const matchesSearch = 
      order._id.includes(search) || 
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
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
          Orders Management
        </h1>
        <p className="text-gray-600 mt-1">Track and manage all orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
          <div key={status} className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-gray-100">
            <p className="text-sm text-gray-600">{status}</p>
            <p className={`text-2xl font-bold ${
              status === 'Delivered' ? 'text-green-600' : 
              status === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {orders.filter(o => o.orderStatus === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="relative w-full md:w-48">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">All Status</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">
                      #{order.trackingId || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{order.user?.name}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' ? (
                        <button
                          onClick={() => {
                              if(window.confirm('Are you sure you want to cancel this order?')) {
                                  handleStatusUpdate(order._id, 'Cancelled');
                              }
                          }}
                          className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-100 transition-colors font-medium"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
