const docsList = document.getElementById('docsList');
const docsDetail = document.getElementById('docsDetail');
const docsSearch = document.getElementById('docsSearch');
const { endpoints, categories, highlight, baseUrl } = window.SHZPAY;

const authBaseUrl = document.getElementById('authBaseUrl');
if (authBaseUrl) authBaseUrl.textContent = baseUrl;

const validCats = ['all', ...categories.map(c => c.cat)];
const urlParams = new URLSearchParams(window.location.search);
let currentFilter = validCats.includes(urlParams.get('cat')) ? urlParams.get('cat') : 'all';
let activeId = null;
let activeCodeTab = 'curl';

const copyIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

function matches(ep, query) {
  if (!query) return true;
  return ep.path.toLowerCase().includes(query) || ep.desc.toLowerCase().includes(query);
}

function visibleEndpoints() {
  const query = docsSearch.value.trim().toLowerCase();
  return endpoints.filter(ep => (currentFilter === 'all' || ep.cat === currentFilter) && matches(ep, query));
}

function renderList() {
  docsList.innerHTML = '';
  const query = docsSearch.value.trim().toLowerCase();
  const groups = currentFilter === 'all' ? categories : categories.filter(c => c.cat === currentFilter);
  let found = 0;

  groups.forEach(group => {
    const items = endpoints.filter(e => e.cat === group.cat && matches(e, query));
    if (!items.length) return;
    found += items.length;

    const label = document.createElement('li');
    label.className = 'docs-list-group-label';
    label.textContent = group.label;
    docsList.appendChild(label);

    items.forEach(ep => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'docs-list-item' + (ep.id === activeId ? ' active' : '');
      btn.dataset.id = ep.id;
      btn.innerHTML = `<span class="m ${ep.method.toLowerCase()}">${ep.method}</span><span class="p">${ep.path}</span>`;
      btn.addEventListener('click', () => selectEndpoint(ep.id));
      li.appendChild(btn);
      docsList.appendChild(li);
    });
  });

  if (!found) {
    const empty = document.createElement('li');
    empty.className = 'docs-list-empty';
    empty.textContent = 'Tidak ada endpoint yang cocok.';
    docsList.appendChild(empty);
  }
}

function selectEndpoint(id) {
  activeId = id;
  activeCodeTab = 'curl';
  docsList.querySelectorAll('.docs-list-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
  renderDetail();
}

// Jika endpoint aktif tidak ikut hasil filter/pencarian, pindah ke hasil pertama.
function ensureActive() {
  const list = visibleEndpoints();
  if (!list.length) { activeId = null; return; }
  if (!list.some(e => e.id === activeId)) activeId = list[0].id;
}

function copyButton(id, label) {
  return `<button type="button" class="code-copy" id="${id}" aria-label="${label}">${copyIcon}</button>`;
}

function flashCopied(btn) {
  btn.classList.add('copied');
  setTimeout(() => btn.classList.remove('copied'), 1300);
}

async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); flashCopied(btn); } catch (e) {}
}

