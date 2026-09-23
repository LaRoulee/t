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
