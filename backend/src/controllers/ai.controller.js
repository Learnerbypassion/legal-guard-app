const { analyzeContract, analyzeImage } = require("../services/ai.service");
const { calculateRisk } = require("../services/risk.service");
const { formatAnalysis } = require("../services/summary.service");
const Document = require("../models/document.model");

/**
 * POST /api/analyze
 * Body: { contractText, imageUrl, filename, userType, language, isImage }
 * Analyzes contract text or image, calculates risk, optionally saves to DB
 */
const analyze = async (req, res, next) => {
  try {
    const {
      contractText,
      imageUrl,
      filename = "contract.pdf",
      userType = "general",
      language = "English",
      charCount = 0,
      isImage = false,
    } = req.body;

    let aiResult;
    let textForRisk;

    if (isImage && imageUrl) {
      // Analyze image
      if (!imageUrl || imageUrl.trim().length < 10) {
        return res.status(400).json({ success: false, error: "Image URL is missing or invalid." });
      }

      try {
        aiResult = await analyzeImage(imageUrl, userType, language);
        textForRisk = aiResult.extractedText || aiResult.summary || '';
      } catch (imageError) {
        return res.status(400).json({ 
          success: false, 
          error: `Image analysis failed: ${imageError.message}` 
        });
      }
    } else {
      // Analyze contract text
      if (!contractText || contractText.trim().length < 50) {
        return res.status(400).json({ success: false, error: "Contract text is too short or missing." });
      }

      aiResult = await analyzeContract(contractText, userType, language);
      textForRisk = contractText;
    }

    // 2. Risk Score
    const riskData = calculateRisk(aiResult.cons || [], textForRisk);

    // 3. Format Response
    const formatted = formatAnalysis(aiResult, riskData, {
      filename,
      charCount,
      language,
      userType,
      isImage,
    });

    // 4. Save to DB (optional - won't fail request if DB is down)
    try {
      await Document.create({
        filename,
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
        charCount,
        userId: req.userId || null,
        isImage,
        imageUrl: isImage ? imageUrl : null,
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
