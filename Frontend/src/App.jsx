import React, { useContext, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import { AppContext } from "./context/AppContext";

import Auth from "./components/Auth";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./components/common/Preloader";

import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import SellerLayout from "./layout/SellerLayout";
import AdminRoute from "./Routes/AdminRoute";
import SellerRoute from "./Routes/SellerRoute";


// Lazy Load Pages
const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Blog = lazy(() => import("./pages/Blog"));
const HotOffers = lazy(() => import("./pages/HotOffers"));
const Search = lazy(() => import("./pages/Search"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Cart = lazy(() => import("./pages/Cart"));
const Verify = lazy(() => import("./pages/Verify"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const DeliveryUpdate = lazy(() => import("./pages/Delivery/DeliveryUpdate"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUsers"));
const AdminSellers = lazy(() => import("./pages/Admin/AdminSellers"));
const AdminProducts = lazy(() => import("./pages/Admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/Admin/AdminOrders"));
const AdminDeals = lazy(() => import("./pages/Admin/AdminDeals"));
const AdminMegaDeals = lazy(() => import("./pages/Admin/AdminMegaDeals"));
const AdminCoupons = lazy(() => import("./pages/Admin/AdminCoupons"));
const AdminBanners = lazy(() => import("./pages/Admin/AdminBanners"));
const UserRoute = lazy(() => import("./Routes/UserRoute"));

// Seller Pages
const SellerDashboard = lazy(() => import("./pages/Seller/SellerDashboard"));
const SellerProducts = lazy(() => import("./pages/Seller/SellerProducts"));
const AddProduct = lazy(() => import("./pages/Seller/AddProduct"));
const EditProduct = lazy(() => import("./pages/Seller/EditProduct"));
const SellerOrders = lazy(() => import("./pages/Seller/SellerOrders"));
const SellerReturns = lazy(() => import("./pages/Seller/SellerReturns"));
const SellerAnalytics = lazy(() => import("./pages/Seller/SellerAnalytics"));
const SellerProfile = lazy(() => import("./pages/Seller/SellerProfile"));


const App = () => {

  const { open, authLoading  } = useContext(AppContext);


  if (authLoading) {
    return (
      <Preloader />
    );
  }

  return (
    <div>
      
      <ScrollToTop />
      {open && <Auth />}


      <Suspense fallback={<Preloader />}>
        <Routes>
          {/* ================= USER WEBSITE ================= */}
            <Route element={<MainLayout />}>

            <Route path="/" element={<Home />} />

            <Route path="/categoryPage/:category" element={<Category />} />

            <Route path="/categoryPage/:gender/:category" element={<Category />} />

            <Route path="/search" element={<Search />} />

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
            <Route path="returns" element={<SellerReturns />} />
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
      </Suspense>

    </div>
  );
};

export default App;
