import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

  code:{
    type:String,
    required:true,
    unique:true,
    uppercase:true
  },


  campaign:String,   // Diwali2026


  type:{
    type:String,
    enum:["flat","percent"],
    required:true
  },


  value:{
    type:Number,
    required:true
  },


  minAmount:{
    type:Number,
    default:0
  },


  maxDiscount:Number,


  expiry:{
    type:Date,
    required:true
  },


  usageLimit:{
    type:Number,
    default:0
  },


  usedCount:{
    type:Number,
    default:0
  },


  usedBy:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  ],


  // Scope
  allowedCategories:[String],

  allowedProducts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Product"
    }
  ],


  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },


  isActive:{
    type:Boolean,
    default:true
  },


  isDeleted:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});




// Index
// couponSchema.index({ code:1 });




// Auto disable
couponSchema.pre("save",function(){

 if(this.expiry < new Date()){
  this.isActive = false;
 }


});


export default mongoose.model("Coupon",couponSchema);
