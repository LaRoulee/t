# AUSSIEWAY — landing page

Landing page for the AUSSIEWAY file: 2,303 employer and agency contacts for working in Australia (PVT / Working Holiday).
Static HTML/CSS/JS, no build step. GSAP + ScrollTrigger, Lenis and Three.js are vendored in `vendor/`.

## Run locally

```bash
npx serve .          # or: python3 -m http.server
```

Open the address it prints. ES modules require a server; opening `index.html` directly from disk will not work.

## Before going live

1. **Photos.** The GitHub Action `.github/workflows/optimize-images.yml` downloads the photos from the Higgsfield CDN, converts them to responsive WebP (800/1600/2400 px + srcset) and commits them. To run it by hand: `npm i --no-save sharp && node scripts/fetch-images.mjs`.
2. **Legal pages.** Fill every `[à compléter]` in `mentions-legales.html`, `cgv.html`, `cgu.html` and `confidentialite.html` (seller identity, SIRET, VAT status, consumer mediator).
3. **Checkout.** Price 27 € and the Payhip link (`https://payhip.com/b/JxquT`) are in the `#acheter` section; the button only works once the terms checkbox is ticked.
4. **HTTPS.** In GitHub → Settings → Pages, tick "Enforce HTTPS".
5. **Figures.** Every number on the page comes from `JOBS_AUSTRALIE_PVT.xlsx` (2,303 contacts). Update them if the file changes.

## Structure

| Section | Effect |
| --- | --- |
| Hero | WebGL slow sequence (3 photos, organic displacement wipe, drift); stays full-bleed and scrolls away with a slight parallax |
| Manifeste | Words light up as you scroll; departure checklist (visa ✓, billet ✓, 2 303 contacts) beside an arrival photo revealed and in parallax |
| Le fichier (produits) | Contact-sheet grid, photos always visible with a gentle drift; scrolling runs a film counter 0001 → 2303 and draws a coral loop around the active step |
| Aperçu | Centred spreadsheet (column letters, row numbers, gridlines) with 6 real rows, numbers masked |
| Horizon | Full-bleed photo shown at once, gentle parallax, the line fades in |
| Qui recrute, et quand | Real data from the file's Calendrier tab (employers hiring per state and month), heatmap sweeping in from January to December, hover tooltip |
| Services | Violet section, portrait revealed then parallax inside its mask |
| FAQ | 5 questions in a centred accordion (one answer open at a time) + FAQPage JSON-LD |
| CTA | Parallax aerial photo, price, terms checkbox (withdrawal-right waiver), Payhip button, payment badges; on phones a sticky buy bar appears after the hero |
| Legal | `mentions-legales.html`, `cgv.html`, `cgu.html`, `confidentialite.html`, `404.html`, `robots.txt`, `sitemap.xml` |

Motion respects `prefers-reduced-motion` (no smooth scroll, no pins, static grid). WebGL is progressive: without it, or if a texture cannot load, the DOM images and CSS reveals take over.

## Photo provenance

All photographs are AI-generated (Higgsfield, GPT Image 2.5 at xhigh quality, September 2026) and credited as such in the footer. Each image's generation prompt is summarised in its `alt` text.

## Brand

Palette from the World Nomads brand chart: Manhattan Charcoal `#444642`, Istanbul Twilight `#61398B`, Rio Carnivale `#DE5346`. Typeface: Archivo (SIL OFL), self-hosted in `assets/fonts/`.
