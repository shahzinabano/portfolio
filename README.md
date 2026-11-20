# Bano — Portfolio

Next.js 16 · TypeScript · Motion · Lenis · raw WebGL. One page: Hero → Work sphere → Case studies → About → Contact.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Swapping in your own files

All raw files live in `source-assets/`. After changing anything there, run `npm run assets`
(it needs **poppler** for PDFs: `brew install poppler` on macOS, `choco install poppler` on Windows).

| What | Put it here |
| --- | --- |
| Hero cartoon (transparent PNG; shown in greyscale) | `source-assets/hero/bano.png` |
| Recent-work thumbnails (sphere) | `source-assets/work/*.webp/png/jpg` |
| Case study PDF | `source-assets/case-studies/<slug>/case-study.pdf` |
| Case study thumbnail (optional, otherwise cropped from page 1) | `source-assets/case-studies/<slug>/thumbnail.png` |

The script turns each PDF into lightweight page images, so the case study opens as a smooth,
full-screen scroll story instead of a PDF viewer. Very tall single-page PDFs (like OralEase) are
cut into seamless slices so they load progressively.

**Tech Canvas**: drop its PDF at `source-assets/case-studies/tech-canvas/case-study.pdf`, then run
`npm run assets`. Until then it shows a "Landing soon" state.

## Editing text

Everything (titles, industries, summaries, about stats, skills, tools, experience, education, social links, availability)
is in `src/data/site.ts`. To add a new case study, add a folder in `source-assets/case-studies/`
and a matching entry in `caseMeta` in that file.

Case studies are deep-linkable: `/#case/oralease`.

## Adding a case study on GitHub (no setup needed)

1. On github.com open `source-assets/case-studies/` → **Add file → Upload files**.
2. Drag in your PDF. Name the folder in the path, e.g. upload into `tech-canvas/` so it lands at
   `source-assets/case-studies/tech-canvas/case-study.pdf` (optionally add a `thumbnail.png`/`.jpg`).
   Commit to `main`.
3. The **Build case study pages** action (Actions tab) converts it into web pages at 2200 px,
   slices long pages, makes a thumbnail if you didn't upload one, commits the result and removes
   the raw upload. Vercel then redeploys on its own — a few minutes in total.
4. A brand-new folder shows up on the site straight away, titled after the folder name. To give it
   a proper title, industry and summary, edit the `caseMeta` list in `src/data/site.ts` (pencil
   icon on GitHub) and add an entry whose `slug` is the folder name.

GitHub's website accepts files up to **25 MB**. Compress a bigger PDF first (Acrobat
"Reduce File Size", or ilovepdf.com), or upload it with GitHub Desktop (up to 100 MB).
