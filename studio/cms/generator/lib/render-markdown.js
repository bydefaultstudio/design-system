/**
 * Markdown + shortcode pipeline.
 *
 * Pipeline per body:
 *   1. Process block shortcodes: {{name attrs}}...{{/name}}
 *   2. Process inline shortcodes: {{name attrs}} and {{icon:name}}
 *   3. Render remaining markdown with `marked`
 *
 * Block shortcodes are processed first so their inner content (still markdown)
 * can be recursed through the pipeline. Inline shortcodes are protected with
 * placeholder tokens so marked does not mangle them, then re-inserted.
 */

"use strict";

const { marked } = require("marked");
const fs = require("fs");
const path = require("path");

// ---- Icon registry ----
// Loaded lazily from the canonical assets/images/svg-icons/ directory.
let ICON_CACHE = null;
function loadIcons(iconsDir) {
  if (ICON_CACHE) return ICON_CACHE;
  ICON_CACHE = {};
  if (!fs.existsSync(iconsDir)) return ICON_CACHE;
  fs.readdirSync(iconsDir)
    .filter((f) => f.endsWith(".svg"))
    .forEach((f) => {
      const name = path.basename(f, ".svg").toLowerCase().replace(/\s+/g, "-");
      let svg = fs.readFileSync(path.join(iconsDir, f), "utf8")
        .replace(/\n\s*/g, "")
        .trim();
      // Normalise: replace fixed width/height with 100%
      svg = svg.replace(/(<svg[^>]*)\s+width=["']\d+["']/i, '$1 width="100%"');
      svg = svg.replace(/(<svg[^>]*)\s+height=["']\d+["']/i, '$1 height="100%"');
      // Add aria-hidden if not present
      if (!svg.includes("aria-hidden")) {
        svg = svg.replace(/<svg/, '<svg aria-hidden="true"');
      }
      // Add data-icon on the <svg> element
      svg = svg.replace(/<svg/, `<svg data-icon="${name}"`);
      ICON_CACHE[name] = svg;
    });
  return ICON_CACHE;
}

function renderIcon(name, icons) {
  const svg = icons[name];
  if (!svg) {
    console.warn(`  ⚠ unknown icon: "${name}"`);
    return `<!-- icon:${name} (not found) -->`;
  }
  return `<div class="svg-icn">${svg}</div>`;
}

// ---- Shortcode handlers ----

function parseAttrs(str) {
  const attrs = {};
  if (!str) return attrs;
  const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1]] = m[2];
  return attrs;
}

const BLOCK_SHORTCODES = {
  callout(inner, attrs) {
    const raw = attrs.type || "insight";
    // Map old shortcode type names to the canonical data-type values
    const TYPE_MAP = { insight: "info", quote: "success" };
    const mapped = TYPE_MAP[raw] || raw;
    return `<aside class="callout" data-type="${mapped}">\n${inner}\n</aside>`;
  },
  grid(inner, attrs) {
    var cols = attrs.cols || "2";
    // Grid content is exclusively media — strip all <p> wrappers so grid
    // children are the media elements directly (img, video, bd-video sections).
    var stripped = inner.replace(/<\/?p>/g, "");
    // Wrap bare <img> elements (from markdown ![](url) syntax) in .cs-media.
    // Shortcode outputs already sit inside a .cs-media wrapper, so skip those
    // by checking if the img is already inside one (no data-bd-animate on the img).
    stripped = stripped.replace(/<img\s+([^>]*?)>/g, function (match, attrs) {
      if (attrs.includes("loading=")) return match; // already wrapped by shortcode
      var srcMatch = attrs.match(/src="([^"]*)"/);
      var altMatch = attrs.match(/alt="([^"]*)"/);
      var src = srcMatch ? srcMatch[1] : "";
      var alt = altMatch ? altMatch[1] : "";
      return (
        '<div class="cs-media" ' + csMediaRatio("16:9") + ' data-bd-animate="slide-up">\n' +
        '  <img src="' + src + '" alt="' + alt + '" loading="lazy">\n' +
        "</div>"
      );
    });
    // Add stagger delays to child scroll-reveal animations within the grid
    var childIndex = 0;
    stripped = stripped.replace(/data-bd-animate="slide-up"/g, function (match) {
      var delay = childIndex * 0.15;
      childIndex++;
      if (delay === 0) return match;
      return match + ' data-bd-delay="' + delay + '"';
    });
    return `<div class="case-study-grid" data-cols="${cols}">\n${stripped}\n</div>`;
  }
};

// Helper: parse ratio string "W:H" into inline aspect-ratio style
function csMediaRatio(ratio) {
  var r = ratio || "16:9";
  var parts = r.split(":");
  return 'style="aspect-ratio:' + parts[0] + "/" + parts[1] + ';"';
}

