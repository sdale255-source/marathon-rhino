// ===================== RUN TRACKER =====================
let runState = {
  status: 'idle',       // idle | running | paused
  startTime: null,
  pausedMs: 0,
  pauseStart: null,
  timerInterval: null,
  watchId: null,
  coords: [],           // [{lat,lng,ts}]
  totalDistMeters: 0,
  lastPos: null,
  photoBlob: null,      // compressed photo taken during this run (one per run)
  photoPreviewUrl: null // local object URL used for the on-screen preview
};

const MARATHON_METERS = 42195;

// Max GPS accuracy (in metres) we'll trust for COUNTING distance.
// iPhone Safari frequently reports 40-65 m indoors and for the first
// several seconds of a run, so keep this generous or distance never moves.
const GPS_ACCURACY_LIMIT = 50;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function formatMS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function getElapsedSeconds() {
  if (!runState.startTime) return 0;
  const now = runState.status === 'paused' ? runState.pauseStart : Date.now();
  return Math.floor((now - runState.startTime - runState.pausedMs) / 1000);
}

function updateRunDisplay() {
  const elapsed = getElapsedSeconds();
  document.getElementById('runTimer').textContent = formatHMS(elapsed);

  const dist = runState.totalDistMeters;
  const useKm = state.unit === 'km';
  const displayDist = useKm ? dist / 1000 : dist / 1609.344;
  document.getElementById('runDistance').textContent = displayDist.toFixed(2);
  document.getElementById('runDistUnit').textContent = useKm ? 'km' : 'mi';
  document.getElementById('runPaceUnit').textContent = useKm ? '/ km' : '/ mi';

  if (elapsed > 5 && displayDist > 0.01) {
    // pace = min per unit
    const paceSecPerUnit = elapsed / displayDist;
    document.getElementById('runPace').textContent = formatMS(paceSecPerUnit);
    // marathon projection
    const unitDist = useKm ? MARATHON_METERS / 1000 : MARATHON_METERS / 1609.344;
    const marathonSecs = paceSecPerUnit * unitDist;
    document.getElementById('runMarathon').textContent = formatHMS(marathonSecs);
  } else {
    document.getElementById('runPace').textContent = '--:--';
    document.getElementById('runMarathon').textContent = '--:--:--';
  }
}

// ── GPS permission helpers ────────────────────────────────────────────────
const GPS_PERM_KEY = 'mrh_gps_perm'; // localStorage key

function hasSeenGpsPrompt() {
  // Only treat as "seen" if the user actively chose to allow —
  // a 'denied' value (from the device-level block) or no value means show again
  return localStorage.getItem(GPS_PERM_KEY) === 'granted';
}

function markGpsPromptSeen(granted) {
  localStorage.setItem(GPS_PERM_KEY, granted ? 'granted' : 'denied');
}

// Called when user taps "Allow GPS Tracking" in our modal
function gpsPermAllow() {
  closeModal('gpsPermModal');
  // Don't pre-mark as granted — wait for the browser to actually confirm
  _requestAndStartGPS(() => {
    renderGpsSettings();
    if (typeof runState._onGpsGranted === 'function') {
      runState._onGpsGranted();
      runState._onGpsGranted = null;
    }
  });
}

// Called when user taps "Not now"
function gpsPermDeny() {
  closeModal('gpsPermModal');
  // Do NOT save to localStorage — prompt will appear again next visit
  setGpsStatus('dot-grey', 'GPS not enabled — tap Start Run to be asked again');
}

// Show our custom prompt only on first visit; afterwards go straight to GPS
function maybeShowGpsPrompt(onGranted) {
  if (!navigator.geolocation) {
    setGpsStatus('dot-red', 'GPS not supported on this device');
    return;
  }
  if (hasSeenGpsPrompt()) {
    // Already answered — go straight to GPS
    _requestAndStartGPS(onGranted);
  } else {
    // First time — show our friendly explanation first
    openModal('gpsPermModal');
    // Store the callback so gpsPermAllow() can continue
    runState._onGpsGranted = onGranted;
  }
}

