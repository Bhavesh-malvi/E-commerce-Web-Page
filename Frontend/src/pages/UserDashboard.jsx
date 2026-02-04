import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "../components/UserDashboard/SidebarItem";
import DashboardHome from "../components/UserDashboard/DashboardHome";
import UpdatePassword from "../components/UserDashboard/UpdatePassword";
import Orders from "../components/UserDashboard/Orders";
import Address from "../components/UserDashboard/Address";

import Wallet from "../components/UserDashboard/Wallet";
import Logout from "../components/UserDashboard/Logout";
import BecomeSeller from "../components/UserDashboard/BecomeSeller";
import { MdDashboard, MdLock, MdShoppingBag, MdLocationOn, MdStorefront, MdLogout, MdAccountBalanceWallet } from "react-icons/md";


const UserDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === "logout") {
      setShowLogoutConfirm(true);
    } else {
      setActiveTab(tab);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setActiveTab("logout");
  };

  useEffect(() => {
    if (location.pathname === "/orders") {
      setActiveTab("orders");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);


  return (
    <div className="flex mt-6 sm:mt-6 py-6 sm:py-8 md:py-10 xl:px-30 w-full sm:w-[95%] md:w-[90%] mx-auto ">

      {/* Sidebar - Icon only on mobile, Icon+Text on md+ - STICKY */}
      <div className="w-16 md:w-64 bg-white border-r flex-shrink-0 sticky top-20 sm:top-24 self-start h-fit">

        <h2 className="text-xl font-bold p-3 md:p-5 text-[#787878] text-center md:text-left border-b">
          <span className="hidden md:inline">My Account</span>
          <span className="md:hidden text-sm">Me</span>
        </h2>

        <ul className="space-y-1 px-2 py-4">

          <SidebarItem
            label="Dashboard"
            value="dashboard"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdDashboard}
          />
          <SidebarItem
            label="Update Password"
            value="update-password"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdLock}
          />

          <SidebarItem
            label="Orders"
            value="orders"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdShoppingBag}
          />

          <SidebarItem
            label="My Wallet"
            value="wallet"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdAccountBalanceWallet}
          />

          <SidebarItem
            label="Addresses"
            value="address"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdLocationOn}
          />
          <SidebarItem
            label="Become Seller"
            value="seller"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdStorefront}
          />
          

          <SidebarItem
            label="Logout"
            value="logout"
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            icon={MdLogout}
          />

        </ul>

      </div>


      {/* Right Content */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">

        {activeTab === "dashboard" && <DashboardHome />}

        {activeTab === "update-password" && <UpdatePassword />}

        {activeTab === "orders" && <Orders />}

        {activeTab === "address" && <Address />}

        {activeTab === "wallet" && <Wallet />}

        {activeTab === "seller" && <BecomeSeller />}

        {activeTab === "logout" && <Logout />}

      </div>



      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-[#FF8F9C] text-white rounded-md font-medium hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
