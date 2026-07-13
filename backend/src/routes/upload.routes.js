const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/upload.middleware");
const { uploadPDF, getUserDocuments, getDocumentById, downloadAnalysisPDF } = require("../controllers/upload.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// POST /api/upload - Upload and parse PDF or image
// Accepts files from: "contract", "file", "image", "document", "upload" field names
router.post("/", uploadMiddleware, uploadPDF);

// POST /api/upload/download-pdf - Download analysis as PDF
router.post("/download-pdf", downloadAnalysisPDF);

// GET /api/upload/documents/:docId - Get single document by ID with full contract text (MORE SPECIFIC - MUST BE FIRST)
router.get("/documents/:docId", authenticate, getDocumentById);

// GET /api/upload/documents - Get user's document history (requires authentication)
router.get("/documents", authenticate, getUserDocuments);

module.exports = router;
