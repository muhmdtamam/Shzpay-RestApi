const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach((el, i) => {
    if (reduceMotion) { el.classList.add('is-visible'); return; }
    setTimeout(() => el.classList.add('is-visible'), i * 90);
  });

  try {
    const p = window.location.pathname;
    if (p && p !== '/' && p !== '/404.html') {
      document.getElementById('reqPath').textContent = p;
    }
  } catch (e) {}
