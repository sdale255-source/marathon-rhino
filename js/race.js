// ===================== NEXT RACE =====================
function openRaceModal(){
  if(state.nextRace){
    document.getElementById('inputRaceName').value=state.nextRace.name||'';
    document.getElementById('inputRaceLocation').value=state.nextRace.location||'';
    document.getElementById('inputRaceDate').value=state.nextRace.date||'';
    const gm = state.nextRace.goalMins;
    const noGoalEl = document.getElementById('inputNoGoal');
    const hrsEl = document.getElementById('inputGoalHours');
    const minsEl = document.getElementById('inputGoalMins');
    if (gm) {
      if (hrsEl) hrsEl.value = Math.floor(gm/60);
      if (minsEl) minsEl.value = gm % 60;
      if (noGoalEl) noGoalEl.checked = false;
      toggleGoalInput(false);
    } else {
      if (hrsEl) hrsEl.value = '';
      if (minsEl) minsEl.value = '';
      if (noGoalEl) noGoalEl.checked = false;
      toggleGoalInput(false);
    }
  } else {
    // Reset form
    ['inputRaceName','inputRaceLocation','inputRaceDate','inputGoalHours','inputGoalMins'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    const noGoalEl=document.getElementById('inputNoGoal');
    if(noGoalEl) noGoalEl.checked=false;
    toggleGoalInput(false);
  }
  openModal('raceModal');
}
function toggleGoalInput(noGoal) {
  const hrs = document.getElementById('inputGoalHours');
  const mins = document.getElementById('inputGoalMins');
  if (hrs) hrs.disabled = noGoal;
  if (mins) mins.disabled = noGoal;
  if (noGoal) { if (hrs) hrs.value = ''; if (mins) mins.value = ''; }
}

function calcGoalPace(totalMins, unit) {
  // Marathon = 26.2 miles or 42.195 km
  const dist = unit === 'km' ? 42.195 : 26.2;
  const paceDecimal = totalMins / dist;
  const paceMins = Math.floor(paceDecimal);
  const paceSecs = Math.round((paceDecimal - paceMins) * 60);
  const unitLabel = unit === 'km' ? '/km' : '/mi';
  return `${paceMins}:${paceSecs.toString().padStart(2,'0')} min${unitLabel}`;
}

async function saveRace(){
  const name=document.getElementById('inputRaceName').value.trim();
  const location=document.getElementById('inputRaceLocation').value.trim();
  const date=document.getElementById('inputRaceDate').value;
  if(!name||!date)return;
  // Goal time
  const noGoal = document.getElementById('inputNoGoal')?.checked;
  const hrs = parseInt(document.getElementById('inputGoalHours')?.value || '0') || 0;
  const mins = parseInt(document.getElementById('inputGoalMins')?.value || '0') || 0;
  const goalMins = (!noGoal && (hrs > 0 || mins > 0)) ? hrs * 60 + mins : null;
  state.nextRace={name, location, date, goalMins};
  // Geocode the next race location
  const coords = await geocodeLocation(location, name);
  if(coords){ state.nextRace.lat=coords.lat; state.nextRace.lng=coords.lng; }
  debouncedSaveProfile();closeModal('raceModal');updateRaceDisplay();
}
function confirmClearRace(){
  state.nextRace=null;
  if(_nextRaceMap){_nextRaceMap.remove();_nextRaceMap=null;}
  document.getElementById('nextRaceMap').style.display='none';
  const goalEl=document.getElementById('dispGoalTime');
  if(goalEl) goalEl.style.display='none';
  debouncedSaveProfile();closeModal('clearRaceModal');updateRaceDisplay();
}
let _nextRaceMap = null;

function updateRaceDisplay(){
  const empty=document.getElementById('raceEmpty');const display=document.getElementById('raceDisplay');
  if(!state.nextRace){
    empty.style.display='flex';display.style.display='none';
    document.getElementById('nextRaceMap').style.display='none';
    return;
  }
  empty.style.display='none';display.style.display='block';
  document.getElementById('dispRaceName').textContent=state.nextRace.name;
  document.getElementById('dispRaceLocation').innerHTML='📍 '+(state.nextRace.location||'');
  const rd=new Date(state.nextRace.date+'T00:00:00');
  document.getElementById('dispCountdown').textContent=Math.max(0,daysBetween(today,rd));
  // Show goal time if set
  const goalEl = document.getElementById('dispGoalTime');
  const goalVal = document.getElementById('dispGoalTimeVal');
  const goalPace = document.getElementById('dispGoalPace');
  if (goalEl && state.nextRace?.goalMins) {
    const gm = state.nextRace.goalMins;
    const hrs = Math.floor(gm / 60);
    const mins = gm % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins.toString().padStart(2,'0')}m` : `${mins}m`;
    if (goalVal) goalVal.textContent = timeStr;
    if (goalPace) goalPace.textContent = calcGoalPace(gm, state.unit);
    goalEl.style.display = 'block';
  } else if (goalEl) {
    goalEl.style.display = 'none';
  }
  // Show map if we have coordinates
  renderNextRaceMap();
}

function renderNextRaceMap() {
  const mapEl = document.getElementById('nextRaceMap');
  const race = state.nextRace;
  if (!race || !race.lat || !race.lng) {
    mapEl.style.display = 'none';
    document.getElementById('dispCountdownBox').style.height = '120px';
    return;
  }
  mapEl.style.display = 'block';
  mapEl.style.height = '120px';
  document.getElementById('dispCountdownBox').style.height = '120px';
  // Destroy previous map instance if it exists
  if (_nextRaceMap) { _nextRaceMap.remove(); _nextRaceMap = null; }
  // Small delay to ensure the container is visible before initializing
  setTimeout(function() {
    try {
      _nextRaceMap = L.map('nextRaceMap', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false }).setView([race.lat, race.lng], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(_nextRaceMap);
      // Custom coloured pin marker
      const icon = L.divIcon({
        html: '<div style="width:20px;height:28px;position:relative;"><div style="width:20px;height:20px;background:#E8720C;border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div><div style="width:6px;height:6px;background:#fff;border-radius:50%;position:absolute;top:5px;left:5px;transform:rotate(0deg);"></div></div>',
        iconSize: [20,28], iconAnchor: [10,28], className: ''
      });
      L.marker([race.lat, race.lng], {icon}).addTo(_nextRaceMap).bindPopup(race.name);
    } catch(e) { console.warn('Map render error:', e.message); mapEl.style.display='none'; }
  }, 100);
}

// ===================== BRICKS =====================
function buildBricks(miles,brickH,gap,maxRows){
  const dv=state.unit==='km'?(miles*1.60934)/2:miles;
  const total=Math.min(dv,maxRows*2);const whole=Math.floor(total);const frac=parseFloat((total-whole).toFixed(2));
  const fullRows=Math.floor(whole/2);const rem=whole%2;let left=[],right=[];
  for(let i=0;i<fullRows;i++){left.push(1);right.push(1);}
  if(rem===1){left.push(1);right.push(0);}
  if(frac>0){if(rem===1){right[right.length-1]=frac;}else{left.push(frac);right.push(0);}}
  const col=c=>c.map(v=>{if(v===0)return`<div style="height:${brickH}px;flex-shrink:0;"></div>`;if(v===1)return`<div style="height:${brickH}px;border-radius:1px;background:var(--navy);flex-shrink:0;"></div>`;return`<div style="height:${brickH}px;border-radius:1px;background:var(--navy);opacity:${v};flex-shrink:0;"></div>`;}).join('');
  return`<div style="flex:1;display:flex;flex-direction:column-reverse;gap:${gap}px;">${col(left)}</div><div style="flex:1;display:flex;flex-direction:column-reverse;gap:${gap}px;">${col(right)}</div>`;
}

// ===================== WEEK =====================
function renderWeek(){
  const mon=getMondayOfWeek(today);const dn=['M','T','W','T','F','S','S'];let html='';
  for(let i=0;i<7;i++){
    const d=new Date(mon);d.setDate(mon.getDate()+i);const key=dateKey(d);const isToday=d.getTime()===today.getTime();const run=state.runs[key];
    html+=`<div class="day-box${isToday?' today':''}" onclick="openDayModal('${key}')"><div class="day-name">${dn[i]}</div><div class="day-date">${formatDateShort(d)}</div>`;
    if(run&&run.type==='run'&&run.miles>0){
      html+=`<div class="miles-label">${displayDist(run.miles)}</div>`;const rd=getRunDisplay(run);if(rd)html+=`<div style="font-size:9px;color:var(--text-muted);margin-bottom:2px;">${rd}</div>`;
      html+=`<div style="flex:1;display:flex;gap:3px;align-items:flex-end;min-height:70px;">${buildBricks(run.miles,7,2,15)}</div>`;
    }else if(run&&run.type==='rest'){html+=`<div class="rest-area"><span style="font-size:20px;">🌙</span><span>Rest</span></div>`;}
    else{html+=`<div class="empty-area">+</div>`;}
    html+=`</div>`;
  }
  document.getElementById('weekGrid').innerHTML=html;
}

// ===================== DAY MODAL =====================
function openDayModal(key){
  state.activeDayKey=key;const d=new Date(key+'T00:00:00');
  const dNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('dayModalTitle').textContent=dNames[d.getDay()]+', '+mNames[d.getMonth()]+' '+d.getDate();
  const run=state.runs[key];
  document.getElementById('inputMiles').value=(run&&run.type==='run')?run.miles:'';
  const rm=(run&&run.type==='run'&&run.minutes)?run.minutes:null;
  document.getElementById('inputHours').value=rm?Math.floor(rm/60):'';
  document.getElementById('inputMinutes').value=rm?Math.round(rm%60):'';
  document.getElementById('pacePreview').textContent='';
  document.getElementById('distanceLabel').textContent=state.unit==='mi'?'Miles run':'Kilometers run';
  updatePreview();openModal('dayModal');
}
function updatePreview(){
  const raw=parseFloat(document.getElementById('inputMiles').value);
  let miles=isNaN(raw)?0:raw;if(state.unit==='km')miles=miles/1.60934;
  const hrs=parseFloat(document.getElementById('inputHours').value)||0;const mins=parseFloat(document.getElementById('inputMinutes').value)||0;const tm=hrs*60+mins;
  const pEl=document.getElementById('pacePreview');
  if(pEl&&miles>0&&tm>0){const pace=calcPace(miles,tm);const time=formatTime(tm);pEl.textContent=pace?'Pace: '+pace+'  ·  Time: '+time:'';}else if(pEl){pEl.textContent='';}
  const prev=document.getElementById('brickPreview');
  if(miles<=0){prev.innerHTML='<span style="font-size:12px;color:var(--text-muted);">Enter distance to preview</span>';return;}
  prev.innerHTML=buildBricks(miles,8,2,15);
}
function saveDay(){
  const raw=parseFloat(document.getElementById('inputMiles').value);if(isNaN(raw)||raw<0)return;
  let miles=raw;if(state.unit==='km')miles=miles/1.60934;miles=Math.round(miles*10)/10;
  const hrs=parseFloat(document.getElementById('inputHours').value)||0;const mins=parseFloat(document.getElementById('inputMinutes').value)||0;
  const totalMinutes=hrs*60+mins||null;
  state.runs[state.activeDayKey]={type:'run',miles,minutes:totalMinutes};
  saveRunToDB(state.activeDayKey, state.runs[state.activeDayKey]);
  closeModal('dayModal');renderWeek();renderCalendar();renderHomeMonthly();syncMapDefaults();updateWeeklyTotal();renderStats();renderAchievements();
  checkForNewAchievements();
}
function saveRestDay(){state.runs[state.activeDayKey]={type:'rest',miles:0};saveRunToDB(state.activeDayKey,state.runs[state.activeDayKey]);closeModal('dayModal');renderWeek();renderCalendar();renderHomeMonthly();renderAchievements();syncMapDefaults();updateWeeklyTotal();renderStats();}
function clearDayEntry(){saveRunToDB(state.activeDayKey,null);delete state.runs[state.activeDayKey];closeModal('dayModal');renderWeek();renderCalendar();renderHomeMonthly();renderAchievements();syncMapDefaults();updateWeeklyTotal();renderStats();}

// ===================== CALENDAR =====================
function changeMonth(dir){state.calMonth+=dir;if(state.calMonth>11){state.calMonth=0;state.calYear++;}if(state.calMonth<0){state.calMonth=11;state.calYear--;}renderCalendar();}
function resetCalToToday(){state.calYear=today.getFullYear();state.calMonth=today.getMonth();renderCalendar();}
function renderCalendar(){
  const mN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dows=['M','T','W','T','F','S','S'];const nowMo=today.getMonth(),nowYr=today.getFullYear();
  [-1,0,1].forEach((offset,idx)=>{
    let mo=state.calMonth+offset;let yr=state.calYear;
    if(mo<0){mo=11;yr--;}if(mo>11){mo=0;yr++;}
    const isCurr=mo===nowMo&&yr===nowYr;
    document.getElementById('calLabel'+idx).textContent=mN[mo]+' '+yr;
    const badge=document.getElementById('calCurrentBadge'+idx);if(badge)badge.style.display=isCurr?'inline-block':'none';
    const card=document.getElementById('calCard'+idx);card.style.border=isCurr?'2px solid #E8720C':'none';
    document.getElementById('calDow'+idx).innerHTML=dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
    const fl=new Date(yr,mo,1);const ll=new Date(yr,mo+1,0);const sd=(fl.getDay()+6)%7;
    let cells='';
    for(let i=0;i<sd;i++)cells+=calCell(new Date(yr,mo,1-(sd-i)),true);
    for(let i=1;i<=ll.getDate();i++)cells+=calCell(new Date(yr,mo,i),false);
    const rem=7-((sd+ll.getDate())%7);if(rem<7)for(let i=1;i<=rem;i++)cells+=calCell(new Date(yr,mo+1,i),true);
    document.getElementById('calGrid'+idx).innerHTML=cells;
  });
}
function calCell(d,otherMonth){
  const key=dateKey(d);const isToday=d.getTime()===today.getTime();const run=state.runs[key];
  let inner=`<div class="cal-day-num">${d.getDate()}</div>`;
  if(run&&run.type==='run'&&run.miles>0){inner+=`<div class="cal-day-miles">${displayDist(run.miles)}</div>`;const rd=getRunDisplay(run);if(rd)inner+=`<div style="font-size:9px;color:var(--text-muted);">${rd}</div>`;}
  else if(run&&run.type==='rest'){inner+=`<div class="cal-day-rest">🌙</div>`;}
  return`<div class="cal-day${isToday?' today':''}${otherMonth?' other-month':''}" onclick="openDayModal('${key}')">${inner}</div>`;
}

// HOME MONTHLY
function renderHomeMonthly(){
  const now=new Date();const yr=now.getFullYear();const mo=now.getMonth();
  const mN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('homeMonthlabel').textContent=mN[mo]+' at a glance';
  const fl=new Date(yr,mo,1);const ll=new Date(yr,mo+1,0);let tm=0,rd=0,rsd=0;
  for(let i=1;i<=ll.getDate();i++){const key=dateKey(new Date(yr,mo,i));const run=state.runs[key];if(run&&run.type==='run'&&run.miles>0){tm+=run.miles;rd++;}else if(run&&run.type==='rest'){rsd++;}}
  const ds=state.unit==='km'?(tm*1.60934).toFixed(1)+'<span style="font-size:13px;font-weight:700;margin-left:2px;">km</span>':tm.toFixed(1)+'<span style="font-size:13px;font-weight:700;margin-left:2px;">mi</span>';
  document.getElementById('homeMonthStats').innerHTML=`<div class="stat-card"><div class="stat-card-val" style="color:#E8720C">${ds}</div><div class="stat-card-lbl">Total distance</div></div><div class="stat-card"><div class="stat-card-val">${rd}</div><div class="stat-card-lbl">Run days</div></div><div class="stat-card"><div class="stat-card-val">${rsd}</div><div class="stat-card-lbl">Rest days</div></div>`;
  const dows=['M','T','W','T','F','S','S'];
  document.getElementById('homeCalDowRow').innerHTML=dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const sd=(fl.getDay()+6)%7;let cells='';
  for(let i=0;i<sd;i++)cells+=homeCalCell(new Date(yr,mo,1-(sd-i)),true);
  for(let i=1;i<=ll.getDate();i++)cells+=homeCalCell(new Date(yr,mo,i),false);
  const rem=7-((sd+ll.getDate())%7);if(rem<7)for(let i=1;i<=rem;i++)cells+=homeCalCell(new Date(yr,mo+1,i),true);
  document.getElementById('homeCalGrid').innerHTML=cells;
}
function homeCalCell(d,otherMonth){
  const key=dateKey(d);const isToday=d.getTime()===today.getTime();const run=state.runs[key];
  let inner=`<div class="cal-day-num">${d.getDate()}</div>`;
  if(run&&run.type==='run'&&run.miles>0){inner+=`<div class="cal-day-miles">${displayDist(run.miles)}</div>`;const rd=getRunDisplay(run);if(rd)inner+=`<div style="font-size:9px;color:var(--text-muted);">${rd}</div>`;}
  else if(run&&run.type==='rest')inner+=`<div class="cal-day-rest">🌙</div>`;
  return`<div class="cal-day${isToday?' today':''}${otherMonth?' other-month':''}" onclick="openDayModal('${key}')">${inner}</div>`;
}

