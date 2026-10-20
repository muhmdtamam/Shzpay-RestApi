(function () {
  const fab = document.getElementById('fabGratitude');
  if (!fab) return;

  function goToGratitude() {
    window.location.href = 'gratitude.html';
  }

  fab.addEventListener('click', goToGratitude);
  fab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToGratitude();
    }
  });
})();
