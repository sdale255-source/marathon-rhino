// ===================== RACE WEBSITE DIRECTORY =====================
// Built-in directory of well-known races -> official website.
// Used to show the "Race website" bubble under My next race on the Home page.
// If a race isn't in here, the user can paste a URL in the Add Race form.
// If neither exists, the bubble simply does not render (no error).

// Generic running photos used when a directory entry has no photo of its own.
const RACE_PHOTO_POOL = [
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&q=80',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80',
  'https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=80',
  'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?w=600&q=80'
];

// keys  = lowercase phrases that should match what the user types
// url   = official race website
// blurb = one-line description shown in the bubble
const RACE_DIRECTORY = [
  // ---------- Abbott World Marathon Majors ----------
  {name:'Boston Marathon', keys:['boston'], url:'https://www.baa.org/races/boston-marathon', blurb:"The world's oldest annual marathon, run every Patriots' Day from Hopkinton to Boylston Street."},
  {name:'TCS New York City Marathon', keys:['new york city','new york','nyc'], url:'https://www.nyrr.org/tcsnycmarathon', blurb:'26.2 miles through all five boroughs, finishing in Central Park.'},
  {name:'Bank of America Chicago Marathon', keys:['chicago'], url:'https://www.chicagomarathon.com', blurb:'A famously flat and fast loop through 29 Chicago neighbourhoods.'},
  {name:'BMW Berlin Marathon', keys:['berlin'], url:'https://www.bmw-berlin-marathon.com', blurb:'The course where most modern world records have been set.'},
  {name:'TCS London Marathon', keys:['london'], url:'https://www.tcslondonmarathon.com', blurb:'From Greenwich to The Mall, past Tower Bridge and Big Ben.'},
  {name:'Tokyo Marathon', keys:['tokyo'], url:'https://www.marathon.tokyo/en/', blurb:'A fast, immaculately organised tour of central Tokyo.'},
  {name:'Sydney Marathon', keys:['sydney'], url:'https://www.tcssydneymarathon.com', blurb:'Over the Harbour Bridge and finishing at the Opera House.'},
  {name:'Cape Town Marathon', keys:['cape town'], url:'https://www.capetownmarathon.com', blurb:'A flat, scenic race beneath Table Mountain.'},

  // ---------- United States ----------
  {name:'Atlantic City Marathon', keys:['atlantic city'], url:'https://www.acraceseries.com', blurb:'A flat seaside course along the Atlantic City Boardwalk and Absecon Island.'},
  {name:'Marine Corps Marathon', keys:['marine corps','mcm'], url:'https://www.marinemarathon.com', blurb:'"The People\'s Marathon" — past the monuments of Washington, D.C.'},
  {name:'Los Angeles Marathon', keys:['los angeles','la marathon'], url:'https://www.lamarathon.com', blurb:'From Dodger Stadium to Century City through the heart of L.A.'},
  {name:'Chevron Houston Marathon', keys:['houston'], url:'https://www.chevronhoustonmarathon.com', blurb:'A flat January race and a favourite for Olympic Trials qualifiers.'},
  {name:'Philadelphia Marathon', keys:['philadelphia','philly'], url:'https://www.philadelphiamarathon.com', blurb:'Past Independence Hall and up the Ben Franklin Parkway.'},
  {name:"Grandma's Marathon", keys:["grandma's","grandmas"], url:'https://grandmasmarathon.com', blurb:'A fast point-to-point along the North Shore of Lake Superior into Duluth.'},
  {name:'Big Sur International Marathon', keys:['big sur'], url:'https://www.bigsurmarathon.org', blurb:'Highway 1 along the California coast — scenery over speed.'},
  {name:'runDisney Marathon Weekend', keys:['walt disney world','disney world','disney','rundisney'], url:'https://www.rundisney.com', blurb:'Through all four Walt Disney World theme parks in one morning.'},
  {name:'Honolulu Marathon', keys:['honolulu'], url:'https://www.honolulumarathon.org', blurb:'A pre-dawn start past Waikiki and Diamond Head.'},
  {name:'Twin Cities Marathon', keys:['twin cities'], url:'https://www.tcmevents.org', blurb:'"The Most Beautiful Urban Marathon in America," Minneapolis to St. Paul.'},
  {name:'United Airlines NYC Half', keys:['nyc half','new york city half','new york half'], url:'https://www.nyrr.org', blurb:'Brooklyn to Manhattan, through Times Square and up the West Side — entries via New York Road Runners.'},
  {name:'Rock \'n\' Roll Running Series', generic:true, keys:["rock 'n' roll","rock n roll","rock and roll"], url:'https://www.runrocknroll.com', blurb:'Live bands on course at races across the U.S. and beyond.'},
  {name:'California International Marathon', keys:['california international','cim'], url:'https://runcim.org', blurb:'A net-downhill December race from Folsom into downtown Sacramento.'},
  {name:'Eugene Marathon', keys:['eugene'], url:'https://www.eugenemarathon.com', blurb:'Finishing on the track at historic Hayward Field.'},
  {name:'Detroit Free Press Marathon', keys:['detroit'], url:'https://www.freepmarathon.com', blurb:'The only U.S. marathon with an international underwater mile.'},
  {name:'Bank of America Shamrock Shuffle', keys:['shamrock shuffle'], url:'https://www.shamrockshuffle.com', blurb:'Chicago\'s traditional 8K season opener.'},
  {name:'Cherry Blossom Ten Mile Run', keys:['cherry blossom'], url:'https://www.cherryblossom.org', blurb:'Ten miles under the blossoms around the Tidal Basin in D.C.'},
  {name:'Peachtree Road Race', keys:['peachtree'], url:'https://www.atlantatrackclub.org/peachtree', blurb:"The world's largest 10K, run through Atlanta every July 4th."},
  {name:'Bolder Boulder', keys:['bolder boulder'], url:'https://www.bolderboulder.com', blurb:'A Memorial Day 10K finishing inside Folsom Field.'},
  {name:'Falmouth Road Race', keys:['falmouth'], url:'https://falmouthroadrace.com', blurb:'Seven coastal miles along Cape Cod.'},
  {name:'Broad Street Run', keys:['broad street'], url:'https://www.broadstreetrun.com', blurb:'Ten straight, fast, downhill miles through Philadelphia.'},
  {name:'Bay to Breakers', keys:['bay to breakers'], url:'https://www.baytobreakers.com', blurb:'San Francisco\'s famously costumed 12K from the Bay to the Pacific.'},
  {name:'San Francisco Marathon', keys:['san francisco'], url:'https://www.thesfmarathon.com', blurb:'Across the Golden Gate Bridge and back.'},
  {name:'Seattle Marathon', keys:['seattle'], url:'https://seattlemarathon.org', blurb:'Around Lake Washington and the Seattle waterfront.'},
  {name:'Portland Marathon', keys:['portland'], url:'https://www.portlandmarathon.com', blurb:'A tour of Portland\'s bridges and riverfront.'},
  {name:'Steamtown Marathon', keys:['steamtown'], url:'https://steamtownmarathon.com', blurb:'A net-downhill Boston qualifier through northeastern Pennsylvania.'},
  {name:'Mount Desert Island Marathon', keys:['mount desert island','mdi marathon'], url:'https://www.runmdi.org', blurb:'A hilly, spectacular course beside Acadia National Park.'},
  {name:'Missoula Marathon', keys:['missoula'], url:'https://missoulamarathon.org', blurb:'A scenic valley course in western Montana.'},
  {name:'Route 66 Marathon', keys:['route 66'], url:'https://www.route66marathon.com', blurb:'Tulsa\'s signature race, complete with "The Center of the Universe" detour.'},
  {name:'Indianapolis Monumental Marathon', keys:['monumental','indianapolis'], url:'https://monumentalmarathon.com', blurb:'One of the flattest and fastest fall marathons in the U.S.'},
  {name:'Baltimore Running Festival', keys:['baltimore'], url:'https://www.thebaltimoremarathon.com', blurb:'A marathon, half and relay through Charm City.'},
  {name:'Richmond Marathon', keys:['richmond'], url:'https://www.richmondmarathon.org', blurb:'"America\'s Friendliest Marathon," along the James River.'},
  {name:'Charlotte Marathon', keys:['charlotte'], url:'https://charlottesports.org/event/charlotte-marathon/', blurb:'A November race through uptown Charlotte and its greenways.'},
  {name:'Kiawah Island Marathon', keys:['kiawah'], url:'https://kiawahresort.com/recreation/kiawah-island-marathon/', blurb:'A flat, fast, shaded course on a South Carolina barrier island.'},
  {name:'Myrtle Beach Marathon', keys:['myrtle beach'], url:'https://www.mbmarathon.com', blurb:'An oceanfront course along the Grand Strand.'},
  {name:'Publix Atlanta Marathon', keys:['atlanta'], url:'https://www.atlantatrackclub.org/atlanta-marathon', blurb:'A hilly, honest tour of Atlanta in late winter.'},
  {name:'Nashville Marathon', keys:['nashville','st. jude rock','music city'], url:'https://www.runrocknroll.com/nashville', blurb:'Live music every mile through Music City.'},
  {name:'Austin Marathon', keys:['austin'], url:'https://youraustinmarathon.com', blurb:'A rolling February course through the Texas capital.'},
  {name:'Dallas Marathon', keys:['dallas'], url:'https://www.dallasmarathon.com', blurb:'Past the Dallas skyline and around White Rock Lake.'},
  {name:'San Diego Marathon', keys:['san diego'], url:'https://www.runrocknroll.com/san-diego', blurb:'The original Rock \'n\' Roll marathon, on the Southern California coast.'},
  {name:'Mesa Marathon', keys:['mesa','phoenix'], url:'https://mesamarathon.com', blurb:'A net-downhill desert course from the Usery Mountains into downtown Mesa.'},
  {name:'Las Vegas Marathon', keys:['las vegas','vegas'], url:'https://www.runrocknroll.com/las-vegas', blurb:'A night race straight down the Las Vegas Strip.'},
  {name:'Salt Lake City Marathon', keys:['salt lake'], url:'https://www.saltlakecitymarathon.com', blurb:'A downhill course from the foothills into downtown Salt Lake.'},
  {name:'Denver Colfax Marathon', keys:['colfax','denver'], url:'https://runcolfax.org', blurb:'A mile-high race along Denver\'s longest street.'},
  {name:'Pittsburgh Marathon', keys:['pittsburgh'], url:'https://www.thepittsburghmarathon.com', blurb:'Across four rivers and several of Pittsburgh\'s 446 bridges.'},
  {name:'Cleveland Marathon', keys:['cleveland'], url:'https://www.clevelandmarathon.com', blurb:'A lakefront course through downtown Cleveland.'},
  {name:'Columbus Marathon', keys:['columbus'], url:'https://columbusmarathon.com', blurb:'"The Children\'s Marathon," with a patient champion at every mile.'},
  {name:'Milwaukee Marathon', keys:['milwaukee'], url:'https://milwaukeerunningfestival.com', blurb:'Along Lake Michigan and through Milwaukee\'s neighbourhoods.'},
  {name:'Madison Marathon', keys:['madison'], url:'https://madisonmarathon.org', blurb:'Around Wisconsin\'s lakes and past the State Capitol.'},
  {name:'Garmin Kansas City Marathon', keys:['kansas city'], url:'https://www.sportkc.org/marathon', blurb:'A rolling autumn course through Kansas City\'s parks and boulevards.'},
  {name:'St. Louis Marathon', keys:['st. louis','st louis','go! st'], url:'https://www.gostlouis.org', blurb:'Past the Gateway Arch and through Forest Park.'},
  {name:'New Orleans Marathon', keys:['new orleans'], url:'https://www.runrocknroll.com/new-orleans', blurb:'A flat course through the Garden District and French Quarter.'},
  {name:'Miami Marathon', keys:['miami'], url:'https://themiamimarathon.com', blurb:'Across the causeway to South Beach at sunrise.'},
  {name:'Space Coast Marathon', keys:['space coast'], url:'https://spacecoastmarathon.com', blurb:'The oldest marathon in Florida, run along the Indian River.'},
  {name:'Napa Valley Marathon', keys:['napa'], url:'https://www.napavalleymarathon.org', blurb:'A gentle downhill run through California wine country.'},
  {name:'Carlsbad 5000', keys:['carlsbad'], url:'https://www.carlsbad5000.com', blurb:'"The World\'s Fastest 5K," on the coast north of San Diego.'},
  {name:'Boilermaker Road Race', keys:['boilermaker'], url:'https://www.boilermaker.com', blurb:'A famously well-supported 15K in Utica, New York.'},
  {name:'Beach to Beacon 10K', keys:['beach to beacon'], url:'https://www.beach2beacon.org', blurb:'Joan Benoit Samuelson\'s race on the coast of Maine.'},
  {name:'Army Ten-Miler', keys:['army ten','army 10'], url:'https://www.armytenmiler.com', blurb:'Ten miles past the monuments, starting at the Pentagon.'},
  {name:'Chicago Half Marathon', keys:['chicago half'], url:'https://chicagohalfmarathon.com', blurb:'Along Lake Shore Drive on Chicago\'s South Side.'},
  {name:'RBC Brooklyn Half', keys:['brooklyn half','brooklyn'], url:'https://www.nyrr.org', blurb:'Prospect Park to the Coney Island boardwalk — entries via New York Road Runners.'},
  {name:'Ironman World Championship', keys:['ironman world','kona'], url:'https://www.ironman.com/im-world-championship', blurb:'The definitive long-course triathlon, on the lava fields of Kona.'},
  {name:'Ironman', generic:true, keys:['ironman'], url:'https://www.ironman.com', blurb:'Full and 70.3 triathlon races worldwide.'},
  {name:'Western States 100', keys:['western states'], url:'https://www.wser.org', blurb:'The original 100-mile trail race, from Olympic Valley to Auburn.'},
  {name:'Leadville Trail 100', keys:['leadville'], url:'https://www.leadvilleraceseries.com', blurb:'"The Race Across the Sky," entirely above 9,200 feet.'},
  {name:'JFK 50 Mile', keys:['jfk 50'], url:'https://www.jfk50mile.org', blurb:"America's oldest ultramarathon, on the Appalachian Trail and C&O Canal."},
  {name:'Spartan Race', generic:true, keys:['spartan'], url:'https://www.spartan.com', blurb:'Obstacle course racing from Sprint to Ultra distances.'},

  // ---------- Canada ----------
  {name:'Toronto Waterfront Marathon', keys:['toronto'], url:'https://www.torontowaterfrontmarathon.com', blurb:'A fast course along Lake Ontario and Canada\'s national championship race.'},
  {name:'Ottawa Marathon', keys:['ottawa','tamarack'], url:'https://runottawa.ca', blurb:'Canada\'s largest race weekend, along the Rideau Canal.'},
  {name:'Vancouver Marathon', keys:['vancouver'], url:'https://bmovanmarathon.ca', blurb:'From Queen Elizabeth Park to the Stanley Park seawall.'},
  {name:'Montreal Marathon', keys:['montreal'], url:'https://www.mtlmarathon.com', blurb:'Through Montreal\'s islands, parks and old quarter.'},
  {name:'Calgary Marathon', keys:['calgary'], url:'https://www.calgarymarathon.com', blurb:'Canada\'s longest-running marathon, along the Bow River.'},

  // ---------- Europe ----------
  {name:'Schneider Electric Paris Marathon', keys:['paris'], url:'https://www.schneiderelectricparismarathon.com', blurb:'From the Champs-Élysées through the Bois de Vincennes and Bois de Boulogne.'},
  {name:'TCS Amsterdam Marathon', keys:['amsterdam'], url:'https://www.tcsamsterdammarathon.nl', blurb:'Starting and finishing inside the 1928 Olympic Stadium.'},
  {name:'Valencia Marathon', keys:['valencia'], url:'https://www.valenciaciudaddelrunning.com', blurb:'One of the fastest marathon courses in the world.'},
  {name:'Barcelona Marathon', keys:['barcelona'], url:'https://www.zurichmaratobarcelona.es', blurb:'Past Gaudí\'s landmarks and along the Mediterranean.'},
  {name:"Zurich Rock 'n' Roll Madrid", keys:['madrid'], url:'https://rocknrollmadridrun.com', blurb:'A demanding, hilly tour of the Spanish capital.'},
  {name:'Rome Marathon', keys:['rome','roma'], url:'https://www.runromethemarathon.com', blurb:'Starting and finishing at the Colosseum.'},
  {name:'Milano Marathon', keys:['milan','milano'], url:'https://www.milanomarathon.it', blurb:'A flat, fast course through Milan and back to the Duomo.'},
  {name:'Venice Marathon', keys:['venice','venicemarathon'], url:'https://www.venicemarathon.it', blurb:'Finishing across a floating bridge into St Mark\'s Square.'},
  {name:'Vienna City Marathon', keys:['vienna'], url:'https://www.vienna-marathon.com', blurb:'Along the Danube and down the Ringstrasse.'},
  {name:'Frankfurt Marathon', keys:['frankfurt'], url:'https://www.frankfurt-marathon.com', blurb:'Finishing on a red carpet inside the Festhalle.'},
  {name:'Hamburg Marathon', keys:['hamburg'], url:'https://haspa-marathon-hamburg.de/en/', blurb:'Germany\'s largest spring marathon, around the Alster lakes.'},
  {name:'Munich Marathon', keys:['munich','münchen'], url:'https://www.muenchenmarathon.de', blurb:'Finishing in the Olympic Stadium of 1972.'},
  {name:'Copenhagen Marathon', keys:['copenhagen'], url:'https://copenhagenmarathon.dk', blurb:'A flat, fast loop through the Danish capital.'},
  {name:'Stockholm Marathon', keys:['stockholm'], url:'https://stockholmmarathon.se', blurb:'Two laps of the city, finishing in the 1912 Olympic Stadium.'},
  {name:'Oslo Marathon', keys:['oslo'], url:'https://www.oslomaraton.no', blurb:'Along the Oslofjord waterfront and through the city centre.'},
  {name:'Helsinki Marathon', keys:['helsinki'], url:'https://www.helsinkimarathon.fi', blurb:'A late-summer race along the Baltic coast and through central Helsinki.'},
  {name:'Reykjavik Marathon', keys:['reykjavik','reykjavík'], url:'https://marathon.is', blurb:'Run on Iceland\'s Culture Night in late August.'},
  {name:'Dublin Marathon', keys:['dublin'], url:'https://irishlifedublinmarathon.ie', blurb:'"The Friendly Marathon," through Phoenix Park and central Dublin.'},
  {name:'Edinburgh Marathon', keys:['edinburgh'], url:'https://www.edinburghmarathon.com', blurb:'A fast, largely downhill course along the East Lothian coast.'},
  {name:'Great North Run', keys:['great north'], url:'https://www.greatrun.org/events/great-north-run/', blurb:'The world\'s largest half marathon, Newcastle to South Shields.'},
  {name:'Manchester Marathon', keys:['manchester'], url:'https://www.manchestermarathon.co.uk', blurb:'One of the flattest marathons in the UK.'},
  {name:'Brighton Marathon', keys:['brighton'], url:'https://brightonmarathonweekend.co.uk', blurb:'A seafront course on England\'s south coast.'},
  {name:'EDP Lisbon Marathon', keys:['lisbon','lisboa'], url:'https://maratonaclubedeportugal.com', blurb:'A downhill, riverside course finishing in Lisbon\'s Praça do Comércio.'},
  {name:'Porto Marathon', keys:['porto'], url:'https://www.maratonadoporto.com', blurb:'Along the Douro river and the Atlantic coast.'},
  {name:'Athens Marathon', keys:['athens'], url:'https://www.athensauthenticmarathon.gr', blurb:'The original route, Marathon to the Panathenaic Stadium.'},
  {name:'Istanbul Marathon', keys:['istanbul'], url:'https://www.maraton.istanbul', blurb:'The only marathon run across two continents.'},
  {name:'Prague Marathon', keys:['prague','praha'], url:'https://www.runczech.com', blurb:'Over the Vltava bridges and through the Old Town — part of the RunCzech series.'},
  {name:'Budapest Marathon', keys:['budapest'], url:'https://budapestmarathon.com', blurb:'Along the Danube past the Parliament building.'},
  {name:'Warsaw Marathon', keys:['warsaw','warszawa'], url:'https://www.maratonwarszawski.com', blurb:'An autumn race through the Polish capital.'},
  {name:'Krakow Marathon', keys:['krakow','kraków'], url:'https://cracoviamaraton.pl', blurb:'Through Kraków\'s old town and Kazimierz district.'},
  {name:'Zurich Marathon', keys:['zurich','zürich'], url:'https://www.zurichmarathon.ch', blurb:'Along the shore of Lake Zurich.'},
  {name:'Generali Genève Marathon', keys:['geneva','genève','geneve'], url:'https://www.generaligenevemarathon.com', blurb:'Around Lake Geneva and into the old town.'},
  {name:'Jungfrau Marathon', keys:['jungfrau'], url:'https://www.jungfrau-marathon.ch', blurb:'A brutal Swiss alpine marathon climbing 1,800 metres.'},

  // ---------- Asia, Oceania, Middle East, Africa, Americas ----------
  {name:'Nagoya Women\'s Marathon', keys:['nagoya'], url:'https://womens-marathon.nagoya', blurb:'The largest women-only marathon in the world.'},
  {name:'Kyoto Marathon', keys:['kyoto'], url:'https://www.kyoto-marathon.com', blurb:'Past temples, shrines and the Kamo river.'},
  {name:'Seoul Marathon', keys:['seoul'], url:'https://www.seoul-marathon.com', blurb:'Finishing inside Seoul\'s Jamsil Olympic Stadium.'},
  {name:'Hong Kong Marathon', keys:['hong kong'], url:'https://www.hkmarathon.com', blurb:'Across the Tsing Ma Bridge and through the harbour tunnel.'},
  {name:'Singapore Marathon', keys:['singapore'], url:'https://singaporemarathon.com', blurb:'A humid night race past Marina Bay.'},
  {name:'Mumbai Marathon', keys:['mumbai','bombay'], url:'https://tatamumbaimarathon.procam.in', blurb:'Across the Sea Link and along Marine Drive.'},
  {name:'Delhi Half Marathon', keys:['delhi'], url:'https://vedantadelhihalfmarathon.procam.in', blurb:'One of the richest half marathons in the world.'},
  {name:'Beijing Marathon', keys:['beijing'], url:'https://www.beijing-marathon.com', blurb:'Starting in Tiananmen Square.'},
  {name:'Taipei Marathon', keys:['taipei'], url:'https://www.taipeicitymarathon.com', blurb:'A cool-season race through Taiwan\'s capital.'},
  {name:'Bangkok Marathon', keys:['bangkok'], url:'https://www.bkkmarathon.com', blurb:'An overnight start to beat the Thai heat.'},
  {name:'Melbourne Marathon', keys:['melbourne'], url:'https://melbournemarathon.com.au', blurb:'Finishing on the turf of the Melbourne Cricket Ground.'},
  {name:'Gold Coast Marathon', keys:['gold coast'], url:'https://goldcoastmarathon.com.au', blurb:'A flat, fast course beside Queensland\'s beaches.'},
  {name:'Auckland Marathon', keys:['auckland'], url:'https://www.aucklandmarathon.co.nz', blurb:'Over the Harbour Bridge into downtown Auckland.'},
  {name:'Queenstown Marathon', keys:['queenstown'], url:'https://www.queenstown-marathon.co.nz', blurb:'A lakeside course under New Zealand\'s Southern Alps.'},
  {name:'Dubai Marathon', keys:['dubai'], url:'https://dubaimarathon.org', blurb:'Pancake-flat and historically one of the fastest races anywhere.'},
  {name:'Jerusalem Marathon', keys:['jerusalem'], url:'https://jerusalem-marathon.com', blurb:'A hilly course through 3,000 years of history.'},
  {name:'Tel Aviv Marathon', keys:['tel aviv'], url:'https://www.tlvmarathon.co.il', blurb:'A flat February race along the Mediterranean.'},
  {name:'Comrades Marathon', keys:['comrades'], url:'https://www.comrades.com', blurb:'The world\'s oldest and largest ultramarathon, 90km in South Africa.'},
  {name:'Two Oceans Marathon', keys:['two oceans'], url:'https://www.twooceansmarathon.org.za', blurb:'"The world\'s most beautiful marathon" — 56km around the Cape Peninsula.'},
  {name:'Marathon des Sables', keys:['marathon des sables','sables'], url:'https://www.marathondessables.com', blurb:'250km of self-sufficient running across the Sahara.'},
  {name:'Maratón de Buenos Aires', keys:['buenos aires'], url:'https://www.maratondebuenosaires.com', blurb:'A flat, fast course through the Argentine capital.'},
  {name:'Santiago Marathon', keys:['santiago'], url:'https://www.maratondesantiago.com', blurb:'Under the Andes through downtown Santiago.'},
  {name:'Rio de Janeiro Marathon', keys:['rio de janeiro','rio'], url:'https://www.maratonadorio.com.br', blurb:'Along the beaches of Copacabana and Ipanema.'}
];

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

