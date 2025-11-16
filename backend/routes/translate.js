// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const crypto = require("crypto");
// const { translateText } = require("../utils/geminiClient");

// const router = express.Router();
// const I18N_DIR = path.join(__dirname, "..", "i18n");


// if (!fs.existsSync(I18N_DIR)) fs.mkdirSync(I18N_DIR, { recursive: true });

// function ensureLocaleFile(lang) {
//   const file = path.join(I18N_DIR, `${lang}.json`);
//   if (!fs.existsSync(file)) {
//     fs.writeFileSync(file, JSON.stringify({}, null, 2), "utf8");
//   }
//   return file;
// }

// function saveToLocale(lang, key, value) {
//   const file = ensureLocaleFile(lang);
//   const raw = fs.readFileSync(file, "utf8") || "{}";
//   const json = raw ? JSON.parse(raw) : {};
//   json[key] = value;
//   fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
// }

// function generateKeyFromText(text) {
//   const h = crypto.createHash("sha256").update(text).digest("hex");
//   return `t_${h.slice(0, 10)}`;
// }


// router.post("/translate", async (req, res) => {
//   try {
//     const { text, texts, targetLang, save = true } = req.body;

//     // Batch mode (array of texts)
//     if (Array.isArray(texts) && texts.length > 0) {
//       console.log(`Translation batch request: items=${texts.length}, targetLang=${targetLang}`);
//       if (!targetLang) return res.status(400).json({ error: 'targetLang required' });

//       const translatedArray = [];
//       for (let i = 0; i < texts.length; i++) {
//         const t = texts[i] || '';
//         try {
//           let translated = await translateText(t, targetLang);
//           if (typeof translated !== 'string') translated = String(translated || '');
//           translated = translated.trim();
//           translatedArray.push(translated);

//           if (save) {
//             const key = generateKeyFromText(t);
//             saveToLocale(targetLang, key, translated);
//           }
//         } catch (err) {
//           // If quota/rate limit error, return 429 to client instead of crashing
//           if (err.status === 429 || /rate limit|quota|too many requests/i.test(String(err))) {
//             console.warn('Rate limit detected, signaling to client');
//             return res.status(429).json({ error: 'Rate limit exceeded. Please retry in 1 minute.' });
//           }
//           console.error('Batch item translation failed at index', i, err);
//           translatedArray.push('');
//         }
//       }

//       return res.json({ translatedArray });
//     }

//     // Single text mode
//     const txt = text;
//     console.log(`Translation request: text length=${txt?.length}, targetLang=${targetLang}`);

//     if (!txt || !targetLang) {
//       return res.status(400).json({ error: "text and targetLang required" });
//     }

//     if (txt.length > 1000000) {
//       return res.status(413).json({ error: "Text too large (max 1MB)" });
//     }

//     let translated;
//     try {
//       translated = await translateText(txt, targetLang);
//     } catch (err) {
//       // If quota/rate limit error, return 429 to client instead of crashing
//       if (err.status === 429 || /rate limit|quota|too many requests/i.test(String(err))) {
//         console.warn('Rate limit detected on single-text request, signaling to client');
//         return res.status(429).json({ error: 'Rate limit exceeded. Please retry in 1 minute.' });
//       }
//       throw err;
//     }

//     if (typeof translated === "string") {
//       translated = translated.trim();
//     } else {
//       translated = String(translated).trim();
//     }

//     console.log(`Translation successful: output length=${translated.length}`);

//     let saved = null;
//     if (save) {
//       const key = generateKeyFromText(txt);
//       saveToLocale(targetLang, key, translated);
//       saved = { lang: targetLang, key };
//       console.log(`Saved to locale: ${targetLang}/${key}`);
//     }

//     return res.json({ translated, saved });
//   } catch (err) {
//     console.error("translate error:", err);
//     return res.status(500).json({
//       error: "translation failed",
//       details: err.message || String(err),
//     });
//   }
// });

