"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "./i18n";

type Theme = "dark" | "light";

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const AppContext = createContext<AppContextType>({
  theme: "dark",
  toggleTheme: () => {},
  lang: "ja",
  setLang: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("ja");

  useEffect(() => {
    const saved = localStorage.getItem("lattice_theme") as Theme;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    const savedLang = localStorage.getItem("lang") as Lang;
    if (savedLang) setLangState(savedLang);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lattice_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
