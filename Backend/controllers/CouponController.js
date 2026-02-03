import Coupon from "../models/CouponModel.js";




// ================= CREATE COUPON =================
export const createCoupon = async (req, res) => {
  try {

    const {
      code,
      type,
      value,
      minAmount,
      maxDiscount,
      expiry,
      usageLimit
    } = req.body;


    // Validate
    if (!code || !type || !value || !expiry) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }


    if (!["flat", "percent"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon type"
      });
    }


    if (value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount value"
      });
    }


    if (new Date(expiry) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry must be future date"
      });
    }


    // Prevent duplicate
    const exist = await Coupon.findOne({
      code: code.toUpperCase()
    });


    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists"
      });
    }


    const coupon = await Coupon.create({

      code: code.toUpperCase(),
      type,
      value,

      minAmount: Number(minAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,

      expiry,
      usageLimit: Number(usageLimit) || 0,
      
      createdBy: req.user._id

    });


    res.status(201).json({
      success: true,
      message: "Coupon created",
      coupon
    });

  } catch (err) {
    console.error("CREATE COUPON ERROR DETAILS:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};


// ================= GET ALL COUPONS (ADMIN) =================
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};


// ================= DELETE COUPON =================
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};






// ================= APPLY COUPON =================
export const applyCoupon = async (req, res) => {
  try {

    const { code, total } = req.body;


    if (!code || !total) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }


    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    });


    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon"
      });
    }


    // Expired
    if (new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired"
      });
    }


    // Min order
    if (total < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Min order ₹${coupon.minAmount}`
      });
    }


    // Already used
    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already used"
      });
    }


    // Usage limit
    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon limit reached"
      });
    }


    // Calculate discount
    let discount = 0;


    if (coupon.type === "flat") {

      discount = coupon.value;

    } else {

      discount = (total * coupon.value) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }


    // Prevent negative amount
    discount = Math.min(discount, total);


    const finalAmount = total - discount;


    res.json({
      success: true,

      couponId: coupon._id,

      discount,

      finalAmount
    });


  } catch (err) {

    console.error("APPLY COUPON ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Apply failed"
    });
  }
};






// ================= MARK USED =================
export const markUsed = async (couponId, userId) => {

  await Coupon.findByIdAndUpdate(
    couponId,
    {
      $inc: { usedCount: 1 },
      $addToSet: { usedBy: userId } // prevent duplicate
    }
  );

};
