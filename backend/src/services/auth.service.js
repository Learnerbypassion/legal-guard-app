const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const User = require("../models/user.model");
const {
  JWT_SECRET,
  JWT_EXPIRE,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = require("../config/env");

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Generate OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Twilio SMS
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    const message = await twilioClient.messages.create({
      body: `Your Legal Guardian verification code is: ${otp}. This code expires in 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`✅ OTP sent to ${phoneNumber}: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP:", error.message);
    
    // Better error messages for common Twilio issues
    if (error.message && error.message.includes('unverified')) {
      console.error(`
⚠️  TWILIO TRIAL ACCOUNT LIMITATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The phone number ${phoneNumber} is not verified.

Your Twilio account is in TRIAL mode. Trial accounts can ONLY send SMS 
to phone numbers that have been verified in your Twilio account.

SOLUTION 1: Verify Phone Numbers (Recommended for Testing)
├─ Go to: https://www.twilio.com/console/phone-numbers/verified
├─ Click: "+ Add a Verified Caller ID"
├─ Enter: ${phoneNumber}
├─ Receive verification code via SMS
└─ Enter code to verify

SOLUTION 2: Upgrade to Paid Account (For Production)
├─ Go to: https://www.twilio.com/console/account/billing
├─ Add credit card
└─ Send SMS to any number worldwide

SOLUTION 3: Use Twilio Sandbox (Free Testing)
├─ Go to: https://www.twilio.com/console/sms/whatsapp/sandbox
└─ Get test credentials for sandbox

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      throw new Error("Twilio Trial Account: Phone number not verified. Verify at https://www.twilio.com/console/phone-numbers/verified");
    }
    
    throw new Error("Failed to send OTP: " + error.message);
  }
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Create User with Phone and Send OTP
 * Allows re-registration for unverified accounts
 */
const registerWithPhone = async (email, phone, name, role = "user") => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    // If user exists and phone is verified, they already have an account
    if (existingUser && existingUser.isPhoneVerified) {
      throw new Error("Email or phone number already registered. Please login instead.");
    }

    // Generate OTPs
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const emailOtp = generateOTP();
    const emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    
    if (existingUser) {
      // User exists but not verified - allow them to re-register
      console.log(`📱 Updating OTP for unverified user: ${phone}`);
      
      // Update OTP and expiry for existing unverified user
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      existingUser.emailOtp = emailOtp;
      existingUser.emailOtpExpires = emailOtpExpires;
      existingUser.name = name; // Update name in case they want to change it
      existingUser.role = role; // Update role
      
      user = await existingUser.save();
    } else {
      // Create new user
      console.log(`➕ Creating new user with phone: ${phone}`);
      
      user = new User({
        email,
        phone,
        name,
        role,
        otp,
        otpExpires,
        emailOtp,
        emailOtpExpires,
        isPhoneVerified: false,
      });

      await user.save();
    }

    // Send OTP via Twilio
    await sendOTP(phone, otp);

    // Send OTP via Email
    const { sendOtpEmail } = require('./email.service');
    await sendOtpEmail(email, name, emailOtp);

    return {
      userId: user._id,
      email: user.email,
      phone: user.phone,
      message: existingUser ? "New OTPs sent to your email and phone number. Please verify." : "OTPs sent to your email and phone number",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTPs
 */
const verifyRegistrationOTPs = async (userId, phoneOtp, emailOtp) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify Phone OTP
    const now = new Date();
    if (now > user.otpExpires) {
      throw new Error("Phone OTP has expired");
    }
    if (user.otp !== phoneOtp) {
      throw new Error("Invalid Phone OTP");
    }

    // Update phone verification
    user.isPhoneVerified = true;
    user.otp = null;
    user.otpExpires = null;

    // Verify Email OTP if provided
    if (emailOtp) {
      if (now > user.emailOtpExpires) {
        throw new Error("Email OTP has expired");
      }
      if (user.emailOtp !== emailOtp) {
        throw new Error("Invalid Email OTP");
      }
      user.isEmailVerified = true;
      user.emailOtp = null;
      user.emailOtpExpires = null;
    }

    await user.save();

    return {
      message: "Phone verified successfully",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Set Password and Complete Signup
 */
const setPasswordAndSignup = async (userId, password) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isPhoneVerified) {
      throw new Error("Please verify your phone number first");
    }

    // Hash and set password
    const hashedPassword = await hashPassword(password);

    // Update user
    user.password = hashedPassword;

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isPhoneVerified && user.isEmailVerified) {
      throw new Error("User is already verified");
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const emailOtp = generateOTP();
    const emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.emailOtp = emailOtp;
    user.emailOtpExpires = emailOtpExpires;

    await user.save();

    // Send OTP via Twilio
    await sendOTP(user.phone, otp);

    // Send OTP via Email
    const { sendOtpEmail } = require('./email.service');
    await sendOtpEmail(user.email, user.name, emailOtp);

    return {
      message: "OTPs resent to your phone number and email",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login User
 */
const loginUser = async (phone, password) => {
  try {
    const user = await User.findOne({ phone });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isPhoneVerified) {
      throw new Error("Phone not verified. Please complete signup.");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        userType: user.userType,
        preferredLanguage: user.preferredLanguage,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get User by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password -otp");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Forgot Password - Initiate password reset
 */
const forgotPassword = async (email, phone) => {
  try {
    let user;
    
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      throw new Error("Email or phone is required");
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    user.resetOTP = otp;
    user.resetOTPExpires = otpExpires;
    await user.save();

    // Send OTP via email if email provided, otherwise via SMS
    if (email) {
      const { sendPasswordResetEmail } = require('./email.service');
      await sendPasswordResetEmail(email, user.name, otp);
    } else if (phone) {
      await sendOTP(phone, otp);
    }

    return {
      userId: user._id,
      message: "OTP sent to your email or phone",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Reset OTP
 */
const verifyResetOTP = async (userId, otp) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if OTP has expired
    if (new Date() > user.resetOTPExpires) {
      throw new Error("OTP has expired");
    }

    // Verify OTP
    if (user.resetOTP !== otp) {
      throw new Error("Invalid OTP");
    }

    return {
      message: "OTP verified successfully",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reset Password
 */
const resetPassword = async (userId, otp, newPassword) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify OTP one more time
    if (new Date() > user.resetOTPExpires) {
      throw new Error("OTP has expired");
    }

    if (user.resetOTP !== otp) {
      throw new Error("Invalid OTP");
    }

    // Hash and set new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpires = null;

    await user.save();

    return {
      message: "Password reset successfully",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Resend Reset OTP
 */
const resendResetOTP = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpires = otpExpires;
    await user.save();

    // Send OTP
    if (user.email) {
      const { sendPasswordResetEmail } = require('./email.service');
      await sendPasswordResetEmail(user.email, user.name, otp);
    } else if (user.phone) {
      await sendOTP(user.phone, otp);
    }

    return {
      message: "OTP resent successfully",
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Send Email Verification OTP (for logged-in users)
 */
const sendEmailVerificationOTP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.isEmailVerified) throw new Error("Email is already verified");

    const emailOtp = generateOTP();
    const emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOtp = emailOtp;
    user.emailOtpExpires = emailOtpExpires;
    await user.save();

    const { sendOtpEmail } = require('./email.service');
    await sendOtpEmail(user.email, user.name, emailOtp);

    return { message: "Email verification OTP sent" };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Email OTP (for logged-in users)
 */
const verifyEmailOTP = async (userId, emailOtp) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (new Date() > user.emailOtpExpires) {
      throw new Error("Email OTP has expired");
    }

    if (user.emailOtp !== emailOtp) {
      throw new Error("Invalid Email OTP");
    }

    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;
    await user.save();

    return {
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
      message: "Email verified successfully"
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
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
};
