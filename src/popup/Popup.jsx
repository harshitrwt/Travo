import React, { useState, useEffect } from "react";
import "./Popup.css";
import { getLanguage, setLanguage } from "../utils/storage";

const languages = [
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "jp", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" }
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
      <h1 className="popup-title">🌊 Travo </h1>
      <p className="popup-subtitle">Surf any site in your language</p>

      <div className="popup-controls">
        <label>Select Language</label>
        <select value={selectedLang} onChange={handleLanguageChange}>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <div className="popup-buttons">
          <button onClick={handleTranslate}>Translate Page</button>
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
