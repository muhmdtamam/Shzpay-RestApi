const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sbOverlay');
const menuToggle = document.getElementById('menuToggle');

function setSidebar(open) {
  if (!sidebar) return;
  sidebar.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('open', open);
  if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
}

if (menuToggle && sidebar) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));
  if (overlay) overlay.addEventListener('click', () => setSidebar(false));
  sidebar.querySelectorAll('.sb-link').forEach(a => a.addEventListener('click', () => setSidebar(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setSidebar(false); });
}

requestAnimationFrame(() => {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
});

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('shzpay-theme', 'light'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('shzpay-theme', 'dark'); } catch (e) {}
    }
  });
}
