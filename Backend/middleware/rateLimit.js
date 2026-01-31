import rateLimit from "express-rate-limit";


// Normal users
export const apiLimiter = rateLimit({

  windowMs: 15 * 60 * 1000, // 15 min

  max: 300, // 300 requests

  message: {
    success: false,
    message: "Too many requests. Try later."
  },

  standardHeaders: true,
  legacyHeaders: false
});


// Auth routes (login/register)
export const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,
    message: "Too many login attempts"
  }
});
