import mongoose from "mongoose";

const megaDealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 90
  },
  maxDiscount: {
    type: Number,
    default: 70
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
megaDealSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if mega deal is currently active based on dates
megaDealSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

export default mongoose.model("MegaDeal", megaDealSchema);
