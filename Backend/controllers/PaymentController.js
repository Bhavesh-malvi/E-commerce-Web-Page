import Stripe from "stripe";
import Order from "../models/OrderModel.js";
import mongoose from "mongoose";
import { calculateCommission } from "../utils/commission.js";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



// ================= VERIFY STRIPE =================
export const verifyStripePayment = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { paymentIntentId, orderId, sessionId } = req.body;


    if ((!paymentIntentId && !sessionId) || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    let intentId = paymentIntentId;

    // Retrieve Intent ID from Session if provided
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if(session.payment_status === 'paid'){
          intentId = session.payment_intent;
      } else {
         return res.status(400).json({
            success: false,
            message: "Payment not completed"
         });
      }
    }


    // ================= STRIPE =================
    const intent =
      await stripe.paymentIntents.retrieve(intentId);


    if (intent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment failed"
      });
    }


    // ================= ORDER =================
    const order = await Order
      .findById(orderId)
      .session(session);


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    // Already paid
    if (order.isPaid) {

      await session.commitTransaction();

      return res.json({
        success: true,
        message: "Already paid",
        order
      });
    }



    // ================= COMMISSION =================
    const data = await calculateCommission(order, session);



    // ================= UPDATE ORDER =================
    order.isPaid = true;
    order.paidAt = new Date();

    order.paymentResult = {
      id: intent.id,
      status: intent.status,
      email: intent.receipt_email
    };

    order.paymentInfo.status = "paid";

    order.orderStatus = "Packed";

    order.adminCommission = data.admin;
    order.sellerEarning = data.seller;


    await order.save({ session });



    await session.commitTransaction();



    res.json({
      success: true,
      message: "Payment verified",
      order
    });


  } catch (err) {

    await session.abortTransaction();

    console.error("STRIPE VERIFY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });

  } finally {

    session.endSession();
  }
};
