import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { FaChartPie, FaChartBar, FaCalendarCheck } from 'react-icons/fa';

const SellerAnalytics = () => {
  const { getSellerAnalytics } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getSellerAnalytics(range);
    if (res?.success) {
      setData(res.data);
    }
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-slate-500 font-medium">Processing analytics...</p>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-tight">
            Advanced Insights
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Deep dive into your sales data</p>
        </div>
        
        <div className="flex items-center w-full xl:w-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100 h-10">
          {['week', 'month', 'year'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 xl:flex-none px-6 h-full rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                range === r 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products Performance */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaChartBar />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Product Sales Volume</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topProducts || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/10 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <FaChartPie />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Order Fulfilment</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.orderStatus || []}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="_id"
                >
                  {(data?.orderStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(val) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Stock Health Summary */}
      <div className="bg-white rounded-3xl shadow-xl shadow-teal-100/10 border border-slate-100 p-8">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaCalendarCheck />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Inventory Health</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <StockDetail label="In Stock" count={data?.stockStatus.inStock} color="teal" total={data?.stats.products} />
             <StockDetail label="Low Supply" count={data?.stockStatus.lowStock} color="orange" total={data?.stats.products} />
             <StockDetail label="Out of Stock" count={data?.stockStatus.outOfStock} color="rose" total={data?.stats.products} />
          </div>
      </div>

    </div>
  );
};

const StockDetail = ({ label, count, color, total }) => {
    const percentages = Math.round((count / total) * 100) || 0;
    const colors = {
        teal: "bg-teal-500",
        orange: "bg-orange-500",
        rose: "bg-rose-500"
    };

    return (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{count} <span className="text-xs text-slate-400">Items</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{percentages}%</p>
                </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${colors[color]} rounded-full transition-all duration-500`} style={{ width: `${percentages}%` }}></div>
            </div>
        </div>
    )
}

export default SellerAnalytics;
