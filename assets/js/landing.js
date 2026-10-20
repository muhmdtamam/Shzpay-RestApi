const { endpoints, categories } = window.SHZPAY;

// Satu pemunculan halus saat dimuat, bukan efek per bagian.
requestAnimationFrame(() => {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
});

// Angka pada hero mengikuti katalog endpoint.
const statEndpoints = document.getElementById('statEndpoints');
const statCategories = document.getElementById('statCategories');
const termEndpoints = document.getElementById('termEndpoints');
if (statEndpoints) statEndpoints.textContent = endpoints.length;
if (statCategories) statCategories.textContent = categories.length;
if (termEndpoints) termEndpoints.textContent = endpoints.length;

// Terminal: perintah diketik sekali, lalu balasan muncul baris demi baris dan diam.
// Klik pada package manager memutar ulang animasinya dengan perintah yang sesuai.
const PM = {
  npm:  { cmd: 'npm install @shzpay/api', out: 'added 1 package in 2s' },
  pnpm: { cmd: 'pnpm add @shzpay/api',    out: 'Packages: +1' },
  yarn: { cmd: 'yarn add @shzpay/api',    out: 'success Saved 1 new dependency.' }
};

const term = document.getElementById('term');
if (term) initTerminal();

function initTerminal() {
  const cmdEl = document.getElementById('termCmd');
  const caretEl = document.getElementById('termCaret');
  const outEl = document.getElementById('termOut');
  const copyBtn = document.getElementById('termCopy');
  const tabs = [...term.querySelectorAll('.term-tab')];
  const steps = [...term.querySelectorAll('[data-step]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 'npm';
  let run = 0;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const show = el => el.classList.remove('is-off');
  const hide = el => el.classList.add('is-off');

  async function play(pm, delay) {
    const id = ++run; // putaran baru membatalkan putaran yang masih berjalan
    const { cmd, out } = PM[pm];
    outEl.textContent = out;

    // Tanpa animasi: langsung tampilkan hasil akhir.
    if (reduceMotion) {
      cmdEl.textContent = cmd;
      hide(caretEl);
      steps.forEach(show);
      return;
    }

    steps.forEach(hide);
    cmdEl.textContent = '';
    show(caretEl);
    await sleep(delay);

    for (const ch of cmd) {
      if (id !== run) return;
      cmdEl.textContent += ch;
      await sleep(26 + Math.random() * 30);
    }
    if (id !== run) return;

    await sleep(300);
    hide(caretEl);
    await sleep(350);

    for (const el of steps) {
      if (id !== run) return;
      show(el);
      await sleep(el === outEl ? 450 : 70);
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    current = tab.dataset.pm;
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    play(current, 150);
  }));

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Cadangan untuk halaman non-HTTPS atau browser lama.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  let copyTimer;
  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(PM[current].cmd);
    copyBtn.textContent = ok ? 'Tersalin' : 'Gagal menyalin';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyBtn.textContent = 'Salin'; }, 1600);
  });

  // Mulai setelah layar pemuatan hilang.
  play(current, 900);
}
