import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import { FaBox, FaShippingFast, FaCheckCircle, FaFilter } from 'react-icons/fa';

const SellerOrders = () => {
  const { getSellerOrders, updateOrderStatus, getInvoice, sendDeliveryOTP, verifyDeliveryOrder } = useContext(AppContext);
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
        // Trigger OTP flow
        const res = await sendDeliveryOTP(orderId);
        if(res.success) {
            toast.success("OTP sent to customer!");
             setOtpInputs(prev => ({...prev, [orderId]: { show: true, value: '' } }));
        } else {
             toast.error("Failed to send OTP");
        }
        return; // Don't update status yet
    }

    const res = await updateOrderStatus(orderId, newStatus);
    if (res?.success) {
      toast.success('Order status updated');
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } else {
      toast.error(res?.message || 'Failed to update status');
    }
  };

  const handleVerifyOTP = async (orderId) => {
      const otp = otpInputs[orderId]?.value;
      if(!otp) return toast.error("Enter OTP");

      const res = await verifyDeliveryOrder(orderId, otp);
      if(res.success) {
          toast.success("Order Delivered Successfully! 🎉");
          setOtpInputs(prev => ({...prev, [orderId]: { show: false, value: '' } }));
          // Update local state
           setOrders(prev => prev.map(order => 
            order._id === orderId ? { ...order, orderStatus: 'Delivered', order: 'Delivered' } : order
          ));
          fetchOrders(); // Refresh to be safe
      } else {
          toast.error(res.message || "Invalid OTP");
      }
  };

  const downloadInvoice = async (orderId) => {
      const res = await getInvoice(orderId);
      if(res.success) {
          window.open(res.url, '_blank');
      } else {
          toast.error("Failed to get invoice");
      }
  };

  const filteredOrders = orders.filter(order => 
    !statusFilter || order.orderStatus === statusFilter
  );
  
  // ... (keep getStatusColor/Icon same) ...
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      packed: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-purple-100 text-purple-700',
      'out for delivery': 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaBox />,
      processing: <FaBox />,
      packed: <FaBox />,
      shipped: <FaShippingFast />,
      'out for delivery': <FaShippingFast />,
      delivered: <FaCheckCircle />,
      cancelled: <FaBox />
    };
    return icons[status?.toLowerCase()] || <FaBox />;
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
        <p className="text-gray-600 mt-1">Manage and track your orders</p>
      </div>

      {/* Stats - same */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-yellow-100">
          <p className="text-sm text-gray-600">Processing</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.orderStatus === 'Processing').length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-blue-100">
          <p className="text-sm text-gray-600">Shipped</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.orderStatus === 'Shipped').length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-purple-100">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter(o => o.orderStatus === 'Delivered').length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow p-4 border border-red-100">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {orders.filter(o => o.orderStatus === 'Cancelled').length}
          </p>
        </div>
      </div>

      {/* Filter - same */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="relative">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Orders</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-12 border border-purple-100 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all">
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order._id?.slice(-8)}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   {/* INVOICE BUTTON */}
                  {(order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' || order.orderStatus === 'Out for Delivery') && (
                      <button 
                        onClick={() => downloadInvoice(order._id)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                      >
                          Invoice 📄
                      </button>
                  )}
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Customer:</p>
                <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
              </div>
              
              {/* OTP Input Section */}
              {otpInputs[order._id]?.show && (
                  <div className="border-t border-purple-100 bg-purple-50 p-4 mb-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm text-purple-700 font-medium">Ask Customer for OTP:</p>
                      <input 
                        type="text" 
                        placeholder="Enter 4-digit OTP"
                        className="border border-purple-300 rounded px-2 py-1 w-32 text-center tracking-widest"
                        maxLength={4}
                        value={otpInputs[order._id]?.value}
                        onChange={(e) => setOtpInputs(prev => ({...prev, [order._id]: { ...prev[order._id], value: e.target.value } }))}
                      />
                      <button 
                        onClick={() => handleVerifyOTP(order._id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                          Verify & Deliver
                      </button>
                  </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{order.totalPrice?.toLocaleString()}</p>
                </div>

                {/* Status Update */}
                {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered (OTP Required)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
