const RISK_LEVELS = {
  LOW: {
    label: "Low",
    range: [0, 3],
    color: "#22c55e",
    description: "This contract appears generally safe. Review highlighted clauses before signing.",
  },
  MODERATE: {
    label: "Moderate",
    range: [4, 6],
    color: "#f59e0b",
    description: "Some concerning clauses detected. Consider negotiating terms before signing.",
  },
  HIGH: {
    label: "High",
    range: [7, 10],
    color: "#ef4444",
    description: "Significant risks detected. Strongly consider legal counsel before signing.",
  },
};

const getRiskLevel = (score) => {
  if (score <= 3) return RISK_LEVELS.LOW;
  if (score <= 6) return RISK_LEVELS.MODERATE;
  return RISK_LEVELS.HIGH;
};

// Risk keywords and their weights
const RISK_KEYWORDS = {
  "auto-renew": 2,
  "automatic renewal": 2,
  "non-compete": 2,
  "non compete": 2,
  "penalty": 1.5,
  "penalties": 1.5,
  "liquidated damages": 2,
  "indemnif": 2,
  "unlimited liability": 3,
  "irrevocable": 2,
  "perpetual": 2,
  "exclusive": 1,
  "termination for convenience": 1,
  "unilateral": 1.5,
  "waive": 1,
  "waiver": 1,
  "arbitration": 1,
  "no refund": 1.5,
  "non-refundable": 1.5,
  "intellectual property assignment": 2,
  "confidentiality": 0.5,
  "governing law": 0.5,
};

module.exports = { RISK_LEVELS, getRiskLevel, RISK_KEYWORDS };
