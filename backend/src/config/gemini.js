const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("./env");

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const getModel = (modelName = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { genAI, getModel };
