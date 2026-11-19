"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { work, type WorkItem } from "@/data/site";
import { InkText } from "./InkText";
import { Portal } from "./Portal";
import { useLenis } from "./SmoothScroll";
import styles from "./WorkSphere.module.css";

const COUNT = 30;

/** evenly distributed points on a sphere */
function fibonacci(n: number) {
  const pts: [number, number, number][] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = g * i;
    pts.push([Math.cos(th) * r, y * 0.82, Math.sin(th) * r]);
  }
  return pts;
}

export function WorkSphere() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<WorkItem | null>(null);
  const lenis = useLenis();

  // repeat the thumbnails to fill the sphere
  const cards = useMemo(() => Array.from({ length: COUNT }, (_, i) => work[i % Math.max(work.length, 1)]).filter(Boolean), []);
  const points = useMemo(() => fibonacci(cards.length), [cards.length]);

  const state = useRef({ rx: -0.25, ry: 0, vx: 0, vy: 0.0025, drag: false, lx: 0, ly: 0, moved: 0, scroll: 0 });

  useEffect(() => {
    const stage = stageRef.current!;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(stage);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const s = state.current;
      if (!s.drag) {
        s.vy += (0.0022 - s.vy) * 0.02 + s.scroll * 0.00004;
        s.vx += (0 - s.vx) * 0.04;
        s.rx += (-0.22 - s.rx) * 0.01;
      }
      s.scroll *= 0.9;
      s.ry += s.vy;
      s.rx = Math.max(-1.1, Math.min(1.1, s.rx + s.vx));

      const W = stage.clientWidth, H = stage.clientHeight;
      const R = Math.min(W * 0.42, H * 0.46, 520);
      const cw = Math.max(48, Math.min(118, R * 0.22));
      const cy = Math.cos(s.ry), sy = Math.sin(s.ry), cx = Math.cos(s.rx), sx = Math.sin(s.rx);

      for (let i = 0; i < points.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const [px, py, pz] = points[i];
        // rotate around Y then X
        const x1 = px * cy + pz * sy;
        const z1 = -px * sy + pz * cy;
        const y2 = py * cx - z1 * sx;
        const z2 = py * sx + z1 * cx;
        const persp = 1.9 / (1.9 - z2);
        const depth = (z2 + 1) / 2; // 0 back → 1 front
        el.style.width = `${cw}px`;
        el.style.transform = `translate3d(${x1 * R * persp - cw / 2}px, ${y2 * R * persp}px, 0) translateY(-50%) scale(${persp * 0.72}) rotateY(${-x1 * 32}deg) rotateX(${y2 * 22}deg)`;
        el.style.opacity = String(0.12 + depth * 0.88);
        el.style.filter = depth < 0.45 ? `blur(${(0.45 - depth) * 5}px) grayscale(0.6)` : "none";
        el.style.zIndex = String(z2 > 0 ? 100 + Math.round(depth * 100) : Math.round(depth * 40));
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [points]);

  // scroll momentum gives the sphere a nudge
  useEffect(() => {
    if (!lenis) return;
    const f = (l: { velocity: number }) => (state.current.scroll += l.velocity);
    lenis.on("scroll", f);
    return () => lenis.off("scroll", f);
  }, [lenis]);

  const onDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.drag = true;
    s.lx = e.clientX;
    s.ly = e.clientY;
    s.moved = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.drag) return;
    const dx = e.clientX - s.lx, dy = e.clientY - s.ly;
    s.lx = e.clientX;
    s.ly = e.clientY;
    s.moved += Math.abs(dx) + Math.abs(dy);
    s.vy = dx * 0.0045;
    s.vx = -dy * 0.003;
  };
  const onUp = (e: React.PointerEvent) => {
    const s = state.current;
    s.drag = false;
    if (s.moved < 6) {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-card]") as HTMLElement | null;
      if (el) setActive(Number(el.dataset.card));
    }
  };

  return (
    <section id="work" className={`section ${styles.wrap}`}>
      <div className={`label ${styles.years}`}>
        <span className="mono muted">Recent Work</span>
        <span className={styles.yearsBig}>24—26</span>
      </div>

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (state.current.drag = false)}
        data-cursor="Drag"
      >
        <InkText as="h2" className={`display ${styles.title}`}>
          Work
        </InkText>
        <div className={styles.origin}>
          {cards.map((c, i) => (
            <button
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-card={i}
              className={styles.card}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              aria-label={`Open ${c.title}`}
              onKeyDown={(e) => e.key === "Enter" && setActive(i)}
            >
              <img src={c.src} alt="" width={c.w} height={c.h} loading="lazy" decoding="async" draggable={false} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <span className="label muted">
          Drag to spin
          <br />
          Click to open
        </span>
        <AnimatePresence mode="wait">
          {hover && (
            <motion.span
              key={hover.title}
              className={`label ${styles.hoverTitle}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {hover.title}
              <br />
              <span className="muted">{hover.tag}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Lightbox index={active} items={cards} onClose={() => setActive(null)} onIndex={setActive} />
    </section>
  );
}

function Lightbox({
  index,
  items,
  onClose,
  onIndex,
}: {
  index: number | null;
  items: WorkItem[];
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const lenis = useLenis();
  const uniq = useMemo(() => Array.from(new Set(items.map((i) => i.src))).map((s) => items.find((i) => i.src === s)!), [items]);
  const cur = index === null ? null : uniq.findIndex((u) => u.src === items[index].src);
  const step = useCallback(
    (d: number) => {
      if (cur === null) return;
      const n = (cur + d + uniq.length) % uniq.length;
      onIndex(items.findIndex((i) => i.src === uniq[n].src));
    },
    [cur, uniq, items, onIndex],
  );

  useEffect(() => {
    if (index === null) return;
    lenis?.stop();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      lenis?.start();
    };
  }, [index, lenis, onClose, step]);

  const item = cur === null ? null : uniq[cur];

  return (
    <Portal>
    <AnimatePresence>
      {item && (
        <motion.div
          className={styles.lightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <div className={styles.lbTop}>
            <span className="mono muted">
              {String(cur! + 1).padStart(2, "0")} / {String(uniq.length).padStart(2, "0")}
            </span>
            <button className="pill" onClick={onClose}>
              Close
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.figure
              key={item.src}
              className={styles.lbFig}
              initial={{ opacity: 0, scale: 0.94, clipPath: "inset(12% 12% 12% 12% round 24px)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={item.src} alt={item.title} width={item.w} height={item.h} />
            </motion.figure>
          </AnimatePresence>
          <div className={styles.lbBottom} onClick={(e) => e.stopPropagation()}>
            <button className="pill ghost" onClick={() => step(-1)} aria-label="Previous">
              ←
            </button>
            <div className={styles.lbCaption}>
              <span className={styles.lbTitle}>{item.title}</span>
              <span className="mono muted">{item.tag}</span>
            </div>
            <button className="pill ghost" onClick={() => step(1)} aria-label="Next">
              →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
