// Copy button — unified handler for all .copy-btn variants
// Supports data-copy (static value) and data-clipboard-target (element text content)
(function () {
  'use strict';

  var FEEDBACK_DURATION = 2000;

  // Icons reference the studio sprite. The wrapper <div class="svg-icn"> is
  // applied at each call site below.
  var ICON_CHECK = '<svg data-icon="check" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#check"/></svg>';
  var ICON_COPY = '<svg data-icon="copy" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#copy"/></svg>';
  var ICON_DOWNLOAD = '<svg data-icon="download" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#download"/></svg>';

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn, .token-copy');
    if (!btn) return;

    var text;

    // Static value from data-copy attribute
    if (btn.hasAttribute('data-copy')) {
      text = btn.getAttribute('data-copy');
    }

    // Target element text content from data-clipboard-target
    if (!text && btn.hasAttribute('data-clipboard-target')) {
      var target = document.querySelector(btn.getAttribute('data-clipboard-target'));
      if (target) text = target.value || target.textContent;
    }

    if (!text) return;

    copyToClipboard(text).then(function () {
      btn.classList.add('is-copied');

      // Swap tooltip text if present
      var originalTooltip = btn.getAttribute('data-tooltip');
      if (originalTooltip) {
        btn.setAttribute('data-tooltip', 'Copied!');
      }

      setTimeout(function () {
        btn.classList.remove('is-copied');
        if (originalTooltip) {
          btn.setAttribute('data-tooltip', originalTooltip);
        }
      }, FEEDBACK_DURATION);
    });
  });

  // Copy page URL — sticky-bar dropdown action
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.js-copy-url');
    if (!btn) return;

    var iconEl = btn.querySelector('.svg-icn');
    var label = btn.querySelector('span');
    var originalIconHTML = iconEl ? iconEl.innerHTML : '';
    var originalText = label ? label.textContent : '';

    copyToClipboard(window.location.href).then(function () {
      btn.classList.add('is-copied');
      if (iconEl) iconEl.innerHTML = ICON_CHECK;
      if (label) label.textContent = 'Copied';

      setTimeout(function () {
        btn.classList.remove('is-copied');
        if (iconEl) iconEl.innerHTML = originalIconHTML;
        if (label) label.textContent = originalText;
      }, FEEDBACK_DURATION);
    });
  });

  // Color swatch copy — .color-copy-btn with data-format="hex" or "css"
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      var hex = v.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function getComputedHex(element) {
    var rgb = getComputedStyle(element).backgroundColor;
    var match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
  }

  // Initialize color copy buttons with icon structure
  function initColorCopyButtons() {
    var buttons = document.querySelectorAll('.color-copy-btn');
    buttons.forEach(function (btn) {
      if (btn.querySelector('.copy-btn-default')) return;
      var label = btn.textContent;
      btn.innerHTML = '<span class="copy-btn-default"><div class="svg-icn">' + ICON_COPY + '</div> ' + label + '</span>'
        + '<span class="copy-btn-copied"><div class="svg-icn">' + ICON_CHECK + '</div> Copied</span>';
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.color-copy-btn');
    if (!btn) return;

    var row = btn.closest('.color-row');
    if (!row) return;

    var format = btn.getAttribute('data-format');
    var token = row.getAttribute('data-token');
    var text;

    if (format === 'css') {
      text = 'var(' + token + ')';
    } else {
      text = getComputedHex(row);
    }

    if (!text) return;

    copyToClipboard(text).then(function () {
      btn.classList.add('is-copied');
      setTimeout(function () {
        btn.classList.remove('is-copied');
      }, FEEDBACK_DURATION);
    });
  });

  // ── Icon table — auto-generate Copy + Download buttons ──
  // Auto-detects tables whose first <td> contains .svg-icn[data-icon].
  // Appends ghost Copy and Download buttons to each matching row.

  function initIconTables() {
    var tables = document.querySelectorAll('table');

    tables.forEach(function (table) {
      // Detect: first <td> in first body row must contain .svg-icn with a
      // data-icon attribute (on the svg element inside the wrapper)
      var firstRow = table.querySelector('tbody tr');
      if (!firstRow) return;
      var firstCell = firstRow.querySelector('td:first-child');
      if (!firstCell || !firstCell.querySelector('.svg-icn svg[data-icon]')) return;

      // Skip tables already processed
      if (table.classList.contains('icon-table')) return;

      // Mark the table for CSS
      table.classList.add('icon-table');

      // Add header cells for the two new columns
      var thead = table.querySelector('thead tr');
      if (thead) {
        thead.insertAdjacentHTML('beforeend', '<th></th><th></th>');
      }

      var rows = table.querySelectorAll('tbody tr');
      rows.forEach(function (row) {
        var iconSvg = row.querySelector('.svg-icn svg[data-icon]');
        if (!iconSvg) return;

        var iconName = iconSvg.getAttribute('data-icon');
        var fileName = iconName + '.svg';
        var iconEl = iconSvg.closest('.svg-icn');
        var iconHTML = iconEl.outerHTML;

        // Copy button
        var copyTd = document.createElement('td');
        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn is-ghost';
        copyBtn.setAttribute('data-copy', iconHTML);
        copyBtn.setAttribute('aria-label', 'Copy ' + iconName + ' icon code');
        copyBtn.innerHTML = '<span class="copy-btn-default"><div class="svg-icn">' + ICON_COPY + '</div> Copy</span>'
          + '<span class="copy-btn-copied"><div class="svg-icn">' + ICON_CHECK + '</div> Copied</span>';
        copyTd.appendChild(copyBtn);
        row.appendChild(copyTd);

        // Download button
        var dlTd = document.createElement('td');
        var dlBtn = document.createElement('button');
        dlBtn.className = 'copy-btn is-ghost';
        dlBtn.setAttribute('aria-label', 'Download ' + iconName + ' SVG');
        dlBtn.innerHTML = '<div class="svg-icn">' + ICON_DOWNLOAD + '</div> Download';
        dlBtn.addEventListener('click', function () {
          var a = document.createElement('a');
          a.href = '../assets/images/svg-icons/' + encodeURIComponent(fileName);
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
        dlTd.appendChild(dlBtn);
        row.appendChild(dlTd);
      });
    });
  }

  // Auto-enhance any .copy-btn that lacks the two-span structure.
  // Wraps existing content into .copy-btn-default / .copy-btn-copied
  // so the CSS state swap (is-copied) shows a check icon + "Copied".
  function initCopyButtons() {
    var buttons = document.querySelectorAll('.copy-btn');
    buttons.forEach(function (btn) {
      if (btn.querySelector('.copy-btn-default')) return;
      if (btn.classList.contains('color-row')) return;
      var content = btn.innerHTML;
      btn.innerHTML = '<span class="copy-btn-default">' + content + '</span>'
        + '<span class="copy-btn-copied"><div class="svg-icn">' + ICON_CHECK + '</div> Copied</span>';
    });
  }

  function initAll() {
    initCopyButtons();
    initIconTables();
    initColorCopyButtons();
  }

  // Expose for Barba re-init after page transitions
  window.bdInitCopyButtons = initAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