// Sponsor names and generic words stripped before matching, so
// "Bank of America Chicago Marathon" and "chicago marathon" both match.
const _RACE_NOISE = [
  'abbott','tcs','bmw','bank of america','chevron','virgin money','virgin',
  'aia','tata','adidas','asics','nike','new balance','brooks','hoka',
  'zurich','schneider electric','haspa','irish life','rbc','bmo','scotiabank',
  'publix','st. jude','st jude','united airlines','amazon','generali','lala',
  'the','presented by','official','annual'
];

// Words stripped in both passes. Distance words are stripped only in pass 2,
// so "NYC Half" prefers the half-marathon entry over the marathon entry.
function _normRace(s, stripDistance){
  if(!s) return '';
  let t = String(s).toLowerCase();
  t = t.replace(/[\u2018\u2019\u201c\u201d]/g, "'");        // smart quotes -> plain
  t = t.replace(/&/g,' and ');
  t = t.replace(/[^a-z0-9'\s]/g,' ');                        // punctuation -> space
  _RACE_NOISE.forEach(w => { t = t.replace(new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'),' '); });
  t = t.replace(/\b(race|running|festival|weekend|series|international|20\d\d)\b/g,' ');
  if(stripDistance){
    t = t.replace(/\b(marathon|half|full|run|10k|5k|15k|8k|12k|ultra|city)\b/g,' ');
  }
  return t.replace(/\s+/g,' ').trim();
}

function _raceKeyHit(haystack, key){
  if(!haystack || !key || key.length < 3) return false;
  const re = new RegExp('(^|\\s)'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|\\s)');
  return re.test(haystack);
}

// One matching pass. Non-generic entries always beat generic ones
// (so "Rock 'n' Roll Las Vegas" resolves to the Las Vegas race, not the series).
function _raceMatchPass(haystack, stripDistance){
  let best = null, bestLen = 0, bestGeneric = true;
  for(const entry of RACE_DIRECTORY){
    for(const rawKey of entry.keys){
      const k = _normRace(rawKey, stripDistance) || String(rawKey).toLowerCase().trim();
      if(!_raceKeyHit(haystack, k)) continue;
      const generic = !!entry.generic;
      const better = (bestGeneric && !generic) ||
                     (generic === bestGeneric && k.length > bestLen);
      if(better){ best = entry; bestLen = k.length; bestGeneric = generic; }
    }
  }
  return best;
}

// Returns the best directory entry for a race name/location, or null.
// The race NAME is the only match source, except when the name carries no
// distinguishing words at all (someone typed just "Marathon"), in which case
// the location is used. Matching on location generally would wrongly link,
// say, a small Chicago 5K to the Chicago Marathon.
function findRaceInDirectory(name, location){
  const withDist = _normRace(name, false);
  if(withDist){
    const hit = _raceMatchPass(withDist, false);
    if(hit) return hit;
  }
  const stripped = _normRace(name, true);
  if(stripped){
    const hit = _raceMatchPass(stripped, true);
    if(hit) return hit;
    return null;                       // name was distinctive but unknown
  }
  const loc = _normRace(location, true);
  if(loc) return _raceMatchPass(loc, true);
  return null;
}

// Stable photo for a race that has no photo of its own.
function _raceFallbackPhoto(seed){
  let h = 0;
  const s = String(seed||'');
  for(let i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) >>> 0; }
  return RACE_PHOTO_POOL[h % RACE_PHOTO_POOL.length];
}

function _raceHost(url){
  try { return new URL(url).hostname.replace(/^www\./,''); }
  catch(e){ return (String(url||'').replace(/^https?:\/\//,'').split('/')[0] || '').replace(/^www\./,''); }
}

function _escHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Normalises whatever the user typed into the optional website box.
function normaliseRaceUrl(raw){
  let u = String(raw||'').trim();
  if(!u) return '';
  if(!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try {
    const parsed = new URL(u);
    if(!/^https?:$/.test(parsed.protocol)) return '';
    if(!parsed.hostname.includes('.')) return '';
    return parsed.href;
  } catch(e){ return ''; }
}

// Resolves the website for the current next race: the user's own URL wins,
// then the built-in directory. Returns null if neither has anything.
function resolveRaceWebsite(race){
  if(!race) return null;
  const manual = normaliseRaceUrl(race.website);
  if(manual){
    return {
      url: manual,
      title: race.name || _raceHost(manual),
      blurb: 'The official website for this race — entry details, course maps and results.',
      image: race.websiteImage || _raceFallbackPhoto(race.name || manual),
      host: _raceHost(manual)
    };
  }
  const entry = findRaceInDirectory(race.name, race.location);
  if(!entry) return null;
  return {
    url: entry.url,
    title: entry.name,
    blurb: entry.blurb,
    image: entry.image || _raceFallbackPhoto(entry.name),
    host: _raceHost(entry.url)
  };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function renderRaceWebsiteBubble(){
  const el = document.getElementById('raceWebsiteBubble');
  if(!el) return;
  let info = null;
  try { info = resolveRaceWebsite(state.nextRace); }
  catch(e){ console.warn('Race website lookup skipped:', e.message); info = null; }
  if(!info){ el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.innerHTML =
    '<a href="'+_escHtml(info.url)+'" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:block;">'+
      '<img src="'+_escHtml(info.image)+'" alt="Running photo" '+
        'style="width:100%;height:150px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:10px;" '+
        'onerror="this.style.display=\'none\'">'+
      '<div style="font-size:11px;color:#E8720C;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Race website</div>'+
      '<div style="font-size:15px;font-weight:700;color:var(--navy-deeper);margin-bottom:6px;line-height:1.4;">'+_escHtml(info.title)+'</div>'+
      '<div style="font-size:13px;color:var(--text-muted);line-height:1.6;">'+_escHtml(info.blurb)+'</div>'+
      '<div style="font-size:13px;color:#E8720C;font-weight:600;margin-top:8px;">Visit '+_escHtml(info.host)+' &rarr;</div>'+
    '</a>'+
    // Non-affiliation notice — kept outside the <a> so it isn't part of the link
    '<div style="font-size:10px;color:var(--text-muted);line-height:1.5;margin-top:10px;padding-top:8px;border-top:1px solid var(--border);">'+
      'Official race website &middot; Marathon Rhino is not affiliated with this event. Photo is illustrative.'+
    '</div>';
}
