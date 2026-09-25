// Renders the vertical social videos frame by frame from template.html.
//   node social/render/render.mjs [--preview] [video-id ...]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn, execSync } from 'child_process';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'social/videos');
const FFMPEG = execSync(`python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`).toString().trim();
const FPS = 30;
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(p)] || '' }); r.end(d); }); }).listen(8791);
const browser = await chromium.launch();
const base = 'http://localhost:8791/social/render/template.html';
let ids = args.filter((a) => !a.startsWith('--'));
if (!ids.length) {
  const p = await browser.newPage(); await p.goto(base); ids = await p.evaluate(() => Object.keys(VIDEOS)); await p.close();
}
fs.mkdirSync(OUT, { recursive: true });

async function one(id) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`${base}?v=${id}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.ready);
  const dur = await page.evaluate(() => DURATION);
  if (preview) {
    const starts = await page.evaluate(() => { let t = 0; return VIDEOS[new URLSearchParams(location.search).get('v')].map((s) => { const r = t + s.d - 0.05; t += s.d; return r; }); });
    fs.mkdirSync(path.join(OUT, '../preview'), { recursive: true });
    for (const [i, t] of starts.entries()) { await page.evaluate((t) => seek(t), t); await page.screenshot({ path: path.join(OUT, `../preview/${id}-${i}.jpg`), type: 'jpeg', quality: 80 }); }
    await page.close(); return;
  }
  const file = path.join(OUT, `${id}.mp4`);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-shortest',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(dur * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await page.close();
  console.log(`✓ ${id} (${dur.toFixed(1)} s)`);
}

const queue = [...ids];
await Promise.all(Array.from({ length: preview ? 1 : 3 }, async () => { while (queue.length) await one(queue.shift()); }));
await browser.close(); srv.close();
