// Marathon Rhino service worker.
//
// What it does:
//   • Pages, scripts, styles and images from this site: always try the network
//     first, so people get the newest version whenever they're online. A copy
//     of each file is kept, and that copy is used when there's no signal (or
//     the signal is so weak a page takes longer than a few seconds to load).
//   • Map and font libraries from their CDNs: their web addresses include a
//     version number, so the saved copy is used straight away.
//   • Race photos (private Supabase bucket): saved on the device the first
//     time they're viewed and shown from that copy afterwards, so each photo
//     downloads once instead of on every app load. A photo never changes
//     after upload (a new photo always gets a new path), so the copy is
//     always right. Matched by path, ignoring the ?token=... in the link.
//   • App images from Supabase's public buckets (branding, trophies, stats
//     icons): shown from the saved copy, re-downloaded once a week in case
//     one was replaced.
//   • Everything else (Supabase sign-in, data, Stripe, map tiles):
//     not touched at all — it goes straight to the network as before.
//
// Bump CACHE_VERSION only to throw away every saved copy (rarely needed,
// because saved copies are refreshed automatically whenever you're online).

const CACHE_VERSION = 'v1';
const SITE_CACHE = 'mm-site-' + CACHE_VERSION;
const CDN_CACHE = 'mm-cdn-' + CACHE_VERSION;
const PHOTO_CACHE = 'mm-photos-' + CACHE_VERSION;
const IMAGE_CACHE = 'mm-images-' + CACHE_VERSION;

const SUPABASE_HOST = 'ubxifthikgtekxilbswp.supabase.co';
const PHOTO_PREFIX = '/storage/v1/object/sign/race-photos/';
const IMAGE_PREFIXES = ['/storage/v1/object/public/branding/',
  '/storage/v1/object/public/trophies/', '/storage/v1/object/public/stats-icons/'];
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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
        .filter((k) => (k.startsWith('mm-site-') && k !== SITE_CACHE) || (k.startsWith('mm-cdn-') && k !== CDN_CACHE) ||
          (k.startsWith('mm-photos-') && k !== PHOTO_CACHE) || (k.startsWith('mm-images-') && k !== IMAGE_CACHE))
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
    return;
  }
  if (url.hostname === SUPABASE_HOST) {
    if (url.pathname.startsWith(PHOTO_PREFIX)) {
      event.respondWith(savedImage(req, PHOTO_CACHE, 0));
    } else if (IMAGE_PREFIXES.some((p) => url.pathname.startsWith(p))) {
      event.respondWith(savedImage(req, IMAGE_CACHE, IMAGE_MAX_AGE_MS));
    }
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

// Supabase images: use the saved copy if there is one (and, when maxAgeMs is
// set, it isn't older than that); otherwise download it once and save it.
// Saved under the address without its ?query, so a photo's new signed link
// still finds the copy saved from an older link.
async function savedImage(req, cacheName, maxAgeMs) {
  const url = new URL(req.url);
  const key = url.origin + url.pathname;
  const cache = await caches.open(cacheName);
  const saved = await cache.match(key);
  const savedAt = saved ? Number(saved.headers.get('x-saved-at') || 0) : 0;
  if (saved && (!maxAgeMs || Date.now() - savedAt < maxAgeMs)) return saved;
  try {
    // Asked for with CORS (Supabase allows it) so the copy is a normal, readable
    // response rather than an opaque one, which phones count as very large.
    const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return saved || res;
    const body = await res.blob();
    const headers = new Headers({ 'Content-Type': res.headers.get('Content-Type') || body.type || 'image/jpeg',
      'x-saved-at': String(Date.now()) });
    await cache.put(key, new Response(body, { status: 200, headers })).catch(() => {});
    return new Response(body, { status: 200, headers });
  } catch (err) {
    if (saved) return saved; // offline: an older copy is better than nothing
    return fetch(req);
  }
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
