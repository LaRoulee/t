#!/usr/bin/env node
// Downloads the AUSSIEWAY photographs from the Higgsfield CDN into assets/img/ and points
// index.html at the local copies. If `sharp` is installed (npm i -D sharp), images are also
// converted to WebP (quality 82, max 2400px wide), which cuts page weight by ~90%.
//
//   node scripts/fetch-images.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'index.html');
const outDir = path.join(root, 'assets', 'img');

const NAMES = {
  eb1d05c9: 'hero-champ-queensland',
  '01907884': 'hero-vignoble-barossa',
  f9133abb: 'hero-ble-australie-occidentale',
  e37caec1: 'australie-piste-outback',
  b0efe7db: 'job-cueillette-fraises',
  e2d81ade: 'argent-fin-de-journee',
  b4b94869: 'logement-maison-de-ferme',
  '2d5ec233': 'pvt-arret-de-bus',
  '75c19797': 'portrait-verger-manguiers',
  ec96eb3f: 'hangar-conditionnement',
  fe04d259: 'bananeraie-vue-aerienne',
};

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* optional */ }

let html = await readFile(htmlPath, 'utf8');
const urls = [...new Set(html.match(/https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[^"'\s)]+\.png/g) || [])];
if (!urls.length) {
  console.log('No remote images left in index.html. Nothing to do.');
  process.exit(0);
}
await mkdir(outDir, { recursive: true });
if (!sharp) console.log('sharp is not installed: saving PNG files. For WebP, stop here and run `npm i -D sharp` first.\n');

for (const url of urls) {
  const id = Object.keys(NAMES).find((k) => url.includes(k));
  const base = id ? NAMES[id] : path.basename(url, '.png');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} on ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let file = `${base}.png`;
  if (sharp) {
    file = `${base}.webp`;
    await sharp(buf).resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, file));
  } else {
    await writeFile(path.join(outDir, file), buf);
  }
  html = html.split(url).join(`assets/img/${file}`);
  console.log(`✓ ${file}`);
}

await writeFile(htmlPath, html);
console.log(`\n${urls.length} images saved in assets/img/ and index.html updated.`);
