// ===================== DATA LOAD =====================
async function loadAndEnterApp(supaUser) {
  // Load profile
  let profile = null;
  try {
    const profiles = await dbSelect('profiles', 'id=eq.'+supaUser.id);
    profile = Array.isArray(profiles) ? profiles[0] : profiles;
  } catch(e) { console.warn('Profile load error:', e); }
  if (profile) {
    state.user = { id: supaUser.id, name: profile.name || supaUser.email.split('@')[0], email: supaUser.email, joinDate: profile.join_date };
    state.unit = profile.unit || 'mi';
    state.showPace = profile.show_pace !== false;
    console.log('LOADING profile maps:', {globe:profile.show_globe, us:profile.show_us_map, oc:profile.show_oc_map, allNull: profile.show_globe==null && profile.show_us_map==null});
    state.showGlobe  = profile.show_globe  != null ? !!profile.show_globe  : false;
    state.showUSMap  = profile.show_us_map != null ? !!profile.show_us_map : false;
    state.showEUMap  = profile.show_eu_map != null ? !!profile.show_eu_map : false;
    state.showNAMap  = profile.show_na_map != null ? !!profile.show_na_map : false;
    state.showSAMap  = profile.show_sa_map != null ? !!profile.show_sa_map : false;
    state.showAFMap  = profile.show_af_map != null ? !!profile.show_af_map : false;
    state.showASMap  = profile.show_as_map != null ? !!profile.show_as_map : false;
    state.showOCMap  = profile.show_oc_map != null ? !!profile.show_oc_map : false;
    // If ALL map columns are null (columns not yet in DB), fall back to country defaults
    const allNull = profile.show_globe == null && profile.show_us_map == null;
    state.country = profile.country;
    // Only use country defaults if map prefs have never been saved
    state.mapsInitialized = !allNull;
    state.nextRace = profile.next_race || null;
    // Sync toggle checkboxes to loaded prefs
    ['Globe','USMap','NAMap','SAMap','EUMap','AFMap','ASMap','OCMap'].forEach(k=>{
      const el=document.getElementById('toggle'+k);if(el)el.checked=state['show'+k];
    });
    // Geocode next race if coordinates are missing
    if (state.nextRace && !state.nextRace.lat) {
      geocodeLocation(state.nextRace.location, state.nextRace.name).then(coords => {
        if (coords) { state.nextRace.lat=coords.lat; state.nextRace.lng=coords.lng; debouncedSaveProfile(); renderNextRaceMap(); }
      });
    }
    // Load subscription info into state.user
    if (state.user) {
      state.user.subscriptionTier = profile.subscription_tier || 'standard';
      state.user.trialEnd = profile.trial_end || null;
      state.user.paymentLast4 = profile.payment_last4 || null;
      state.user.paymentHistory = profile.payment_history || [];
    }
  } else {
    state.user = { id: supaUser.id, name: supaUser.email.split('@')[0], email: supaUser.email, joinDate: new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}) };
  }

  // Load runs
  try {
    const runsData = await dbSelect('runs', 'user_id=eq.'+supaUser.id);
    state.runs = {};
    if (Array.isArray(runsData)) {
      runsData.forEach(r => { state.runs[r.date_key] = { type: r.type, miles: r.miles || 0, minutes: r.minutes || null }; });
    }
  } catch(e) { state.runs = {}; console.warn('Runs load error:', e); }

  // Load races
  try {
    const racesData = await dbSelect('races', 'user_id=eq.'+supaUser.id+'&order=sort_order.desc');
    state.raceHistory = [];
    if (Array.isArray(racesData)) {
      state.raceHistory = racesData.map(r => ({
        id: r.id, name: r.name, location: r.location || '',
        date: r.date || '', time: r.finish_time || '',
        raceType: r.race_type || 'marathon',
        lat: r.lat || null, lng: r.lng || null,
        photos: r.photos || []
      }));
    }
  } catch(e) { state.raceHistory = []; console.warn('Races load error:', e); }

  enterApp();
}

