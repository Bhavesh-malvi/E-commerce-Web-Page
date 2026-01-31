import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    unique:true,
    required:true
  },


  // Category scores
  categories:{
    type:Map,
    of:Number,
    default:{}
  },


  // Brand scores
  brands:{
    type:Map,
    of:Number,
    default:{}
  },


  // Product scores
  products:{
    type:Map,
    of:Number,
    default:{}
  },


  // Search history
  keywords:[
    {
      term:String,
      count:Number
    }
  ],


  lastActivity:{
    type:Date,
    default:Date.now
  }

},{
  timestamps:true
});




// Fast lookup
interestSchema.index({ user:1 });




// Auto update activity
interestSchema.pre("save",function(next){

 this.lastActivity = Date.now();
 next();

});


export default mongoose.model("UserInterest",interestSchema);
