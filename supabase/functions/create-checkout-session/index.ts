// create-checkout-session
// Starts a subscription checkout for the chosen tier and returns { url }.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   STRIPE_API_KEY          sk_test_... in test mode, sk_live_... (or rk_live_...) when live
//   STRIPE_PRICE_STANDARD   price id for Standard ($2.50/mo)   — optional in test mode
//   STRIPE_PRICE_PLATINUM   price id for Awesome  ($4.50/mo)   — optional in test mode
//   APP_URL                 https://marathonrhino.run/marathon_rhino.html (where Stripe returns people)
//
// Safety checks:
//   • A saved Stripe customer that doesn't exist in the current mode (e.g. a
//     test-mode customer after switching to live) is replaced with a new one.
//   • Someone who already has a subscription is sent to the billing portal
//     instead of a second checkout, so nobody gets billed twice.
//   • The 30-day free trial is given once per customer, not on every re-subscribe.

import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=denonext'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {})

// Test-mode price ids are the fallback, so nothing breaks before the secrets are set.
const PRICE_BY_TIER: Record<string, string> = {
  standard: Deno.env.get('STRIPE_PRICE_STANDARD') || 'price_1Trlh0QKuThKwYcJ8Lbj6zo8', // Standard — $2.50/mo
  platinum: Deno.env.get('STRIPE_PRICE_PLATINUM') || 'price_1TrlhPQKuThKwYcJwbSN2wUA', // Awesome  — $4.50/mo (app calls it "platinum")
}

const APP_URL = Deno.env.get('APP_URL') ?? 'https://marathonrhino.run/marathon_rhino.html'
const TRIAL_DAYS = 30
// Statuses that mean "this person already has a subscription".
const LIVE_STATUSES = ['trialing', 'active', 'past_due', 'unpaid', 'incomplete']

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

// Returns the saved customer id if Stripe still knows it in this mode, else null.
async function usableCustomer(id: string | null | undefined): Promise<string | null> {
  if (!id) return null
  try {
    const c = await stripe.customers.retrieve(id)
    return (c as Stripe.DeletedCustomer).deleted ? null : id
  } catch (err) {
    if ((err as { code?: string }).code === 'resource_missing') return null
    throw err
  }
}

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

    const { tier } = await req.json().catch(() => ({ tier: null }))
    const priceId = tier ? PRICE_BY_TIER[tier] : undefined
    if (!priceId) return json({ error: `Unknown tier: ${tier}` }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: existing } = await admin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = await usableCustomer(existing?.stripe_customer_id)
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      const { error: saveErr } = await admin
        .from('stripe_customers')
        .upsert({ user_id: user.id, stripe_customer_id: customerId })
      if (saveErr) throw new Error('Could not save billing account: ' + saveErr.message)
    }

    // Already subscribed? Manage that subscription instead of starting another.
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 })
    if (subs.data.some((s) => LIVE_STATUSES.includes(s.status))) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${APP_URL}?portal=return`,
      })
      return json({ url: portal.url, alreadySubscribed: true })
    }
    const hadTrialBefore = subs.data.some((s) => s.trial_start != null)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        // First 30 days free (card collected, charged after) — once per customer.
        ...(hadTrialBefore ? {} : { trial_period_days: TRIAL_DAYS }),
        metadata: { supabase_user_id: user.id, tier },
      },
      success_url: `${APP_URL}?checkout=success`,
      cancel_url: `${APP_URL}?checkout=cancelled`,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error(err)
    return json({ error: (err as Error).message }, 500)
  }
})
