import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const AuthUser = async (req, res, next) => {
  try {

    let token;

    // Cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }


    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login required"
      });
    }


    // Verify token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again."
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }


    // Fetch user
    const user = await User
      .findById(decoded.id)
      .select("-password")
      .lean();


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }


    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked"
      });
    }


    // Attach user
    req.user = user;

    next();

  } catch (error) {

    console.error("AUTH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export default AuthUser;
