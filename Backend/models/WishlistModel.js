import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({

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


      addedAt:{
        type:Date,
        default:Date.now
      }
    }
  ],


  totalItems:{
    type:Number,
    default:0
  }

},{
  timestamps:true
});




// Fast lookup - Already unique:true on user field creates an index
// wishlistSchema.index({ user:1 });




// Auto count
wishlistSchema.pre("save",function(){

 this.totalItems = this.items.length;

});


export default mongoose.model("Wishlist",wishlistSchema);
