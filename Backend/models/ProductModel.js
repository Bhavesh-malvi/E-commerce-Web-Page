import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

  // CORE
  name:{ type:String, required:true },
  slug:String,

  category:String,
  subCategory:String,
  gender:String,
  brand:String,


  seller:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Seller",
    required:true
  },


  // PRICING
  price:{
    type:Number,
    min:0,
    required:true
  },

  discountPrice:{
    type:Number,
    min:0
  },

  // Original discount before any deals (preserved)
  originalDiscountPrice:{
    type:Number,
    min:0
  },

  // Current active deal tracking
  activeDeal:{
    dealId:{
      type:mongoose.Schema.Types.ObjectId,
      refPath:'activeDeal.dealType'
    },
    dealType:{
      type:String,
      enum:['Deal','MegaDeal']
    },
    dealDiscount:Number,  // Calculated discount price from deal
    discountPercentage:Number,  // Deal discount percentage
    expiresAt:Date
  },

  stock:{
    type:Number,
    min:0,
    required:true
  },

  sold:{ type:Number, default:0 },

  avgDeliveryTime:Number,


  // TAGS
  tags:[String],
  badges:[String],


  // STATUS
  status:{
    type:String,
    enum:["draft","active","blocked"],
    default:"active"
  },

  featured:{
    type:Boolean,
    default:false
  },


  // IMAGES
  mainImages:[
    {
      public_id:String,
      url:String
    }
  ],


  // DESCRIPTION
  shortDescription: String,
  descriptionBlocks:[
    {
      type:{
        type:String,
        enum:["text","image","banner","list","video"]
      },
      title:String,
      content:mongoose.Schema.Types.Mixed,
      order:Number
    }
  ],


  // SPECS
  specifications:[
    {
      key:String,
      value:String
    }
  ],


  // PRODUCT INFO
  isNew:{ type:Boolean, default:true },

  listedAt:{
    type:Date,
    default:Date.now
  },

  commissionPercent:{
    type:Number,
    default:10
  },


  returnable:{
    type:Boolean,
    default:true
  },

  warranty:String,

  minOrderQty:{
    type:Number,
    default:1
  },


  // VARIANTS
  variants:[
    {
      color:String,      // e.g. "Red"
      colorCode:String,  // e.g. "#FF0000"
      size:String,
      price:Number,      // Override base price
      stock:Number,
      images:[
        {
          public_id:String,
          url:String
        }
      ]
    }
  ],


  // REVIEWS
  reviews:[
 {
  user:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"User",
   required:true
  },

  rating:{
   type:Number,
   min:1,
   max:5,
   required:true
  },

  title:String,
  comment:String,


  // 👍 Helpful system
  helpful:{
   type:Number,
   default:0
  },

  helpfulUsers:[
   {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   }
  ],


  // 🤖 Spam system
  isSpam:{
   type:Boolean,
   default:false
  },

  spamScore:{
   type:Number,
   default:0
  },

  media:[
   {
    type:{
     type:String,
     enum:["image","video"]
    },
    url:String,
    public_id:String
   }
  ],


  editedAt:Date,


      createdAt:{
        type:Date,
        default:Date.now
      }
    }
  ],


  ratings:{ type:Number, default:0 },
  numOfReviews:{ type:Number, default:0 },


  // SEO
  metaTitle:String,
  metaDescription:String,


  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Admin"
  },

  isActive:{ type:Boolean, default:true },

  restockSubscribers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]

},{
  timestamps:true
});




// INDEXES
productSchema.index({ seller:1 });
productSchema.index({ 
  name: "text", 
  tags: "text", 
  category: "text", 
  subCategory: "text",
  brand: "text" 
});
productSchema.index({ price:1, discountPrice:1 });
productSchema.index({ sold:-1 });
productSchema.index({ createdAt:-1 });





// SLUG
productSchema.pre("save",function(){

 if(this.isModified("name")){

  this.slug = this.name
    .toLowerCase()
    .replace(/ /g,"-")
    .replace(/[^\w-]+/g,"");

 }
});



export default mongoose.model("Product",productSchema);
