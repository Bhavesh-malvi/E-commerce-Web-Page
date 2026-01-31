import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },


  messages:[
    {
      role:{
        type:String,
        enum:["user","ai","admin"],
        required:true
      },

      text:String,


      attachments:[
        {
          url:String,
          public_id:String,
          type:String
        }
      ],


      isRead:{
        type:Boolean,
        default:false
      },


      createdAt:{
        type:Date,
        default:Date.now
      }
    }
  ],


  status:{
    type:String,
    enum:["open","in-progress","resolved","escalated"],
    default:"open"
  },


  priority:{
    type:String,
    enum:["low","medium","high"],
    default:"medium"
  },


  // AI Memory
  currentIntent:{
    type:String,
    enum:["order_issue","general","refund","payment","delivery","other"],
    default:"other"
  },


  selectedOrder:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },


  escalatedTo:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Admin"
  },


  escalatedAt:Date


},{
  timestamps:true
});




// Indexes
supportSchema.index({ user:1, status:1 });
supportSchema.index({ status:1, priority:1 });


export default mongoose.model("Support",supportSchema);