const INLINE_SHORTCODES = {
  figure(attrs) {
    const src = attrs.src || "";
    const caption = attrs.caption || "";
    const alt = attrs.alt || caption;
    const ratio = attrs.ratio || "16:9";
    const captionHtml = caption ? `\n  <figcaption>${caption}</figcaption>` : "";
    // Trailing \n ensures marked sees a blank-line boundary after the <div>
    return (
      `<div class="cs-media" ${csMediaRatio(ratio)} data-bd-animate="slide-up">` +
      `\n  <img src="${src}" alt="${alt}" loading="lazy">` +
      captionHtml +
      `\n</div>\n`
    );
  },
  img(attrs) {
    const src = attrs.src || "";
    const alt = attrs.alt || "";
    const ratio = attrs.ratio || "16:9";
    return (
      `<div class="cs-media" ${csMediaRatio(ratio)} data-bd-animate="slide-up">` +
      `\n  <img src="${src}" alt="${alt}" loading="lazy">` +
      `\n</div>\n`
    );
  },
  video(attrs) {
    const src = attrs.src || "";
    const poster = attrs.poster ? ` poster="${attrs.poster}"` : "";
    const mode = attrs.mode || "";
    const ratio = attrs.ratio || "16:9";
    const ratioAttr = ` data-ratio="${ratio}"`;

    // Background mode — bare video element, no bd-video wrapper
    if (mode === "background") {
      const loop = attrs.loop === "false" ? "" : " loop";
      return (
        `<div class="cs-media" ${csMediaRatio(ratio)} data-bd-animate="slide-up">` +
        `\n  <video class="bg-video" src="${src}"${poster}${ratioAttr}` +
        ` autoplay muted playsinline${loop} preload="metadata" aria-hidden="true"></video>` +
        `\n</div>\n`
      );
    }

    // Build data attributes based on mode
    var dataAttrs = "data-bd-scrubber data-bd-mute data-bd-fullscreen data-bd-unmute-prompt";
    var videoAttrs = "autoplay muted loop";

    if (mode === "inline") {
      dataAttrs = "data-bd-scrubber data-bd-mute data-bd-fullscreen";
      videoAttrs = "muted";
    } else if (mode === "preview") {
      dataAttrs = "data-bd-unmute-prompt";
      videoAttrs = "autoplay muted loop";
    }

    return (
      `<div class="cs-media" ${csMediaRatio(ratio)} data-bd-animate="slide-up">` +
      `\n  <section class="bd-video" ${dataAttrs}>` +
      `\n    <video class="bd-video-player" src="${src}"${poster} ${videoAttrs} playsinline preload="auto"></video>` +
      `\n  </section>` +
      `\n</div>\n`
    );
  },
  "bg-video"(attrs) {
    // Decorative autoplay loop — no controls, no sound, no JS. Distinct from
    // the full bd-video player above. Use for body assets, section backgrounds.
    const src = attrs.src || "";
    const poster = attrs.poster ? ` poster="${attrs.poster}"` : "";
    const loop = attrs.loop === "false" ? "" : " loop";
    const ratio = attrs.ratio || "16:9";
    const ratioAttr = ` data-ratio="${ratio}"`;
    return (
      `<div class="cs-media" ${csMediaRatio(ratio)} data-bd-animate="slide-up">` +
      `\n  <video class="bg-video" src="${src}"${poster}${ratioAttr}` +
      ` autoplay muted playsinline${loop} preload="metadata" aria-hidden="true"></video>` +
      `\n</div>\n`
    );
  }
};

// ---- Pipeline ----

function processBlockShortcodes(input, ctx) {
  // Match {{name attrs}}...{{/name}} (non-greedy, multiline)
  const re = /\{\{([\w-]+)([^}]*)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  return input.replace(re, (match, name, attrStr, inner) => {
    const handler = BLOCK_SHORTCODES[name];
    if (!handler) return match; // leave for later or unknown
    const attrs = parseAttrs(attrStr);
    const renderedInner = render(inner, ctx);
    return handler(renderedInner, attrs);
  });
}

function processInlineShortcodes(input, ctx) {
  // {{icon:name}}
  input = input.replace(/\{\{icon:([\w-]+)\}\}/g, (_, name) =>
    renderIcon(name, ctx.icons)
  );
  // {{name attrs}} (self-closing, no body — supports hyphenated names like bg-video)
  input = input.replace(/\{\{([\w-]+)([^}]*)\}\}/g, (match, name, attrStr) => {
    const handler = INLINE_SHORTCODES[name];
    if (!handler) return match;
    return handler(parseAttrs(attrStr));
  });
  return input;
}

/**
 * Render a markdown body with shortcodes to HTML.
 * @param {string} input — raw markdown (with shortcodes)
 * @param {object} ctx   — { icons }
 */
function render(input, ctx) {
  // 1. Block shortcodes first (recurse into their inner).
  let out = processBlockShortcodes(input, ctx);
  // 2. Resolve inline shortcodes to HTML before marked processes the rest.
  out = processInlineShortcodes(out, ctx);

  // 3. Marked handles the remaining markdown. We rely on marked preserving
  //    inline HTML (default behaviour).
  return marked.parse(out);
}

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false
});

/**
 * Post-process rendered HTML to wrap bare <p><img></p> blocks in .cs-media
 * containers with aspect-ratio and scroll-reveal animation.
 * Call on case study visuals HTML after render() to catch markdown images
 * that don't use the figure/img shortcode.
 */
function wrapBareMedia(html) {
  return html.replace(
    /<p>\s*(<img\s[^>]*>)\s*<\/p>/g,
    function (match, imgTag) {
      var srcMatch = imgTag.match(/src="([^"]*)"/);
      var altMatch = imgTag.match(/alt="([^"]*)"/);
      var src = srcMatch ? srcMatch[1] : "";
      var alt = altMatch ? altMatch[1] : "";
      return (
        '<div class="cs-media" ' + csMediaRatio("16:9") + ' data-bd-animate="slide-up">\n' +
        '  <img src="' + src + '" alt="' + alt + '" loading="lazy">\n' +
        "</div>"
      );
    }
  );
}

module.exports = { render, loadIcons, wrapBareMedia };
