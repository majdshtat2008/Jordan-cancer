// app.js: تحميل بيانات الموقع وعرض البطاقات والإحصاءات
async function loadData(){
  try{
    const res = await fetch('data/sources.json');
    const data = await res.json();
    renderSources(data.sources);
    renderStats(data.stats);
    renderCards(data.cards);
    renderPrevention(data.prevention);
    // populate hero small stats if available (demo)
    if(data.demo){
      document.getElementById('stat-cases').textContent = data.demo.cases || '—';
      document.getElementById('stat-deaths').textContent = data.demo.deaths || '—';
      document.getElementById('stat-top').textContent = data.demo.top || '—';
    }
    // init charts (if Chart available)
    initCharts(data.demo || null);
  }catch(err){
    console.error('خطأ في تحميل بيانات الموقع:', err);
    document.getElementById('hero-text').textContent = 'تعذر تحميل بيانات الموقع. الرجاء التحقق من ملف data/sources.json أو الاتصال بالمطور.';
  }
}

function renderSources(sources){
  const ul = document.getElementById('sources-list');
  ul.innerHTML = '';
  sources.forEach(s => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.textContent = s.label; a.target = '_blank' ;
    li.appendChild(a);
    if(s.note){
      const span = document.createElement('span');
      span.textContent = ' — ' + s.note;
      span.style.color = '#666'; span.style.fontSize = '0.9rem';
      li.appendChild(span);
    }
    ul.appendChild(li);
  });
}

function renderStats(stats){
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  stats.forEach(s => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${s.title}</h3><p class="stats-number">${s.number}</p><p class="note">${s.desc}</p>`;
    grid.appendChild(div);
  });
}

function renderCards(cards){
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  cards.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card';
    // If image provided, include it
    let inner = '';
    if(c.image){
      inner += `<img src="${c.image}" alt="${c.title}" loading="lazy">`;
    }
    inner += `<div class="card-body"><h3>${c.title}</h3><p>${c.text}</p></div>`;
    div.innerHTML = inner;
    // attach error handler for images (fallback placeholder)
    if(c.image){
      const temp = document.createElement('div');
      temp.innerHTML = inner;
      const img = temp.querySelector('img');
      img.onerror = function(){
        // inline SVG placeholder data URL
        this.onerror = null;
        this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="#e9f2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#6b7c86">صورة غير متاحة</text></svg>`);
      };
      // replace div inner with temp content that has handler
      div.innerHTML = '';
      div.appendChild(img);
      const body = document.createElement('div'); body.className = 'card-body'; body.innerHTML = `<h3>${c.title}</h3><p>${c.text}</p>`;
      div.appendChild(body);
    }
    grid.appendChild(div);
  });
}

function renderPrevention(list){
  const ul = document.getElementById('prevention-list');
  ul.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
}

// تشغيل التحميل عند التحميل
window.addEventListener('DOMContentLoaded', loadData);

// mobile menu toggle
document.addEventListener('click', function(e){
  const btn = document.getElementById('mobile-menu-toggle');
  if(!btn) return;
  if(e.target === btn){
    const nav = document.getElementById('main-nav');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', (!expanded).toString());
    nav.classList.toggle('open');
  }
});

// keep nav state consistent on resize
window.addEventListener('resize', function(){
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('mobile-menu-toggle');
  if(!nav || !btn) return;
  if(window.innerWidth > 880){ nav.classList.remove('open'); nav.style.display = ''; btn.setAttribute('aria-expanded','false'); }
});

// smooth scroll for nav links
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.main-nav a').forEach(a=>{
    a.addEventListener('click', function(ev){
      const href = this.getAttribute('href');
      if(href && href.startsWith('#')){
        ev.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
        // close mobile nav after click
        const nav = document.getElementById('main-nav');
        if(nav) nav.classList.remove('open');
        const btn = document.getElementById('mobile-menu-toggle'); if(btn) btn.setAttribute('aria-expanded','false');
      }
    });
  });
});

// Charts initialization (demo data if provided)
function initCharts(demo){
  try{
    if(typeof Chart === 'undefined') return;
    // demo: types distribution
    const typesCtx = document.getElementById('chart-types');
    if(typesCtx){
      const typesData = demo && demo.types ? demo.types : {labels:['ثدي','قولون','رئة','معدة'], values:[30,20,18,12]};
      new Chart(typesCtx, {
        type: 'pie',
        data: {labels: typesData.labels, datasets:[{data: typesData.values, backgroundColor:['#0077b6','#0096c7','#00b4d8','#90e0ef']}]},
        options:{plugins:{legend:{position:'bottom'}}}
      });
    }

    // demo: trend
    const trendCtx = document.getElementById('chart-trend');
    if(trendCtx){
      const trendData = demo && demo.trend ? demo.trend : {labels:['2019','2020','2021','2022'], values:[2800,2950,3100,3200]};
      new Chart(trendCtx, {
        type: 'line',
        data: {labels: trendData.labels, datasets:[{label:'حالات جديدة',data:trendData.values,borderColor:'#0077b6',backgroundColor:'rgba(0,119,182,0.08)',tension:0.3}]},
        options:{scales:{y:{beginAtZero:false}},plugins:{legend:{display:false}}}
      });
    }
  }catch(e){console.warn('Chart init failed', e)}
}
