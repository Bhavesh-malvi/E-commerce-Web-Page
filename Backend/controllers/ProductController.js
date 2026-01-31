import Product from "../models/ProductModel.js";
import Seller from "../models/SellerModel.js";
import cloudinary from "../config/cloudinary.js";
import { updateInterest } from "../utils/updateInterest.js";

import {
  clearProductCache,
  clearHomeCache
} from "../utils/cache.js";



// ================= SAFE JSON =================
const safeParse = (val, def = []) => {
  try {
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
};




// ================= ADD PRODUCT =================
export const addProduct = async (req, res) => {
  try {

    const {
      name,
      category,
      subCategory,
      gender,
      brand,
      price,
      discountPrice,
      stock,
      tags,
      badges,
      descriptionBlocks,
      specifications,
      variants,
      avgDeliveryTime,
      warranty,
      returnable,
      minOrderQty,
      metaTitle,
      metaDescription,
      shortDescription
    } = req.body;


    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }


    // Seller verify
    const seller = await Seller.findOne({
      user: req.user._id,
      isVerified: true
    });


    if (!seller) {
      return res.status(403).json({
        success: false,
        message: "Seller not verified"
      });
    }


    // Upload images
    let mainImages = [];
    let variantsData = safeParse(variants, []);
    let descriptionBlocksData = safeParse(descriptionBlocks, []);

    if (req.files?.length) {

      for (const file of req.files) {
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
        const imgObj = { public_id: result.public_id, url: result.secure_url };

        // Check if main image, variant image, or description image
        if (file.fieldname === 'images') {
           mainImages.push(imgObj);
        } else if (file.fieldname.startsWith('variant_image_')) {
           // Fieldname format: "variant_image_INDEX"
           const index = parseInt(file.fieldname.split('_').pop());
           if (variantsData[index]) {
              if (!variantsData[index].images) variantsData[index].images = [];
              variantsData[index].images.push(imgObj);
           }
        } else if (file.fieldname.startsWith('description_block_image_')) {
           // Fieldname format: "description_block_image_INDEX"
           const index = parseInt(file.fieldname.split('_').pop());
           if (descriptionBlocksData[index]) {
              descriptionBlocksData[index].content = imgObj.url;
           }
        }
      }
    }


    const product = await Product.create({

      name,
      category,

      price: Number(price),
      discountPrice: discountPrice
        ? Number(discountPrice)
        : null,

      stock: Number(stock) || 0,

      tags: safeParse(tags),
      badges: safeParse(badges),

      descriptionBlocks: descriptionBlocksData,
      specifications: safeParse(specifications),
      variants: variantsData,

      mainImages: mainImages,

      subCategory,
      gender,
      brand,
      avgDeliveryTime: Number(avgDeliveryTime),
      warranty,
      returnable: returnable === 'true' || returnable === true,
      minOrderQty: Number(minOrderQty) || 1,
      metaTitle,
      metaDescription,
      shortDescription,

      seller: seller._id
    });


    // ✅ CLEAR CACHE
    clearProductCache();
    clearHomeCache();


    res.status(201).json({
      success: true,
      message: "Product added",
      product
    });


  } catch (err) {

    console.log("ADD PRODUCT:", err);

    res.status(500).json({ success: false });
  }
};





// ================= GET PRODUCTS =================
export const getProduct = async (req, res) => {
  try {

    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;


    let query = { isActive: true };


    if (keyword) {
      query.$text = { $search: keyword };
    }


    if (category) query.category = category;


    if (minPrice || maxPrice) {

      query.price = {};

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }


    let sortBy = { createdAt: -1 };

    if (sort === "price-asc") sortBy.price = 1;
    if (sort === "price-desc") sortBy.price = -1;
    if (sort === "popular") sortBy.sold = -1;


    const skip = (page - 1) * limit;


    const products = await Product.find(query)
      .select("name price discountPrice mainImages ratings badges stock category subCategory gender isActive seller")
      .populate("seller", "shopName")
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));


    const total = await Product.countDocuments(query);


    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products
    });


  } catch (err) {

    console.log("GET PRODUCT:", err);

    res.status(500).json({ success: false });
  }
};





// ================= SINGLE PRODUCT =================
export const getSingleProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("seller", "shopName")
      .populate("reviews.user", "name avatar");


    if (!product) {
      return res.status(404).json({ success: false });
    }


    if (req.user?._id) {
      updateInterest(req.user._id, product._id)
        .catch(() => {});
    }


    res.json({
      success: true,
      product
    });


  } catch (err) {

    res.status(500).json({ success: false });
  }
};





// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Allow Admin override
    if (req.user.role !== 'admin') {
      const seller = await Seller.findOne({ user: req.user._id });
      
      // Check ownership
      if (!seller || product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized action" });
      }
    }


    Object.assign(product, {
      name: req.body.name || product.name,
      category: req.body.category || product.category,
      subCategory: req.body.subCategory || product.subCategory,
      gender: req.body.gender || product.gender,
      brand: req.body.brand || product.brand,
      price: req.body.price ? Number(req.body.price) : product.price,
      stock: req.body.stock ? Number(req.body.stock) : product.stock,
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : product.discountPrice,
      avgDeliveryTime: req.body.avgDeliveryTime ? Number(req.body.avgDeliveryTime) : product.avgDeliveryTime,
      warranty: req.body.warranty || product.warranty,
      returnable: req.body.returnable !== undefined ? (req.body.returnable === 'true' || req.body.returnable === true) : product.returnable,
      minOrderQty: req.body.minOrderQty ? Number(req.body.minOrderQty) : product.minOrderQty,
      metaTitle: req.body.metaTitle || product.metaTitle,
      metaDescription: req.body.metaDescription || product.metaDescription,
      shortDescription: req.body.shortDescription || product.shortDescription
    });


    if (req.body.tags) product.tags = safeParse(req.body.tags);
    if (req.body.badges) product.badges = safeParse(req.body.badges);
    if (req.body.specifications) product.specifications = safeParse(req.body.specifications);
    if (req.body.descriptionBlocks) product.descriptionBlocks = safeParse(req.body.descriptionBlocks);
    
    // Handle Variants, Description Blocks & Images
    let variantsData = req.body.variants ? safeParse(req.body.variants, []) : product.variants;
    let descriptionBlocksData = req.body.descriptionBlocks ? safeParse(req.body.descriptionBlocks, []) : product.descriptionBlocks;
    let newMainImages = [];
    
    // Process all uploaded files
    if (req.files?.length) {
       for (const file of req.files) {
         const result = await cloudinary.uploader.upload(file.path, { folder: "products" });
         const imgObj = { public_id: result.public_id, url: result.secure_url };

         if (file.fieldname === 'images') {
            newMainImages.push(imgObj);
         } else if (file.fieldname.startsWith('variant_image_')) {
            const index = parseInt(file.fieldname.split('_').pop());
            if (variantsData[index]) {
               if (!variantsData[index].images) variantsData[index].images = [];
               variantsData[index].images.push(imgObj);
            }
         } else if (file.fieldname.startsWith('description_block_image_')) {
            const index = parseInt(file.fieldname.split('_').pop());
            if (descriptionBlocksData[index]) {
               descriptionBlocksData[index].content = imgObj.url;
            }
         }
       }
    }

    // Update Main Images if new ones provided (Replace logic as per previous implementation)
    if (newMainImages.length > 0) {
       product.mainImages = newMainImages;
    }

    // Update Variants & Description Blocks
    product.variants = variantsData;
    product.descriptionBlocks = descriptionBlocksData;

    await product.save();


    // ✅ CLEAR CACHE
    clearProductCache();
    clearHomeCache();


    res.json({
      success: true,
      message: "Updated successfully",
      product
    });


  } catch (err) {
    console.log("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};


// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // Allow Admin or Owner
    if (req.user.role !== 'admin') {
       const seller = await Seller.findOne({ user: req.user._id });
       if (!seller || product.seller.toString() !== seller._id.toString()) {
         return res.status(403).json({ success: false, message: "Unauthorized action" });
       }
    }


    product.isActive = false;

    await product.save();


    // ✅ CLEAR CACHE
    clearProductCache();
    clearHomeCache();


    res.json({
      success: true,
      message: "Product deleted successfully"
    });


  } catch (err) {
    console.log("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};


// ================= GET UNIQUE CATEGORIES =================
export const getUniqueCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json({ success: true, categories: categories.filter(c => c) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// ================= GET UNIQUE SUBCATEGORIES =================
export const getUniqueSubCategories = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    const subCategories = await Product.distinct("subCategory", query);
    res.json({ success: true, subCategories: subCategories.filter(s => s) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch subcategories" });
  }
};
// ================= GET SELLER PRODUCTS =================
export const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }

    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: seller._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({ seller: seller._id });

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.log("GET SELLER PRODUCTS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch seller products" });
  }
};
