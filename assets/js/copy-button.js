// Copy button — handles all .copy-btn[data-copy] elements
(function () {
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    navigator.clipboard.writeText(text).then(function () {
      btn.classList.add('is-copied');
      setTimeout(function () { btn.classList.remove('is-copied'); }, 2000);
    });
  });
})();
