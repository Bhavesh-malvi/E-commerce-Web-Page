const SellerAuth = (req, res, next) => {

  if (!req.user || req.user.role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "Seller access only"
    });
  }

  next();
};

export default SellerAuth;
