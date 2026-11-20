"use client";

import { useEffect, useState } from "react";
import ElectricLogo from "@/components/react-bits/ElectricLogo";
import mark from "@/assets/logo-mark.png";

/** Logo mark traced in lightning; follows the data-theme the toggle sets. */
export function BrandSpark() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  return <ElectricLogo src={mark.src} theme={theme} color="#ffe2c4" glowColor="#e07a2e" scale={0.75} />;
}
