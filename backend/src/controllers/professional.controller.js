const User = require("../models/user.model");
const Document = require("../models/document.model");
const { sendProfessionalContactEmail } = require("../services/email.service");

/**
 * GET /api/professionals/recommend?type=Lawyer
 * Get a list of recommended professionals based on type
 */
const recommendProfessionals = async (req, res) => {
  try {
    const { type } = req.query; // e.g., "Lawyer", "CA"

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Professional type is required (e.g., Lawyer, CA)",
      });
    }

    const professionals = await User.find({
      role: "professional",
      "professionalDetails.profession": type,
    }).select("name email phone professionalDetails profilePicture");

    const { onlineUsers } = require("../socket");
    const data = professionals.map((prof) => {
      const profObj = prof.toObject();
      const isOnline = onlineUsers ? (onlineUsers.has(prof._id.toString()) && onlineUsers.get(prof._id.toString()).size > 0) : false;
      return {
        ...profObj,
        isOnline,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Recommend professionals error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommended professionals",
    });
  }
};

/**
 * POST /api/professionals/contact
 * Body: { professionalId }
 * Send an email to the professional on behalf of the current user
 * Includes the most recent uploaded PDF document as attachment if available
 */
const contactProfessional = async (req, res) => {
  try {
    const userId = req.userId;
    const { professionalId } = req.body;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        error: "Professional ID is required",
      });
    }

    const currentUser = await User.findById(userId);
    const professional = await User.findById(professionalId);

    if (!professional || professional.role !== "professional") {
      return res.status(404).json({
        success: false,
        error: "Professional not found",
      });
    }

    // Get the most recent document from the user
    const recentDocument = await Document.findOne({ userId }).sort({ createdAt: -1 });

    let pdfBuffer = null;
    let fileName = null;

    // If document has PDF buffer, use it
    if (recentDocument && recentDocument.pdfBuffer) {
      fileName = recentDocument.filename || "Document.pdf";
      pdfBuffer = recentDocument.pdfBuffer;
      console.log("✅ Using stored PDF buffer:", fileName);
    } else if (recentDocument && recentDocument.contractText) {
      // Fallback: use text if no PDF available
      fileName = (recentDocument.filename || "Document") + ".txt";
      pdfBuffer = Buffer.from(recentDocument.contractText, "utf-8");
      console.log("⚠️ Using contract text as fallback:", fileName);
    }

    // Send email to professional with optional attachment
    await sendProfessionalContactEmail(
      professional.email,
      professional.name,
      currentUser.email,
      currentUser.name,
      pdfBuffer,
      fileName
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully to the professional" + (pdfBuffer ? " with document attached." : "."),
    });
  } catch (error) {
    console.error("❌ Contact professional error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to send email to the professional",
    });
  }
};

const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const User = require("../models/user.model");
    const professional = await User.findOne({ _id: id }).select("name email phone role professionalDetails profilePicture");
    if (!professional) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    const { onlineUsers } = require("../socket");
    const isOnline = onlineUsers ? (onlineUsers.has(id.toString()) && onlineUsers.get(id.toString()).size > 0) : false;

    res.status(200).json({
      success: true,
      data: {
        ...professional.toObject(),
        isOnline,
      },
    });
  } catch (error) {
    console.error("❌ Get professional by ID error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch professional details" });
  }
};

module.exports = {
  recommendProfessionals,
  contactProfessional,
  getProfessionalById,
};
