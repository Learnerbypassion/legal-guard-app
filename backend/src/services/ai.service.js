const { getModel } = require("../config/gemini");
const { ANALYSIS_PROMPT, ANALYSIS_IMAGE_PROMPT, CHAT_PROMPT } = require("../constants/prompts");
const { safeParseJSON } = require("../utils/jsonParser");

/**
 * Analyzes contract text using Gemini AI
 * @param {string} contractText - cleaned contract text
 * @param {string} userType - freelancer | business | student | general
 * @param {string} language - English | Hindi | Bengali
 * @returns {Promise<object>} structured analysis result
 */
const analyzeContract = async (contractText, userType = "general", language = "English") => {
  try {
    const model = getModel("gemini-3-flash-preview");
    const prompt = ANALYSIS_PROMPT(contractText, userType, language);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsed = safeParseJSON(responseText);
    return parsed;
  } catch (error) {
    if (error.message.includes("parse")) {
      throw new Error("AI returned an invalid response. Please try again.");
    }
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

/**
 * Analyzes contract image using Gemini Vision API
 * @param {string} imageUrl - ImageKit URL of the contract image
 * @param {string} userType - freelancer | business | student | general
 * @param {string} language - English | Hindi | Bengali
 * @returns {Promise<object>} structured analysis result
 */
const analyzeImage = async (imageUrl, userType = "general", language = "English") => {
  try {
    console.log("📸 Fetching image from URL:", imageUrl);
    
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert to base64
    const buffer = await response.buffer ? response.buffer() : Buffer.from(await response.arrayBuffer());
    const base64Data = buffer.toString("base64");

    console.log("🔄 Converting to base64 (" + base64Data.length + " chars)");

    const model = getModel("gemini-3-flash-preview");
    const promptConfig = ANALYSIS_IMAGE_PROMPT(userType, language);

    // Determine mime type based on URL
    let mimeType = "image/jpeg";
    if (imageUrl.includes(".png")) mimeType = "image/png";
    else if (imageUrl.includes(".gif")) mimeType = "image/gif";
    else if (imageUrl.includes(".webp")) mimeType = "image/webp";
    else if (imageUrl.includes(".bmp")) mimeType = "image/bmp";

    console.log("📤 Sending to Gemini with mimeType:", mimeType);

    const result = await model.generateContent([
      {
        text: promptConfig.text,
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data, // Send as base64 bytes
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("✅ Image analyzed successfully");
    const parsed = safeParseJSON(responseText);
    return parsed;
  } catch (error) {
    console.error("❌ Image analysis error:", error.message);
    if (error.message.includes("parse")) {
      throw new Error("AI returned an invalid response. Please try again.");
    }
    throw new Error(`Image analysis failed: ${error.message}`);
  }
};

/**
 * Handles follow-up questions about the contract
 * @param {string} contractText - original contract text
 * @param {string} question - user's question
 * @param {Array} history - chat history [{ role, content }]
 * @param {string} language
 * @returns {Promise<string>} AI answer
 */
const askQuestion = async (contractText, question, history = [], language = "English") => {
  try {
    const model = getModel("gemini-3-flash-preview");
    const prompt = CHAT_PROMPT(contractText, question, history, language);

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    throw new Error(`Chat failed: ${error.message}`);
  }
};

module.exports = { analyzeContract, analyzeImage, askQuestion };
