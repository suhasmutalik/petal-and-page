// Petal & Page offline cache. The deploy workflow replaces __BUILD__ with the commit id.
// A new version installs in the background and waits; the app shows an "Update" banner,
// and switches over only when she taps it.
const CACHE = 'petal-page-__BUILD__';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'vendor/zxing.min.js',
  'vendor/tesseract/tesseract.min.js',
  'vendor/tesseract/worker.min.js',
  'vendor/lang/eng.traineddata.gz'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    // Carry over the text reader's engine files from the previous version so it stays offline.
    for (const k of await caches.keys()) {
      if (k === CACHE) continue;
      const old = await caches.open(k);
      for (const req of await old.keys()) {
        if (req.url.includes('/vendor/core/') && !(await c.match(req))) {
          const r = await old.match(req); if (r) await c.put(req, r);
        }
      }
    }
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page loads: the version this worker installed. New versions arrive through the update banner.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const hit = (await c.match('index.html')) || (await c.match('./'));
      if (hit) return hit;
      try { return await fetch(req); } catch (err) { return new Response('Offline', { status: 503 }); }
    })());
    return;
  }

  if (url.origin === location.origin || FONT_HOSTS.includes(url.hostname)) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const hit = await c.match(req, { ignoreSearch: url.origin === location.origin });
      if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r.ok || r.type === 'opaque') c.put(req, r.clone());
        return r;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
  }
});
