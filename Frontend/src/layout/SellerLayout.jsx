import React, { useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaUser,
  FaSignOutAlt 
} from "react-icons/fa";

const SellerLayout = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useContext(AppContext);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* ================= Logout ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      
      {/* ================= Sidebar ================= */}
      <aside className="w-64 fixed h-screen bg-white/80 backdrop-blur-md shadow-xl border-r border-purple-100 p-5 flex flex-col justify-between">
        
        {/* Top Section */}
        <div>
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Seller Panel
            </h2>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            
            <Link
              to="/seller"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === '/seller'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/seller/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/seller/products')
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <FaBox className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Products</span>
            </Link>

            <Link
              to="/seller/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/seller/orders')
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <FaShoppingCart className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Orders</span>
            </Link>

            <Link
              to="/seller/analytics"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/seller/analytics')
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <FaChartLine className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Analytics</span>
            </Link>

            <Link
              to="/seller/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/seller/profile')
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-purple-700'
              }`}
            >
              <FaUser className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Profile</span>
            </Link>

          </nav>

        </div>

        {/* ================= Bottom Logout ================= */}
        <div className="pt-4 border-t border-purple-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>

      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default SellerLayout;
