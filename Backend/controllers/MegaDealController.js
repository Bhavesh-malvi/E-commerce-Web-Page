import MegaDeal from "../models/MegaDealModel.js";
import Product from "../models/ProductModel.js";

// ================= CREATE MEGA DEAL =================
export const createMegaDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      products,
      discountPercentage,
      maxDiscount,
      startDate,
      endDate
    } = req.body;

    // Validation
    if (!title || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: "End date must be after start date" 
      });
    }

    // Check if another active mega deal exists
    const existingActiveMegaDeal = await MegaDeal.findOne({
      isActive: true,
      endDate: { $gte: new Date() }
    });

    if (existingActiveMegaDeal) {
      return res.status(400).json({
        success: false,
        message: "Another mega deal is already active. Please deactivate it first."
      });
    }

    const megaDeal = await MegaDeal.create({
      title,
      description,
      products,
      discountPercentage,
      maxDiscount: maxDiscount || 70,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    // Apply discount to all products in mega deal
    if (products && products.length > 0) {
      // Get all products
      const productDocs = await Product.find({ _id: { $in: products } });
      
      // Update each product with deal discount
      for (const product of productDocs) {
        // Calculate deal discount from BASE PRICE (not from existing discountPrice)
        const basePrice = product.price;
        const discountAmount = (basePrice * discountPercentage) / 100;
        const cappedDiscountAmount = maxDiscount ? Math.min(discountAmount, (basePrice * maxDiscount) / 100) : discountAmount;
        const dealDiscountPrice = Math.round(basePrice - cappedDiscountAmount);
        

        
        const updateData = {
          $addToSet: { badges: "mega-sale" },
          activeDeal: {
            dealId: megaDeal._id,
            dealType: 'MegaDeal',
            dealDiscount: dealDiscountPrice,
            discountPercentage: discountPercentage,
            expiresAt: endDate
          }
        };

        // ALWAYS preserve original discount if product has one
        // This is saved only once when first deal is applied
        if (product.discountPrice && !product.originalDiscountPrice) {
          updateData.originalDiscountPrice = product.discountPrice;

        } else if (!product.discountPrice && !product.originalDiscountPrice) {
          // No original discount exists, save null/undefined to mark baseline
          updateData.originalDiscountPrice = null;

        }

        await Product.findByIdAndUpdate(product._id, updateData);

      }
    }

    res.status(201).json({
      success: true,
      message: "Mega deal created successfully",
      megaDeal
    });

  } catch (err) {
    console.error("CREATE MEGA DEAL ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to create mega deal" 
    });
  }
};

// ================= GET ACTIVE MEGA DEAL (PUBLIC) =================
export const getActiveMegaDeal = async (req, res) => {
  try {
    const now = new Date();

    const megaDeal = await MegaDeal.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("products", "name price discountPrice mainImages slug category gender stock sold ratings numOfReviews");

    res.json({
      success: true,
      megaDeal: megaDeal || null
    });

  } catch (err) {
    console.error("GET ACTIVE MEGA DEAL ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch mega deal" 
    });
  }
};

// ================= GET ALL MEGA DEALS (ADMIN) =================
export const getAllMegaDeals = async (req, res) => {
  try {
    const megaDeals = await MegaDeal.find()
      .populate("products", "name price mainImages")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      megaDeals
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch mega deals" 
    });
  }
};

// ================= TOGGLE MEGA DEAL STATUS =================
export const toggleMegaDealStatus = async (req, res) => {
  try {
    const megaDeal = await MegaDeal.findById(req.params.id);
    if (!megaDeal) {
      return res.status(404).json({ 
        success: false, 
        message: "Mega deal not found" 
      });
    }

    // If activating, check if another is already active
    if (!megaDeal.isActive) {
      const existingActive = await MegaDeal.findOne({
        isActive: true,
        endDate: { $gte: new Date() },
        _id: { $ne: req.params.id }
      });

      if (existingActive) {
        return res.status(400).json({
          success: false,
          message: "Another mega deal is already active"
        });
      }
    }

    const wasActive = megaDeal.isActive;
    megaDeal.isActive = !megaDeal.isActive;
    await megaDeal.save();

    // Apply or remove deal discounts based on new status
    if (megaDeal.products && megaDeal.products.length > 0) {
      const productDocs = await Product.find({ _id: { $in: megaDeal.products } });

      for (const product of productDocs) {
        if (megaDeal.isActive) {
          // Activating - apply deal discount
          const discountAmount = (product.price * megaDeal.discountPercentage) / 100;
          const cappedDiscountAmount = megaDeal.maxDiscount ? Math.min(discountAmount, (product.price * megaDeal.maxDiscount) / 100) : discountAmount;
          const dealDiscountPrice = Math.round(product.price - cappedDiscountAmount);

          const updateData = {
            $addToSet: { badges: "mega-sale" },
            activeDeal: {
              dealId: megaDeal._id,
              dealType: 'MegaDeal',
              dealDiscount: dealDiscountPrice,
              discountPercentage: megaDeal.discountPercentage,
              expiresAt: megaDeal.endDate
            }
          };

          if (!product.originalDiscountPrice && product.discountPrice) {
            updateData.originalDiscountPrice = product.discountPrice;
          }

          await Product.findByIdAndUpdate(product._id, updateData);
        } else {
          // Deactivating - restore original discount
          const updateData = {
            $pull: { badges: "mega-sale" },
            $unset: { activeDeal: "" }
          };

          if (product.originalDiscountPrice !== undefined) {
            updateData.discountPrice = product.originalDiscountPrice;
            updateData.$unset.originalDiscountPrice = "";
          }

          await Product.findByIdAndUpdate(product._id, updateData);
        }
      }
    }

    res.json({
      success: true,
      message: `Mega deal ${megaDeal.isActive ? 'activated' : 'deactivated'}`,
      megaDeal
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to toggle status" 
    });
  }
};

// ================= DELETE MEGA DEAL =================
export const deleteMegaDeal = async (req, res) => {
  try {
    const megaDeal = await MegaDeal.findById(req.params.id);
    if (!megaDeal) {
      return res.status(404).json({ 
        success: false, 
        message: "Mega deal not found" 
      });
    }

    // Restore original discount and remove deal from products
    if (megaDeal.products && megaDeal.products.length > 0) {
      const productsToUpdate = await Product.find({ _id: { $in: megaDeal.products } });
      
      for (const product of productsToUpdate) {
        const updateData = {
          $pull: { badges: "mega-sale" },
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

    await megaDeal.deleteOne();

    res.json({
      success: true,
      message: "Mega deal deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete mega deal" 
    });
  }
};