// router.get("/locales/:lang", (req, res) => {
//   try {
//     const lang = req.params.lang;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));
//     res.json({ lang, keys: Object.keys(json), entries: json });
//   } catch (err) {
//     res.status(500).json({ error: "failed to read locale", details: err.message });
//   }
// });

// /** DELETE /api/locales/:lang/:key */
// router.delete("/locales/:lang/:key", (req, res) => {
//   try {
//     const { lang, key } = req.params;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));
//     if (!Object.prototype.hasOwnProperty.call(json, key)) {
//       return res.status(404).json({ error: "key not found" });
//     }
//     delete json[key];
//     fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
//     res.json({ ok: true });
//   } catch (err) {
//     res.status(500).json({ error: "failed to delete key", details: err.message });
//   }
// });

// module.exports = router;


// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const crypto = require("crypto");

// const { translateTextGemini } = require("../utils/geminiClient");
// const { translateWithLingo } = require("../utils/lingoClient");

// const router = express.Router();
// const I18N_DIR = path.join(__dirname, "..", "i18n");

// if (!fs.existsSync(I18N_DIR)) fs.mkdirSync(I18N_DIR, { recursive: true });

// function ensureLocaleFile(lang) {
//   const file = path.join(I18N_DIR, `${lang}.json`);
//   if (!fs.existsSync(file)) {
//     fs.writeFileSync(file, JSON.stringify({}, null, 2), "utf8");
//   }
//   return file;
// }

// function saveToLocale(lang, key, value) {
//   const file = ensureLocaleFile(lang);
//   const raw = fs.readFileSync(file, "utf8") || "{}";
//   const json = raw ? JSON.parse(raw) : {};
//   json[key] = value;
//   fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
// }

// function generateKeyFromText(text) {
//   const h = crypto.createHash("sha256").update(text).digest("hex");
//   return `t_${h.slice(0, 10)}`;
// }


// async function smartTranslate(text, targetLang) {
//   try {
//     return await translateTextGemini(text, targetLang);
//   } catch (err) {
//     if (err.status === 429) {
//       console.log("Gemini quota reached → fallback to Lingo");
//       return await translateWithLingo(text, targetLang);
//     }

//     console.log("Gemini failed (non-quota). Still falling back → Lingo");
//     return await translateWithLingo(text, targetLang);
//   }
// }


// router.post("/translate", async (req, res) => {
//   try {
//     const { text, texts, targetLang, save = true } = req.body;

//     // Batch mode
//     if (Array.isArray(texts) && texts.length > 0) {
//       const translatedArray = [];

//       for (let t of texts) {
//         try {
//           const translated = await smartTranslate(t, targetLang);
//           translatedArray.push(translated);

//           if (save) {
//             const key = generateKeyFromText(t);
//             saveToLocale(targetLang, key, translated);
//           }
//         } catch (err) {
//           translatedArray.push("");
//         }
//       }

//       return res.json({ translatedArray });
//     }

//     // Single text
//     if (!text || !targetLang) {
//       return res.status(400).json({ error: "text and targetLang required" });
//     }

//     const translated = await smartTranslate(text, targetLang);

//     let saved = null;
//     if (save) {
//       const key = generateKeyFromText(text);
//       saveToLocale(targetLang, key, translated);
//       saved = { lang: targetLang, key };
//     }

//     return res.json({ translated, saved });
//   } catch (err) {
//     console.error("translate error:", err);
//     return res.status(500).json({ error: "translation failed", details: err.message });
//   }
// });

// router.get("/locales/:lang", (req, res) => {
//   try {
//     const lang = req.params.lang;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));
//     res.json({ lang, keys: Object.keys(json), entries: json });
//   } catch (err) {
//     res.status(500).json({ error: "failed to read locale", details: err.message });
//   }
// });

// router.delete("/locales/:lang/:key", (req, res) => {
//   try {
//     const { lang, key } = req.params;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));

//     if (!json[key]) {
//       return res.status(404).json({ error: "key not found" });
//     }

//     delete json[key];
//     fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
//     res.json({ ok: true });
//   } catch (err) {
//     res.status(500).json({ error: "failed to delete key", details: err.message });
//   }
// });

