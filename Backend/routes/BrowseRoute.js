import express from "express";

import {
  trackActivity,
  myActivity,
  adminAnalytics
} from "../controllers/BrowseController.js";

import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();


// Track (guest + user)
router.post("/track",
 optionalAuth,
 trackActivity
);


// User History
router.get("/me",
 AuthUser,
 myActivity
);


// Admin Analytics
router.get("/admin",
 AuthUser,
 AdminAuth,
 adminAnalytics
);

export default router;
