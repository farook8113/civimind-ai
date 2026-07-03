"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Load language and auth token from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("civimind_lang");
    if (savedLang) {
      setLang(savedLang);
    }
    
    const savedToken = localStorage.getItem("civimind_token");
    const savedUser = localStorage.getItem("civimind_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user profile from localStorage:", err);
        localStorage.removeItem("civimind_token");
        localStorage.removeItem("civimind_user");
      }
    }
    setLoading(false);
  }, []);

  // Update DOM language direction when lang changes
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("civimind_lang", lang);
  }, [lang]);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("civimind_token", userToken);
    localStorage.setItem("civimind_user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("civimind_token");
    localStorage.removeItem("civimind_user");
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const value = {
    lang,
    setLang,
    user,
    setUser,
    token,
    loading,
    loginUser,
    logoutUser,
    toggleLanguage,
    dir: lang === "ar" ? "rtl" : "ltr"
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
