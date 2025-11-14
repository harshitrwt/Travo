const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { translateText } = require("../utils/geminiClient");

const router = express.Router();

const LOCALES_DIR = path.join(__dirname, "..", "i18n");

function ensureLocaleFile(lang) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2), "utf8");
  }
  return file;
}


/** Save a translation into locales/<lang>.json */
function saveToLocale(lang, key, value) {
  const file = ensureLocaleFile(lang);
  const raw = fs.readFileSync(file, "utf8");
  const json = raw ? JSON.parse(raw) : {};
  json[key] = value;
  fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
}

/** Generate translation key */
function generateKeyFromText(text) {
  const h = crypto.createHash("sha256").update(text).digest("hex");
  return `t_${h.slice(0, 10)}`;
}

/** POST /api/translate */
router.post("/translate", async (req, res) => {
  try {
    const { text, target, save = true, saveKey } = req.body;

    if (!text || !target) {
      return res.status(400).json({ error: "text and target required" });
    }

    // Call Gemini API
    let translated = await translateText(text, target);

    // Remove unwanted newline or spaces
    translated = translated.trim();

    let saved = null;

    if (save) {
      const key = saveKey || generateKeyFromText(text);
      saveToLocale(target, key, translated);
      saved = { lang: target, key };
    }

    return res.json({
      translated,
      saved
    });

  } catch (err) {
    console.error("translate error:", err);
    return res.status(500).json({
      error: "translation failed",
      details: err.message || err
    });
  }
});

/** GET /api/locales/:lang */
router.get("/locales/:lang", (req, res) => {
  try {
    const lang = req.params.lang;
    const file = ensureLocaleFile(lang);
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    res.json({ lang, keys: Object.keys(json), entries: json });
  } catch (err) {
    res.status(500).json({
      error: "failed to read locale",
      details: err.message
    });
  }
});

/** DELETE /api/locales/:lang/:key */
router.delete("/locales/:lang/:key", (req, res) => {
  try {
    const { lang, key } = req.params;
    const file = ensureLocaleFile(lang);
    const json = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!json[key]) {
      return res.status(404).json({ error: "key not found" });
    }

    delete json[key];
    fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({
      error: "failed to delete key",
      details: err.message
    });
  }
});

module.exports = router;
