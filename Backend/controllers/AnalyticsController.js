import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";

export const adminAnalytics = async (req, res) => {
  try {

    // ================= REVENUE (MONTH+YEAR) =================
    const revenue = await Order.aggregate([

      { $match: { isPaid: true } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },

          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }

    ]);



    // ================= TOP PRODUCTS =================
    const topProducts = await Order.aggregate([

      { $match: { isPaid: true } },

      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" }
        }
      },

      { $sort: { sold: -1 } },

      { $limit: 10 },

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



    // ================= TODAY STATS =================
    const today = new Date();
    today.setHours(0,0,0,0);
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());



    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });


    const todayRevenue = await Order.aggregate([

      {
        $match: {
          isPaid: true,
          createdAt: { $gte: today }
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }

    ]);



    // ================= NEW PRODUCTS =================
    const newProducts = await Product.countDocuments({
      createdAt: { $gte: today }
    });



    // ================= TOTAL REVENUE =================
    const totalRevenue = await Order.aggregate([

      { $match: { isPaid: true } },

      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }

    ]);



    res.json({
      success: true,

      analytics: {

        revenue,

        topProducts,

        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
          newProducts
        },

        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {

    console.error("ADMIN ANALYTICS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Analytics failed"
    });
  }
};
