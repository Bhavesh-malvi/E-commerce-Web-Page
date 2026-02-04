import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import { 
  FaBox, 
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaUser
} from 'react-icons/fa';
import { format } from 'date-fns';

const SellerReturns = () => {
  const { getSellerOrders, updateReturnStatus } = useContext(AppContext);
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, requested, approved, completed

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await getSellerOrders();
    if (res?.success) {
      // Filter only orders that have at least one item with a return status
      const ordersWithReturns = (res.orders || []).filter(order => 
        order.items.some(item => item.returnStatus && item.returnStatus !== 'none')
      );
      setOrders(ordersWithReturns);
    } else {
      toast.error('Failed to fetch returns');
    }
    setLoading(false);
  };

  const handleReturnAction = async (orderId, itemId, status) => {
    const res = await updateReturnStatus(orderId, itemId, status);
    if (res?.success) {
      toast.success(`Return request ${status}`);
      fetchOrders();
    } else {
        toast.error(res?.message || 'Update failed');
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => 
        order.items.some(item => {
            if (filter === 'requested') return item.returnStatus === 'requested';
            if (filter === 'approved') return item.returnStatus === 'approved' || item.returnStatus === 'picked';
            if (filter === 'completed') return item.returnStatus === 'refunded' || item.returnStatus === 'rejected';
            return false;
        })
    );
  };

  const getStatusBadge = (status) => {
      const styles = {
          requested: 'bg-yellow-50 text-yellow-600 border-yellow-100',
          approved: 'bg-blue-50 text-blue-600 border-blue-100',
          picked: 'bg-purple-50 text-purple-600 border-purple-100',
          refunded: 'bg-green-50 text-green-600 border-green-100',
          rejected: 'bg-red-50 text-red-600 border-red-100',
      };
      return styles[status] || 'bg-slate-50 text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-medium">Syncing return requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-tight">
            Return Management
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Handle User Return Requests</p>
        </div>
      </div>

       {/* Control Bar */}
       <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold appearance-none cursor-pointer transition-all"
            >
                <option value="all">All Returns</option>
                <option value="requested">New Requests</option>
                <option value="approved">Approved / Picked</option>
                <option value="completed">Completed (Refunded/Rejected)</option>
            </select>
        </div>
        <div className="flex-1 w-full relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search Order ID..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 text-sm font-semibold transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {getFilteredOrders().length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-purple-100/10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 text-4xl">
                    <FaUndo />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No return requests found</p>
              </div>
          ) : (
              getFilteredOrders().map(order => (
                  <div key={order._id} className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 overflow-hidden">
                      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                              <p className="font-bold text-slate-800">#{order._id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                                <FaUser className="text-slate-300" />
                                <span className="text-xs font-bold text-slate-600">{order.user?.name || 'Guest'}</span>
                          </div>
                      </div>
                      
                      <div className="p-6 grid gap-6">
                            {order.items.filter(item => item.returnStatus && item.returnStatus !== 'none').map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100">
                                            <img 
                                                src={(typeof item.image === 'string' ? item.image : item.image?.url) || 'https://via.placeholder.com/150'} 
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity} | Price: ₹{item.price}</p>
                                            <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mt-2 border ${getStatusBadge(item.returnStatus)}`}>
                                                {item.returnStatus}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Return Details */}
                                    <div className="flex-1 bg-white p-4 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Return Details</p>
                                        <p className="text-xs font-semibold text-slate-700">Reason: {item.returnReason}</p>
                                        {item.returnDescription && (
                                            <p className="text-xs text-slate-500 italic mt-1">"{item.returnDescription}"</p>
                                        )}
                                        {item.returnImages && item.returnImages.length > 0 && (
                                            <div className="flex gap-2 mt-3 overflow-x-auto">
                                                {item.returnImages.map((img, i) => (
                                                    <a key={i} href={img} target="_blank" rel="noreferrer">
                                                        <img src={img} alt="Evidence" className="w-10 h-10 rounded-lg object-cover border border-slate-100 hover:scale-110 transition-transform" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                                        {item.returnStatus === 'requested' && (
                                            <>
                                                <button 
                                                    onClick={() => handleReturnAction(order._id, item._id, 'approved')}
                                                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-700 transition"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReturnAction(order._id, item._id, 'rejected')}
                                                    className="px-4 py-2 bg-red-100 text-red-600 text-xs font-bold uppercase rounded-xl hover:bg-red-200 transition"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {item.returnStatus === 'approved' && (
                                            <button 
                                                onClick={() => handleReturnAction(order._id, item._id, 'picked')}
                                                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-purple-700 transition"
                                            >
                                                Mark Picked
                                            </button>
                                        )}
                                        {item.returnStatus === 'picked' && (
                                            <button 
                                                onClick={() => handleReturnAction(order._id, item._id, 'refunded')}
                                                className="px-4 py-2 bg-green-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-green-700 transition"
                                            >
                                                Refund & Close
                                            </button>
                                        )}
                                        {(item.returnStatus === 'refunded' || item.returnStatus === 'rejected') && (
                                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                      </div>
                  </div>
              ))
          )}
      </div>

    </div>
  );
};

export default SellerReturns;
