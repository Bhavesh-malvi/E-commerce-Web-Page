import express from "express";
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner
} from "../controllers/BannerController.js";
import AuthUser from "../middleware/AuthUser.js";
import AdminAuth from "../middleware/AdminAuth.js";
import { bannerUpload } from "../config/multer.js";

const router = express.Router();

// Public route
router.get("/active", getActiveBanners);

// Admin routes
router.post("/create", AuthUser, AdminAuth, bannerUpload.single("image"), createBanner);
router.get("/all", AuthUser, AdminAuth, getAllBanners);
router.put("/update/:id", AuthUser, AdminAuth, bannerUpload.single("image"), updateBanner);
router.delete("/delete/:id", AuthUser, AdminAuth, deleteBanner);

export default router;
