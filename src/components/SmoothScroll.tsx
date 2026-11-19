"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState } from "react";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4, anchors: true });
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- expose the instance once created
    setLenis(l);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

/** Scroll to a section id, smooth when Lenis is available. */
export function useScrollTo() {
  const lenis = useLenis();
  return (target: string) => {
    const el = target === "#top" ? 0 : (document.querySelector(target) as HTMLElement | null);
    if (el === null) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (el === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth" });
  };
}
