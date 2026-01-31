import express from "express";

import { sellerAnalytics } from "../controllers/SellerAnalytics.js";

import AuthUser from "../middleware/AuthUser.js";
import SellerAuth from "../middleware/SellerAuth.js";


const router = express.Router();


// Apply once
router.use(AuthUser);
router.use(SellerAuth);


// Routes
router.get("/", sellerAnalytics);


export default router;
