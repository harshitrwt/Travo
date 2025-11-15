// require("dotenv").config();
// const API_KEY = process.env.GEMINI_API_KEY;

// if (!API_KEY) {
//   console.warn("GEMINI_API_KEY not found.");
// }

// async function translateText(text, targetLang) {
//   const prompt = `Translate the following text into ${targetLang}. Return only the translated text.\n\n${text}`;

//   try {
    
//     const { GoogleGenerativeAI } = require("@google/generative-ai");
//     const client = new GoogleGenerativeAI(API_KEY);
    
//     const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    
//     const result = await model.generateContent(prompt);
//     if (result && typeof result.response?.text === "function") {
//       const textOut = await result.response.text();
//       return textOut;
//     }
//     if (result?.output?.length) {
//       return result.output.map((o) => o.content?.[0]?.text || o.text || "").join("\n").trim();
//     }
//     throw new Error("Unexpected response shape from @google/generative-ai client.");
//   } catch (err) {
//     if (err.code === "MODULE_NOT_FOUND" || /Cannot find module/.test(String(err))) {
//       console.error("Optional dependency @google/generative-ai not found. Install it if you want to use the official client:");
//       console.error("  npm install @google/generative-ai");
//     } else {
      
//       console.error("translate error (client attempt):", err);
//     }

//     const fetch = require("node-fetch");
//     const modelId = process.env.GEMINI_MODEL || "models/text-bison-001"; 

//     const url = `https://generativelanguage.googleapis.com/v1beta2/${modelId}:generateText?key=${API_KEY}`;

//     const body = {
//       prompt: {
//         text: prompt
//       },
//       temperature: 0.2,
//       maxOutputTokens: 1024
//     };

//     try {
//       const r = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body)
//       });
//       const j = await r.json();
//       // Check for quota/rate limit errors from REST API
//       if (j?.error?.code === 429 || r.status === 429) {
//         const err429 = new Error("Gemini API rate limit exceeded");
//         err429.status = 429;
//         throw err429;
//       }
//       if (j?.candidates?.length && j.candidates[0].content) {
//         const parts = j.candidates[0].content.map((c) => c.text || "").join("");
//         return parts;
//       }
//       if (j?.output?.[0]?.content) {
//         return j.output.map((o) => (o.content?.map((c) => c.text || "").join("") || "")).join("\n");
//       }
      
//       if (j?.result) return String(j.result);
//       const err = new Error("Unexpected response from REST fallback: " + JSON.stringify(j));
//       err.status = r.status;
//       throw err;
//     } catch (err2) {
//       // Mark quota errors for proper handling upstream
//       if (err2.status === 429 || /rate limit|quota|too many requests/i.test(String(err2))) {
//         err2.status = 429;
//       }
//       console.error("Gemini REST fallback error:", err2);
//       throw err2;
//     }
//   }
// }

// module.exports = { translateText };


require("dotenv").config();
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY missing.");
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function translateText(text, targetLang) {
  const prompt = `Translate the following text into ${targetLang}. 
Return ONLY the translated text.

${text}`;

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const client = new GoogleGenerativeAI(API_KEY);

    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);

    if (result && typeof result.response?.text === "function") {
      return await result.response.text();
    }

    throw new Error("Unexpected Gemini official-client response");
  } catch (err) {
    console.error("Gemini client error:", err);

    const fetch = require("node-fetch");
    const modelId = process.env.GEMINI_MODEL || "models/text-bison-001";

    const url = `https://generativelanguage.googleapis.com/v1beta2/${modelId}:generateText?key=${API_KEY}`;

    const body = {
      prompt: { text: prompt },
      temperature: 0.2,
      maxOutputTokens: 1024,
    };

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const j = await r.json();

        if (j?.error?.code === 429 || r.status === 429) {
          if (attempts < maxAttempts) {
            await wait(1500);
            continue;
          }
          const e429 = new Error("Gemini quota exceeded");
          e429.status = 429;
          throw e429;
        }

        if (j?.candidates?.length) {
          return j.candidates[0].content.map((c) => c.text || "").join("");
        }

        throw new Error("Unexpected REST response: " + JSON.stringify(j));
      } catch (err2) {
        if (attempts < maxAttempts) {
          await wait(1500);
          continue;
        }
        err2.status = err2.status || 500;
        console.error("Gemini REST fallback final error:", err2);
        throw err2;
      }
    }
  }
}

module.exports = { translateText };
