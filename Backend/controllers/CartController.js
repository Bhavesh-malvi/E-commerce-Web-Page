import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";
import { updateInterest } from "../utils/updateInterest.js";



// ================= ADD TO CART =================
export const addToCart = async (req, res) => {
  try {

    const { productId, quantity = 1, variant } = req.body;
    console.log("ADD TO CART REQUEST:", { productId, quantity, variant, body: req.body });

    // Validate
    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity"
      });
    }

    // Get product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not available"
      });
    }

    // Stock check
    let targetStock = product.stock;
    let variantPrice = product.discountPrice || product.price;

    if (variant) {
       const v = product.variants.find(v => v.color === variant.color && v.size === variant.size);
       if (v) {
          targetStock = v.stock;
          if (v.price) variantPrice = v.price;
       }
    }

    if (quantity > targetStock) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock"
      });
    }

    // Get cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }

    // Track interest (non-blocking)
    updateInterest(req.user._id, productId, "cart")
      .catch(() => {});


    // Check item exists with same variant
    const index = cart.items.findIndex(
      i => i.product.toString() === productId && 
           i.variant?.color === variant?.color && 
           i.variant?.size === variant?.size
    );


    if (index > -1) {

      // Update quantity
      const newQty =
        cart.items[index].quantity + quantity;

      if (newQty > targetStock) {
        return res.status(400).json({
          success: false,
          message: "Stock limit exceeded"
        });
      }

      cart.items[index].quantity = newQty;

    } else {

      // Add new item
      cart.items.push({
        product: productId,
        variant: variant ? { color: variant.color, size: variant.size } : undefined,
        quantity,
        unitPrice: product.price,
        finalPrice: variantPrice
      });

    }


    // Save (pre-save hook will recalculate totals)
    await cart.save();


    res.json({
      success: true,
      message: "Added to cart",
      cart
    });

  } catch (error) {

    console.log("ADD CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Add to cart failed"
    });
  }
};




// ================= GET CART =================
export const getCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({
      user: req.user._id
    }).populate(
      "items.product",
      "name price discountPrice mainImages stock"
    );


    if (!cart) {
      return res.json({
        success: true,
        cart: null
      });
    }


    res.json({
      success: true,
      cart
    });

  } catch (error) {

    console.log("GET CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Fetch cart failed"
    });
  }
};




// ================= UPDATE QUANTITY =================
export const updateQuantity = async (req, res) => {
  try {

    const { productId, quantity } = req.body;
    console.log("UPDATE QTY REQUEST:", { productId, quantity, body: req.body });


    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid data"
      });
    }


    const cart = await Cart.findOne({
      user: req.user._id
    }).populate(
      "items.product",
      "name price discountPrice mainImages stock"
    );


    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }


    const item = cart.items.find(i => {
      const itemProductId = i.product._id ? i.product._id.toString() : i.product.toString();
      return itemProductId === productId;
    });


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }


    // Check stock
    const product = await Product.findById(productId);

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock"
      });
    }


    // Update qty
    item.quantity = quantity;

    // Save (pre-save hook will recalculate totals)
    await cart.save();


    res.json({
      success: true,
      message: "Quantity updated",
      cart
    });

  } catch (error) {

    console.log("UPDATE QTY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};




// ================= REMOVE ITEM =================
export const removeFromCart = async (req, res) => {
  try {

    const productId = req.params.productId;

    const cart = await Cart.findOne({
      user: req.user._id
    }).populate(
      "items.product",
      "name price discountPrice mainImages stock"
    );

    if (!cart) {
      return res.json({
        success: true,
        cart: null
      });
    }

    cart.items = cart.items.filter(i => {
      const itemProductId = i.product._id ? i.product._id.toString() : i.product.toString();
      return itemProductId !== productId;
    });

    // Save (pre-save hook will recalculate totals)
    await cart.save();

    res.json({
      success: true,
      message: "Removed from cart",
      cart
    });

  } catch (err) {

    console.log("REMOVE CART ERROR:", err);

    res.status(500).json({
      success: false
    });
  }
};





// ================= CLEAR CART =================
export const clearCart = async (req, res) => {
  try {

    await Cart.findOneAndDelete({
      user: req.user._id
    });


    res.json({
      success: true,
      message: "Cart cleared"
    });

  } catch (error) {

    console.log("CLEAR CART ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Clear failed"
    });
  }
};
