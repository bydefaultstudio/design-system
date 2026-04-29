// studio-home-featured.js v1.0
// Renders the home-page Case Studies section from manifest entries where
// type === "case-study" && featured === true. Card markup is the
// designer-owned <template id="case-study-card-template"> in index.html;
// this file only binds data into clones via querySelector — no string
// concatenation. Sort is by manifest `order` (already pre-sorted at
// build time in build-manifest.js).
//
// Activation hooks fire post-append:
//   - window.initThumbHover() — binds hover-to-play on .vdo-thumb
//   - window.bdAnimationsInit(barbaContainer) — registers data-bd-animate
//     elements for GSAP scroll-driven animation
// bd-cursor needs nothing — it resolves data-cursor-* via mousemove +
// closest() and so picks up appended nodes automatically.

console.log("[studio-home-featured] v1.0 loaded");

var TEMPLATE_ID = "case-study-card-template";
var CONTAINER_SELECTOR = "[data-home-featured]";
var SECTION_SELECTOR = ".home-case-studies";

// Per-render counter so generated `id` attributes for `aria-labelledby`
// are unique even if a previous render's nodes are still in the DOM
// during a Barba transition (two `data-barba="container"` wrappers can
// briefly coexist).
var renderToken = 0;

function buildCaseStudyCard(template, entry, index, token) {
  var fragment = template.content.cloneNode(true);
  var link = fragment.querySelector(".case-study-card");
  var clientEl = fragment.querySelector(".case-study-card-client");
  var titleEl = fragment.querySelector(".case-study-card-title");
  var statEl = fragment.querySelector(".case-study-card-stat");
  var statIconEl = fragment.querySelector(".case-study-card-stat-icon");
  var statNumberEl = fragment.querySelector(".case-study-card-stat-number");
  var statCaptionEl = fragment.querySelector(".case-study-card-stat-caption");
  var videoEl = fragment.querySelector(".vdo-thumb");
  var logoEl = fragment.querySelector(".case-study-card-logo");

  // Link target: case-study URL. Manifest stores it without leading slash.
  link.setAttribute("href", "/" + entry.url);

  // Eyebrow — client name above the title. Hide the element entirely
  // when client is missing so it doesn't take vertical space.
  if (clientEl) {
    if (entry.client) {
      clientEl.textContent = entry.client;
    } else {
      clientEl.remove();
    }
  }

  // Title — set a unique id per card so aria-labelledby on the link can
  // point to it; screen readers then announce only the title (not the
  // whole concatenated card content). The render-token suffix prevents
  // ID collisions across rapid re-renders (e.g. mid-Barba transition).
  var titleId = "case-study-card-title-" + token + "-" + index;
  titleEl.id = titleId;
  titleEl.textContent = entry.title;
  link.setAttribute("aria-labelledby", titleId);

  // Stat block — optional. Show only when entry.stat is present.
  if (entry.stat) {
    statEl.removeAttribute("hidden");
    statNumberEl.textContent = entry.stat.value;
    statCaptionEl.textContent = entry.stat.caption;
    if (entry.stat.icon) {
      // Rewrite the placeholder icon's <use href> to the chosen sprite id.
      var useEl = statIconEl.querySelector("use");
      if (useEl) {
        useEl.setAttribute(
          "href",
          "/assets/images/svg-icons/_sprite.svg#" + entry.stat.icon
        );
      }
    } else {
      // No icon — drop the icon span entirely.
      statIconEl.parentNode.removeChild(statIconEl);
    }
  }

  // Media — set src + poster on the video. The hover-to-play binding is
  // attached after appendChild via window.initThumbHover().
  if (entry.thumbnailVideo) {
    videoEl.setAttribute("src", entry.thumbnailVideo);
  }
  if (entry.thumbnailVideoPoster) {
    videoEl.setAttribute("poster", entry.thumbnailVideoPoster);
  }

  // Logo — sprite SVG wrapped in a sized container so the artwork
  // scales to a fraction of the media frame instead of filling it. The
  // canonical helper stamps a .svg-logo wrapper with inline aspect-ratio
  // (computed from sprite metadata) + data-logo for per-brand targeting.
  // CSS sizes the .case-study-card-logo-mark wrapper; aspect-ratio
  // handles proportions. Falls back to brand name as plain text when
  // the logo isn't in the sprite.
  if (entry.logo && typeof window.renderLogoSpriteMarkup === "function") {
    var markup = window.renderLogoSpriteMarkup(entry.logo, {
      className: "case-study-card-logo-mark",
    });
    if (markup) {
      logoEl.innerHTML = markup;
    } else {
      logoEl.textContent = entry.client || "";
    }
  } else {
    logoEl.textContent = entry.client || "";
  }

  return fragment;
}

function initHomeFeatured() {
  var template = document.getElementById(TEMPLATE_ID);
  var container = document.querySelector(CONTAINER_SELECTOR);
  var section = container && container.closest(SECTION_SELECTOR);
  if (!template || !container || !section) return;

  // loadStudioContent is memoised in studio-utils.js — second call on the
  // same page hits the cache, no extra network request.
  if (typeof window.loadStudioContent !== "function") {
    console.warn("[studio-home-featured] loadStudioContent unavailable");
    return;
  }

  window.loadStudioContent().then(function onContent(data) {
    var caseStudies = (data && data.caseStudies) || [];
    var featured = caseStudies.filter(function (cs) {
      return cs.featured === true;
    });

    if (!featured.length) {
      section.style.display = "none";
      console.warn("[studio-home-featured] no featured case studies — section hidden");
      return;
    }

    renderToken++;
    container.innerHTML = "";
    featured.forEach(function (entry, i) {
      container.appendChild(buildCaseStudyCard(template, entry, i, renderToken));
    });
    section.style.display = "";

    // Activation hooks — bind hover-play and re-register scroll animations
    // for the freshly-appended nodes. Both are idempotent.
    if (typeof window.initThumbHover === "function") {
      window.initThumbHover();
    }
    if (typeof window.bdAnimationsInit === "function") {
      var scope =
        document.querySelector('[data-barba="container"]') || document.body;
      window.bdAnimationsInit(scope);
    }
  });
}

window.initHomeFeatured = initHomeFeatured;
