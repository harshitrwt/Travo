import { sendToBackend } from "./api";
import { replaceTextNodes } from "./domUtils";
import { getLanguage } from "../utils/storage";

chrome.runtime.onMessage.addListener(async (msg) => {
  
  if (msg.action === "translateSelection") {
    const userLang = await getLanguage();
    const translated = await sendToBackend(msg.text, userLang);
    alert(`Translated (${userLang}): ${translated}`);
  }

  if (msg.action === "translatePage") {
    const userLang = await getLanguage();
    replaceTextNodes(async (text) => {
      return await sendToBackend(text, userLang);
    });
  }

  if (msg.action === "resetTranslation") {
    window.location.reload();
  }
});
