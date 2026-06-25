// ===================== ACHIEVEMENTS =====================
const ACHIEVEMENTS=[
  {id:'run10mi',label:'10 mile run',desc:'Complete a single run of 10 miles',icon:'🏃',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/10milerun.png',check:runs=>Object.values(runs).some(r=>r.type==='run'&&r.miles>=10)},
  {id:'run20km',label:'20 km run',desc:'Complete a single run of 20 km (12.4 mi)',icon:'🏃',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/20krun.png',check:runs=>Object.values(runs).some(r=>r.type==='run'&&r.miles>=12.427)},
  {id:'run20mi',label:'20 mile run',desc:'Complete a single run of 20 miles',icon:'🏃',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/20milerun.png',check:runs=>Object.values(runs).some(r=>r.type==='run'&&r.miles>=20)},
  {id:'run35km',label:'35 km run',desc:'Complete a single run of 35 km (21.7 mi)',icon:'🏃',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/35krun.png',check:runs=>Object.values(runs).some(r=>r.type==='run'&&r.miles>=21.748)},
  {id:'week30mi',label:'30 miles in a week',desc:'Log 30 miles in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/30milesinaweek.png',check:runs=>checkWeeklyMiles(runs,30)},
  {id:'week60km',label:'60 km in a week',desc:'Log 60 km in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/60kinaweek.png',check:runs=>checkWeeklyMiles(runs,37.282)},
  {id:'week40mi',label:'40 miles in a week',desc:'Log 40 miles in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/40milesinaweek.png',check:runs=>checkWeeklyMiles(runs,40)},
  {id:'week75km',label:'75 km in a week',desc:'Log 75 km in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/75kinaweek.png',check:runs=>checkWeeklyMiles(runs,46.603)},
  {id:'week50mi',label:'50 miles in a week',desc:'Log 50 miles in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/50milesinaweek.png',check:runs=>checkWeeklyMiles(runs,50)},
  {id:'week90km',label:'90 km in a week',desc:'Log 90 km in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/90kinaweek.png',check:runs=>checkWeeklyMiles(runs,55.923)},
  {id:'week60mi',label:'60 miles in a week',desc:'Log 60 miles in a calendar week',icon:'📅',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/60milesinaweek.png',check:runs=>checkWeeklyMiles(runs,60)},
  {id:'month100mi',label:'100 miles in a month',desc:'Log 100 miles in a calendar month',icon:'🗓️',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/100milesinamonth.png',check:runs=>checkMonthlyMiles(runs,100)},
  {id:'month250km',label:'250 km in a month',desc:'Log 250 km in a calendar month',icon:'🗓️',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/250kinamonth.png',check:runs=>checkMonthlyMiles(runs,155.343)},
  {id:'month200mi',label:'200 miles in a month',desc:'Log 200 miles in a calendar month',icon:'🗓️',trophyImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/trophies/200milesinamonth.png',check:runs=>checkMonthlyMiles(runs,200)},
];
function checkWeeklyMiles(runs,target){const weeks={};Object.entries(runs).forEach(([key,run])=>{if(run.type!=='run'||!run.miles)return;const d=new Date(key+'T00:00:00');const dow=(d.getDay()+6)%7;const mon=new Date(d);mon.setDate(d.getDate()-dow);const wk=dateKey(mon);weeks[wk]=(weeks[wk]||0)+run.miles;});return Object.values(weeks).some(t=>t>=target);}
function checkMonthlyMiles(runs,target){const months={};Object.entries(runs).forEach(([key,run])=>{if(run.type!=='run'||!run.miles)return;const mk=key.slice(0,7);months[mk]=(months[mk]||0)+run.miles;});return Object.values(months).some(t=>t>=target);}
function renderAchievements(){
  const earned=ACHIEVEMENTS.filter(a=>a.check(state.runs));
  const hEl=document.getElementById('homeAchievements');const aEl=document.getElementById('allAchievementsList');
  if(hEl){
    if(earned.length===0){hEl.innerHTML='<p style="font-size:14px;color:var(--text-muted);text-align:center;padding:1rem 0;font-style:italic;">The journey begins....</p>';}
    else{hEl.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">'+earned.map(a=>{
      const inner=a.trophyImg
        ?`<img src="${a.trophyImg}" style="width:44px;height:44px;object-fit:contain;">`
        :`<span style="font-size:26px;">${a.icon}</span>`;
      return`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:64px;"><div style="width:56px;height:56px;background:var(--navy-light);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);">${inner}</div><div style="font-size:9px;font-weight:600;color:var(--navy);text-align:center;line-height:1.2;">${a.label}</div></div>`;
    }).join('')+'</div>';}
  }
  if(aEl){aEl.innerHTML=ACHIEVEMENTS.map(a=>{
    const ie=a.check(state.runs);
    const inner=ie&&a.trophyImg
      ?`<img src="${a.trophyImg}" style="width:36px;height:36px;object-fit:contain;">`
      :`<span style="font-size:22px;">${ie?a.icon:'🔒'}</span>`;
    return`<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);opacity:${ie?'1':'0.45'};"><div style="width:48px;height:48px;background:${ie?'var(--navy-light)':'#f0f0f0'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${inner}</div><div style="flex:1;"><div style="font-size:14px;font-weight:${ie?'700':'500'};color:${ie?'var(--navy-deeper)':'var(--text-muted)'};">${a.label}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${a.desc}</div></div>${ie?'<div style="font-size:18px;">✅</div>':''}</div>`;
  }).join('');}
}

// ===================== WEEKLY TOTAL & STATS =====================
function updateWeeklyTotal(){
  const mon=getMondayOfWeek(today);let total=0;
  for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);const run=state.runs[dateKey(d)];if(run&&run.type==='run')total+=run.miles;}
  const el=document.getElementById('weeklyTotalVal');if(!el)return;
  el.textContent=state.unit==='km'?(total*1.60934).toFixed(1)+' km':total.toFixed(1)+' mi';
}
function renderStats(){
  const grid=document.getElementById('statsGrid');if(!grid)return;
  const allRuns=Object.values(state.runs).filter(r=>r.type==='run'&&r.miles>0);
  const allKeys=Object.keys(state.runs).sort();
  const totalMiles=allRuns.reduce((s,r)=>s+r.miles,0);
  const longest=allRuns.length?Math.max(...allRuns.map(r=>r.miles)):0;
  const totalRuns=allRuns.length;
  const monthTotals={};Object.entries(state.runs).forEach(([key,run])=>{if(run.type==='run'&&run.miles>0){const mk=key.slice(0,7);monthTotals[mk]=(monthTotals[mk]||0)+run.miles;}});
  const bestMonth=Object.values(monthTotals).length>0?Math.max(...Object.values(monthTotals)):0;
  let longestStreak=0,cs=0,prevDate=null;
  allKeys.forEach(key=>{const run=state.runs[key];if(run&&run.type==='run'&&run.miles>0){if(prevDate){const prev=new Date(prevDate+'T00:00:00');const curr=new Date(key+'T00:00:00');const diff=(curr-prev)/86400000;cs=diff===1?cs+1:1;}else{cs=1;}longestStreak=Math.max(longestStreak,cs);prevDate=key;}else{prevDate=null;cs=0;}});
  const avgRun=totalRuns>0?totalMiles/totalRuns:0;
  const totalRaces=state.raceHistory.length;
  let bestTime=null;state.raceHistory.forEach(r=>{if(r.time){const pts=r.time.split(':').map(Number);let secs=0;if(pts.length===3)secs=pts[0]*3600+pts[1]*60+pts[2];else if(pts.length===2)secs=pts[0]*3600+pts[1]*60;if(secs>0&&(!bestTime||secs<bestTime.secs))bestTime={secs,str:r.time};}});
  const fmt=m=>state.unit==='km'?(m*1.60934).toFixed(1)+' km':m.toFixed(1)+' mi';
  const stats=[{label:'Total distance',value:fmt(totalMiles),icon:'🏃',roadImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Road.png'},{label:'Longest run',value:longest>0?fmt(longest):'—',icon:'📏',mapImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Map.png'},{label:'Total runs',value:totalRuns,icon:'📅',shoeImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Shoe.png'},{label:'Avg run distance',value:avgRun>0?fmt(avgRun):'—',icon:'📊',rulerImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Ruler.png'},{label:'Longest streak',value:longestStreak>0?longestStreak+' days':'—',icon:'🔥',fireImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Fire.png'},{label:'Highest monthly distance',value:bestMonth>0?fmt(bestMonth):'—',icon:'📆',calendarImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Calendar.png'},{label:'Races completed',value:totalRaces,icon:'🏅',medalImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Medal.png'},{label:'Best race time',value:bestTime?bestTime.str:'—',icon:'⏱️',stopwatchImg:'https://ubxifthikgtekxilbswp.supabase.co/storage/v1/object/public/stats-icons/Stopwatch.png'},];
  grid.innerHTML=stats.map(s=>{
    const imgSrc = s.fireImg || s.roadImg || s.medalImg || s.calendarImg || s.stopwatchImg || s.mapImg || s.rulerImg || s.shoeImg;
    const imgHeight = s.rulerImg ? '18px' : '28px';
    const icon = imgSrc
      ? `<img src="${imgSrc}" style="height:${imgHeight};width:auto;object-fit:contain;vertical-align:middle;">`
      : s.icon;
    return `<div style="background:var(--navy-light);border-radius:var(--radius-sm);padding:12px;"><div style="font-size:20px;margin-bottom:4px;">${icon}</div><div style="font-size:16px;font-weight:800;color:var(--navy);line-height:1.1;">${s.value}</div><div style="font-size:12px;font-weight:700;color:var(--navy-dark);margin-top:3px;">${s.label}</div></div>`;
  }).join('');
}
