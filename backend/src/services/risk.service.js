const { getRiskLevel, RISK_KEYWORDS } = require("../constants/riskLevels");

/**
 * Calculates a risk score (0-10) from AI-extracted cons + contract text
 * @param {Array} cons - array of cons from AI analysis
 * @param {string} contractText - raw contract text for keyword scanning
 * @returns {{ score: number, level: object, detectedKeywords: string[] }}
 */
const calculateRisk = (cons = [], contractText = "") => {
  let score = 0;
  const detectedKeywords = [];
  const lowerText = contractText.toLowerCase();

  // Score based on severity of cons from AI
  for (const con of cons) {
    if (con.severity === "high") score += 2;
    else if (con.severity === "medium") score += 1;
    else score += 0.5;
  }

  // Score based on keyword scanning
  for (const [keyword, weight] of Object.entries(RISK_KEYWORDS)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += weight * 0.5; // Use half weight from keywords (AI analysis is primary)
      detectedKeywords.push(keyword);
    }
  }

  // Clamp to 0-10
  const finalScore = Math.min(10, Math.max(0, Math.round(score)));
  const level = getRiskLevel(finalScore);

  return {
    score: finalScore,
    level,
    detectedKeywords: [...new Set(detectedKeywords)],
  };
};

module.exports = { calculateRisk };
