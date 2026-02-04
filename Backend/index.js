import "./config/env.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";

import connectDB from "./config/db.js";
import "./jobs/dealCron.js";

// Routes
import userRouter from "./routes/UserRoute.js";
import productRouter from "./routes/ProductRoute.js";
import cartRouter from "./routes/CartRoute.js";
import orderRouter from "./routes/OrderRoute.js";
import sellerRouter from "./routes/SellerRoute.js";
import dealRouter from "./routes/DealRoute.js";
import addressRouter from "./routes/AddressRoute.js";
import adminRouter from "./routes/AdminRoute.js";
import sellerAnalyticsRouter from "./routes/SellerAnalyticsRoute.js";
import sellerDashboardRouter from "./routes/SellerDashboardRoute.js";
import supportRouter from "./routes/SupportRoute.js";
import reviewRouter from "./routes/ReviewRoute.js";
import couponRouter from "./routes/CouponRoute.js";
import browseRouter from "./routes/BrowseRoute.js";
import recommendRouter from "./routes/RecommendRoute.js";
import invoiceRouter from "./routes/InvoiceRoute.js";
import wishlistRouter from "./routes/WishlistRoute.js";
import megaDealRouter from "./routes/MegaDealRoute.js";
import bannerRouter from "./routes/BannerRoute.js";
import walletRouter from "./routes/WalletRoute.js";
import uploadRouter from "./routes/UploadRoute.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";



const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://e-commerce-web-page-yekr.vercel.app"
].filter(Boolean);

const app = express();
// Enable trust proxy for rate limiting behind proxies (Render, Vercel, etc.)
app.set("trust proxy", 1); 

const server = http.createServer(app);

// ================= DATABASE CONNECTION =================
// Ensure DB is connected for every request in Vercel environment
app.use(async (req, res, next) => {
  await connectDB();
  next();
});



// ================= CORS =================
app.use(cors({
  origin: (origin, callback) => {
    // Check if origin is allowed
    const isAllowed = !origin || 
                      allowedOrigins.includes(origin) || 
                      origin.endsWith(".vercel.app"); // Allow all Vercel previews

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS Blocked Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const isAllowed = !origin || 
                        allowedOrigins.includes(origin) || 
                        origin.endsWith(".vercel.app");
      if(isAllowed) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

/* ================= LOGGER ================= */

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ================= BODY ================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Running"
  });
});

app.get("/health", (req, res)=>{
  res.json({
    status:"ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/* ================= ROUTES ================= */

app.use('/uploads', express.static('uploads')); // Serve uploaded images

app.use("/api",apiLimiter);

app.use("/api/auth",authLimiter, userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.use("/api/seller", sellerRouter);
app.use("/api/deal", dealRouter);
app.use("/api/address", addressRouter);
app.use("/api/admin", adminRouter);

app.use("/api/seller/analytics", sellerAnalyticsRouter);
app.use("/api/seller/dashboard", sellerDashboardRouter);

app.use("/api/support", supportRouter);
app.use("/api/review", reviewRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/browse", browseRouter);
app.use("/api/recommend", recommendRouter);
app.use("/api/invoice", invoiceRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/megadeal", megaDealRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/upload", uploadRouter);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= SOCKET ================= */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    // console.log(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => {
    // console.log("Client disconnected");
  });
});

// Export io for controllers
export { io };


/* ================= START ================= */

const PORT = process.env.PORT || 5000;

// Local Development Server
if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await connectDB();
      server.listen(PORT, () => {
        console.log(`
=================================
 🚀 Local Server Started
 🌍 http://localhost:${PORT}
 📦 Mode: ${process.env.NODE_ENV}
=================================
        `);
      });
    } catch (error) {
      console.error("❌ SERVER START FAILED:", error);
      process.exit(1);
    }
  };
  startServer();
}

// Vercel Serverless Function Export
export default app;
