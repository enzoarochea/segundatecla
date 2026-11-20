"use client";

import { useEffect, useRef, useState } from "react";
import TechText from "@/components/react-bits/TechText";

const LINES = ["Revisadas.", "Una por una."];

/** Home headline drawn by TechText: one canvas per line, same size, shrunk to fit narrow screens. */
export function HeroTitle() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const h1 = ref.current;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!h1 || !ctx) return;
    const fit = () => {
      const cs = getComputedStyle(h1);
      ctx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
      const widest = Math.max(...LINES.map((l) => ctx.measureText(l).width));
      setSize(Math.min(parseFloat(cs.fontSize), (h1.clientWidth * 85) / widest));
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(h1);
    return () => ro.disconnect();
  }, []);

  return (
    <h1 ref={ref} className="wide text-hero">
      <span className="sr-only">{LINES.join(" ")}</span>
      <noscript>
        <span aria-hidden="true" className="block">{LINES.join(" ")}</span>
      </noscript>
      {LINES.map((line, i) => (
        <span
          key={line}
          aria-hidden="true"
          className="block h-[calc(var(--text-hero)*1.45)]"
          style={size ? { height: size * 1.45, marginTop: i ? size * -0.35 : 0 } : undefined}
        >
          {size > 0 && <TechText text={line} fontSize={size} />}
        </span>
      ))}
    </h1>
  );
}
