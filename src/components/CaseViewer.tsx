"use client";

import Lenis from "lenis";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { caseStudies, type CaseStudy } from "@/data/site";
import { InkText } from "./InkText";
import { Portal } from "./Portal";
import { useLenis } from "./SmoothScroll";
import styles from "./CaseViewer.module.css";

type Props = {
  study: CaseStudy | null;
  origin: { x: number; y: number };
  onClose: () => void;
  onNavigate: (c: CaseStudy) => void;
};

const ease = [0.76, 0, 0.24, 1] as const;

export function CaseViewer({ study, origin, onClose, onNavigate }: Props) {
  const globalLenis = useLenis();

  useEffect(() => {
    if (!study) return;
    globalLenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      document.documentElement.style.overflow = "";
      globalLenis?.start();
    };
  }, [study, globalLenis, onClose]);

  return (
    <Portal>
    <AnimatePresence>
      {study && (
        <motion.div
          key="viewer"
          className={styles.overlay}
          initial={{ clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }}
          animate={{ clipPath: `circle(150% at ${origin.x}% ${origin.y}%)` }}
          exit={{ clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` }}
          transition={{ duration: 1.05, ease }}
          role="dialog"
          aria-modal="true"
          aria-label={`${study.title} case study`}
        >
          <Story key={study.slug} study={study} onClose={onClose} onNavigate={onNavigate} />
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}

function Story({ study, onClose, onNavigate }: { study: CaseStudy; onClose: () => void; onNavigate: (c: CaseStudy) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: wrap });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const [page, setPage] = useState(0);

  const idx = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(idx + 1) % caseStudies.length];
  const hasPages = study.pages.length > 0;
  // tall pages are slices of one long page – count them as a single "story"
  const isSliced = study.pages.some((p) => p.slice);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ wrapper: wrap.current!, content: content.current!, lerp: 0.09 });
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    const root = wrap.current!;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPage(Number((e.target as HTMLElement).dataset.page))),
      { root, rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.barLeft}>
          <span className={styles.barTitle}>{study.title}</span>
          <span className="mono muted">{study.deliverable}</span>
        </div>
        {hasPages && !isSliced && (
          <span className={`mono ${styles.counter}`}>
            {String(page + 1).padStart(2, "0")} <span className="muted">/ {String(study.pages.length).padStart(2, "0")}</span>
          </span>
        )}
        <button className="pill" onClick={onClose}>
          <span className="roll">
            <span data-text="Close ✕">Close ✕</span>
          </span>
        </button>
        <motion.div className={styles.progress} style={{ scaleX: progress }} />
      </div>

      <div ref={wrap} className={styles.scroller}>
        <div ref={content}>
          {/* cover */}
          <header className={styles.cover}>
            <motion.div
              className={`mono muted ${styles.coverTop}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <span>Case Study — {String(idx + 1).padStart(2, "0")}</span>
              <span>{study.year}</span>
            </motion.div>
            <InkText as="h1" className={`display ${styles.coverTitle}`} delay={550} duration={1700} play>
              {study.title}
            </InkText>
            <div className={styles.coverBottom}>
              <motion.p
                className={styles.summary}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {study.summary}
              </motion.p>
              <motion.dl
                className={styles.meta}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {[
                  ["Client", study.client],
                  ["Industry", study.industry],
                  ["Deliverable", study.deliverable],
                  ["Year", study.year],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="mono muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>
            <span className={`mono muted ${styles.scrollHint}`}>Scroll to explore ↓</span>
          </header>

          {/* the case study itself */}
          {hasPages ? (
            <div className={`${styles.pages} ${isSliced ? styles.sliced : ""}`}>
              {study.pages.map((p, i) => (
                <Page key={p.src} src={p.src} w={p.w} h={p.h} i={i} root={wrap} seamless={isSliced} title={study.title} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <InkText as="h2" className={`display ${styles.emptyTitle}`}>
                Landing <span className="serif">soon.</span>
              </InkText>
              <p className="muted">This case study is being polished. Check back shortly — or ask me for a walkthrough.</p>
            </div>
          )}

          {/* next */}
          <button className={styles.next} onClick={() => (wrap.current?.scrollTo({ top: 0 }), onNavigate(next))}>
            <span className="mono muted">Next case study</span>
            <span className={`display ${styles.nextTitle}`}>
              {next.title} <span className={styles.nextArrow}>→</span>
            </span>
            {next.thumb && (
              <span className={styles.nextThumb}>
                <img src={next.thumb} alt="" loading="lazy" />
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

function Page({
  src,
  w,
  h,
  i,
  root,
  seamless,
  title,
}: {
  src: string;
  w: number;
  h: number;
  i: number;
  root: React.RefObject<HTMLDivElement | null>;
  seamless: boolean;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.figure
      data-page={i}
      className={styles.page}
      initial={seamless ? { opacity: 0 } : { opacity: 0, y: 70, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ root, once: true, amount: 0.08 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={src}
        width={w}
        height={h}
        alt={`${title} — ${i + 1}`}
        loading={i < 2 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={loaded ? styles.loaded : undefined}
        draggable={false}
      />
    </motion.figure>
  );
}
