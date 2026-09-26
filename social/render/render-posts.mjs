// Renders the ad posts (carousels and single images, 1080×1350) from posts.html to social/pub/.
//   node social/render/render-posts.mjs [post-id ...]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'social/pub');
const types = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || '' }); r.end(d); }); }).listen(8792);
const base = 'http://localhost:8792/social/render/posts.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(base);
const all = await page.evaluate(() => Object.fromEntries(Object.entries(POSTS).map(([k, v]) => [k, v.length])));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(all);
for (const id of ids) {
  const dir = all[id] > 1 ? path.join(OUT, id) : OUT;
  fs.mkdirSync(dir, { recursive: true });
  for (let n = 0; n < all[id]; n++) {
    await page.goto(`${base}?p=${id}&n=${n}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.ready);
    const file = all[id] > 1 ? path.join(dir, `${String(n + 1).padStart(2, '0')}.png`) : path.join(dir, `${id}.png`);
    await page.screenshot({ path: file });
  }
  console.log(`✓ ${id} (${all[id]})`);
}
await browser.close(); srv.close();
