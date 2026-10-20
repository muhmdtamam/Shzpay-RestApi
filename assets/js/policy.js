const tocLinks = document.querySelectorAll('.toc a');
  const sections = document.querySelectorAll('.policy-section');
  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.toc a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        tocLinks.forEach(l => { l.style.background = ''; l.style.color = ''; });
        link.style.background = 'var(--indigo-soft)';
        link.style.color = 'var(--indigo-dark)';
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => tocObserver.observe(s));
