const { verifyToken } = require("../services/auth.service");

/**
 * Middleware to verify JWT token
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided. Authorization required.",
      });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || "Invalid or expired token",
    });
  }
};

/**
 * Middleware to optionally verify JWT token
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Proceed without userId if token is invalid
    next();
  }
};

module.exports = { authenticate, optionalAuthenticate };
