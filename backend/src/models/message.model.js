const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["text", "analysis_context", "system"],
      default: "text",
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    analysisContext: {
      fileName: String,
      documentType: String,
      riskLevel: String,
      summary: [String],
      flaggedClauses: [
        {
          title: String,
          text: String,
          explanation: String,
          severity: String,
        }
      ],
      language: String,
    },
  },
  { timestamps: true }
);

// Compound index for fast history queries between two users
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