// Probe with getCurrentPosition to force the browser permission dialog,
// then hand off to watchPosition
function _requestAndStartGPS(onGranted) {
  setGpsStatus('dot-grey', 'Acquiring GPS…');
  navigator.geolocation.getCurrentPosition(
    () => {
      // Browser has granted permission — now start the watcher
      markGpsPromptSeen(true);
      startGPS();
      if (typeof onGranted === 'function') onGranted();
      // Only fire _onGpsGranted if onGranted didn't already handle it
      if (typeof runState._onGpsGranted === 'function' && typeof onGranted !== 'function') {
        runState._onGpsGranted();
        runState._onGpsGranted = null;
      }
    },
    (err) => {
      markGpsPromptSeen(false);
      if (err.code === 1) { // PERMISSION_DENIED
        setGpsStatus('dot-red', 'Location denied — enable in device Settings');
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        setGpsStatus('dot-red', 'GPS signal unavailable — try outdoors');
      } else { // TIMEOUT or unknown
        setGpsStatus('dot-red', 'GPS timeout — retrying…');
        // Retry once after 3 s
        setTimeout(() => _requestAndStartGPS(onGranted), 3000);
      }
      renderGpsSettings();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function setGpsStatus(dotClass, text) {
  const dot  = document.getElementById('gpsDot');
  const label = document.getElementById('gpsText');
  if (!dot || !label) return;
  const colours = { 'dot-grey':'rgba(255,255,255,0.5)', 'dot-green':'#4cff91', 'dot-red':'#ff4444', 'dot-amber':'#ffcc00' };
  dot.style.background = colours[dotClass] || colours['dot-grey'];
  label.textContent = text;
}

function startGPS() {
  if (!navigator.geolocation) { setGpsStatus('dot-red', 'GPS not supported'); return; }
  setGpsStatus('dot-grey', 'Acquiring GPS…');

  runState.watchId = navigator.geolocation.watchPosition(
    (pos) => {
      _gpsLastFixAt = Date.now(); // watchdog: GPS is still alive
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      const acc = accuracy || 0;

      // Show the real accuracy so it's obvious what the GPS is doing.
      const accTxt = acc ? ` (±${Math.round(acc)}m)` : '';
      if (acc && acc > GPS_ACCURACY_LIMIT) {
        setGpsStatus('dot-amber', `GPS warming up…${accTxt}`);
      } else {
        setGpsStatus('dot-green', `GPS locked ✓${accTxt}`);
      }

      if (runState.status !== 'running') return;

      // Always seed / update lastPos, even for weak fixes, so that once
      // accuracy improves we already have a reference point to measure from.
      if (!runState.lastPos) {
        runState.lastPos = { lat, lng, ts: pos.timestamp, acc };
        return;
      }

      // Only ACCUMULATE distance from reasonably accurate fixes.
      if (acc && acc > GPS_ACCURACY_LIMIT) {
        runState.lastPos = { lat, lng, ts: pos.timestamp, acc };
        return;
      }

      const d = haversineMeters(runState.lastPos.lat, runState.lastPos.lng, lat, lng);
      const dt = (pos.timestamp - runState.lastPos.ts) / 1000;

      // Ignore sub-2 m GPS jitter while essentially stationary, and reject
      // impossible teleports (> 50 m in under 3 s).
      if (d >= 2 && (d < 50 || dt > 3)) {
        runState.totalDistMeters += d;
      }

      runState.lastPos = { lat, lng, ts: pos.timestamp, acc };
    },
    (err) => {
      if (err.code === 1) {
        setGpsStatus('dot-red', 'Location denied — check device Settings');
      } else {
        setGpsStatus('dot-amber', 'GPS signal weak…');
      }
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
  );
}

function stopGPS() {
  if (runState.watchId !== null) {
    navigator.geolocation.clearWatch(runState.watchId);
    runState.watchId = null;
  }
}

// ── Keeping GPS alive during a run ───────────────────────────────────────
// iPhones suspend a web page's GPS when the screen locks or the page goes to
// the background (e.g. while the camera is open for a run photo), and often
// never restart it. Three safeguards:
//   1. Keep the screen awake during a run (Screen Wake Lock), so it doesn't lock.
//   2. Restart the GPS watcher whenever the app comes back to the front.
//   3. A watchdog that restarts GPS if no location update arrives for 20 s.
let _gpsLastFixAt = 0;
let _gpsWatchdog = null;
let _wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && !_wakeLock && document.visibilityState === 'visible') {
      _wakeLock = await navigator.wakeLock.request('screen');
      _wakeLock.addEventListener('release', () => { _wakeLock = null; });
    }
  } catch (e) { console.warn('Screen wake lock not available:', e.message); }
}

function releaseWakeLock() {
  if (_wakeLock) { _wakeLock.release().catch(() => {}); _wakeLock = null; }
}

// Only restarts a watcher that was already running (so we never skip the
// permission prompt for someone who hasn't allowed GPS yet).
function restartGPS(reason) {
  if (runState.watchId === null || isGpsDisabledByUser()) return;
  console.log('Restarting GPS:', reason);
  stopGPS();
  _gpsLastFixAt = Date.now();
  startGPS();
}

function startGpsWatchdog() {
  clearInterval(_gpsWatchdog);
  _gpsLastFixAt = Date.now();
  _gpsWatchdog = setInterval(() => {
    if (runState.status !== 'running' || runState.watchId === null) return;
    if (Date.now() - _gpsLastFixAt > 20000) {
      setGpsStatus('dot-amber', 'Reconnecting GPS…');
      restartGPS('no location update for 20s');
    }
  }, 5000);
}

function stopGpsWatchdog() {
  clearInterval(_gpsWatchdog);
  _gpsWatchdog = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || runState.status === 'idle') return;
  requestWakeLock(); // iOS drops the wake lock whenever the page is hidden
  if (runState.status === 'running') restartGPS('app returned to the foreground');
});

