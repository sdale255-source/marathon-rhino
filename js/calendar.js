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

// ===================== PACE =====================
function setPaceDisplay(sp){state.showPace=sp;debouncedSaveProfile();document.getElementById('btnShowPace').classList.toggle('active',sp);document.getElementById('btnShowTime').classList.toggle('active',!sp);renderWeek();renderCalendar();renderHomeMonthly();}
function calcPace(miles,totalMinutes){
  if(!miles||!totalMinutes||miles<=0||totalMinutes<=0)return null;
  const dist=state.unit==='km'?miles*1.60934:miles;const pm=totalMinutes/dist;
  const mn=Math.floor(pm);const sc=Math.round((pm-mn)*60);
  return mn+':'+(sc<10?'0':'')+sc+' /'+state.unit;
}
function formatTime(tm){if(!tm||tm<=0)return null;const h=Math.floor(tm/60);const m=Math.round(tm%60);return h>0?h+':'+(m<10?'0':'')+m:m+' min';}
function getRunDisplay(run){if(!run||run.type!=='run')return null;if(!run.minutes)return null;if(state.showPace)return calcPace(run.miles,run.minutes);return formatTime(run.minutes);}

// ===================== RACE HISTORY =====================
function openAddRaceHistory(){
  // Reset to marathon default each time
  selectRaceType('marathon');
  openModal('raceHistoryModal');
}
function selectRaceType(type) {
  const types = ['half','marathon','ultra'];
  const colors = { half: '#f5c400', marathon: '#E8720C', ultra: 'var(--navy)' };
  types.forEach(t => {
    const el = document.getElementById('rt' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.style.borderColor = t === type ? colors[t] : 'var(--border)';
  });
  const radio = document.getElementById('rhType' + type.charAt(0).toUpperCase() + type.slice(1));
  if (radio) radio.checked = true;
}
async function saveRaceHistory(){
  const name=document.getElementById('rhName').value.trim();
  const location=document.getElementById('rhLocation').value.trim();
  const date=document.getElementById('rhDate').value;
  const time=document.getElementById('rhTime').value.trim();
  if(!name)return;
  const saveBtn = document.querySelector('#raceHistoryModal .btn-primary');
  if(saveBtn){saveBtn.textContent='Saving...';saveBtn.disabled=true;}
  const typeRadio = document.querySelector('input[name="raceType"]:checked');
  const raceType = typeRadio ? typeRadio.value : 'marathon';
  const newRace={name,location,date,time,raceType,photos:[]};
  state.raceHistory.unshift(newRace);
  // Save to DB
  try {
    await saveRaceToDB(newRace);
    console.log('Race saved OK, id:', newRace.id);
  } catch(e) {
    console.error('saveRaceHistory error:', e.message);
  }
  document.getElementById('rhName').value='';document.getElementById('rhLocation').value='';
  document.getElementById('rhDate').value='';document.getElementById('rhTime').value='';
  if(saveBtn){saveBtn.textContent='Save race';saveBtn.disabled=false;}
  closeModal('raceHistoryModal');renderRaceHistory();renderHomeMonthly();renderStats();renderAchievements();
  updateGlobe();updateUSMap();updateNAMap();updateSAMap();updateEUMap();updateAFMap();updateASMap();updateOCMap();
}

function renderRaceHistory(){
  const mN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const el=document.getElementById('homeRaceHistoryList');
  if(el) el.style.maxHeight = state.raceHistory.length > 3 ? '320px' : 'none';
  const empty='<p style="font-size:14px;color:var(--text-muted);text-align:center;padding:1rem 0;">No races logged yet. Add your first completed race!</p>';
  const buildItem=(r,idx)=>{
    let dateStr='';if(r.date){const d=new Date(r.date+'T00:00:00');dateStr=mN[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();}
    const photos=r.photos||[];const photoCount=photos.length;
    // Photo thumbnail strip
    let strip='';
    if(photoCount>0){
      strip='<div class="photo-strip">';
      for(let i=0;i<Math.min(photoCount,5);i++){
        strip+=`<div class="photo-thumb" onclick="openLightbox(${idx},${i})" title="View photo"><img src="${photos[i]}" alt="Race photo ${i+1}"></div>`;
      }
      strip+='</div>';
    }
    const countLabel=photoCount===0?'No photos yet':photoCount===1?'1 photo':photoCount+' photos';
    const btnLabel=photoCount===0?'Add race photos':'Edit photos';
    const raceTypeConfig = {
      half:    { label: '½ Marathon', color: '#a07700', bg: '#fff8dc' },
      marathon:{ label: 'Marathon',      color: '#cc0000', bg: '#fff0f0' },
      ultra:   { label: 'Ultramarathon',         color: '#185FA5', bg: '#e6f1fb' }
    };
    const rtc = raceTypeConfig[r.raceType || 'marathon'];
    return`<div class="race-item">
      <div class="race-item-header">
        <div class="race-info">
          <div class="race-item-name">${r.name}</div>
          <div class="race-item-meta">${[r.location,dateStr].filter(Boolean).join(' · ')}</div>
          <span style="font-size:10px;font-weight:700;color:${rtc.color};background:${rtc.bg};padding:2px 7px;border-radius:20px;display:inline-block;margin-top:3px;">${rtc.label}</span>
        </div>
        ${r.time?`<div class="race-item-time">${r.time}</div>`:''}
      </div>
      ${strip}
      <button class="add-photos-btn" onclick="openRacePhotos(${idx})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        ${btnLabel}
        <span class="photos-count-badge">${countLabel}</span>
      </button>
    </div>`;
  };
  const html=state.raceHistory.length===0?empty:state.raceHistory.map((r,i)=>buildItem(r,i)).join('');
  const e1=document.getElementById('raceHistoryList');const e2=document.getElementById('homeRaceHistoryList');
  if(e1)e1.innerHTML=html;if(e2)e2.innerHTML=html;
}

// ===================== RACE PHOTOS =====================
function openRacePhotos(raceIdx){
  state.activePhotoRaceIdx=raceIdx;
  const race=state.raceHistory[raceIdx];
  if(!race.photos)race.photos=[];
  document.getElementById('racePhotosTitle').textContent='📸 '+race.name;
  renderPhotoModalGrid();
  openModal('racePhotosModal');
}

function renderPhotoModalGrid(){
  const race=state.raceHistory[state.activePhotoRaceIdx];
  const photos=race.photos||[];
  const grid=document.getElementById('photoModalGrid');
  const countEl=document.getElementById('photoCountLabel');
  const uploadBtn=document.getElementById('photoUploadTrigger');
  countEl.textContent=photos.length+' of 5 photos';
  const full=photos.length>=5;
  uploadBtn.style.opacity=full?'0.4':'1';
  uploadBtn.style.pointerEvents=full?'none':'auto';
  let html='';
  for(let i=0;i<5;i++){
    if(i<photos.length){
      html+=`<div class="photo-modal-slot has-photo" style="position:relative;">
        <img src="${photos[i]}" alt="Race photo ${i+1}" onclick="openLightbox(${state.activePhotoRaceIdx},${i})" style="cursor:zoom-in;">
      </div>`;
    } else {
      const isMedal=i===0;
      html+=`<div class="photo-modal-slot${isMedal?' medal-slot':''}" onclick="triggerPhotoUpload()">
        <div class="slot-inner">
          <span>${isMedal?'🥇':'📷'}</span>
          <small>${isMedal?'Finisher medal':'Add photo'}</small>
        </div>
      </div>`;
    }
  }
  grid.innerHTML=html;
}

function triggerPhotoUpload(){
  const race=state.raceHistory[state.activePhotoRaceIdx];
  if(!race||(race.photos||[]).length>=5)return;
  const input=document.getElementById('photoFileInput');
  input.multiple=true;input.value='';input.click();
}

function handlePhotoFiles(event){
  const files=Array.from(event.target.files);if(!files.length)return;
  const race=state.raceHistory[state.activePhotoRaceIdx];
  if(!race.photos)race.photos=[];
  const remaining=5-race.photos.length;
  const toProcess=files.slice(0,remaining);
  let loaded=0;
  toProcess.forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      race.photos.push(e.target.result);loaded++;
      if(loaded===toProcess.length){saveRaceToDB(race);renderPhotoModalGrid();renderRaceHistory();}
    };
    reader.readAsDataURL(file);
  });
}

