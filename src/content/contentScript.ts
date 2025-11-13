import { sendToBackend } from "../content/api";
import { replaceTextNodes } from "../content/domUtils";
import { getLanguage } from "../utils/storage";

// Listen for context menu or popup trigger
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === "translateSelection") {
    const userLang = await getLanguage();
    const selectedText = msg.text;
    const translated = await sendToBackend(selectedText, userLang);
    alert(`Translated (${userLang}): ${translated}`);
  }

  if (msg.action === "translatePage") {
    const userLang = await getLanguage();
    const textNodes = document.body.innerText;
    const translated = await sendToBackend(textNodes, userLang);
    replaceTextNodes(translated);
  }

  if (msg.action === "resetTranslation") {
    window.location.reload();
  }
});
