const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    userType: {
      type: String,
      enum: ["freelancer", "student", "business", "general"],
      default: "general",
    },
    role: {
      type: String,
      enum: ["user", "professional"],
      default: "user",
    },
    professionalDetails: {
      education: { type: String },
      experience: { type: String },
      credentials: { type: String },
      profession: { type: String, enum: ["Lawyer", "CA"] },
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Hindi", "Bengali"],
      default: "English",
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    emailOtp: { type: String },
    emailOtpExpires: { type: Date },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
