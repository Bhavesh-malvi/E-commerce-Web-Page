export const isAdmin = (req, res, next) => {

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }

  next();
};


export const isSeller = (req, res, next) => {

  if (!req.user || req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Seller access only"
    });
  }

  next();
};
