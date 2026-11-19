"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { caseStudies, type CaseStudy } from "@/data/site";
import { CaseViewer } from "./CaseViewer";
import { InkText } from "./InkText";
import styles from "./CaseStudies.module.css";

export function CaseStudies() {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<CaseStudy | null>(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 });
  const rot = useSpring(0, { stiffness: 120, damping: 14 });

  // deep link: #case/<slug>
  useEffect(() => {
    const sync = () => {
      const m = location.hash.match(/^#case\/(.+)$/);
      setOpen(m ? caseStudies.find((c) => c.slug === m[1]) ?? null : null);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const openCase = (c: CaseStudy, e: React.MouseEvent) => {
    setOrigin({ x: (e.clientX / innerWidth) * 100, y: (e.clientY / innerHeight) * 100 });
    history.pushState(null, "", `#case/${c.slug}`);
    setOpen(c);
  };
  const close = () => {
    if (location.hash.startsWith("#case/")) history.pushState(null, "", location.pathname + location.search);
    setOpen(null);
  };

  const lastX = useRef(0);
  const onMove = (e: React.MouseEvent) => {
    mx.set(e.clientX);
    my.set(e.clientY);
    rot.set(Math.max(-10, Math.min(10, (e.clientX - lastX.current) * 0.6)));
    lastX.current = e.clientX;
  };

  const hovered = hover === null ? null : caseStudies[hover];

  return (
    <section id="cases" className={`section ${styles.wrap}`}>
      <div className={styles.heading}>
        <InkText as="h2" className={`display ${styles.h1}`}>
          Selected
        </InkText>
        <InkText as="h2" className={`display ${styles.h2}`} delay={180}>
          <span className="serif">&amp;</span> Case Studies
        </InkText>
      </div>

      <div className={styles.table} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <div className={`mono muted ${styles.row} ${styles.head}`}>
          <span>No.</span>
          <span>Project</span>
          <span className={styles.hideSm}>Industry</span>
          <span>Deliverable</span>
          <span className={styles.year}>Year</span>
        </div>
        {caseStudies.map((c, i) => (
          <motion.button
            key={c.slug}
            className={`${styles.row} ${styles.item} ${hover === i ? styles.active : ""}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={(e) => openCase(c, e)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            data-cursor="Open"
          >
            <span className={`mono ${styles.no}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.project}>
              {c.title}
              {c.pages.length === 0 && <span className={`mono ${styles.soon}`}>Soon</span>}
            </span>
            <span className={`${styles.hideSm} ${styles.dim}`}>{c.industry}</span>
            <span>{c.deliverable}</span>
            <span className={styles.year}>
              <span className={styles.arrow}>↗</span>
              {c.year}
            </span>
          </motion.button>
        ))}
      </div>

      {/* floating preview following the cursor */}
      <motion.div className={styles.preview} style={{ x, y, rotate: rot }} aria-hidden>
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.slug}
              className={styles.previewInner}
              initial={{ clipPath: "inset(50% 50% 50% 50% round 12px)", scale: 1.15 }}
              animate={{ clipPath: "inset(0% 0% 0% 0% round 6px)", scale: 1 }}
              exit={{ clipPath: "inset(50% 50% 50% 50% round 12px)", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {hovered.thumb ? (
                <img src={hovered.thumb} alt="" />
              ) : (
                <div className={styles.placeholder} style={{ background: hovered.accent }}>
                  <span className="display">{hovered.title}</span>
                  <span className="mono">Coming soon</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <CaseViewer study={open} origin={origin} onClose={close} onNavigate={(c) => (history.replaceState(null, "", `#case/${c.slug}`), setOpen(c))} />
    </section>
  );
}
