/**
 * placeholder-run.js — Plain Node test script for the image placeholder tool.
 * Run: node test/placeholder-run.js
 */

var parse = require('../lib/parse');
var validate = require('../lib/validate');
var generate = require('../lib/generate');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS: ' + name);
  } catch (err) {
    failed++;
    console.log('FAIL: ' + name);
    console.log('  ' + err.message);
    if (err.svg) {
      console.log('  SVG output:');
      console.log('  ' + err.svg);
    }
  }
}

function assert(condition, message, svg) {
  if (!condition) {
    var err = new Error(message);
    if (svg) { err.svg = svg; }
    throw err;
  }
}

function run(path, query) {
  var raw = parse(path, query || {});
  var params = validate(raw);
  var svg = generate(params);
  return { params: params, svg: svg };
}

test('/image/400x300 — default colours, label is "400 \u00d7 300"', function testDefaultDims() {
  var result = run('/image/400x300');
  assert(result.params.width === 400, 'width should be 400, got ' + result.params.width);
  assert(result.params.height === 300, 'height should be 300, got ' + result.params.height);
  assert(result.params.bg === 'cccccc', 'bg should be cccccc, got ' + result.params.bg);
  assert(result.params.fg === '333333', 'fg should be 333333, got ' + result.params.fg);
  assert(result.svg.indexOf('400 \u00d7 300') !== -1, 'SVG should contain "400 \u00d7 300"', result.svg);
});

test('/image/400 — square: width === height === 400', function testSquare() {
  var result = run('/image/400');
  assert(result.params.width === 400, 'width should be 400, got ' + result.params.width);
  assert(result.params.height === 400, 'height should be 400, got ' + result.params.height);
});

test('/image/600x400/orange/white — CSS names resolved', function testCssNames() {
  var result = run('/image/600x400/orange/white');
  assert(result.params.bg === 'ffa500', 'bg should be ffa500 (orange), got ' + result.params.bg);
  assert(result.params.fg === 'ffffff', 'fg should be ffffff (white), got ' + result.params.fg);
});

test('/image/600x400/transparent/F00 — checkerboard bg, fg red', function testTransparent() {
  var result = run('/image/600x400/transparent/F00');
  assert(result.params.bg === 'transparent', 'bg should be transparent, got ' + result.params.bg);
  assert(result.params.fg === 'ff0000', 'fg should be ff0000, got ' + result.params.fg);
  assert(result.svg.indexOf('pattern') !== -1, 'SVG should contain checkerboard pattern', result.svg);
});

test('/image/600x400/FFF/000 — 3-digit hex expanded', function testShortHex() {
  var result = run('/image/600x400/FFF/000');
  assert(result.params.bg === 'ffffff', 'bg should be ffffff, got ' + result.params.bg);
  assert(result.params.fg === '000000', 'fg should be 000000, got ' + result.params.fg);
});

test('/image/9x9 — clamped to 10x10', function testMinClamp() {
  var result = run('/image/9x9');
  assert(result.params.width === 10, 'width should be clamped to 10, got ' + result.params.width);
  assert(result.params.height === 10, 'height should be clamped to 10, got ' + result.params.height);
});

test('/image/9999x9999 — clamped to 4000x4000', function testMaxClamp() {
  var result = run('/image/9999x9999');
  assert(result.params.width === 4000, 'width should be clamped to 4000, got ' + result.params.width);
  assert(result.params.height === 4000, 'height should be clamped to 4000, got ' + result.params.height);
});

test('/image/abc/notahex/gggggg — all fallback to defaults', function testInvalidInput() {
  var result = run('/image/abc/notahex/gggggg');
  assert(result.params.width === 10, 'width should fall back to min (10), got ' + result.params.width);
  assert(result.params.height === 10, 'height should fall back to min (10), got ' + result.params.height);
  assert(result.params.bg === 'cccccc', 'bg should fall back to cccccc, got ' + result.params.bg);
  assert(result.params.fg === '333333', 'fg should fall back to 333333, got ' + result.params.fg);
});

test('?text=Hello\\nWorld — two <tspan> elements', function testMultiline() {
  var result = run('/image/600x400', { text: 'Hello\\nWorld' });
  var tspanCount = (result.svg.match(/<tspan/g) || []).length;
  assert(tspanCount === 2, 'Should have 2 <tspan> elements, got ' + tspanCount, result.svg);
});

test('?text=<script>alert(1)</script> — HTML escaped', function testXss() {
  var result = run('/image/600x400', { text: '<script>alert(1)</script>' });
  assert(result.svg.indexOf('<script>') === -1, 'SVG should not contain raw <script> tag', result.svg);
  assert(result.svg.indexOf('&lt;script&gt;') !== -1, 'SVG should contain escaped script tag', result.svg);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) { process.exit(1); }
