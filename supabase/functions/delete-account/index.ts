// Supabase Edge Function: delete-account
// Permanently deletes the signed-in user's Marathon Rhino account.
//
// Order matters:
//   1. Cancel any web (Stripe) billing first — if that fails we stop, so no one
//      is ever charged for an account that no longer exists.
//   2. Delete their photos from the private "race-photos" bucket.
//   3. Delete their rows: runs, races, subscriptions, stripe_customers, profiles.
//   4. Delete the login itself.
//
// Settings in the Supabase dashboard:
//   • Verify JWT: ON (the default) — only a signed-in user can call this.
//   • Secrets: uses STRIPE_API_KEY (the same secret your other Stripe functions use).
//     SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// App Store subscriptions are billed by Apple and cannot be cancelled from a
// server; the app tells those users how to cancel in iPhone Settings.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=denonext';

const ADMIN_EMAIL = 'sdale255@gmail.com';
const PHOTO_BUCKET = 'race-photos';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // Who is asking?
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'You are not signed in.' }, 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'Your session has expired. Please log in again.' }, 401);
    if ((user.email || '').toLowerCase() === ADMIN_EMAIL) {
      return json({ error: 'The admin account cannot be deleted from the app.' }, 403);
    }
    const uid = user.id;
    const warnings: string[] = [];

    // 1. Stop web billing
    await cancelStripeBilling(admin, uid, warnings);

    // 2. Photos (stored under "<user id>/...")
    await deleteStorageFolder(admin, PHOTO_BUCKET, uid);

    // 3. Database rows
    const tables: Array<[string, string]> = [
      ['runs', 'user_id'],
      ['races', 'user_id'],
      ['subscriptions', 'user_id'],
      ['stripe_customers', 'user_id'],
      ['profiles', 'id'],
    ];
    for (const [table, column] of tables) {
      const { error } = await admin.from(table).delete().eq(column, uid);
      if (error) {
        // A table/column that doesn't exist isn't fatal; anything else is.
        if (/does not exist|schema cache/i.test(error.message)) {
          warnings.push(`${table}: ${error.message}`);
        } else {
          throw new Error(`Could not delete your ${table}: ${error.message}`);
        }
      }
    }

    // 4. The login itself
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) throw new Error('Could not delete your login: ' + delErr.message);

    if (warnings.length) console.warn('delete-account warnings', uid, warnings);
    return json({ ok: true });
  } catch (e) {
    console.error('delete-account failed', e);
    return json({ error: (e as Error).message || 'Account deletion failed. Please try again.' }, 500);
  }
});

// Finds any Stripe customer (cus_...) or subscription (sub_...) IDs stored for
// this user — whatever the column is called — and cancels them in Stripe.
async function cancelStripeBilling(admin: any, uid: string, warnings: string[]) {
  const customerIds = new Set<string>();
  const subscriptionIds = new Set<string>();
  for (const table of ['stripe_customers', 'subscriptions']) {
    const { data, error } = await admin.from(table).select('*').eq('user_id', uid);
    if (error) { warnings.push(`${table} lookup: ${error.message}`); continue; }
    for (const row of data || []) {
      for (const value of Object.values(row)) {
        if (typeof value !== 'string') continue;
        if (value.startsWith('cus_')) customerIds.add(value);
        if (value.startsWith('sub_')) subscriptionIds.add(value);
      }
    }
  }
  if (!customerIds.size && !subscriptionIds.size) return;   // never used Stripe

  const key = Deno.env.get('STRIPE_API_KEY') || Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) {
    throw new Error('Your web subscription could not be cancelled automatically. Please contact support before deleting your account.');
  }
  for (const id of subscriptionIds) await stripeDelete(key, `/v1/subscriptions/${id}`);
  for (const id of customerIds) await stripeDelete(key, `/v1/customers/${id}`);
}

async function stripeDelete(key: string, path: string) {
  const res = await fetch('https://api.stripe.com' + path, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + key },
  });
  if (res.ok || res.status === 404) return;   // 404 = already cancelled/deleted
  const body = await res.json().catch(() => ({}));
  throw new Error('Your web subscription could not be cancelled: ' + (body?.error?.message || res.status));
}

// Deletes every file under "<folder>/" in a bucket, including sub-folders.
async function deleteStorageFolder(admin: any, bucket: string, folder: string) {
  const files: string[] = [];
  async function walk(prefix: string) {
    const pageSize = 100;
    let offset = 0;
    while (true) {
      const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: pageSize, offset });
      if (error) throw new Error('Could not list your photos: ' + error.message);
      if (!data || data.length === 0) break;
      for (const item of data) {
        const fullPath = `${prefix}/${item.name}`;
        if (item.id === null) await walk(fullPath);   // a sub-folder
        else files.push(fullPath);
      }
      if (data.length < pageSize) break;
      offset += pageSize;
    }
  }
  await walk(folder);
  for (let i = 0; i < files.length; i += 100) {
    const { error } = await admin.storage.from(bucket).remove(files.slice(i, i + 100));
    if (error) throw new Error('Could not delete your photos: ' + error.message);
  }
}
