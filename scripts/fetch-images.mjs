#!/usr/bin/env node
// Downloads the AUSSIEWAY photographs from the Higgsfield CDN into assets/img/ and points the
// pages at the local copies. With `sharp` installed (npm i -D sharp) each photo is converted to
// WebP in several widths and the <img> tags get a srcset, which cuts page weight by ~90%.
// Runs automatically in CI (.github/workflows/optimize-images.yml); locally:
//
//   npm i --no-save sharp && node scripts/fetch-images.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'img');
const SITE_URL = 'https://laroulee.github.io/t/';
// page → prefix used to reach assets/img from that page
const PAGES = { 'index.html': 'assets/img/', '404.html': '/t/assets/img/' };
const WIDTHS = [800, 1600, 2400];
const REMOTE = /https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[^"'\s)]+\.png/g;

const NAMES = {
  'bb9f6218': 'hero-champ-queensland',
  'ae621eaf': 'hero-vignoble-barossa',
  '24c31534': 'hero-ble-australie-occidentale',
  'd6e30755': 'australie-piste-outback',
  '0209fbb4': 'job-cueillette-fraises',
  'a882b58d': 'argent-fin-de-journee',
  'f5f4a962': 'logement-maison-de-ferme',
  '32dff9e0': 'pvt-great-ocean-road',
  'afea47c2': 'portrait-verger-manguiers',
  'd6b88605': 'hangar-conditionnement',
  'd1289af9': 'bananeraie-vue-aerienne',
  'c04f7266': 'arrivee-aeroport-sydney',
};

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* optional */ }

const html = {};
for (const page of Object.keys(PAGES)) html[page] = await readFile(path.join(root, page), 'utf8');
const urls = [...new Set(Object.values(html).flatMap((h) => h.match(REMOTE) || []))];
if (!urls.length) {
  console.log('No remote images left. Nothing to do.');
  process.exit(0);
}
await mkdir(outDir, { recursive: true });
if (!sharp) console.log('sharp is not installed: saving PNG files without srcset. For WebP, run `npm i --no-save sharp` first.\n');

for (const url of urls) {
  const id = Object.keys(NAMES).find((k) => url.includes(k));
  const base = id ? NAMES[id] : path.basename(url, '.png');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} on ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());

  let variants; // [{ file, width, height }]
  if (sharp) {
    const { width, height } = await sharp(buf).metadata();
    const widths = WIDTHS.filter((w) => w < width).concat(width).filter((w, i, a) => a.indexOf(w) === i && w <= 2400);
    variants = [];
    for (const w of widths) {
      const file = `${base}-${w}.webp`;
      await sharp(buf).resize({ width: w }).webp({ quality: 80 }).toFile(path.join(outDir, file));
      variants.push({ file, width: w, height: Math.round((height * w) / width) });
    }
  } else {
    const file = `${base}.png`;
    await writeFile(path.join(outDir, file), buf);
    variants = [{ file, width: 0, height: 0 }];
  }
  const portrait = variants[0].height > variants[0].width;
  const main = variants.find((v) => v.width === 1600) || variants[variants.length - 1];

  for (const [page, prefix] of Object.entries(PAGES)) {
    let h = html[page];
    const srcset = variants.map((v) => `${prefix}${v.file} ${v.width}w`).join(', ');
    const sizes = portrait ? '(min-width: 1201px) 28vw, (min-width: 901px) 42vw, (min-width: 521px) 60vw, 100vw' : '100vw';
    // <img src="URL"> → local file + responsive srcset
    h = h.split(`src="${url}"`).join(sharp ? `src="${prefix}${main.file}" srcset="${srcset}" sizes="${sizes}"` : `src="${prefix}${main.file}"`);
    // social previews need an absolute URL
    if (h.includes(`content="${url}"`)) {
      let og = main;
      if (sharp) {
        // JPEG is the most widely supported format for link previews
        const { width, height } = await sharp(buf).metadata();
        og = { file: `${base}-og.jpg`, width: 1200, height: Math.round((height * 1200) / width) };
        await sharp(buf).resize({ width: 1200 }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(outDir, og.file));
        h = h.replace(/<meta property="og:image:width" content="\d+">/, `<meta property="og:image:width" content="${og.width}">`);
        h = h.replace(/<meta property="og:image:height" content="\d+">/, `<meta property="og:image:height" content="${og.height}">`);
      }
      h = h.split(`content="${url}"`).join(`content="${SITE_URL}assets/img/${og.file}"`);
    }
    // anything else (preload links…)
    h = h.split(url).join(`${prefix}${main.file}`);
    html[page] = h;
  }
  console.log(`✓ ${base} (${variants.map((v) => v.width || 'png').join(', ')})`);
}

for (const [page, h] of Object.entries(html)) await writeFile(path.join(root, page), h);
console.log(`\n${urls.length} images saved in assets/img/ and pages updated.`);
