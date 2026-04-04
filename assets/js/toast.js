/**
 * Toast component
 * Call window.showToast(message, type, duration) to display a notification.
 * Types: 'default', 'success', 'warning', 'danger', 'info'
 *
 * @version 1.0.0
 */
(function () {
  function getContainer() {
    var c = document.querySelector('.toast-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'toast-container';
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-atomic', 'false');
      document.body.appendChild(c);
    }
    return c;
  }

  window.showToast = function (message, type, duration) {
    type = type || 'default';
    duration = duration || 4000;

    var container = getContainer();
    var toast = document.createElement('div');
    toast.className = 'toast' + (type !== 'default' ? ' toast--' + type : '');
    toast.setAttribute('role', 'alert');
    toast.innerHTML =
      '<span class="toast-message">' + escapeHTML(message) + '</span>' +
      '<button class="toast-close" aria-label="Dismiss">&times;</button>';

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', function () {
      dismiss(toast);
    });

    setTimeout(function () { dismiss(toast); }, duration);
  };

  function dismiss(toast) {
    toast.style.opacity = '0';
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  console.log('[toast] v1.0.0 — init');
})();
