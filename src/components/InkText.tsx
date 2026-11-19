"use client";
/* eslint-disable react-hooks/set-state-in-effect -- phase is driven by external signals (IO / play prop) */

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "div" | "span" | "p";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  /** start immediately instead of waiting for the element to scroll into view */
  play?: boolean;
  once?: boolean;
};

/**
 * Liquid-ink reveal: the text starts as blurred, displaced blobs and
 * resolves into crisp type. An SVG filter (turbulence → displacement →
 * blur → alpha threshold) is animated, then removed once settled.
 */
export function InkText({ children, as = "div", className, style, delay = 0, duration = 1500, play, once = true }: Props) {
  const raw = useId();
  const id = `ink${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<HTMLElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    if (play !== undefined) {
      if (play) setPhase("run");
      else if (!once) setPhase("idle");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPhase("run");
          if (once) io.disconnect();
        } else if (!once) setPhase("idle");
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play, once]);

  useEffect(() => {
    if (phase !== "run") return;
    let raf = 0;
    let start = 0;
    const seed = Math.random() * 100;
    const tick = (t: number) => {
      if (!start) start = t + delay;
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      const e = 1 - Math.pow(1 - p, 3);
      const inv = 1 - e;
      blur.current?.setAttribute("stdDeviation", String(0.01 + 16 * inv * inv));
      disp.current?.setAttribute("scale", String(90 * inv));
      turb.current?.setAttribute("baseFrequency", `${0.006 + 0.01 * inv} ${0.012 + 0.02 * inv}`);
      turb.current?.setAttribute("seed", String(Math.round(seed)));
      if (ref.current) ref.current.style.opacity = String(Math.min(1, p * 4));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setPhase("done");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, delay, duration]);

  const Tag = as as React.ElementType;
  return (
    <>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <filter id={id} x="-25%" y="-40%" width="150%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.016 0.032" numOctaves="2" result="noise" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur ref={blur} in="d" stdDeviation="16" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
      </svg>
      <Tag
        ref={ref}
        className={className}
        style={{
          ...style,
          opacity: phase === "idle" ? 0 : undefined,
          filter: phase === "run" ? `url(#${id})` : undefined,
          willChange: phase === "run" ? "filter" : undefined,
        }}
      >
        {children}
      </Tag>
    </>
  );
}
