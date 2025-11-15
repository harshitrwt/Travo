const BACKEND_URL = "http://localhost:5000";

// Get language from Chrome storage
function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["language"], (result) => {
      resolve(result.language || "hi");
    });
  });
}

// Send text to backend for translation
async function sendToBackend(text, targetLang) {
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
    return data.translated || text;
  } catch (err) {
    console.error("Error calling backend:", err);
    throw err;
  }
}

// Batch translation helper (sends an array of texts)
async function sendToBackendArray(texts, targetLang) {
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
    return data.translatedArray || texts;
  } catch (err) {
    console.error("Error calling backend (batch):", err);
    throw err;
  }
}


function getVisibleTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentNode;
      if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return NodeFilter.FILTER_REJECT;

      const tag = parent.tagName && parent.tagName.toUpperCase();
      const excluded = new Set([
        'SCRIPT','STYLE','NOSCRIPT','IFRAME','TEXTAREA','INPUT','CODE','PRE','SVG','CANVAS','BUTTON','SELECT','OPTION','HEAD','META','LINK'
      ]);
      if (excluded.has(tag)) return NodeFilter.FILTER_REJECT;

      const style = window.getComputedStyle(parent);
      if (style && (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) === 0)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }
  return nodes;
}

// Replace only text nodes using translatedParts
function replaceTextNodesByParts(nodes, translatedParts) {
  try {
    if (!Array.isArray(nodes) || !Array.isArray(translatedParts)) return false;
    if (nodes.length !== translatedParts.length) return false;

    for (let i = 0; i < nodes.length; i++) {
      try {
        nodes[i].nodeValue = translatedParts[i];
      } catch (err) {
        console.error('Error replacing node value at index', i, err);
      }
    }
    return true;
  } catch (err) {
    console.error('replaceTextNodesByParts error:', err);
    return false;
  }
}

console.log("Travo content script loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Content script received message:", msg);

  (async () => {
    try {
      if (msg.action === "translateSelection") {
        const userLang = await getLanguage();
        console.log("Translating selection to:", userLang);
        const translated = await sendToBackend(msg.text, userLang);
        console.log("Translation result:", translated);
        alert(`Translated (${userLang}): ${translated}`);
        sendResponse({ ok: true, translated });
      }

      if (msg.action === "translatePage") {
            const userLang = await getLanguage();
            console.log("Translating page to:", userLang);

            // Collect visible text nodes
            const nodes = getVisibleTextNodes(document.body);
            if (!nodes || nodes.length === 0) {
              console.warn("No visible text nodes to translate");
              sendResponse({ ok: false, error: "No text to translate" });
              return;
            }

            // Build payload joined with delimiter
            const DELIM = '<<<TRAVO_DELIM_42>>>';
            const texts = nodes.map(n => n.nodeValue);
            const full = texts.join(DELIM);

            if (full.length > 1000000) {
              console.warn('Text too large to translate in one request');
              sendResponse({ ok: false, error: 'Text too large' });
              return;
            }

            // Use batch API to translate each node separately (safer than delimiter splitting)
            try {
              // Use inline batch function to translate each text node
              const translatedParts = await sendToBackendArray(texts, userLang);
              if (Array.isArray(translatedParts) && translatedParts.length === nodes.length) {
                const ok = replaceTextNodesByParts(nodes, translatedParts);
                if (ok) {
                  sendResponse({ ok: true, translated: translatedParts[0].substring(0, 100) + '...' });
                } else {
                  console.error('Failed to replace nodes after translation (batch)');
                  sendResponse({ ok: false, error: 'Replacement failed' });
                }
              } else {
                console.error('Batch translated parts count mismatch', (translatedParts || []).length, nodes.length);
                sendResponse({ ok: false, error: 'Batch split mismatch' });
              }
            } catch (err) {
              console.warn('Batch translation failed, attempting single fallback', err);
              // Check if error is a rate limit / quota error
              if (err.message && /rate limit|quota|429/i.test(err.message)) {
                sendResponse({ ok: false, error: 'API rate limit reached. Please retry in 1 minute.' });
                return;
              }
              // fallback to single translation with delimiter
              const translatedFull = await sendToBackend(full, userLang);
              if (!translatedFull || typeof translatedFull !== 'string') {
                console.error('Invalid translated response');
                sendResponse({ ok: false, error: 'Invalid translation' });
                return;
              }
              const parts = translatedFull.split(DELIM);
              if (parts.length === nodes.length) {
                const ok = replaceTextNodesByParts(nodes, parts);
                if (ok) {
                  sendResponse({ ok: true, translated: parts[0].substring(0, 100) + '...' });
                } else {
                  console.error('Failed to replace nodes after translation (fallback)');
                  sendResponse({ ok: false, error: 'Replacement failed' });
                }
              } else {
                console.error('Translated parts count mismatch (fallback)', parts.length, nodes.length);
                sendResponse({ ok: false, error: 'Split mismatch' });
              }
            }
      }

      if (msg.action === "resetTranslation") {
        console.log("Resetting translation");
        window.location.reload();
        sendResponse({ ok: true });
      }
    } catch (err) {
      console.error("Content script error:", err);
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true;
});
