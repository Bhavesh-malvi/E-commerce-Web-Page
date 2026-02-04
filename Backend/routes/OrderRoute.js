import express from "express";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";
import IsSeller from "../middleware/SellerAuth.js";

import {
  placeOrder,
  myOrders,
  getOrder,
  generateQRCode,
  updateLocation,
  updateLocationByTracking,
  trackByIdAndEmail,
  requestReturn,
  getSellerOrders,
  updateOrderStatus,
  getAllOrders,
  getInvoice,
  sendDeliveryOTP,
  verifyDelivery,
  getPublicTrackingInfo,
  updateReturnStatus
} from "../controllers/OrderController.js";

import { verifyStripePayment } from "../controllers/PaymentController.js";


const router = express.Router();


// ================= PUBLIC =================

// Track order
router.post("/track", trackByIdAndEmail);


// ================= USER =================

// Place order
router.post("/place", AuthUser, placeOrder);

// My orders
router.get("/my", AuthUser, myOrders);

// Admin/Seller: Get All Orders
router.get("/admin/all", AuthUser, IsSeller, getAllOrders);

// Invoice
router.get("/invoice/:id", AuthUser, IsSeller, getInvoice);

// Location Update (QR Scan - Public but uses Tracking ID)
router.post("/location/update", updateLocationByTracking);

// Get Public Tracking Info
router.get("/track/:trackingId", getPublicTrackingInfo);

// Delivery OTP
router.post("/delivery/otp/:id", AuthUser, IsSeller, sendDeliveryOTP);
router.post("/delivery/verify/:id", AuthUser, IsSeller, verifyDelivery);

// Single order
router.get("/single/:id", AuthUser, getOrder);

// Verify payment
router.post("/payment/verify", AuthUser, verifyStripePayment);

// Return request
router.post("/return/:id", AuthUser, requestReturn);


// ================= SELLER / ADMIN =================
router.get("/seller", AuthUser, getSellerOrders);
// Update Return Status
router.put("/:id/return-status", AuthUser, updateReturnStatus);

router.put("/:id/status", AuthUser, updateOrderStatus);


// ================= ADMIN =================

// Generate QR
router.get(
  "/qr/:id",
  AuthUser,
  AdminAuth,
  generateQRCode
);

// Update delivery location
router.put(
  "/location/:id",
  AuthUser,
  AdminAuth,
  updateLocation
);


export default router;
