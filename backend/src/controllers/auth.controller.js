const {
  registerWithPhone,
  verifyRegistrationOTPs,
  setPasswordAndSignup,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  resendOTP,
  loginUser,
  getUserById,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendResetOTP,
  registerWithEmail,
  verifyEmailSignupOTP,
  googleLogin,
  linkGoogle,
} = require("../services/auth.service");
const { validateAndNormalizePhone } = require("../utils/phoneValidator");

/**
 * Step 1: Register with phone number (initiate signup)
 * POST /api/auth/register
 * Body: { email, phone, name }
 */
const register = async (req, res) => {
  try {
    const { email, phone, name, role } = req.body;

    // Validation
    if (!email || !phone || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, phone, and name are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Validate and normalize phone number
    let normalizedPhone;
    try {
      normalizedPhone = validateAndNormalizePhone(phone);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message || "Invalid phone number format",
      });
    }

    const result = await registerWithPhone(email, normalizedPhone, name, role);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTP sent successfully. Please verify your phone number.",
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Registration failed",
    });
  }
};

/**
 * Step 2: Verify OTPs
 * POST /api/auth/verify-otp
 * Body: { userId, phoneOtp, emailOtp }
 */
const verifyOTP = async (req, res) => {
  try {
    const { userId, phoneOtp, emailOtp } = req.body;

    // Validation
    if (!userId || !phoneOtp) {
      return res.status(400).json({
        success: false,
        error: "User ID and Phone OTP are required",
      });
    }

    if (phoneOtp.length !== 6 || (emailOtp && emailOtp.length !== 6)) {
      return res.status(400).json({
        success: false,
        error: "OTPs must be 6 digits",
      });
    }

    const result = await verifyRegistrationOTPs(userId, phoneOtp, emailOtp);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTPs verified successfully!",
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "OTP verification failed",
    });
  }
};

/**
 * Step 3: Set Password
 * POST /api/auth/set-password
 * Body: { userId, password }
 */
const setPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validation
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        error: "User ID and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    const result = await setPasswordAndSignup(userId, password);

    res.status(200).json({
      success: true,
      data: result,
      message: "Phone verified and account created successfully!",
    });
  } catch (error) {
    console.error("❌ Set password error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Password setup failed",
    });
  }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 * Body: { userId }
 */
const resendOTPHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const result = await resendOTP(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to resend OTP",
    });
  }
};

/**
 * Login
 * POST /api/auth/login
 * Body: { phone, password }
 */
const login = async (req, res) => {
  try {
    const { phone, email, identifier, password } = req.body;
    const loginId = identifier || email || phone;

    // Validation
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        error: "Email/Phone and password are required",
      });
    }

    // Validate and normalize identifier
    let normalizedId = loginId;
    if (!loginId.includes("@")) {
      try {
        normalizedId = validateAndNormalizePhone(loginId);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message || "Invalid phone number format",
        });
      }
    } else {
      normalizedId = loginId.toLowerCase().trim();
    }

    const result = await loginUser(normalizedId, password);

    res.status(200).json({
      success: true,
      data: result,
      message: "Logged in successfully!",
    });
  } catch (error) { 
    console.error("❌ Login error:", error.message);
    if (error.message === "Email not verified") {
      return res.status(403).json({
        success: false,
        error: "Email not verified",
        userId: error.userId,
      });
    }
    res.status(401).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
};

/**
 * Get Current User (requires authentication)
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("❌ Get user error:", error.message);
    res.status(404).json({
      success: false,
      error: error.message || "User not found",
    });
  }
};

/**
 * Logout (client-side handled, but can be used for token blacklisting in future)
 * POST /api/auth/logout
 */
const logout = (req, res) => {

  res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { education, experience, credentials, profession } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const User = require("../models/user.model");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.role !== "professional") {
      return res.status(403).json({
        success: false,
        error: "Only professionals can update these details",
      });
    }

    user.professionalDetails = {
      education: education || user.professionalDetails?.education,
      experience: experience || user.professionalDetails?.experience,
      credentials: credentials || user.professionalDetails?.credentials,
      profession: profession || user.professionalDetails?.profession,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("❌ Update profile error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update profile",
    });
  }
};

/**
 * Forgot Password - Initiate reset
 * POST /api/auth/forgot-password
 * Body: { email } or { phone }
 */
const forgotPasswordHandler = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: "Email or phone number is required",
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }
    }

    let normalizedPhone = null;
    if (phone) {
      try {
        normalizedPhone = validateAndNormalizePhone(phone);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.message || "Invalid phone number format",
        });
      }
    }

    const result = await forgotPassword(email, normalizedPhone);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTP sent to your email or phone number",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Forgot password request failed",
    });
  }
};

