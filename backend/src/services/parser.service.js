const { parsePDF } = require("../utils/pdfFileParser");
const { cleanText, truncateText } = require("../utils/textCleaner");

/**
 * Full pipeline: PDF buffer → clean, analysis-ready text
 * @param {Buffer} buffer
 * @returns {Promise<{ rawText: string, cleanedText: string, charCount: number }>}
 */
const extractAndClean = async (buffer) => {
  const rawText = await parsePDF(buffer);

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Could not extract meaningful text from the PDF. The file may be scanned or image-based.");
  }

  const cleanedText = cleanText(rawText);
  const truncatedText = truncateText(cleanedText, 15000);

  return {
    rawText,
    cleanedText: truncatedText,
    charCount: cleanedText.length,
  };
};

module.exports = { extractAndClean };
