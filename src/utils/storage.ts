export async function getLanguage(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["language"], (result) => {
      resolve(result.language || "hi");
    });
  });
}

export async function setLanguage(lang: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ language: lang }, () => resolve());
  });
}
