import express from "express";

import AuthUser from "../middleware/AuthUser.js";

import {
  generateInvoice,
  downloadInvoice
} from "../controllers/InvoiceController.js";

const router = express.Router();


// Generate invoice (User/Admin)
router.post(
  "/generate/:orderId",
  AuthUser,
  generateInvoice
);


// Download invoice (User/Admin)
router.get(
  "/download/:invoiceId",
  AuthUser,
  downloadInvoice
);

export default router;
