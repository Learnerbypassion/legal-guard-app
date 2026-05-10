const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // Store in memory, not disk

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Accept PDFs and images
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const isValidExtension = allowedExtensions.includes(ext);
  const isValidMimeType = allowedMimeTypes.includes(mimeType);

  if (!isValidExtension || !isValidMimeType) {
    return cb(new Error("Only PDF, image files (JPG, PNG, GIF, WebP), DOCX, and TXT files are allowed."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

module.exports = upload;
