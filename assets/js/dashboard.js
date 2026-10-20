const { endpoints, esc } = window.SHZPAY;

/* Data riwayat: hanya percobaan dari halaman Coba API di perangkat ini */
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function renderStats(log) {
  document.getElementById('statTotal').textContent = log.length.toLocaleString('id-ID');

  const timed = log.filter(l => l.code > 0 && typeof l.ms === 'number');
  document.getElementById('statAvg').textContent = timed.length
    ? Math.round(timed.reduce((s, l) => s + l.ms, 0) / timed.length).toLocaleString('id-ID')
    : '-';

  const counts = {};
  log.forEach(l => { counts[l.path] = (counts[l.path] || 0) + 1; });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  document.getElementById('statTop').textContent = top || '-';

  document.getElementById('statCount').textContent = endpoints.length;
}

/* Grafik 7 hari terakhir. Lebar viewBox mengikuti lebar panel supaya titik dan label tidak melar. */
const chartH = 200, padY = 20, padX = 12;
const chartSvg = document.getElementById('chartSvg');
const chartWrap = chartSvg.parentElement;
const lineEl = document.getElementById('chartLine');
const areaEl = document.getElementById('chartArea');
const dotsEl = document.getElementById('chartDots');
const xLabelsEl = document.getElementById('chartXLabels');
const chartEmptyEl = document.getElementById('chartEmpty');

function renderChart(log) {
  const chartW = Math.max(280, Math.round(chartWrap.clientWidth || 560));
  chartSvg.setAttribute('viewBox', `0 0 ${chartW} ${chartH}`);
  chartSvg.querySelectorAll('.chart-grid-line').forEach(l => l.setAttribute('x2', chartW));

  const today = startOfDay(Date.now());
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ ts: d.getTime(), day: dayNames[d.getDay()], value: 0 });
  }
  log.forEach(l => {
    const d = days.find(x => x.ts === startOfDay(l.t));
    if (d) d.value++;
  });

  const total = days.reduce((s, d) => s + d.value, 0);
  chartEmptyEl.hidden = total > 0;

  const maxVal = Math.max(...days.map(d => d.value), 1) * 1.15;
  const pts = days.map((d, i) => [
    padX + (i / (days.length - 1)) * (chartW - padX * 2),
    padY + (1 - d.value / maxVal) * (chartH - padY * 1.6)
  ]);
  const linePath = 'M' + pts.map(p => p.join(',')).join(' L');
  lineEl.setAttribute('d', linePath);
  areaEl.setAttribute('d', linePath + ` L${pts[pts.length - 1][0]},${chartH} L${pts[0][0]},${chartH} Z`);

  dotsEl.innerHTML = '';
  xLabelsEl.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  pts.forEach((p, i) => {
    if (total > 0) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 3.5);
      c.setAttribute('class', 'chart-dot');
      const title = document.createElementNS(ns, 'title');
      title.textContent = `${days[i].day}: ${days[i].value} permintaan`;
      c.appendChild(title);
      dotsEl.appendChild(c);
    }
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', p[0]); t.setAttribute('y', chartH - 2);
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'chart-xlabel');
    t.textContent = days[i].day;
    xLabelsEl.appendChild(t);
  });
}

/* Riwayat percobaan */
const logTbody = document.getElementById('logTbody');

function formatTime(ts) {
  const d = new Date(ts);
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (startOfDay(ts) === startOfDay(Date.now())) return time;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + time;
}

function renderLog(log) {
  logTbody.innerHTML = '';
  if (!log.length) {
    logTbody.innerHTML = '<tr><td colspan="4" class="table-empty">Belum ada percobaan. Buka halaman Coba API dan kirim permintaan pertama.</td></tr>';
    return;
  }
  log.slice(0, 30).forEach(l => {
    const codeClass = l.code === 0 ? 'code-5xx' : l.code < 300 ? 'code-2xx' : l.code < 500 ? 'code-4xx' : 'code-5xx';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="ts">${formatTime(l.t)}</td>
      <td class="ep-path">${esc(l.path)}</td>
      <td><span class="code-pill ${codeClass}">${l.code === 0 ? 'Gagal' : l.code}</span></td>
      <td class="mono ep-latency">${typeof l.ms === 'number' ? l.ms + ' md' : '-'}</td>`;
    logTbody.appendChild(tr);
  });
}

function renderAll() {
  const log = window.SHZPAY.history.read();
  renderStats(log);
  renderChart(log);
  renderLog(log);
}

document.getElementById('clearLogBtn').addEventListener('click', () => {
  window.SHZPAY.history.clear();
  renderAll();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => renderChart(window.SHZPAY.history.read()), 150);
});

renderAll();
