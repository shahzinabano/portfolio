/**
 * Turns the raw files in /source-assets into web-ready images in /public.
 *
 *   source-assets/case-studies/<slug>/case-study.pdf   -> public/case-studies/<slug>/page-01.webp ...
 *   source-assets/case-studies/<slug>/thumbnail.(png|jpg|webp) -> public/case-studies/<slug>/thumb.webp
 *   source-assets/work/*.(png|jpg|webp)                -> public/work/<name>.webp
 *   source-assets/hero/bano.png                        -> public/hero/bano.webp   (hero photo)
 *   source-assets/about/*.png                          -> public/about/bano.webp (About card)
 *
 * It also writes src/data/generated.json (page counts + image sizes) that the site reads.
 *
 * Needs `pdftoppm` (poppler) for PDFs:  macOS: brew install poppler · Windows: choco install poppler
 * Run with:  npm run assets
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "source-assets");
const pub = path.join(root, "public");
const IMG = /\.(png|jpe?g|webp|avif)$/i;
// start from the previous results, so anything without new source files is kept as is
// (raw PDFs are not stored in the repo, so most case studies have nothing to rebuild)
const genFile = path.join(root, "src", "data", "generated.json");
const prev = fs.existsSync(genFile) ? JSON.parse(fs.readFileSync(genFile, "utf8")) : {};
const out = { caseStudies: { ...(prev.caseStudies ?? {}) }, work: prev.work ?? [], hero: prev.hero ?? null, about: prev.about ?? null };

const ensure = (d) => fs.mkdirSync(d, { recursive: true });

async function toWebp(input, output, width, quality = 82) {
  const info = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, smartSubsample: true })
    .toFile(output);
  return { w: info.width, h: info.height };
}

// ---- case studies -------------------------------------------------------
const csDir = path.join(src, "case-studies");
for (const slug of fs.existsSync(csDir) ? fs.readdirSync(csDir) : []) {
  const dir = path.join(csDir, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const target = path.join(pub, "case-studies", slug);
  const files = fs.readdirSync(dir);
  const thumb = files.find((f) => /^thumb/i.test(f) && IMG.test(f));
  const pdf = files.find((f) => f.toLowerCase().endsWith(".pdf"));
  if (!thumb && !pdf) {
    console.log(`case study ${slug}: no new files, kept as is`);
    continue;
  }
  ensure(target);
  const entry = { pages: out.caseStudies[slug]?.pages ?? [], thumb: out.caseStudies[slug]?.thumb ?? null };

  if (thumb) {
    entry.thumb = await toWebp(path.join(dir, thumb), path.join(target, "thumb.webp"), 1600);
  }

  if (pdf) {
    // replace the old pages of this case study only
    for (const f of fs.readdirSync(target)) if (/^page-\d+\.webp$/.test(f)) fs.rmSync(path.join(target, f));
    entry.pages = [];
    const hadThumb = Boolean(thumb);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `cs-${slug}-`));
    execFileSync("pdftoppm", ["-scale-to-x", "2200", "-scale-to-y", "-1", "-png", path.join(dir, pdf), path.join(tmp, "p")]);
    const pages = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
    let n = 0;
    for (const page of pages) {
      const file = path.join(tmp, page);
      const meta = await sharp(file, { limitInputPixels: false }).metadata();
      // very tall pages (long-scroll layouts) are cut into seamless slices so they lazy-load
      const sliceH = meta.height / meta.width > 2 ? Math.round(meta.width * 0.75) : meta.height;
      for (let top = 0; top < meta.height; top += sliceH) {
        const h = Math.min(sliceH, meta.height - top);
        const name = `page-${String(++n).padStart(2, "0")}.webp`;
        const info = await sharp(file, { limitInputPixels: false })
          .extract({ left: 0, top, width: meta.width, height: h })
          .webp({ quality: 80, smartSubsample: true })
          .toFile(path.join(target, name));
        entry.pages.push({ w: info.width, h: info.height, slice: sliceH !== meta.height });
      }
    }
    // no thumbnail supplied -> crop one from the top of the first page
    if (!hadThumb && pages.length) {
      const file = path.join(tmp, pages[0]);
      const meta = await sharp(file, { limitInputPixels: false }).metadata();
      const h = Math.min(meta.height, Math.round(meta.width * 0.585));
      const info = await sharp(file, { limitInputPixels: false })
        .extract({ left: 0, top: 0, width: meta.width, height: h })
        .resize({ width: 1600 }).webp({ quality: 82 })
        .toFile(path.join(target, "thumb.webp"));
      entry.thumb = { w: info.width, h: info.height };
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  out.caseStudies[slug] = entry;
  console.log(`case study ${slug}: ${entry.pages.length} pages`);
}

// ---- work thumbnails ----------------------------------------------------
const workDir = path.join(src, "work");
if (fs.existsSync(workDir)) {
  const target = path.join(pub, "work");
  fs.rmSync(target, { recursive: true, force: true });
  ensure(target);
  out.work = [];
  for (const f of fs.readdirSync(workDir).filter((f) => IMG.test(f)).sort()) {
    const name = f.replace(IMG, ".webp");
    const size = await toWebp(path.join(workDir, f), path.join(target, name), 1400);
    out.work.push({ src: `/work/${name}`, ...size });
  }
  console.log(`work: ${out.work.length} images`);
}

// ---- hero portrait ------------------------------------------------------
const heroDir = path.join(src, "hero");
const hero = fs.existsSync(heroDir) && fs.readdirSync(heroDir).find((f) => IMG.test(f));
if (hero) {
  ensure(path.join(pub, "hero"));
  // keep transparency: webp supports alpha
  out.hero = { src: "/hero/bano.webp", ...(await toWebp(path.join(heroDir, hero), path.join(pub, "hero", "bano.webp"), 1800, 90)) };
  console.log("hero portrait ready");
}

// ---- about portrait (About card) -------------------------------
const aboutDir = path.join(src, "about");
const aboutImg = fs.existsSync(aboutDir) && fs.readdirSync(aboutDir).find((f) => IMG.test(f));
if (aboutImg) {
  ensure(path.join(pub, "about"));
  out.about = { src: "/about/bano.webp", ...(await toWebp(path.join(aboutDir, aboutImg), path.join(pub, "about", "bano.webp"), 1400, 88)) };
  console.log("about portrait ready");
}

ensure(path.join(root, "src", "data"));
fs.writeFileSync(path.join(root, "src", "data", "generated.json"), JSON.stringify(out, null, 2));
console.log("wrote src/data/generated.json");
