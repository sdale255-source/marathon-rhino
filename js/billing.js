// ===================== STRIPE BILLING =====================
// Real subscription payments for Marathon Rhino.
// Load this AFTER settings.js (it overrides saveSubPlan and the payment button).
// Reuses globals from db.js (SB_URL, SB_KEY, _sbToken, ensureFreshToken, dbSelect)
// and globals.js (state).

// Call one of our Supabase edge functions as the logged-in user.
async function callFn(name, body) {
  if (typeof ensureFreshToken === 'function') { try { await ensureFreshToken(); } catch (e) {} }
  const res = await fetch(SB_URL + '/functions/v1/' + name, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + _sbToken,
    },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ('Request failed (' + res.status + ')'));
  return data;
}

// Send the user to Stripe's hosted checkout for the chosen plan.
async function startCheckout(plan) {
  try {
    const { url } = await callFn('create-checkout-session', { tier: plan });
    window.location.href = url;
  } catch (e) { alert('Could not start checkout: ' + e.message); }
}

// Send the user to Stripe's billing portal (change card, switch plan, cancel).
async function openBillingPortal() {
  try {
    const { url } = await callFn('create-portal-session', {});
    window.location.href = url;
  } catch (e) { alert('Could not open billing portal: ' + e.message); }
}

// Read the user's real subscription status from the database.
async function loadSubscription() {
  if (!state.user) return;
  try {
    const rows = await dbSelect('subscriptions', 'user_id=eq.' + state.user.id);
    const sub = Array.isArray(rows) ? rows[0] : rows;
    state.subscription = sub || null;
    const active = !!sub && (sub.status === 'active' || sub.status === 'trialing');
    state.isSubscribed = active;
    if (active) {
      state.user.subscriptionTier = sub.tier || state.user.subscriptionTier;
      // Reuse the existing trial badge: show a countdown while trialing.
      state.user.trialEnd = sub.status === 'trialing' ? sub.current_period_end : null;
    }
  } catch (e) {
    console.warn('loadSubscription failed', e);
    state.isSubscribed = false;
  }
}

// Replace the old local "Save plan" with real Stripe checkout / management.
window.saveSubPlan = async function () {
  const rp = document.getElementById('subRadioPlatinum');
  const plan = rp && rp.checked ? 'platinum' : 'standard';
  if (state.isSubscribed) {
    openBillingPortal();          // already paying -> manage/switch/cancel in Stripe
  } else {
    startCheckout(plan);          // not yet paying -> start a subscription
  }
};

// Point the "Update payment method" button at Stripe instead of a card form.
// (You should never collect raw card numbers yourself — Stripe handles that.)
function wireBillingButtons() {
  const pmBtn = document.querySelector('#paymentMethodDisplay button');
  if (pmBtn) {
    pmBtn.removeAttribute('onclick');
    pmBtn.onclick = function (e) {
      e.preventDefault();
      if (state.isSubscribed) openBillingPortal();
      else alert('Choose a plan and tap "Save plan" to subscribe first.');
    };
  }
}

// After login + data load: pull real status, wire buttons, handle Stripe returns.
(function () {
  const _laea = window.loadAndEnterApp;
  if (typeof _laea === 'function') {
    window.loadAndEnterApp = async function () {
      const r = await _laea.apply(this, arguments);
      try {
        await loadSubscription();
        wireBillingButtons();
        const params = new URLSearchParams(location.search);
        if (params.get('checkout') === 'success') {
          // The webhook may land a moment after the redirect — poll briefly.
          for (let i = 0; i < 5 && !state.isSubscribed; i++) {
            await new Promise(res => setTimeout(res, 1500));
            await loadSubscription();
          }
          history.replaceState({}, '', location.pathname);
        }
        if (typeof renderSubSettings === 'function') renderSubSettings();
      } catch (e) { console.warn('billing post-load', e); }
      return r;
    };
  }
})();
