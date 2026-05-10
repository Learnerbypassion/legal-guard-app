/**
 * Cleans raw extracted PDF text for AI processing
 * @param {string} text
 * @returns {string} cleaned text
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")           // Normalize line endings
    .replace(/\n{3,}/g, "\n\n")       // Collapse excessive blank lines
    .replace(/[ \t]{2,}/g, " ")       // Collapse multiple spaces/tabs
    .replace(/[^\x20-\x7E\n]/g, " ")  // Remove non-printable characters
    .replace(/Page \d+ of \d+/gi, "") // Remove page numbers
    .trim();
};

/**
 * Truncates text to a max token-safe length
 * @param {string} text
 * @param {number} maxChars - default 15000 (~4000 tokens)
 * @returns {string}
 */
const truncateText = (text, maxChars = 15000) => {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "\n\n[... document truncated for analysis ...]";
};

module.exports = { cleanText, truncateText };
