// ===================== SUPABASE REST API (no CDN needed) =====================
const SB_URL = 'https://ubxifthikgtekxilbswp.supabase.co';
const SB_KEY = 'sb_publishable_sSZUpk4uUooAoCsnoqdE5Q_RFGTjBCq';
let _sbToken = null; // set after login

// Core REST helpers
async function sbFetch(path, method='GET', body=null, token=null) {
  // Always use the most current token
  if (!_sbToken) {
    const saved = localStorage.getItem('sb_session');
    if (saved) { try { _sbToken = JSON.parse(saved).access_token; } catch(e) {} }
  }
  const headers = {
    'apikey': SB_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  if (token || _sbToken) headers['Authorization'] = 'Bearer ' + (token || _sbToken);
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(SB_URL + path, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
  if (!res.ok) throw new Error(data?.message || data?.error_description || (typeof data === 'string' ? data : JSON.stringify(data)) || res.statusText);
  return data;
}

// Auth
async function sbSignUp(email, password) {
  const res = await fetch(SB_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error_description || JSON.stringify(data));
  return data;
}
async function sbSignIn(email, password) {
  const res = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error_description || JSON.stringify(data));
  if (!data.access_token) throw new Error('No access token in response: ' + JSON.stringify(data));
  console.log('Login OK, token starts with:', data.access_token.slice(0,20));
  return data;
}
async function sbSignOut() {
  try {
    await fetch(SB_URL + '/auth/v1/logout', {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + (_sbToken||'') }
    });
  } catch(e) {}
  _sbToken = null;
  localStorage.removeItem('sb_session');
}
async function sbGetSession() {
  const saved = localStorage.getItem('sb_session');
  if (!saved) return null;
  try {
    const session = JSON.parse(saved);
    if (session.expires_at && Date.now() / 1000 > session.expires_at - 60) {
      // Refresh token
      const res = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      if (!res.ok) { localStorage.removeItem('sb_session'); return null; }
      const refreshed = await res.json();
      if (refreshed?.access_token) {
        const newSession = { ...refreshed, expires_at: Math.floor(Date.now()/1000) + refreshed.expires_in };
        localStorage.setItem('sb_session', JSON.stringify(newSession));
        _sbToken = newSession.access_token;
        return newSession;
      }
      localStorage.removeItem('sb_session');
      return null;
    }
    _sbToken = session.access_token;
    console.log('Session restored, token starts with:', _sbToken.slice(0,20));
    return session;
  } catch(e) { localStorage.removeItem('sb_session'); return null; }
}
async function sbResetPassword(email) {
  const res = await fetch(SB_URL + '/auth/v1/recover', {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Reset failed'); }
}

// Database helpers - all use _sbToken for authenticated requests
function dbHeaders(extra={}) {
  if (!_sbToken) console.warn('dbHeaders: no _sbToken set!');
  return {
    'apikey': SB_KEY,
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (_sbToken || ''),
    ...extra
  };
}
async function dbSelect(table, filters='') {
  const url = SB_URL + '/rest/v1/' + table + (filters ? '?' + filters + '&limit=1000' : '?limit=1000');
  const res = await fetch(url, { headers: dbHeaders() });
  const text = await res.text();
  if (!res.ok) throw new Error('dbSelect error ' + res.status + ': ' + text);
  return text ? JSON.parse(text) : [];
}
async function dbUpsert(table, body) {
  const res = await fetch(SB_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: dbHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('dbUpsert error ' + res.status + ': ' + text);
  return text ? JSON.parse(text) : null;
}
async function dbInsert(table, body) {
  console.log('dbInsert', table, 'token:', _sbToken ? 'present ('+_sbToken.slice(0,15)+'...)' : 'MISSING');
  const res = await fetch(SB_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: dbHeaders({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log('dbInsert', table, 'response:', res.status, text.slice(0, 150));
  if (!res.ok) throw new Error('dbInsert error ' + res.status + ': ' + text);
  const data = text ? JSON.parse(text) : null;
  return Array.isArray(data) ? data[0] : data;
}
async function dbUpdate(table, body, filter) {
  const res = await fetch(SB_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'PATCH',
    headers: dbHeaders({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('dbUpdate error ' + res.status + ': ' + text);
  return text ? JSON.parse(text) : null;
}
async function dbDelete(table, filter) {
  const res = await fetch(SB_URL + '/rest/v1/' + table + '?' + filter, {
    method: 'DELETE',
    headers: dbHeaders()
  });
  if (!res.ok) { const text = await res.text(); throw new Error('dbDelete error ' + res.status + ': ' + text); }
}

// ===================== STORAGE (private buckets, e.g. race-photos) =====================
// Uploads a File to a private bucket. Returns the storage path (NOT a public URL —
// private buckets require a signed URL, generated on demand, to actually view the file).
async function sbUploadFile(bucket, path, file) {
  if (!_sbToken) {
    const saved = localStorage.getItem('sb_session');
    if (saved) { try { _sbToken = JSON.parse(saved).access_token; } catch(e) {} }
  }
  const res = await fetch(SB_URL + '/storage/v1/object/' + bucket + '/' + path, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + (_sbToken || ''),
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: file
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Storage upload error ' + res.status + ': ' + text);
  return path;
}
// Best-effort delete of a storage object. Never throws — a failed cleanup shouldn't
// block the user-facing action (e.g. removing a photo from a race).
async function sbDeleteFile(bucket, path) {
  try {
    await fetch(SB_URL + '/storage/v1/object/' + bucket + '/' + path, {
      method: 'DELETE',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + (_sbToken || '') }
    });
  } catch(e) { console.warn('Storage delete error:', e); }
}
// Signed URLs are needed to view files in a PRIVATE bucket. They expire, so we cache
// each one in memory (per page session) and refresh shortly before it would expire.
const _signedUrlCache = new Map(); // path -> {url, expiresAt}
async function getSignedPhotoUrl(path) {
  if (!path) return '';
  // Backward compatibility: photos saved before this fix are raw base64 data URLs
  // (or could be a plain http(s) URL) rather than a storage path — use them as-is.
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const cached = _signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  try {
    const res = await fetch(SB_URL + '/storage/v1/object/sign/race-photos/' + path, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + (_sbToken || ''), 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: 3600 })
    });
    const data = await res.json();
    if (!res.ok || !data.signedURL) throw new Error(data.message || 'Could not load photo');
    const url = SB_URL + data.signedURL;
    _signedUrlCache.set(path, { url, expiresAt: Date.now() + 55*60*1000 }); // refresh 5 min early
    return url;
  } catch(e) {
    console.warn('getSignedPhotoUrl error:', path, e.message);
    return '';
  }
}
// Call after inserting any HTML containing <img data-photo-path="..."> placeholders —
// fills in the real (signed) src for each one.
async function hydratePhotoImages(root) {
  const imgs = (root || document).querySelectorAll('img[data-photo-path]');
  await Promise.all(Array.from(imgs).map(async img => {
    const path = img.getAttribute('data-photo-path');
    const url = await getSignedPhotoUrl(path);
    if (url) img.src = url;
  }));
}
