// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/translate");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

app.use("/api", routes);


app.get("/health", (req, res) => res.json({ status: "ok" }));


app.use("/i18n", express.static(path.join(__dirname, "i18n")));

app.listen(PORT, () => {
  console.log(`Travo backend listening on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Warning: GEMINI_API_KEY is not set in backend/.env");
  }
});
