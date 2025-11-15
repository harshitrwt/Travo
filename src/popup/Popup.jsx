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
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

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
    setShowLoadingIcon(true);
    setStatusMessage("");
    
    // Show loading icon for 800ms for smooth transition
    setTimeout(() => setShowLoadingIcon(false), 800);
    
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        setStatusMessage("No active tab found");
        setIsLoading(false);
        return;
      }

      const tabId = tabs[0].id;
      
      // Try to inject the content script first
      const injected = await injectContentScript(tabId);
      
      if (!injected) {
        setStatusMessage("Cannot translate on this page type");
        setIsLoading(false);
        return;
      }

      // Small delay to ensure script is injected
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await chrome.tabs.sendMessage(tabId, {
        action: "translatePage"
      });

      if (response.ok) {
        setStatusMessage("Translation complete!");
        setTimeout(() => setStatusMessage(""), 2000);
      } else {
        // Check for rate limit error
        if (response.error && /rate limit|quota|429/i.test(response.error)) {
          setStatusMessage("Rate limit: Please wait 1 minute before trying again");
        } else {
          setStatusMessage(`Translation failed: ${response.error || 'Unknown error'}`);
        }
      }

      console.log("Response:", response);
    } catch (err) {
      console.error("Translation error:", err);
      setStatusMessage("Error: Travo can't run on this page");
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
      {showLoadingIcon ? (
        <div className="loading-state">
          <div className="loading-icon-wrapper">
            <img
              src="/icon1.png"
              alt="Travo loading"
              className="loading-icon"
            />
          </div>
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      ) : (
        <>
          <div className="header-section">
            <div className="logo-circle">
              <img
                src="/icon2.png"
                alt="Travo logo"
                className="logo-img"
              />
            </div>
            <div className="lingo-title">TRAVO</div>
            <div className="subtitle">Professional Translation</div>
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
              <div className={`status-message ${statusMessage.includes('failed') || statusMessage.includes('Rate limit') || statusMessage.includes('Error') ? 'error' : 'success'}`}>
                {statusMessage}
              </div>
            )}

            <div className="buttons-section">
              <button 
                onClick={handleTranslate} 
                className="btn translate-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-loading-dots">
                      <span></span><span></span><span></span>
                    </span>
                  </>
                ) : (
                  "Translate"
                )}
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
        </>
      )}
    </div>
  );
};

export default Popup;
