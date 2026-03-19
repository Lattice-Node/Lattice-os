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
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLang = localStorage.getItem("lang") as Lang;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLangState(savedLang);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
      <div data-theme={theme} style={{
        background: theme === "dark" ? "#020817" : "#ffffff",
        color: theme === "dark" ? "#e8e9ef" : "#0a0b0f",
        minHeight: "100vh",
        transition: "background 0.2s, color 0.2s",
      }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export const colors = {
  dark: {
    bg: "#020817",
    surface: "#0f1017",
    border: "#1e2030",
    text: "#e8e9ef",
    textMuted: "#6a7090",
    textDim: "#4a5068",
    accent: "#4d9fff",
    success: "#4caf50",
  },
  light: {
    bg: "#ffffff",
    surface: "#f5f7ff",
    border: "#e2e8f0",
    text: "#0a0b0f",
    textMuted: "#4a5568",
    textDim: "#718096",
    accent: "#2563eb",
    success: "#16a34a",
  },
};
