const express = require("express");
const router = express.Router();
const {
  recommendProfessionals,
  contactProfessional,
} = require("../controllers/professional.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// GET /api/professionals/recommend?type=Lawyer
router.get("/recommend", authenticate, recommendProfessionals);

// POST /api/professionals/contact
router.post("/contact", authenticate, contactProfessional);

module.exports = router;
