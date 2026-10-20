const { endpoints, categories, highlight, baseUrl } = window.SHZPAY;
const pgList = document.getElementById('pgList');
const pgRunPanel = document.getElementById('pgRunPanel');
const pgSearch = document.getElementById('pgSearch');
const pgHost = document.getElementById('pgHost');
if (pgHost) pgHost.textContent = baseUrl.replace(/^https?:\/\//, '');

const requested = window.SHZPAY.byId(new URLSearchParams(window.location.search).get('ep'));
let activeId = requested ? requested.id : endpoints[0].id;

function renderList(query) {
  pgList.innerHTML = '';
  let found = 0;
  categories.forEach(group => {
    const items = endpoints.filter(e => e.cat === group.cat &&
      (!query || e.path.toLowerCase().includes(query) || e.desc.toLowerCase().includes(query)));
    if (!items.length) return;
    found += items.length;

    const label = document.createElement('li');
    label.className = 'pg-group-label';
    label.textContent = group.label;
    pgList.appendChild(label);

    items.forEach(ep => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pg-item' + (ep.id === activeId ? ' active' : '');
      btn.dataset.id = ep.id;
      btn.innerHTML = `<span class="m ${ep.method.toLowerCase()}">${ep.method}</span><span class="p">${ep.path}</span>`;
      btn.addEventListener('click', () => {
        activeId = ep.id;
        pgList.querySelectorAll('.pg-item').forEach(el => el.classList.toggle('active', el.dataset.id === ep.id));
        renderRunPanel();
      });
      li.appendChild(btn);
      pgList.appendChild(li);
    });
  });
  if (!found) {
    const empty = document.createElement('li');
    empty.className = 'docs-list-empty';
    empty.textContent = 'Tidak ada endpoint yang cocok.';
    pgList.appendChild(empty);
  }
}

function fieldValues(ep) {
  const values = {};
  ep.params.forEach(p => {
    const input = document.getElementById('pgf_' + p.name);
    values[p.name] = input ? input.value.trim() : '';
  });
  return values;
}

