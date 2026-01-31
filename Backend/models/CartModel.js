import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    unique:true
  },


  items:[

    {
      product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
      },


      variant:{
        color:String,
        size:String
      },


      quantity:{
        type:Number,
        min:1,
        default:1
      },


      unitPrice:{
        type:Number,
        required:true
      },


      finalPrice:{
        type:Number,
        required:true
      },


      inStock:{
        type:Boolean,
        default:true
      }
    }

  ],


  coupon:{
    code:String,
    discount:Number
  },


  totalItems:{
    type:Number,
    default:0
  },


  totalPrice:{
    type:Number,
    default:0
  }

},{
  timestamps:true
});




// Index
cartSchema.index({ user:1 });




// Auto calculate
cartSchema.pre("save",function(){

 let items = 0;
 let price = 0;


 this.items.forEach(i=>{

  items += i.quantity;
  price += i.finalPrice * i.quantity;

 });


 this.totalItems = items;
 this.totalPrice = price;
});


export default mongoose.model("Cart",cartSchema);