/**
 * Verify Reset OTP
 * POST /api/auth/verify-reset-otp
 * Body: { userId, otp }
 */
const verifyResetOTPHandler = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        error: "User ID and OTP are required",
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        error: "OTP must be 6 digits",
      });
    }

    const result = await verifyResetOTP(userId, otp);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("❌ Verify reset OTP error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "OTP verification failed",
    });
  }
};

/**
 * Reset Password
 * POST /api/auth/reset-password
 * Body: { userId, otp, newPassword }
 */
const resetPasswordHandler = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "User ID, OTP, and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    const result = await resetPassword(userId, otp, newPassword);

    res.status(200).json({
      success: true,
      data: result,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Password reset failed",
    });
  }
};

/**
 * Resend Reset OTP
 * POST /api/auth/resend-reset-otp
 * Body: { userId }
 */
const resendResetOTPHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const result = await resendResetOTP(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("❌ Resend reset OTP error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to resend OTP",
    });
  }
};

/**
 * Send Email Verification OTP (Protected)
 * POST /api/auth/send-email-verification
 */
const sendEmailVerificationHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const result = await sendEmailVerificationOTP(userId);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("❌ Send email verification error:", error.message);
    res.status(400).json({ success: false, error: error.message || "Failed to send email verification" });
  }
};

/**
 * Verify Email OTP (Protected)
 * POST /api/auth/verify-email
 * Body: { otp }
 */
const verifyEmailHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, error: "Valid 6-digit OTP is required" });
    }

    const result = await verifyEmailOTP(userId, otp);
    res.status(200).json({ success: true, data: result, message: result.message });
  } catch (error) {
    console.error("❌ Verify email error:", error.message);
    res.status(400).json({ success: false, error: error.message || "Email verification failed" });
  }
};

/**
 * Register with Email and Password
 * POST /api/auth/register-email
 */
const registerEmail = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: "Email, password, and name are required" });
    }
    const result = await registerWithEmail(email, password, name, role);
    res.status(200).json({ success: true, data: result, message: result.message });
  } catch (error) {
    console.error("❌ Register email error:", error.message);
    if (error.message.includes("already registered")) {
       return res.status(409).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || "Registration failed" });
  }
};

/**
 * Verify Email Signup OTP
 * POST /api/auth/verify-email-signup
 */
const verifyEmailSignup = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, error: "User ID and OTP are required" });
    }
    const result = await verifyEmailSignupOTP(userId, otp);
    res.status(200).json({ success: true, data: result, message: "Email verified successfully!" });
  } catch (error) {
    console.error("❌ Verify email signup error:", error.message);
    res.status(400).json({ success: false, error: error.message || "Verification failed" });
  }
};

/**
 * Google Auth Login
 * POST /api/auth/google-login
 */
const googleLoginHandler = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, error: "Google ID Token is required" });
    }
    const result = await googleLogin(idToken);
    res.status(200).json({ success: true, data: result, message: "Logged in with Google successfully!" });
  } catch (error) {
    console.error("❌ Google login error:", error.message);
    if (error.code === "ACCOUNT_LINKING_REQUIRED") {
      return res.status(409).json({
        success: false, 
        code: "ACCOUNT_LINKING_REQUIRED",
        error: error.message,
        userId: error.userId,
        email: error.email,
      });
    }
    res.status(400).json({ success: false, error: error.message || "Google authentication failed" });
  }
};

/**
 * Link Google Auth to existing local account
 * POST /api/auth/link-google
 */
const linkGoogleHandler = async (req, res) => {
  try {
    const { userId, password, idToken } = req.body;
    if (!userId || !password || !idToken) {
      return res.status(400).json({ success: false, error: "User ID, password, and Google ID Token are required" });
    }
    const result = await linkGoogle(userId, password, idToken);
    res.status(200).json({ success: true, data: result, message: "Account linked successfully!" });
  } catch (error) {
    console.error("❌ Link Google error:", error.message);
    res.status(400).json({ success: false, error: error.message || "Failed to link Google account" });
  }
};

module.exports = {
  register,
  verifyOTP,
  setPassword,
  resendOTPHandler,
  login,
  getCurrentUser,
  logout,
  forgotPasswordHandler,
  verifyResetOTPHandler,
  resetPasswordHandler,
  resendResetOTPHandler,
  updateProfile,
  sendEmailVerificationHandler,
  verifyEmailHandler,
  registerEmail,
  verifyEmailSignup,
  googleLoginHandler,
  linkGoogleHandler,
};
