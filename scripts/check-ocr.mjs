// Opens the built app in a real browser and checks that "Recognise text" reads a sample page.
import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:8765/index.html';
const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on('console', m => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(url);
await page.waitForFunction(() => window.__pp && window.__pp.recognize, null, { timeout: 30000 });
const text = await page.evaluate(async () => {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 500;
  const g = c.getContext('2d'); g.fillStyle = '#f5f0e4'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#222'; g.font = '48px Georgia, serif';
  ['It is only with the heart', 'that one can see rightly.', 'What is essential is invisible', 'to the eye.'].forEach((l, i) => g.fillText(l, 60, 100 + i * 90));
  return await window.__pp.recognize(c.toDataURL('image/jpeg', .92));
});
console.log('Recognised text:\n' + text);
const ok = /heart/i.test(text) && /essential/i.test(text) && /invisible/i.test(text);
if (!ok) { console.log(logs.join('\n')); console.error('OCR check FAILED'); process.exit(1); }
console.log('OCR check passed');
await browser.close();
