/**
 * image-placeholder.js — Image Placeholder Tool UI
 * v1.3
 */

(function () {
  'use strict';

  var BASE_URL = '/image/';
  var CSS_COLORS = {
    aliceblue:'f0f8ff',antiquewhite:'faebd7',aqua:'00ffff',aquamarine:'7fffd4',
    azure:'f0ffff',beige:'f5f5dc',bisque:'ffe4c4',black:'000000',
    blanchedalmond:'ffebcd',blue:'0000ff',blueviolet:'8a2be2',brown:'a52a2a',
    burlywood:'deb887',cadetblue:'5f9ea0',chartreuse:'7fff00',chocolate:'d2691e',
    coral:'ff7f50',cornflowerblue:'6495ed',cornsilk:'fff8dc',crimson:'dc143c',
    cyan:'00ffff',darkblue:'00008b',darkcyan:'008b8b',darkgoldenrod:'b8860b',
    darkgray:'a9a9a9',darkgrey:'a9a9a9',darkgreen:'006400',darkkhaki:'bdb76b',
    darkmagenta:'8b008b',darkolivegreen:'556b2f',darkorange:'ff8c00',
    darkorchid:'9932cc',darkred:'8b0000',darksalmon:'e9967a',darkseagreen:'8fbc8f',
    darkslateblue:'483d8b',darkslategray:'2f4f4f',darkslategrey:'2f4f4f',
    darkturquoise:'00ced1',darkviolet:'9400d3',deeppink:'ff1493',
    deepskyblue:'00bfff',dimgray:'696969',dimgrey:'696969',dodgerblue:'1e90ff',
    firebrick:'b22222',floralwhite:'fffaf0',forestgreen:'228b22',fuchsia:'ff00ff',
    gainsboro:'dcdcdc',ghostwhite:'f8f8ff',gold:'ffd700',goldenrod:'daa520',
    gray:'808080',grey:'808080',green:'008000',greenyellow:'adff2f',
    honeydew:'f0fff0',hotpink:'ff69b4',indianred:'cd5c5c',indigo:'4b0082',
    ivory:'fffff0',khaki:'f0e68c',lavender:'e6e6fa',lavenderblush:'fff0f5',
    lawngreen:'7cfc00',lemonchiffon:'fffacd',lightblue:'add8e6',lightcoral:'f08080',
    lightcyan:'e0ffff',lightgoldenrodyellow:'fafad2',lightgray:'d3d3d3',
    lightgrey:'d3d3d3',lightgreen:'90ee90',lightpink:'ffb6c1',lightsalmon:'ffa07a',
    lightseagreen:'20b2aa',lightskyblue:'87cefa',lightslategray:'778899',
    lightslategrey:'778899',lightyellow:'ffffe0',lightsteelblue:'b0c4de',
    lime:'00ff00',limegreen:'32cd32',linen:'faf0e6',magenta:'ff00ff',
    maroon:'800000',mediumaquamarine:'66cdaa',mediumblue:'0000cd',
    mediumorchid:'ba55d3',mediumpurple:'9370db',mediumseagreen:'3cb371',
    mediumslateblue:'7b68ee',mediumspringgreen:'00fa9a',mediumturquoise:'48d1cc',
    mediumvioletred:'c71585',midnightblue:'191970',mintcream:'f5fffa',
    mistyrose:'ffe4e1',moccasin:'ffe4b5',navajowhite:'ffdead',navy:'000080',
    oldlace:'fdf5e6',olive:'808000',olivedrab:'6b8e23',orange:'ffa500',
    orangered:'ff4500',orchid:'da70d6',palegoldenrod:'eee8aa',palegreen:'98fb98',
    paleturquoise:'afeeee',palevioletred:'db7093',papayawhip:'ffefd5',
    peachpuff:'ffdab9',peru:'cd853f',pink:'ffc0cb',plum:'dda0dd',
    powderblue:'b0e0e6',purple:'800080',rebeccapurple:'663399',red:'ff0000',
    rosybrown:'bc8f8f',royalblue:'4169e1',saddlebrown:'8b4513',salmon:'fa8072',
    sandybrown:'f4a460',seagreen:'2e8b57',seashell:'fff5ee',sienna:'a0522d',
    silver:'c0c0c0',skyblue:'87ceeb',slateblue:'6a5acd',slategray:'708090',
    slategrey:'708090',snow:'fffafa',springgreen:'00ff7f',steelblue:'4682b4',
    tan:'d2b48c',teal:'008080',thistle:'d8bfd8',tomato:'ff6347',
    turquoise:'40e0d0',violet:'ee82ee',wheat:'f5deb3',white:'ffffff',
    whitesmoke:'f5f5f5',yellow:'ffff00',yellowgreen:'9acd32',transparent:'transparent'
  };

  function resolveColorForPicker(raw) {
    var val = String(raw).toLowerCase().trim();
    if (val === 'transparent') { return null; }
    if (CSS_COLORS[val]) { return '#' + CSS_COLORS[val]; }
    var hex = val.replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      return '#' + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return '#' + hex;
    }
    return null;
  }

  function buildUrl(state) {
    var path = BASE_URL + state.width + 'x' + state.height;

    if (state.bg || state.fg) {
      path += '/' + (state.bg || 'cccccc');
      if (state.fg) {
        path += '/' + state.fg;
      }
    }

    if (state.text) {
      var encoded = state.text.replace(/\n/g, '\\n');
      path += '?text=' + encodeURIComponent(encoded);
    }

    return path;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getCheckboxFlags() {
    var flags = [];
    ['text', 'color'].forEach(function (code) {
      var cb = document.getElementById('opt-' + code);
      if (cb && cb.checked) { flags.push(code); }
    });
    return flags;
  }

  function toggleOptionalElements(flags) {
    document.querySelectorAll('[data-opt]').forEach(function (el) {
      el.style.display = flags.indexOf(el.getAttribute('data-opt')) !== -1 ? '' : 'none';
    });
  }

  function initImageTool() {
    var elWidth = document.getElementById('img-width');
    var elHeight = document.getElementById('img-height');
    var elBgPicker = document.getElementById('bg-picker');
    var elBgText = document.getElementById('bg-text');
    var elFgPicker = document.getElementById('fg-picker');
    var elFgText = document.getElementById('fg-text');
    var elCustomText = document.getElementById('custom-text');
    var elPreview = document.getElementById('img-preview');
    var elUrlOutput = document.getElementById('url-output');
    var elDimsLabel = document.getElementById('dims-label');

    function getState() {
      var w = clamp(parseInt(elWidth.value, 10) || 10, 10, 4000);
      var h = clamp(parseInt(elHeight.value, 10) || 10, 10, 4000);
      var flags = getCheckboxFlags();
      var colourActive = flags.indexOf('color') !== -1;
      var textActive = flags.indexOf('text') !== -1;

      var bg = colourActive ? elBgText.value.trim().toLowerCase() : '';
      var fg = colourActive ? elFgText.value.trim().toLowerCase() : '';
      var text = textActive ? elCustomText.value : '';

      if (bg === 'cccccc') { bg = ''; }
      if (fg === '333333' && !bg) { fg = ''; }

      return { width: w, height: h, bg: bg, fg: fg, text: text };
    }

    function buildPreviewSvg(state) {
      var bg = state.bg || 'cccccc';
      var fg = state.fg || '333333';
      var label = state.text || (state.width + ' \u00d7 ' + state.height);
      var lines = label.split(/\\n|\n/);
      var lineHeight = 1.3;
      var fontSize = Math.max(12, Math.min(state.width, state.height) * 0.08);
      var startY = (state.height / 2) - ((lines.length - 1) * fontSize * lineHeight / 2);

      var tspans = lines.map(function (line, i) {
        return '<tspan x="' + (state.width / 2) + '" dy="' + (i === 0 ? 0 : fontSize * lineHeight) + '">' +
          line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</tspan>';
      }).join('');

      return 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + state.width + '" height="' + state.height + '">' +
        '<rect width="100%" height="100%" fill="#' + bg + '"/>' +
        '<text x="' + (state.width / 2) + '" y="' + startY + '" fill="#' + fg + '"' +
        ' font-family="sans-serif" font-size="' + fontSize + '" text-anchor="middle" dominant-baseline="central">' +
        tspans + '</text></svg>'
      );
    }

    function updatePreview() {
      var state = getState();
      var url = buildUrl(state);
      var fullUrl = window.location.origin + url;

      elPreview.src = buildPreviewSvg(state);
      elPreview.alt = 'Placeholder ' + state.width + ' \u00d7 ' + state.height;
      elUrlOutput.value = fullUrl;
      elDimsLabel.textContent = state.width + ' \u00d7 ' + state.height + ' px';
    }

    function handleDimensionBlur(el) {
      var val = clamp(parseInt(el.value, 10) || 10, 10, 4000);
      el.value = val;
      updatePreview();
    }

    function handleBgTextInput() {
      var resolved = resolveColorForPicker(elBgText.value);
      if (resolved) {
        elBgPicker.value = resolved;
      }
      updatePreview();
    }

    function handleBgPickerInput() {
      elBgText.value = elBgPicker.value.replace('#', '');
      updatePreview();
    }

    function handleFgTextInput() {
      var resolved = resolveColorForPicker(elFgText.value);
      if (resolved) {
        elFgPicker.value = resolved;
      }
      updatePreview();
    }

    function handleFgPickerInput() {
      elFgText.value = elFgPicker.value.replace('#', '');
      updatePreview();
    }

    elWidth.addEventListener('input', updatePreview);
    elHeight.addEventListener('input', updatePreview);
    elWidth.addEventListener('blur', function handleWidthBlur() { handleDimensionBlur(elWidth); });
    elHeight.addEventListener('blur', function handleHeightBlur() { handleDimensionBlur(elHeight); });
    elBgText.addEventListener('input', handleBgTextInput);
    elBgPicker.addEventListener('input', handleBgPickerInput);
    elFgText.addEventListener('input', handleFgTextInput);
    elFgPicker.addEventListener('input', handleFgPickerInput);
    elCustomText.addEventListener('input', updatePreview);

    function handleOptionChange() {
      toggleOptionalElements(getCheckboxFlags());
      updatePreview();
    }

    ['text', 'color'].forEach(function (code) {
      var cb = document.getElementById('opt-' + code);
      if (cb) { cb.addEventListener('change', handleOptionChange); }
    });

    toggleOptionalElements(getCheckboxFlags());
    updatePreview();

    console.log('Image Placeholder v1.3 — init OK');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageTool);
  } else {
    initImageTool();
  }
})();
