/**
 * Splits text into overlapping chunks for large document processing
 * @param {string} text
 * @param {number} chunkSize - characters per chunk
 * @param {number} overlap - overlap between chunks
 * @returns {string[]} array of chunks
 */
const chunkText = (text, chunkSize = 8000, overlap = 500) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
};

module.exports = { chunkText };
