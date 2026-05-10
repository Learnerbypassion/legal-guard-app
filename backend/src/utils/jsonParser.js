/**
 * Safely parses AI-generated JSON, stripping markdown fences if present
 * @param {string} text - raw AI response
 * @returns {object} parsed JSON
 */
const safeParseJSON = (text) => {
  try {
    // Strip markdown code fences
    let cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Find the first { and last } to extract JSON object
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }

    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};

module.exports = { safeParseJSON };
