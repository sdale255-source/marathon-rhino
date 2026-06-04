// ===================== LEGAL PAGES =====================
const LEGAL_CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    content: `
      <p style="color:var(--text-muted);margin-bottom:1rem;"><strong>Effective date:</strong> June 1, 2025 &nbsp;|&nbsp; <strong>Last updated:</strong> June 1, 2025</p>

      <p>Marathon Rhino ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it. By using Marathon Rhino, you agree to the practices described here.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">1. Who We Are</h3>
      <p>Marathon Rhino is a marathon training tracking app with a built-in charity giving programme. We donate a portion of subscription proceeds to Save the Rhino International and World Land Trust. Our app is accessible at <strong>sdale255-source.github.io/marathon-rhino</strong>.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">2. Data We Collect</h3>
      <p><strong>Account information:</strong> Name, email address, country of residence, and password (stored securely via Supabase Auth).</p>
      <p><strong>Training data:</strong> Running logs, race history, race photos, next race details, goal times, and personal stats you enter.</p>
      <p><strong>App preferences:</strong> Unit settings (miles/km), map preferences, pace display settings, and subscription tier.</p>
      <p><strong>Payment information:</strong> Card last 4 digits and payment history (full card details are never stored on our servers).</p>
      <p><strong>Usage data:</strong> We do not use third-party analytics or advertising trackers. We do not sell your data.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">3. How We Use Your Data</h3>
      <p>We use your data solely to provide and improve Marathon Rhino. Specifically:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li>To authenticate your account and keep your data synced across devices</li>
        <li>To display your training history, stats, and achievements</li>
        <li>To show your races on maps</li>
        <li>To manage your subscription and free trial</li>
        <li>To send password reset emails if requested</li>
      </ul>
      <p>We do <strong>not</strong> use your data for advertising, sell it to third parties, or share it with anyone except as required to operate the app (Supabase for database hosting).</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">4. Data Storage & Security</h3>
      <p>Your data is stored securely on Supabase (supabase.com), a GDPR-compliant cloud database provider. All data is encrypted in transit (HTTPS) and at rest. Row-level security ensures each user can only access their own data.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">5. Data Retention</h3>
      <p>We retain your data for as long as your account is active. If you delete your account, your personal data will be permanently deleted within 30 days.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">6. Your Rights</h3>
      <p>Depending on your location, you may have the following rights:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
        <li><strong>Correction:</strong> Update or correct your personal data</li>
        <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
        <li><strong>Portability:</strong> Request your data in a portable format</li>
        <li><strong>Objection:</strong> Object to how we process your data</li>
      </ul>
      <p>To exercise any of these rights, contact us at <strong>sdale255@gmail.com</strong>.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">7. Third-Party Services</h3>
      <p>Marathon Rhino uses the following third-party services:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li><strong>Supabase</strong> — database and authentication (supabase.com/privacy)</li>
        <li><strong>OpenStreetMap / Nominatim</strong> — race location geocoding (openstreetmap.org/copyright)</li>
        <li><strong>Leaflet.js</strong> — map display (no data collection)</li>
      </ul>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">8. Children's Privacy</h3>
      <p>Marathon Rhino is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the effective date above. Continued use of the app after changes constitutes acceptance.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">10. Contact Us</h3>
      <p>For any privacy-related questions or requests: <strong>sdale255@gmail.com</strong></p>
    `
  },
  terms: {
    title: 'Terms of Service',
    content: `
      <p style="color:var(--text-muted);margin-bottom:1rem;"><strong>Effective date:</strong> June 1, 2025 &nbsp;|&nbsp; <strong>Last updated:</strong> June 1, 2025</p>

      <p>Please read these Terms of Service carefully before using Marathon Rhino. By creating an account or using the app, you agree to be bound by these terms.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">1. The Service</h3>
      <p>Marathon Rhino is a marathon training tracker app that helps runners log training, track races, and view their running data on maps. A portion of subscription proceeds is donated to conservation charities.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">2. Your Account</h3>
      <p>You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. Please notify us immediately of any unauthorised use of your account.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">3. Subscription & Billing</h3>
      <p><strong>Free trial:</strong> All new accounts receive a 30-day free trial. No charge is made during the trial period.</p>
      <p><strong>Standard plan:</strong> $2.50/month after the trial ends.</p>
      <p><strong>Awesome plan:</strong> $4.50/month after the trial ends. Includes an extra $2.00/month donated to conservation charities.</p>
      <p><strong>Cancellation:</strong> You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.</p>
      <p><strong>Charity donations:</strong> Charity contributions are made from subscription proceeds and are not tax-deductible by the subscriber.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">4. Acceptable Use</h3>
      <p>You agree not to:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li>Use the app for any unlawful purpose</li>
        <li>Attempt to reverse-engineer, hack, or compromise the app or its infrastructure</li>
        <li>Upload content that is harmful, offensive, or violates others' rights</li>
        <li>Create multiple accounts to abuse the free trial</li>
        <li>Misrepresent your identity or affiliation</li>
      </ul>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">5. Your Content</h3>
      <p>You retain ownership of all data and content you submit to Marathon Rhino (training logs, race photos, etc.). By submitting content, you grant us a limited licence to store and display it as part of providing the service to you.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">6. Disclaimers</h3>
      <p>Marathon Rhino is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or uninterrupted. Training data, pace calculations, and race information are provided for informational purposes only and should not be relied upon as medical or professional fitness advice. Always consult a qualified professional before beginning a new training programme.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">7. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, Marathon Rhino and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to loss of data, personal injury, or property damage.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">8. Termination</h3>
      <p>We reserve the right to suspend or terminate your account for violation of these Terms. You may delete your account at any time by contacting us.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">9. Changes to Terms</h3>
      <p>We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the new Terms.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">10. Governing Law</h3>
      <p>These Terms are governed by the laws of the State of Pennsylvania, United States, without regard to conflict of law principles.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">11. Contact</h3>
      <p>Questions about these Terms: <strong>sdale255@gmail.com</strong></p>
    `
  },
  cookies: {
    title: 'Cookie Policy',
    content: `
      <p style="color:var(--text-muted);margin-bottom:1rem;"><strong>Effective date:</strong> June 1, 2025 &nbsp;|&nbsp; <strong>Last updated:</strong> June 1, 2025</p>

      <p>This Cookie Policy explains how Marathon Rhino uses cookies and similar local storage technologies when you use our app.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">1. What Are Cookies?</h3>
      <p>Cookies are small text files stored on your device by a website or app. They are widely used to make apps work, remember your preferences, and provide a better experience.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">2. How We Use Local Storage</h3>
      <p>Marathon Rhino uses your browser's <strong>localStorage</strong> (not traditional cookies) to store the following:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li><strong>Session token</strong> — keeps you logged in between visits when "Keep me signed in" is selected. This is a secure JWT token from Supabase Auth.</li>
      </ul>
      <p>We use <strong>no third-party tracking cookies, advertising cookies, or analytics cookies</strong>. We do not use Google Analytics, Facebook Pixel, or any similar tracking technology.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">3. Essential Storage Only</h3>
      <p>The local storage we use is strictly necessary for the app to function. Without it, you would need to log in every time you visit. We do not use it for marketing, advertising, or tracking your behaviour across other websites.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">4. Third-Party Services</h3>
      <p>Some third-party services used by Marathon Rhino may set their own cookies or use local storage:</p>
      <ul style="padding-left:1.2rem;margin:0.5rem 0;">
        <li><strong>OpenStreetMap tiles (Leaflet)</strong> — used for race location maps. OpenStreetMap may set cookies; see their policy at openstreetmap.org/cookie-policy.</li>
        <li><strong>Google Fonts</strong> — used to load the Inter typeface. Google may log font requests; see Google's privacy policy at policies.google.com/privacy.</li>
      </ul>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">5. Managing Your Preferences</h3>
      <p>You can clear your session at any time by logging out of Marathon Rhino, which removes the stored session token. You can also clear localStorage through your browser settings (Settings → Privacy → Clear browsing data).</p>
      <p>Most browsers allow you to control cookies and local storage through their settings. Note that disabling local storage will prevent the "Keep me signed in" feature from working.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">6. Changes to This Policy</h3>
      <p>We may update this Cookie Policy as our practices change. Any updates will be reflected with a new effective date above.</p>

      <h3 style="font-size:15px;font-weight:700;color:var(--navy);margin:1.2rem 0 0.5rem;">7. Contact Us</h3>
      <p>Questions about our use of cookies: <strong>sdale255@gmail.com</strong></p>
    `
  }
};

