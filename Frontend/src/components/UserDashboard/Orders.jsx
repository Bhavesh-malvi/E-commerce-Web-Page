import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaBoxOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { getMyOrders, currency, convertPrice, user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getMyOrders();
    if (res?.success) {
      setOrders(res.orders);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
        <FaBoxOpen className="text-4xl text-gray-300 mb-2" />
        <h3 className="text-lg font-medium text-gray-600">No orders yet</h3>
        <p className="text-gray-400">Time to start shopping!</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">My Orders</h2>
        <p className="text-sm text-gray-500">{orders.length} total orders</p>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 group">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap gap-y-4 gap-x-10 justify-start items-center">
              <div className="flex gap-x-10 flex-wrap gap-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Order Placed</p>
                  <p className="text-xs font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Amount</p>
                  <p className="text-xs font-bold text-gray-900">
                    {currency === 'USD' ? '$' : '₹'}{convertPrice(order.totalPrice)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ship To</p>
                  <p className="text-xs font-semibold text-[#FF8F9C] hover:underline cursor-pointer">{order.shippingAddress?.name || 'You'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Payment</p>
                  <p className="text-xs font-semibold text-gray-700 uppercase">{order.paymentInfo?.method || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 bg-white flex flex-col md:flex-row gap-8">
              <div className="flex-1 min-w-0 divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-5 py-4 first:pt-0 last:pb-0 group/item">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover/item:border-[#FF8F9C]/30 transition-colors">
                      <img 
                        src={item.image || item.product?.mainImages?.[0]?.url || 'https://via.placeholder.com/80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 truncate hover:text-[#FF8F9C] transition-colors cursor-pointer text-base">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                           <p className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                             Qty: {item.quantity}
                           </p>
                           <p className="text-sm font-bold text-gray-900">
                             {currency === 'USD' ? '$' : '₹'}{convertPrice(item.price)}
                           </p>
                        </div>
                      </div>
                       {user?.role === 'user' && order.orderStatus === 'Delivered' && (
                        <button className="text-xs text-[#FF8F9C] font-bold hover:text-[#ff7a8a] mt-2 flex items-center gap-1.5 w-fit bg-[#FF8F9C]/10 px-3 py-1 rounded-full hover:bg-[#FF8F9C]/20 transition-all">
                          <span>Write a Product Review</span>
                          <span className="text-base text-[#FF8F9C]/60">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Sidebar */}
              <div className="w-full md:w-52 flex flex-col md:items-end justify-start gap-4 pt-1 border-t md:border-t-0 md:border-l border-gray-50 md:pl-8 mt-4 md:mt-0">
                <div className="flex flex-col md:items-end gap-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Order Status</p>
                  <span className={`w-fit px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase transition-colors
                    ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                      order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="flex flex-col md:items-end gap-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Identifier</p>
                  <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                
                {order.trackingId && (
                     <button 
                       onClick={() => navigate(`/track-order?id=${order.trackingId}`)}
                       className="w-full md:w-auto text-[11px] font-black text-white bg-[#FF8F9C] hover:bg-[#ff7a8a] px-5 py-2.5 rounded-xl shadow-lg shadow-[#FF8F9C]/20 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
                    >
                       TRACK PACKAGE 🚚
                    </button>
                )}
              </div>
            </div>
            
             {/* Footer - Tracking */}
             {order.trackingId && (
              <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 text-[10px] font-bold text-gray-400 flex justify-between items-center tracking-[0.1em]">
                <span className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8F9C] shadow-[0_0_10px_rgba(255,143,156,0.6)] animate-pulse"></span>
                    TRACKING ID: <span className="text-gray-900 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-gray-100">{order.trackingId}</span>
                </span>
                <span className="text-[#FF8F9C]/30 text-lg tracking-[0.2em]">••••</span>
              </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
