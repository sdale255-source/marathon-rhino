// Supabase Edge Function: race-preview-image
// Given a race's website URL, returns the site's own link-preview image
// (its og:image / twitter:image — the picture a site chooses to show when it is
// shared on Facebook, iMessage, Slack, etc.). The app shows that picture in the
// "Race website" bubble on the Home page.
//
// Browsers can't read other sites' HTML directly (CORS), so this runs on the server.
// It only ever returns an image URL — it never passes page contents back.
//
// Settings: Verify JWT ON — only signed-in app users can call it.
// Request:  POST { "url": "https://coastguardmarathon.com" }
// Response: { "image": "https://…/hero.jpg" }  or  { "image": null }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// Small in-memory cache (lives as long as the function instance stays warm).
const cache = new Map<string, { image: string | null; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

// Refuse anything that isn't an ordinary public website.
function isPublicHttpUrl(u: URL): boolean {
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  if (u.username || u.password) return false;
  if (u.port && u.port !== '80' && u.port !== '443') return false;
  const h = u.hostname.toLowerCase();
  if (!h.includes('.')) return false;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (/^[\d.]+$/.test(h) || h.includes(':') || h.startsWith('[')) return false; // raw IP addresses
  return true;
}

async function fetchHtml(start: string): Promise<{ html: string; finalUrl: string } | null> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    const parsed = new URL(url);
    if (!isPublicHttpUrl(parsed)) return null;
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarathonRhinoPreview/1.0; +https://marathonrhino.run)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      await res.body?.cancel();
      if (!loc) return null;
      url = new URL(loc, url).href;
      continue;
    }
    if (!res.ok) { await res.body?.cancel(); return null; }
    const type = res.headers.get('content-type') || '';
    if (!/html/i.test(type)) { await res.body?.cancel(); return null; }

    // Read at most ~600 KB — the <head> with the meta tags comes first.
    const reader = res.body!.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < 600_000) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
      const soFar = new TextDecoder().decode(value);
      if (/<\/head>/i.test(soFar)) break;
    }
    await reader.cancel().catch(() => {});
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }
    return { html: new TextDecoder().decode(buf), finalUrl: url };
  }
  return null;
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&#x2F;/gi, '/').replace(/&#47;/g, '/').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp('\\b' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return m ? decodeEntities((m[2] ?? m[3] ?? m[4] ?? '').trim()) : null;
}

function findPreviewImage(html: string): string | null {
  const wanted = ['og:image:secure_url', 'og:image:url', 'og:image', 'twitter:image', 'twitter:image:src'];
  const found: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = (attr(tag, 'property') || attr(tag, 'name') || attr(tag, 'itemprop') || '').toLowerCase();
    const content = attr(tag, 'content');
    if (content && (wanted.includes(key) || key === 'image') && !found[key]) found[key] = content;
  }
  for (const k of [...wanted, 'image']) if (found[k]) return found[k];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (/image_src/i.test(attr(tag, 'rel') || '')) {
      const href = attr(tag, 'href');
      if (href) return href;
    }
  }
  return null;
}

async function lookup(siteUrl: string): Promise<string | null> {
  const page = await fetchHtml(siteUrl);
  if (!page) return null;
  const raw = findPreviewImage(page.html);
  if (!raw) return null;
  let img: URL;
  try { img = new URL(raw, page.finalUrl); } catch { return null; }
  if (img.protocol === 'http:') img.protocol = 'https:';   // the app is https-only
  if (!isPublicHttpUrl(img)) return null;
  return img.href;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    let raw = String(body?.url || '').trim();
    if (!raw) return json({ error: 'Missing url' }, 400);
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    let site: URL;
    try { site = new URL(raw); } catch { return json({ error: 'Invalid url' }, 400); }
    if (!isPublicHttpUrl(site)) return json({ error: 'Invalid url' }, 400);

    const key = site.href;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return json({ image: hit.image });

    let image: string | null = null;
    try { image = await lookup(key); } catch (e) { console.warn('preview lookup failed', key, (e as Error).message); }
    cache.set(key, { image, at: Date.now() });
    return json({ image });
  } catch (e) {
    console.error('race-preview-image failed', e);
    return json({ image: null });
  }
});
