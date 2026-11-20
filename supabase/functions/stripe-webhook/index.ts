// stripe-webhook
// Stripe calls this to keep the subscriptions table in sync.
// IMPORTANT: "Verify JWT" must be OFF for this function (Stripe is the caller).
//
// Secrets: STRIPE_API_KEY, STRIPE_WEBHOOK_SIGNING_SECRET (whsec_... from the
// webhook endpoint in Stripe), STRIPE_PRICE_STANDARD, STRIPE_PRICE_PLATINUM.
//
// Every event re-reads the subscription from Stripe instead of trusting the
// copy inside the event. That way the data is always current (events can
// arrive out of order), and its shape always matches this code, whatever
// API version the webhook endpoint in Stripe was created with.

import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=denonext'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const PRICE_STANDARD = Deno.env.get('STRIPE_PRICE_STANDARD') || 'price_1Trlh0QKuThKwYcJ8Lbj6zo8'
const PRICE_PLATINUM = Deno.env.get('STRIPE_PRICE_PLATINUM') || 'price_1TrlhPQKuThKwYcJwbSN2wUA'
// Stripe price id -> the app's tier key. (Test ids kept so test rows still map.)
const TIER_BY_PRICE: Record<string, string> = {
  'price_1Trlh0QKuThKwYcJ8Lbj6zo8': 'standard',
  'price_1TrlhPQKuThKwYcJwbSN2wUA': 'platinum',
  [PRICE_STANDARD]: 'standard',
  [PRICE_PLATINUM]: 'platinum', // the app's key for the "Awesome" plan
}

const ACCESS_STATUSES = ['trialing', 'active']

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

async function resolveUserFromCustomer(customerId: string) {
  const { data } = await admin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id as string | undefined
}

// Works with both older API versions (period end on the subscription) and
// newer ones (period end on each subscription item).
function periodEnd(sub: Stripe.Subscription): string | null {
  // deno-lint-ignore no-explicit-any
  const s = sub as any
  const secs = s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? s.trial_end ?? null
  return secs ? new Date(secs * 1000).toISOString() : null
}

async function syncSubscription(subscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const userId =
    (sub.metadata?.supabase_user_id as string | undefined) ??
    (await resolveUserFromCustomer(customerId))
  if (!userId) {
    console.error('Could not resolve user for subscription', sub.id)
    return
  }

  // One row per user. Don't let news about an old, ended subscription
  // overwrite a different subscription that is currently giving access.
  const { data: current } = await admin
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', userId)
    .maybeSingle()
  if (
    current && current.stripe_subscription_id && current.stripe_subscription_id !== sub.id &&
    ACCESS_STATUSES.includes(current.status) && !ACCESS_STATUSES.includes(sub.status)
  ) {
    console.log('Ignoring update for older subscription', sub.id, 'user still has', current.stripe_subscription_id)
    return
  }

  const priceId = sub.items.data[0]?.price?.id ?? null
  const tier = priceId ? (TIER_BY_PRICE[priceId] ?? null) : null

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      tier,
      price_id: priceId,
      current_period_end: periodEnd(sub),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'user_id' },
  )
  // Throwing makes Stripe retry the event later instead of losing it.
  if (error) throw new Error('Upsert failed: ' + error.message)
}

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    return new Response((err as Error).message, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          await syncSubscription(id)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription((event.data.object as { id: string }).id)
        break
      default:
        break
    }
  } catch (err) {
    console.error('Handler error', err)
    return new Response('handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
