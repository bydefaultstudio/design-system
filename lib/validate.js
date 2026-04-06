/**
 * validate.js — Sanitise and resolve all placeholder params. Never throws.
 */

var COLORS = require('./colors');

var MIN = 10;
var MAX = 4000;

function resolveColor(raw) {
  if (raw == null || raw === '') { return null; }
  var val = String(raw).toLowerCase().trim();

  if (COLORS[val] !== undefined) { return COLORS[val]; }

  var hex = val.replace(/^#/, '');

  if (/^[0-9a-f]{3}$/.test(hex)) {
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (/^[0-9a-f]{6}$/.test(hex)) {
    return hex;
  }

  return null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeText(str) {
  var escaped = String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped.length > 100 ? escaped.substring(0, 100) : escaped;
}

function validate(params) {
  var width = clamp(params.width || MIN, MIN, MAX);
  var height = clamp(params.height || MIN, MIN, MAX);
  var bg = resolveColor(params.bg) || 'cccccc';
  var fg = resolveColor(params.fg) || '333333';

  var textLines = String(params.text || (width + ' \u00d7 ' + height))
    .split('\n')
    .map(escapeText);
  var text = textLines.join('\n');

  return {
    width: width,
    height: height,
    bg: bg,
    fg: fg,
    text: text,
  };
}

module.exports = validate;
