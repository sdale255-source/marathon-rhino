// Legal pages (Privacy / Terms / Cookies) now live in js/legal.js.

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
function openModal(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>{m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});});

// ===================== CHANGE PASSWORD =====================
function openChangePasswordModal(){
  ['cpCurrent','cpNew','cpConfirm'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  _cpShowMessage('', true, true);
  var btn=document.getElementById('cpSubmitBtn');
  if(btn){btn.disabled=false;btn.textContent='Update password';}
  openModal('changePasswordModal');
}
function _cpShowMessage(text, ok, hide){
  var msg=document.getElementById('cpMessage');
  if(!msg) return;
  if(hide){ msg.style.display='none'; msg.textContent=''; return; }
  msg.textContent=text;
  msg.style.color = ok ? '#2d7a2d' : '#e24b4a';
  msg.style.display='block';
}
async function submitChangePassword(){
  var cur=(document.getElementById('cpCurrent').value||'');
  var nw=(document.getElementById('cpNew').value||'');
  var cf=(document.getElementById('cpConfirm').value||'');
  if(!cur || !nw || !cf){ _cpShowMessage('Please fill in all three fields.', false); return; }
  if(nw.length < 6){ _cpShowMessage('New password must be at least 6 characters.', false); return; }
  if(nw !== cf){ _cpShowMessage('New passwords do not match.', false); return; }
  if(nw === cur){ _cpShowMessage('New password must be different from your current password.', false); return; }
  var email = state.user && state.user.email;
  if(!email){ _cpShowMessage('Could not verify your account. Please log out and back in.', false); return; }
  var btn=document.getElementById('cpSubmitBtn');
  if(btn){ btn.disabled=true; btn.textContent='Updating…'; }
  _cpShowMessage('Updating…', true);
  try{
    // 1) Verify the current password by re-authenticating
    var session;
    try{
      session = await sbSignIn(email, cur);
    }catch(e){
      _cpShowMessage('Current password is incorrect.', false);
      if(btn){ btn.disabled=false; btn.textContent='Update password'; }
      return;
    }
    // Keep the freshly issued session so the app stays authenticated
    if(session && session.access_token){
      _sbToken = session.access_token;
      try{
        var newSession = Object.assign({}, session, { expires_at: Math.floor(Date.now()/1000) + (session.expires_in||3600) });
        localStorage.setItem('sb_session', JSON.stringify(newSession));
      }catch(e){}
    }
    // 2) Update to the new password
    await sbFetch('/auth/v1/user', 'PUT', { password: nw });
    _cpShowMessage('Password updated successfully.', true);
    if(btn){ btn.textContent='Password updated'; }
    setTimeout(function(){ closeModal('changePasswordModal'); }, 1200);
  }catch(err){
    _cpShowMessage((err && err.message) ? err.message : 'Something went wrong. Please try again.', false);
    if(btn){ btn.disabled=false; btn.textContent='Update password'; }
  }
}

// ===================== DELETE ACCOUNT =====================
// Apple requires that any app with sign-up also lets people delete their
// account from inside the app. The actual deletion runs on the server in the
// "delete-account" Supabase edge function, which removes photos, runs, races,
// profile, subscription records and the login itself, and cancels any web
// (Stripe) subscription so the person is never billed again.
function openDeleteAccountModal(){
  ['daPassword','daConfirm'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  _daShowMessage('', false, true);
  var btn=document.getElementById('daSubmitBtn');
  if(btn){btn.disabled=false;btn.textContent='Permanently delete my account';}
  // App Store subscriptions are billed by Apple and can't be cancelled by us,
  // so tell App Store subscribers how to cancel and give them a shortcut.
  var appleNote=document.getElementById('daAppleNote');
  if(appleNote){
    var showApple = (typeof isNativeApp==='function' && isNativeApp()) || state.subscriptionSource==='apple';
    appleNote.style.display = showApple ? 'block' : 'none';
  }
  openModal('deleteAccountModal');
}
function _daShowMessage(text, ok, hide){
  var msg=document.getElementById('daMessage');
  if(!msg) return;
  if(hide){ msg.style.display='none'; msg.textContent=''; return; }
  msg.textContent=text;
  msg.style.color = ok ? '#2d7a2d' : '#e24b4a';
  msg.style.display='block';
}
function openAppleSubscriptions(){
  if(typeof openExternal==='function') openExternal(APPLE_MANAGE_SUBS_URL);
  else window.open('https://apps.apple.com/account/subscriptions','_blank');
}
async function submitDeleteAccount(){
  var pw=(document.getElementById('daPassword').value||'');
  var typed=(document.getElementById('daConfirm').value||'').trim();
  if(typeof isAdmin==='function' && isAdmin()){ _daShowMessage('The admin account can’t be deleted from inside the app.', false); return; }
  if(!pw){ _daShowMessage('Please enter your password.', false); return; }
  if(typed.toUpperCase()!=='DELETE'){ _daShowMessage('Type DELETE in the box to confirm.', false); return; }
  var email = state.user && state.user.email;
  if(!email){ _daShowMessage('Could not verify your account. Please log out and back in.', false); return; }
  blurActiveInput();
  var btn=document.getElementById('daSubmitBtn');
  if(btn){ btn.disabled=true; btn.textContent='Deleting…'; }
  _daShowMessage('Deleting your account…', true);
  try{
    // 1) Confirm it's really them (and get a fresh login token)
    var session;
    try{ session = await sbSignIn(email, pw); }
    catch(e){
      _daShowMessage('That password isn’t right.', false);
      if(btn){ btn.disabled=false; btn.textContent='Permanently delete my account'; }
      return;
    }
    if(session && session.access_token) _sbToken = session.access_token;
    // 2) Delete everything on the server
    await callFn('delete-account', {});
    // 3) Clear this device and return to the login screen
    try{ localStorage.removeItem('sb_session'); }catch(e){}
    closeModal('deleteAccountModal');
    await doLogout();
    setTimeout(function(){ alert('Your Marathon Rhino account and all of its data have been permanently deleted.'); }, 100);
  }catch(err){
    _daShowMessage((err && err.message) ? err.message : 'Something went wrong. Please try again.', false);
    if(btn){ btn.disabled=false; btn.textContent='Permanently delete my account'; }
  }
}

// ===================== PRELOAD & SEED =====================
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json()).then(w=>{window.worldAtlas=w;}).catch(()=>{});
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r=>r.json()).then(w=>{window.globeAtlas=w;}).catch(()=>{});
fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json()).then(u=>{window.usAtlas=u;}).catch(()=>{});

// Data loaded from Supabase on login
