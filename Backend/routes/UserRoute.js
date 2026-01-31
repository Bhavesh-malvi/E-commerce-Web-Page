import express from "express";

import {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
  changePassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  registerAdmin
} from "../controllers/UserContollers.js";

import upload from "../config/multer.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();


// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", AuthUser, logoutUser);


// ================= PROFILE =================
router.get("/profile", AuthUser, getProfile);

router.put(
  "/profile",
  AuthUser,
  upload.single("avatar"),
  updateProfile
);


// ================= PASSWORD =================
router.put("/change-password", AuthUser, changePassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/register-admin", registerAdmin);


export default router;
