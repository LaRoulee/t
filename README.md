# AUSSIEWAY — landing page

Landing page for the AUSSIEWAY file: 2,303 employer and agency contacts for working in Australia (PVT / Working Holiday).
Static HTML/CSS/JS, no build step. GSAP + ScrollTrigger, Lenis and Three.js are vendored in `vendor/`.

## Run locally

```bash
npx serve .          # or: python3 -m http.server
```

Open the address it prints. ES modules require a server; opening `index.html` directly from disk will not work.

## Before going live

1. **Photos.** The page currently loads the photos from the Higgsfield CDN. Self-host them:
   ```bash
   npm i -D sharp                 # optional, enables WebP conversion (strongly recommended)
   node scripts/fetch-images.mjs  # downloads into assets/img/ and rewrites index.html
   ```
   The raw PNGs weigh several MB each, so WebP conversion matters for load time.
2. **Price.** Replace `[Prix]` in `index.html` (section `#acheter`).
3. **Checkout.** Set the `href` of the button marked `data-checkout` (Stripe, Gumroad, Lemon Squeezy…).
4. **Figures.** Every number on the page comes from `JOBS_AUSTRALIE_PVT.xlsx` (2,303 contacts). Update them if the file changes.

## Structure

| Section | Effect |
| --- | --- |
| Hero | WebGL slow sequence (3 photos, organic displacement wipe, drift), pinned exit where the photo shrinks into a print |
| Manifeste | Words light up as you scroll |
| Le guide (produits) | Pinned horizontal "contact sheet": the frames develop from pale to colour, ripple under the cursor, bend with scroll speed; a film counter runs 0001 → 2303 |
| Horizon | Pinned: the photo opens from a slit on the horizon line |
| Qui recrute, et quand | Real data from the file's Calendrier tab (employers hiring per state and month), heatmap sweeping in from January to December, hover tooltip |
| Services | Violet section, portrait revealed then parallax inside its mask |
| CTA | Parallax aerial photo, offer and buy button |

Motion respects `prefers-reduced-motion` (no smooth scroll, no pins, static grid). WebGL is progressive: without it, or if a texture cannot load, the DOM images and CSS reveals take over.

## Photo provenance

All photographs are AI-generated (Higgsfield, GPT Image 2.5, September 2026) and credited as such in the footer. Each image's generation prompt is summarised in its `alt` text.

## Brand

Palette from the World Nomads brand chart: Manhattan Charcoal `#444642`, Istanbul Twilight `#61398B`, Rio Carnivale `#DE5346`. Typeface: Archivo (SIL OFL), self-hosted in `assets/fonts/`.