// ── GPS Settings page helpers ─────────────────────────────────────────────
const GPS_DISABLED_KEY = 'mrh_gps_disabled';

function isGpsDisabledByUser() {
  return localStorage.getItem(GPS_DISABLED_KEY) === 'true';
}

function renderGpsSettings() {
  const badge      = document.getElementById('gpsSettingBadge');
  const statusText = document.getElementById('gpsSettingStatusText');
  const toggle     = document.getElementById('gpsEnabledToggle');
  if (!badge || !statusText || !toggle) return;

  const permValue  = localStorage.getItem(GPS_PERM_KEY);   // 'granted'|'denied'|null
  const disabled   = isGpsDisabledByUser();

  // Toggle reflects whether the user has GPS enabled
  toggle.checked = !disabled && permValue === 'granted';

  // Badge + description
  if (!navigator.geolocation) {
    badge.textContent = 'Not supported';
    badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#f0f0f0;color:#888;';
    statusText.textContent = 'GPS is not available on this device or browser.';
  } else if (disabled) {
    badge.textContent = 'Disabled';
    badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#fff3cd;color:#856404;';
    statusText.textContent = 'GPS tracking is turned off. Toggle to re-enable.';
  } else if (permValue === 'granted') {
    badge.textContent = 'Allowed ✓';
    badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#e8f5e8;color:#2d7a2d;';
    statusText.textContent = 'Location access is granted. GPS will activate when you start a run.';
  } else if (permValue === 'denied') {
    badge.textContent = 'Denied';
    badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#fde8e8;color:#c0392b;';
    statusText.textContent = 'Location access was denied. Tap the button below to request again, or enable it in your device Settings.';
  } else {
    badge.textContent = 'Not yet set';
    badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--navy-light);color:var(--navy);';
    statusText.textContent = 'You haven\'t been asked yet — go to the Run page to set up GPS.';
  }

  // Use the Permissions API if available for live state (Chrome/Android)
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        markGpsPromptSeen(true);
        if (!disabled) {
          badge.textContent = 'Allowed ✓';
          badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#e8f5e8;color:#2d7a2d;';
          statusText.textContent = 'Location access is granted. GPS will activate when you start a run.';
          toggle.checked = true;
        }
      } else if (result.state === 'denied') {
        markGpsPromptSeen(false);
        badge.textContent = 'Denied';
        badge.style.cssText = 'font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#fde8e8;color:#c0392b;';
        statusText.textContent = 'Location blocked by your browser. Enable it in device Settings → Privacy → Location.';
        toggle.checked = false;
      }
    }).catch(() => {});
  }
}

