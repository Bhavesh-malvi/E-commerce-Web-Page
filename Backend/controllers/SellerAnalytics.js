import Order from "../models/OrderModel.js";
import Seller from "../models/SellerModel.js";
import Product from "../models/ProductModel.js";
import { subDays, startOfYear } from "date-fns";

export const sellerAnalytics = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

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

    // 1. Time-series Data: Revenue and Orders
    const timeSeries = await Order.aggregate([
      { 
        $match: { 
          isPaid: true, 
          createdAt: { $gte: startDate },
          orderStatus: { $ne: "Cancelled" },
          "items.seller": seller._id 
        } 
      },
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id, "items.returnStatus": { $ne: "refunded" } } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          earning: { $sum: "$items.sellerEarning" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true, "items.seller": seller._id, orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id, "items.returnStatus": { $ne: "refunded" } } },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          imageObj: { $first: "$items.image" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $project: {
          name: 1,
          sold: 1,
          revenue: 1,
          image: {
            $cond: {
              if: { $eq: [{ $type: "$imageObj" }, "object"] },
              then: "$imageObj.url",
              else: "$imageObj"
            }
          }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 }
    ]);

    // 3. Order Status Breakdown
    const orderStatus = await Order.aggregate([
      { $match: { "items.seller": seller._id } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Stock Status
    const stockStatus = {
      outOfStock: await Product.countDocuments({ seller: seller._id, stock: 0 }),
      lowStock: await Product.countDocuments({ seller: seller._id, stock: { $gt: 0, $lte: 5 } }),
      inStock: await Product.countDocuments({ seller: seller._id, stock: { $gt: 5 } })
    };

    // 5. General Stats
    const totalStats = await Order.aggregate([
      { $match: { isPaid: true, "items.seller": seller._id, orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      { $match: { "items.seller": seller._id, "items.returnStatus": { $ne: "refunded" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalEarning: { $sum: "$items.sellerEarning" },
          totalSold: { $sum: "$items.quantity" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeSeries,
        topProducts,
        orderStatus,
        stockStatus,
        stats: {
          revenue: totalStats[0]?.totalRevenue || 0,
          earning: totalStats[0]?.totalEarning || 0,
          sold: totalStats[0]?.totalSold || 0,
          products: await Product.countDocuments({ seller: seller._id })
        }
      }
    });

  } catch (err) {
    console.error("SELLER ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};
