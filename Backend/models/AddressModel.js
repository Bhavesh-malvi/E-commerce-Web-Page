import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },


  label:{
    type:String,
    enum:["home","office","other"],
    default:"home"
  },


  name:{
    type:String,
    required:true
  },


  phone:{
    type:String,
    required:true
  },


  street:{
    type:String,
    required:true
  },


  landmark:String,


  city:{
    type:String,
    required:true
  },


  state:{
    type:String,
    required:true
  },


  pincode:{
    type:String,
    required:true,
    minlength:6,
    maxlength:6
  },


  isDefault:{
    type:Boolean,
    default:false
  }

},{
  timestamps:true
});




// One default address per user
addressSchema.index(
 { user:1, isDefault:1 },
 { unique:true, partialFilterExpression:{ isDefault:true } }
);




export default mongoose.model("Address",addressSchema);
