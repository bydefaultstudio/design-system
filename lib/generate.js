/**
 * generate.js — Pure function: validated params -> SVG string.
 */

function generate(params) {
  var width = params.width;
  var height = params.height;
  var bg = params.bg;
  var fg = params.fg;
  var text = params.text;

  var cx = width / 2;
  var cy = height / 2;

  var defs = '';
  var background = '';

  if (bg === 'transparent') {
    defs =
      '<defs>' +
        '<pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse">' +
          '<rect width="20" height="20" fill="#eeeeee"/>' +
          '<rect width="10" height="10" fill="#cccccc"/>' +
          '<rect x="10" y="10" width="10" height="10" fill="#cccccc"/>' +
        '</pattern>' +
      '</defs>';
    background = '<rect width="' + width + '" height="' + height + '" fill="url(#checker)"/>';
  } else {
    background = '<rect width="' + width + '" height="' + height + '" fill="#' + bg + '"/>';
  }

  var textColor = fg === 'transparent' ? '000000' : fg;

  var crosshair =
    '<line x1="0" y1="0" x2="' + width + '" y2="' + height + '" stroke="#' + textColor + '" stroke-width="0.5" opacity="0.15"/>' +
    '<line x1="' + width + '" y1="0" x2="0" y2="' + height + '" stroke="#' + textColor + '" stroke-width="0.5" opacity="0.15"/>';

  var fontSize = Math.max(12, Math.min(Math.round(Math.min(width, height) * 0.08), 48));
  var lineHeight = Math.round(fontSize * 1.4);
  var lines = text.split('\n');

  var textEl = '';
  if (lines.length === 1) {
    textEl =
      '<text x="' + cx + '" y="' + cy + '" ' +
        'font-family="system-ui, sans-serif" font-size="' + fontSize + '" font-weight="500" ' +
        'fill="#' + textColor + '" text-anchor="middle" dominant-baseline="central">' +
        lines[0] +
      '</text>';
  } else {
    var blockHeight = lines.length * lineHeight;
    var startY = cy - (blockHeight / 2) + (fontSize / 2);
    var tspans = '';
    for (var i = 0; i < lines.length; i++) {
      var dy = i === 0 ? 0 : lineHeight;
      tspans += '<tspan x="' + cx + '" dy="' + dy + '">' + lines[i] + '</tspan>';
    }
    textEl =
      '<text ' +
        'font-family="system-ui, sans-serif" font-size="' + fontSize + '" font-weight="500" ' +
        'fill="#' + textColor + '" text-anchor="middle" dominant-baseline="central" ' +
        'y="' + startY + '">' +
        tspans +
      '</text>';
  }

  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
      'width="' + width + '" height="' + height + '" ' +
      'viewBox="0 0 ' + width + ' ' + height + '">' +
      defs +
      background +
      crosshair +
      textEl +
    '</svg>';

  return svg;
}

module.exports = generate;
