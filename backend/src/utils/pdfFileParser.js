const pdfParse = require("pdf-parse");

/**
 * Extracts text from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} extracted text
 */
const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

module.exports = { parsePDF };
