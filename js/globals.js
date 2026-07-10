// ===================== ADMIN =====================
const ADMIN_EMAIL = 'sdale255@gmail.com';
function isAdmin() { return state.user?.email === ADMIN_EMAIL; }

// ===================== STATE =====================
let state = {
  user:null, unit:'mi', showGlobe:false, showPace:true,
  showUSMap:false, showNAMap:false, showSAMap:false,
  showEUMap:false, showAFMap:false, showASMap:false, showOCMap:false,
  country:null, mapsInitialized:false,
  nextRace:null, runs:{}, raceHistory:[],
  calYear:new Date().getFullYear(), calMonth:new Date().getMonth(),
  activeDayKey:null, activePhotoRaceIdx:null
};

// Debounce helper for auto-saves
function debounce(fn, delay) {
  let t; return function(...args) { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// iOS WKWebView keeps its text-editing "undo manager" attached to whichever
// input/textarea was last focused (e.g. the login/password fields), even
// after that field is hidden. If the page keeps mutating the DOM afterward
// (like the Run Tracker's live timer, ticking every second), WebKit can
// misattribute those unrelated changes to the stale editing session and
// periodically pop up the system "Undo Typing" bubble. Explicitly blurring
// the active element breaks that stale link. Call this after any form
// submission and before starting any long-running interval-based UI update.
function blurActiveInput() {
  const el = document.activeElement;
  if (el && el !== document.body && typeof el.blur === 'function') el.blur();
}
const today=new Date(); today.setHours(0,0,0,0);

function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function getMondayOfWeek(d){const day=d.getDay();const diff=(day+6)%7;const mon=new Date(d);mon.setDate(d.getDate()-diff);mon.setHours(0,0,0,0);return mon;}
function formatDateShort(d){return(d.getMonth()+1)+'/'+d.getDate();}
function daysBetween(a,b){return Math.round((b-a)/86400000);}
