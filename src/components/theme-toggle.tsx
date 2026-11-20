"use client";

import { useEffect, useState } from "react";

/** Light/dark switch. The pre-paint script in layout.tsx sets data-theme first. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);

  function toggle() {
    const next = !dark;
    const apply = () => {
      document.documentElement.dataset.theme = next ? "dark" : "light";
      setDark(next);
    };
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(apply);
    else apply();
  }

  return (
    <button type="button" onClick={toggle} className="theme-toggle" aria-label="Modo oscuro" aria-pressed={dark}>
      <span className="theme-toggle-knob" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="theme-sun">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
        <svg viewBox="0 0 24 24" className="theme-moon">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      </span>
    </button>
  );
}
