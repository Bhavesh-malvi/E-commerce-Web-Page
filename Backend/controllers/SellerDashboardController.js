import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import Seller from "../models/SellerModel.js";



// ================= DASHBOARD =================
export const sellerDashboard = async (req,res)=>{

 try{

  // Get seller
  const seller = await Seller.findOne({
   user:req.user._id
  });

  if(!seller){
   return res.status(404).json({
    success:false,
    message:"Seller not found"
   });
  }


  // Total products
  const products = await Product.countDocuments({
   seller:seller._id
  });


  // Total orders (using item.seller)
  const orders = await Order.countDocuments({
   "items.seller": seller._id
  });


  // Total earnings
  const earning = await Order.aggregate([

   { $match:{ isPaid:true }},

   { $unwind:"$items" },

   {
    $match:{
     "items.seller": seller._id
    }
   },

   {
    $group:{
     _id:null,
     total:{ $sum:"$items.sellerEarning" }
    }
   }

  ]);


  res.json({
   success:true,
   stats:{
    products,
    orders,
    earning: earning[0]?.total || 0
   }
  });

 }
 catch(err){

  console.log("SELLER DASH ERR:",err);

  res.status(500).json({
   success:false,
   message:"Server error"
  });
 }
};





// ================= SALES STATS =================
export const sellerStats = async (req,res)=>{

 try{

  const seller = await Seller.findOne({
   user:req.user._id
  });


  if(!seller){
   return res.status(404).json({
    success:false
   });
  }


  const orders = await Order.find({
   isPaid:true,
   "items.seller": seller._id
  }).select("items createdAt");


  let total = 0;
  let totalOrders = 0;


  orders.forEach(o=>{

   o.items.forEach(i=>{

    if(i.seller?.toString() === seller._id.toString()){

     total += i.sellerEarning || 0;
     totalOrders++;
    }

   });

  });


  res.json({
   success:true,
   totalEarning: total,
   totalOrders,
   orders
  });


 }catch(err){

  console.log("SELLER STATS ERR:",err);

  res.status(500).json({ success:false });
 }
};
