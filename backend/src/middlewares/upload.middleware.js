const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // Store in memory, not disk

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  
  // Allow both PDF and image files
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(mimeType)) {
    return cb(
      new Error("Only PDF and image files (JPG, PNG, GIF, WebP, BMP) are allowed."),
      false
    );
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * Custom middleware to handle file upload from multiple field names
 * Accepts files from: "contract", "file", "image", "document", "upload"
 */
const uploadMiddleware = (req, res, next) => {
  // Try uploading with common field names
  const fieldNames = ["contract", "file", "image", "document", "upload"];
  
  // Create a middleware that accepts any of these field names
  const multiFieldUpload = multerUpload.fields(
    fieldNames.map(name => ({ name, maxCount: 1 }))
  );

  multiFieldUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: err.message || "File upload error",
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || "Unknown error during upload",
      });
    }

    // Extract file from whichever field was used
    let uploadedFile = null;
    for (const fieldName of fieldNames) {
      if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        uploadedFile = req.files[fieldName][0];
        break;
      }
    }

    // If no file found, return error
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please provide a file using any of these field names: " + fieldNames.join(", "),
      });
    }

    // Convert to single file format for compatibility
    req.file = uploadedFile;
    next();
  });
};

module.exports = uploadMiddleware;


