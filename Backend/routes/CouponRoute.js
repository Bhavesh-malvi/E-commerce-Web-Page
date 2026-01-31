import express from "express";

import {
  createCoupon,
  applyCoupon,
  getAllCoupons,
  deleteCoupon
} from "../controllers/CouponController.js";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";

const router = express.Router();


// ================= ADMIN =================

// Create coupon
router.post(
  "/create",
  AuthUser,
  AdminAuth,
  createCoupon
);

// Get All (Admin)
router.get(
  "/admin/all",
  AuthUser,
  AdminAuth,
  getAllCoupons
);

// Delete
router.delete(
  "/:id",
  AuthUser,
  AdminAuth,
  deleteCoupon
);


// ================= USER =================

// Apply coupon
router.post(
  "/apply",
  AuthUser,
  applyCoupon
);


export default router;
