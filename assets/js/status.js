function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const divisor = Math.pow(10, decimals);
    const duration = 1000;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (eased * target) / divisor;
      el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) {
      el.textContent = decimals > 0 ? (target / divisor).toFixed(decimals) : target.toLocaleString('id-ID');
    } else { requestAnimationFrame(tick); }
  }
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); so.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    so.observe(el);
  });

  function genBars(uptimePercent, seed) {
    let bars = '';
    for (let i = 0; i < 30; i++) {
      const r = (Math.sin(seed + i * 12.9898) * 43758.5453) % 1;
      const rand = Math.abs(r);
      let cls = 'bar';
      if (uptimePercent < 100 && i === Math.floor(29 - (seed % 30)) && rand > 0.5) cls += ' warn';
      bars += `<div class="${cls}" title="Hari ke-${i + 1}"></div>`;
    }
    return bars;
  }

  const services = [
    { name: 'Download', sub: '7 endpoint · TikTok, YouTube, Instagram, dan lainnya', uptime: '100%', latency: '—', seed: 3 },
    { name: 'AI', sub: '4 endpoint · Chat, Llama, Vision, Text-to-Image', uptime: '100%', latency: '—', seed: 11 },
    { name: 'Tools', sub: '4 endpoint · Remove BG, Upscale, Colorize, Img-to-Anime', uptime: '100%', latency: '—', seed: 7 },
    { name: 'Search', sub: '4 endpoint · Lirik, Jadwal Salat, Anime, Google', uptime: '100%', latency: '—', seed: 21 }
  ];

  const svcList = document.getElementById('svcList');
  services.forEach(s => {
    const block = document.createElement('div');
    block.className = 'svc-block';
    block.innerHTML = `
      <div class="svc-row">
        <div class="svc-left">
          <span class="svc-dot" aria-hidden="true"></span>
          <div>
            <div class="svc-name">${s.name}</div>
            <div class="svc-sub">${s.sub}</div>
          </div>
        </div>
        <div class="svc-right">
          <div class="svc-metric"><b>${s.uptime}</b><span>uptime</span></div>
          <div class="svc-metric"><b>${s.latency}</b><span>latensi</span></div>
        </div>
      </div>
      <div class="uptime-bars">${genBars(parseFloat(s.uptime), s.seed)}</div>
    `;
    svcList.appendChild(block);
  });

  const incidents = [];

  const incidentList = document.getElementById('incidentList');
  if (incidents.length === 0) {
    incidentList.innerHTML = `
      <div class="empty-incident">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <p>Tidak ada insiden dalam 90 hari terakhir.</p>
      </div>`;
  } else {
    incidents.forEach(inc => {
      const item = document.createElement('div');
      item.className = 'incident-item';
      item.innerHTML = `
        <div class="incident-head">
          <span class="incident-status ${inc.status}">${inc.status === 'resolved' ? 'Teratasi' : 'Dipantau'}</span>
          <span class="incident-title">${inc.title}</span>
          <span class="incident-date">${inc.date}</span>
        </div>
        <p class="incident-desc">${inc.desc}</p>
      `;
      incidentList.appendChild(item);
    });
  }
