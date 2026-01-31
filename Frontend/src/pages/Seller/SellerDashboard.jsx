import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaEye, 
  FaChartLine, 
  FaArrowUp, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';

const SellerDashboard = () => {
  const { getSellerAnalytics } = useContext(AppContext);
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const res = await getSellerAnalytics(range);
    if (res?.success) {
      setAnalytics(res.data);
    }
    setLoading(false);
  };

  const formatCurrency = (val) => `₹${val.toLocaleString()}`;

  if (loading && !analytics) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-medium">Syncing your shop data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      
      {/* Header & Range Selector */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-tight">
            Shop Overview
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Track your business performance</p>
        </div>
        
        <div className="flex items-center w-full xl:w-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
          {['week', 'month', 'year'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                range === r 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(analytics?.stats.revenue || 0)} 
          icon={<FaDollarSign />} 
          color="green" 
          trend="+12%"
        />
        <StatCard 
          title="Net Earning" 
          value={formatCurrency(analytics?.stats.earning || 0)} 
          icon={<FaChartLine />} 
          color="purple" 
          trend="+8%"
        />
        <StatCard 
          title="Orders Sold" 
          value={analytics?.stats.sold || 0} 
          icon={<FaShoppingCart />} 
          color="blue" 
          trend="+15%"
        />
        <StatCard 
          title="Active Products" 
          value={analytics?.stats.products || 0} 
          icon={<FaBox />} 
          color="pink" 
          trend="+2"
        />
      </div>

      {/* Revenue Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Earnings & Revenue</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Earning</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.timeSeries || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} 
                  tickFormatter={(val) => range === 'year' ? val : val.split('-').slice(1).join('/')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`₹${value}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{r: 3, fill: '#8b5cf6'}} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="earning" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorEarning)" dot={{r: 3, fill: '#ec4899'}} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status & Order Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Stock Status</h3>
            <div className="space-y-4">
              <StockItem 
                label="In Stock" 
                count={analytics?.stockStatus.inStock || 0} 
                color="green" 
                icon={<FaCheckCircle />} 
              />
              <StockItem 
                label="Low Stock" 
                count={analytics?.stockStatus.lowStock || 0} 
                color="orange" 
                icon={<FaExclamationTriangle />} 
              />
              <StockItem 
                label="Out of Stock" 
                count={analytics?.stockStatus.outOfStock || 0} 
                color="red" 
                icon={<FaExclamationTriangle />} 
              />
            </div>
            <Link to="/seller/products" className="mt-6 block text-center py-3 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
              Manage Inventory
            </Link>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/seller/products/add" className="p-4 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-all flex flex-col items-center gap-2">
                <FaPlus size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Add Product</span>
              </Link>
              <Link to="/seller/orders" className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all flex flex-col items-center gap-2">
                <FaShoppingCart size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Best Selling & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Best Selling Products</h3>
            <Link to="/seller/products" className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {analytics?.topProducts.length > 0 ? (
              analytics.topProducts.map((prod, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-50">
                      <img 
                        src={(typeof prod.image === 'string' ? prod.image : prod.image?.url) || 'https://via.placeholder.com/150'} 
                        alt={prod.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{prod.sold} Units Sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{prod.revenue?.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">No data available</div>
            )}
          </div>
        </div>

        {/* Order Status Table */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Count</th>
                  <th className="pb-3 px-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics?.orderStatus.map((status, index) => (
                  <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2">
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${
                           status._id === 'Delivered' ? 'bg-green-500' :
                           status._id === 'Pending' ? 'bg-orange-500' :
                           status._id === 'Cancelled' ? 'bg-red-500' :
                           'bg-blue-500'
                         }`}></div>
                         <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">{status._id}</span>
                       </div>
                    </td>
                    <td className="py-5 px-2 text-right">
                       <span className="font-bold text-slate-900 text-sm">{status.count}</span>
                    </td>
                    <td className="py-5 px-2 text-right">
                       <span className="text-slate-400 text-[10px] font-bold uppercase">Stable</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => {
  const colors = {
    green: "from-emerald-500 to-teal-600 shadow-emerald-100",
    purple: "from-purple-500 to-indigo-600 shadow-purple-100",
    blue: "from-blue-500 to-cyan-600 shadow-blue-100",
    pink: "from-pink-500 to-rose-600 shadow-rose-100"
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-purple-100/20 border border-slate-100 p-6 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5">
              <FaArrowUp size={8} /> {trend}
            </span>
            <span className="text-slate-400 text-[9px] font-semibold uppercase">Growth</span>
          </div>
        </div>
        <div className={`bg-gradient-to-br ${colors[color]} w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shadow-md flex items-center justify-center`}>
          <div className="text-white text-base md:text-lg">{icon}</div>
        </div>
      </div>
    </div>
  );
};

const StockItem = ({ label, count, color, icon }) => {
  const colorMap = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <div className="text-lg">{icon}</div>
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
};

export default SellerDashboard;
