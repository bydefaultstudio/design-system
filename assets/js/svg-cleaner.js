/**
 * svg-cleaner.js — SVG Cleaner browser UI
 * Loaded globally; exposes window.initSvgCleaner for bd-site-init.js
 * to call on initial load and after every Barba navigation.
 * Extracted from tools/svg-cleaner.html inline script.
 * @version 3.3.0
 */

(function () {
  'use strict';

  console.log('[SVG Cleaner] v3.3.0 loaded');

  //
  //------- Utility Functions -------//
  //

  function stripComments(svg) {
    return svg.replace(/<!--[\s\S]*?-->/g, '');
  }

  function stripMetadata(svg) {
    var result = svg;
    result = result.replace(/\s+data-name="[^"]*"/g, '');
    result = result.replace(/\s+data-id="[^"]*"/g, '');
    result = result.replace(/\s+class="(?:cls|st)-?\d+"/g, '');
    return result;
  }

  function roundDecimals(svg, precision) {
    return svg.replace(/(\d+\.\d+)/g, function (_match, num) {
      return parseFloat(parseFloat(num).toFixed(precision)).toString();
    });
  }

  function optimisePathData(svg) {
    return svg.replace(/\s+d="([^"]*)"/g, function (_match, pathData) {
      var optimised = pathData;
      optimised = optimised.replace(/,/g, ' ');
      optimised = optimised.replace(/\s{2,}/g, ' ');
      optimised = optimised.replace(/([A-Za-z])\s+/g, '$1');
      optimised = optimised.replace(/\s+(-)/g, '$1');
      return ' d="' + optimised.trim() + '"';
    });
  }

  function minifySVG(svg) {
    var result = optimisePathData(svg);
    result = result.replace(/\n/g, '').replace(/\s{2,}/g, ' ').replace(/>\s+</g, '><').trim();
    return result;
  }

  function sanitiseName(name) {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  }

  //
  //------- SVG-to-CSS -------//
  //

  function svgToDataURI(svg) {
    var encoded = svg.replace(/#/g, '%23').replace(/\?/g, '%3F').replace(/[\t\n\r]/gm, '')
      .replace(/\s\s+/g, ' ').replace(/'/g, '"').replace(/> </g, '><');
    return "url('data:image/svg+xml," + encoded + "')";
  }

  function wrapCSSHelper(dataURI, format) {
    switch (format) {
      case 'basic':
        return 'background-image: ' + dataURI + ';';
      case 'advanced':
        return '/* background-color: #FFFFFF; */\n'
          + 'background-image: ' + dataURI + ';\n'
          + '/* background-attachment: fixed | scroll; */\n'
          + '/* background-size: auto | cover | contain | 500px 250px; */\n'
          + '/* background-position: center | right 30px bottom 15px; */\n'
          + '/* background-repeat: no-repeat | repeat | repeat-x; */\n'
          + '/* background-origin: border-box | padding-box | content-box; */\n'
          + '/* background-clip: border-box | padding-box | content-box; */\n'
          + '/* background-blend-mode: multiply | screen | overlay; */';
      case 'bullets':
        return 'li {\n  list-style-image: ' + dataURI + ';\n}\nli::marker {\n  font-size: 1.5em;\n  line-height: 0.1em;\n}';
      case 'class':
        return '.your-class {\n  background-image: ' + dataURI + ';\n}';
      default:
        return dataURI;
    }
  }

  //
  //------- Core Processing -------//
  //

  function processSVG(svgCode, options) {
    var code = svgCode;
    var svgMatch = code.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) code = svgMatch[0];

    var origW = null, origH = null;
    if (options.logo) {
      var wm = code.match(/<svg[^>]*?\s+width="([^"]*?)"/i);
      var hm = code.match(/<svg[^>]*?\s+height="([^"]*?)"/i);
      if (wm) origW = wm[1];
      if (hm) origH = hm[1];

      // Fall back to viewBox dimensions when width/height attributes are missing
      if (!origW || !origH) {
        var vbm = code.match(/<svg[^>]*?\s+viewBox="([^"]*?)"/i);
        if (vbm) {
          var vbParts = vbm[1].split(/[\s,]+/);
          if (!origW && vbParts.length >= 3) origW = vbParts[2];
          if (!origH && vbParts.length >= 4) origH = vbParts[3];
        }
      }
    }

    code = code.replace(/<svg([^>]*?)\s+xmlns(?::xlink)?="[^"]*"([^>]*?)>/g, '<svg$1$2>');
    code = code.replace(/<svg([^>]*?)\s+xmlns(?::xlink)?="[^"]*"([^>]*?)>/g, '<svg$1$2>');

    var applySize = options.size || options.logo || options.icon;
    code = code.replace(/<svg([^>]*?)>/, function (_m, attrs) {
      var a = attrs;
      if (applySize) {
        a = a.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '');
        a += ' width="100%" height="100%"';
      } else {
        // Set explicit width/height from viewBox when missing
        var vbm = a.match(/viewBox="([^"]*?)"/i);
        if (vbm) {
          var parts = vbm[1].split(/[\s,]+/);
          if (parts.length >= 4) {
            if (!/\s+width="/i.test(a)) a += ' width="' + parts[2] + '"';
            if (!/\s+height="/i.test(a)) a += ' height="' + parts[3] + '"';
          }
        }
      }
      if (options.standalone || options.css) a += ' xmlns="http://www.w3.org/2000/svg"';
      return '<svg' + a + '>';
    });

    if (options.currentColor) {
      code = code.replace(/<(path|rect|circle|ellipse|polygon|polyline|line)([^>]*?)(\/?)\s*>/g, function (_m, tag, attrs, selfClose) {
        if (attrs.includes('fill=')) attrs = attrs.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        else attrs += ' fill="currentColor"';
        if (attrs.includes('style=')) {
          attrs = attrs.replace(/style="([^"]*?)"/g, function (_sm, s) {
            var ns = s.replace(/fill\s*:\s*[^;]+/g, 'fill: currentColor');
            if (!s.includes('fill:')) return 'style="' + s + '; fill: currentColor"';
            return 'style="' + ns + '"';
          });
        }
        return '<' + tag + attrs + selfClose + '>';
      });
    }

    if (options.stripComments) code = stripComments(code);
    if (options.stripMetadata) code = stripMetadata(code);
    if (options.precision !== null) code = roundDecimals(code, options.precision);
    if (options.minify) code = minifySVG(code);

    var result = code.trim();
    if (options.standalone) result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result;

    if (options.logo) {
      var ln = sanitiseName(options.logoName || 'default');
      var as = (origW && origH) ? ' style="aspect-ratio: ' + origW + ' / ' + origH + '"' : '';
      result = result.replace(/<svg([^>]*)>/, '<svg data-logo="' + ln + '"$1>');
      result = '<div class="svg-logo"' + as + '>\n  ' + result + '\n</div>';
    }

    if (options.icon && !options.logo) {
      if (options.iconName) {
        var icn = sanitiseName(options.iconName);
        result = result.replace(/<svg([^>]*)>/, '<svg data-icon="' + icn + '"$1>');
      }
      result = '<div class="svg-icn">\n  ' + result + '\n</div>';
    }

    if (options.css) {
      var uri = svgToDataURI(result);
      result = wrapCSSHelper(uri, options.cssFormat);
    }

    return result;
  }

  //
  //------- UI -------//
  //

  var MODE_BUTTONS = null;

  function getActiveMode() {
    var active = document.querySelector('#mode-selector .segmented-control-btn.is-active');
    return active ? active.getAttribute('data-mode') : null;
  }

  function updateContext() {
    var mode = getActiveMode();
    document.getElementById('opt-icon-name').style.display = mode === 'icon' ? '' : 'none';
    document.getElementById('opt-logo-name').style.display = mode === 'logo' ? '' : 'none';
    document.getElementById('opt-image-filename').style.display = mode === 'image' ? '' : 'none';
    document.getElementById('ctx-css').style.display = mode === 'css' ? '' : 'none';
  }

  function applyLocks() {
    var mode = getActiveMode();
    var size = document.getElementById('opt-size');
    var color = document.getElementById('opt-current-color');
    var comments = document.getElementById('opt-strip-comments');
    var sizeW = document.getElementById('toggle-size');
    var colorW = document.getElementById('toggle-color');
    var commentsW = document.getElementById('toggle-strip-comments');

    size.disabled = false; color.disabled = false; comments.disabled = false;
    sizeW.classList.remove('is-disabled');
    colorW.classList.remove('is-disabled');
    commentsW.classList.remove('is-disabled');

    if (mode === 'icon' || mode === 'logo') {
      size.checked = true; size.disabled = true; sizeW.classList.add('is-disabled');
      color.checked = true; color.disabled = true; colorW.classList.add('is-disabled');
      comments.checked = true; comments.disabled = true; commentsW.classList.add('is-disabled');
    } else if (mode === 'image') {
      color.checked = false; color.disabled = true; colorW.classList.add('is-disabled');
      size.checked = false; size.disabled = true; sizeW.classList.add('is-disabled');
    } else if (mode === 'css') {
      color.checked = false; color.disabled = true; colorW.classList.add('is-disabled');
    } else {
      color.checked = true;
      comments.checked = true;
    }
  }

  function updateUI() {
    var mode = getActiveMode();
    var saveGroup = document.getElementById('save-group');
    var outGroup = document.getElementById('output-group');
    var copyGroup = document.getElementById('copy-group');

    if (mode === 'image') {
      saveGroup.style.display = '';
      outGroup.style.display = 'none';
      copyGroup.style.display = 'none';
    } else {
      saveGroup.style.display = 'none';
      outGroup.style.display = '';
      copyGroup.style.display = '';
    }
  }

  // Auto-clean: process SVG and update output (skips Image mode — that needs a button click)
  function autoClean() {
    var mode = getActiveMode();
    if (mode === 'image') return;

    var input = document.getElementById('svg-input').value;
    var output = document.getElementById('svg-output');
    var copyBtn = document.getElementById('copy-btn');

    if (!input.trim()) { output.value = ''; copyBtn.disabled = true; return; }

    var fmt = document.querySelector('input[name="css-format"]:checked');

    var result = processSVG(input, {
      currentColor: document.getElementById('opt-current-color').checked,
      icon: mode === 'icon',
      iconName: document.getElementById('opt-icon-name').value.trim() || null,
      logo: mode === 'logo',
      logoName: document.getElementById('opt-logo-name').value.trim() || null,
      size: document.getElementById('opt-size').checked,
      standalone: false,
      css: mode === 'css',
      cssFormat: fmt ? fmt.value : 'url',
      stripComments: document.getElementById('opt-strip-comments').checked,
      stripMetadata: document.getElementById('opt-strip-metadata').checked,
      precision: document.getElementById('opt-round-decimals').checked ? 2 : null,
      minify: document.getElementById('opt-minify').checked,
    });

    output.value = result;
    copyBtn.disabled = false;
  }

  // Save Image (Image mode only — triggered by button click)
  function handleSaveImage() {
    var input = document.getElementById('svg-input').value;
    if (!input.trim()) return;

    var result = processSVG(input, {
      currentColor: document.getElementById('opt-current-color').checked,
      icon: false, iconName: null, logo: false, logoName: null,
      size: document.getElementById('opt-size').checked,
      standalone: true, css: false, cssFormat: 'url',
      stripComments: document.getElementById('opt-strip-comments').checked,
      stripMetadata: document.getElementById('opt-strip-metadata').checked,
      precision: document.getElementById('opt-round-decimals').checked ? 2 : null,
      minify: document.getElementById('opt-minify').checked,
    });

    var fn = sanitiseName(document.getElementById('opt-image-filename').value.trim() || 'image');
    var blob = new Blob([result], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = fn + '.svg'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleModeClick(btn) {
    var wasActive = btn.classList.contains('is-active');
    MODE_BUTTONS.forEach(function(b) { b.classList.remove('is-active'); });
    if (!wasActive) btn.classList.add('is-active');
    updateContext();
    applyLocks();
    updateUI();
    autoClean();
  }

  //
  //------- Init -------//
  //

  function initSvgCleaner() {
    var modeSelector = document.getElementById('mode-selector');
    if (!modeSelector) return;

    MODE_BUTTONS = modeSelector.querySelectorAll('.segmented-control-btn');

    // Save Image button (Image mode only)
    var saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.addEventListener('click', handleSaveImage);

    // Segmented control
    MODE_BUTTONS.forEach(function(btn) {
      btn.addEventListener('click', function() { handleModeClick(btn); });
    });

    // Auto-clean on SVG input
    var svgInput = document.getElementById('svg-input');
    if (svgInput) svgInput.addEventListener('input', autoClean);

    // Auto-clean on any toggle change
    var toggles = document.querySelectorAll('.form-toggle input[type="checkbox"]');
    toggles.forEach(function(toggle) {
      toggle.addEventListener('change', autoClean);
    });

    // Auto-clean on CSS format change
    var cssRadios = document.querySelectorAll('input[name="css-format"]');
    cssRadios.forEach(function(radio) {
      radio.addEventListener('change', autoClean);
    });

    // Auto-clean on name input change
    var iconName = document.getElementById('opt-icon-name');
    var logoName = document.getElementById('opt-logo-name');
    if (iconName) iconName.addEventListener('input', autoClean);
    if (logoName) logoName.addEventListener('input', autoClean);

    console.log('[SVG Cleaner] init');
  }

  window.initSvgCleaner = initSvgCleaner;
})();
