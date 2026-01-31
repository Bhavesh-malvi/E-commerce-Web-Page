import express from "express";

import {
  addAddress,
  getMyAddress,
  updateAddress,
  deleteAddress
} from "../controllers/AddressController.js";

import AuthUser from "../middleware/AuthUser.js";


const router = express.Router();


// Protect all routes
router.use(AuthUser);


// Add address
router.post("/", addAddress);


// Get all my addresses
router.get("/", getMyAddress);


// Update address
router.put("/:id", updateAddress);


// Delete address
router.delete("/:id", deleteAddress);


export default router;
