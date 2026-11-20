"use client";

import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useState } from "react";

/** small contextual bubble ("Drag", "Open") that trails the cursor over [data-cursor] zones */
export function CursorLabel() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let lx = -1, ly = -1;
    const resolve = () => {
      if (lx < 0) return;
      const el = document.elementFromPoint(lx, ly)?.closest("[data-cursor]") as HTMLElement | null;
      setLabel(el ? el.dataset.cursor ?? null : null);
    };
    const move = (e: PointerEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      x.set(lx);
      y.set(ly);
      resolve();
    };
    const leave = () => setLabel(null);
    // the element under a still cursor changes while scrolling or when overlays open
    const id = setInterval(resolve, 250);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", resolve, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      clearInterval(id);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", resolve);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      style={{ x: sx, y: sy, position: "fixed", left: 0, top: 0, zIndex: 95, pointerEvents: "none" }}
      aria-hidden
    >
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pill"
            style={{ position: "absolute", left: 16, top: 16, height: 26, fontSize: 11, padding: "0 11px", whiteSpace: "nowrap" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** services ticker that speeds up & skews with scroll velocity */
export function Marquee() {
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { stiffness: 80, damping: 30 });
  const skew = useTransform(vel, [-3000, 3000], [-6, 6]);
  const base = ["Graphic Design", "Web Development", "Meta Ads", "UI/UX", "Next.js", "Branding", "Google Ads", "Email Campaigns", "Motion Graphics", "WordPress"];
  const items = [...base, ...base];
  return (
    <div style={{ position: "relative", zIndex: 1, overflow: "hidden", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "18px 0" }}>
      <motion.div style={{ skewX: skew }}>
      <div style={{ display: "flex", width: "max-content", animation: "marquee 38s linear infinite" }}>
        {[0, 1].map((k) => (
          <div key={k} style={{ display: "flex" }} aria-hidden={k === 1}>
            {items.map((s, i) => (
              <span key={i} className="display" style={{ fontSize: "clamp(28px, 3.6vw, 56px)", padding: "0 0.5em", display: "inline-flex", alignItems: "center", gap: "1em", lineHeight: 1 }}>
                {s}
                <span className="serif muted" style={{ fontSize: "0.8em" }}>✺</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      </motion.div>
      <style>{`@keyframes marquee { to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/** the giant ghost name fixed behind the page, like a watermark */
export function Watermark() {
  return (
    <div
      aria-hidden
      className="display watermark"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "-0.12em",
        zIndex: 0,
        display: "flex",
        justifyContent: "space-between",
        padding: "0 var(--gutter)",
        fontSize: "clamp(48px, 6.4vw, 110px)",
        color: "var(--ghost)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span>hi, i am</span>
      <span>bano</span>
    </div>
  );
}

/** thin neon progress line across the top, replacing the native scrollbar */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        height: 2,
        zIndex: 96,
        background: "#6ee17a",
        boxShadow: "0 0 8px #6ee17a, 0 0 18px rgba(110, 225, 122, 0.55)",
        pointerEvents: "none",
      }}
    />
  );
}
