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
