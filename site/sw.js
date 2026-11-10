// Petal & Page offline cache. The deploy workflow replaces __BUILD__ with the commit id,
// so each update installs fresh files while old caches are cleared.
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
    // Add files one by one so a single missing file doesn't block the rest.
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
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

  // Page loads: get the newest app when online (3 s limit), otherwise the saved copy.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await Promise.race([fetch(req, { cache: 'no-store' }), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 3000))]);
        if (r && r.ok) { c.put('index.html', r.clone()); return r; }
      } catch (err) {}
      return (await c.match('index.html')) || (await c.match('./')) || new Response('Offline', { status: 503 });
    })());
    return;
  }

  // App files and libraries: cache first, save anything new (e.g. the reader's engine files).
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
  // Everything else (book title lookups) goes straight to the network.
});
