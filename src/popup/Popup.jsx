import React, { useState, useEffect } from "react";
import "./Popup.css";
import { getLanguage, setLanguage } from "../utils/storage";

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

  useEffect(() => {
    getLanguage().then((lang) => {
      if (lang) setSelectedLang(lang);
    });
  }, []);

  const handleTranslate = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "translatePage" });
    });
  };

  const handleReset = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "resetTranslation" });
    });
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    await setLanguage(newLang);
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1 className="popup-title">Travo</h1>
        <p className="popup-subtitle">Translate the web on the GO!</p>
      </div>

      <div className="popup-content">
        <label className="popup-label">Select language</label>
        <div className="select-wrapper">
          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            className="language-select"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="popup-buttons">
          <button onClick={handleTranslate} className="btn translate-btn">
            Translate
          </button>
          <button onClick={handleReset} className="btn reset-btn">
            Reset
          </button>
        </div>
      </div>

      <footer className="popup-footer">
        <p>✨ Powered by LingoDEV</p>
      </footer>
    </div>
  );
};

export default Popup;
