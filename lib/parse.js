/**
 * parse.js — Extract placeholder params from Netlify event path + query.
 */

function parse(path, query) {
  var cleaned = path
    .replace(/^\/?\.netlify\/functions\/image\/?/, '')
    .replace(/^\/?(image)\/?/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  var segments = cleaned ? cleaned.split('/') : [];
  var dims = segments[0] || '';
  var bgRaw = segments[1] || '';
  var fgRaw = segments[2] || '';

  var width;
  var height;

  if (dims.indexOf('x') !== -1) {
    var parts = dims.split('x');
    width = parseInt(parts[0], 10) || 0;
    height = parseInt(parts[1], 10) || 0;
  } else {
    width = parseInt(dims, 10) || 0;
    height = width;
  }

  var text;
  if (query && query.text != null) {
    text = decodeURIComponent(query.text)
      .replace(/\\n/g, '\n');
  } else {
    text = width + ' \u00d7 ' + height;
  }

  return {
    width: width,
    height: height,
    bg: bgRaw,
    fg: fgRaw,
    text: text,
  };
}

module.exports = parse;
