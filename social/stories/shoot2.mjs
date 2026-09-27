import { createRequire } from 'module'; const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
import path from 'path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + path.resolve('story-milieu.html')); await p.waitForTimeout(600);
await p.screenshot({ path: 'story-lien-milieu.png' }); await b.close();
