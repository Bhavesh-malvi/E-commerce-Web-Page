import React, { useContext, useState } from "react";
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
  FaImage,
  FaBars,
  FaTimes
} from "react-icons/fa";

const AdminLayout = () => {
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-[60] px-4 py-3 flex justify-between items-center border-b border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ADMIN
        </h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-all"
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
        fixed h-screen w-72 bg-white border-r border-slate-100 p-6 flex flex-col justify-between z-[80] transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 outline-none'}
      `}>
        <div className="overflow-y-auto custom-scrollbar pr-2">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Admin Panel
            </h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.name || 'Administrator'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarLink to="/admin" icon={<FaHome />} label="Dashboard" active={location.pathname === '/admin'} onClick={closeSidebar} />
            
            <div className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mt-6 mb-1">Management</div>
            <SidebarLink to="/admin/users" icon={<FaUsers />} label="Users" active={isActive('/admin/users')} onClick={closeSidebar} />
            <SidebarLink to="/admin/sellers" icon={<FaStore />} label="Sellers" active={isActive('/admin/sellers')} onClick={closeSidebar} />
            <SidebarLink to="/admin/products" icon={<FaBox />} label="Inventory" active={isActive('/admin/products')} onClick={closeSidebar} />
            <SidebarLink to="/admin/orders" icon={<FaShoppingCart />} label="Orders" active={isActive('/admin/orders')} onClick={closeSidebar} />
            
            <div className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mt-6 mb-1">Marketing</div>
            <SidebarLink to="/admin/deals" icon={<FaTag />} label="Deals" active={isActive('/admin/deals')} onClick={closeSidebar} />
            <SidebarLink to="/admin/megadeals" icon={<FaTag />} label="Mega Deals" active={isActive('/admin/megadeals')} onClick={closeSidebar} color="orange" />
            <SidebarLink to="/admin/coupons" icon={<FaTicketAlt />} label="Coupons" active={isActive('/admin/coupons')} onClick={closeSidebar} />
            <SidebarLink to="/admin/banners" icon={<FaImage />} label="Banners" active={isActive('/admin/banners')} onClick={closeSidebar} />
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-50">
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

const SidebarLink = ({ to, icon, label, active, onClick, color = "blue" }) => {
  const themes = {
    blue: "bg-blue-600 text-white shadow-lg shadow-blue-100/50",
    orange: "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-100/50"
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
        active
          ? themes[color]
          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50'
      }`}
    >
      <span className={`text-lg transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </Link>
  )
}

export default AdminLayout;
