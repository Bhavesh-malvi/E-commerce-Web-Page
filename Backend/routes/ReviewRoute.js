import express from "express";

import {
  addReview,
  getReviews,
  updateReview,
  markHelpful
} from "../controllers/ReviewController.js";

import AuthUser from "../middleware/AuthUser.js";
import upload from "../config/reviewUpload.js";

const router = express.Router();


// ================= ADD REVIEW =================
router.post(
  "/:productId",
  AuthUser,
  upload.array("media", 5),
  addReview
);


// ================= UPDATE REVIEW =================
router.put(
  "/:productId/:reviewId",
  AuthUser,
  updateReview
);


// ================= MARK HELPFUL =================
router.post(
  "/:productId/:reviewId/helpful",
  AuthUser,
  markHelpful
);


// ================= GET REVIEWS =================
router.get(
  "/:productId",
  getReviews
);


export default router;
