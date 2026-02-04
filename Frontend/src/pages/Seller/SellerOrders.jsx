import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import { 
  FaBox, 
  FaShippingFast, 
  FaCheckCircle, 
  FaFilter, 
  FaSearch, 
  FaUser, 
  FaCalendarAlt, 
  FaWallet,
  FaFileInvoice,
  FaTimesCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

const SellerOrders = () => {
  const { getSellerOrders, updateOrderStatus, updateReturnStatus, getInvoice, sendDeliveryOTP, verifyDeliveryOrder } = useContext(AppContext);
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [otpInputs, setOtpInputs] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getSellerOrders();
    if (res?.success) {
      setOrders(res.orders || []);
    } else {
      toast.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'Delivered') {
        const res = await sendDeliveryOTP(orderId);
        if(res.success) {
            toast.success("OTP sent to customer!");
             setOtpInputs(prev => ({...prev, [orderId]: { show: true, value: '' } }));
        } else {
             toast.error("Failed to send OTP");
        }
        return;
    }

    const res = await updateOrderStatus(orderId, newStatus);
    if (res?.success) {
      toast.success('Status updated successfully');
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } else {
      toast.error(res?.message || 'Update failed');
    }
  };

  const handleVerifyOTP = async (orderId) => {
      const otp = otpInputs[orderId]?.value;
      if(!otp) return toast.error("Enter OTP");

      const res = await verifyDeliveryOrder(orderId, otp);
      if(res.success) {
          toast.success("Order Delivered Successfully! 🎉");
          setOtpInputs(prev => ({...prev, [orderId]: { show: false, value: '' } }));
          fetchOrders();
      } else {
          toast.error(res.message || "Invalid OTP");
      }
  };

  const downloadInvoice = async (orderId) => {
      const res = await getInvoice(orderId);
      if(res.success) {
          const win = window.open(res.url, '_blank');
          if (win) {
              setTimeout(() => {
                  window.URL.revokeObjectURL(res.url);
              }, 100);
          }
      } else {
          toast.error("Failed to get invoice");
      }
  };

  const filteredOrders = orders.filter(order => 
    !statusFilter || order.orderStatus === statusFilter
  );

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      processing: 'bg-blue-50 text-blue-600 border-blue-100',
      packed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      shipped: 'bg-purple-50 text-purple-600 border-purple-100',
      'out for delivery': 'bg-orange-50 text-orange-600 border-orange-100',
      delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    return styles[status?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaBox />,
      processing: <FaBox />,
      packed: <FaBox />,
      shipped: <FaShippingFast />,
      'out for delivery': <FaShippingFast />,
      delivered: <FaCheckCircle />,
      cancelled: <FaTimesCircle />
    };
    return icons[status?.toLowerCase()] || <FaBox />;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-medium">Syncing orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-tight">
            Customer Orders
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Track & Handle Shipments</p>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Processing" count={orders.filter(o => o.orderStatus === 'Processing').length} color="blue" />
        <StatItem label="Shipped" count={orders.filter(o => o.orderStatus === 'Shipped').length} color="purple" />
        <StatItem label="Completed" count={orders.filter(o => o.orderStatus === 'Delivered').length} color="green" />
        <StatItem label="Cancelled" count={orders.filter(o => o.orderStatus === 'Cancelled').length} color="red" />
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold appearance-none cursor-pointer transition-all"
            >
                <option value="">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        <div className="flex-1 w-full relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search by ID or Customer..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all"
            />
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-purple-100/10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 text-4xl">
                <FaBox />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No orders currently</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 overflow-hidden group hover:border-purple-200 transition-all">
              
              {/* Card Top Section */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-purple-600 text-xl">
                        <FaBox />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Order #{order._id?.slice(-8)}</h3>
                            <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(order.orderStatus)}`}>
                                {getStatusIcon(order.orderStatus)}
                                {order.orderStatus}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                <FaCalendarAlt size={10} />
                                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                             </div>
                             {(order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' || order.orderStatus === 'Out for Delivery') && (
                                <button 
                                    onClick={() => downloadInvoice(order._id)}
                                    className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold uppercase tracking-wider hover:underline"
                                >
                                    <FaFileInvoice size={10} />
                                    Invoice
                                </button>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
                    <span className="text-2xl font-bold text-purple-600 tracking-tight">₹{order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Card Middle: Items & User */}
              <div className="px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-50">
                
                {/* Items */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Order Items ({order.items?.length})</p>
                  <div className="flex flex-wrap gap-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[200px]">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-50">
                           <img 
                             src={(typeof item.image === 'string' ? item.image : item.image?.url) || 'https://via.placeholder.com/150'} 
                             alt={item.name} 
                             className="w-full h-full object-cover" 
                           />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px] line-clamp-1">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="lg:border-l border-slate-50 lg:pl-8">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Details</p>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                        <FaUser size={14} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-[11px]">{order.user?.name || 'Guest User'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 underline">{order.user?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Bottom: OTP & Actions */}
              <div className="px-6 md:px-8 py-6 bg-slate-50/20 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* OTP Verification UI */}
                {otpInputs[order._id]?.show ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-black text-purple-600 uppercase">Input OTP:</span>
                        <input 
                            type="text" 
                            placeholder="...."
                            className="bg-transparent border-none focus:ring-0 p-0 w-16 text-center tracking-[0.3em] font-black text-purple-700"
                            maxLength={4}
                            value={otpInputs[order._id]?.value}
                            onChange={(e) => setOtpInputs(prev => ({...prev, [order._id]: { ...prev[order._id], value: e.target.value } }))}
                        />
                    </div>
                    <button 
                        onClick={() => handleVerifyOTP(order._id)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
                    >
                        Mark as Delivered
                    </button>
                    <button 
                         onClick={() => setOtpInputs(prev => ({...prev, [order._id]: { ...prev[order._id], show: false } }))}
                         className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                    >
                        Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Standard Handling Procedure
                  </p>
                )}

                {/* Status Update Dropdown */}
                {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                  <div className="relative w-full md:w-64">
                    <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm"
                    >
                        <option value="Processing">Update: Processing</option>
                        <option value="Packed">Update: Packed</option>
                        <option value="Shipped">Update: Shipped</option>
                        <option value="Out for Delivery">Update: Out for Delivery</option>
                        <option value="Delivered">Update: Delivered (OTP)</option>
                        <option value="Cancelled">Update: Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, count, color }) => {
    const colors = {
        blue: "from-blue-500 to-indigo-600 shadow-blue-100/50 text-blue-100",
        purple: "from-purple-500 to-pink-600 shadow-purple-100/50 text-purple-100",
        green: "from-emerald-500 to-teal-600 shadow-emerald-100/50 text-emerald-100",
        red: "from-rose-500 to-pink-600 shadow-rose-100/50 text-rose-100"
    };

    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-50 p-6 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{count}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
                <FaBox size={14} />
            </div>
        </div>
    );
};

export default SellerOrders;
