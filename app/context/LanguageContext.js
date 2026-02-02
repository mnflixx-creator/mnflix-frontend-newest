"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("mn");

  useEffect(() => {
    const saved = localStorage.getItem("mnflix_lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("mnflix_lang", code);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
