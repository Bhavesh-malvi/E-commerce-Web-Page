import UserInterest from "../models/UserInterest.js";
import Product from "../models/ProductModel.js";



// ================= ACTION WEIGHTS =================
const WEIGHTS = {
  view: 1,
  cart: 3,
  order: 5,
  wishlist: 2
};



// ================= UPDATE INTEREST =================
export const updateInterest = async (
  userId,
  productId,
  action = "view"
) => {

  try {

    if (!userId || !productId) return;


    // Get product (only needed fields)
    const product = await Product.findById(productId)
      .select("category brand");

    if (!product) return;


    // Get interest
    let interest = await UserInterest.findOne({
      user: userId
    });


    // Create if new
    if (!interest) {

      interest = await UserInterest.create({
        user: userId,
        categories: new Map(),
        brands: new Map()
      });

    }


    // Weight
    const weight = WEIGHTS[action] || 1;


    // ========== CATEGORY ==========
    const currentCat =
      interest.categories.get(product.category) || 0;

    interest.categories.set(
      product.category,
      Math.min(currentCat + weight, 100)
    );


    // ========== BRAND ==========
    const currentBrand =
      interest.brands.get(product.brand) || 0;

    interest.brands.set(
      product.brand,
      Math.min(currentBrand + weight, 100)
    );


    await interest.save();


  } catch (err) {

    console.error("UPDATE INTEREST ERROR:", err.message);

  }
};
