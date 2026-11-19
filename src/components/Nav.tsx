"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { useLenis, useScrollTo } from "./SmoothScroll";
import styles from "./Nav.module.css";

const links = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Case Studies", href: "#cases" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const ease = [0.76, 0, 0.24, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const lenis = useLenis();
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  useEffect(() => {
    const f = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    f();
    const i = setInterval(f, 30_000);
    return () => clearInterval(i);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setTimeout(() => scrollTo(href), 450);
  };

  return (
    <>
      <header className={styles.bar}>
        <a href="#top" className={styles.logo} onClick={(e) => (e.preventDefault(), go("#top"))} aria-label="Bano — home">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
            <path d="M6 4h7v9.2A9.5 9.5 0 1 1 6 22.5V4Zm7 18.5a3.6 3.6 0 1 0 7.2 0 3.6 3.6 0 0 0-7.2 0Z" fill="currentColor" />
            <circle cx="27" cy="27" r="3" fill="currentColor" />
          </svg>
        </a>
        <button className={`pill ${styles.menuBtn}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="roll">
            <span data-text={open ? "Close" : "Menu"}>{open ? "Close" : "Menu"}</span>
          </span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.overlay}
            initial={{ clipPath: "circle(0% at 96% 3%)" }}
            animate={{ clipPath: "circle(150% at 96% 3%)" }}
            exit={{ clipPath: "circle(0% at 96% 3%)" }}
            transition={{ duration: 0.9, ease }}
            data-lenis-prevent
          >
            <nav className={styles.links}>
              {links.map((l, i) => (
                <div key={l.href} className={styles.lineMask}>
                  <motion.a
                    href={l.href}
                    onClick={(e) => (e.preventDefault(), go(l.href))}
                    className={styles.link}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.06 }}
                  >
                    <span className={`mono ${styles.idx}`}>0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            <motion.div
              className={styles.meta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <a href={`mailto:${site.email}`} className={styles.email}>
                {site.email}
              </a>
              <div className={styles.socials}>
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
              <span className="mono">Local time — {time}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
