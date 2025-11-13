export function replaceTextNodes(translatedText: string) {
  // Simple method: replace entire body text (for MVP)
  document.body.innerText = translatedText;
}
