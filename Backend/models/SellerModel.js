import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({

  // Link to user
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    unique:true
  },


  // Shop Info
  shopName:{
    type:String,
    required:true,
    trim:true
  },


  gstNumber:{
    type:String,
    match:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  },


  address:{
    street:String,
    city:String,
    state:String,
    pincode:String
  },


  phone:{
    type:String,
    match:/^[0-9]{10}$/
  },


  // Verification
  isVerified:{
    type:Boolean,
    default:false
  },


  status:{
    type:String,
    enum:["pending","active","suspended"],
    default:"pending"
  },


  // Commission
  commission:{
    type:Number,
    default:10
  },


  // Wallet
  wallet:{

    balance:{
      type:Number,
      default:0
    },

    history:[
      {
        order:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Order"
        },

        amount:Number,

        type:{
          type:String,
          enum:["credit","debit"]
        },

        balanceAfter:Number,

        date:{
          type:Date,
          default:Date.now
        }
      }
    ]
  },


  // Analytics
  totalSales:{
    type:Number,
    default:0
  },

  totalOrders:{
    type:Number,
    default:0
  }


},{
  timestamps:true
});




// Index
sellerSchema.index({ user:1 });


export default mongoose.model("Seller",sellerSchema);