function renderRunPanel() {
  const ep = window.SHZPAY.byId(activeId);
  if (!ep) return;
  let activeTab = 'curl';

  const fieldsHtml = ep.params.map(p => {
    const label = `<label for="pgf_${p.name}">${p.name}${p.required ? ' <span class="try-req" title="wajib diisi">*</span>' : ''}</label>`;
    const control = p.options
      ? `<select id="pgf_${p.name}" data-required="${p.required}"><option value="">Otomatis</option>${p.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
      : `<input type="text" id="pgf_${p.name}" placeholder="${window.SHZPAY.esc(p.example)}" data-required="${p.required}" autocomplete="off" spellcheck="false">`;
    return `<div class="try-field">${label}${control}<p class="try-hint">${p.desc}</p></div>`;
  }).join('');
  const paramsHtml = ep.params.length
    ? fieldsHtml
    : '<p class="try-hint" style="margin:4px 0 0;">Endpoint ini tidak memerlukan parameter.</p>';

  pgRunPanel.innerHTML = `
    <h2 class="try-title"><span class="m ${ep.method.toLowerCase()}">${ep.method}</span> ${ep.path}</h2>
    <p class="try-desc">${ep.desc}</p>

    <div class="try-card">
      <div class="try-card-head">
        <span class="try-card-title">Parameter</span>
        <span class="try-card-tools">
          <button type="button" class="try-link" id="pgFill">Isi contoh</button>
          <button type="button" class="try-link" id="pgResetBtn">Kosongkan</button>
        </span>
      </div>
      ${paramsHtml}
    </div>

    <div class="try-actions">
      <button type="button" class="try-execute" id="pgRunLive">Kirim ke server</button>
      <button type="button" class="try-secondary" id="pgRunSim">Lihat contoh respons</button>
    </div>

    <div class="try-tabs" role="tablist">
      <button type="button" role="tab" class="try-tab active" data-tab="curl">cURL</button>
      <button type="button" role="tab" class="try-tab" data-tab="javascript">JavaScript</button>
    </div>

    <div class="try-section">
      <div class="try-section-head">
        <span class="left"><span class="try-section-title">Perintah</span></span>
        <button type="button" class="try-copy-btn" id="pgCopyCmd" aria-label="Salin perintah">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div class="try-code"><pre id="pgCommandOutput"></pre></div>
    </div>

    <div class="try-section">
      <div class="try-section-head">
        <span class="left">
          <span class="try-section-title">Respons</span>
          <span class="try-status-pill" id="pgStatusCode" role="status"></span>
        </span>
        <button type="button" class="try-copy-btn" id="pgCopyResp" aria-label="Salin respons">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div class="try-code"><pre id="pgRespOutput"><span class="placeholder">Isi parameter lalu klik "Kirim ke server".</span></pre></div>
    </div>
  `;

  const cmdBox = document.getElementById('pgCommandOutput');
  const statusEl = document.getElementById('pgStatusCode');
  const outputEl = document.getElementById('pgRespOutput');

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'try-status-pill' + (kind ? ' ' + kind : '');
  }

  function refreshCommandBox() {
    const values = fieldValues(ep);
    cmdBox.textContent = activeTab === 'curl' ? window.SHZPAY.curlFor(ep, values) : window.SHZPAY.jsFor(ep, values);
  }
  refreshCommandBox();

  ep.params.forEach(p => {
    document.getElementById('pgf_' + p.name).addEventListener('input', refreshCommandBox);
  });

  pgRunPanel.querySelectorAll('.try-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      pgRunPanel.querySelectorAll('.try-tab').forEach(t => t.classList.toggle('active', t === tab));
      refreshCommandBox();
    });
  });

  document.getElementById('pgFill').addEventListener('click', () => {
    ep.params.forEach(p => { document.getElementById('pgf_' + p.name).value = p.example; });
    refreshCommandBox();
  });

  document.getElementById('pgResetBtn').addEventListener('click', () => {
    ep.params.forEach(p => {
      const input = document.getElementById('pgf_' + p.name);
      input.value = '';
      input.classList.remove('invalid');
    });
    refreshCommandBox();
  });

  function flash(btn) {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1200);
  }
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); flash(btn); } catch (e) {}
  }
  document.getElementById('pgCopyCmd').addEventListener('click', e => copy(cmdBox.textContent, e.currentTarget));
  document.getElementById('pgCopyResp').addEventListener('click', e => copy(outputEl.textContent, e.currentTarget));

  function validateRequired() {
    let firstInvalid = null;
    ep.params.forEach(p => {
      const input = document.getElementById('pgf_' + p.name);
      const empty = p.required && !input.value.trim();
      input.classList.toggle('invalid', empty);
      input.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('parameter wajib belum diisi', 'err');
      outputEl.innerHTML = '<span class="placeholder">Lengkapi parameter bertanda * terlebih dahulu.</span>';
      return false;
    }
    return true;
  }

  document.getElementById('pgRunSim').addEventListener('click', () => {
    setStatus('contoh, bukan hasil sungguhan');
    outputEl.innerHTML = highlight(window.SHZPAY.sample(ep));
  });

  const liveBtn = document.getElementById('pgRunLive');
  liveBtn.addEventListener('click', async () => {
    if (!validateRequired()) return;
    const values = fieldValues(ep);
    const started = performance.now();
    liveBtn.disabled = true;
    setStatus('');
    const slow = ep.cat === 'download' || ep.cat === 'ai';
    outputEl.innerHTML = `<div class="try-loading"><span class="try-spinner"></span>${slow ? 'Menunggu server, proses ini bisa sampai satu menit...' : 'Mengirim permintaan ke server...'}</div>`;

    let code = 0;
    try {
      let res;
      if (ep.method === 'GET') {
        res = await fetch(window.SHZPAY.urlFor(ep, values));
      } else {
        res = await fetch(baseUrl + ep.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(window.SHZPAY.bodyFor(ep, values))
        });
      }
      code = res.status;
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch (e) {}
      const ms = Math.round(performance.now() - started);
      setStatus(`${res.status} ${res.statusText}`.trim() + ` · ${ms} md`, res.ok ? 'ok' : 'err');
      outputEl.innerHTML = highlight(pretty);
      window.SHZPAY.history.add({ t: Date.now(), path: ep.path, code, ms, ok: res.ok });
    } catch (err) {
      const ms = Math.round(performance.now() - started);
      setStatus('gagal terhubung', 'err');
      outputEl.innerHTML = `<span class="placeholder">Tidak dapat terhubung ke ${window.SHZPAY.esc(baseUrl)}. Server atau tunnel Cloudflare mungkin sedang tidak aktif. Klik "Lihat contoh respons" untuk melihat bentuk hasilnya.</span>`;
      window.SHZPAY.history.add({ t: Date.now(), path: ep.path, code: 0, ms, ok: false });
    } finally {
      liveBtn.disabled = false;
    }
  });
}

pgSearch.addEventListener('input', e => renderList(e.target.value.trim().toLowerCase()));

renderList('');
renderRunPanel();
