// ===================== AUTH =====================
function switchAuth(tab){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.getElementById('loginForm').style.display=tab==='login'?'flex':'none';
  document.getElementById('signupForm').style.display=tab==='signup'?'flex':'none';
  // Always reset to step 1 when opening signup
  if(tab==='signup'){
    const s1=document.getElementById('signupStep1');
    const s2=document.getElementById('signupStep2');
    if(s1) s1.style.display='flex';
    if(s2) s2.style.display='none';
    const err=document.getElementById('signupStep1Error');
    if(err) err.style.display='none';
  }
}
// ===================== SIGNUP STEPS =====================
function goToSignupStep2() {
  const firstName = document.getElementById('signupFirstName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const country = document.getElementById('signupCountry').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirmPassword').value;
  const err = document.getElementById('signupStep1Error');
  err.style.display = 'none';
  if (!firstName) { err.textContent = 'Please enter your first name.'; err.style.display = 'block'; return; }
  if (!country) { err.textContent = 'Please select your country.'; err.style.display = 'block'; return; }
  if (!email) { err.textContent = 'Please enter your email address.'; err.style.display = 'block'; return; }
  if (!password) { err.textContent = 'Please create a password.'; err.style.display = 'block'; return; }
  if (password !== confirm) { err.textContent = 'Passwords do not match.'; err.style.display = 'block'; return; }
  if (password.length < 6) { err.textContent = 'Password must be at least 6 characters.'; err.style.display = 'block'; return; }
  document.getElementById('signupStep1').style.display = 'none';
  document.getElementById('signupStep2').style.display = 'flex';
  selectPlan('standard');
}
function backToSignupStep1() {
  document.getElementById('signupStep2').style.display = 'none';
  document.getElementById('signupStep1').style.display = 'flex';
}

// ===================== AUTH FUNCTIONS =====================
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const keepSignedIn = document.getElementById('keepSignedIn').checked;
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  errEl.style.display = 'none';
  if (!email || !password) { errEl.textContent = 'Please enter your email and password.'; errEl.style.display = 'block'; return; }
  btn.textContent = 'Signing in...'; btn.disabled = true;
  try {
    const session = await sbSignIn(email, password);
    _sbToken = session.access_token;
    if (keepSignedIn) {
      const toSave = { ...session, expires_at: Math.floor(Date.now()/1000) + session.expires_in };
      localStorage.setItem('sb_session', JSON.stringify(toSave));
    }
    await loadAndEnterApp(session.user);
  } catch(e) {
    errEl.textContent = e.message || 'Login failed. Check your email and password.';
    errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Log in'; btn.disabled = false;
  }
}

async function doSignup() {
  const firstName = document.getElementById('signupFirstName').value.trim();
  const lastName = document.getElementById('signupLastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const country = document.getElementById('signupCountry').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirmPassword').value;
  const err = document.getElementById('signupError');
  const btn = document.getElementById('signupBtn');
  err.style.display='none';
  if (!firstName){err.textContent='Please enter your first name.';err.style.display='block';return;}
  if (!country){err.textContent='Please select your country.';err.style.display='block';return;}
  if (!email){err.textContent='Please enter your email address.';err.style.display='block';return;}
  if (!password){err.textContent='Please create a password.';err.style.display='block';return;}
  if (password!==confirm){err.textContent='Passwords do not match.';err.style.display='block';return;}
  if (password.length<6){err.textContent='Password must be at least 6 characters.';err.style.display='block';return;}
  if (btn){btn.textContent='Creating account...';btn.disabled=true;}
  try {
    const name = lastName ? firstName+' '+lastName : firstName;
    const plan = getSelectedSignupPlan();
    const trialEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    // Get card last 4 if entered
    const cardNum = (document.getElementById('signupCardNumber')?.value||'').replace(/\s/g,'');
    const paymentLast4 = cardNum.length >= 4 ? cardNum.slice(-4) : null;
    const signupData = await sbSignUp(email, password);
    const userId = signupData.user?.id || signupData.id;
    if (!userId) { err.textContent='Signup failed. Try again.'; err.style.display='block'; return; }
    // Sign in immediately to get token
    const session = await sbSignIn(email, password);
    _sbToken = session.access_token;
    const toSave = { ...session, expires_at: Math.floor(Date.now()/1000) + session.expires_in };
    localStorage.setItem('sb_session', JSON.stringify(toSave));
    // Save profile
    await dbUpsert('profiles', {
      id: userId, name, email, country,
      join_date: new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}),
      subscription_tier: plan, trial_end: trialEnd, payment_last4: paymentLast4
    });
    state.country = country; state.mapsInitialized = false;
    await loadAndEnterApp(session.user);
  } catch(e) {
    err.textContent = e.message || 'Signup failed. Please try again.';
    err.style.display='block';
  } finally {
    if (btn){btn.textContent='Create account';btn.disabled=false;}
  }
}

async function doForgotPassword() {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) { alert('Please enter your email address first.'); return; }
  try {
    await sbResetPassword(email);
    alert('Password reset email sent! Check your inbox.');
  } catch(e) { alert('Error: ' + e.message); }
}

async function doLogout() {
  await sbSignOut();
  state = { user:null, unit:'mi', showGlobe:false, showPace:true,
    showUSMap:false, showNAMap:false, showSAMap:false,
    showEUMap:false, showAFMap:false, showASMap:false, showOCMap:false,
    country:null, mapsInitialized:false, nextRace:null, runs:{}, raceHistory:[],
    calYear:new Date().getFullYear(), calMonth:new Date().getMonth(),
    activeDayKey:null, activePhotoRaceIdx:null };
  document.getElementById('authPage').style.display='flex';
  document.getElementById('appShell').classList.remove('visible');
}

