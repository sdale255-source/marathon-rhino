// ===================== NEWS =====================
const NEWS_ARTICLES=[
  {title:"How to Train for Your First Marathon: A Beginner's Guide",description:"Everything you need to know to go from couch to finish line, including training schedules, gear tips, and race day advice.",image:"https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&q=80",url:"https://www.runnersworld.com",date:"May 12, 2026"},
  {title:"The World Marathon Majors: What You Need to Know",description:"A complete guide to the six Abbott World Marathon Majors — Boston, London, Berlin, Chicago, New York and Tokyo.",image:"https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",url:"https://www.worldmarathonmajors.com",date:"May 5, 2026"},
  {title:"Recovery After a Marathon: The Essential Guide",description:"The race is over — now what? Learn how to recover properly after 26.2 miles.",image:"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",url:"https://www.runnersworld.com",date:"Apr 28, 2026"},
  {title:"Best Running Shoes of 2026",description:"Our pick of the best marathon running shoes this year, from daily trainers to race-day super shoes.",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",url:"https://www.runnersworld.com",date:"Apr 21, 2026"},
  {title:"How to Fuel Your Marathon",description:"What to eat before, during and after your marathon to perform at your best.",image:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",url:"https://www.runnersworld.com",date:"Apr 14, 2026"},
];
async function renderNews(){
  let articles = [];
  try {
    const data = await dbSelect('news', 'order=created_at.desc&limit=5');
    articles = Array.isArray(data) && data.length > 0 ? data : NEWS_ARTICLES.map(a=>({title:a.title,summary:a.description,source:a.date,url:a.url}));
  } catch(e) {
    // Fall back to hardcoded articles if DB fails
    articles = NEWS_ARTICLES.map(a=>({title:a.title,summary:a.description,source:a.date,url:a.url}));
  }
  const feat = articles[0];
  const fEl = document.getElementById('homeFeaturedArticle');
  if(fEl && feat){ fEl.innerHTML=`<a href="${feat.url||'#'}" target="_blank" style="text-decoration:none;color:inherit;display:block;">${feat.image_url?`<img src="${feat.image_url}" alt="${feat.title}" style="width:100%;height:160px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:10px;" onerror="this.style.display='none'">`:''}<div style="font-size:11px;color:#E8720C;font-weight:600;margin-bottom:4px;">${feat.source||''}</div><div style="font-size:15px;font-weight:700;color:var(--navy-deeper);margin-bottom:6px;line-height:1.4;">${feat.title}</div><div style="font-size:13px;color:var(--text-muted);line-height:1.6;">${feat.summary||''}</div><div style="font-size:13px;color:#E8720C;font-weight:600;margin-top:8px;">${feat.url?'Read article →':''}</div></a>`; }
  const lEl = document.getElementById('newsArticleList');
  if(lEl){ lEl.innerHTML = articles.map((a,i)=>`<a href="${a.url||'#'}" target="_blank" style="text-decoration:none;color:inherit;display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:flex-start;">${a.image_url?`<img src="${a.image_url}" alt="${a.title}" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);flex-shrink:0;" onerror="this.style.display='none'">`:''}<div style="flex:1;">${i===0?'<span style="font-size:10px;font-weight:700;color:#E8720C;background:#fff3e0;padding:2px 8px;border-radius:20px;display:inline-block;margin-bottom:4px;">Featured</span>':''}<div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">${a.source||''}</div><div style="font-size:13px;font-weight:600;color:var(--navy-deeper);line-height:1.4;margin-bottom:4px;">${a.title}</div><div style="font-size:12px;color:var(--text-muted);line-height:1.5;">${(a.summary||'').slice(0,100)}...</div></div></a>`).join(''); }
}

