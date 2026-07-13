const express = require("express");
const router = express.Router();
const {
  recommendProfessionals,
  contactProfessional,
  getProfessionalById,
} = require("../controllers/professional.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// GET /api/professionals/recommend?type=Lawyer
router.get("/recommend", authenticate, recommendProfessionals);

// POST /api/professionals/contact
router.post("/contact", authenticate, contactProfessional);

// GET /api/professionals/:id
router.get("/:id", authenticate, getProfessionalById);

module.exports = router;
