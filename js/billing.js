// ===================== BILLING =====================
// Subscriptions for Marathon Rhino on two platforms:
//   • Website (marathonrhino.run): Stripe Checkout + Stripe billing portal.
//   • iPhone app (Capacitor):      Apple In-App Purchase. Apple does not allow
//     Stripe inside the iPhone app, so every Stripe path is switched off there
//     and a native paywall screen is shown instead.
// Both platforms read the same `subscriptions` table, so a subscriber on one
// platform has access on the other.
// Load this AFTER settings.js (it overrides saveSubPlan and extends
// renderSubSettings). Reuses globals from db.js and globals.js.

// ---- Platform ---------------------------------------------------------------
// True only inside the iPhone app built with Capacitor; false in any browser.
function isNativeApp() {
  try {
    return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function'
      && window.Capacitor.isNativePlatform());
  } catch (e) { return false; }
}

// Apple's page for managing App Store subscriptions.
const APPLE_MANAGE_SUBS_URL = 'https://apps.apple.com/account/subscriptions';

// Accounts that get full access without paying (e.g. the Apple App Review
// demo login). Lowercase emails only.
const COMP_EMAILS = ['appreview@marathonrhino.run'];
function isCompAccount() {
  const email = ((state.user && state.user.email) || '').toLowerCase();
  return COMP_EMAILS.indexOf(email) !== -1;
}

// Opens a link outside the app (Safari) when running natively.
function openExternal(url) {
  try {
    const P = window.Capacitor && window.Capacitor.Plugins;
    if (isNativeApp() && P && P.Browser && typeof P.Browser.open === 'function') {
      P.Browser.open({ url: url });
      return;
    }
  } catch (e) {}
  const w = window.open(url, '_blank');
  if (!w) window.location.href = url;
}

// ---- Supabase edge functions ------------------------------------------------
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

// ---- Stripe (website only) --------------------------------------------------
// Send the user to Stripe's hosted checkout for the chosen plan.
async function startCheckout(plan) {
  if (isNativeApp()) { showPaywall(plan); return; }   // never Stripe inside the iPhone app
  try {
    const { url } = await callFn('create-checkout-session', { tier: plan });
    window.location.href = url;
  } catch (e) { alert('Could not start checkout: ' + e.message); }
}

// Send the user to Stripe's billing portal (change card, switch plan, cancel).
async function openBillingPortal() {
  if (isNativeApp()) return;
  try {
    const { url } = await callFn('create-portal-session', {});
    window.location.href = url;
  } catch (e) { alert('Could not open billing portal: ' + e.message); }
}

// ---- Subscription status ----------------------------------------------------
// Where a subscription is billed: 'apple' or 'stripe'. Rows written by the
// App Store (via RevenueCat) will set source = 'apple'; older rows are Stripe.
function subscriptionSource(sub) {
  if (!sub) return null;
  if (sub.source) return String(sub.source).toLowerCase();
  return 'stripe';
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
    state.subscriptionSource = active ? subscriptionSource(sub) : null;
    if (active) {
      state.user.subscriptionTier = sub.tier || state.user.subscriptionTier;
      // Reuse the existing trial badge: show a countdown while trialing.
      state.user.trialEnd = sub.status === 'trialing' ? sub.current_period_end : null;
    }
  } catch (e) {
    console.warn('loadSubscription failed', e);
    state.isSubscribed = false;
    state.subscriptionSource = null;
  }
}

// After a purchase or restore, the App Store → RevenueCat → Supabase update can
// take a few seconds to land. Poll briefly until it does.
async function waitForSubscription() {
  for (let i = 0; i < 8; i++) {
    await loadSubscription();
    if (state.isSubscribed) return true;
    await new Promise(res => setTimeout(res, 1500));
  }
  return state.isSubscribed;
}

// ---- Apple In-App Purchase bridge ------------------------------------------
// The iPhone build will define window.MRPurchases (added when RevenueCat is set
// up), with:
//   purchase(plan) -> resolves { active: true } on success; rejects with
//                     { userCancelled: true } if the user backs out
//   restore()      -> resolves { active: true|false }
function iapAvailable() {
  return !!(window.MRPurchases && typeof window.MRPurchases.purchase === 'function');
}

