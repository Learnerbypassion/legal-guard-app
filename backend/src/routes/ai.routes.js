const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/ai.controller");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth.middleware");

// POST /api/ai/analyze - Run full AI analysis on contract text
// Uses authenticate to ensure userId is always set so history is saved properly
router.post("/analyze", authenticate, analyze);

module.exports = router;
