const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const routes = require("./routes/translate");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

app.use("/api", routes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/locales", express.static(path.join(__dirname, "locales")));

app.listen(PORT, () => {
  console.log(`Travo backend listening on port ${PORT}`);
  console.log(`Ensure GEMINI_API_KEY is set in backend/.env`);
});
