const errorHandler = (err, req, res, next) => {

  console.error("🔥 SERVER ERROR:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

};

export default errorHandler;
