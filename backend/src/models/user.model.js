const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true },
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
      specialization: { type: String },
      languages: [{ type: String }],
      rating: { type: Number, default: 5.0 },
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
    authProviders: [{ type: String, default: ["local"] }],
    googleSub: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: null },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