function renderDetail() {
  const ep = window.SHZPAY.byId(activeId);
  if (!ep) {
    docsDetail.innerHTML = '<p class="dd-desc">Pilih endpoint di sebelah kiri untuk melihat detailnya.</p>';
    return;
  }

  const paramRows = ep.params.length ? ep.params.map(p => `
    <tr>
      <td><span class="param-name">${p.name}</span></td>
      <td><span class="param-type">${p.type}</span></td>
      <td><span class="param-req ${p.required ? 'yes' : 'no'}">${p.required ? 'wajib' : 'opsional'}</span></td>
      <td>${p.desc}</td>
    </tr>`).join('') : '<tr><td colspan="4">Tidak ada parameter.</td></tr>';

  const codeMap = {
    curl: window.SHZPAY.curlFor(ep, null, true),
    javascript: window.SHZPAY.jsFor(ep, null, true)
  };
  const respText = window.SHZPAY.sample(ep);
  const errText = window.SHZPAY.errorSample(ep);
  const bodyNote = ep.method === 'POST'
    ? '<p class="dd-note">Endpoint ini menerima body JSON dengan header <span class="mono">Content-Type: application/json</span>.</p>'
    : '';

  docsDetail.innerHTML = `
    <div class="dd-head">
      <span class="m ${ep.method.toLowerCase()}">${ep.method}</span>
      <span class="p">${ep.path}</span>
    </div>
    <p class="dd-desc">${ep.desc}</p>

    <p class="dd-subtitle">Parameter</p>
    <div class="ep-table-wrap">
      <table class="param-table">
        <thead><tr><th>Nama</th><th>Tipe</th><th>Status</th><th>Deskripsi</th></tr></thead>
        <tbody>${paramRows}</tbody>
      </table>
    </div>
    ${bodyNote}

    <p class="dd-subtitle">Contoh permintaan</p>
    <div class="code-tabs" role="tablist">
      <button type="button" role="tab" class="code-tab ${activeCodeTab === 'curl' ? 'active' : ''}" data-tab="curl" aria-selected="${activeCodeTab === 'curl'}">cURL</button>
      <button type="button" role="tab" class="code-tab ${activeCodeTab === 'javascript' ? 'active' : ''}" data-tab="javascript" aria-selected="${activeCodeTab === 'javascript'}">JavaScript</button>
    </div>
    <div class="code-block-wrap">
      <div class="code-block"><pre id="codeSample"></pre></div>
      ${copyButton('copyCodeBtn', 'Salin kode')}
    </div>

    <div class="resp-label"><span class="d"></span><span>Contoh respons, 200 OK</span></div>
    <div class="code-block-wrap">
      <div class="code-block"><pre id="respSample">${highlight(respText)}</pre></div>
      ${copyButton('copyRespBtn', 'Salin respons')}
    </div>
    ${ep.note ? `<p class="dd-note">${ep.note}</p>` : ''}

    ${errText ? `
    <div class="resp-label"><span class="d d-err"></span><span>Jika parameter kosong, 400 Bad Request</span></div>
    <div class="code-block-wrap">
      <div class="code-block"><pre>${highlight(errText)}</pre></div>
    </div>` : ''}

    <p class="dd-try"><a class="link-more" href="playground.html?ep=${ep.id}">Coba endpoint ini di Coba API</a></p>
  `;

  document.getElementById('codeSample').textContent = codeMap[activeCodeTab];

  docsDetail.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => { activeCodeTab = tab.dataset.tab; renderDetail(); });
  });
  document.getElementById('copyCodeBtn').addEventListener('click', e => copyText(codeMap[activeCodeTab], e.currentTarget));
  document.getElementById('copyRespBtn').addEventListener('click', e => copyText(respText, e.currentTarget));
}

function refresh() {
  ensureActive();
  renderList();
  renderDetail();
}

document.getElementById('filterRow').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  currentFilter = chip.dataset.filter;
  document.querySelectorAll('#filterRow .filter-chip').forEach(c => c.classList.toggle('active', c === chip));
  history.replaceState(null, '', currentFilter === 'all' ? 'docs.html' : `docs.html?cat=${currentFilter}`);
  refresh();
});

docsSearch.addEventListener('input', refresh);

// Keadaan awal: kategori dari URL, dan ?ep= untuk membuka endpoint tertentu.
document.querySelectorAll('#filterRow .filter-chip').forEach(c => {
  c.classList.toggle('active', c.dataset.filter === currentFilter);
});
const requested = window.SHZPAY.byId(urlParams.get('ep'));
if (requested) {
  activeId = requested.id;
  if (currentFilter !== 'all' && requested.cat !== currentFilter) {
    currentFilter = requested.cat;
    document.querySelectorAll('#filterRow .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === currentFilter));
  }
}
refresh();
