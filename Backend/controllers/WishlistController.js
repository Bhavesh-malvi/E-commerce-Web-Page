import Wishlist from "../models/WishlistModel.js";
import Product from "../models/ProductModel.js";
import { updateInterest } from "../utils/updateInterest.js";


// ================= ADD =================
export const addToWishlist = async(req,res)=>{

 try{

  const { product, variant } = req.body;


  // Check product
  const existProduct =
   await Product.findById(product);


  if(!existProduct){
   return res.status(404).json({
    success:false,
    message:"Product not found"
   });
  }


  let wishlist =
   await Wishlist.findOne({ user:req.user._id });


  // Create if none
  if(!wishlist){

   wishlist = await Wishlist.create({
    user:req.user._id,
    items:[{ product, variant }]
   });

   // ✅ Track interest
   updateInterest(req.user._id, product, "wishlist")
    .catch(()=>{});


  }else{


   // Check duplicate
   const exist = wishlist.items.find(i=>
    i.product.toString() === product &&
    JSON.stringify(i.variant) ===
    JSON.stringify(variant)
   );


   if(exist){
    return res.json({
     success:true,
     message:"Already added"
    });
   }


   // Limit
   if(wishlist.items.length >= 200){
    return res.status(400).json({
     success:false,
     message:"Wishlist limit reached"
    });
   }


   wishlist.items.push({ product, variant });


   await wishlist.save();


   // ✅ Track interest
   updateInterest(req.user._id, product, "wishlist")
    .catch(()=>{});
  }


  await wishlist.populate("items.product");

  res.json({
   success:true,
   wishlist
  });


 }catch(err){

  console.error("WISHLIST ADD:",err);

  res.status(500).json({
   success:false,
   message:"Failed"
  });
 }
};





// ================= GET =================
export const getWishlist = async(req,res)=>{

 try{

  const wishlist =
   await Wishlist.findOne({ user:req.user._id })
   .populate("items.product");


  res.json({
   success:true,
   wishlist: wishlist || { items:[] }
  });


 }catch(err){

  res.status(500).json({ success:false });
 }
};




// ================= REMOVE =================
export const removeFromWishlist = async(req,res)=>{

 try{

  const wishlist =
   await Wishlist.findOne({ user:req.user._id });


  if(!wishlist){
   return res.json({ success:true });
  }


  wishlist.items =
   wishlist.items.filter(i=>
    i._id.toString() !== req.params.id
   );


  await wishlist.save();

  await wishlist.populate("items.product");

  res.json({
   success:true,
   wishlist
  });


 }catch(err){

  console.error("WISHLIST REMOVE:",err);

  res.status(500).json({ success:false });
 }
};


// ================= CLEAR WISHLIST =================
export const clearWishlist = async(req,res)=>{
  try{
    await Wishlist.findOneAndDelete({ user:req.user._id });
    res.json({ success:true, message:"Wishlist cleared" });
  }catch(err){
    console.error("CLEAR WISHLIST ERROR:", err);
    res.status(500).json({ success:false });
  }
};
