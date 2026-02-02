import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import { AppContext } from "./context/AppContext";

import Popup from "./UI/Popup";
import Auth from "./components/Auth";
import ScrollToTop from "./components/ScrollToTop";

import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import SellerLayout from "./layout/SellerLayout";
import AdminRoute from "./Routes/AdminRoute";
import SellerRoute from "./Routes/SellerRoute";


import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetails from "./pages/ProductDetails";
import Blog from "./pages/Blog";
import HotOffers from "./pages/HotOffers";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import UserRoute from "./Routes/UserRoute";
import AdminSellers from "./pages/Admin/AdminSellers";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Verify from "./pages/Verify";

// Seller Pages
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerProducts from "./pages/Seller/SellerProducts";
import AddProduct from "./pages/Seller/AddProduct";
import EditProduct from "./pages/Seller/EditProduct";
import SellerOrders from "./pages/Seller/SellerOrders";
import SellerAnalytics from "./pages/Seller/SellerAnalytics";
import SellerProfile from "./pages/Seller/SellerProfile";

// Admin Pages
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminDeals from "./pages/Admin/AdminDeals";
import AdminMegaDeals from "./pages/Admin/AdminMegaDeals";
import AdminCoupons from "./pages/Admin/AdminCoupons";
import AdminBanners from "./pages/Admin/AdminBanners";


import TrackOrder from "./pages/TrackOrder";
import DeliveryUpdate from "./pages/Delivery/DeliveryUpdate";

import ResetPassword from "./pages/ResetPassword";

const App = () => {

  const { open, authLoading  } = useContext(AppContext);


  if (authLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      
      <ScrollToTop />
      {open && <Auth />}


      <Routes>
        {/* ================= USER WEBSITE ================= */}
          <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/categoryPage/:category" element={<Category />} />

          <Route path="/categoryPage/:gender/:category" element={<Category />} />

          <Route path="/productDetails/:id/:category" element={<ProductDetails />}/>

          <Route path="/blog" element={<Blog />} />

          <Route path="/hotOffer" element={<HotOffers />} />

          <Route path="/reset/:token" element={<ResetPassword />} />

          <Route path="/profile" element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } />

          <Route path="/orders" element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } />

          <Route path="/wishlist" element={
            <UserRoute>
              <Wishlist />
            </UserRoute>
          } />

          <Route path="/cart" element={
            <UserRoute>
              <Cart />
            </UserRoute>
          } />

          <Route path="/checkout" element={
            <UserRoute>
              <Checkout />
            </UserRoute>
          } />


          <Route path="/verify" element={<Verify />} />

           {/* Advanced Tracking */}
           <Route path="/track-order" element={<TrackOrder />} />
           <Route path="/delivery/update/:trackingId" element={<DeliveryUpdate />} />

        </Route>


        {/* ================= SELLER PANEL ================= */}
        <Route path="/seller"
          element={
            <SellerRoute>
              <SellerLayout />
            </SellerRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>


        {/* ================= ADMIN PANEL ================= */}
        <Route path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="megadeals" element={<AdminMegaDeals />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />

        </Route>


      </Routes>

    </div>
  );
};

export default App;
