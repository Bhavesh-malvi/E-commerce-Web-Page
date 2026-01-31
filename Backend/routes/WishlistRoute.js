import express from "express";

import AuthUser from "../middleware/AuthUser.js";

import {  
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} from "../controllers/WishlistController.js";

const router = express.Router();


// ================= WISHLIST =================

// Add item
router.post("/", AuthUser, addToWishlist);

// Get my wishlist
router.get("/", AuthUser, getWishlist);

// Remove item (by wishlist item id)
router.delete("/:id", AuthUser, removeFromWishlist);

// Clear wishlist
router.delete("/", AuthUser, clearWishlist);


export default router;