// module.exports = router;






// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const crypto = require("crypto");
// const { translateText } = require("../utils/geminiClient");

// const router = express.Router();
// const I18N_DIR = path.join(__dirname, "..", "i18n");

// if (!fs.existsSync(I18N_DIR)) fs.mkdirSync(I18N_DIR, { recursive: true });

// function ensureLocaleFile(lang) {
//   const file = path.join(I18N_DIR, `${lang}.json`);
//   if (!fs.existsSync(file)) {
//     fs.writeFileSync(file, JSON.stringify({}, null, 2), "utf8");
//   }
//   return file;
// }

// function saveToLocale(lang, key, value) {
//   const file = ensureLocaleFile(lang);
//   const raw = fs.readFileSync(file, "utf8") || "{}";
//   const json = raw ? JSON.parse(raw) : {};
//   json[key] = value;
//   fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
// }

// function generateKeyFromText(text) {
//   const h = crypto.createHash("sha256").update(text).digest("hex");
//   return `t_${h.slice(0, 10)}`;
// }

// router.post("/translate", async (req, res) => {
//   try {
//     const { text, texts, targetLang, save = true } = req.body;

//     // -------------------------------------------------------------
//     // BATCH MODE (1 request to Gemini)
//     // -------------------------------------------------------------
//     if (Array.isArray(texts) && texts.length > 0) {
//       console.log(`Batch request (${texts.length} items → ${targetLang})`);

//       if (!targetLang) {
//         return res.status(400).json({ error: "targetLang required" });
//       }

//       const combined = texts
//         .map((t, i) => `[[IDX:${i}]] ${t}`)
//         .join("\n\n");

//       let translated;
//       try {
//         translated = await translateText(combined, targetLang);
//       } catch (err) {
//         if (err.status === 429) {
//           return res.status(429).json({ error: "Rate limit. Retry later." });
//         }
//         throw err;
//       }

//       // Split translated text
//       const chunks = translated.split(/\[\[IDX:/).slice(1);
//       const translatedArray = chunks.map((blok) =>
//         blok.replace(/^\d+\]\]/, "").trim()
//       );

//       // Save to locale
//       if (save) {
//         translatedArray.forEach((v, i) => {
//           const key = generateKeyFromText(texts[i]);
//           saveToLocale(targetLang, key, v);
//         });
//       }

//       return res.json({ translatedArray });
//     }

//     // -------------------------------------------------------------
//     // SINGLE MODE
//     // -------------------------------------------------------------
//     if (!text || !targetLang)
//       return res.status(400).json({ error: "text and targetLang required" });

//     if (text.length > 1_000_000)
//       return res.status(413).json({ error: "Text too large (max 1MB)" });

//     let translated;
//     try {
//       translated = await translateText(text, targetLang);
//     } catch (err) {
//       if (err.status === 429) {
//         return res.status(429).json({ error: "Rate limit exceeded" });
//       }
//       throw err;
//     }

//     translated = String(translated || "").trim();

//     let saved = null;
//     if (save) {
//       const key = generateKeyFromText(text);
//       saveToLocale(targetLang, key, translated);
//       saved = { lang: targetLang, key };
//     }

//     return res.json({ translated, saved });
//   } catch (err) {
//     console.error("translate error:", err);
//     return res.status(500).json({
//       error: "translation failed",
//       details: err.message || String(err),
//     });
//   }
// });

// router.get("/locales/:lang", (req, res) => {
//   try {
//     const lang = req.params.lang;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));
//     res.json({ lang, keys: Object.keys(json), entries: json });
//   } catch (err) {
//     res.status(500).json({ error: "failed to read locale", details: err.message });
//   }
// });

// router.delete("/locales/:lang/:key", (req, res) => {
//   try {
//     const { lang, key } = req.params;
//     const file = ensureLocaleFile(lang);
//     const json = JSON.parse(fs.readFileSync(file, "utf8"));

//     if (!json[key]) {
//       return res.status(404).json({ error: "key not found" });
//     }

