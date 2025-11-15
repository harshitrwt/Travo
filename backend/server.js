// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/translate");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    gemini_key_set: !!process.env.GEMINI_API_KEY
  });
});

app.use("/i18n", express.static(path.join(__dirname, "i18n")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Travo backend listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  Warning: GEMINI_API_KEY is not set in backend/.env");
  } else {
    console.log("✓ GEMINI_API_KEY is configured");
  }
});
