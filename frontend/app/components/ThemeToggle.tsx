"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

/**
 * Color palette for the theme toggle component.
 * Defines colors for both dark and light themes.
 */
const COLORS = {
  dark: {
    title: "#ffffff",
    description: "#a1a5ab",
    buttonBg: "#838383",
    toggleIndicator: "#ffffff",
  },
  light: {
    title: "#1f2937",
    description: "#2a2a2a",
    buttonBg: "#e5e7eb",
    toggleIndicator: "#1f2937",
  },
};

/**
 * ThemeToggle Component
 * 
 * Renders a theme switcher that allows users to toggle between dark and light modes.
 * Persists the selected theme to localStorage and applies it to the document root.
 * Also respects the system color scheme preference on first load.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  /**
   * Initialize theme from localStorage or system preference on component mount.
   * Sets the data-theme attribute on the document root and marks component as mounted.
   */
  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = saved ?? (prefersLight ? "light" : "dark");

    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
    setMounted(true);
  }, []);

  /**
   * Toggle between dark and light themes.
   * Saves the new theme to localStorage and updates the document root attribute.
   */
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  if (!mounted) {
    return null;
  }

  // Render the theme toggle UI with title, description, button, and current theme display
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div
            className="font-medium"
            style={{ color: COLORS[theme].title }}
          >
            Theme
          </div>
          <div
            className="text-sm"
            style={{ color: COLORS[theme].description }}
          >
            Switch between dark and light mode
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors"
          style={{
            backgroundColor: COLORS[theme].buttonBg,
            border: `2px solid ${COLORS[theme].buttonBg}`,
          }}
          aria-label="Toggle theme"
        >
          <span
            className="inline-block h-6 w-6 rounded-full transition-transform"
            style={{
              transform: theme === "dark" ? "translateX(2.25rem)" : "translateX(0.25rem)",
              backgroundColor: COLORS[theme].toggleIndicator,
            }}
          />
        </button>
      </div>

      <div
        className="text-sm"
        style={{ color: COLORS[theme].description }}
      >
        Current theme: <span className="font-semibold capitalize">{theme}</span>
      </div>
    </>
  );
}
