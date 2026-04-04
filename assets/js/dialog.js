// Dialog component — open/close native <dialog> elements
(function () {
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-dialog-open]');
    if (openBtn) {
      var id = openBtn.getAttribute('data-dialog-open');
      var dialog = document.getElementById(id);
      if (dialog && dialog.tagName === 'DIALOG') dialog.showModal();
    }

    var closeBtn = e.target.closest('[data-dialog-close], .dialog-close');
    if (closeBtn) {
      var dialog = closeBtn.closest('dialog');
      if (dialog) dialog.close();
    }
  });

  document.querySelectorAll('dialog.dialog').forEach(function (dialog) {
    dialog.addEventListener('click', function (e) {
      var rect = dialog.getBoundingClientRect();
      var clickedBackdrop =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom;
      if (clickedBackdrop) dialog.close();
    });
  });
})();
