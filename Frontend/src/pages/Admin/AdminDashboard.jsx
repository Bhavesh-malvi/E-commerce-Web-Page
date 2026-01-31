import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { 
  FaUsers, 
  FaStore, 
  FaShoppingCart, 
  FaDollarSign, 
  FaBox, 
  FaEye, 
  FaChartLine, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
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
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts'
import { format } from 'date-fns'

const AdminDashboard = () => {
    const { user, getAdminStats, getAnalytics, getRecentOrders } = useContext(AppContext)
    
    const [stats, setStats] = useState({
        users: 0,
        sellers: 0,
        orders: 0,
        revenue: { total: 0, admin: 0, seller: 0 }
    })
    const [analytics, setAnalytics] = useState({
        timeSeries: [],
        growth: { users: [], sellers: [] },
        topSellers: []
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState('month') // week, month, year

    useEffect(() => {
        fetchDashboardData()
    }, [range])

    const fetchDashboardData = async () => {
        setLoading(true)
        const [statsRes, analyticsRes, ordersRes] = await Promise.all([
            getAdminStats(),
            getAnalytics(range),
            getRecentOrders()
        ])

        if (statsRes?.success) setStats(statsRes.stats)
        if (analyticsRes?.success) setAnalytics(analyticsRes)
        if (ordersRes?.success) setRecentOrders(ordersRes.orders)
        
        setLoading(false)
    }

    useEffect(() => {
        if (!loading) {
            console.log("ADMIN_STATS:", stats);
            console.log("ADMIN_ANALYTICS:", analytics);
            console.log("RECENT_ORDERS:", recentOrders);
        }
    }, [loading, stats, analytics, recentOrders]);

    const formatCurrency = (val) => `₹${val.toLocaleString()}`

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-gray-500 animate-pulse font-medium">Preparing your analytics...</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header & Range Selector */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
                        Analytics Hub
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">Platform Performance Overview</p>
                </div>
                
                <div className="flex items-center w-full xl:w-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                    {['week', 'month', 'year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                range === r 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    title="Gross Revenue" 
                    value={formatCurrency(stats.revenue.total)} 
                    icon={<FaDollarSign />} 
                    color="green" 
                    trend="+12.5%" 
                />
                <StatCard 
                    title="Platform Income" 
                    value={formatCurrency(stats.revenue.admin)} 
                    icon={<FaChartLine />} 
                    color="purple" 
                    trend="+8.2%" 
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats.orders} 
                    icon={<FaShoppingCart />} 
                    color="blue" 
                    trend="+15.3%" 
                />
                <StatCard 
                    title="Active Users" 
                    value={stats.users} 
                    icon={<FaUsers />} 
                    color="pink" 
                    trend="+5.1%" 
                />
            </div>

            {/* Main Multi-series Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/10 border border-slate-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Revenue Trends</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Income</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.timeSeries}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="commission" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorComm)" dot={{r: 3, fill: '#ec4899'}} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Sellers Chart */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/10 border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top Sellers</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.topSellers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                  dataKey="shopName" 
                                  type="category" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  width={80} 
                                  tick={{fontSize: 9, fill: '#475569', fontWeight: 700}} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="commission" radius={[4, 4, 4, 4]} barSize={20}>
                                    {analytics.topSellers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#ec4899'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                        <Link to="/admin/sellers" className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">
                            View Details
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Order Volume & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Count Chart */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/10 border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Order Volume</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} 
                                    tickFormatter={(val) => range === 'year' ? val : val.split('-').slice(2).join('/')}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="orderCount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-100/10 border border-slate-100 p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                        <Link to="/admin/orders" className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead>
                                <tr className="text-left text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-3 px-2">Status</th>
                                    <th className="pb-3 px-2">Customer</th>
                                    <th className="pb-3 px-2">Date</th>
                                    <th className="pb-3 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-slate-700 font-semibold text-xs truncate max-w-[120px]">{order.user?.name}</td>
                                        <td className="py-4 px-2 text-slate-400 text-[10px] font-bold uppercase">{format(new Date(order.createdAt), 'MMM dd')}</td>
                                        <td className="py-4 px-2 text-right font-bold text-slate-900 text-xs">₹{order.totalPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ title, value, icon, color, trend }) => {
    const colors = {
        green: "from-emerald-500 to-teal-600 shadow-emerald-100",
        purple: "from-purple-500 to-indigo-600 shadow-purple-100",
        blue: "from-blue-500 to-cyan-600 shadow-blue-100",
        pink: "from-pink-500 to-rose-600 shadow-rose-100"
    }

    return (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-blue-100/20 border border-slate-100 p-6 transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5">
                            <FaArrowUp size={8} /> {trend}
                        </span>
                        <span className="text-slate-400 text-[9px] font-semibold uppercase">Monthly</span>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${colors[color]} w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shadow-md flex items-center justify-center`}>
                    <div className="text-white text-base md:text-lg">{icon}</div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
