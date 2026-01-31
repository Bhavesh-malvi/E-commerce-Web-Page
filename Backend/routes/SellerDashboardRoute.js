import express from "express";

import { sellerDashboard } from "../controllers/SellerDashboardController.js";

import AuthUser from "../middleware/AuthUser.js";
import SellerAuth from "../middleware/SellerAuth.js";


const router = express.Router();


// Middleware once
router.use(AuthUser);
router.use(SellerAuth);


// Routes
router.get("/", sellerDashboard);


export default router;
