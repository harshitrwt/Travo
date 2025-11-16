// const fetch = require("node-fetch");

// async function translateWithLingo(text, targetLang) {
//   try {
//     const res = await fetch("https://lingva.ml/api/v1/auto/" + targetLang + "/" + encodeURIComponent(text));
//     if (!res.ok) {
//       throw new Error("Lingo API error " + res.status);
//     }

//     const data = await res.json();
//     return data?.translation || "";
//   } catch (err) {
//     console.error("Lingo translation failed:", err);
//     throw err;
//   }
// }

// module.exports = { translateWithLingo };



import axios from "axios";

// Language detect API (free, lightweight)
async function detectLanguage(text) {
  try {
    const res = await axios.post(
      "https://libretranslate.com/detect",
      { q: text },
      { timeout: 8000 }
    );

    if (res.data && res.data[0] && res.data[0].language) {
      return res.data[0].language; // example: "en", "hi", "fr"
    }
  } catch (err) {
    console.error("Language detection failed:", err.message);
  }

    // fallback
  return "en";
}

const LINGO_API_URL = "https://api-b2b.backenster.com/b1/api/v3/translate";

export async function translateWithLingo(text, targetLang) {
  try {
    // STEP 1: Detect source lang
    const fromLang = await detectLanguage(text);
    console.log("Detected source language for Lingo:", fromLang);

    // STEP 2: Call Lingvanex
    const res = await axios.post(
      LINGO_API_URL,
      {
        text: text,
        from: fromLang,      
        to: targetLang
      },
      {
        headers: {
          Authorization: process.env.LINGO_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    if (res.data?.result) {
      return res.data.result;
    }

    throw new Error("Invalid response from Lingo");
  } catch (err) {
    console.error("Lingo API error:", err.response?.data || err.message);
    throw new Error("Lingo API error");
  }
}
