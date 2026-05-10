const { getModel } = require("../config/gemini");
const { ANALYSIS_PROMPT, CHAT_PROMPT } = require("../constants/prompts");
const { safeParseJSON } = require("../utils/jsonParser");
const axios = require("axios");

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
 * Analyzes document image using Gemini Vision API
 * Extracts text from the image and analyzes it
 * @param {string} imageUrl - URL of the document image
 * @param {string} userType - freelancer | business | student | general
 * @param {string} language - English | Hindi | Bengali
 * @returns {Promise<object>} structured analysis result
 */
const analyzeImage = async (imageUrl, userType = "general", language = "English") => {
  try {
    const model = getModel("gemini-3-flash-preview");

    // First, extract text from the image using vision
    const extractionPrompt = `You are a document analysis expert. Analyze the document image and extract all text content. 
    Please provide the complete, accurately transcribed text from this legal document.
    Format: Return the extracted text as plain text.`;

    const visionResponse = await model.generateContent([
      extractionPrompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: await getImageAsBase64(imageUrl),
        },
      },
    ]);

    const extractedText = visionResponse.response.text().trim();

    if (!extractedText || extractedText.length < 50) {
      throw new Error("Could not extract meaningful text from the image. Please ensure the image is clear and readable.");
    }

    // Now analyze the extracted text as if it were a contract
    const analysisPrompt = ANALYSIS_PROMPT(extractedText, userType, language);
    const analysisResponse = await model.generateContent(analysisPrompt);
    const analysisText = analysisResponse.response.text();

    const parsed = safeParseJSON(analysisText);
    
    // Include extracted text in the response
    parsed.extractedText = extractedText;
    
    return parsed;
  } catch (error) {
    if (error.message.includes("parse")) {
      throw new Error("AI returned an invalid response. Please try again.");
    }
    if (error.message.includes("Could not extract")) {
      throw error;
    }
    throw new Error(`Image analysis failed: ${error.message}`);
  }
};

/**
 * Convert image URL to base64 for Gemini API
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} base64 encoded image
 */
const getImageAsBase64 = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
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
