import { BACKEND_URL } from "../utils/config";

// Sends text to backend for translation
export async function sendToBackend(text, targetLang) {
  try {
    const res = await fetch(`${BACKEND_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang })
    });
    const data = await res.json();
    return data.translated;
  } catch (err) {
    console.error("Error calling backend:", err);
    return text;
  }
}
