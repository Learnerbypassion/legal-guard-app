const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/ai.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");

// POST /api/analyze - Run full AI analysis on contract text
router.post("/analyze", optionalAuthenticate, analyze);

module.exports = router;