// ===================== DATA SAVE =====================
async function saveProfileToDB() {
  if (!state.user?.id) return;
  console.log('SAVING maps:', {globe:state.showGlobe, us:state.showUSMap, eu:state.showEUMap, na:state.showNAMap, sa:state.showSAMap, af:state.showAFMap, as:state.showASMap, oc:state.showOCMap});
  try { await dbUpsert('profiles', {
    id: state.user.id,
    name: state.user.name,
    email: state.user.email,
    unit: state.unit,
    show_pace: state.showPace,
    show_globe: state.showGlobe,
    show_us_map: state.showUSMap,
    show_eu_map: state.showEUMap,
    show_na_map: state.showNAMap,
    show_sa_map: state.showSAMap,
    show_af_map: state.showAFMap,
    show_as_map: state.showASMap,
    show_oc_map: state.showOCMap,
    country: state.country,
    next_race: state.nextRace,
    subscription_tier: state.user?.subscriptionTier || 'standard',
    trial_end: state.user?.trialEnd || null,
    payment_last4: state.user?.paymentLast4 || null,
    updated_at: new Date().toISOString()
  }); } catch(e) { console.warn('Profile save error:', e); }
}
const debouncedSaveProfile = debounce(saveProfileToDB, 1000);

async function saveRunToDB(dateKey, run) {
  if (!state.user?.id) return;
  try {
    if (!run) {
      await dbDelete('runs', 'user_id=eq.'+state.user.id+'&date_key=eq.'+encodeURIComponent(dateKey));
    } else {
      console.log('saveRunToDB', dateKey, 'token:', _sbToken ? 'present' : 'MISSING');
      const res = await fetch(SB_URL + '/rest/v1/runs', {
        method: 'POST',
        headers: dbHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
        body: JSON.stringify({
          user_id: state.user.id, date_key: dateKey,
          type: run.type, miles: run.miles || 0, minutes: run.minutes || null,
          updated_at: new Date().toISOString()
        })
      });
      const text = await res.text();
      console.log('saveRunToDB response', res.status, text.slice(0,100));
    }
  } catch(e) { console.error('Run save error:', e.message); }
}

async function saveRaceToDB(race) {
  if (!state.user?.id) { console.warn('saveRaceToDB: no user'); throw new Error('Not logged in'); }
  if (race.id) {
    await dbUpdate('races', {
      name: race.name, location: race.location, date: race.date,
      finish_time: race.time, photos: race.photos || [],
      race_type: race.raceType || 'marathon',
      lat: race.lat || null, lng: race.lng || null,
      updated_at: new Date().toISOString()
    }, 'id=eq.'+race.id);
  } else {
    // Geocode the location for map pins. Non-critical — don't let a geocode failure
    // block the actual race save.
    if (!race.lat || !race.lng) {
      try {
        const coords = await geocodeLocation(race.location, race.name);
        if (coords) { race.lat = coords.lat; race.lng = coords.lng; }
      } catch(e) { console.warn('Geocode error (non-fatal):', e); }
    }
    const inserted = await dbInsert('races', {
      user_id: state.user.id, name: race.name, location: race.location || '',
      date: race.date || '', finish_time: race.time || '',
      photos: race.photos || [], sort_order: Math.floor(Date.now() / 1000),
      race_type: race.raceType || 'marathon',
      lat: race.lat || null, lng: race.lng || null
    });
    if (inserted?.id) {
      race.id = inserted.id;
    } else {
      throw new Error('Race insert returned no id');
    }
  }
}

async function deleteRaceFromDB(raceId) {
  if (!state.user?.id || !raceId) return;
  try { await dbDelete('races', 'id=eq.'+raceId); } catch(e) { console.warn('Race delete error:', e); }
}

