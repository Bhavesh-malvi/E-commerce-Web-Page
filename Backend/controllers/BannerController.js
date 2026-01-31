import Banner from "../models/BannerModel.js";

// ================= CREATE BANNER =================
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, price } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    if (!title || !subtitle || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      price: Number(price),
      image
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ================= GET ALL BANNERS (ADMIN) =================
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({
      success: true,
      banners
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners"
    });
  }
};

// ================= GET ACTIVE BANNERS (PUBLIC) =================
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      banners
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active banners"
    });
  }
};

// ================= UPDATE BANNER =================
export const updateBanner = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }
    res.json({
      success: true,
      message: "Banner updated successfully",
      banner
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update banner"
    });
  }
};

// ================= DELETE BANNER =================
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }
    res.json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete banner"
    });
  }
};
