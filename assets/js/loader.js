(function () {
  var loader = document.getElementById('pageLoader');
  if (!loader) return;

  var hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;

    loader.classList.add('is-hidden');

    setTimeout(function () {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 550);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(hideLoader, 150);
    }, { once: true });
  } else {
    setTimeout(hideLoader, 150);
  }

  setTimeout(hideLoader, 1500);
})();