//     delete json[key];
//     fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
//     res.json({ ok: true });
//   } catch (err) {
//     res.status(500).json({ error: "failed to delete key", details: err.message });
//   }
// });

// module.exports = router;





const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { translateText } = require("../utils/geminiClient");
const { translateWithLingo } = require("../utils/lingoClient");

const router = express.Router();
const I18N_DIR = path.join(__dirname, "..", "i18n");

if (!fs.existsSync(I18N_DIR)) fs.mkdirSync(I18N_DIR, { recursive: true });

function ensureLocaleFile(lang) {
  const file = path.join(I18N_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2), "utf8");
  }
  return file;
}

function saveToLocale(lang, key, value) {
  const file = ensureLocaleFile(lang);
  const raw = fs.readFileSync(file, "utf8") || "{}";
  const json = raw ? JSON.parse(raw) : {};
  json[key] = value;
  fs.writeFileSync(file, JSON.stringify(json, null, 2), "utf8");
}

function generateKeyFromText(text) {
  const h = crypto.createHash("sha256").update(text).digest("hex");
  return `t_${h.slice(0, 10)}`;
}

// ===========================================================
// TRANSLATION ROUTE
// ===========================================================
router.post("/translate", async (req, res) => {
  try {
    const { text, texts, targetLang, save = true } = req.body;

    // ================================
    // BATCH MODE
    // ================================
    if (Array.isArray(texts) && texts.length > 0) {
      console.log(`Batch request → ${texts.length} items → ${targetLang}`);

      const combined = texts
        .map((t, i) => `[[IDX:${i}]] ${t}`)
        .join("\n\n");

      let translated = await translateText(combined, targetLang);

      // Fallback to Lingo per-item
      if (!translated) {
        console.warn("Gemini failed. Using Lingo fallback (batch).");

        const fallbackArray = [];
        for (const t of texts) {
          const result = await translateWithLingo(t, targetLang);
          fallbackArray.push(result);
        }

        if (save) {
          fallbackArray.forEach((v, i) => {
            const key = generateKeyFromText(texts[i]);
            saveToLocale(targetLang, key, v);
          });
        }

        return res.json({ translatedArray: fallbackArray });
      }

      // Split Gemini output
      const blocks = translated.split(/\[\[IDX:/).slice(1);
      const translatedArray = blocks.map((b) =>
        b.replace(/^\d+\]\]/, "").trim()
      );

      if (save) {
        translatedArray.forEach((v, i) => {
          const key = generateKeyFromText(texts[i]);
          saveToLocale(targetLang, key, v);
        });
      }

      return res.json({ translatedArray });
    }

    // ================================
    // SINGLE MODE
    // ================================
    if (!text || !targetLang)
      return res.status(400).json({ error: "text and targetLang required" });

    // Try Gemini
    let translated = await translateText(text, targetLang);

    // Fallback to Lingo if Gemini fails
    if (!translated) {
      try {
        console.log("Gemini failed → using Lingo fallback (single).");
        translated = await translateWithLingo(text, targetLang);
      } catch (lingoError) {
        console.error("Lingo translation failed:", lingoError);
        return res.status(500).json({ error: "Both Gemini and Lingo failed" });
      }
    }

    translated = (translated || "").trim();

    // Save translation
    let saved = null;
    if (save) {
      const key = generateKeyFromText(text);
      saveToLocale(targetLang, key, translated);
      saved = { lang: targetLang, key };
    }

    return res.json({ translated, saved });

  } catch (err) {
    console.error("translate error:", err);
    return res.status(500).json({
      error: "translation failed",
      details: err.message || String(err),
    });
  }
});

// ===========================================================
// LOCALES ROUTES
// ===========================================================
router.get("/locales/:lang", (req, res) => {
  try {
    const lang = req.params.lang;
    const file = ensureLocaleFile(lang);
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    res.json({ lang, keys: Object.keys(json), entries: json });
  } catch (err) {
    res.status(500).json({ error: "failed to read locale", details: err.message });
  }
});

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
    res.status(500).json({ error: "failed to delete key", details: err.message });
  }
});

module.exports = router;
