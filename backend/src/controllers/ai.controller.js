const { analyzeContract, analyzeImage } = require("../services/ai.service");
const { calculateRisk } = require("../services/risk.service");
const { formatAnalysis } = require("../services/summary.service");
const Document = require("../models/document.model");

/**
 * POST /api/analyze
 * Body: { contractText OR imageUrl, filename, userType, language, charCount, pdfBuffer, imageKitFileId }
 * Analyzes contract (text or image), calculates risk, saves to DB
 */
const analyze = async (req, res, next) => {
  try {
    const {
      contractText,
      imageUrl,
      imageKitFileId,
      filename = "contract.pdf",
      userType = "general",
      language = "English",
      charCount = 0,
      pdfBuffer = null,
    } = req.body;

    console.log("📨 Analyze request received:", {
      hasContractText: !!contractText,
      hasImageUrl: !!imageUrl,
      filename,
      userType,
      language,
    });

    // Check if we have either contract text or image URL
    if (!contractText && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Either contractText or imageUrl is required.",
      });
    }

    let aiResult;
    let finalCharCount = charCount;

    // Analyze based on input type
    if (contractText) {
      // PDF/Text analysis
      if (contractText.trim().length < 50) {
        return res.status(400).json({ success: false, error: "Contract text is too short or missing." });
      }
      console.log("📄 Analyzing contract text");
      aiResult = await analyzeContract(contractText, userType, language);
      finalCharCount = contractText.length;
    } else if (imageUrl) {
      // Image analysis
      console.log("🖼️ Analyzing contract image:", imageUrl);
      aiResult = await analyzeImage(imageUrl, userType, language);
      // For images, we estimate character count from extracted content
      finalCharCount = 0; // Will be filled based on extracted content if available
    }

    // 2. Risk Score
    const riskData = calculateRisk(aiResult.cons || [], contractText || "");

    // 3. Format Response
    const formatted = formatAnalysis(aiResult, riskData, {
      filename,
      charCount: finalCharCount,
      language,
      userType,
    });

    // 4. Save to DB (optional - won't fail request if DB is down)
    try {
      // Convert pdfBuffer from base64 string if provided
      let pdfData = null;
      if (pdfBuffer && typeof pdfBuffer === "string") {
        pdfData = Buffer.from(pdfBuffer, "base64");
      } else if (Buffer.isBuffer(pdfBuffer)) {
        pdfData = pdfBuffer;
      }

      await Document.create({
        filename,
        contractText: contractText || null,
        pdfBuffer: pdfData,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
        fileType: imageUrl ? "image" : "pdf",
        contractType: formatted.contractType,
        parties: formatted.parties,
        keyDates: formatted.keyDates,
        summary: formatted.summary,
        pros: formatted.pros,
        cons: formatted.cons,
        highlightedClauses: formatted.highlightedClauses,
        overallAdvice: formatted.overallAdvice,
        riskScore: formatted.riskScore,
        language,
        userType,
        charCount: finalCharCount,
        userId: req.userId || null,
      });
    } catch (dbError) {
      console.warn("⚠️  DB save skipped:", dbError.message);
    }

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { analyze };
