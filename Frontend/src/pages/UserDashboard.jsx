import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "../components/UserDashboard/SidebarItem";
import DashboardHome from "../components/UserDashboard/DashboardHome";
import UpdatePassword from "../components/UserDashboard/UpdatePassword";
import Orders from "../components/UserDashboard/Orders";
import Address from "../components/UserDashboard/Address";
import Logout from "../components/UserDashboard/Logout";
import BecomeSeller from "../components/UserDashboard/BecomeSeller";
import { MdDashboard, MdLock, MdShoppingBag, MdLocationOn, MdStorefront, MdLogout } from "react-icons/md";


const UserDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

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
            setActiveTab={setActiveTab}
            icon={MdDashboard}
          />
          <SidebarItem
            label="Update Password"
            value="update-password"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={MdLock}
          />

          <SidebarItem
            label="Orders"
            value="orders"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={MdShoppingBag}
          />

          <SidebarItem
            label="Addresses"
            value="address"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={MdLocationOn}
          />
          <SidebarItem
            label="Become Seller"
            value="seller"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={MdStorefront}
          />
          

          <SidebarItem
            label="Logout"
            value="logout"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
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

        {activeTab === "seller" && <BecomeSeller />}

        {activeTab === "logout" && <Logout />}

      </div>

    </div>
  );
};

export default UserDashboard;
