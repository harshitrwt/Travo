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
      <div className="logo-circle">
        {/* Use an SVG/component for real logo; placeholder shape here */}
        <span role="img" aria-label="Red panda"
          style={{ fontSize: 54 }}>🦊</span>
      </div>
      <div className="lingo-title">LINGO</div>
      <label className="popup-label" htmlFor="language-select">Select language</label>
      <div className="select-wrapper">
        <select
          id="language-select"
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
      <button onClick={handleTranslate} className="btn translate-btn">
        Translate
      </button>
      <button onClick={handleReset} className="btn clear-btn">
        Clear translations
      </button>
    </div>
  );
};

export default Popup;
