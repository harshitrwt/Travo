import React, { useState, useEffect } from "react";
import "./Popup.css";
import { getLanguage, setLanguage } from "../utils/storage.js";

const languages = [
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "jp", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
];

const Popup = () => {
  const [selectedLang, setSelectedLang] = useState("hi");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    getLanguage().then((lang) => {
      if (lang) setSelectedLang(lang);
    });
  }, []);

  const injectContentScript = async (tabId) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["contentScript.js"]
      });
      return true;
    } catch (err) {
      console.error("Failed to inject script:", err);
      return false;
    }
  };

  const handleTranslate = async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        setStatusMessage("No active tab found");
        setIsLoading(false);
        return;
      }

      const tabId = tabs[0].id;
      const injected = await injectContentScript(tabId);

      if (!injected) {
        setStatusMessage("Cannot translate on this page type");
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 120));

      const response = await chrome.tabs.sendMessage(tabId, {
        action: "translatePage"
      });

      if (response.ok) {
        setStatusMessage("Translation complete!");
        setTimeout(() => setStatusMessage(""), 2000);
      } else {
        if (response.error && /rate limit|quota|429/i.test(response.error)) {
          setStatusMessage("Rate limit: Try after 1 minute");
        } else {
          setStatusMessage("Translation failed");
        }
      }

    } catch (err) {
      console.error("Translation error:", err);
      setStatusMessage("Travo can't run on this page");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) return;

      const tabId = tabs[0].id;
      const injected = await injectContentScript(tabId);
      if (!injected) return;

      await new Promise(resolve => setTimeout(resolve, 100));
      await chrome.tabs.sendMessage(tabId, { action: "resetTranslation" });

      setStatusMessage("Translations cleared");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    await setLanguage(newLang);
  };

  return (
    <div className="popup-container">
      {isLoading ? (
        <div className="loading-dots-wrapper">
          <span>Loading</span>
          <span className="dot yellow"></span>
          <span className="dot yellow"></span>
          <span className="dot yellow"></span>
        </div>
      ) : (
        <>
          <div className="header-section">
            <div className="logo-circle">
              <img src="/icon2.png" alt="Travo logo" className="logo-img" />
            </div>
            <div className="lingo-title">TRAVO</div>
          </div>

          <div className="controls-section">
            <label className="popup-label" htmlFor="language-select">
              Translate to
            </label>

            <div className="select-wrapper">
              <select
                id="language-select"
                value={selectedLang}
                onChange={handleLanguageChange}
                className="language-select"
                disabled={isLoading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {statusMessage && (
              <div
                className={`status-message ${
                  statusMessage.includes("fail") || statusMessage.includes("Rate") 
                    ? "error" 
                    : "success"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <div className="buttons-section">
              <button
                onClick={handleTranslate}
                className="btn translate-btn"
                disabled={isLoading}
              >
                Translate
              </button>

              <button
                onClick={handleReset}
                className="btn clear-btn"
                disabled={isLoading}
              >
                Clear translations
              </button>
            </div>
          </div>

          <div className="footer">
            <span className="footer-text">Powered by Lingo.Dev</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
