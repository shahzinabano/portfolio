"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { InkText } from "./InkText";
import { createLofi, type Lofi } from "./lofi";
import styles from "./OffTheClock.module.css";

export function OffTheClock() {
  return (
    <section id="off-the-clock" className={`section ${styles.wrap}`}>
      <div className={styles.top}>
        <span className="mono muted">( Off the clock )</span>
        <span className="label muted">Fuel &amp; frequency</span>
      </div>

      <div className={styles.stage}>
        <Floaters />

        <div className={`${styles.col} ${styles.coffeeCol}`}>
          <Coffee />
        </div>

        <div className={styles.center}>
          <InkText as="h2" className={`display ${styles.title}`}>
            Caffeine
          </InkText>
          <InkText as="h2" className={`display ${styles.title}`} delay={150}>
            <span className="serif">&amp;</span> Vinyl
          </InkText>
          <p className={`mono muted ${styles.centerNote}`}>The two things my process refuses to skip.</p>
        </div>

        <div className={`${styles.col} ${styles.vinylCol}`}>
          <Turntable />
        </div>
      </div>
    </section>
  );
}

/* ---------- drifting beans & notes around the headline ---------- */
function Floaters() {
  const items = ["☕", "♪", "◐", "♫", "◑", "♪", "☕", "♬"];
  return (
    <div className={styles.floaters} aria-hidden>
      {items.map((c, i) => (
        <span
          key={i}
          style={{
            left: `${8 + ((i * 41) % 84)}%`,
            top: `${10 + ((i * 29) % 78)}%`,
            animationDelay: `${-i * 1.7}s`,
            animationDuration: `${9 + (i % 4) * 2}s`,
            fontSize: `${18 + (i % 3) * 8}px`,
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* ---------- iced coffee, drawn in SVG ---------- */
const SIP_LINES = [
  "Sip one. I can see colours again.",
  "Two shots in — now we're kerning.",
  "Running on 90% espresso, 10% audacity.",
  "Empty?! Unacceptable. Refilling…",
];

// cup taper helpers (body goes from y=86 to y=320)
const xl = (y: number) => 42 + ((y - 86) * 24) / 234;
const xr = (y: number) => 198 - ((y - 86) * 24) / 234;

function Coffee() {
  const [full, setFull] = useState(1); // 1 → full, 0 → empty
  const [sips, setSips] = useState(0);
  const [sipping, setSipping] = useState(0);

  const sip = () => {
    if (full <= 0) return;
    const next = Math.max(0, +(full - 0.25).toFixed(2));
    setFull(next);
    setSips((s) => s + 1);
    setSipping((n) => n + 1);
    if (next === 0) setTimeout(() => setFull(1), 1500);
  };

  const level = 118 + (1 - full) * 192; // y of the coffee surface
  const line = sips === 0 ? "Tap the cup. Go on, take a sip." : SIP_LINES[(sips - 1) % SIP_LINES.length];

  return (
    <div className={styles.piece}>
      <motion.button
        className={styles.cupBtn}
        onClick={sip}
        whileHover={{ rotate: -4, y: -6 }}
        whileTap={{ scale: 0.96, rotate: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        aria-label="Take a sip of iced coffee"
        data-cursor="Sip"
      >
        <svg viewBox="0 0 240 340" className={styles.cup} aria-hidden>
          <defs>
            <clipPath id="cupClip">
              <path d="M42 86 L198 86 L174 320 Q120 330 66 320 Z" />
            </clipPath>
            <linearGradient id="coffeeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d9a877" />
              <stop offset="0.45" stopColor="#a8693d" />
              <stop offset="1" stopColor="#5e3519" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
              <stop offset="0.18" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="0.75" stopColor="#fff" stopOpacity="0.02" />
              <stop offset="0.9" stopColor="#fff" stopOpacity="0.18" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="milk" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f5e6d3" stopOpacity="0.85" />
              <stop offset="1" stopColor="#f5e6d3" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* drink */}
          <g clipPath="url(#cupClip)">
            <rect x="0" y="0" width="240" height="340" fill="#ffffff" opacity="0.04" />
            <motion.g animate={{ y: level - 118 }} transition={{ type: "spring", stiffness: 60, damping: 14 }}>
              <rect x="0" y="118" width="240" height="240" fill="url(#coffeeGrad)" />
              <ellipse cx="96" cy="150" rx="60" ry="22" fill="url(#milk)" className={styles.swirl} />
              <ellipse cx="150" cy="190" rx="44" ry="16" fill="url(#milk)" className={styles.swirl2} />
              {/* moving surface */}
              <g className={styles.wave}>
                <path
                  d="M-240 118 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 V130 H-240Z"
                  fill="#e2b98e"
                />
              </g>
              {/* ice */}
              <rect x="64" y="108" width="34" height="32" rx="7" className={`${styles.ice} ${styles.ice1}`} />
              <rect x="108" y="112" width="30" height="28" rx="7" className={`${styles.ice} ${styles.ice2}`} />
              <rect x="146" y="106" width="32" height="30" rx="7" className={`${styles.ice} ${styles.ice3}`} />
            </motion.g>
            {/* bubbles while sipping */}
            <AnimatePresence>
              {sipping > 0 &&
                [0, 1, 2, 3, 4].map((b) => (
                  <motion.circle
                    key={`${sipping}-${b}`}
                    cx={150 + (b % 2 ? 6 : -4)}
                    r={2 + (b % 3)}
                    fill="#fff"
                    fillOpacity="0.5"
                    initial={{ cy: 310, opacity: 0 }}
                    animate={{ cy: level + 10, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, delay: b * 0.08 }}
                  />
                ))}
            </AnimatePresence>
          </g>

          {/* straw (purple, like the real one) */}
          <line x1="150" y1="312" x2="176" y2="6" stroke="#8b3fd9" strokeWidth="10" strokeLinecap="round" />
          <motion.line
            key={sipping}
            x1="150"
            y1="312"
            x2="176"
            y2="6"
            stroke="#7a4a2a"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={sipping ? { pathLength: [0, 1, 1], opacity: [1, 1, 0] } : undefined}
            transition={{ duration: 0.9, times: [0, 0.6, 1] }}
          />

          {/* glass */}
          <path d="M42 86 L198 86 L174 320 Q120 330 66 320 Z" fill="url(#glassGrad)" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
          <path d="M54 100 L72 300" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" />

          {/* condensation */}
          {[
            [88, 140, 0],
            [176, 120, 1],
            [70, 250, 2],
            [160, 260, 3],
            [120, 288, 4],
          ].map(([x, y, i]) => (
            <ellipse key={i} cx={x} cy={y} rx="2.6" ry="3.6" fill="#fff" fillOpacity="0.55" className={styles.drop} style={{ animationDelay: `${i * 1.3}s` }} />
          ))}

          {/* sleeve with badge */}
          <path d={`M${xl(176)} 176 L${xr(176)} 176 L${xr(236)} 236 L${xl(236)} 236 Z`} fill="#0f3d2e" />
          <circle cx="120" cy="206" r="23" fill="#ecebe6" />
          <circle cx="120" cy="206" r="19" fill="none" stroke="#0f3d2e" strokeWidth="1.5" />
          <text x="120" y="214" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f3d2e" style={{ fontFamily: "var(--font-display), Arial, sans-serif", letterSpacing: "-1px" }}>
            b.
          </text>

          {/* lid */}
          <path d="M46 78 Q120 30 194 78 Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />
          <rect x="32" y="74" width="176" height="14" rx="7" fill="#e9e8e4" />
        </svg>
        <span className={styles.shadow} />
      </motion.button>

      <div className={styles.caption}>
        <h3 className={`display ${styles.capTitle}`}>
          Coffee first. <span className="serif">Kerning later.</span>
        </h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            className={styles.capLine}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {line}
          </motion.p>
        </AnimatePresence>
        <span className="mono muted">Sips today: {String(sips).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

/* ---------- retro turntable ---------- */
function Turntable() {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [armOn, setArmOn] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);
  const lofi = useRef<Lofi | null>(null);
  const spin = useRef({ angle: 0, speed: 0, target: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // record rotation with realistic spin-up / spin-down
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      const s = spin.current;
      s.speed += (s.target - s.speed) * Math.min(1, dt * 1.8);
      if (Math.abs(s.speed) < 0.5 && s.target === 0) s.speed = 0;
      s.angle = (s.angle + s.speed * dt) % 360;
      if (discRef.current) discRef.current.style.transform = `rotate(${s.angle}deg)`;
    };
    raf = requestAnimationFrame(loop);
    const pending = timers.current;
    return () => {
      cancelAnimationFrame(raf);
      pending.forEach(clearTimeout);
      lofi.current?.stop();
    };
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const toggle = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!playing) {
      setPlaying(true);
      if (!lofi.current) lofi.current = createLofi();
      const drop = loaded ? 0 : 900;
      setLoaded(true);
      later(() => {
        setArmOn(true);
        spin.current.target = 200; // 33⅓ rpm
      }, drop);
      later(() => lofi.current?.start(), drop + 700);
    } else {
      setPlaying(false);
      lofi.current?.stop();
      setArmOn(false);
      spin.current.target = 0;
    }
  };

  return (
    <div className={styles.piece}>
      <div className={styles.deckWrap}>
        <div className={styles.deck}>
          <div className={styles.plate} />
          <div className={styles.platter} />

          {/* record: hovers lifted above the deck, drops onto the platter on play */}
          <motion.div
            className={`${styles.recordPos} ${loaded ? "" : styles.lifted}`}
            initial={false}
            animate={loaded ? { x: 0, y: 0, rotate: 0, scale: 1 } : { x: "-5%", y: "-16%", rotate: -14, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 90, damping: 13 }}
            style={{ zIndex: 3 }}
          >
            <div ref={discRef} className={styles.record}>
              <div className={styles.label}>
                <span>bano.</span>
                <small>SIDE A · LO-FI FOR PIXELS</small>
              </div>
            </div>
            <div className={styles.sheen} />
          </motion.div>

          {/* tonearm */}
          <div className={`${styles.arm} ${armOn ? styles.armOn : ""}`} aria-hidden>
            <span className={styles.pivot} />
            <span className={styles.rod} />
            <span className={styles.head} />
          </div>

          {/* controls */}
          <div className={styles.controls}>
            <span className={`${styles.led} ${playing ? styles.ledOn : ""}`} />
            <span className="mono">33⅓</span>
            <div className={`${styles.eq} ${playing ? styles.eqOn : ""}`} aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} style={{ animationDelay: `${i * 0.13}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* notes drifting up while it plays */}
        <div className={`${styles.notes} ${playing ? styles.notesOn : ""}`} aria-hidden>
          {["♪", "♫", "♬", "♪"].map((n, i) => (
            <span key={i} style={{ left: `${30 + i * 14}%`, animationDelay: `${i * 0.7}s` }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.caption}>
        <h3 className={`display ${styles.capTitle}`}>
          Bad playlist, <span className="serif">bad pixels.</span>
        </h3>
        <p className={styles.capLine}>My best ideas show up somewhere between a vinyl crackle and the second chorus.</p>
        <button className={`pill ${styles.playBtn}`} onClick={toggle} aria-pressed={playing}>
          {playing ? "❚❚  Lift the needle" : "▶  Drop the needle"}
        </button>
      </div>
    </div>
  );
}
