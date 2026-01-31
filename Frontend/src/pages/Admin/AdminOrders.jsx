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

  const StatCard = ({ label, value, status }) => {
    const statusColors = {
      Processing: 'from-blue-500 to-indigo-600 shadow-blue-100',
      Shipped: 'from-purple-500 to-fuchsia-600 shadow-purple-100',
      Delivered: 'from-emerald-500 to-teal-600 shadow-emerald-100',
      Cancelled: 'from-rose-500 to-pink-600 shadow-rose-100'
    };

    return (
      <div className="bg-white p-5 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 group transition-all">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center justify-between mt-2">
           <p className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
           <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br ${statusColors[status]} shadow-md flex items-center justify-center text-white`}>
             <FaBox size={14} />
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
            Order History
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Track and manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
          <StatCard 
            key={status} 
            label={status} 
            value={orders.filter(o => o.orderStatus === status).length} 
            status={status} 
          />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
          />
        </div>

        <div className="relative w-full md:w-64">
          <FaFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">All Orders</option>
            <option value="Processing">In Processing</option>
            <option value="Shipped">Dispatched</option>
            <option value="Delivered">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/20 border border-slate-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaBox className="text-slate-300 text-3xl" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-5 text-left">Order ID</th>
                  <th className="px-6 py-5 text-left">Customer</th>
                  <th className="px-6 py-5 text-left md:table-cell hidden">Date</th>
                  <th className="px-6 py-5 text-left">Amount</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-6 border-slate-50">
                       <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                         #{order.trackingId || order._id.slice(-6).toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-6 font-semibold">
                      <div className="min-w-0">
                        <p className="text-slate-800 text-sm truncate">{order.user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-[150px]">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 md:table-cell hidden">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-6">
                       <p className="text-sm font-bold text-slate-800 tracking-tight">₹{order.totalPrice?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          order.orderStatus === 'Delivered' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' ? (
                        <button
                          onClick={() => {
                              if(window.confirm('Are you sure you want to cancel this order?')) {
                                  handleStatusUpdate(order._id, 'Cancelled');
                              }
                          }}
                          className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                        >
                          Cancel
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center ml-auto border border-slate-100 shrink-0">
                           <FaCheckCircle className="text-slate-300" size={14} />
                        </div>
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