function onGpsToggleChange(enabled) {
  if (enabled) {
    localStorage.removeItem(GPS_DISABLED_KEY);
    // If they never granted before, kick off the permission flow
    if (localStorage.getItem(GPS_PERM_KEY) !== 'granted') {
      _requestAndStartGPS(() => { stopGPS(); renderGpsSettings(); });
    }
  } else {
    localStorage.setItem(GPS_DISABLED_KEY, 'true');
    stopGPS();
  }
  renderGpsSettings();
}

function resetGpsPermission() {
  // Clear our stored answer so the prompt shows again on next Run page visit
  localStorage.removeItem(GPS_PERM_KEY);
  localStorage.removeItem(GPS_DISABLED_KEY);
  document.getElementById('gpsEnabledToggle').checked = false;
  // Try to trigger the native browser dialog immediately
  _requestAndStartGPS(() => {
    stopGPS();   // don't keep watcher open just from settings
    renderGpsSettings();
  });
  renderGpsSettings();
}

function handleRunBtn() {
  const btn = document.getElementById('runMainBtn');
  const stopBtn = document.getElementById('runStopBtn');

  if (runState.status === 'idle') {
    // START — request GPS permission first if needed
    // Belt-and-suspenders fix for the iOS "Undo Typing" popup: make sure no
    // input is focused before we start the once-a-second display updates.
    // See blurActiveInput() in globals.js for the full explanation.
    blurActiveInput();
    runState.status = 'running';
    runState.startTime = Date.now();
    runState.pausedMs = 0;
    runState.totalDistMeters = 0;
    runState.lastPos = null;
    runState.timerInterval = setInterval(updateRunDisplay, 1000);
    btn.textContent = 'Pause';
    btn.style.background = 'rgba(255,255,255,0.9)';
    stopBtn.style.display = 'block';
    renderRunPhotoUI();
    requestWakeLock();     // keep the screen on so iOS doesn't suspend GPS
    startGpsWatchdog();
    // Permission-aware GPS start — skip if user disabled GPS in Settings
    if (!isGpsDisabledByUser()) {
      maybeShowGpsPrompt();
    } else {
      setGpsStatus('dot-grey', 'GPS disabled — enable in Settings');
    }

  } else if (runState.status === 'running') {
    // PAUSE
    runState.status = 'paused';
    runState.pauseStart = Date.now();
    clearInterval(runState.timerInterval);
    btn.textContent = 'Resume';
    btn.style.background = '#fff';
    setGpsStatus('dot-amber', 'Paused');

  } else if (runState.status === 'paused') {
    // RESUME
    runState.pausedMs += Date.now() - runState.pauseStart;
    runState.status = 'running';
    runState.timerInterval = setInterval(updateRunDisplay, 1000);
    btn.textContent = 'Pause';
    // Measure from the first fix after resuming — don't count ground covered while paused
    runState.lastPos = null;
    _gpsLastFixAt = Date.now();
    requestWakeLock();
    // Re-lock GPS (restart the watcher in case iOS silently dropped it)
    if (isGpsDisabledByUser()) { /* GPS turned off in Settings */ }
    else if (runState.watchId === null) startGPS();
    else restartGPS('run resumed');
  }
}

function confirmStopRun() {
  // Pause the run while the user decides
  if (runState.status === 'running') {
    runState.status = 'paused';
    runState.pauseStart = Date.now();
    clearInterval(runState.timerInterval);
    document.getElementById('runMainBtn').textContent = 'Resume';
  }
  // Populate the summary in the modal
  const elapsed = getElapsedSeconds();
  const dist = runState.totalDistMeters;
  const useKm = state.unit === 'km';
  const displayDist = useKm ? dist / 1000 : dist / 1609.344;
  document.getElementById('finishRunTime').textContent = formatHMS(elapsed);
  document.getElementById('finishRunDist').textContent = displayDist.toFixed(2) + ' ' + (useKm ? 'km' : 'mi');
  openModal('finishRunModal');
}

