import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import SideStatus from "../UI/SideStatus";
import SupportChat from "../components/SupportChat";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Popup from "../UI/Popup";
import { Navigate } from "react-router-dom";
import Preloader from "../components/common/Preloader";


const MainLayout = () => {
  const { isShow, user, authLoading } = useContext(AppContext);

  // Don't render MainLayout while auth is loading
  if (authLoading) {
    return <Preloader />;
  }

  // Redirect admins to admin panel
  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Redirect sellers to seller panel
  if (user && user.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  return (
    <div className="relative">
      {isShow && <Popup />}

      <Header />
      <NavBar />

      <div className="px-0 sm:px-4 md:px-8 lg:px-16 xl:px-25 min-h-screen">
        <Outlet />
      </div>

      <Footer />
      <SideStatus />
      <SupportChat />

    </div>
  );
};

export default MainLayout;
