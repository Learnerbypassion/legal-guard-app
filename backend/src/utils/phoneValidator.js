const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

/**
 * Validate and normalize phone number for any country
 * Handles formats like:
 * - 9876543210 (India, auto-detect)
 * - 91 9876543210 (India with code)
 * - +91 98765 43210 (India with +)
 * - +1 555 000 0000 (USA)
 * - +44 20 7946 0958 (UK)
 */
const validateAndNormalizePhone = (phoneInput, defaultCountry = 'IN') => {
  try {
    if (!phoneInput) {
      throw new Error('Phone number is required');
    }

    // Clean the input
    let phone = phoneInput.toString().trim();

    // Check if it's already in international format or has country code
    let parsed;
    
    try {
      // Try to parse as is
      parsed = parsePhoneNumber(phone);
    } catch (e) {
      // If it fails and doesn't have +, try with default country
      if (!phone.startsWith('+')) {
        try {
          parsed = parsePhoneNumber(phone, defaultCountry);
        } catch (e2) {
          throw new Error(`Invalid phone number format: ${phoneInput}`);
        }
      } else {
        throw new Error(`Invalid phone number format: ${phoneInput}`);
      }
    }

    // Validate the parsed number
    if (!parsed || !isValidPhoneNumber(phone, parsed.country)) {
      throw new Error(`Invalid phone number: ${phoneInput}`);
    }

    // Return in E.164 format (e.g., +919876543210)
    return parsed.format('E.164');
  } catch (error) {
    throw new Error(`Phone validation failed: ${error.message}`);
  }
};

/**
 * Check if phone is from India
 */
const isIndianPhone = (phone) => {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed && parsed.country === 'IN';
  } catch (e) {
    return false;
  }
};

/**
 * Get country code from phone number
 */
const getCountryFromPhone = (phone) => {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed ? parsed.country : null;
  } catch (e) {
    return null;
  }
};

module.exports = {
  validateAndNormalizePhone,
  isIndianPhone,
  getCountryFromPhone,
};
