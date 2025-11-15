export function replaceTextNodes(translatedText) {
  try {
    document.body.innerText = translatedText;
  } catch (err) {
    console.error("replaceTextNodes error:", err);
  }
}
