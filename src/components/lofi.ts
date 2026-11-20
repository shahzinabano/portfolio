/**
 * A tiny original lo-fi beat, synthesised live with the Web Audio API:
 * warm jazzy chords, a soft bass, dusty drums and vinyl crackle.
 * No audio files, nothing copyrighted.
 */

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// Cmaj9 → Am9 → Dm9 → G13 (voiced around middle C)
const CHORDS = [
  [48, 55, 59, 62, 64],
  [45, 52, 55, 59, 60],
  [50, 57, 60, 64, 65],
  [43, 53, 57, 59, 64],
];
const PENTA = [72, 74, 76, 79, 81, 84];

export type Lofi = { start: () => void; stop: () => void; playing: () => boolean };

export function createLofi(): Lofi {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let bus: BiquadFilterNode | null = null;
  let noise: AudioBuffer | null = null;
  let crackle: AudioBufferSourceNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let nextTime = 0;
  let step = 0;
  const bpm = 78;
  const s16 = 60 / bpm / 4;

  const env = (g: GainNode, t: number, peak: number, attack: number, decay: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };

  const tone = (freq: number, t: number, type: OscillatorType, peak: number, attack: number, decay: number, detune = 0) => {
    if (!ctx || !bus) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    env(g, t, peak, attack, decay);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + attack + decay + 0.05);
  };

  const hit = (t: number, kind: "snare" | "hat") => {
    if (!ctx || !bus || !noise) return;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = kind === "hat" ? "highpass" : "bandpass";
    f.frequency.value = kind === "hat" ? 7000 : 1800;
    const g = ctx.createGain();
    env(g, t, kind === "hat" ? 0.035 : 0.16, 0.003, kind === "hat" ? 0.04 : 0.16);
    src.connect(f).connect(g).connect(bus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + 0.25);
  };

  const kick = (t: number) => {
    if (!ctx || !bus) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    env(g, t, 0.55, 0.004, 0.28);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.35);
  };

  const play = (st: number, t: number) => {
    const pos = st % 16;
    const chord = CHORDS[Math.floor(st / 16) % CHORDS.length];
    // swing the off-beat 16ths a little
    const tt = pos % 2 ? t + s16 * 0.18 : t;

    if (pos === 0) {
      chord.forEach((n, i) => {
        tone(midi(n), t + i * 0.012, "triangle", 0.045, 0.03, s16 * 15, (Math.random() - 0.5) * 12);
        tone(midi(n + 12), t + i * 0.012, "sine", 0.012, 0.05, s16 * 10);
      });
    }
    if (pos === 0 || pos === 7 || pos === 10) tone(midi(chord[0] - 12), tt, "sine", 0.22, 0.01, 0.55);
    if (pos === 0 || pos === 10) kick(tt);
    if (pos === 4 || pos === 12) hit(tt, "snare");
    if (pos % 2 === 0) hit(tt, "hat");
    if (pos % 4 === 2 && Math.random() < 0.4) {
      tone(midi(PENTA[Math.floor(Math.random() * PENTA.length)]), tt, "sine", 0.05, 0.01, 0.5);
    }
  };

  const schedule = () => {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.15) {
      play(step, nextTime);
      nextTime += s16;
      step++;
    }
  };

  const start = () => {
    if (ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    bus = ctx.createBiquadFilter();
    bus.type = "lowpass";
    bus.frequency.value = 2400;
    bus.Q.value = 0.6;
    bus.connect(master).connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 1.2);

    // noise buffer (drums) + vinyl crackle loop
    const len = ctx.sampleRate * 2;
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const cr = ctx.createBuffer(1, len, ctx.sampleRate);
    const c = cr.getChannelData(0);
    for (let i = 0; i < len; i++) c[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0007 ? (Math.random() - 0.5) * 0.9 : 0);
    crackle = ctx.createBufferSource();
    crackle.buffer = cr;
    crackle.loop = true;
    const cg = ctx.createGain();
    cg.gain.value = 0.5;
    crackle.connect(cg).connect(master);
    crackle.start();

    step = 0;
    nextTime = ctx.currentTime + 0.35;
    timer = setInterval(schedule, 25);
  };

  const stop = () => {
    if (!ctx || !master) return;
    const c = ctx;
    if (timer) clearInterval(timer);
    timer = null;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(master.gain.value, c.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
    setTimeout(() => c.close(), 700);
    ctx = null;
    master = null;
    bus = null;
    crackle = null;
  };

  return { start, stop, playing: () => ctx !== null };
}
