const { extractAndClean } = require("../services/parser.service");
const { uploadImageToImageKit } = require("../services/storage.service");
const Document = require("../models/document.model");

/**
 * POST /api/upload
 * Handles both PDF and image uploads
 * For PDFs: extracts text for analysis
 * For images: uploads to ImageKit and returns URL
 */
const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    const { buffer, originalname, mimetype } = req.file;
    const fileSource = req.body.fileSource || 'document';

    // Check if it's an image or document
    const isImage = mimetype.startsWith('image/');

    if (isImage) {
      // Handle image upload
      try {
        const imageData = await uploadImageToImageKit(buffer, originalname);
        return res.status(200).json({
          success: true,
          filename: imageData.name,
          imageUrl: imageData.url,
          fileId: imageData.fileId,
          isImage: true,
          message: "Image uploaded successfully. Ready for analysis.",
        });
      } catch (imageError) {
        return res.status(500).json({
          success: false,
          error: `Image upload failed: ${imageError.message}`,
        });
      }
    } else {
      // Handle PDF/Document text extraction
      try {
        const { rawText, cleanedText, charCount } = await extractAndClean(buffer);
        return res.status(200).json({
          success: true,
          filename: originalname,
          charCount,
          contractText: cleanedText,
          isImage: false,
          message: "Document parsed successfully. Ready for analysis.",
        });
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: `Failed to extract text from document: ${parseError.message}. Make sure it is a valid PDF with readable text.`,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/upload/documents
 * Get authenticated user's document history
 * Returns list of documents with analysis results
 */
const getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Fetch all documents for this user, sorted by creation date (newest first)
    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .select(
        "_id filename createdAt summary pros cons overallAdvice riskScore contractType"
      );

    res.status(200).json({
      success: true,
      data: documents,
      message: "User documents retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get documents error:", error.message);
    next(error);
  }
};

module.exports = { uploadPDF, getUserDocuments };
