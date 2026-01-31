import React, { useContext, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

const SellerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      
      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-[60] px-4 py-3 flex justify-between items-center border-b border-purple-100 shadow-sm">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SELLER
        </h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-purple-50 text-purple-600 rounded-lg active:scale-95 transition-all"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className={`
        fixed h-screen w-72 bg-white/80 backdrop-blur-md border-r border-purple-100 p-6 flex flex-col justify-between z-[80] transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 outline-none'}
      `}>
        <div className="overflow-y-auto custom-scrollbar pr-2">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Seller Hub
            </h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.name || 'Partner Account'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarLink to="/seller" icon={<FaHome />} label="Dashboard" active={location.pathname === '/seller'} onClick={closeSidebar} />
            
            <div className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mt-6 mb-1">Management</div>
            <SidebarLink to="/seller/products" icon={<FaBox />} label="Inventory" active={isActive('/seller/products')} onClick={closeSidebar} />
            <SidebarLink to="/seller/orders" icon={<FaShoppingCart />} label="Orders" active={isActive('/seller/orders')} onClick={closeSidebar} />
            
            <div className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mt-6 mb-1">Analytics</div>
            <SidebarLink to="/seller/analytics" icon={<FaChartLine />} label="Insights" active={isActive('/seller/analytics')} onClick={closeSidebar} />
            <SidebarLink to="/seller/profile" icon={<FaUser />} label="My Profile" active={isActive('/seller/profile')} onClick={closeSidebar} color="pink" />
          </nav>
        </div>

        <div className="pt-6 border-t border-purple-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 transition-all duration-200 font-bold text-[10px] uppercase tracking-widest"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <main className={`flex-1 min-h-screen transition-all duration-300 pt-16 lg:pt-0 lg:ml-72`}>
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

const SidebarLink = ({ to, icon, label, active, onClick, color = "purple" }) => {
  const themes = {
    purple: "bg-purple-600 text-white shadow-lg shadow-purple-100/50",
    pink: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-rose-100/50"
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
        active
          ? themes[color]
          : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/50'
      }`}
    >
      <span className={`text-lg transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </Link>
  )
}

export default SellerLayout;