function showLegalPage(page) {
  const content = LEGAL_CONTENT[page];
  if (!content) return;
  document.getElementById('legalPageTitle').textContent = content.title;
  document.getElementById('legalPageContent').innerHTML = content.content;
  openModal('legalModal');
}

// ===================== SUBSCRIPTION =====================
function selectPlan(plan) {
  const standard = document.getElementById('planStandardLabel');
  const platinum = document.getElementById('planPlatinumLabel');
  if (standard) standard.style.background = plan === 'standard' ? '#fff8f0' : '#fff';
  if (platinum) platinum.style.background = plan === 'platinum' ? '#fff8f0' : '#fff';
}
function selectSubPlan(plan) {
  const ls = document.getElementById('subLabelStandard');
  const lp = document.getElementById('subLabelPlatinum');
  if (ls) ls.style.borderColor = plan === 'standard' ? '#E8720C' : 'var(--border)';
  if (lp) lp.style.borderColor = plan === 'platinum' ? '#E8720C' : 'var(--border)';
}
function getSelectedSignupPlan() {
  const p = document.getElementById('planPlatinum');
  return p && p.checked ? 'platinum' : 'standard';
}
function renderSubSettings() {
  // Show/hide admin card
  const adminCard = document.getElementById('adminCard');
  if (adminCard) adminCard.style.display = isAdmin() ? 'block' : 'none';
  const plan = state.user?.subscriptionTier || 'standard';
  const trialEnd = state.user?.trialEnd;
  const trialActive = trialEnd && new Date(trialEnd) > new Date();
  const nameEl = document.getElementById('subPlanName');
  const priceEl = document.getElementById('subPlanPrice');
  const badgeEl = document.getElementById('subStatusBadge');
  if (nameEl) nameEl.textContent = plan === 'platinum' ? 'Awesome' : 'Standard';
  if (priceEl) priceEl.textContent = plan === 'platinum' ? '$4.50 / month' : '$2.50 / month';
  if (badgeEl) {
    if (trialActive) {
      const days = Math.ceil((new Date(trialEnd) - new Date()) / 86400000);
      badgeEl.textContent = `Free trial · ${days}d left`;
      badgeEl.style.background = '#fff3e0'; badgeEl.style.color = '#E8720C';
    } else {
      badgeEl.textContent = 'Active';
      badgeEl.style.background = '#e8f5e8'; badgeEl.style.color = '#2d7a2d';
    }
  }
  const rs = document.getElementById('subRadioStandard');
  const rp = document.getElementById('subRadioPlatinum');
  if (rs) rs.checked = plan === 'standard';
  if (rp) rp.checked = plan === 'platinum';
  selectSubPlan(plan);
  const pmText = document.getElementById('paymentMethodText');
  if (pmText) pmText.textContent = state.user?.paymentLast4 ? `•••• •••• •••• ${state.user.paymentLast4}` : 'No payment method added';
  const histEl = document.getElementById('paymentHistoryList');
  if (histEl) {
    const history = state.user?.paymentHistory || [];
    histEl.innerHTML = history.length === 0
      ? '<span style="font-style:italic;color:var(--text-muted);">No payments yet — your free trial is active.</span>'
      : history.map(p=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>${p.date}</span><span style="font-weight:600;">${p.amount}</span></div>`).join('');
  }
}
async function saveSubPlan() {
  const rp = document.getElementById('subRadioPlatinum');
  const plan = rp && rp.checked ? 'platinum' : 'standard';
  if (state.user) { state.user.subscriptionTier = plan; debouncedSaveProfile(); renderSubSettings(); }
  alert(`Plan updated to ${plan === 'platinum' ? '🦏 Awesome ($4.50/month)' : 'Standard ($2.50/month)'}! Changes take effect at your next billing date.`);
}
function savePaymentMethod() {
  const name = document.getElementById('cardName').value.trim();
  const number = document.getElementById('cardNumber').value.replace(/\s/g,'');
  const expiry = document.getElementById('cardExpiry').value.trim();
  const cvv = document.getElementById('cardCvv').value.trim();
  if (!name || number.length < 15 || !expiry || !cvv) { alert('Please fill in all card details.'); return; }
  const last4 = number.slice(-4);
  if (state.user) { state.user.paymentLast4 = last4; debouncedSaveProfile(); renderSubSettings(); }
  closeModal('paymentModal');
  alert(`Payment method saved! Card ending in ${last4}.`);
}

function openModal(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});});

// ===================== PRELOAD & SEED =====================
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json()).then(w=>{window.worldAtlas=w;}).catch(()=>{});
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r=>r.json()).then(w=>{window.globeAtlas=w;}).catch(()=>{});
fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json()).then(u=>{window.usAtlas=u;}).catch(()=>{});

// Data loaded from Supabase on login