async function saveAndFinishRun() {
  closeModal('finishRunModal');
  const elapsed = getElapsedSeconds();
  const dist = runState.totalDistMeters;
  const miles = dist / 1609.344;
  const photoBlob = runState.photoBlob;

  // Save to today's run log — this feeds both the weekly grid and monthly calendar
  if (miles > 0.01) {
    const key = dateKey(new Date());
    const prev = state.runs[key];
    const run = {
      type: 'run',
      miles: Math.round(miles * 100) / 100,
      minutes: Math.round(elapsed / 60)
    };

    // Upload the run photo first (if one was taken), so the run row can point to it
    let newPhotoPath = null;
    let photoError = null;
    if (photoBlob) {
      setRunSavingUI(true);
      const ext = photoBlob.type === 'image/png' ? 'png' : photoBlob.type === 'image/heic' ? 'heic' : 'jpg';
      const path = `${state.user.id}/runs/${key}_${Date.now()}.${ext}`;
      try {
        await sbUploadFile('race-photos', path, photoBlob);
        newPhotoPath = path;
      } catch (e) {
        photoError = e.message;
        console.error('Run photo upload error:', e.message);
      }
    }

    // One photo per day: a new photo replaces the old one; a run with no photo
    // keeps any photo already saved earlier the same day.
    if (newPhotoPath) run.photoPath = newPhotoPath;
    else if (prev && prev.photoPath) run.photoPath = prev.photoPath;

    state.runs[key] = run;
    const saved = await saveRunToDB(key, run);

    if (newPhotoPath) {
      if (saved) {
        // Clean up the replaced photo (best-effort)
        if (prev && prev.photoPath && prev.photoPath !== newPhotoPath) sbDeleteFile('race-photos', prev.photoPath);
      } else {
        // The run row didn't save, so the photo has nothing pointing to it — roll back
        sbDeleteFile('race-photos', newPhotoPath);
        if (prev && prev.photoPath) run.photoPath = prev.photoPath; else delete run.photoPath;
        photoError = 'the run could not be saved to the server';
      }
    }
    setRunSavingUI(false);
    if (photoError) {
      alert("Your run photo couldn't be saved — check your connection and try again.\n(" + photoError + ')');
    }

    // Refresh all views that display run data
    renderWeek();
    renderCalendar();
    renderHomeMonthly();
    updateWeeklyTotal();
    renderStats();
    renderAchievements();
    checkForNewAchievements();
  }

  resetRunTracker();
  showPage('pageHome');
}

function stopRunAndGoHome() {
  resetRunTracker();
  showPage('pageHome');
}

function resetRunTracker() {
  clearInterval(runState.timerInterval);
  stopGPS();
  stopGpsWatchdog();
  releaseWakeLock();
  if (runState.photoPreviewUrl) URL.revokeObjectURL(runState.photoPreviewUrl);
  runState = { status:'idle', startTime:null, pausedMs:0, pauseStart:null, timerInterval:null, watchId:null, coords:[], totalDistMeters:0, lastPos:null, photoBlob:null, photoPreviewUrl:null };
  renderRunPhotoUI();
  document.getElementById('runTimer').textContent = '00:00:00';
  document.getElementById('runDistance').textContent = '0.00';
  document.getElementById('runPace').textContent = '--:--';
  document.getElementById('runMarathon').textContent = '--:--:--';
  document.getElementById('runMainBtn').textContent = 'Start Run';
  document.getElementById('runMainBtn').style.background = '#fff';
  document.getElementById('runStopBtn').style.display = 'none';
  setGpsStatus('dot-grey', 'Waiting for GPS…');
}

// ── Run photo (one photo per run) ─────────────────────────────────────────
// The photo is kept on the phone (compressed) until the run is finished, then
// uploaded to the private 'race-photos' bucket under <userId>/runs/. If the run
// is discarded, nothing is uploaded.

function takeRunPhoto() {
  if (runState.status === 'idle') return;
  const input = document.getElementById('runPhotoInput');
  if (!input) return;
  input.value = '';
  input.click();
}

async function handleRunPhoto(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file || runState.status === 'idle') return;
  const btn = document.getElementById('runPhotoBtn');
  if (btn) { btn.textContent = 'Processing photo…'; btn.disabled = true; }
  const blob = await compressRunPhoto(file);
  if (runState.status === 'idle') return; // run was ended while processing
  if (runState.photoPreviewUrl) URL.revokeObjectURL(runState.photoPreviewUrl);
  runState.photoBlob = blob;
  runState.photoPreviewUrl = URL.createObjectURL(blob);
  if (btn) btn.disabled = false;
  renderRunPhotoUI();
}

