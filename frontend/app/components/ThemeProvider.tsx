"use client";

import { useEffect } from "react";

/**
 * ThemeProvider Component
 * 
 * Initializes and applies the saved theme from localStorage on every page load.
 * Should be included in the root layout to ensure consistent theme across all pages.
 */
export default function ThemeProvider() {
  useEffect(() => {
    // Read theme from localStorage or fall back to system preference
    const saved = localStorage.getItem("theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = saved ?? (prefersLight ? "light" : "dark");

    // Apply theme to document root
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return null;
}
