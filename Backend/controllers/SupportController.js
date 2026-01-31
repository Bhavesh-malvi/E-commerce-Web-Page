import Support from "../models/SupportModel.js";
import Order from "../models/OrderModel.js";
import sendMail from "../config/email.js";


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
  // STEP 1 : Detect Delivery Issue
  // =====================================================

  if(
   msg.includes("not received") ||
   msg.includes("deliver nahi") ||
   msg.includes("nahi mila") ||
   msg.includes("late")
  ){

   // All delivered
   if(pendingOrders.length === 0){

    const reply = "✅ All your orders are delivered.";

    await saveReply(ticket,reply);

    return res.json({ success:true, reply });
   }


   // Build list
   let list = pendingOrders.map((o,i)=>{

    const names = o.items
     .map(it=>it.product?.name)
     .join(", ");

    return `${i+1}. ${names} (${o.orderStatus})`;

   }).join("\n");


   ticket.currentIntent = "order_issue";

   await ticket.save();


   const reply = `
📦 Pending Orders:

${list}

Reply with number or ALL
`;


   await saveReply(ticket,reply);

   return res.json({ success:true, reply });
  }




  // =====================================================
  // STEP 2 : Select Order
  // =====================================================

  if(ticket.currentIntent === "order_issue"){


   // ALL
   if(msg === "all"){

    ticket.currentIntent = "general";

    await ticket.save();


    const reply =
     "📞 Our team will review all your pending orders.";


    // Escalate
    await escalate(ticket,req.user,message);


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


    const reply = `
✅ Selected: ${selected.items
     .map(i=>i.product?.name)
     .join(", ")}

Status: ${selected.orderStatus}

How can I help you?
`;


    await saveReply(ticket,reply);

    return res.json({ success:true, reply });
   }
  }




  // =====================================================
  // STEP 3 : AI CHAT
  // =====================================================


  let reply = "Sorry, I couldn’t understand. Please try again.";


  try{

   const prompt = `
You are ecommerce support agent.

User message:
${message}

Reply politely in simple English/Hinglish.
`;

   const result = await model.generateContent(prompt);

   reply = result.response.text();

  }catch(aiErr){

   console.log("AI DOWN:",aiErr);

   reply =
    "⚠️ Support is busy. Our team will contact you.";
  }


  await saveReply(ticket,reply);


  res.json({ success:true, reply });



 }catch(err){

  console.log("AI ERROR:",err);

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


 await sendMail({
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