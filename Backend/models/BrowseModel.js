import mongoose from "mongoose";

const browseSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },


  sessionId:String,


  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },


  category:String,


  action:{
    type:String,
    enum:[
      "view",
      "search",
      "add_cart",
      "wishlist",
      "checkout",
      "buy"
    ]
  },


  keyword:String,


  duration:Number,


  device:String,


  ip:String,


  geo:{
    country:String,
    state:String,
    city:String
  },


  referrer:String,


  isBot:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});




// Indexes
browseSchema.index({ user:1, createdAt:-1 });
browseSchema.index({ product:1 });
browseSchema.index({ action:1 });
browseSchema.index({ sessionId:1 });




// Auto delete after 6 months
browseSchema.index(
 { createdAt:1 },
 { expireAfterSeconds: 15552000 }
);


export default mongoose.model("Browse",browseSchema);
