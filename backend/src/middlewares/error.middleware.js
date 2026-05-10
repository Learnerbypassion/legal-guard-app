const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.log(err);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, error: "File too large. Maximum size is 10MB." });
  }

  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
