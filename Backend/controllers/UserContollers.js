import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { sendEmailApi } from "../config/emailApi.js";
import crypto from "crypto";


/* ================================
   Generate Token
================================ */
const generateToken = (id) => {

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

};


/* ================================
   REGISTER
================================ */
/* ================================
   SEND OTP
================================ */
export const sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be 6+ chars" });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (user) {
      // Update existing unverified user
      user.name = name;
      user.password = password; // Will be hashed by pre-save hook
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    } else {
      // Create new unverified user
      await User.create({
        name,
        email,
        password,
        otp,
        otpExpire,
        isVerified: false
      });
    }

    const emailRes = await sendEmailApi({
      email,
      subject: "E-commerce OTP Verification",
      message: `Your Verification Code is: ${otp}`,
    });

    if (!emailRes.success) {
      return res.status(500).json({ success: false, message: "Failed to send OTP. Check server logs." });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ================================
   REGISTER (VERIFY OTP)
================================ */
export const registerUser = async (req, res) => {

  try {

    const { email, otp } = req.body;


    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }


    if (user.otp !== Number(otp) || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }


    // Verify User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();


    // Generate token
    const token = generateToken(user._id);


    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    // Send login-like response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });


  } catch (err) {

    console.error("REGISTER:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




/* ================================
   LOGIN
================================ */
export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }


    const user = await User
      .findOne({ email })
      .select("+password");


    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }


    const match = await user.matchPassword(password);


    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    const token = generateToken(user._id);


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });


  } catch (err) {

    console.error("LOGIN:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* ================================
   PROFILE
================================ */
export const getProfile = async (req, res) => {

  res.json({
    success: true,
    user: req.user,
  });

};



/* ================================
   UPDATE PROFILE
================================ */
export const updateProfile = async (req, res) => {

  try {

    const data = {
      name: req.body.name,
      phone: req.body.phone,
    };


    if (req.file) {
      // Cloudinary returns the full URL in .path
      data.avatar = req.file.path;
    }


    const user = await User.findByIdAndUpdate(
      req.user._id,
      data,
      { new: true }
    ).select("-password");


    res.json({
      success: true,
      user,
    });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* ================================
   CHANGE PASSWORD
================================ */
export const changePassword = async (req, res) => {

  try {

    const { oldPassword, newPassword } = req.body;


    const user = await User
      .findById(req.user._id)
      .select("+password");


    const match = await user.matchPassword(oldPassword);


    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });
    }


    // ⚠️ Plain password (auto-hash)
    user.password = newPassword;

    await user.save();


    res.json({
      success: true,
      message: "Password updated",
    });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* ================================
   LOGOUT
================================ */
export const logoutUser = async (req, res) => {

  res.clearCookie("token");

  res.json({ success: true });

};



/* ================================
   FORGOT PASSWORD
================================ */
export const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;


    const user = await User.findOne({ email });


    if (!user) {
      return res.json({ success: true });
    }


    const token = crypto.randomBytes(32).toString("hex");


    user.resetPasswordToken =
      crypto.createHash("sha256")
        .update(token)
        .digest("hex");


    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;


    await user.save();


    const link =
      `${process.env.FRONTEND_URL}/reset/${token}`;


    await sendEmailApi({
      email: user.email,
      subject: "Reset Password",
      message: `Reset your password: ${link}`,
    });


    res.json({ success: true });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* ================================
   RESET PASSWORD
================================ */
export const resetPassword = async (req, res) => {

  try {

    const hash =
      crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");


    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpire: { $gt: Date.now() },
    });


    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }


    // ⚠️ Plain password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();


    res.json({ success: true });


  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* ================================
   REGISTER ADMIN
================================ */
export const registerAdmin = async (req, res) => {

  try {

    

    const { name, email, password, secret } = req.body;


    // Check secret key
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }


    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be 6+ chars",
      });
    }


    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User exists",
      });
    }


    // ⚠️ Plain password (Model will hash)
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });


    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });


  } catch (error) {

    console.error("REGISTER ADMIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
