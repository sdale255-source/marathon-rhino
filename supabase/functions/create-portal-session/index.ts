// create-portal-session
// Opens Stripe's billing portal so users can change card / switch plan / cancel. Returns { url }.
// Secrets: STRIPE_API_KEY, APP_URL.

import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=denonext'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {})
const APP_URL = Deno.env.get('APP_URL') ?? 'https://marathonrhino.run/marathon_rhino.html'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'Not authenticated' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: row } = await admin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!row?.stripe_customer_id) return json({ error: 'No billing account yet' }, 404)

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: row.stripe_customer_id,
        return_url: `${APP_URL}?portal=return`,
      })
      return json({ url: session.url })
    } catch (err) {
      // e.g. a test-mode customer after switching to live mode
      if ((err as { code?: string }).code === 'resource_missing') return json({ error: 'No billing account yet' }, 404)
      throw err
    }
  } catch (err) {
    console.error(err)
    return json({ error: (err as Error).message }, 500)
  }
})
