import Order from "../models/OrderModel.js";
import Seller from "../models/SellerModel.js";



export const sellerAnalytics = async (req,res)=>{

 try{

  const seller = await Seller.findOne({
   user:req.user._id
  });


  if(!seller){
   return res.status(404).json({
    success:false,
    message:"Seller not found"
   });
  }


  // Date filter (optional)
  const { from, to } = req.query;

  let dateFilter = {};

  if(from && to){
   dateFilter = {
    createdAt:{
     $gte:new Date(from),
     $lte:new Date(to)
    }
   };
  }


  const stats = await Order.aggregate([

   // Only paid
   {
    $match:{
     isPaid:true,
     ...dateFilter
    }
   },

   // Each item
   { $unwind:"$items" },


   // Seller filter
   {
    $match:{
     "items.seller": seller._id
    }
   },


   // Group
   {
    $group:{
     _id:null,

     totalRevenue:{
      $sum:"$items.price"
     },

     totalSold:{
      $sum:"$items.quantity"
     },

     totalEarning:{
      $sum:"$items.sellerEarning"
     }
    }
   }

  ]);


  res.json({
   success:true,

   analytics:{
    products: await Order.distinct(
     "items.product",
     { "items.seller": seller._id }
    ).then(r=>r.length),

    revenue: stats[0]?.totalRevenue || 0,
    sold: stats[0]?.totalSold || 0,
    earning: stats[0]?.totalEarning || 0
   }
  });


 }catch(err){

  console.log("SELLER ANALYTICS:",err);

  res.status(500).json({
   success:false,
   message:"Server error"
  });
 }
};
