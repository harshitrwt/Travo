chrome.runtime.onInstalled.addListener(() => {
  console.log("Travo installed");

  // context menu for quick translation
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Translate selected text with LingoSurf",
    contexts: ["selection"]
  });
});

// When user right-clicks and clicks "Translate selection"
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "translate-selection" && info.selectionText) {
    chrome.tabs.sendMessage(tab!.id!, {
      action: "translateSelection",
      text: info.selectionText
    });
  }
});
