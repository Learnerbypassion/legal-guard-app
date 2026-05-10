const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chat.controller");
const { validateChat } = require("../middlewares/validate.middleware");

// POST /api/chat - Ask a follow-up question about the contract
router.post("/", validateChat, chat);

module.exports = router;
