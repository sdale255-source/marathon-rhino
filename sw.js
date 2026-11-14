// Marathon Rhino service worker.
//
// What it does:
//   • Pages, scripts, styles and images from this site: always try the network
//     first, so people get the newest version whenever they're online. A copy
//     of each file is kept, and that copy is used when there's no signal (or
//     the signal is so weak a page takes longer than a few seconds to load).
//   • Map and font libraries from their CDNs: their web addresses include a
//     version number, so the saved copy is used straight away.
//   • Everything else (Supabase sign-in, data, photos, Stripe, map tiles):
//     not touched at all — it goes straight to the network as before.
//
// Bump CACHE_VERSION only to throw away every saved copy (rarely needed,
// because saved copies are refreshed automatically whenever you're online).

const CACHE_VERSION = 'v1';
const SITE_CACHE = 'mm-site-' + CACHE_VERSION;
const CDN_CACHE = 'mm-cdn-' + CACHE_VERSION;

// Saved when the service worker installs, so the app can open offline even
// before every file has been visited once.
const PRECACHE = ['/marathon_rhino.html', '/manifest.json', '/icons/icon-192.png'];

const CDN_HOSTS = ['cdnjs.cloudflare.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// How long to wait for the network before using the saved copy of a page.
const PAGE_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SITE_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => (k.startsWith('mm-site-') && k !== SITE_CACHE) || (k.startsWith('mm-cdn-') && k !== CDN_CACHE))
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('/sw.js')) return;
    event.respondWith(networkFirst(req, req.mode === 'navigate' ? PAGE_TIMEOUT_MS : 0));
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(req));
  }
  // Anything else: let the browser handle it normally.
});

function isCacheable(res) {
  return res && res.ok && res.type === 'basic' && !res.redirected;
}

async function networkFirst(req, timeoutMs) {
  const cache = await caches.open(SITE_CACHE);
  const network = fetch(req).then((res) => {
    if (isCacheable(res)) cache.put(req, res.clone());
    return res;
  });
  network.catch(() => {}); // a failure is handled below; avoid console noise

  try {
    if (!timeoutMs) return await network;
    // Weak signal: if the page hasn't arrived in time and we have a copy, use it.
    const timedOut = new Promise((resolve) => setTimeout(() => resolve('timeout'), timeoutMs));
    const first = await Promise.race([network, timedOut]);
    if (first !== 'timeout') return first;
    const saved = await savedCopy(cache, req);
    return saved || await network;
  } catch (err) {
    const saved = await savedCopy(cache, req);
    if (saved) return saved;
    if (req.mode === 'navigate') return offlinePage();
    throw err;
  }
}

async function savedCopy(cache, req) {
  const exact = await cache.match(req);
  if (exact) return exact;
  // Sign-in and checkout links add ?something=... — the page itself is the same.
  const loose = await cache.match(req, { ignoreSearch: true });
  if (loose) return loose;
  // Opening the site root offline: fall back to the app.
  if (req.mode === 'navigate' && new URL(req.url).pathname === '/') {
    return cache.match('/marathon_rhino.html');
  }
  return undefined;
}

async function cacheFirst(req) {
  const cache = await caches.open(CDN_CACHE);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

function offlinePage() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Offline — Marathon Rhino</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#042C53;color:#fff;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center;padding:24px}' +
    'b{color:#E8720C}button{margin-top:16px;border:0;border-radius:999px;background:#E8720C;color:#fff;' +
    'font:inherit;font-weight:800;padding:12px 24px}</style></head><body><div>' +
    '<p><b>You\'re offline.</b><br>Connect to the internet and try again.</p>' +
    '<button onclick="location.reload()">Try again</button></div></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
