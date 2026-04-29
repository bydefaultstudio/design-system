// studio-logos.js v1.2
// Logo metadata + slide builder for the Splide logo ticker.
// Logo artwork lives in studio/assets/images/svg-logos/_sprite.svg
// (built by studio/cms/generator/build-logo-sprite.js). This file just
// describes each logo's viewBox + optical-correction scale and renders
// references via <use href="...#name"/>.
//
// Each entry: { name, viewBox, scale?, avatar? }
//   scale (optional) — multiplier for ink-density correction.
//     Dense/blocky logos (e.g. BET): use < 1 to shrink.
//     Delicate/airy logos (e.g. Lift Labs): use > 1 to enlarge.
//   avatar (optional) — { viewBox, scale? } for testimonial-style
//     avatar slots where the wide wordmark won't fit a circular badge.
//     Resolves to <use href="...#<name>-avatar"/> in the sprite. Omit
//     when one mark works in every context.

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
  {
    name: "country-and-town-house",
    viewBox: "0 0 145 53",
    avatar: { viewBox: "0 0 231 248" },
  },
];

// Splide ticker — equal-area scaling. Tune TARGET_AREA / TARGET_AREA_MOBILE
// to scale every slide up or down together.
var TARGET_AREA = 3600;
var TARGET_AREA_MOBILE = 2304;

function spriteUse(symbolId) {
  return '<use href="' + SPRITE_PATH + "#" + symbolId + '"/>';
}

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
    var parts = logo.viewBox.split(" ");
    var vbW = parseFloat(parts[2]);
    var vbH = parseFloat(parts[3]);
    var ratio = vbW / vbH;
    var s = logo.scale || 1;
    var h = Math.round(Math.sqrt(area / ratio) * s);
    var w = Math.round(h * ratio);

    var li = document.createElement("li");
    li.className = "splide__slide logo-ticker-slide";
    li.setAttribute("data-logo", logo.name);
    li.innerHTML =
      '<svg aria-hidden="true" fill="none" viewBox="' +
      logo.viewBox +
      '" width="' +
      w +
      '" height="' +
      h +
      '">' +
      spriteUse(logo.name) +
      "</svg>";
    list.appendChild(li);
  });
}

// Equal-area optical sizing helper — shared by populateLogoGrid (clients
// section) and the testimonials carousel. Given a logo name and a target
// rendered area in rem², returns the inline SVG markup plus the computed
// width/height in rem so the caller can set CSS variables on the wrapper.
// Width/height preserve viewBox aspect ratio and apply the per-logo
// `scale` for ink-density correction.
//
// `variant` is optional — pass "avatar" from contexts that render the
// logo inside a small circular badge (e.g. testimonials). The avatar
// metadata is used when present; otherwise the call falls back to the
// brand's default mark, so brands without a dedicated avatar render the
// same artwork in both contexts.
function resolveLogoSvg(name, areaRem, variant) {
  var entry = LOGOS.find(function matchByName(l) {
    return l.name === name;
  });
  if (!entry) {
    console.warn('[studio-logos] no logo for name="' + name + '"');
    return null;
  }
  var useAvatar = variant === "avatar" && entry.avatar;
  var source = useAvatar ? entry.avatar : entry;
  var symbolId = useAvatar ? name + "-avatar" : name;
  var parts = source.viewBox.split(" ");
  var vbW = parseFloat(parts[2]);
  var vbH = parseFloat(parts[3]);
  var ratio = vbW / vbH;
  var s = source.scale || 1;
  var h = Math.sqrt(areaRem / ratio) * s;
  var w = h * ratio;
  return {
    svg:
      '<svg aria-label="' +
      name +
      '" fill="none" viewBox="' +
      source.viewBox +
      '">' +
      spriteUse(symbolId) +
      "</svg>",
    w: w,
    h: h,
  };
}

// Static logo grid — equal-area scaling. Tune TARGET_AREA_GRID to scale
// every cell up or down together.
var TARGET_AREA_GRID = 20; // rem²

function populateLogoGrid() {
  var cells = document.querySelectorAll(".logo-mark[data-logo]");
  cells.forEach(function injectLogo(cell) {
    if (cell.firstElementChild) return;
    var info = resolveLogoSvg(cell.getAttribute("data-logo"), TARGET_AREA_GRID);
    if (!info) return;
    cell.style.setProperty("--logo-w", info.w + "rem");
    cell.style.setProperty("--logo-h", info.h + "rem");
    cell.innerHTML = info.svg;
  });
}

window.resolveLogoSvg = resolveLogoSvg;
window.populateLogoGrid = populateLogoGrid;
