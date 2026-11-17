import { useEffect } from "react";
import { useTheme } from "../lib/theme.jsx";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Ensure DOM reflects current theme (in case button renders before provider effect)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-md flex items-center justify-center hover:scale-105 transition-transform duration-200"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon
        <svg className="w-5 h-5 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
