// studio-logos.js v2.0
// Logo metadata + canonical sprite renderer.
//
// Logo artwork lives in studio/assets/images/svg-logos/_sprite.svg
// (built by studio/cms/generator/build-logo-sprite.js). This file
// describes each logo's viewBox + optical-correction scale and renders
// references via <use href="...#name"/>.
//
// Each entry: { name, viewBox, scale?, avatar? }
//   scale (optional) — multiplier for ink-density correction in
//     equal-area contexts (ticker, testimonials).
//     Dense/blocky logos (e.g. BET): use < 1 to shrink.
//     Delicate/airy logos (e.g. Lift Labs): use > 1 to enlarge.
//   avatar (optional) — { viewBox, scale? } for testimonial-style
//     avatar slots where the wide wordmark won't fit a circular badge.
//     Resolves to <use href="...#<name>-avatar"/> in the sprite. Omit
//     when one mark works in every context.
//
// One canonical wrapper for every brand-logo render:
//
//   <div class="svg-logo <context>" data-logo="<name>"
//        style="aspect-ratio: <vbW> / <vbH>">
//     <svg viewBox="..." fill="none" aria-hidden="true">
//       <use href="/assets/images/svg-logos/_sprite.svg#<name>"/>
//     </svg>
//   </div>
//
// Wrapper is the sizing surface — CSS sets its width OR height; the
// inline aspect-ratio handles the other. The inner <svg> fills via the
// global `.svg-logo > svg { width: 100%; height: 100% }` rule in
// studio.css.

console.log("[studio-logos] v2.0 loaded");

var SPRITE_PATH = "/assets/images/svg-logos/_sprite.svg";

var LOGOS = [
  { name: "revolt", viewBox: "0 0 205 29", scale: 0.8 },
  { name: "copa90", viewBox: "0 0 144 41" },
  { name: "hypebeast", viewBox: "0 0 230 29" },
  { name: "lift-labs", viewBox: "0 0 134 92", scale: 1.3 },
  { name: "verizon", viewBox: "0 0 153 35", scale: 0.9 },
  { name: "mcdonalds", viewBox: "0 0 70 61", scale: 0.9 },
  { name: "the-sole-supplier", viewBox: "0 0 93 71" },
  { name: "bet", viewBox: "0 0 65 65", scale: 0.8 },
  { name: "blackdoctor", viewBox: "0 0 1037 150" },
  { name: "mastercard", viewBox: "0 0 200 156" },
  {
    name: "country-and-town-house",
    viewBox: "0 0 145 53",
    avatar: { viewBox: "0 0 231 248" },
  },
];

// Splide ticker — equal-area scaling (rem²). Tune to scale every slide
// up or down together. 14.0625 rem² ≈ 3600 px² at 16px root.
var TARGET_AREA = 14.0625;
var TARGET_AREA_MOBILE = 9;

function spriteUse(symbolId) {
  return '<use href="' + SPRITE_PATH + "#" + symbolId + '"/>';
}

// Canonical sprite renderer — every brand-logo render goes through this.
// Returns the wrapper as an HTML string. Wrapper carries inline
// aspect-ratio (computed from sprite metadata) + data-logo + classes;
// the inner <svg> stays clean (just viewBox + <use>) and fills the
// wrapper via the global `.svg-logo > svg` CSS rule.
//
// opts.variant === "avatar" picks the brand's avatar artwork when one
// is defined in LOGOS (currently only country-and-town-house). Brands
// without an avatar fall back to their default mark.
//
// opts.className appends a context-specific class for downstream
// styling hooks (e.g. "logo-ticker-mark", "case-study-card-logo-mark").
//
// Returns null when the name isn't in LOGOS.
function renderLogoSpriteMarkup(name, opts) {
  opts = opts || {};
  var entry = LOGOS.find(function matchByName(l) {
    return l.name === name;
  });
  if (!entry) {
    console.warn('[studio-logos] no logo for name="' + name + '"');
    return null;
  }
  var useAvatar = opts.variant === "avatar" && entry.avatar;
  var source = useAvatar ? entry.avatar : entry;
  var symbolId = useAvatar ? name + "-avatar" : name;
  var parts = source.viewBox.split(" ");
  var vbW = parseFloat(parts[2]);
  var vbH = parseFloat(parts[3]);
  if (!(vbW > 0 && vbH > 0)) {
    console.warn('[studio-logos] invalid viewBox for "' + name + '": "' + source.viewBox + '"');
    return null;
  }
  var classList = "svg-logo" + (opts.className ? " " + opts.className : "");
  return (
    '<div class="' + classList + '" data-logo="' + name + '" ' +
    'style="aspect-ratio: ' + vbW + " / " + vbH + '">' +
      '<svg viewBox="' + source.viewBox + '" fill="none" aria-hidden="true">' +
        spriteUse(symbolId) +
      "</svg>" +
    "</div>"
  );
}

// Equal-area dimensions in rem — for the two consumers that need
// consistent visual weight across logos of different proportions
// (ticker, testimonials). Caller applies these to the .svg-logo wrapper
// via inline width/height styles. Width preserves viewBox aspect ratio
// and applies the per-logo `scale` for ink-density correction.
//
// Returns null when the name isn't in LOGOS.
function getLogoSpriteDimensions(name, areaRem, opts) {
  opts = opts || {};
  var entry = LOGOS.find(function matchByName(l) {
    return l.name === name;
  });
  if (!entry) return null;
  var useAvatar = opts.variant === "avatar" && entry.avatar;
  var source = useAvatar ? entry.avatar : entry;
  var parts = source.viewBox.split(" ");
  var vbW = parseFloat(parts[2]);
  var vbH = parseFloat(parts[3]);
  if (!(vbW > 0 && vbH > 0)) return null;
  var ratio = vbW / vbH;
  var s = source.scale || 1;
  var h = Math.sqrt(areaRem / ratio) * s;
  return { w: h * ratio, h: h };
}

// Logo ticker — builds Splide slides from LOGOS. Each slide wraps the
// canonical .svg-logo markup; equal-area dimensions are applied to that
// wrapper inline so every brand renders at consistent visual weight.
function buildLogoSlides(container) {
  var list = container.querySelector(".splide__list");
  if (!list || !LOGOS.length) return;

  var area = window.innerWidth <= 600 ? TARGET_AREA_MOBILE : TARGET_AREA;

  // Optional per-instance opt-out: data-exclude="name-a name-b" skips those logos.
  var excludeAttr = container.getAttribute("data-exclude") || "";
  var excludeSet = excludeAttr.split(/[\s,]+/).filter(Boolean);

  // Clear any existing placeholder slides
  list.innerHTML = "";

  LOGOS.forEach(function createSlide(logo) {
    if (excludeSet.indexOf(logo.name) !== -1) return;
    var dims = getLogoSpriteDimensions(logo.name, area);
    var markup = renderLogoSpriteMarkup(logo.name, {
      className: "logo-ticker-mark",
    });
    if (!dims || !markup) return;

    var li = document.createElement("li");
    li.className = "splide__slide logo-ticker-slide";
    li.innerHTML = markup;
    var mark = li.firstElementChild;
    mark.style.width = dims.w + "rem";
    mark.style.height = dims.h + "rem";
    list.appendChild(li);
  });
}

window.renderLogoSpriteMarkup = renderLogoSpriteMarkup;
window.getLogoSpriteDimensions = getLogoSpriteDimensions;
