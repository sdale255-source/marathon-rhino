// ===================== LEGAL CONTENT =====================
// Single source of truth for the Privacy Policy, Terms of Service and Cookie
// Policy. Used in two places:
//   1. Inside the app (Settings / login footer links open them in a popup)
//   2. The public pages privacy.html, terms.html and support.html, which Apple
//      requires as web links in App Store Connect.
// To change the contact address everywhere, edit LEGAL_CONTACT_EMAIL below.

const LEGAL_COMPANY = 'The Marathon Rhino Company LLC';   // exact registered name
const LEGAL_COMPANY_STATE = 'Pennsylvania';
const LEGAL_CONTACT_EMAIL = 'hello@marathonrhino.run';
// Charity pledge, as a share of what the company actually receives
// (after App Store / payment-processing fees, refunds and sales tax).
const CHARITY_PCT_STANDARD = 50;
const CHARITY_PCT_AWESOME = 75;
const LEGAL_UPDATED = 'October 23, 2026';

const _LH = 'style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;"';
const _LUL = 'style="padding-left:1.2rem;margin:0.5rem 0;"';
const _LDATE = `<p style="color:var(--text-muted);margin-bottom:1rem;"><strong>Last updated:</strong> ${LEGAL_UPDATED}</p>`;
const _LMAIL = `<a href="mailto:${LEGAL_CONTACT_EMAIL}">${LEGAL_CONTACT_EMAIL}</a>`;

