// ===================== MAPS =====================
// ===================== GEOCODING =====================
async function geocodeLocation(location, raceName) {
  // Try location field first, then race name
  const queries = [location, raceName].filter(Boolean);
  for (const query of queries) {
    try {
      // Clean up query - remove state abbreviations and zip codes for better results
      const cleaned = query.replace(/,?\s*[A-Z]{2}\s*\d{5}(-\d{4})?$/, '').trim();
      const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(cleaned);
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MarathonRhinoApp/1.0' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch(e) { console.warn('Geocode error:', e.message); }
  }
  return null;
}

const MARATHON_DB={
  // Michigan / Midwest additions
  "Ann Arbor Marathon":{lat:42.2808,lng:-83.7430},"Ann Arbor":{lat:42.2808,lng:-83.7430},
  "Kalamazoo Marathon":{lat:42.2917,lng:-85.5872},"Kalamazoo":{lat:42.2917,lng:-85.5872},
  "Grand Rapids Marathon":{lat:42.9634,lng:-85.6681},"Grand Rapids":{lat:42.9634,lng:-85.6681},
  "Lansing Marathon":{lat:42.7325,lng:-84.5555},"Lansing":{lat:42.7325,lng:-84.5555},
  "Traverse City":{lat:44.7631,lng:-85.6206},
  // Northeast US
  "Hartford Marathon":{lat:41.7637,lng:-72.6851},"Hartford":{lat:41.7637,lng:-72.6851},
  "New Haven Marathon":{lat:41.3083,lng:-72.9279},"New Haven":{lat:41.3083,lng:-72.9279},
  "Providence Marathon":{lat:41.8240,lng:-71.4128},"Providence":{lat:41.8240,lng:-71.4128},
  "Portland Marathon":{lat:43.6591,lng:-70.2568},"Portland ME":{lat:43.6591,lng:-70.2568},
  "Burlington Marathon":{lat:44.4759,lng:-73.2121},"Burlington VT":{lat:44.4759,lng:-73.2121},
  "Albany Marathon":{lat:42.6526,lng:-73.7562},"Albany":{lat:42.6526,lng:-73.7562},
  "Syracuse Marathon":{lat:43.0481,lng:-76.1474},"Syracuse":{lat:43.0481,lng:-76.1474},
  "Rochester Marathon":{lat:43.1566,lng:-77.6088},"Rochester NY":{lat:43.1566,lng:-77.6088},
  "Buffalo Marathon":{lat:42.8864,lng:-78.8784},"Buffalo":{lat:42.8864,lng:-78.8784},
  "Pittsburgh Marathon":{lat:40.4406,lng:-79.9959},"Pittsburgh":{lat:40.4406,lng:-79.9959},
  "Baltimore Marathon":{lat:39.2904,lng:-76.6122},"Baltimore":{lat:39.2904,lng:-76.6122},
  "Washington DC Marathon":{lat:38.9072,lng:-77.0369},"Washington DC":{lat:38.9072,lng:-77.0369},
  "Richmond Marathon":{lat:37.5407,lng:-77.4360},"Richmond":{lat:37.5407,lng:-77.4360},
  "Virginia Beach Marathon":{lat:36.8529,lng:-75.9780},"Virginia Beach":{lat:36.8529,lng:-75.9780},
  // Southeast US
  "Atlanta Marathon":{lat:33.7490,lng:-84.3880},"Atlanta":{lat:33.7490,lng:-84.3880},
  "Charlotte Marathon":{lat:35.2271,lng:-80.8431},"Charlotte":{lat:35.2271,lng:-80.8431},
  "Nashville Marathon":{lat:36.1627,lng:-86.7816},"Nashville":{lat:36.1627,lng:-86.7816},
  "New Orleans Marathon":{lat:29.9511,lng:-90.0715},"New Orleans":{lat:29.9511,lng:-90.0715},
  "Jacksonville Marathon":{lat:30.3322,lng:-81.6557},"Jacksonville":{lat:30.3322,lng:-81.6557},
  "Raleigh Marathon":{lat:35.7796,lng:-78.6382},"Raleigh":{lat:35.7796,lng:-78.6382},
  "Memphis Marathon":{lat:35.1495,lng:-90.0490},"Memphis":{lat:35.1495,lng:-90.0490},
  "Birmingham Marathon":{lat:33.5186,lng:-86.8104},"Birmingham":{lat:33.5186,lng:-86.8104},
  "Savannah Marathon":{lat:32.0835,lng:-81.0998},"Savannah":{lat:32.0835,lng:-81.0998},
  "Louisville Marathon":{lat:38.2527,lng:-85.7585},"Louisville":{lat:38.2527,lng:-85.7585},
  // Midwest US
  "Columbus Marathon":{lat:39.9612,lng:-82.9988},"Columbus":{lat:39.9612,lng:-82.9988},
  "Detroit Marathon":{lat:42.3314,lng:-83.0458},"Detroit":{lat:42.3314,lng:-83.0458},
  "Indianapolis Marathon":{lat:39.7684,lng:-86.1581},"Indianapolis":{lat:39.7684,lng:-86.1581},
  "Milwaukee Marathon":{lat:43.0389,lng:-87.9065},"Milwaukee":{lat:43.0389,lng:-87.9065},
  "Minneapolis Marathon":{lat:44.9778,lng:-93.2650},"Minneapolis":{lat:44.9778,lng:-93.2650},
  "St. Louis Marathon":{lat:38.6270,lng:-90.1994},"St Louis":{lat:38.6270,lng:-90.1994},
  "Kansas City Marathon":{lat:39.0997,lng:-94.5786},"Kansas City":{lat:39.0997,lng:-94.5786},
  "Cleveland Marathon":{lat:41.4993,lng:-81.6944},"Cleveland":{lat:41.4993,lng:-81.6944},
  "Cincinnati Marathon":{lat:39.1031,lng:-84.5120},"Cincinnati":{lat:39.1031,lng:-84.5120},
  "Omaha Marathon":{lat:41.2565,lng:-95.9345},"Omaha":{lat:41.2565,lng:-95.9345},
  // West US
  "Denver Marathon":{lat:39.7392,lng:-104.9903},"Denver":{lat:39.7392,lng:-104.9903},
  "Portland Marathon":{lat:45.5051,lng:-122.6750},"Portland OR":{lat:45.5051,lng:-122.6750},
  "San Francisco Marathon":{lat:37.7749,lng:-122.4194},"San Francisco":{lat:37.7749,lng:-122.4194},
  "Sacramento Marathon":{lat:38.5816,lng:-121.4944},"Sacramento":{lat:38.5816,lng:-121.4944},
  "Las Vegas Marathon":{lat:36.1699,lng:-115.1398},"Las Vegas":{lat:36.1699,lng:-115.1398},
  "Phoenix Marathon":{lat:33.4484,lng:-112.0740},"Phoenix":{lat:33.4484,lng:-112.0740},
  "Salt Lake City Marathon":{lat:40.7608,lng:-111.8910},"Salt Lake City":{lat:40.7608,lng:-111.8910},
  "Honolulu Marathon":{lat:21.3069,lng:-157.8583},"Honolulu":{lat:21.3069,lng:-157.8583},
  "San Diego Marathon":{lat:32.7157,lng:-117.1611},"San Diego":{lat:32.7157,lng:-117.1611},
  "Anchorage Marathon":{lat:61.2181,lng:-149.9003},"Anchorage":{lat:61.2181,lng:-149.9003},
  // Canada
  "Ottawa Marathon":{lat:45.4215,lng:-75.6972},"Ottawa":{lat:45.4215,lng:-75.6972},
  "Montreal Marathon":{lat:45.5017,lng:-73.5673},"Montreal":{lat:45.5017,lng:-73.5673},
  "Calgary Marathon":{lat:51.0447,lng:-114.0719},"Calgary":{lat:51.0447,lng:-114.0719},
  "Edmonton Marathon":{lat:53.5461,lng:-113.4938},"Edmonton":{lat:53.5461,lng:-113.4938},
  // UK/Europe
  "Manchester Marathon":{lat:53.4808,lng:-2.2426},"Manchester":{lat:53.4808,lng:-2.2426},
  "Edinburgh Marathon":{lat:55.9533,lng:-3.1883},"Edinburgh":{lat:55.9533,lng:-3.1883},
  "Dublin Marathon":{lat:53.3498,lng:-6.2603},"Dublin":{lat:53.3498,lng:-6.2603},
  "Rome Marathon":{lat:41.9028,lng:12.4964},"Rome":{lat:41.9028,lng:12.4964},
  "Barcelona Marathon":{lat:41.3851,lng:2.1734},"Barcelona":{lat:41.3851,lng:2.1734},
  "Stockholm Marathon":{lat:59.3293,lng:18.0686},"Stockholm":{lat:59.3293,lng:18.0686},
  "Copenhagen Marathon":{lat:55.6761,lng:12.5683},"Copenhagen":{lat:55.6761,lng:12.5683},
  "Zurich Marathon":{lat:47.3769,lng:8.5417},"Zurich":{lat:47.3769,lng:8.5417},
  "Brussels Marathon":{lat:50.8503,lng:4.3517},"Brussels":{lat:50.8503,lng:4.3517},
  "Frankfurt Marathon":{lat:50.1109,lng:8.6821},"Frankfurt":{lat:50.1109,lng:8.6821},
  "Hamburg Marathon":{lat:53.5753,lng:10.0153},"Hamburg":{lat:53.5753,lng:10.0153},
  "Munich Marathon":{lat:48.1351,lng:11.5820},"Munich":{lat:48.1351,lng:11.5820},"Boston Marathon":{lat:42.3601,lng:-71.0589},"Boston":{lat:42.3601,lng:-71.0589},"London Marathon":{lat:51.5074,lng:-0.1278},"London":{lat:51.5074,lng:-0.1278},"Berlin Marathon":{lat:52.5200,lng:13.4050},"Berlin":{lat:52.5200,lng:13.4050},"Chicago Marathon":{lat:41.8827,lng:-87.6233},"Chicago":{lat:41.8827,lng:-87.6233},"New York Marathon":{lat:40.7128,lng:-74.0060},"New York":{lat:40.7128,lng:-74.0060},"NYC":{lat:40.7128,lng:-74.0060},"Tokyo Marathon":{lat:35.6762,lng:139.6503},"Tokyo":{lat:35.6762,lng:139.6503},"Philadelphia Marathon":{lat:39.9526,lng:-75.1652},"Philadelphia":{lat:39.9526,lng:-75.1652},"Los Angeles Marathon":{lat:34.0522,lng:-118.2437},"Los Angeles":{lat:34.0522,lng:-118.2437},"Paris Marathon":{lat:48.8566,lng:2.3522},"Paris":{lat:48.8566,lng:2.3522},"Sydney Marathon":{lat:-33.8688,lng:151.2093},"Sydney":{lat:-33.8688,lng:151.2093},"Melbourne Marathon":{lat:-37.8136,lng:144.9631},"Melbourne":{lat:-37.8136,lng:144.9631},"Toronto Marathon":{lat:43.6532,lng:-79.3832},"Toronto":{lat:43.6532,lng:-79.3832},"Vancouver Marathon":{lat:49.2827,lng:-123.1207},"Vancouver":{lat:49.2827,lng:-123.1207},"Vienna Marathon":{lat:48.2082,lng:16.3738},"Vienna":{lat:48.2082,lng:16.3738},"Amsterdam Marathon":{lat:52.3676,lng:4.9041},"Amsterdam":{lat:52.3676,lng:4.9041},"Madrid Marathon":{lat:40.4168,lng:-3.7038},"Madrid":{lat:40.4168,lng:-3.7038},"Seoul Marathon":{lat:37.5665,lng:126.9780},"Seoul":{lat:37.5665,lng:126.9780},"Dubai Marathon":{lat:25.2048,lng:55.2708},"Dubai":{lat:25.2048,lng:55.2708},"Cape Town Marathon":{lat:-33.9249,lng:18.4241},"Cape Town":{lat:-33.9249,lng:18.4241},"Buenos Aires Marathon":{lat:-34.6037,lng:-58.3816},"Buenos Aires":{lat:-34.6037,lng:-58.3816},"Houston Marathon":{lat:29.7604,lng:-95.3698},"Houston":{lat:29.7604,lng:-95.3698},"Miami Marathon":{lat:25.7617,lng:-80.1918},"Miami":{lat:25.7617,lng:-80.1918},"Seattle Marathon":{lat:47.6062,lng:-122.3321},"Seattle":{lat:47.6062,lng:-122.3321}};

function lookupRaceCoords(race){
  // 1. Use stored geocoded coordinates first (most accurate)
  if(race.lat && race.lng) return { lat: race.lat, lng: race.lng };

  const name=(race.name||'').trim();
  const location=(race.location||'').trim();
  // 2. Try exact matches in MARATHON_DB
  for(const key of[name,location]){
    if(MARATHON_DB[key])return MARATHON_DB[key];
  }
  // 3. Try partial match
  const candidates=[name,location].filter(Boolean);
  for(const str of candidates){
    const strLower=str.toLowerCase();
    for(const dbKey of Object.keys(MARATHON_DB)){
      const dbLower=dbKey.toLowerCase();
      if(strLower.includes(dbLower)||dbLower.includes(strLower))return MARATHON_DB[dbKey];
    }
  }
  // 4. Try matching individual words in location
  if(location){
    const words=location.split(/[\s,]+/).filter(w=>w.length>3);
    for(const word of words){
      const wordLower=word.toLowerCase();
      for(const dbKey of Object.keys(MARATHON_DB)){
        if(dbKey.toLowerCase().includes(wordLower)||wordLower.includes(dbKey.toLowerCase()))
          return MARATHON_DB[dbKey];
      }
    }
  }
  return null;
}

let globe={rotX:0.3,rotY:0,pins:[],ready:false};

function updateGlobe(){
  const card=document.getElementById('globeCard');const pinList=document.getElementById('globePinList');
  const pins=[];  state.raceHistory.forEach(r=>{const c=lookupRaceCoords(r);if(c)pins.push({...c,name:r.name,location:r.location,raceType:r.raceType||'marathon'});});
  globe.pins=pins;card.style.display=state.showGlobe?'block':'none';if(!state.showGlobe)return;
  if(pins.length>0){globe.rotY=-pins[0].lng*Math.PI/180;globe.rotX=pins[0].lat*Math.PI/180*0.5;}
  if(pinList)pinList.innerHTML=pins.map(p=>`<span style="font-size:11px;background:var(--navy-light);color:var(--navy-dark);padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:${p.raceType==='half'?'#f5c400':p.raceType==='ultra'?'#185FA5':'#ff3333'};display:inline-block;flex-shrink:0;"></span>${p.name||p.location}</span>`).join('');
  if(globe.ready){setTimeout(drawGlobeSVG,50);}else{setTimeout(initGlobe,50);}
}
function initGlobe(){
  const svg=document.getElementById('globeSVG');if(!svg)return;
  if(!window.d3||!window.topojson){setTimeout(initGlobe,500);return;}
  const initData=world=>{
    globe.countries=topojson.feature(world,world.objects.countries);globe.graticule=d3.geoGraticule()();globe.ready=true;
    let isDragging=false,lastX=0,lastY=0;
    svg.addEventListener('mousedown',e=>{isDragging=true;lastX=e.clientX;lastY=e.clientY;svg.style.cursor='grabbing';e.preventDefault();});
    svg.addEventListener('touchstart',e=>{isDragging=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;},{passive:true});
    window.addEventListener('mouseup',()=>{isDragging=false;svg.style.cursor='grab';});
    window.addEventListener('touchend',()=>{isDragging=false;});
    window.addEventListener('mousemove',e=>{if(!isDragging)return;globe.rotY+=(e.clientX-lastX)*0.5;globe.rotX=Math.max(-90,Math.min(90,globe.rotX+(e.clientY-lastY)*0.5));lastX=e.clientX;lastY=e.clientY;drawGlobeSVG();});
    window.addEventListener('touchmove',e=>{if(!isDragging)return;globe.rotY+=(e.touches[0].clientX-lastX)*0.5;globe.rotX=Math.max(-90,Math.min(90,globe.rotX+(e.touches[0].clientY-lastY)*0.5));lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;drawGlobeSVG();},{passive:true});
    drawGlobeSVG();
  };
  if(window.globeAtlas){initData(window.globeAtlas);}
  else{fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r=>r.json()).then(world=>{window.globeAtlas=world;initData(world);}).catch(()=>{});}
}
function drawGlobeSVG(){
  const svg=document.getElementById('globeSVG');if(!svg||!globe.ready)return;
  const proj=d3.geoOrthographic().scale(155).translate([160,160]).rotate([globe.rotY,-globe.rotX,0]).clipAngle(90);
  const path=d3.geoPath(proj);
  let html=`<defs><radialGradient id="og" cx="35%" cy="35%"><stop offset="0%" stop-color="#5aadee"/><stop offset="100%" stop-color="#042C53"/></radialGradient><radialGradient id="sg" cx="35%" cy="35%"><stop offset="0%" stop-color="rgba(255,255,255,0.25)"/><stop offset="70%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>`;
  html+=`<circle cx="160" cy="160" r="155" fill="url(#og)"/>`;
  const gp=path(globe.graticule);if(gp)html+=`<path d="${gp}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
  globe.countries.features.forEach(f=>{const p=path(f);if(p)html+=`<path d="${p}" fill="rgba(74,155,74,0.82)" stroke="rgba(255,255,255,0.25)" stroke-width="0.4"/>`;});
  html+=`<circle cx="160" cy="160" r="155" fill="url(#sg)"/><circle cx="160" cy="160" r="155" fill="none" stroke="rgba(181,212,244,0.4)" stroke-width="1.5"/>`;
  globe.pins.forEach(pin=>{const c=proj([pin.lng,pin.lat]);if(!c)return;const vis=d3.geoDistance([pin.lng,pin.lat],proj.invert([160,160]))<Math.PI/2;if(!vis)return;const[x,y]=c;const pinColor = pin.raceType==='half' ? '#f5c400' : pin.raceType==='ultra' ? '#185FA5' : '#ff3333';html+=`<circle cx="${x+1.5}" cy="${y+1.5}" r="6" fill="rgba(0,0,0,0.25)"/><circle cx="${x}" cy="${y}" r="6" fill="${pinColor}" stroke="white" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="2.5" fill="white"/>`;});
  svg.innerHTML=html;
}
function makeMap(canvasId,center,scale,hRatio,pinFilter){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const W=canvas.parentElement.offsetWidth||340;canvas.width=W;canvas.height=Math.round(W*hRatio);const H=canvas.height;
  const ctx=canvas.getContext('2d');
  if(!window.d3||!window.topojson){ctx.fillStyle='#E6F1FB';ctx.fillRect(0,0,W,H);setTimeout(()=>makeMap(canvasId,center,scale,hRatio,pinFilter),600);return;}
  if(!window.worldAtlas){fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json()).then(world=>{window.worldAtlas=world;makeMap(canvasId,center,scale,hRatio,pinFilter);}).catch(()=>{});return;}
  const world=window.worldAtlas;const countries=topojson.feature(world,world.objects.countries);const borders=topojson.mesh(world,world.objects.countries,(a,b)=>a!==b);
  const proj=d3.geoMercator().center(center).scale(W*scale).translate([W/2,H/2]);const path=d3.geoPath(proj,ctx);
  ctx.fillStyle='#E6F1FB';ctx.fillRect(0,0,W,H);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  countries.features.forEach(f=>{ctx.beginPath();path(f);ctx.fillStyle='#c8dff5';ctx.fill();});
  ctx.beginPath();path(borders);ctx.strokeStyle='#fff';ctx.lineWidth=0.7;ctx.stroke();ctx.restore();
  ctx.strokeStyle='rgba(24,95,165,0.3)';ctx.lineWidth=1;ctx.strokeRect(0,0,W,H);
  globe.pins.filter(pinFilter).forEach(pin=>{const c=proj([pin.lng,pin.lat]);if(!c)return;const[x,y]=c;if(x<0||x>W||y<0||y>H)return;const pinColor=pin.raceType==='half'?'#f5c400':pin.raceType==='ultra'?'#185FA5':'#ff3333';ctx.beginPath();ctx.arc(x+1,y+1,6,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fill();ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=pinColor;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();});
}
function makeMapUpdate(cardId,pinListId,stateKey,drawFn,pinFilter){
  const card=document.getElementById(cardId);const pinList=document.getElementById(pinListId);if(!card)return;
  card.style.display=state[stateKey]?'block':'none';if(!state[stateKey])return;
  const races=globe.pins.filter(pinFilter);
  if(pinList)pinList.innerHTML=races.map(p=>`<span style="font-size:11px;background:var(--navy-light);color:var(--navy-dark);padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:${p.raceType==='half'?'#f5c400':p.raceType==='ultra'?'#185FA5':'#ff3333'};display:inline-block;flex-shrink:0;"></span>${p.name||p.location}</span>`).join('');
  setTimeout(drawFn,50);
}
const filters={na:p=>p.lng>=-168&&p.lng<=-52&&p.lat>=7&&p.lat<=84,sa:p=>p.lng>=-82&&p.lng<=-34&&p.lat>=-56&&p.lat<=13,eu:p=>p.lng>=-25&&p.lng<=45&&p.lat>=34&&p.lat<=72,af:p=>p.lng>=-18&&p.lng<=52&&p.lat>=-35&&p.lat<=38,as:p=>p.lng>=25&&p.lng<=145&&p.lat>=-10&&p.lat<=75,oc:p=>p.lng>=110&&p.lng<=180&&p.lat>=-50&&p.lat<=10};
function drawUSMap(){
  const canvas=document.getElementById('usMapCanvas');if(!canvas)return;
  const W=canvas.parentElement.offsetWidth||340;canvas.width=W;canvas.height=Math.round(W*0.62);const H=canvas.height;const ctx=canvas.getContext('2d');
  if(!window.d3||!window.topojson){ctx.fillStyle='#E6F1FB';ctx.fillRect(0,0,W,H);setTimeout(drawUSMap,500);return;}
  if(!window.usAtlas){fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json()).then(us=>{window.usAtlas=us;drawUSMap();}).catch(()=>{});return;}
  const us=window.usAtlas;const states=topojson.feature(us,us.objects.states);const borders=topojson.mesh(us,us.objects.states,(a,b)=>a!==b);const nation=topojson.feature(us,us.objects.nation);
  const proj=d3.geoAlbersUsa().fitSize([W,H],nation);const path=d3.geoPath(proj,ctx);
  ctx.fillStyle='#E6F1FB';ctx.fillRect(0,0,W,H);ctx.beginPath();path(nation);ctx.fillStyle='#daeaf7';ctx.fill();
  states.features.forEach(f=>{ctx.beginPath();path(f);ctx.fillStyle='#c8dff5';ctx.fill();});
  ctx.beginPath();path(borders);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();path(nation);ctx.strokeStyle='rgba(24,95,165,0.4)';ctx.lineWidth=1;ctx.stroke();
  globe.pins.filter(p=>p.lng>=-125&&p.lng<=-66&&p.lat>=24&&p.lat<=50).forEach(pin=>{const c=proj([pin.lng,pin.lat]);if(!c)return;const[x,y]=c;const pinColor=pin.raceType==='half'?'#f5c400':pin.raceType==='ultra'?'#185FA5':'#ff3333';ctx.beginPath();ctx.arc(x+1,y+1,6,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fill();ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=pinColor;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();});
}
function drawEUMap(){makeMap('euMapCanvas',[10,53],0.82,1.05,filters.eu);}
function drawNAMap(){makeMap('naMapCanvas',[-100,50],0.38,0.78,filters.na);}
function drawSAMap(){makeMap('saMapCanvas',[-60,-20],0.75,1.1,filters.sa);}
function drawAFMap(){makeMap('afMapCanvas',[17,2],0.6,1.1,filters.af);}
function drawASMap(){makeMap('asMapCanvas',[90,35],0.45,0.9,filters.as);}
function drawOCMap(){makeMap('ocMapCanvas',[145,-28],0.7,0.75,filters.oc);}
function updateUSMap(){const c=document.getElementById('usMapCard');const pl=document.getElementById('usMapPinList');if(!c)return;const races=globe.pins.filter(p=>p.lng>=-125&&p.lng<=-66&&p.lat>=24&&p.lat<=50);c.style.display=state.showUSMap?'block':'none';if(!state.showUSMap)return;if(pl)pl.innerHTML=races.map(p=>`<span style="font-size:11px;background:var(--navy-light);color:var(--navy-dark);padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:${p.raceType==='half'?'#f5c400':p.raceType==='ultra'?'#185FA5':'#ff3333'};display:inline-block;flex-shrink:0;"></span>${p.name||p.location}</span>`).join('');setTimeout(drawUSMap,50);}
function updateEUMap(){makeMapUpdate('euMapCard','euMapPinList','showEUMap',drawEUMap,filters.eu);}
function updateNAMap(){makeMapUpdate('naMapCard','naMapPinList','showNAMap',drawNAMap,filters.na);}
function updateSAMap(){makeMapUpdate('saMapCard','saMapPinList','showSAMap',drawSAMap,filters.sa);}
function updateAFMap(){makeMapUpdate('afMapCard','afMapPinList','showAFMap',drawAFMap,filters.af);}
function updateASMap(){makeMapUpdate('asMapCard','asMapPinList','showASMap',drawASMap,filters.as);}
function updateOCMap(){makeMapUpdate('ocMapCard','ocMapPinList','showOCMap',drawOCMap,filters.oc);}
function toggleMap(type,show){
  const m={globe:{sk:'showGlobe',id:'globeCard',fn:()=>globe.ready?drawGlobeSVG():initGlobe()},us:{sk:'showUSMap',id:'usMapCard',fn:drawUSMap},eu:{sk:'showEUMap',id:'euMapCard',fn:drawEUMap},na:{sk:'showNAMap',id:'naMapCard',fn:drawNAMap},sa:{sk:'showSAMap',id:'saMapCard',fn:drawSAMap},af:{sk:'showAFMap',id:'afMapCard',fn:drawAFMap},as:{sk:'showASMap',id:'asMapCard',fn:drawASMap},oc:{sk:'showOCMap',id:'ocMapCard',fn:drawOCMap}};
  const t=m[type];if(!t)return;state[t.sk]=show;debouncedSaveProfile();const card=document.getElementById(t.id);if(card){card.style.display=show?'block':'none';if(show)setTimeout(t.fn,50);}
}