async function purchasePlan(plan) {
  if (!iapAvailable()) {
    alert('In-app purchases aren’t available in this version yet.');
    return false;
  }
  try {
    const result = await window.MRPurchases.purchase(plan);
    if (result && result.active) {
      // Unlock right away; the database catches up in the background.
      state.isSubscribed = true;
      state.subscriptionSource = 'apple';
      state.user.subscriptionTier = plan;
      waitForSubscription();
      return true;
    }
    return await waitForSubscription();
  } catch (e) {
    if (e && e.userCancelled) return false;
    alert('Purchase didn’t go through: ' + ((e && e.message) || e));
    return false;
  }
}

async function restorePurchases() {
  if (!iapAvailable() || typeof window.MRPurchases.restore !== 'function') {
    alert('Restoring purchases isn’t available in this version yet.');
    return false;
  }
  try {
    const result = await window.MRPurchases.restore();
    let ok;
    if (result && result.active === true) {
      state.isSubscribed = true;
      state.subscriptionSource = 'apple';
      waitForSubscription();                 // let the database catch up in the background
      ok = true;
    } else if (result && result.active === false) {
      ok = false;                            // Apple says there's nothing to restore
    } else {
      ok = await waitForSubscription();
    }
    if (ok) {
      alert('Your subscription has been restored.');
      return true;
    }
    alert('No active Marathon Rhino subscription was found for this Apple ID.');
    return false;
  } catch (e) {
    alert('Could not restore purchases: ' + ((e && e.message) || e));
    return false;
  }
}

// ---- Paywall screen (iPhone app only) ---------------------------------------
let _paywallPlan = 'standard';

function showPaywall(plan) {
  const el = document.getElementById('paywallScreen');
  if (!el) return;
  paywallSelect(plan === 'platinum' ? 'platinum' : 'standard');
  const err = document.getElementById('paywallError');
  if (err) err.style.display = 'none';
  el.style.display = 'flex';
  el.scrollTop = 0;
}

function hidePaywall() {
  const el = document.getElementById('paywallScreen');
  if (el) el.style.display = 'none';
}

function paywallSelect(plan) {
  _paywallPlan = plan;
  const s = document.getElementById('paywallOptStandard');
  const p = document.getElementById('paywallOptPlatinum');
  if (s) s.classList.toggle('selected', plan === 'standard');
  if (p) p.classList.toggle('selected', plan === 'platinum');
  const rs = document.getElementById('paywallRadioStandard');
  const rp = document.getElementById('paywallRadioPlatinum');
  if (rs) rs.checked = plan === 'standard';
  if (rp) rp.checked = plan === 'platinum';
}

async function paywallSubscribe() {
  const btn = document.getElementById('paywallSubscribeBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting to the App Store…'; }
  const ok = await purchasePlan(_paywallPlan);
  if (btn) { btn.disabled = false; btn.textContent = 'Start 30-day free trial'; }
  if (ok) {
    hidePaywall();
    if (typeof renderSubSettings === 'function') renderSubSettings();
  }
}

async function paywallRestore() {
  if (await restorePurchases()) {
    hidePaywall();
    if (typeof renderSubSettings === 'function') renderSubSettings();
  }
}

function paywallLogout() {
  hidePaywall();
  doLogout();
}

// ---- Settings → Subscription card -------------------------------------------
// Replace the old local "Save plan" with the right action for each platform.
window.saveSubPlan = async function () {
  const rp = document.getElementById('subRadioPlatinum');
  const plan = rp && rp.checked ? 'platinum' : 'standard';
  const src = state.subscriptionSource;

  if (isNativeApp()) {
    if (state.isSubscribed && src === 'apple') { openExternal(APPLE_MANAGE_SUBS_URL); return; }
    if (state.isSubscribed) return;               // billed on the web; button is hidden
    if (await purchasePlan(plan)) renderSubSettings();
    return;
  }

  if (state.isSubscribed && src === 'apple') {
    alert('Your subscription is billed through the App Store. To change or cancel it, open Settings on your iPhone → [your name] → Subscriptions.');
    return;
  }
  if (state.isSubscribed) openBillingPortal();     // manage / switch / cancel in Stripe
  else startCheckout(plan);                        // start a subscription
};

