"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { InkText } from "./InkText";
import { useScrollTo } from "./SmoothScroll";
import styles from "./Contact.module.css";

const types = ["Graphic Design", "Website / Web App", "Meta & Google Ads", "Social Media", "Email Campaigns", "Branding", "Something else"];
const budgets = ["< $500", "$500 – 1.5k", "$1.5k – 5k", "$5k +"];

function Magnetic({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 160, damping: 14, mass: 0.4 });
  return (
    <motion.a
      href={href}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onMouseLeave={() => (x.set(0), y.set(0))}
    >
      {children}
    </motion.a>
  );
}

export function Contact() {
  const [type, setType] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${site.email}`;
    }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "");
    const body = [
      `Hi Bano,`,
      ``,
      String(f.get("message") || ""),
      ``,
      `— ${name}`,
      `Email: ${f.get("email") || ""}`,
      type.length ? `Project: ${type.join(", ")}` : "",
      budget ? `Budget: ${budget}` : "",
    ]
      .filter((l) => l !== null)
      .join("\n");
    const subject = `New project enquiry${name ? ` from ${name}` : ""}`;
    location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className={`section ${styles.wrap}`}>
      <div className={styles.top}>
        <span className="mono muted">( Hire me )</span>
        <span className="label">
          <span className={styles.dot} /> {site.available}
        </span>
      </div>

      <InkText as="h2" className={`display ${styles.title}`}>
        Let&apos;s make
      </InkText>
      <InkText as="h2" className={`display ${styles.title} ${styles.indent}`} delay={160}>
        something <span className="serif">iconic.</span>
      </InkText>

      <div className={styles.cta}>
        <div className={styles.emailBlock}>
          <span className="mono muted">Drop me a line</span>
          <a href={`mailto:${site.email}`} className={styles.email}>
            {site.email}
          </a>
          <button className="pill ghost" onClick={copy}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(copied)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.25 }}>
                {copied ? "Copied ✓" : "Copy email"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <Magnetic href={`mailto:${site.email}?subject=${encodeURIComponent("Let's work together")}`} className={styles.blob}>
          <span>
            Hire
            <br />
            me
          </span>
        </Magnetic>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className="mono muted">01 — Your name</span>
            <input name="name" required placeholder="Jane Doe" autoComplete="name" />
          </label>
          <label className={styles.field}>
            <span className="mono muted">02 — Your email</span>
            <input name="email" type="email" required placeholder="jane@brand.com" autoComplete="email" />
          </label>
        </div>

        <fieldset className={styles.field}>
          <legend className="mono muted">03 — What do you need?</legend>
          <div className={styles.chips}>
            {types.map((t) => (
              <button
                type="button"
                key={t}
                className={`${styles.chip} ${type.includes(t) ? styles.on : ""}`}
                onClick={() => setType((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
                aria-pressed={type.includes(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend className="mono muted">04 — Budget</legend>
          <div className={styles.chips}>
            {budgets.map((b) => (
              <button type="button" key={b} className={`${styles.chip} ${budget === b ? styles.on : ""}`} onClick={() => setBudget(b === budget ? "" : b)} aria-pressed={budget === b}>
                {b}
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.field}>
          <span className="mono muted">05 — Tell me about it</span>
          <textarea name="message" rows={3} required placeholder="A launch campaign for…" />
        </label>

        <button type="submit" className={styles.submit}>
          <span className="roll">
            <span data-text="Send it →">Send it →</span>
          </span>
        </button>
      </form>
    </section>
  );
}

const footLinks = [
  { label: "Work", href: "#work" },
  { label: "Case Studies", href: "#cases" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const scrollTo = useScrollTo();
  const [time, setTime] = useState("");
  useEffect(() => {
    const f = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" }));
    f();
    const i = setInterval(f, 30_000);
    return () => clearInterval(i);
  }, []);
  const hireHref = `mailto:${site.email}?subject=${encodeURIComponent("Let's work together")}&body=${encodeURIComponent("Hi Bano,\n\nI'd love to talk about a project:\n\n")}`;

  return (
    <footer className={`section ${styles.footer}`}>
      <a href={hireHref} className={styles.hire} data-cursor="Email me">
        <div className={styles.hireTop}>
          <span className="mono">( Got a project in mind? )</span>
          <span className="mono">{site.available}</span>
        </div>
        <div className={styles.hireMain}>
          <span className={`display ${styles.hireWord}`}>
            <span className={styles.hireMask}>Hire me</span>
          </span>
          <span className={styles.hireArrow} aria-hidden>
            <svg viewBox="0 0 24 24" width="42%" height="42%">
              <path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.badge} aria-hidden>
            <svg viewBox="0 0 100 100">
              <defs>
                <path id="badgeCircle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
              </defs>
              <text>
                <textPath href="#badgeCircle">Design • Develop • Market • Open for work • </textPath>
              </text>
            </svg>
            <span className={styles.badgeDot} />
          </span>
        </div>
        <span className={styles.hireEmail}>{site.email} →</span>
      </a>

      <div className={styles.cols}>
        <p className={styles.blurb}>
          Designer, developer &amp; marketer — helping brands look sharp, load fast and sell more.
        </p>
        <nav>
          <h4 className="mono muted">Navigate</h4>
          {footLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => (e.preventDefault(), scrollTo(l.href))}>
              <span className="roll">
                <span data-text={l.label}>{l.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <nav>
          <h4 className="mono muted">Socials</h4>
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              <span className="roll">
                <span data-text={`${s.label} ↗`}>{s.label} ↗</span>
              </span>
            </a>
          ))}
        </nav>
        <div>
          <h4 className="mono muted">Say hello</h4>
          <a href={`mailto:${site.email}`}>
            <span className="roll">
              <span data-text={site.email}>{site.email}</span>
            </span>
          </a>
          <span className="muted">Gujrat, Pakistan</span>
          <span className="muted">{time ? `${time} PKT` : "\u00a0"}</span>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden>
        bano<span className={styles.wmDot}>.</span>
      </div>
      <div className={`mono muted ${styles.copy}`}>
        <span>© {new Date().getFullYear()} Bano — All rights reserved</span>
        <span>Designed &amp; developed by Bano</span>
        <button className="mono" onClick={() => scrollTo("#top")}>
          <span className="roll">
            <span data-text="Back to top ↑">Back to top ↑</span>
          </span>
        </button>
      </div>
    </footer>
  );
}
