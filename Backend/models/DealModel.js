import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Calculate status based on date
dealSchema.methods.getStatus = function() {
  const now = new Date();
  if (!this.isActive) return 'Inactive';
  if (now < this.startDate) return 'Upcoming';
  if (now > this.endDate) return 'Expired';
  return 'Active';
};

export default mongoose.model("Deal", dealSchema);