function deleteRacePhoto(photoIdx){
  const race=state.raceHistory[state.activePhotoRaceIdx];
  if(!race||!race.photos)return;
  race.photos.splice(photoIdx,1);
  saveRaceToDB(race);
  renderPhotoModalGrid();renderRaceHistory();
}

let _lbRaceIdx=null, _lbPhotoIdx=null;
function openLightbox(raceIdx,photoIdx){
  const race=state.raceHistory[raceIdx];
  if(!race||!race.photos||!race.photos[photoIdx])return;
  _lbRaceIdx=raceIdx; _lbPhotoIdx=photoIdx;
  _renderLightbox();
  openModal('photoLightbox');
}
function _renderLightbox(){
  const race=state.raceHistory[_lbRaceIdx];
  if(!race||!race.photos)return;
  const photos=race.photos.filter(Boolean);
  const total=photos.length;
  document.getElementById('lightboxImg').src=photos[_lbPhotoIdx]||'';
  // counter
  document.getElementById('lightboxCounter').textContent=total>1?`${_lbPhotoIdx+1} / ${total}`:'';
  // arrows — hide if only 1 photo
  const prevBtn=document.getElementById('lightboxPrev');
  const nextBtn=document.getElementById('lightboxNext');
  if(total<=1){prevBtn.style.display='none';nextBtn.style.display='none';}
  else{prevBtn.style.display='flex';nextBtn.style.display='flex';
    prevBtn.style.opacity=_lbPhotoIdx===0?'0.35':'1';
    nextBtn.style.opacity=_lbPhotoIdx===total-1?'0.35':'1';}
}
function lightboxNav(dir){
  const race=state.raceHistory[_lbRaceIdx];
  if(!race||!race.photos)return;
  const photos=race.photos.filter(Boolean);
  const newIdx=_lbPhotoIdx+dir;
  if(newIdx<0||newIdx>=photos.length)return;
  _lbPhotoIdx=newIdx;
  _renderLightbox();
}
function deleteRacePhotoFromLightbox(){
  const race=state.raceHistory[_lbRaceIdx];
  if(!race||!race.photos)return;
  race.photos.splice(_lbPhotoIdx,1);
  saveRaceToDB(race);
  renderRaceHistory();
  const remaining=race.photos.filter(Boolean);
  if(remaining.length===0){closeModal('photoLightbox');renderPhotoModalGrid();return;}
  if(_lbPhotoIdx>=remaining.length)_lbPhotoIdx=remaining.length-1;
  _renderLightbox();
  if(document.getElementById('racePhotosModal').classList.contains('open'))renderPhotoModalGrid();
}
