
import express from "express";
import { getWallet, withdrawRequest } from "../controllers/WalletController.js";
import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/", AuthUser, getWallet);
router.post("/withdraw", AuthUser, withdrawRequest);

export default router;
