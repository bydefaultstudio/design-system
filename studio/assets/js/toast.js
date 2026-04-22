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
    toast.className = 'toast';
    if (type !== 'default') toast.setAttribute('data-type', type);
    toast.setAttribute('role', 'alert');
    toast.innerHTML =
      '<span class="toast-message">' + escapeHTML(message) + '</span>' +
      '<button class="toast-close" aria-label="Dismiss"><div class="svg-icn"><svg data-icon="close" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div></button>';

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
