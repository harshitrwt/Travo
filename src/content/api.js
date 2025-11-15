import { BACKEND_URL } from "../utils/config.js";

export async function sendToBackend(text, targetLang) {
  try {
    console.log(`Calling backend: ${BACKEND_URL}/api/translate`);
    console.log(`Text length: ${text.length}, Target lang: ${targetLang}`);

    const res = await fetch(`${BACKEND_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang, save: true })
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Backend error:", errorData);
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("Backend returned translation, length:", data.translated?.length);
    // backend returns { translated, saved }
    return data.translated || text;
  } catch (err) {
    console.error("Error calling backend:", err);
    throw err; // Re-throw so content script can handle it
  }
}

export async function sendToBackendArray(texts, targetLang) {
  try {
    console.log(`Calling backend (batch): ${BACKEND_URL}/api/translate`);
    console.log(`Items: ${texts.length}, Target lang: ${targetLang}`);

    const res = await fetch(`${BACKEND_URL}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLang, save: true })
    });

    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Backend error:", errorData);
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("Backend returned batch translation, items:", (data.translatedArray || []).length);
    // backend returns { translatedArray, saved }
    return data.translatedArray || texts;
  } catch (err) {
    console.error("Error calling backend (batch):", err);
    throw err;
  }
}
