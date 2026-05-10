const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { FRONTEND_URL } = require("./config/env");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const aiRoutes = require("./routes/ai.routes");
const chatRoutes = require("./routes/chat.routes");
const professionalRoutes = require("./routes/professional.routes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Legal Guardian API", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/professionals", professionalRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
