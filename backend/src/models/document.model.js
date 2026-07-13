const mongoose = require("mongoose");

const highlightedClauseSchema = new mongoose.Schema({
  title: String,
  text: String,
  type: { type: String, enum: ["risk", "benefit", "neutral"] },
  explanation: String,
});

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contractText: { type: String, default: null },
    pdfBuffer: { type: Buffer, default: null },
    // Image upload support
    imageUrl: { type: String, default: null },
    imageKitFileId: { type: String, default: null },
    imageKitThumbnailUrl: { type: String, default: null },
    fileType: { type: String, enum: ["pdf", "image"], default: "pdf" },
    contractType: { type: String, default: "Unknown" },
    parties: [String],
    keyDates: [{ label: String, date: String }],
    summary: [String],
    pros: [
      {
        clause: String,
        explanation: String,
        advice: String,
      },
    ],
    cons: [
      {
        clause: String,
        explanation: String,
        advice: String,
        severity: { type: String, enum: ["low", "medium", "high"] },
      },
    ],
    highlightedClauses: [highlightedClauseSchema],
    overallAdvice: String,
    riskScore: {
      score: Number,
      label: String,
      color: String,
      description: String,
      detectedKeywords: [String],
    },
    language: { type: String, default: "English" },
    userType: { type: String, default: "general" },
    charCount: Number,
    // Optional: link to user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
