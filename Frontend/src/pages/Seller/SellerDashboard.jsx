import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { FaBox, FaShoppingCart, FaDollarSign, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  
  const { getSellerDashboard } = useContext(AppContext);
  
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    earning: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await getSellerDashboard();
    if (res?.success) {
      setStats(res.stats);
    }
    setLoading(false);
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
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business summary.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Products */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">{stats.products}</h3>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
              <FaBox className="text-white text-2xl" />
            </div>
          </div>
          <Link 
            to="/seller/products" 
            className="text-purple-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <FaEye />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.orders}</h3>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
              <FaShoppingCart className="text-white text-2xl" />
            </div>
          </div>
          <Link 
            to="/seller/orders" 
            className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <FaEye />
          </Link>
        </div>

        {/* Total Earnings */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">₹{stats.earning.toLocaleString()}</h3>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
              <FaDollarSign className="text-white text-2xl" />
            </div>
          </div>
          <Link 
            to="/seller/analytics" 
            className="text-green-600 text-sm font-medium mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Details <FaEye />
          </Link>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link
            to="/seller/products/add"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaBox className="text-2xl" />
            <div>
              <h3 className="font-semibold">Add New Product</h3>
              <p className="text-sm text-purple-100">List a new product for sale</p>
            </div>
          </Link>

          <Link
            to="/seller/orders"
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaShoppingCart className="text-2xl" />
            <div>
              <h3 className="font-semibold">View Orders</h3>
              <p className="text-sm text-blue-100">Manage your customer orders</p>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default SellerDashboard;
