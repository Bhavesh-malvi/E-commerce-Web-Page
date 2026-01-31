import express from "express";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";


import {
  getAdminStats,
  monthlyRevenue,
  topProducts,
  sellerPerformance,
  recentOrders,
  todayStats,
  getAllUsers,
  getAllSellers,
  getAllProducts,
  getAllOrders,
  toggleBlockUser,
  deleteUser
} from "../controllers/AdminController.js";

import { verifySeller } from "../controllers/SellerController.js";
import { authorize } from "../middleware/roleAuth.js";

const router = express.Router();

// First login check
router.use(AuthUser);

// Then admin check
router.use(AdminAuth);

// Then role check
router.use(authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/monthly", monthlyRevenue);
router.get("/top-products", topProducts);
router.get("/seller-performance", sellerPerformance);
router.get("/recent-orders", recentOrders);
router.get("/today", todayStats);
router.get("/users", getAllUsers);
router.get("/sellers", getAllSellers);
router.get("/products", getAllProducts); // Get all products
router.get("/orders", getAllOrders); // Get all orders
router.put( "/users/block/:id", toggleBlockUser);
router.delete("/users/:id", deleteUser); // Add delete user route
router.put( "/seller/verify/:id", verifySeller);


export default router;
