import User from "../models/UserModel.js";
import Order from "../models/OrderModel.js";
import Seller from "../models/SellerModel.js";
import Product from "../models/ProductModel.js";
import { startOfDay, startOfMonth, startOfYear, subDays, subMonths, format } from "date-fns";



// ================= SECURITY =================
const checkAdmin = (req) => {
  if (req.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
};



// ================= DETAILED ANALYTICS =================
export const getAnalytics = async (req, res) => {
  try {
    checkAdmin(req);
    const { range = "month" } = req.query;

    let startDate;
    let groupBy;

    const now = new Date();
    if (range === "week") {
      startDate = subDays(now, 7);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (range === "year") {
      startDate = startOfYear(now);
      groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else {
      startDate = subDays(now, 30);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    // 1. Revenue & Orders Time-series
    const timeSeriesData = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startDate } } },
      {
        $project: {
          createdAt: 1,
          totalPrice: 1,
          orderCommission: { $sum: "$items.commission" }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalPrice" },
          commission: { $sum: "$orderCommission" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. User & Seller Growth
    const userGrowth = await User.aggregate([
      { $match: { role: "user", createdAt: { $gte: startDate } } },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const sellerGrowth = await Seller.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 3. Top Sellers
    const topSellers = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.seller",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          commission: { $sum: "$items.commission" },
          sales: { $sum: "$items.quantity" }
        }
      },
      { $sort: { commission: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },
      {
        $project: {
          shopName: "$seller.shopName",
          revenue: 1,
          commission: 1,
          sales: 1
        }
      }
    ]);

    res.json({
      success: true,
      timeSeries: timeSeriesData,
      growth: {
        users: userGrowth,
        sellers: sellerGrowth
      },
      topSellers: topSellers.length > 0 ? topSellers : []
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, message: "Dashboard data error" });
  }
};



// ================= BASIC DASHBOARD =================
export const getAdminStats = async (req, res) => {
  try {

    checkAdmin(req);

    const users = await User.countDocuments({ role: 'user' });
    const sellers = await Seller.countDocuments();
    const orders = await Order.countDocuments();


    const revenue = await Order.aggregate([

      { $match: { isPaid: true } },

      {
        $project: {
          totalPrice: 1,
          adminCommission: { $sum: "$items.commission" },
          sellerEarning: { $sum: "$items.sellerEarning" }
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          admin: { $sum: "$adminCommission" },
          seller: { $sum: "$sellerEarning" }
        }
      }

    ]);


    res.json({
      success: true,

      stats: {
        users,
        sellers,
        orders,

        revenue: revenue[0] || {
          total: 0,
          admin: 0,
          seller: 0
        }
      }
    });

  } catch (err) {

    console.error("ADMIN STATS ERROR:", err);

    res.status(403).json({
      success: false,
      message: err.message || "Access denied"
    });
  }
};




// ================= MONTHLY REVENUE =================
export const monthlyRevenue = async (req, res) => {
  try {

    checkAdmin(req);

    const data = await Order.aggregate([

      { $match: { isPaid: true } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },

          total: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }

    ]);


    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error("MONTHLY ERROR:", err);

    res.status(500).json({ success: false });
  }
};




// ================= TOP PRODUCTS =================
export const topProducts = async (req, res) => {
  try {

    checkAdmin(req);

    const data = await Order.aggregate([

      { $match: { isPaid: true } },

      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" }
        }
      },

      { $sort: { sold: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },

      { $unwind: "$product" },

      {
        $project: {
          sold: 1,
          "product.name": 1,
          "product.price": 1,
          "product.mainImages": 1,
          "product.slug": 1
        }
      }

    ]);


    res.json({
      success: true,
      products: data
    });

  } catch (err) {

    console.error("TOP PRODUCT ERROR:", err);

    res.status(500).json({ success: false });
  }
};




// ================= SELLER PERFORMANCE =================
export const sellerPerformance = async (req, res) => {
  try {

    checkAdmin(req);

    const sellers = await Seller.find()
      .select("shopName totalSales totalOrders wallet.balance");


    res.json({
      success: true,
      sellers
    });

  } catch (err) {

    console.error("SELLER ERROR:", err);

    res.status(500).json({ success: false });
  }
};




// ================= RECENT ORDERS =================
export const recentOrders = async (req, res) => {
  try {

    checkAdmin(req);

    const orders = await Order.find({ isPaid: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email");


    res.json({
      success: true,
      orders
    });

  } catch (err) {

    console.error("RECENT ERROR:", err);

    res.status(500).json({ success: false });
  }
};




// ================= TODAY SUMMARY =================
export const todayStats = async (req,res)=>{
try{

 const today = new Date();
 today.setHours(0,0,0,0);


 const orders = await Order.countDocuments({
  createdAt:{ $gte: today }
 });


 const revenue = await Order.aggregate([

  {
   $match:{
    isPaid:true,
    createdAt:{ $gte: today }
   }
  },

  {
   $group:{
    _id:null,
    total:{ $sum:"$totalPrice" }
   }
  }

 ]);


 res.json({
  success:true,
  today:{
   orders,
   revenue: revenue[0]?.total || 0
  }
 });


}catch(err){

 console.error("TODAY STATS ERROR:",err);

 res.status(500).json({ success:false });
}
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({role: "user"}).select("-password")

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};


export const getAllSellers = async (req,res)=>{

 try{

  const sellers = await Seller.find()
   .populate({
     path: "user",
     select: "name email role"
   });

  res.json({
   success:true,
   sellers
  });

 }catch(err){

  console.error("GET SELLERS:",err);

  res.status(500).json({
   success:false,
   message:"Server error"
  });
 }
};



// Get all products (Admin)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .populate("seller", "shopName user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({});

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};


// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


export const toggleBlockUser = async (req, res) => {

  try {



    const user = await User.findById(req.params.id);



    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    user.isBlocked = !user.isBlocked;

    await user.save();




    res.json({
      success: true,
      message: user.isBlocked
        ? "User blocked"
        : "User unblocked",
    });

  } catch (error) {

    console.error("BLOCK ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    // Also remove associated seller account if exists
    if (user.role === 'seller') {
       await Seller.findOneAndDelete({ user: user._id });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

