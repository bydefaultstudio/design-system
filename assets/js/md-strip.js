// Markdown strip — intercepts download/open-in-tab links to deliver clean markdown
// Removes YAML frontmatter and block-level HTML tags before delivery
// Version: 1.0.0
(function () {
  'use strict';

  var BLOCK_TAGS = 'div|section|aside|figure|figcaption|article|header|footer|main|nav|details|summary';
  var BLOCK_OPEN_RE = new RegExp('<(' + BLOCK_TAGS + ')(\\s[^>]*)?>\\s*', 'gi');
  var BLOCK_CLOSE_RE = new RegExp('\\s*</(' + BLOCK_TAGS + ')>', 'gi');
  var FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n*/;
  var EXCESS_BLANKS_RE = /\n{3,}/g;

  function cleanMarkdown(raw) {
    var cleaned = raw
      .replace(FRONTMATTER_RE, '')
      .replace(BLOCK_OPEN_RE, '')
      .replace(BLOCK_CLOSE_RE, '')
      .replace(EXCESS_BLANKS_RE, '\n\n')
      .trim() + '\n';
    return cleaned;
  }

  function getFilename(href) {
    var parts = href.split('/');
    return parts[parts.length - 1] || 'document.md';
  }

  function handleClick(e) {
    var downloadLink = e.target.closest('.js-md-download');
    var openLink = e.target.closest('.js-md-open');
    var link = downloadLink || openLink;
    if (!link) return;

    e.preventDefault();

    var href = link.getAttribute('href');
    if (!href) return;

    fetch(href)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to fetch: ' + response.status);
        return response.text();
      })
      .then(function (raw) {
        var cleaned = cleanMarkdown(raw);
        var blob = new Blob([cleaned], { type: 'text/markdown' });
        var url = URL.createObjectURL(blob);

        if (downloadLink) {
          var a = document.createElement('a');
          a.href = url;
          a.download = getFilename(href);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          var win = window.open(url, '_blank');
          if (win) {
            win.addEventListener('load', function () {
              URL.revokeObjectURL(url);
            });
          }
        }
      });
  }

  document.addEventListener('click', handleClick);

  console.log('[md-strip] v1.0.0 initialised');
})();
