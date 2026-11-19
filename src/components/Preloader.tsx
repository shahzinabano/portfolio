"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 200 : 1700;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setN(Math.round((1 - Math.pow(1 - p, 2.4)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        setTimeout(onDone, 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  if (gone) return null;
  return (
    <motion.div
      onAnimationComplete={() => leaving && setGone(true)}
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={leaving ? { clipPath: "inset(0% 0% 100% 0%)" } : undefined}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0b0b0b",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px var(--gutter)",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div className="mono muted" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Bano — Portfolio</span>
        <span>Loading the good stuff</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span className="display" style={{ fontSize: "clamp(80px, 18vw, 280px)", fontVariantNumeric: "tabular-nums" }}>
          {n}
        </span>
        <span className="serif" style={{ fontSize: "clamp(22px, 3vw, 44px)", paddingBottom: "1.2vw" }}>
          hi, i am bano
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${n}%`, background: "var(--fg)" }} />
    </motion.div>
  );
}
