import UserInterest from "../models/UserInterest.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";



export const getRecommendations = async (req,res)=>{

 try{

  // Get interest
  const interest =
   await UserInterest.findOne({
    user:req.user._id
   });


  // Already bought
  const bought = await Order.distinct(
   "items.product",
   { user:req.user._id, isPaid:true }
  );


  let query = {
   isActive:true,
   _id:{ $nin:bought }
  };


  // ================= NEW USER =================
  if(!interest){

   const products = await Product.find(query)
    .sort({ sold:-1, createdAt:-1 })
    .limit(12);

   return res.json({
    success:true,
    products
   });
  }


  // ================= INTEREST =================
  const topCats = [...interest.categories.entries()]
   .sort((a,b)=>b[1]-a[1])
   .slice(0,3)
   .map(i=>i[0]);


  const topBrands = [...interest.brands.entries()]
   .sort((a,b)=>b[1]-a[1])
   .slice(0,2)
   .map(i=>i[0]);


  // Combine
  if(topCats.length){
   query.category = { $in: topCats };
  }

  if(topBrands.length){
   query.brand = { $in: topBrands };
  }


  // Fetch
  let products = await Product.find(query)
   .sort({ sold:-1, ratings:-1 })
   .limit(30);


  // Shuffle
  products = products
   .sort(()=>0.5 - Math.random())
   .slice(0,12);


  // Fallback
  if(products.length < 6){

   const extra = await Product.find({
    isActive:true,
    _id:{ $nin: products.map(p=>p._id) }
   })
   .sort({ sold:-1 })
   .limit(6);

   products = [...products, ...extra];
  }


  res.json({
   success:true,
   products
  });


 }catch(err){

  console.error("RECO ERROR:",err);

  res.status(500).json({
   success:false,
   message:"Failed"
  });
 }
};