// Auto-login via saved session
(async function checkSession() {
  try {
    const session = await sbGetSession();
    if (session?.user) {
      document.getElementById('loadingScreen').style.display = 'none';
      await loadAndEnterApp(session.user);
    } else {
      document.getElementById('loadingScreen').style.display = 'none';
      document.getElementById('authPage').style.display = 'flex';
    }
  } catch(e) {
    localStorage.removeItem('sb_session');
    console.warn('Session check failed:', e);
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('authPage').style.display = 'flex';
  }
})();
const COUNTRY_MAP_DEFAULTS={
  us:{showUSMap:true,showNAMap:false,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  ca:{showUSMap:false,showNAMap:true,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  gb:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:true,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  eu:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:true,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  na:{showUSMap:false,showNAMap:true,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  sa:{showUSMap:false,showNAMap:false,showSAMap:true,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
  af:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:false,showAFMap:true,showASMap:false,showOCMap:false,showGlobe:true},
  as:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:true,showOCMap:false,showGlobe:true},
  oc:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:true,showGlobe:true},
  other:{showUSMap:false,showNAMap:false,showSAMap:false,showEUMap:false,showAFMap:false,showASMap:false,showOCMap:false,showGlobe:true},
};
function applyMapDefaults(c){
  const d=COUNTRY_MAP_DEFAULTS[c]||COUNTRY_MAP_DEFAULTS['other'];Object.assign(state,d);
  state.unit=(c==='us')?'mi':'km';
  ['Globe','USMap','NAMap','SAMap','EUMap','AFMap','ASMap','OCMap'].forEach(k=>{const el=document.getElementById('toggle'+k);if(el)el.checked=state['show'+k];});
}
function syncUnitUI(){
  const u=state.unit;
  const mi=document.getElementById('unitMi');const km=document.getElementById('unitKm');const lbl=document.getElementById('distanceLabel');
  if(mi)mi.classList.toggle('active',u==='mi');if(km)km.classList.toggle('active',u==='km');
  if(lbl)lbl.textContent=u==='mi'?'Miles run':'Kilometers run';
}
function syncMapDefaults(){if(state.country&&!state.mapsInitialized){applyMapDefaults(state.country);state.mapsInitialized=true;}}

function enterApp(){
  // Splash: show the animated rhino (transparent APNG) briefly, then dismiss.
  // APNG is an image, so there's no 'ended' event — we cap the display time.
  var splash = document.getElementById('splash');
  splash.style.display = 'flex';
  var splashDismissed = false;
  function dismissSplash(){
    if (splashDismissed) return;
    splashDismissed = true;
    splash.style.display = 'none';
  }
  setTimeout(dismissSplash, 2000); // how long the splash stays up, in ms

  document.getElementById('authPage').style.display='none';
  document.getElementById('appShell').classList.add('visible');
  const np=state.user.name.trim().split(' ');
  const initials=np.length>=2?(np[0][0]+np[np.length-1][0]).toUpperCase():np[0].slice(0,2).toUpperCase();
  document.getElementById('profileAvatar').textContent=initials;
  const firstName=state.user.name.trim().split(' ')[0];
  document.getElementById('topbarWelcome').textContent='Welcome back, '+firstName+'!';
  document.getElementById('profileName').textContent=state.user.name;
  document.getElementById('profileEmail').textContent=state.user.email;
  const mEl=document.getElementById('profileMemberSince');if(mEl)mEl.textContent=state.user.joinDate?'Member since '+state.user.joinDate:'';
  // Always start on home page
  showPage('pageHome');
  renderWeek();renderCalendar();renderHomeMonthly();renderRaceHistory();
  updateWeeklyTotal();renderStats();renderNews();renderAchievements();updateRaceDisplay();
  updateGlobe();updateUSMap();updateNAMap();updateSAMap();updateEUMap();updateAFMap();updateASMap();updateOCMap();
  initUnlockedAchievements();
}


// ===================== PAGES =====================
function showPage(id){
  // See blurActiveInput() in globals.js — prevents the iOS "Undo Typing" bug
  // by releasing any lingering focus/undo-manager state before navigating.
  blurActiveInput();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const m={pageHome:'navHome',pageCalendar:'navCalendar',pageCharity:'navCharity',pageSettings:'navSettings',pageNews:'navHome',pageAdvice:'navHome',pageRun:'navHome'};
  if(m[id])document.getElementById(m[id]).classList.add('active');
  if(id==='pageCalendar')renderCalendar();
  if(id==='pageNews')renderNews();
  if(id==='pageAchievements')renderAchievements();
  if(id==='pageRun'){
    const useKm=state.unit==='km';
    const du=document.getElementById('runDistUnit');
    const pu=document.getElementById('runPaceUnit');
    if(du) du.textContent=useKm?'km':'mi';
    if(pu) pu.textContent=useKm?'/ km':'/ mi';
    // Show GPS permission explanation on first ever visit to the Run page
    if(!hasSeenGpsPrompt()) {
      setTimeout(()=>openModal('gpsPermModal'), 400);
    }
  }
  if(id==='pageSettings') { renderSubSettings(); renderGpsSettings(); }
}

// ===================== UNIT =====================
function setUnit(u){state.unit=u;debouncedSaveProfile();syncUnitUI();renderWeek();renderCalendar();renderHomeMonthly();renderRaceHistory();updateWeeklyTotal();renderStats();}
function displayDist(m){if(state.unit==='km')return(m*1.60934).toFixed(1)+' km';return m.toFixed(1)+' mi';}
