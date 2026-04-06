/**
 * image.js — Netlify Function for the image placeholder generator.
 * Returns an SVG image based on URL path and query parameters.
 */

var parse    = require('../../lib/parse');
var validate = require('../../lib/validate');
var generate = require('../../lib/generate');

exports.handler = async function handleImageRequest(event) {
  try {
    var raw    = parse(event.path || '', event.queryStringParameters || {});
    var params = validate(raw);
    var svg    = generate(params);
    return {
      statusCode: 200,
      headers: {
        'Content-Type':           'image/svg+xml',
        'Cache-Control':          'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
      body: svg,
    };
  } catch (err) {
    console.error('Image placeholder error:', err);
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Bad request. Try /image/400x300 or /image/600x400/orange/white',
    };
  }
};
