import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },


  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email",
    ],
  },


  password: {
    type: String,
    required: true,
    select: false,
  },


  phone: {
    type: String,
    match: /^[0-9]{10}$/,
  },


  avatar: {
    url: String,
    public_id: String,
  },


  role: {
    type: String,
    enum: ["user", "admin", "seller"],
    default: "user",
  },


  isVerified: {
    type: Boolean,
    default: false,
  },


  isBlocked: {
    type: Boolean,
    default: false,
  },


  resetPasswordToken: String,
  resetPasswordExpire: Date,

}, {
  timestamps: true,
});


/* ================================
   Index
================================ */
// userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });


/* ================================
   Password Hash Middleware
================================ */
userSchema.pre("save", async function () {

  if (!this.isModified("password")) return ;
  

  this.password = await bcrypt.hash(this.password, 10);

});


/* ================================
   Compare Password
================================ */
userSchema.methods.matchPassword = async function (password) {

  return await bcrypt.compare(password, this.password);

};


export default mongoose.model("User", userSchema);
