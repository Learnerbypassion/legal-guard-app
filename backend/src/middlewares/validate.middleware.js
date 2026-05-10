/**
 * Validates chat request body
 */
const validateChat = (req, res, next) => {
  const { question, contractText } = req.body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Question is required." });
  }

  if (!contractText || typeof contractText !== "string" || contractText.trim().length < 10) {
    return res.status(400).json({ success: false, error: "Contract text is required for chat context." });
  }

  if (question.length > 500) {
    return res.status(400).json({ success: false, error: "Question too long. Max 500 characters." });
  }

  next();
};

module.exports = { validateChat };
