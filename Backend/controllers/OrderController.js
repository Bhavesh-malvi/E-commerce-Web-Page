import Order from "../models/OrderModel.js";
import Cart from "../models/CartModel.js";
import Coupon from "../models/CouponModel.js";
import Seller from "../models/SellerModel.js";
import mongoose from "mongoose";
import crypto from "crypto";
import QRCode from "qrcode";
import { updateInterest } from "../utils/updateInterest.js";
import Stripe from 'stripe';
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { io } from "../index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// ================= PLACE ORDER =================
export const placeOrder = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { shippingAddress, paymentMethod, couponCode } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }


    // Get cart
    const cart = await Cart.findOne({
      user: req.user._id
    }).populate("items.product");


    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }


    // Tracking ID
    const trackingId = crypto.randomBytes(6).toString("hex");


    let orderItems = [];
    let itemsPrice = 0;



    // ================= PROCESS CART =================
    for (const item of cart.items) {

      const product = item.product;

      if (!product) {
        throw new Error("Invalid product in cart");
      }


      // Stock check
      if (item.quantity > product.stock) {
        throw new Error(`${product.name} out of stock`);
      }


      const price =
        product.discountPrice || product.price;


      // Commission
      const commission =
        (price * item.quantity) *
        (product.commissionPercent / 100);


      const sellerEarning =
        (price * item.quantity) - commission;




      // Resolve Image (Variant vs Main)
      let finalImage = product.mainImages[0]?.url;

      if (item.variant && (item.variant.color || item.variant.size)) {
        const matchedVariant = product.variants.find(v => 
          (v.color === item.variant.color || !item.variant.color) && 
          (v.size === item.variant.size || !item.variant.size)
        );

        if (matchedVariant && matchedVariant.images && matchedVariant.images.length > 0) {
          finalImage = matchedVariant.images[0].url;
        }
      }


      orderItems.push({

        product: product._id,
        seller: product.seller,
        name: product.name,
        image: finalImage,
        
        variant: item.variant, // Store variant details too

        quantity: item.quantity,
        price,

        commission,
        sellerEarning
      });



      // Update stock
      product.stock -= item.quantity;
      product.sold += item.quantity;

      await product.save({ session });



      itemsPrice += price * item.quantity;
    }



    // ================= PRICE =================
    const taxPrice = itemsPrice * 0.05;

    const shippingPrice =
      itemsPrice > 1000 ? 0 : 50;


    let totalPrice = itemsPrice + taxPrice + shippingPrice;
    
    // ================= COUPON =================
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true
      });

      if (coupon) {
        // Validate expiry
        if (new Date(coupon.expiry) >= new Date()) {
          // Validate min amount
          if (totalPrice >= coupon.minAmount) {
             // Validate usage limit
             if (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) {
                // Validate if already used by user
                if (!coupon.usedBy.includes(req.user._id)) {
                  
                  // Calculate
                  if (coupon.type === "flat") {
                    couponDiscount = coupon.value;
                  } else {
                    couponDiscount = (totalPrice * coupon.value) / 100;
                    if (coupon.maxDiscount) {
                      couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
                    }
                  }
                  
                  // Apply
                  couponDiscount = Math.min(couponDiscount, totalPrice);
                  totalPrice -= couponDiscount;
                  
                  appliedCoupon = {
                    code: coupon.code,
                    discount: couponDiscount
                  };

                  // Update coupon stats
                  coupon.usedCount += 1;
                  coupon.usedBy.push(req.user._id);
                  await coupon.save({ session });
                }
             }
          }
        }
      }
    }



    // ================= CREATE ORDER =================
    const order = await Order.create([{

      user: req.user._id,

      trackingId,

      items: orderItems,

      items: orderItems,

      shippingAddress,
      
      coupon: appliedCoupon,

      paymentInfo: {
        method: paymentMethod,
        status: "pending"
      },

      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,

      orderStatus: "Processing"

    }], { session });



    // Clear cart
    await Cart.deleteOne({
      user: req.user._id
    }).session(session);



    await session.commitTransaction();



    // ================= UPDATE INTEREST =================
    orderItems.forEach(item => {
      updateInterest(req.user._id, item.product, "order")
        .catch(() => { });
    });

    // STRIPE INTEGRATION
    if (paymentMethod === 'stripe') {
      const line_items = orderItems.map((item) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects paisa
        },
        quantity: item.quantity,
      }));

      // Add delivery charges if any
      if (shippingPrice > 0) {
        line_items.push({
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Delivery Charges',
            },
            unit_amount: shippingPrice * 100,
          },
          quantity: 1,
        });
      }

      // Add tax if any (or handle tax within items, but we added tax separately)
      // Since tax is calculated on total, let's just create a line item for Tax for simplicity
      // Or better, since we have totalPrice which handles coupon, tax, etc.
      // Stripe line items must sum up.
      // Our calculation: totalPrice = itemsPrice + taxPrice + shippingPrice - couponDiscount
      // It's tricky to map exactly if we used global discount.
      
      // Simpler approach for now:
      // Create one line item for the TOTAL amount to avoid mismatch
      /*
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
             price_data: {
              currency: 'inr',
              product_data: {
                name: 'Order Total',
              },
              unit_amount: Math.round(totalPrice * 100),
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${order[0]._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${order[0]._id}`,
      });
      */
      
      // Let's try to pass actual items
      // If we have discount, we can add a negative line item or use `discounts` feature (complex).
      // Let's stick to the "Total Amount" approach for robustness in this simple integration,
      // Or pass all items and handle discount as a reduction if possible.
      // Easiest reliable way: Pass items, and if there's tax/shipping/discount diff, add/subtract a "Adjustment" item.
      
      // Let's use the TOTAL amount for now to ensure the charged amount matches `totalPrice`.
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'E-commerce Order Payment',
                description: `Order #${order[0]._id} - ${orderItems.length} items`,
              },
              unit_amount: Math.round(totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // Make sure FRONTEND_URL is set, otherwise default to localhost
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders`,
        metadata: {
          orderId: order[0]._id.toString(),
        }
      });

      res.status(201).json({
        success: true,
        message: "Order placed, redirecting to payment",
        order: order[0],
        session_url: session.url
      });
      return; 
    }


    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order[0]
    });



  } catch (err) {

    await session.abortTransaction();

    console.log("ORDER ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {

    session.endSession();
  }
};





// ================= MY ORDERS =================
export const myOrders = async (req, res) => {

  try {

    const orders = await Order
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });


    res.json({
      success: true,
      orders
    });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Failed to load orders"
    });
  }
};





// ================= SINGLE ORDER =================
export const getOrder = async (req, res) => {

  try {

    const order = await Order
      .findById(req.params.id)
      .populate("user", "name email");


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // Security
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }


    res.json({
      success: true,
      order
    });


  } catch (err) {

    res.status(500).json({
      success: false
    });
  }
};





// ================= GENERATE QR =================
export const generateQRCode = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);


    if (!order) {
      return res.status(404).json({
        success: false
      });
    }


    const url =
      `${process.env.FRONTEND_URL}/track?tid=${order.trackingId}`;


    const qr = await QRCode.toDataURL(url);


    order.tracking.qrCode = qr;

    await order.save();


    res.json({
      success: true,
      qr
    });


  } catch (err) {

    res.status(500).json({
      success: false
    });
  }
};





// ================= UPDATE LOCATION =================
export const updateLocation = async (req, res) => {

  try {

    const { lat, lng, status } = req.body;


    const order = await Order.findById(req.params.id);


    if (!order) {
      return res.status(404).json({
        success: false
      });
    }


    // Only admin / delivery
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }


    order.tracking.currentLocation = {
      lat,
      lng,
      updatedAt: new Date()
    };


    if (status) {
      order.tracking.deliveryStatus = status;
    }


    await order.save();


    res.json({
      success: true,
      message: "Location updated"
    });


  } catch (err) {

    res.status(500).json({
      success: false
    });
  }
};





// ================= TRACK BY EMAIL =================
export const trackByIdAndEmail = async (req, res) => {

  try {

    const { trackingId, email } = req.body;


    const order = await Order
      .findOne({ trackingId })
      .populate("user", "email");


    if (!order) {
      return res.status(404).json({
        success: false
      });
    }


    if (order.user.email !== email) {
      return res.status(403).json({
        success: false
      });
    }


    res.json({
      success: true,
      tracking: order.tracking,
      status: order.orderStatus
    });


  } catch (err) {

    res.status(500).json({
      success: false
    });
  }
};





// ================= REQUEST RETURN =================
// ================= GET SELLER ORDERS =================
export const getSellerOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(403).json({ success: false, message: "Not a seller" });
    }

    const orders = await Order.find({
      "items.seller": seller._id
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


// ================= UPDATE ORDER STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if user is admin
    if (req.user.role === 'admin') {
      order.orderStatus = status;
    } else {
      // Check if user is the seller of ANY item in the order
      const seller = await Seller.findOne({ user: req.user._id });
      if (!seller) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      const isSellerOrder = order.items.some(
        item => item.seller.toString() === seller._id.toString()
      );

      if (!isSellerOrder) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
      
      order.orderStatus = status;
    }

    await order.save();

    // Emit real-time update to the user
    io.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.orderStatus,
      message: `Your order status has been updated to ${order.orderStatus}`
    });

    res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};


export const requestReturn = async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);


    if (!order) {
      return res.status(404).json({
        success: false
      });
    }


    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false
      });
    }


    order.returnRequest = {
      status: "requested",
      reason: req.body.reason
    };


    order.orderStatus = "Cancelled";


    await order.save();


    res.json({
      success: true,
      message: "Return requested"
    });


  } catch (err) {

    res.status(500).json({
      success: false
    });
  }
};




// ================= GET INVOICE =================
export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.seller',
        select: 'shopName address phone'
      });
    
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Get seller info from the first item (most orders are single-seller)
    let sellerInfo = null;
    if (order.items?.length > 0 && order.items[0].seller) {
      sellerInfo = order.items[0].seller;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    generateInvoice(order, res, sellerInfo);

  } catch (error) {
    console.error("INVOICE ERROR:", error);
    res.status(500).json({ success: false, message: "Could not generate invoice" });
  }
};


// ================= UPDATE LOCATION (QR SCAN - TRACKING ID) =================
export const updateLocationByTracking = async (req, res) => {
  try {
    const { trackingId, lat, lng } = req.body;
    
    const order = await Order.findOne({ trackingId });
    if (!order) return res.status(404).json({ success: false, message: "Tracking ID not found" });

    order.tracking.currentLocation = {
      lat,
      lng,
      updatedAt: new Date()
    };
    
    // Auto update removed as per user request
    // Status must be manually updated by seller/delivery partner

    await order.save();

    // Emit real-time location update to all clients watching this tracking ID
    io.emit("locationUpdated", {
      trackingId,
      location: {
        lat,
        lng,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, message: "Location updated" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};



// ================= DELIVERY OTP CHECK =================
import { sendEmail } from "../utils/email.js";

export const sendDeliveryOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'email name');
    
    if(!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    order.deliveryOTP = otp;
    await order.save();

    // Send Email
    const message = `Your Delivery OTP for Order #${order._id.toString().slice(-6)} is: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
        <h2 style="color: #6d28d9;">Delivery Verification</h2>
        <p>Hello ${order.user.name},</p>
        <p>Your order is out for delivery. Please share this OTP with the delivery partner only when you receive your package.</p>
        <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore.</p>
      </div>
    `;

    // Attempt to send email
    const emailRes = await sendEmail(order.user.email, "Your Delivery OTP 📦", message, html);

    console.log(`[DEV] OTP for ${order._id}: ${otp}`); // Keep log for dev backup

    if(emailRes.success) {
        res.json({ success: true, message: "OTP sent to registered email!" });
    } else {
        // Fallback if email fails (for dev mainly)
        res.json({ success: true, message: "OTP generated (Email failed, check console)", dev_otp: otp });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};



// ================= VERIFY DELIVERY =================
export const verifyDelivery = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Debug log
    console.log(`[VERIFY] Received: '${otp}' | Stored: '${order.deliveryOTP}'`);

    const receivedOTP = otp ? otp.toString().trim() : '';
    const storedOTP = order.deliveryOTP ? order.deliveryOTP.toString().trim() : '';

    if (!storedOTP || receivedOTP !== storedOTP) {
      return res.status(400).json({ 
          success: false, 
          message: `Invalid OTP. Received: '${receivedOTP}', Expected: '${storedOTP}'` 
      });
    }

    order.orderStatus = 'Delivered';
    order.tracking.deliveryStatus = 'Delivered';
    order.deliveredAt = new Date();
    order.isPaid = true; // COD case
    
    if(order.paymentInfo.method === 'cod') {
        order.paymentInfo.status = 'succeeded';
        order.paymentInfo.transactionId = 'COD-' + Date.now();
    }
    
    // clear OTP
    order.deliveryOTP = null; 

    await order.save();
    
    // Emit real-time update to the user
    io.to(order.user.toString()).emit("orderStatusUpdated", {
        orderId: order._id,
        status: 'Delivered',
        message: 'Your order has been delivered successfully! 🎉'
    });

    res.json({ success: true, message: "Order Delivered Successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};


// ================= GET PUBLIC TRACKING INFO =================
export const getPublicTrackingInfo = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const order = await Order.findOne({ trackingId }).select('tracking orderStatus createdAt deliveredAt items');
    
    if (!order) return res.status(404).json({ success: false, message: "Invalid Tracking ID" });

    res.json({
      success: true,
      order: {
        trackingId: order.trackingId,
        status: order.orderStatus,
        location: order.tracking.currentLocation,
        history: {
            processing: order.createdAt,
            delivered: order.deliveredAt
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ================= GET ALL ORDERS (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};
