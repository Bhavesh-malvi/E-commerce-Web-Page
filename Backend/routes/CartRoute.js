import express from "express";

import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  updateQuantity
} from "../controllers/CartController.js";

import AuthUser from "../middleware/AuthUser.js";

const router = express.Router();


// All cart routes need login
router.use(AuthUser);


// Add item
router.post("/", addToCart);


// Get cart
router.get("/", getCart);


// Update quantity
router.put("/quantity", updateQuantity);


// Remove item
router.delete("/:productId", removeFromCart);


// Clear cart
router.delete("/", clearCart);


export default router;
