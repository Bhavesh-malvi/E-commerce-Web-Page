import express from "express";

import {
  applySeller,
  mySellerAccount
} from "../controllers/SellerController.js";

import AuthUser from "../middleware/AuthUser.js";
import SellerAuth from "../middleware/SellerAuth.js";

const router = express.Router();


// ================= USER =================

// Apply for seller
router.post("/apply", AuthUser, applySeller);


// ================= SELLER =================

router.get(
  "/me",
  AuthUser,
  SellerAuth,
  mySellerAccount
);




export default router;
