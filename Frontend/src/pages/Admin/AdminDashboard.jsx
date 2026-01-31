import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { FaUsers, FaStore, FaShoppingCart, FaDollarSign, FaBox, FaEye } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {

    const { user, getAdminStats, getTodayStats, getRecentOrders } = useContext(AppContext)
    
    const [stats, setStats] = useState({
        users: 0,
        sellers: 0,
        orders: 0,
        revenue: {
            total: 0,
            admin: 0,
            seller: 0
        }
    })
    const [todayStats, setTodayStats] = useState({
        orders: 0,
        revenue: 0
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        
        // Fetch all data
        const statsRes = await getAdminStats()
        const todayRes = await getTodayStats()
        const ordersRes = await getRecentOrders()

        if (statsRes?.success) {
            setStats(statsRes.stats)
        }
        if (todayRes?.success) {
            setTodayStats(todayRes.today)
        }
        if (ordersRes?.success) {
            setRecentOrders(ordersRes.orders)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }
    
    return (
        <>
            <div className="space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your platform overview.</p>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Total Users */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                                <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.users}</h3>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                                <FaUsers className="text-white text-2xl" />
                            </div>
                        </div>
                        <Link 
                            to="/admin/users" 
                            className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            Manage Users <FaEye />
                        </Link>
                    </div>

                    {/* Total Sellers */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Sellers</p>
                                <h3 className="text-3xl font-bold text-purple-600 mt-2">{stats.sellers}</h3>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                                <FaStore className="text-white text-2xl" />
                            </div>
                        </div>
                        <Link 
                            to="/admin/sellers" 
                            className="text-purple-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            Manage Sellers <FaEye />
                        </Link>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                                <h3 className="text-3xl font-bold text-orange-600 mt-2">{stats.orders}</h3>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg">
                                <FaShoppingCart className="text-white text-2xl" />
                            </div>
                        </div>
                        <Link 
                            to="/admin/orders" 
                            className="text-orange-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
                        >
                            View Orders <FaEye />
                        </Link>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Commission</p>
                                <h3 className="text-3xl font-bold text-green-600 mt-2">₹{stats.revenue.admin.toLocaleString()}</h3>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                                <FaDollarSign className="text-white text-2xl" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Total Sales: ₹{stats.revenue.total.toLocaleString()} | Seller: ₹{stats.revenue.seller.toLocaleString()}
                        </p>
                    </div>

                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-4">Today's Performance</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-purple-100">Orders Today</span>
                                <span className="text-2xl font-bold">{todayStats.orders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-purple-100">Revenue Today</span>
                                <span className="text-2xl font-bold">₹{todayStats.revenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                to="/admin/products"
                                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all"
                            >
                                <FaBox className="text-purple-600" />
                                <span className="text-gray-700 font-medium">Manage Products</span>
                            </Link>
                            <Link
                                to="/admin/sellers"
                                className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-all"
                            >
                                <FaStore className="text-teal-600" />
                                <span className="text-gray-700 font-medium">Verify Sellers</span>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Recent Orders */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
                    
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No recent orders</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left p-3 text-gray-600 font-semibold">Order ID</th>
                                        <th className="text-left p-3 text-gray-600 font-semibold">Customer</th>
                                        <th className="text-left p-3 text-gray-600 font-semibold">Total</th>
                                        <th className="text-left p-3 text-gray-600 font-semibold">Status</th>
                                        <th className="text-left p-3 text-gray-600 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.slice(0, 5).map((order) => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-mono text-xs">{order.trackingId}</td>
                                            <td className="p-3">{order.user?.name}</td>
                                            <td className="p-3 font-semibold text-green-600">₹{order.totalPrice.toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}

export default AdminDashboard