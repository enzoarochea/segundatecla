"use client";

import { useEffect, useState } from "react";
import Antigravity from "@/components/react-bits/Antigravity";

/** Full-screen particle field behind the page; lightMode follows the data-theme the toggle sets. */
export function SiteBackground() {
  const [light, setLight] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setLight(root.dataset.theme !== "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // Hex, not brand tokens: the WebGL colour parser reads only hex/rgb. Accent, a deeper and a lighter orange.
  return <Antigravity colors={["#e07a2e", "#b4541a", "#ffd2a6"]} lightMode={light} />;
}
