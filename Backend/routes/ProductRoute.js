import express from "express";
import upload from "../config/multer.js";

import {
  addProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getUniqueCategories,
  getUniqueSubCategories,
  getSellerProducts
} from "../controllers/ProductController.js";

import AuthUser from "../middleware/AuthUser.js";


const router = express.Router();


// ================= SELLER & ADMIN =================

// Add product (Controller verifies Seller)
router.post(
  "/add",
  AuthUser,
  upload.any(),
  addProduct
);


// Update product (Controller verifies Ownership/Admin)
router.put(
  "/update/:id",
  AuthUser,
  upload.any(),
  updateProduct
);


// Delete product (Controller verifies Ownership/Admin)
router.delete(
  "/delete/:id",
  AuthUser,
  deleteProduct
);


// Get all seller products
router.get(
  "/seller-all",
  AuthUser,
  getSellerProducts
);


// ================= PUBLIC =================

// Get all products
router.get("/", getProduct);

// Get single product
router.get("/single/:id", getSingleProduct);


// Get unique categories
router.get("/categories", getUniqueCategories);

// Get unique subcategories
router.get("/subcategories", getUniqueSubCategories);


export default router;