function clearRunPhoto() {
  if (runState.photoPreviewUrl) URL.revokeObjectURL(runState.photoPreviewUrl);
  runState.photoBlob = null;
  runState.photoPreviewUrl = null;
  renderRunPhotoUI();
}

// Shrinks a camera photo (often 3–8 MB) to max 1600px / JPEG so it uploads fast.
// If the browser can't decode the image, the original file is used as-is.
function compressRunPhoto(file, maxDim = 1600, quality = 0.82) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(b => resolve(b || file), 'image/jpeg', quality);
      } catch (e) { URL.revokeObjectURL(url); resolve(file); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// Shows/hides the photo button and preview depending on run status
function renderRunPhotoUI() {
  const area    = document.getElementById('runPhotoArea');
  const btn     = document.getElementById('runPhotoBtn');
  const preview = document.getElementById('runPhotoPreview');
  const thumb   = document.getElementById('runPhotoThumb');
  if (!area || !btn || !preview || !thumb) return;
  area.style.display = runState.status === 'idle' ? 'none' : 'block';
  if (runState.photoPreviewUrl) {
    thumb.src = runState.photoPreviewUrl;
    preview.style.display = 'flex';
    btn.style.display = 'none';
  } else {
    thumb.removeAttribute('src');
    preview.style.display = 'none';
    btn.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '📷 Take a photo from my run';
  }
}

// Locks the tracker buttons while the photo uploads at the end of a run
function setRunSavingUI(saving) {
  const main = document.getElementById('runMainBtn');
  const stop = document.getElementById('runStopBtn');
  const area = document.getElementById('runPhotoArea');
  if (main) { main.disabled = saving; if (saving) main.textContent = 'Saving your run…'; }
  if (stop) stop.disabled = saving;
  if (area) area.style.pointerEvents = saving ? 'none' : '';
}

// Update run page unit labels when navigating to it
// (handled inside showPage via the pageRun check already in nav map)

// ===================== ACHIEVEMENT UNLOCK POPUP =====================
// Tracks how many times each achievement has been earned (id -> count).
// Count 0 -> 1 = first unlock (original popup). Count going up after that = repeat popup.
let achievementCounts = {};

function initUnlockedAchievements() {
  // Snapshot current counts on load, so existing achievements don't re-trigger
  achievementCounts = {};
  ACHIEVEMENTS.forEach(a => { achievementCounts[a.id] = a.count(state.runs); });
}

function checkForNewAchievements() {
  // Categories: single run (run*), weekly (week*), monthly (month*)
  const getCategory = id => id.startsWith('run') ? 'run' : id.startsWith('week') ? 'week' : 'month';

  // Find every achievement whose count went up, keeping only the highest one per category.
  // ACHIEVEMENTS array is ordered lowest→highest, so the last match per category wins.
  const topPerCategory = {};
  ACHIEVEMENTS.forEach(a => {
    const prev = achievementCounts[a.id] || 0;
    const now = a.count(state.runs);
    achievementCounts[a.id] = now;
    if (now > prev) topPerCategory[getCategory(a.id)] = { a, count: now, isRepeat: prev > 0 };
  });

  const toShow = Object.values(topPerCategory);
  if (toShow.length === 0) return;
  showAchievementPopup(toShow, 0);
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function showAchievementPopup(list, idx) {
  if (idx >= list.length) return;
  const { a, count, isRepeat } = list[idx];
  const imgEl = document.getElementById('achievementModalImg');
  if (a.trophyImg) {
    imgEl.innerHTML = `<img src="${a.trophyImg}" style="height:110px;width:auto;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.2));">`;
  } else {
    imgEl.innerHTML = `<span style="font-size:72px;">${a.icon}</span>`;
  }
  document.getElementById('achievementModalTitle').textContent = a.label;
  document.getElementById('achievementModalText').textContent = isRepeat
    ? `Congrats! You earned ${a.label} again. That's your ${ordinal(count)} time!`
    : `Congrats! New achievement unlocked, ${a.label}.`;
  const btn = document.querySelector('#achievementModal .btn-primary');
  btn.onclick = function() {
    closeModal('achievementModal');
    if (idx + 1 < list.length) {
      setTimeout(() => showAchievementPopup(list, idx + 1), 400);
    }
  };
  openModal('achievementModal');
}
