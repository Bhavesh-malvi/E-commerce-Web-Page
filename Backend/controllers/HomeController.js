import Product from "../models/ProductModel.js";
import Deal from "../models/DealModel.js";
import { getCache, setCache } from "../utils/cache.js";



export const homeData = async (req, res) => {
  try {

    // ================= CACHE =================
    const cacheKey = "home_data";

    const cached = getCache(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        fromCache: true,
        ...cached
      });
    }
    // =========================================


    const now = new Date();


    // ================= TRENDING =================
    const trending = await Product
      .find({ isActive: true, status: "active" })
      .select("name price discountPrice slug mainImages ratings badges")
      .sort({ sold: -1 })
      .limit(8);


    // ================= NEW ARRIVALS =================
    const newArrivals = await Product
      .find({ isActive: true, status: "active" })
      .select("name price discountPrice slug mainImages ratings badges")
      .sort({ createdAt: -1 })
      .limit(8);


    // ================= ACTIVE DEALS =================
    const activeDeals = await Deal.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate({
        path: "products",
        select: "name price discountPrice slug mainImages ratings badges"
      })
      .limit(6);


    // Flatten products from valid deals
    const deals = activeDeals
      .flatMap(d => d.products)
      .filter(p => p !== null)
      .slice(0, 8); // Limit total products shown


    // ================= RESPONSE =================
    const response = {
      success: true,

      sections: {
        trending,
        newArrivals,
        deals
      }
    };


    // Save cache (3 min)
    setCache(cacheKey, response, 180);


    res.json(response);


  } catch (err) {

    console.log("HOME DATA ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load home data"
    });
  }
};

