"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { heroImage, site } from "@/data/site";
import { InkReveal } from "./InkReveal";
import { InkText } from "./InkText";
import styles from "./Hero.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const fadeUp = (d: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease, delay: d },
  });

  return (
    <section ref={ref} id="top" className={styles.hero}>
      <motion.div className={styles.stage} style={{ scale, opacity: fade }}>
        <InkReveal src={heroImage.src} imgW={heroImage.w} imgH={heroImage.h} className={styles.canvas} />
      </motion.div>

      <motion.div className={styles.grid} style={{ y }}>
        <div className={styles.left}>
          <motion.p className={`mono muted ${styles.hint}`} {...fadeUp(1.1)}>
            <span className={styles.fine}>( Move your cursor — find me )</span>
            <span className={styles.coarse}>( Touch &amp; drag — find me )</span>
          </motion.p>
          <InkText as="h1" className={`display ${styles.name}`} play={ready} duration={1700}>
            Hi, I am Bano
          </InkText>
        </div>

        <aside className={styles.right}>
          <motion.div className="label" {...fadeUp(0.6)}>
            {site.role}
            <br />
            <span className="muted">{site.location}</span>
          </motion.div>

          <div className={styles.rightBottom}>
            <motion.div className="label" {...fadeUp(0.9)}>
              Design · Develop
              <br />
              Market
            </motion.div>
            <InkText as="h2" className={`display ${styles.tagline}`} play={ready} delay={350} duration={1600}>
              Designed,
              <br />
              built &amp;
              <br />
              <span className="serif">marketed,</span>
            </InkText>
            <motion.div className={`label ${styles.avail}`} {...fadeUp(1.2)}>
              <span className={styles.dot} />
              {site.available}
            </motion.div>
          </div>
        </aside>
      </motion.div>
    </section>
  );
}