// Adjust the subscription card after settings.js has filled it in.
function applyBillingUI() {
  const native = isNativeApp();
  const src = state.subscriptionSource;
  const freeAccess = !state.isSubscribed && (isCompAccount() || (typeof isAdmin === 'function' && isAdmin()));
  const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; };

  // Status badge
  const badge = document.getElementById('subStatusBadge');
  if (badge) {
    if (freeAccess) {
      badge.textContent = 'Complimentary';
      badge.style.background = '#e6f1fb'; badge.style.color = '#185FA5';
    } else if (!state.isSubscribed) {
      badge.textContent = 'Not subscribed';
      badge.style.background = '#f1f1f1'; badge.style.color = '#5a6a7e';
    }
  }

  // Stripe-only sections make no sense inside the iPhone app.
  show('subPaymentMethodSection', !native);
  show('subPaymentHistorySection', !native);

  // A web (Stripe) subscriber looking at the iPhone app can't change plans here.
  const webSubOnPhone = native && state.isSubscribed && src === 'stripe';
  show('subChangePlanSection', !webSubOnPhone);
  show('subWebBilledNote', webSubOnPhone);

  // Main button label
  const btn = document.getElementById('subSaveBtn');
  if (btn) {
    if (state.isSubscribed && src === 'apple') btn.textContent = native ? 'Manage subscription' : 'How to manage on iPhone';
    else if (state.isSubscribed) btn.textContent = 'Manage billing';
    else btn.textContent = native ? 'Subscribe — 30 days free' : 'Subscribe';
  }

  // Restore + Apple's required subscription terms (iPhone app only)
  show('subNativeExtras', native);

  // Awesome supporter badge on the profile card
  const supporter = document.getElementById('profileSupporterBadge');
  if (supporter) {
    const awesome = state.isSubscribed && state.user && state.user.subscriptionTier === 'platinum';
    supporter.style.display = awesome ? 'inline-flex' : 'none';
  }
}

(function () {
  const _render = window.renderSubSettings;
  if (typeof _render === 'function') {
    window.renderSubSettings = function () {
      const r = _render.apply(this, arguments);
      try { applyBillingUI(); } catch (e) { console.warn('applyBillingUI', e); }
      return r;
    };
  }
})();

// Point the "Update payment method" button at Stripe instead of a card form.
// (Card numbers are never collected by the app — Stripe handles that.)
function wireBillingButtons() {
  const pmBtn = document.querySelector('#paymentMethodDisplay button');
  if (pmBtn) {
    pmBtn.removeAttribute('onclick');
    pmBtn.onclick = function (e) {
      e.preventDefault();
      if (state.isSubscribed && state.subscriptionSource === 'stripe') openBillingPortal();
      else alert('Choose a plan and tap "Subscribe" first.');
    };
  }
}

// ---- Access gate ------------------------------------------------------------
// No app access without an active/trialing subscription.
//   • Website: send them (back) to Stripe Checkout.
//   • iPhone app: show the in-app paywall.
// Admins and complimentary accounts always get in; a user who just paid on the
// web is let in while the webhook catches up.
// Returns true if access was blocked (caller should stop).
async function enforceAccessGate(justPaid) {
  if (!state || !state.user) return false;              // not logged in yet
  if (typeof isAdmin === 'function' && isAdmin()) return false;
  if (isCompAccount()) return false;
  if (justPaid) return false;
  await loadSubscription();
  if (state.isSubscribed) return false;
  const tier = (state.user && state.user.subscriptionTier) || 'standard';
  if (isNativeApp()) { showPaywall(tier); return true; }
  await startCheckout(tier);                            // redirect back to Stripe
  return true;
}

// After login + data load: pull real status, wire buttons, handle Stripe returns.
(function () {
  const _laea = window.loadAndEnterApp;
  if (typeof _laea === 'function') {
    window.loadAndEnterApp = async function () {
      const r = await _laea.apply(this, arguments);
      try {
        wireBillingButtons();
        const success = !isNativeApp() && new URLSearchParams(location.search).get('checkout') === 'success';
        await loadSubscription();
        if (success) {
          // The webhook may land a moment after the redirect — poll briefly.
          for (let i = 0; i < 6 && !state.isSubscribed; i++) {
            await new Promise(res => setTimeout(res, 1500));
            await loadSubscription();
          }
          history.replaceState({}, '', location.pathname);
        }
        if (await enforceAccessGate(success)) return r;  // blocked (Stripe or paywall)
        if (typeof renderSubSettings === 'function') renderSubSettings();
      } catch (e) { console.warn('billing post-load', e); }
      return r;
    };
  }
})();

// Website only: also enforce the gate when the page is restored from the
// browser's back-forward cache (i.e. the user hit "back" from Stripe). In that
// case no scripts re-run and loadAndEnterApp is NOT called again, so pageshow
// is our only hook. On the normal first load state.user isn't set yet, so the
// gate simply no-ops and the wrapper above handles it.
window.addEventListener('pageshow', function () {
  if (isNativeApp()) return;
  const success = new URLSearchParams(location.search).get('checkout') === 'success';
  enforceAccessGate(success);
});
