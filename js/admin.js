// ===================== ADMIN NEWS =====================
async function openAdminNews() {
  await renderAdminArticleList();
  openModal('adminNewsModal');
}

async function renderAdminArticleList() {
  const el = document.getElementById('adminArticleList');
  let articles = [];
  try {
    const data = await dbSelect('news', 'order=created_at.desc');
    articles = Array.isArray(data) ? data : [];
  } catch(e) { el.innerHTML = '<p style="color:#e24b4a;font-size:13px;">Error loading articles: '+e.message+'</p>'; return; }

  if (articles.length === 0) {
    el.innerHTML = '<p style="font-size:13px;color:var(--text-muted);font-style:italic;">No articles yet.</p>';
    return;
  }
  el.innerHTML = articles.map((a, i) => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:var(--text);">${a.title}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${a.source || ''}</div>
      </div>
      <button onclick="adminDeleteArticle('${a.id}')" style="flex-shrink:0;background:none;border:1px solid #e24b4a;color:#e24b4a;border-radius:var(--radius-sm);padding:4px 10px;font-size:12px;cursor:pointer;">Delete</button>
    </div>`).join('');
}

async function adminAddArticle() {
  const title = document.getElementById('newArticleTitle').value.trim();
  const summary = document.getElementById('newArticleSummary').value.trim();
  const source = document.getElementById('newArticleSource').value.trim();
  const url = document.getElementById('newArticleUrl').value.trim();
  const image_url = document.getElementById('newArticleImage').value.trim();
  if (!title || !summary) { alert('Please enter a headline and summary.'); return; }

  const btn = document.querySelector('#adminNewsModal .btn-primary');
  if (btn) { btn.textContent = 'Publishing...'; btn.disabled = true; }

  try {
    // Get current articles sorted oldest first
    const data = await dbSelect('news', 'order=created_at.asc');
    const articles = Array.isArray(data) ? data : [];

    // If already 5, delete the oldest
    if (articles.length >= 5) {
      await dbDelete('news', 'id=eq.' + articles[0].id);
    }

    // Insert new article
    await dbInsert('news', { title, summary, source, url, image_url, created_at: new Date().toISOString() });

    // Clear form
    document.getElementById('newArticleTitle').value = '';
    document.getElementById('newArticleSummary').value = '';
    document.getElementById('newArticleSource').value = '';
    document.getElementById('newArticleUrl').value = '';
    document.getElementById('newArticleImage').value = '';

    await renderAdminArticleList();
    await renderNews(); // Refresh news on homepage
    alert('Article published!');
  } catch(e) {
    alert('Error: ' + e.message);
  } finally {
    if (btn) { btn.textContent = 'Publish article'; btn.disabled = false; }
  }
}

async function adminDeleteArticle(id) {
  if (!confirm('Delete this article?')) return;
  try {
    await dbDelete('news', 'id=eq.' + id);
    await renderAdminArticleList();
    await renderNews();
  } catch(e) { alert('Error: ' + e.message); }
}

// ===================== EDIT RACES =====================
function openEditRaces() {
  const list = document.getElementById('editRacesList');
  const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const raceTypeConfig = {
    half:     { label: '½ Marathon', color: '#a07700', bg: '#fff8dc' },
    marathon: { label: 'Marathon',      color: '#cc0000', bg: '#fff0f0' },
    ultra:    { label: 'Ultramarathon',         color: '#185FA5', bg: '#e6f1fb' }
  };
  if (state.raceHistory.length === 0) {
    list.innerHTML = '<p style="font-size:14px;color:var(--text-muted);text-align:center;padding:1rem 0;">No races to edit yet.</p>';
  } else {
    list.innerHTML = state.raceHistory.map((r, idx) => {
      let dateStr = '';
      if (r.date) { const d = new Date(r.date+'T00:00:00'); dateStr = mNames[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }
      const rtc = raceTypeConfig[r.raceType || 'marathon'];
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:600;color:var(--text);">${r.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${[r.location, dateStr].filter(Boolean).join(' · ')}</div>
          <span style="font-size:10px;font-weight:700;color:${rtc.color};background:${rtc.bg};padding:2px 7px;border-radius:20px;display:inline-block;margin-top:3px;">${rtc.label}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-left:12px;">
          ${r.time ? `<span style="font-size:13px;font-weight:700;color:var(--navy);">${r.time}</span>` : ''}
          <button onclick="openEditSingleRace(${idx})" style="background:var(--navy-light);border:none;border-radius:var(--radius-sm);padding:7px 12px;font-size:12px;font-weight:600;color:var(--navy);cursor:pointer;">Edit</button>
        </div>
      </div>`;
    }).join('');
  }
  openModal('editRacesModal');
}

function openEditSingleRace(idx) {
  const r = state.raceHistory[idx];
  document.getElementById('editRaceIdx').value = idx;
  document.getElementById('editRaceName').value = r.name || '';
  document.getElementById('editRaceLocation').value = r.location || '';
  document.getElementById('editRaceDate').value = r.date || '';
  document.getElementById('editRaceTime').value = r.time || '';
  selectEditRaceType(r.raceType || 'marathon');
  closeModal('editRacesModal');
  openModal('editSingleRaceModal');
}

function selectEditRaceType(type) {
  const types = ['half','marathon','ultra'];
  const colors = { half: '#f5c400', marathon: '#E8720C', ultra: 'var(--navy)' };
  types.forEach(t => {
    const el = document.getElementById('editRt' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.style.borderColor = t === type ? colors[t] : 'var(--border)';
  });
  const radio = document.getElementById('editRhType' + type.charAt(0).toUpperCase() + type.slice(1));
  if (radio) radio.checked = true;
}

async function saveEditedRace() {
  const idx = parseInt(document.getElementById('editRaceIdx').value);
  const name = document.getElementById('editRaceName').value.trim();
  const location = document.getElementById('editRaceLocation').value.trim();
  const date = document.getElementById('editRaceDate').value;
  const time = document.getElementById('editRaceTime').value.trim();
  const typeRadio = document.querySelector('input[name="editRaceType"]:checked');
  const raceType = typeRadio ? typeRadio.value : 'marathon';
  if (!name) return;
  const race = state.raceHistory[idx];
  const locationChanged = race.location !== location || race.name !== name;
  race.name = name; race.location = location;
  race.date = date; race.time = time; race.raceType = raceType;
  // Re-geocode if location changed
  if (locationChanged) {
    const coords = await geocodeLocation(location, name);
    if (coords) { race.lat = coords.lat; race.lng = coords.lng; }
  }
  // Save to DB
  await saveRaceToDB(race);
  closeModal('editSingleRaceModal');
  renderRaceHistory(); renderStats(); renderAchievements();
  updateGlobe(); updateUSMap(); updateNAMap(); updateSAMap();
  updateEUMap(); updateAFMap(); updateASMap(); updateOCMap();
}

async function deleteRace() {
  const idx = parseInt(document.getElementById('editRaceIdx').value);
  const race = state.raceHistory[idx];
  if (!confirm(`Delete "${race.name}"? This cannot be undone.`)) return;
  await deleteRaceFromDB(race.id);
  state.raceHistory.splice(idx, 1);
  closeModal('editSingleRaceModal');
  renderRaceHistory(); renderStats(); renderAchievements();
  updateGlobe(); updateUSMap(); updateNAMap(); updateSAMap();
  updateEUMap(); updateAFMap(); updateASMap(); updateOCMap();
}

