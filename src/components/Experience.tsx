"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { experience } from "@/data/site";
import { InkText } from "./InkText";
import styles from "./Experience.module.css";

export function Experience() {
  const [open, setOpen] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.8", "end 0.6"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className={`section ${styles.wrap}`}>
      <div className={styles.top}>
        <span className="mono muted">( Career log )</span>
        <span className="label muted">2021 — Now</span>
      </div>
      <div className={styles.head}>
        <InkText as="h2" className={`display ${styles.title}`}>
          Experience
        </InkText>
        <p className={styles.intro}>
          Seven roles across five countries — from a startup incubator to leading design teams for clients in the UK and
          Australia.
        </p>
      </div>

      <ol ref={list} className={styles.list}>
        <motion.span className={styles.rail} style={{ scaleY: line }} aria-hidden />
        {experience.map((e, i) => {
          const isOpen = open === i;
          return (
            <motion.li
              key={e.company + e.role}
              className={`${styles.item} ${isOpen ? styles.open : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={styles.node} aria-hidden />
              <button className={styles.row} onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} data-cursor={isOpen ? "Close" : "Read"}>
                <span className={`mono muted ${styles.when}`}>{e.when}</span>
                <span className={styles.role}>
                  {e.role}
                  {e.badge && <span className={`mono ${styles.badge}`}>↑ {e.badge}</span>}
                </span>
                <span className={styles.company}>
                  {e.company}
                  <span className="muted"> — {e.where}</span>
                </span>
                <span className={styles.plus} aria-hidden>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className={styles.body}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={styles.bodyInner}>
                      <p>{e.text}</p>
                      <ul className={styles.tags}>
                        {e.tags.map((t) => (
                          <li key={t} className="mono">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
