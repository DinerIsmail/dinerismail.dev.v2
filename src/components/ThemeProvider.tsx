import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    
    if (stored === "light") {
      root.classList.remove("dark");
    } else {
      // Default to dark mode
      root.classList.add("dark");
    }
  }, []);

  return <>{children}</>;
}

