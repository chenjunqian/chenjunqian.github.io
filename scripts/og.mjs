// Renders the 1200x630 Open Graph card from an inline HTML document.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const font = async (p) => (await readFile(join(root, p))).toString('base64');
const serif = await font('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2');
const serifItalic = await font('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2');
const sans = await font('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const avatar = await font('public/images/avatar.webp');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:'IS';src:url(data:font/woff2;base64,${serif}) format('woff2');font-weight:400;font-style:normal}
@font-face{font-family:'IS';src:url(data:font/woff2;base64,${serifItalic}) format('woff2');font-weight:400;font-style:italic}
@font-face{font-family:'Inter';src:url(data:font/woff2;base64,${sans}) format('woff2');font-weight:100 900;font-style:normal}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fbfbfb;color:#111111;font-family:'Inter';overflow:hidden;position:relative}
.glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(0, 0, 0, .06),rgba(0, 0, 0, 0) 62%);top:-380px;right:-260px}
.grain{position:absolute;inset:0;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")}
.rule{position:absolute;left:80px;right:80px;top:96px;height:1px;background:rgba(0, 0, 0, .12)}
.wrap{position:relative;padding:128px 80px 0;display:flex;gap:64px;align-items:flex-start}
.left{max-width:760px}
.eyebrow{display:flex;align-items:center;gap:12px;font-size:15px;letter-spacing:.18em;text-transform:uppercase;color:#5c5c5c}
.dot{width:7px;height:7px;border-radius:50%;background:#111111;box-shadow:0 0 0 4px rgba(0, 0, 0, .1)}
h1{font-family:'IS';font-size:78px;line-height:.98;letter-spacing:-.01em;margin-top:30px;font-weight:400}
h1 em{font-style:italic;color:#5c5c5c}
p{font-size:22px;line-height:1.5;color:#5c5c5c;margin-top:28px;max-width:640px}
.foot{position:absolute;left:80px;right:80px;bottom:58px;display:flex;align-items:center;justify-content:space-between;font-size:15px;color:#8a8a8a}
.brand{display:flex;align-items:center;gap:12px;font-family:'IS';font-size:26px;color:#111111}
.mark{width:38px;height:38px;border-radius:10px;background:linear-gradient(150deg,#2f2f2f,#1a1a1a 68%,#090909);display:grid;place-items:center;font-family:'Inter';font-size:15px;font-weight:700;color:#ffffff}
.avatar{width:172px;height:172px;border-radius:50%;padding:4px;background:conic-gradient(from 140deg,rgba(0, 0, 0, .7),rgba(0, 0, 0, .05) 35%,rgba(0, 0, 0, .18) 62%,rgba(0, 0, 0, .42));flex:none;margin-top:62px}
.avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover}
</style></head>
<body>
<div class="glow"></div><div class="grain"></div><div class="rule"></div>
<div class="wrap">
  <div class="left">
    <div class="eyebrow"><span class="dot"></span>Shanghai · infra engineer · indie builder</div>
    <h1>Infrastructure by day,<br><em>product by night.</em></h1>
    <p>Writing about the products I ship, the AI agents I wire up, and the parts of software nobody puts on a slide.</p>
  </div>
  <div class="avatar"><img src="data:image/webp;base64,${avatar}"></div>
</div>
<div class="foot">
  <div class="brand"><span class="mark">JQ</span>Junqian Chen</div>
  <div>chenjunqian.github.io · writing · projects · about</div>
</div>
</body></html>`;

const tmp = join(root, 'scripts', '.og-tmp.html');
await writeFile(tmp, html);

const browser = await chromium.launch({
  executablePath: process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`file://${tmp}`);
await page.waitForTimeout(600);
const shot = join(root, 'scripts', '.og-tmp.png');
await page.screenshot({ path: shot });
await browser.close();

await sharp(shot)
  .png({ quality: 90, compressionLevel: 9 })
  .toFile(join(root, 'public', 'images', 'og.png'));
console.log('og.png written');
