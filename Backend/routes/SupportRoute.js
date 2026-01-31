import express from "express";
import rateLimit from "express-rate-limit";

import {
  aiChat,
  getChatHistory
} from "../controllers/SupportController.js";

import AuthUser from "../middleware/AuthUser.js";


const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10 // 10 msgs / min
});


router.post("/chat", AuthUser, chatLimiter, aiChat);
router.get("/history", AuthUser, getChatHistory);


export default router;
