import React, { useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { 
  FaHome, 
  FaUsers, 
  FaStore, 
  FaBox, 
  FaShoppingCart,
  FaTag,
  FaTicketAlt,
  FaSignOutAlt,
  FaImage
} from "react-icons/fa";

const AdminLayout = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useContext(AppContext);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');


  /* ================= Logout ================= */

  const handleLogout = () => {

    // Remove token
    localStorage.removeItem("token");

    // Clear user state
    setUser(null);

    // Redirect to home
    navigate("/");

  };


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

      {/* ================= Sidebar ================= */}
      <aside className="fixed h-screen w-64 bg-white/80 backdrop-blur-md shadow-xl border-r border-blue-100 p-5 flex flex-col justify-between">

        {/* Top */}
        <div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
          </div>

          <nav className="space-y-2">

            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/admin/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/users')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaUsers className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Users</span>
            </Link>

            <Link
              to="/admin/sellers"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/sellers')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaStore className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sellers</span>
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/products')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaBox className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Products</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/orders')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaShoppingCart className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Orders</span>
            </Link>

            <Link
              to="/admin/deals"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/deals')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaTag className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Deals</span>
            </Link>

            <Link
              to="/admin/megadeals"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/megadeals')
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:text-orange-700'
              }`}
            >
              <FaTag className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Mega Deals 🔥</span>
            </Link>

            <Link
              to="/admin/coupons"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/coupons')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaTicketAlt className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Coupons</span>
            </Link>

            <Link
              to="/admin/banners"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive('/admin/banners')
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700'
              }`}
            >
              <FaImage className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Banners</span>
            </Link>

          </nav>

        </div>


        {/* ================= Bottom Logout ================= */}
        <div className="pt-4 border-t border-blue-100">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>

        </div>

      </aside>


      {/* ================= Main ================= */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
