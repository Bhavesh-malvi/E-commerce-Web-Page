import express from "express";

import {
  createDeal,
  getActiveDeals,
  getAllDeals,
  deleteDeal
} from "../controllers/DealController.js";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";

const router = express.Router();


// ================= ADMIN =================

// Create deal
router.post(
  "/create",
  AuthUser,
  AdminAuth,
  createDeal
);

// Get All Deals (Admin)
router.get(
  "/admin/all",
  AuthUser,
  AdminAuth,
  getAllDeals
);

// Delete deal
router.delete(
  "/:id",
  AuthUser,
  AdminAuth,
  deleteDeal
);


// ================= PUBLIC =================

// Get active deals
router.get(
  "/active",
  getActiveDeals
);


export default router;
