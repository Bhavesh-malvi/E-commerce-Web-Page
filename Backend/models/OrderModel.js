import mongoose from "mongoose";
import crypto from "crypto";

const orderSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },


  trackingId:{
    type:String,
    unique:true
  },


  items:[
    {
      product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
      },

      seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Seller"
      },

      name:String,
      image:String,

      quantity:{
        type:Number,
        min:1
      },

      price:{
        type:Number,
        min:0
      },


      commission:Number,
      sellerEarning:Number,

      // Return System
      returnStatus:{
        type:String,
        default:"none",
        enum:["none","requested","approved","rejected","picked","returned","refunded"]
      },
      returnReason:String,
      returnImages:[String],
      returnDescription:String
    }
  ],


  shippingAddress:{
    name:String,
    phone:String,

    street:String,
    city:String,
    state:String,
    pincode:String,

    landmark:String
  },


  paymentInfo:{
    method:{
      type:String,
      enum:["cod","razorpay","stripe"]
    },

    transactionId:String,

    status:{
      type:String,
      default:"pending"
    }
  },


  itemsPrice:{ type:Number, min:0 },
  taxPrice:{ type:Number, min:0 },
  shippingPrice:{ type:Number, min:0 },
  
  coupon: {
    code: String,
    discount: Number
  },

  totalPrice:{ type:Number, min:0 },


  isPaid:{
    type:Boolean,
    default:false
  },

  paidAt:Date,


  paymentResult:{
    id:String,
    status:String,
    email:String
  },


  orderStatus:{
    type:String,
    default:"Processing",
    enum:[
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ]
  },


  tracking:{
    qrCode:String,

    currentLocation:{
      lat:Number,
      lng:Number,
      updatedAt:Date
    },

    deliveryStatus:{
      type:String,
      default:"Pending",
      enum:[
        "Pending",
        "Picked",
        "In Transit",
        "Near You",
        "Delivered",
        "Returned"
      ]
    }
  },

  deliveryOTP: {
      type: String
  },


  deliveryPartner:{
    name:String,
    phone:String
  },


  returnRequest:{
    status:{
      type:String,
      default:"none",
      enum:["none","requested","approved","rejected","refunded"]
    },

    reason:String
  },


  refund:{
    amount:Number,
    reason:String,
    date:Date
  },


  cancelledAt:Date,

  deliveredAt:Date

},{
  timestamps:true
});




// Indexes
orderSchema.index({ user:1 });
orderSchema.index({ trackingId:1 });
orderSchema.index({ createdAt:1 });
orderSchema.index({ isPaid:1 });




// Tracking ID auto
orderSchema.pre("save",function(){

 if(!this.trackingId){

  this.trackingId =
   "TRK-" +
   crypto.randomBytes(6).toString("hex").toUpperCase();

 }


});


export default mongoose.model("Order",orderSchema);
