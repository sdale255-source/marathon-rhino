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
const today=new Date(); today.setHours(0,0,0,0);

function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function getMondayOfWeek(d){const day=d.getDay();const diff=(day+6)%7;const mon=new Date(d);mon.setDate(d.getDate()-diff);mon.setHours(0,0,0,0);return mon;}
function formatDateShort(d){return(d.getMonth()+1)+'/'+d.getDate();}
function daysBetween(a,b){return Math.round((b-a)/86400000);}

