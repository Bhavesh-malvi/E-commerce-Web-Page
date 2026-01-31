import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({

  order:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order",
    required:true,
    unique:true
  },


  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },


  seller:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Seller"
  },


  invoiceNumber:{
    type:String,
    unique:true
  },


  pdfUrl:String,


  billingAddress:{
    name:String,
    phone:String,

    street:String,
    city:String,
    state:String,
    pincode:String
  },


  items:[
    {
      name:String,
      quantity:Number,
      price:Number,
      total:Number
    }
  ],


  subtotal:{ type:Number, min:0 },
  tax:{ type:Number, min:0 },
  shipping:{ type:Number, min:0 },
  total:{ type:Number, min:0 },


  paymentMethod:String,

  paidAt:Date,


  gst:{
    number:String,
    rate:Number,
    amount:Number
  },


  status:{
    type:String,
    enum:["generated","paid","refunded","cancelled"],
    default:"generated"
  },


  isDeleted:{
    type:Boolean,
    default:false
  }


},{
  timestamps:true
});




// Indexes
invoiceSchema.index({ createdAt:-1 });
invoiceSchema.index({ seller:1 });




// Auto Invoice No
invoiceSchema.pre("save",function(next){

 if(!this.invoiceNumber){

  this.invoiceNumber =
   "INV-" + Date.now();

 }

 next();
});


export default mongoose.model("Invoice",invoiceSchema);
