"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { about, aboutImage, disciplines, tools } from "@/data/site";
import { InkText } from "./InkText";
import styles from "./About.module.css";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={styles.word}>
      {children}{" "}
    </motion.span>
  );
}

export function About() {
  const statementRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: statementRef, offset: ["start 0.85", "end 0.45"] });
  const words = about.statement.split(" ");

  // tilt card
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 18);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18);
  };

  return (
    <section id="about" className={`section ${styles.wrap}`}>
      <div className={styles.top}>
        <span className="mono muted">( About me )</span>
        <InkText as="h2" className={`display ${styles.title}`}>
          About <span className="serif">me</span>
        </InkText>
      </div>

      <div className={styles.grid}>
        <motion.div className={styles.cardCol} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <motion.div
            className={styles.card}
            style={{ rotateX: srx, rotateY: sry }}
            onMouseMove={onMove}
            onMouseLeave={() => (rx.set(0), ry.set(0))}
            variants={{ hidden: { clipPath: "inset(100% 0% 0% 0% round 14px)" }, show: { clipPath: "inset(0% 0% 0% 0% round 14px)" } }}
            transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <img src={aboutImage.src} alt="Portrait of Bano" width={aboutImage.w} height={aboutImage.h} loading="lazy" />
            <div className={styles.cardMeta}>
              <span className="mono">Bano</span>
              <span className="mono">Design · Dev · Ads</span>
            </div>
          </motion.div>
        </motion.div>

        <div>
          <p ref={statementRef} className={styles.statement}>
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 3) / words.length)]}>
                {w}
              </Word>
            ))}
          </p>

          <div className={styles.stats}>
            {about.stats.map((s, i) => (
              <motion.div
                key={s.label}
                className={styles.stat}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`display ${styles.statValue}`}>
                  {s.value}
                  {s.suffix && <span className={`serif ${styles.suffix}`}>{s.suffix}</span>}
                </span>
                <span className="label muted">{s.label}</span>
              </motion.div>
            ))}
          </div>

          <div className={styles.skills}>
            {[...disciplines.map((d) => ({ title: d.title, items: d.skills as readonly string[] })), { title: "Tools", items: tools }].map((g, gi) => (
              <motion.div
                key={g.title}
                className={styles.skillRow}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
              >
                <h3 className={`mono muted ${styles.skillTitle}`}>
                  <span>{String(gi + 1).padStart(2, "0")}</span> {g.title}
                </h3>
                <ul className={styles.pills}>
                  {g.items.map((s, i) => (
                    <motion.li
                      key={s}
                      variants={{
                        hidden: { opacity: 0, y: 16, scale: 0.9 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] } },
                      }}
                    >
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className={styles.lists}>
            <div>
              <h3 className={`mono muted ${styles.listTitle}`}>Education</h3>
              <ul className={styles.list}>
                {about.education.map((e, i) => (
                  <motion.li
                    key={e.title}
                    className={styles.edu}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span>{e.title}</span>
                    <span className="muted">
                      {e.place} · {e.note}
                    </span>
                    <span className="mono muted">{e.when}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`mono muted ${styles.listTitle}`}>Languages</h3>
              <ul className={styles.list}>
                {about.languages.map((l) => (
                  <li key={l.name} className={styles.lang}>
                    <span>{l.name}</span>
                    <span className="mono muted">{l.level}</span>
                    <span className={styles.meter}>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: l.value }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
