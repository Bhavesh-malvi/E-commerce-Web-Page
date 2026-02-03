import Deal from "../models/DealModel.js";
import Product from "../models/ProductModel.js";


// ================= CREATE DEAL =================
export const createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      products, // Array of IDs
      discountPercentage,
      startDate,
      endDate
    } = req.body;


    if (!title || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    const deal = await Deal.create({
      title,
      description,
      products,
      discountPercentage,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    // Apply discount to all products in deal
    if (products && products.length > 0) {
      const productDocs = await Product.find({ _id: { $in: products } });
      
      for (const product of productDocs) {
        // Calculate from BASE PRICE
        const basePrice = product.price;
        const discountAmount = (basePrice * discountPercentage) / 100;
        const dealDiscountPrice = Math.round(basePrice - discountAmount);
        
        const updateData = {
          $addToSet: { badges: "sale" },
          activeDeal: {
            dealId: deal._id,
            dealType: 'Deal',
            dealDiscount: dealDiscountPrice,
            discountPercentage: discountPercentage,
            expiresAt: endDate
          }
        };

        // Preserve original discount
        if (product.discountPrice && !product.originalDiscountPrice) {
          updateData.originalDiscountPrice = product.discountPrice;
        } else if (!product.discountPrice && !product.originalDiscountPrice) {
          updateData.originalDiscountPrice = null;
        }

        await Product.findByIdAndUpdate(product._id, updateData);
      }
    }

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal
    });

  } catch (err) {
    console.error("CREATE DEAL ERROR:", err);
    res.status(500).json({ 
        success: false, 
        message: err.message || "Failed to create deal" 
    });
  }
};


// ================= GET ALL DEALS (ADMIN) =================
export const getAllDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate("products", "name price mainImages")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      deals
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch deals" });
  }
};


// ================= GET ACTIVE DEALS (PUBLIC) =================
export const getActiveDeals = async (req, res) => {
  try {
    const now = new Date();

    const deals = await Deal.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("products", "name price discountPrice mainImages slug category stock sold");

    res.json({
      success: true,
      deals
    });

  } catch (err) {
    console.error("GET ACTIVE DEALS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to fetch deals" });
  }
};


// ================= DELETE DEAL =================
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    // Restore original discount and remove deal from products
    if (deal.products && deal.products.length > 0) {
      const productsToUpdate = await Product.find({ _id: { $in: deal.products } });
      
      for (const product of productsToUpdate) {
        const updateData = {
          $pull: { badges: "sale" },
          $unset: { activeDeal: "" }
        };

        // Restore original discount if it was saved
        if (product.originalDiscountPrice !== undefined) {
          updateData.discountPrice = product.originalDiscountPrice;
          updateData.$unset.originalDiscountPrice = "";
        }

        await Product.findByIdAndUpdate(product._id, updateData);
      }
    }

    await deal.deleteOne();

    res.json({
      success: true,
      message: "Deal deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete deal" });
  }
};

// ================= PERSONAL DEALS (Alias) =================
export const personalDeals = getActiveDeals;
