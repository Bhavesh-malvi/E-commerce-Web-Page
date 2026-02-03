import Browse from "../models/BrowseModel.js";
import Product from "../models/ProductModel.js";




// ================= TRACK =================
export const trackActivity = async (req, res) => {
  try {

    const {
      product,
      category,
      action,
      keyword,
      duration,
      device
    } = req.body;


    // Validate action
    const allowed = [
      "view",
      "search",
      "add_cart",
      "wishlist",
      "checkout"
    ];

    if (!allowed.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action"
      });
    }


    // Prevent spam (same user same product 30s)
    if (product && req.user?._id) {

      const recent = await Browse.findOne({
        user: req.user._id,
        product,
        action,
        createdAt: {
          $gte: new Date(Date.now() - 30000)
        }
      });

      if (recent) {
        return res.json({ success: true });
      }
    }


    // Validate product
    if (product) {

      const exist = await Product.exists({ _id: product });

      if (!exist) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
    }


    await Browse.create({

      user: req.user?._id || null,

      product,
      category,

      action,

      keyword: keyword?.trim(),

      duration: Number(duration) || 0,

      device: device?.substring(0, 100),

      ip: req.ip

    });


    res.json({ success: true });


  } catch (err) {

    console.error("TRACK ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Track failed"
    });
  }
};






// ================= USER HISTORY =================
export const myActivity = async (req, res) => {
  try {

    const data = await Browse.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("product", "name mainImages slug price discountPrice offerPrice category subCategory ratings badges badge");


    res.json({
      success: true,
      data
    });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Fetch failed"
    });
  }
};






// ================= ADMIN ANALYTICS =================
export const adminAnalytics = async (req, res) => {
  try {

    const popular = await Browse.aggregate([

      { $match: { action: "view" } },

      {
        $group: {
          _id: "$product",
          views: { $sum: 1 }
        }
      },

      { $sort: { views: -1 } },

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
          views: 1,
          "product.name": 1,
          "product.slug": 1,
          "product.mainImages": 1,
          "product.price": 1
        }
      }

    ]);


    res.json({
      success: true,
      popular
    });


  } catch (err) {

    console.error("ADMIN ANALYTICS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Analytics failed"
    });
  }
};
