const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { getChatHistory, getConversations } = require("../controllers/livechat.controller");

// All livechat routes require authentication
router.get("/history/:recipientId", authenticate, getChatHistory);
router.get("/conversations", authenticate, getConversations);

module.exports = router;
