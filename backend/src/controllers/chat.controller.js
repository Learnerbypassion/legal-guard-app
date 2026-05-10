const { askQuestion } = require("../services/ai.service");

/**
 * POST /api/chat
 * Body: { contractText, question, history, language }
 */
const chat = async (req, res, next) => {
  try {
    const {
      contractText,
      question,
      history = [],
      language = "English",
    } = req.body;

    const answer = await askQuestion(contractText, question, history, language);

    res.status(200).json({
      success: true,
      question,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };
