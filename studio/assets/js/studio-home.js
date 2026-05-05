// studio-home.js v2.1 — homepage modules
//
// Holds two independent init functions, each scoped to its own DOM hook
// and bailing early on pages that don't include them:
//
//   1. initHomeFeatured — renders the home-page Case Studies section
//      from manifest entries where type === "case-study" && featured ===
//      true. Card markup is the designer-owned <template
//      id="case-study-card-template"> in index.html; this file only
//      binds data into clones via querySelector — no string
//      concatenation. Sort is by manifest `order`.
//
//      Activation hooks fire post-append:
//        - window.initThumbHover() — binds hover-to-play on .vdo-thumb
//        - window.bdAnimationsInit(barbaContainer) — registers
//          data-bd-animate elements for GSAP scroll-driven animation
//      bd-cursor needs nothing — it resolves data-cursor-* via mousemove
//      + closest() and so picks up appended nodes automatically.
//
//   2. initProductSpotlight — runs the .product-spotlight scroll-linked
//      product list. Single ScrollTrigger over the <ol>, scrub-driven,
//      maps progress → active index. CSS does the visual work via
//      .is-active on the matching <li> (the media lives inside each
//      item, so a single class flip drives image + title + description
//      together). The ScrollTrigger is created outside the gsap.context()
//      in bd-animations.js — module-scope handle + .kill() on every init
//      handles cleanup explicitly on Barba leave / re-fire.

console.log("[studio-home] v2.1 loaded — case-study feed + product spotlight");

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
    console.warn("[studio-home] loadStudioContent unavailable");
    return;
  }

  window.loadStudioContent().then(function onContent(data) {
    var caseStudies = (data && data.caseStudies) || [];
    var featured = caseStudies.filter(function (cs) {
      return cs.featured === true;
    });

    if (!featured.length) {
      section.style.display = "none";
      console.warn("[studio-home] no featured case studies — section hidden");
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


// ------- Product spotlight (scroll-linked product list) ------- //

var PRODUCT_SPOTLIGHT_SELECTOR = ".product-spotlight";

// Module-scope handle to the active ScrollTrigger. The product spotlight is
// created outside the gsap.context() in bd-animations.js, so ctx.revert()
// does NOT clean it up — every init must kill the previous trigger
// explicitly. This also makes the function idempotent across
// studio:after-nav re-fires.
var productSpotlightTrigger = null;

// Cursor parallax state — module-scope so cleanup can find it.
// JS writes to the section's --cursor-x / --cursor-y custom properties on
// every rAF tick; CSS reads them via transform: translate(...). Counter-
// parallax: target is the negative of cursor offset (cursor right → image
// left), creating a 3D/depth illusion.
var parallaxState = {
  rafId: null,
  section: null,
  onMove: null,
  onLeave: null,
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0
};

var PARALLAX_MAX_TRAVEL = 30;    // px in each axis at section edges
var PARALLAX_LERP_FACTOR = 0.08; // damping per frame; lower = smoother+laggier

function killProductSpotlightParallax() {
  if (parallaxState.rafId) {
    cancelAnimationFrame(parallaxState.rafId);
    parallaxState.rafId = null;
  }
  if (parallaxState.section) {
    if (parallaxState.onMove) {
      parallaxState.section.removeEventListener("mousemove", parallaxState.onMove);
    }
    if (parallaxState.onLeave) {
      parallaxState.section.removeEventListener("mouseleave", parallaxState.onLeave);
    }
    parallaxState.section.style.removeProperty("--cursor-x");
    parallaxState.section.style.removeProperty("--cursor-y");
  }
  parallaxState.section = null;
  parallaxState.onMove = null;
  parallaxState.onLeave = null;
  parallaxState.targetX = 0;
  parallaxState.targetY = 0;
  parallaxState.currentX = 0;
  parallaxState.currentY = 0;
}

function setupProductSpotlightParallax(section) {
  // Bail on touch / no-hover devices — no cursor to track.
  // (Reduced-motion is already handled by the parent function's earlier bail.)
  if (!window.matchMedia("(hover: hover)").matches) return;

  parallaxState.section = section;

  // Idle-stop threshold: when |target - current| drops below this in both
  // axes, snap to target and stop the rAF loop. onMove / onLeave restart it.
  var IDLE_EPSILON = 0.05;

  function startTickIfIdle() {
    if (!parallaxState.rafId) {
      parallaxState.rafId = requestAnimationFrame(tick);
    }
  }

  parallaxState.onMove = function (e) {
    var rect = section.getBoundingClientRect();
    // Normalize cursor position to -0.5..+0.5 within the section.
    var nx = (e.clientX - rect.left) / rect.width - 0.5;
    var ny = (e.clientY - rect.top) / rect.height - 0.5;
    // Clamp in case mousemove fires just outside the section bounds.
    if (nx < -0.5) nx = -0.5; else if (nx > 0.5) nx = 0.5;
    if (ny < -0.5) ny = -0.5; else if (ny > 0.5) ny = 0.5;
    // Counter-parallax: target is the negative of cursor offset.
    // *2 maps -0.5..+0.5 → -1..+1, then scale to MAX_TRAVEL.
    parallaxState.targetX = -nx * 2 * PARALLAX_MAX_TRAVEL;
    parallaxState.targetY = -ny * 2 * PARALLAX_MAX_TRAVEL;
    startTickIfIdle();
  };

  parallaxState.onLeave = function () {
    // Reset target to 0 — image lerps back to centre.
    parallaxState.targetX = 0;
    parallaxState.targetY = 0;
    startTickIfIdle();
  };

  function tick() {
    var dx = parallaxState.targetX - parallaxState.currentX;
    var dy = parallaxState.targetY - parallaxState.currentY;

    // Snap + stop when we're effectively at the target. The next mousemove
    // or mouseleave restarts the loop via startTickIfIdle().
    if (Math.abs(dx) < IDLE_EPSILON && Math.abs(dy) < IDLE_EPSILON) {
      parallaxState.currentX = parallaxState.targetX;
      parallaxState.currentY = parallaxState.targetY;
      section.style.setProperty("--cursor-x", parallaxState.currentX.toFixed(2) + "px");
      section.style.setProperty("--cursor-y", parallaxState.currentY.toFixed(2) + "px");
      parallaxState.rafId = null;
      return;
    }

    parallaxState.currentX += dx * PARALLAX_LERP_FACTOR;
    parallaxState.currentY += dy * PARALLAX_LERP_FACTOR;
    section.style.setProperty("--cursor-x", parallaxState.currentX.toFixed(2) + "px");
    section.style.setProperty("--cursor-y", parallaxState.currentY.toFixed(2) + "px");
    parallaxState.rafId = requestAnimationFrame(tick);
  }

  section.addEventListener("mousemove", parallaxState.onMove);
  section.addEventListener("mouseleave", parallaxState.onLeave);
  // Don't start the rAF loop now — it'll start on the first mousemove.
}

function initProductSpotlight() {
  // Kill any trigger / parallax left over from a previous init or Barba
  // navigation. Safe to call when none exists.
  if (productSpotlightTrigger) {
    productSpotlightTrigger.kill();
    productSpotlightTrigger = null;
  }
  killProductSpotlightParallax();

  var section = document.querySelector(PRODUCT_SPOTLIGHT_SELECTOR);
  if (!section) return;

  var items = section.querySelectorAll(".product-spotlight-item");
  var list = section.querySelector(".product-spotlight-list");
  if (!items.length || !list) return;

  // Reduced motion — render every item active and skip the scroll wiring
  // and the parallax. Media lives inside each <li>, so toggling .is-active
  // on items is enough.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    section.classList.add("is-reduced-motion");
    items.forEach(function (el) { el.classList.add("is-active"); });
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("[studio-home] GSAP/ScrollTrigger not loaded, product spotlight bailing");
    return;
  }

  var count = items.length;
  var currentIndex = -1;

  function setActive(i) {
    if (i === currentIndex) return;
    currentIndex = i;
    for (var j = 0; j < count; j++) {
      items[j].classList.toggle("is-active", j === i);
    }
  }

  // Single ScrollTrigger over the <ol>, scrub-driven. Stored on
  // productSpotlightTrigger so the next init can kill it.
  productSpotlightTrigger = ScrollTrigger.create({
    trigger: list,
    start: "top center",
    end: "bottom center",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: function (self) {
      var i = Math.round(self.progress * (count - 1));
      setActive(i);
    }
  });

  setupProductSpotlightParallax(section);
}

window.initProductSpotlight = initProductSpotlight;
