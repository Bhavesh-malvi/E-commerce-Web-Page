import express from "express";

import {
  createMegaDeal,
  getActiveMegaDeal,
  getAllMegaDeals,
  toggleMegaDealStatus,
  deleteMegaDeal
} from "../controllers/MegaDealController.js";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";

const router = express.Router();

// ================= PUBLIC =================

// Get active mega deal
router.get("/active", getActiveMegaDeal);

// ================= ADMIN =================

// Create mega deal
router.post(
  "/create",
  AuthUser,
  AdminAuth,
  createMegaDeal
);

// Get all mega deals (Admin)
router.get(
  "/admin/all",
  AuthUser,
  AdminAuth,
  getAllMegaDeals
);

// Toggle mega deal status
router.put(
  "/:id/toggle",
  AuthUser,
  AdminAuth,
  toggleMegaDealStatus
);

// Delete mega deal
router.delete(
  "/:id",
  AuthUser,
  AdminAuth,
  deleteMegaDeal
);

export default router;
