import Support from "../models/SupportModel.js";
import Order from "../models/OrderModel.js";
import { sendEmailApi } from "../config/emailApi.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


// ================= AI CHAT =================
export const aiChat = async (req,res)=>{

 try{

  const { message } = req.body;

  if(!message){
   return res.status(400).json({
    success:false,
    message:"Message required"
   });
  }


  const msg = message.toLowerCase();


  // ================= GET / CREATE TICKET =================

  let ticket = await Support.findOne({
   user:req.user._id,
   status:"open"
  }).populate("selectedOrder");


  if(!ticket){

   ticket = await Support.create({
    user:req.user._id,
    messages:[]
   });
  }


  // Save user msg
  ticket.messages.push({
   role:"user",
   text:message,
   time:new Date()
  });


  // Limit history (100 msgs)
  if(ticket.messages.length > 100){
   ticket.messages = ticket.messages.slice(-100);
  }



  // ================= GET ORDERS =================

  const orders = await Order
   .find({ user:req.user._id })
   .populate("items.product","name");


  const pendingOrders =
   orders.filter(o=>o.orderStatus !== "Delivered");




  // =====================================================
  // STEP 1 : Detect Order Query
  // =====================================================

  const orderKeywords = [
    "order", "orders", "my order", "mera order",
    "where is my", "kaha hai", "kaha h", "track",
    "delivery", "delivered", "not received", "nahi mila",
    "deliver nahi", "late", "status", "shipping"
  ];

  const isOrderQuery = orderKeywords.some(k => msg.includes(k));

  if(isOrderQuery && ticket.currentIntent !== "order_issue"){

   // No orders at all
   if(orders.length === 0){
    const reply = "📭 You don't have any orders yet. Start shopping now!";
    await saveReply(ticket,reply);
    return res.json({ success:true, reply });
   }

   // All delivered
   if(pendingOrders.length === 0){
    const reply = "✅ Great news! All your orders have been delivered successfully. 🎉";
    await saveReply(ticket,reply);
    return res.json({ success:true, reply });
   }

   // Build professional order list
   let list = pendingOrders.map((o,i)=>{
    const names = o.items.map(it=>it.product?.name || 'Item').join(", ");
    const shortName = names.length > 30 ? names.slice(0,30) + '...' : names;
    const statusEmoji = {
      'Processing': '🔄',
      'Confirmed': '✅',
      'Shipped': '🚚',
      'Out for Delivery': '📦',
      'Pending': '⏳'
    }[o.orderStatus] || '📋';
    
    return `${i+1}. ${statusEmoji} ${shortName}\n   Status: ${o.orderStatus}`;
   }).join("\n\n");

   ticket.currentIntent = "order_issue";
   await ticket.save();

   const reply = `📦 *Your Pending Orders:*\n\n${list}\n\n💬 Reply with:\n• Order number (1, 2, 3...) for specific order details\n• "ALL" for complete information of all orders`;

   await saveReply(ticket,reply);
   return res.json({ success:true, reply });
  }




  // =====================================================
  // STEP 2 : Select Order
  // =====================================================

  if(ticket.currentIntent === "order_issue"){

   // ALL - Show detailed info for all orders
   if(msg === "all"){
    ticket.currentIntent = "general";
    await ticket.save();

    // Build detailed info for all pending orders
    let allOrdersInfo = pendingOrders.map((o, i) => {
      const names = o.items.map(it => it.product?.name || 'Item').join(", ");
      const orderDate = new Date(o.createdAt).toLocaleDateString('en-IN');
      const estimatedDays = { 'Processing': '5-7', 'Confirmed': '4-6', 'Shipped': '2-4', 'Out for Delivery': '1' };
      const eta = estimatedDays[o.orderStatus] || '3-5';
      
      return `📦 Order #${i+1}\n` +
             `   Items: ${names.slice(0,40)}${names.length > 40 ? '...' : ''}\n` +
             `   Status: ${o.orderStatus}\n` +
             `   Ordered: ${orderDate}\n` +
             `   Expected: ${eta} days`;
    }).join("\n\n");

    const reply = `📋 *All Your Pending Orders:*\n\n${allOrdersInfo}\n\n💡 Need help with a specific order? Just ask!`;

    await saveReply(ticket,reply);
    return res.json({ success:true, reply });
   }


   // Number
   const num = parseInt(msg);


   if(!isNaN(num)){

    const selected = pendingOrders[num-1];


    if(!selected){

     const reply = "❌ Invalid selection. Try again.";

     await saveReply(ticket,reply);

     return res.json({ success:true, reply });
    }


    ticket.selectedOrder = selected._id;
    ticket.currentIntent = "general";
    await ticket.save();

    // Build detailed response for selected order
    const names = selected.items.map(i => i.product?.name || 'Item').join(", ");
    const orderDate = new Date(selected.createdAt).toLocaleDateString('en-IN');
    const estimatedDays = { 'Processing': '5-7', 'Confirmed': '4-6', 'Shipped': '2-4', 'Out for Delivery': '1' };
    const eta = estimatedDays[selected.orderStatus] || '3-5';
    
    const statusInfo = {
      'Processing': '🔄 Your order is being processed by the seller.',
      'Confirmed': '✅ Order confirmed! Will be shipped soon.',
      'Shipped': '🚚 Your order is on the way!',
      'Out for Delivery': '📦 Exciting! Your order is out for delivery today!',
      'Pending': '⏳ Order is pending confirmation.'
    }[selected.orderStatus] || '📋 Order is being processed.';

    const reply = `📦 *Order Details*\n\n` +
      `🛍️ Items: ${names}\n` +
      `📅 Ordered: ${orderDate}\n` +
      `📍 Status: ${selected.orderStatus}\n` +
      `⏰ Expected: ${eta} days\n\n` +
      `${statusInfo}\n\n` +
      `💬 Need more help? Ask about refund, cancel, or any other query!`;

    await saveReply(ticket,reply);
    return res.json({ success:true, reply });
   }
  }




  // =====================================================
  // STEP 3 : AI CHAT
  // =====================================================

  let reply = "Sorry, I couldn't understand. Please try again.";

  // Helper function to delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Retry function with exponential backoff
  const callAIWithRetry = async (prompt, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        if (err.status === 429 && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;

          await delay(waitTime);
        } else {
          throw err;
        }
      }
    }
  };

  try {
    const prompt = `You are a friendly customer support assistant. Keep response to 1-2 sentences. User: "${message}"`;
    reply = await callAIWithRetry(prompt);
  } catch(aiErr) {
    console.error("AI DOWN:", aiErr);

    // Smart fallback responses
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hallo")) {
      reply = "Hello! 👋 How can I help you today? Ask about orders, returns, or shopping!";
    } else if (lowerMsg.includes("order") || lowerMsg.includes("track")) {
      reply = "📦 To track your order, go to 'My Orders' in your profile to see all statuses!";
    } else if (lowerMsg.includes("refund") || lowerMsg.includes("return")) {
      reply = "💰 For refunds/returns, use the 'Return' option in your order details.";
    } else if (lowerMsg.includes("payment") || lowerMsg.includes("pay")) {
      reply = "💳 We accept cards, UPI, and wallets. Having issues? Try a different method.";
    } else if (lowerMsg.includes("delivery") || lowerMsg.includes("shipping")) {
      reply = "🚚 Delivery usually takes 3-7 days. Track your order in 'My Orders' section!";
    } else {
      reply = "😊 Thanks for reaching out! Please try again in a moment or email support@store.com";
    }
  }


  await saveReply(ticket,reply);


  res.json({ success:true, reply });



 }catch(err){

  console.error("AI ERROR:",err);

  res.status(500).json({
   success:false,
   message:"Support failed"
  });
 }
};





// ================= HELPERS =================


// Save AI msg
const saveReply = async(ticket,text)=>{

 ticket.messages.push({
  role:"ai",
  text,
  time:new Date()
 });

 await ticket.save();
};


// Escalate
const escalate = async(ticket,user,msg)=>{

 ticket.status = "escalated";

 await ticket.save();


 await sendEmailApi({
  email:process.env.ADMIN_EMAIL,
  subject:"🚨 Support Escalation",
  message:`
User: ${user.email}

Message: ${msg}

Ticket: ${ticket._id}
`
 });
};


export const getChatHistory = async(req,res)=>{
  const ticket = await Support.findOne({
    user:req.user._id,
    status:"open"
  });

  res.json({
    success:true,
    messages: ticket?.messages || []
  });
};