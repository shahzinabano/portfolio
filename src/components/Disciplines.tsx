"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { disciplines } from "@/data/site";
import { InkText } from "./InkText";
import styles from "./Disciplines.module.css";

export function Disciplines() {
  const [active, setActive] = useState(0);

  return (
    <section id="skills" className={`section ${styles.wrap}`}>
      <div className={styles.top}>
        <span className="mono muted">( What I do )</span>
        <span className="label muted">Design × Code × Growth</span>
      </div>
      <InkText as="h2" className={`display ${styles.title}`}>
        One person.
      </InkText>
      <InkText as="h2" className={`display ${styles.title} ${styles.indent}`} delay={160}>
        <span className="serif">Three</span> disciplines.
      </InkText>

      <div className={styles.panels}>
        {disciplines.map((d, i) => (
          <motion.article
            key={d.key}
            className={`${styles.panel} ${active === i ? styles.on : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            tabIndex={0}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className={styles.panelHead}>
              <span className="mono muted">{d.no}</span>
              <h3 className={`display ${styles.panelTitle}`}>{d.title}</h3>
            </header>

            <div className={styles.viz}>
              {d.key === "design" && <DesignViz />}
              {d.key === "develop" && <DevViz active={active === i} />}
              {d.key === "market" && <MarketViz />}
            </div>

            <div className={styles.panelFoot}>
              <p className={styles.line}>{d.line}</p>
              <ul className={styles.chips}>
                {d.skills.map((s, k) => (
                  <li key={s} style={{ transitionDelay: active === i ? `${0.15 + k * 0.04}s` : "0s" }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>

    </section>
  );
}

/* ---------- design: pen tool drawing a curve ---------- */
function DesignViz() {
  return (
    <svg viewBox="0 0 400 260" className={styles.svg} aria-hidden>
      <defs>
        <pattern id="dgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity=".08" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill="url(#dgrid)" />
      {/* selection frame */}
      <g className={styles.frame}>
        <rect x="60" y="40" width="280" height="180" fill="none" stroke="currentColor" strokeOpacity=".5" strokeDasharray="4 4" />
        {[
          [60, 40],
          [340, 40],
          [60, 220],
          [340, 220],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="var(--bg)" stroke="currentColor" />
        ))}
      </g>
      {/* the curve */}
      <path className={styles.curve} d="M70 200 C 120 40, 200 40, 210 130 S 300 230, 330 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* handles */}
      <g className={styles.handles} stroke="currentColor" strokeOpacity=".6">
        <line x1="120" y1="40" x2="210" y2="130" />
        <line x1="210" y1="130" x2="300" y2="230" />
        <circle cx="120" cy="40" r="4" fill="var(--bg)" />
        <circle cx="300" cy="230" r="4" fill="var(--bg)" />
        <rect x="205" y="125" width="10" height="10" fill="currentColor" />
        <rect x="65" y="195" width="10" height="10" fill="currentColor" />
        <rect x="325" y="55" width="10" height="10" fill="currentColor" />
      </g>
      {/* swatches */}
      <g className={styles.swatches}>
        {["#ecebe6", "#a9a8a3", "#5f5e5a", "#2a2a28"].map((c, i) => (
          <circle key={c} cx={30} cy={60 + i * 34} r="11" fill={c} stroke="currentColor" strokeOpacity=".3" />
        ))}
      </g>
      {/* pen cursor */}
      <g className={styles.pen}>
        <path d="M0 0 L14 5 L9 9 L5 14 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

/* ---------- develop: code that types itself ---------- */
const CODE = [
  [["k", "export default "], ["f", "function "], ["n", "Portfolio"], ["p", "() {"]],
  [["p", "  "], ["k", "return "], ["p", "("]],
  [["p", "    <"], ["n", "Site"]],
  [["p", "      "], ["a", "owner"], ["p", "="], ["s", '"Bano"']],
  [["p", "      "], ["a", "stack"], ["p", "={["], ["s", '"Next.js"'], ["p", ", "], ["s", '"React"'], ["p", ", "], ["s", '"TS"'], ["p", "]}"]],
  [["p", "      "], ["a", "responsive"]],
  [["p", "      "], ["a", "smooth"]],
  [["p", "    />"]],
  [["p", "  );"]],
  [["p", "}"]],
];
const LINE_LEN = CODE.map((l) => l.reduce((m, [, t]) => m + t.length, 0));
const LINE_START = LINE_LEN.map((_, i) => LINE_LEN.slice(0, i).reduce((a, b) => a + b + 1, 0));
const PART_START = CODE.map((l) => l.map((_, pi) => l.slice(0, pi).reduce((a, [, t]) => a + t.length, 0)));
const TOTAL = LINE_START[CODE.length - 1] + LINE_LEN[CODE.length - 1] + 1;

function DevViz({ active }: { active: boolean }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    let pause = 0;
    const id = setInterval(() => {
      if (!visible.current) return;
      setN((c) => {
        if (c >= TOTAL) {
          pause++;
          if (pause > 50) {
            pause = 0;
            return 0;
          }
          return c;
        }
        return c + (active ? 2 : 1);
      });
    }, 35);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [active]);

  return (
    <div ref={ref} className={styles.code} aria-hidden>
      <div className={styles.codeBar}>
        <i />
        <i />
        <i />
        <span className="mono">portfolio.tsx</span>
      </div>
      <pre>
        {CODE.map((line, li) => {
          const start = LINE_START[li];
          const len = LINE_LEN[li];
          const typing = n >= start && n < start + len + 1;
          return (
            <div key={li} className={styles.codeLine}>
              <span className={styles.ln}>{li + 1}</span>
              {line.map(([cls, t], pi) => (
                <span key={pi} className={styles[`c_${cls}`]}>
                  {t.slice(0, Math.max(0, n - start - PART_START[li][pi]))}
                </span>
              ))}
              {typing && <span className={styles.caret} />}
            </div>
          );
        })}
      </pre>
      <div className={`mono ${styles.term}`} style={{ opacity: n >= TOTAL ? 1 : 0 }}>
        ✓ Compiled successfully — ready on bano.dev
      </div>
    </div>
  );
}

/* ---------- market: a little live ads dashboard ---------- */
function MarketViz() {
  return (
    <div className={styles.dash} aria-hidden>
      <div className={styles.dashTop}>
        <span className="mono">Campaign — Live</span>
        <span className={styles.live} />
      </div>
      <svg viewBox="0 0 300 90" className={styles.spark}>
        <path className={styles.sparkArea} d="M0 80 C 40 75, 60 60, 90 62 S 140 40, 170 42 S 230 20, 300 8 L300 90 L0 90Z" />
        <path className={styles.sparkLine} d="M0 80 C 40 75, 60 60, 90 62 S 140 40, 170 42 S 230 20, 300 8" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <div className={styles.bars}>
        {[38, 52, 46, 64, 58, 76, 70, 88, 82, 96].map((h, i) => (
          <span key={i} style={{ ["--h" as string]: `${h}%`, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className={styles.kpis}>
        {[
          ["Reach", "Meta"],
          ["Clicks", "Google"],
          ["Leads", "Email"],
        ].map(([k, src]) => (
          <div key={k}>
            <span className="mono muted">{src}</span>
            <strong>
              {k} <em>↑</em>
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