const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      ${_LDATE}
      <p>Marathon Rhino is a marathon training app available at <strong>marathonrhino.run</strong> and on the Apple App Store. It is owned and operated by <strong>${LEGAL_COMPANY}</strong>, a ${LEGAL_COMPANY_STATE} limited liability company ("we", "us", or "our"), which is responsible for your personal data. This Privacy Policy explains what data we collect, how we use it, and the choices you have. We do not sell your data, show ads, or track you across other apps or websites.</p>

      <h3 ${_LH}>1. Data We Collect</h3>
      <p><strong>Account information:</strong> your name, email address, country, and password. Passwords are handled by our authentication provider (Supabase) and are never visible to us.</p>
      <p><strong>Training data you enter or record:</strong> runs (date, distance, time), rest days, race history, finish times, your next race and goal, and app preferences such as units and which maps to show.</p>
      <p><strong>Photos you choose to add:</strong> race photos and run photos you upload are stored in a private storage area that only your account can access.</p>
      <p><strong>Location during a live run:</strong> when you use the Run Tracker, your device's GPS is used to measure distance and pace while the run is in progress. Your GPS coordinates and route are processed on your device only and are <strong>not uploaded or stored</strong> — we save just the resulting distance and time. If you type a race location (for example "Boston, MA"), that text is sent to OpenStreetMap's geocoding service to place a pin on your race map.</p>
      <p><strong>Subscription information:</strong> your plan, subscription status and renewal dates. If you subscribe in the iPhone app, payment is handled entirely by Apple; we receive only your subscription status (via our subscription provider, RevenueCat). If you subscribe on our website, payment is handled by Stripe. We never receive or store your full card number.</p>
      <p><strong>No advertising or analytics trackers:</strong> we do not use advertising identifiers, third-party analytics, or tracking pixels.</p>

      <h3 ${_LH}>2. How We Use Your Data</h3>
      <ul ${_LUL}>
        <li>To create and secure your account and keep your data synced across your devices</li>
        <li>To show your training history, stats, achievements, and race maps</li>
        <li>To provide your subscription and free trial</li>
        <li>To send account emails you request, such as password resets and sign-up confirmation</li>
      </ul>
      <p>We use your data only to run Marathon Rhino. We do not use it for advertising and we do not sell or rent it to anyone.</p>

      <h3 ${_LH}>3. Service Providers</h3>
      <p>We share data only with the providers needed to operate the app, and only for that purpose:</p>
      <ul ${_LUL}>
        <li><strong>Supabase</strong> — account login, database, and photo storage</li>
        <li><strong>Apple</strong> and <strong>RevenueCat</strong> — in-app subscriptions on iPhone</li>
        <li><strong>Stripe</strong> — subscriptions purchased on our website</li>
        <li><strong>Resend</strong> — delivery of account emails</li>
        <li><strong>OpenStreetMap</strong> — map tiles and converting race locations into map coordinates</li>
        <li><strong>Content delivery networks</strong> (Google Fonts, cdnjs, unpkg, jsDelivr) — deliver fonts and map code; like any website, they receive your device's IP address when these files load</li>
      </ul>

      <h3 ${_LH}>4. Storage & Security</h3>
      <p>Your data is stored with Supabase, encrypted in transit (HTTPS) and at rest. Database security rules ensure each account can access only its own data.</p>

      <h3 ${_LH}>5. Deleting Your Account</h3>
      <p>You can delete your account at any time from inside the app: <strong>Settings → Account → Delete account</strong>. This permanently deletes your login, profile, runs, races, photos, and subscription records right away. Residual copies in our provider's encrypted backups are removed automatically within 30 days.</p>
      <p>Deleting your account cancels any subscription purchased on our website. A subscription purchased through the App Store is billed by Apple, so cancel it in your iPhone's <strong>Settings → [your name] → Subscriptions</strong> to stop future charges.</p>

      <h3 ${_LH}>6. Your Rights</h3>
      <p>Depending on where you live, you may have the right to access, correct, export, or delete your personal data, or to object to how it is processed. You can update most information directly in the app. For anything else, email ${_LMAIL} and we will respond within 30 days.</p>

      <h3 ${_LH}>7. Children's Privacy</h3>
      <p>Marathon Rhino is not directed at children under 13, and we do not knowingly collect personal information from them. If you believe a child has given us personal data, contact us and we will delete it.</p>

      <h3 ${_LH}>8. Changes to This Policy</h3>
      <p>If we make significant changes, we will update the date above and, where appropriate, notify you in the app.</p>

      <h3 ${_LH}>9. Contact Us</h3>
      <p>${LEGAL_COMPANY}<br>Privacy questions or requests: ${_LMAIL}</p>
    `
  },

  terms: {
    title: 'Terms of Service',
    content: `
      ${_LDATE}
      <p>These Terms of Service are an agreement between you and <strong>${LEGAL_COMPANY}</strong>, a ${LEGAL_COMPANY_STATE} limited liability company ("we", "us", or "our"), which owns and operates Marathon Rhino. Please read them carefully. By creating an account or using Marathon Rhino, you agree to them.</p>

      <h3 ${_LH}>1. The Service</h3>
      <p>Marathon Rhino is a marathon training app for logging runs, tracking races, recording runs with GPS, and viewing your running on maps. ${LEGAL_COMPANY} donates ${CHARITY_PCT_STANDARD}% of what it receives from Standard subscriptions and ${CHARITY_PCT_AWESOME}% of what it receives from Awesome subscriptions to conservation charities, split equally between Save the Rhino International and World Land Trust. "What it receives" means subscription revenue actually received by the company after App Store or payment-processing fees, refunds, and any sales taxes. These donations are made by the company from its own revenue; they are not donations by you and are not tax-deductible for subscribers.</p>

      <h3 ${_LH}>2. Your Account</h3>
      <p>You must be at least 13 years old to create an account. You are responsible for keeping your password confidential and for activity under your account. Let us know right away if you suspect unauthorized use.</p>

      <h3 ${_LH}>3. Subscriptions</h3>
      <p><strong>Plans:</strong> Standard ($2.50/month) and Awesome ($4.50/month), or the equivalent price in your local currency as shown at purchase. Both plans include full access to the app. Awesome also includes the Awesome supporter badge, and we donate a larger share of what we receive from it (see section 1).</p>
      <p><strong>Free trial:</strong> new subscribers receive a 30-day free trial. You will not be charged during the trial. Unless you cancel before the trial ends, your subscription starts automatically.</p>
      <p><strong>Purchased in the iPhone app:</strong> payment is charged to your Apple ID account when you confirm the purchase (or when the free trial ends). Your subscription renews automatically each month unless auto-renew is turned off at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the end of the current period. You can manage or cancel your subscription in your iPhone's <strong>Settings → [your name] → Subscriptions</strong>. Refunds for App Store purchases are handled by Apple.</p>
      <p><strong>Purchased on our website:</strong> payment is processed by Stripe and renews monthly until cancelled. You can cancel at any time from Settings in the app; cancellation takes effect at the end of the current billing period, and partial months are not refunded.</p>
      <p>If you downloaded Marathon Rhino from the Apple App Store, your use of the app is also subject to Apple's <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener">Licensed Application End User License Agreement</a>.</p>

      <h3 ${_LH}>4. Acceptable Use</h3>
      <p>You agree not to:</p>
      <ul ${_LUL}>
        <li>Use the app for any unlawful purpose</li>
        <li>Attempt to reverse-engineer, hack, or disrupt the app or its infrastructure</li>
        <li>Upload content that is harmful, offensive, or violates others' rights</li>
        <li>Create multiple accounts to abuse the free trial</li>
        <li>Misrepresent your identity</li>
      </ul>

      <h3 ${_LH}>5. Your Content</h3>
      <p>You own the data and photos you add to Marathon Rhino. You give us a limited license to store and display that content only to provide the service to you.</p>

      <h3 ${_LH}>6. Health & Safety</h3>
      <p>Marathon Rhino is not medical or professional coaching advice. Pace, distance and projected times are estimates, and GPS accuracy varies. Consult a qualified professional before starting a new training program, and stay aware of your surroundings while running.</p>

      <h3 ${_LH}>7. Disclaimers & Limitation of Liability</h3>
      <p>The app is provided "as is" without warranties of any kind, and we do not guarantee it will be error-free or uninterrupted. To the maximum extent permitted by law, ${LEGAL_COMPANY} and its members, managers and employees are not liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including loss of data, personal injury, or property damage.</p>

      <h3 ${_LH}>8. Ending Your Account</h3>
      <p>You can delete your account at any time in <strong>Settings → Account → Delete account</strong>. We may suspend or terminate accounts that violate these Terms.</p>

      <h3 ${_LH}>9. Changes to These Terms</h3>
      <p>We may update these Terms. If we make significant changes, we will update the date above. Continuing to use the app after changes means you accept the updated Terms.</p>

      <h3 ${_LH}>10. Governing Law</h3>
      <p>These Terms are governed by the laws of the Commonwealth of Pennsylvania, United States, without regard to conflict-of-law principles.</p>

      <h3 ${_LH}>11. Contact</h3>
      <p>${LEGAL_COMPANY}<br>Questions about these Terms: ${_LMAIL}</p>
    `
  },

  cookies: {
    title: 'Cookie Policy',
    content: `
      ${_LDATE}
      <p>This Cookie Policy explains how Marathon Rhino uses cookies and similar local storage.</p>

      <h3 ${_LH}>1. What We Store</h3>
      <p>Marathon Rhino uses your device's local storage (not advertising cookies) to keep you signed in when "Keep me signed in" is selected, and to remember small app settings such as whether you've seen the GPS explanation.</p>
      <p>We use <strong>no advertising, tracking, or analytics cookies</strong>.</p>

      <h3 ${_LH}>2. Third-Party Services</h3>
      <p>Map tiles from OpenStreetMap and fonts from Google Fonts are loaded from those providers' servers, which may log standard request information such as your IP address. See openstreetmap.org/copyright and policies.google.com/privacy.</p>

      <h3 ${_LH}>3. Managing Storage</h3>
      <p>Logging out removes your saved session. You can also clear site data in your browser settings; this signs you out.</p>

      <h3 ${_LH}>4. Contact</h3>
      <p>${LEGAL_COMPANY}<br>Questions: ${_LMAIL}</p>
    `
  }
};

// Opens a legal document in the in-app popup.
function showLegalPage(page) {
  const content = LEGAL_CONTENT[page];
  if (!content) return;
  document.getElementById('legalPageTitle').textContent = content.title;
  document.getElementById('legalPageContent').innerHTML = content.content;
  openModal('legalModal');
}

// Used by the public privacy.html / terms.html pages to render a document.
function renderLegalStandalone(page, targetId) {
  const content = LEGAL_CONTENT[page];
  const el = document.getElementById(targetId);
  if (!content || !el) return;
  document.title = content.title + ' — Marathon Rhino';
  el.innerHTML = '<h1>' + content.title + '</h1>' + content.content;
}

// Fill in company name, year and charity percentages wherever a page marks a
// spot for them, so they only ever need changing at the top of this file:
//   <span data-company></span>  <span data-year></span>
//   <span data-charity-standard></span>  <span data-charity-awesome></span>
(function fillLegalPlaceholders() {
  const fill = (sel, text) => document.querySelectorAll(sel).forEach(el => { el.textContent = text; });
  fill('[data-company]', LEGAL_COMPANY);
  fill('[data-year]', String(new Date().getFullYear()));
  fill('[data-charity-standard]', CHARITY_PCT_STANDARD + '%');
  fill('[data-charity-awesome]', CHARITY_PCT_AWESOME + '%');
  fill('[data-contact-email]', LEGAL_CONTACT_EMAIL);
})();
