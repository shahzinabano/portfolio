"use client";

import { useEffect, useRef } from "react";

const MAX = 48;

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;        // css px
uniform float uDpr;
uniform float uTime;
uniform vec3 uPts[${MAX}]; // x, y (css px, top-left origin), strength
uniform float uRad[${MAX}];
uniform sampler2D uTex;
uniform vec4 uRect;       // image rect in css px: x, y, w, h
uniform float uHasTex;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<4;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y) / uDpr;

  // inky, wobbling edges
  float n = fbm(px * 0.011 + vec2(uTime*0.12, -uTime*0.08));
  vec2 q = px + (vec2(n, fbm(px*0.013 - uTime*0.1)) - 0.5) * 70.0;

  float f = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    vec3 pt = uPts[i];
    if (pt.z <= 0.001) continue;
    vec2 d = q - pt.xy;
    float r = uRad[i];
    f += pt.z * (r*r) / (dot(d,d) + 1.0);
  }

  // outer halo (darker ink) and inner reveal
  float halo = smoothstep(0.22, 0.26, f);
  float core = smoothstep(0.95, 1.05, f);

  // scene: warm dusk gradient with the portrait over it
  vec2 uv = px / uRes;
  vec3 top = vec3(0.86, 0.855, 0.84);
  vec3 mid = vec3(0.66, 0.655, 0.64);
  vec3 bot = vec3(0.42, 0.415, 0.40);
  vec3 scene = mix(top, mid, smoothstep(0.0, 0.55, uv.y));
  scene = mix(scene, bot, smoothstep(0.55, 1.0, uv.y));
  scene += (fbm(uv*vec2(3.0, 9.0) + uTime*0.02) - 0.5) * 0.08; // soft clouds

  if (uHasTex > 0.5) {
    vec2 t = (px - uRect.xy) / uRect.zw;
    if (t.x >= 0.0 && t.x <= 1.0 && t.y >= 0.0 && t.y <= 1.0) {
      vec4 c = texture2D(uTex, t);
      float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      scene = mix(scene, vec3(g), c.a);
    }
  }

  vec3 haloCol = vec3(0.085, 0.085, 0.08);
  vec3 col = mix(haloCol, scene, core);
  float a = max(halo * 0.9, core);
  gl_FragColor = vec4(col * a, a);
}
`;

type Props = { src: string; imgW: number; imgH: number; className?: string };

export function InkReveal({ src, imgW, imgH, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    // no WebGL (or a lost context): leave the hero as plain type on the dark background
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) console.warn("InkReveal shader:", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uDpr = U("uDpr"), uTime = U("uTime"), uPts = U("uPts"), uRad = U("uRad");
    const uRect = U("uRect"), uHasTex = U("uHasTex"), uTex = U("uTex");

    // texture
    const tex = gl.createTexture();
    let hasTex = 0;
    const img = new Image();
    img.decoding = "async";
    let disposed = false;
    img.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      hasTex = 1;
    };
    img.src = src;
    gl.uniform1i(uTex, 0);

    // sizing
    let W = 0, H = 0, dpr = 1;
    const rect = [0, 0, 0, 0];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // portrait: bottom-aligned, ~92% of the height, sitting right of centre on desktop
      const h = H * (W < 760 ? 0.72 : 0.94);
      const w = h * (imgW / imgH);
      const cx = W < 760 ? W * 0.5 : W * 0.56;
      rect[0] = cx - w / 2;
      rect[1] = H - h;
      rect[2] = w;
      rect[3] = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // trail
    const pts = new Float32Array(MAX * 3);
    const rad = new Float32Array(MAX);
    let head = 0;
    const mouse = { x: -9999, y: -9999, inside: false, lastMove: 0 };
    const fol = { x: -9999, y: -9999 };
    let lastSpawn = { x: -9999, y: -9999 };
    let auto = true; // wander on its own until the user moves

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      mouse.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!mouse.inside) return;
      if (auto || fol.x < -1000) { fol.x = x; fol.y = y; }
      mouse.x = x; mouse.y = y;
      mouse.lastMove = performance.now();
      auto = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const spawn = (x: number, y: number, r: number, s = 1) => {
      pts[head * 3] = x;
      pts[head * 3 + 1] = y;
      pts[head * 3 + 2] = s;
      rad[head] = r;
      head = (head + 1) % MAX;
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0, prev = performance.now();
    const t0 = prev;
    const base = () => Math.max(46, Math.min(W, H) * 0.075);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!visible) return;
      const t = (now - t0) / 1000;

      if (auto || now - mouse.lastMove > 4000) {
        // gentle autonomous wander (also what touch users see)
        const ax = W * (0.56 + 0.2 * Math.sin(t * 0.55) * Math.cos(t * 0.21));
        const ay = H * (0.42 + 0.16 * Math.sin(t * 0.8 + 1.3));
        mouse.x = ax; mouse.y = ay;
        if (fol.x < -1000) { fol.x = ax; fol.y = ay; }
      }

      const k = 1 - Math.pow(0.0009, dt);
      const vx = (mouse.x - fol.x) * k, vy = (mouse.y - fol.y) * k;
      fol.x += vx; fol.y += vy;
      const speed = Math.hypot(vx, vy) / Math.max(dt, 0.001);

      const dist = Math.hypot(fol.x - lastSpawn.x, fol.y - lastSpawn.y);
      if (dist > 14) {
        spawn(fol.x, fol.y, base() * (0.85 + Math.min(speed / 2400, 0.6)), 1);
        lastSpawn = { x: fol.x, y: fol.y };
      }

      // age the trail: fade strength, spread the ink a little
      for (let i = 0; i < MAX; i++) {
        const s = pts[i * 3 + 2];
        if (s <= 0) continue;
        pts[i * 3 + 2] = Math.max(0, s - dt * 0.55);
        rad[i] += dt * 10;
      }
      // the "head" blob always sits under the cursor
      const hi = (head + MAX - 1) % MAX;
      pts[hi * 3] = fol.x;
      pts[hi * 3 + 1] = fol.y;
      pts[hi * 3 + 2] = Math.max(pts[hi * 3 + 2], 1.05);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uTime, t);
      gl.uniform3fv(uPts, pts);
      gl.uniform1fv(uRad, rad);
      gl.uniform4f(uRect, rect[0], rect[1], rect[2], rect[3]);
      gl.uniform1f(uHasTex, hasTex);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      img.onload = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      // free GPU objects but keep the context alive: React dev mode mounts effects twice,
      // and a destroyed context cannot be recovered on the same <canvas>
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [src, imgW, imgH]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
