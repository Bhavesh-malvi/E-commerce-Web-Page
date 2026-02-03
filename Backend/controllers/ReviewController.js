import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import { detectSpam } from "../utils/spamDetector.js";



// ================= CHECK BUYER =================
const hasPurchased = async (userId, productId) => {

  const order = await Order.findOne({
    user: userId,
    isPaid: true,
    "items.product": productId
  });

  return !!order;
};



// ================= ADD REVIEW =================
export const addReview = async (req, res) => {
  try {

    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating 1-5 required"
      });
    }

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment required"
      });
    }


    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }


    // Must purchase
    const bought = await hasPurchased(
      req.user._id,
      product._id
    );

    if (!bought) {
      return res.status(403).json({
        success: false,
        message: "Purchase required"
      });
    }


    // Duplicate
    const already = product.reviews.find(r =>
      r.user.toString() === req.user._id.toString()
    );

    if (already) {
      return res.status(400).json({
        success: false,
        message: "Already reviewed"
      });
    }


    // Media
    const media = req.files?.map(f => ({

      type: f.mimetype.startsWith("video")
        ? "video"
        : "image",

      url: f.path,
      public_id: f.filename

    })) || [];


    // Spam
    const spamScore = detectSpam(comment);


    // Add
    product.reviews.push({

      user: req.user._id,
      rating,
      title,
      comment,

      media,

      spamScore,
      isSpam: spamScore >= 5

    });


    // Recalc
    const validReviews =
      product.reviews.filter(r => !r.isSpam);

    product.numOfReviews = validReviews.length;

    product.ratings = Number(
      (
        validReviews.reduce((a, c) => a + c.rating, 0) /
        product.numOfReviews
      ).toFixed(1)
    );


    await product.save();


    res.json({
      success: true,
      message: "Review added"
    });


  } catch (err) {

    console.error("ADD REVIEW:", err);

    res.status(500).json({
      success: false,
      message: "Failed"
    });
  }
};





// ================= GET =================
export const getReviews = async (req, res) => {
  try {

    const product = await Product.findById(req.params.productId)
      .populate("reviews.user", "name avatar");


    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }


    const validReviews =
      product.reviews.filter(r => !r.isSpam);


    res.json({
      success: true,

      reviews: validReviews,

      rating: product.ratings,

      count: validReviews.length
    });


  } catch (err) {

    res.status(500).json({ success: false });
  }
};





// ================= UPDATE =================
export const updateReview = async (req, res) => {
  try {

    const { rating, title, comment } = req.body;


    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating"
      });
    }


    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false });
    }


    const review = product.reviews.id(req.params.reviewId);


    if (!review ||
        review.user.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }


    // Spam check
    if (comment) {

      const spamScore = detectSpam(comment);

      review.spamScore = spamScore;
      review.isSpam = spamScore >= 5;
      review.comment = comment;
    }


    if (title) review.title = title;
    if (rating) review.rating = rating;

    review.editedAt = Date.now();


    // Recalc
    const validReviews =
      product.reviews.filter(r => !r.isSpam);

    product.ratings = Number(
      (
        validReviews.reduce((a, c) => a + c.rating, 0) /
        validReviews.length
      ).toFixed(1)
    );


    await product.save();


    res.json({
      success: true,
      message: "Updated"
    });


  } catch (err) {

    console.error("UPDATE REVIEW:", err);

    res.status(500).json({ success: false });
  }
};





// ================= HELPFUL =================
export const markHelpful = async (req, res) => {
  try {

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ success: false });
    }


    const review =
      product.reviews.id(req.params.reviewId);


    if (!review) {
      return res.status(404).json({ success: false });
    }


    const already = review.helpfulUsers.find(
      u => u.toString() === req.user._id.toString()
    );


    if (already) {
      return res.status(400).json({
        success: false,
        message: "Already voted"
      });
    }


    review.helpful += 1;
    review.helpfulUsers.push(req.user._id);


    await product.save();


    res.json({
      success: true,
      helpful: review.helpful
    });


  } catch (err) {

    console.error("HELPFUL ERR:", err);

    res.status(500).json({ success: false });
  }
};
