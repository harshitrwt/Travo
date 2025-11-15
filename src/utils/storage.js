export async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["language"], (result) => {
      resolve(result.language || "hi");
    });
  });
}

export async function setLanguage(lang) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ language: lang }, () => resolve());
  });
}
