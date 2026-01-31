import Invoice from "../models/InvoiceModel.js";
import Order from "../models/OrderModel.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import fs from "fs";
import path from "path";




// ================= CREATE =================
export const generateInvoice = async (req,res)=>{
try{

 const order = await Order.findById(req.params.id)
  .populate("user","name email")
  .populate("items.product","seller");


 if(!order){
  return res.status(404).json({
   success:false,
   message:"Order not found"
  });
 }


 if(!order.isPaid){
  return res.status(400).json({
   success:false,
   message:"Order not paid"
  });
 }


 // Security
 if(
  order.user._id.toString() !== req.user._id.toString() &&
  req.user.role !== "admin"
 ){
  return res.status(403).json({
   success:false,
   message:"Unauthorized"
  });
 }



 // Already exists?
 let invoice = await Invoice.findOne({
  order:order._id
 });


 if(invoice){
  return res.json({
   success:true,
   invoice
  });
 }



 // Build items
 const items = order.items.map(i=>({

  name: i.name,
  quantity: i.quantity,
  price: i.price,
  total: i.price * i.quantity

 }));



 // Strong invoice no
 const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random()*1000)}`;



 // Create invoice
 invoice = await Invoice.create({

  order: order._id,
  user: order.user._id,

  // User invoice (main)
  seller: null,

  invoiceNumber: invoiceNo,

  billingAddress: order.shippingAddress,

  items,

  subtotal: order.itemsPrice,
  tax: order.taxPrice,
  shipping: order.shippingPrice,
  total: order.totalPrice,

  paymentMethod: order.paymentInfo.method,
  paidAt: order.paidAt

 });



 // Generate PDF
 const pdfPath = await generateInvoicePDF(invoice);


 invoice.pdfUrl = pdfPath;

 await invoice.save();



 res.json({
  success:true,
  invoice
 });



}catch(err){

 console.log("INVOICE ERROR:",err);

 res.status(500).json({
  success:false,
  message:"Invoice generation failed"
 });
}
};






// ================= DOWNLOAD =================
export const downloadInvoice = async (req,res)=>{
try{

 const invoice = await Invoice
  .findById(req.params.id)
  .populate("order","user");


 if(!invoice){
  return res.status(404).json({
   success:false,
   message:"Invoice not found"
  });
 }



 // Security
 if(
  invoice.user.toString() !== req.user._id.toString() &&
  req.user.role !== "admin"
 ){
  return res.status(403).json({
   success:false,
   message:"Unauthorized"
  });
 }



 // File exists?
 if(!fs.existsSync(invoice.pdfUrl)){
  return res.status(404).json({
   success:false,
   message:"File missing"
  });
 }



 res.download(invoice.pdfUrl);



}catch(err){

 console.log("DOWNLOAD ERROR:",err);

 res.status(500).json({
  success:false,
  message:"Download failed"
 });
}
};
