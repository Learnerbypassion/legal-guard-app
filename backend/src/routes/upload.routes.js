const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { uploadPDF, getUserDocuments } = require("../controllers/upload.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// POST /api/upload - Upload and parse PDF or image
// Accepts both 'contract' field (for PDFs) and 'image' field (for images)
router.post("/", upload.fields([
  { name: 'contract', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), (req, res, next) => {
  // Combine fields into req.file for backward compatibility
  if (req.files.contract) {
    req.file = req.files.contract[0];
  } else if (req.files.image) {
    req.file = req.files.image[0];
  }
  uploadPDF(req, res, next);
});

// GET /api/upload/documents - Get user's document history (requires authentication)
router.get("/documents", authenticate, getUserDocuments);

module.exports = router;
