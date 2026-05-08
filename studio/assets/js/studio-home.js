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
    // Normalize against the active row's bounds, not the section's.
    // Section-level normalization meant the visible media drifted away
    // from the cursor at rest whenever the active row was offset
    // vertically inside the section. Falls back to section if no row is
    // active yet (only true between init and the first ScrollTrigger
    // tick).
    var activeItem = section.querySelector(".product-spotlight-item.is-active");
    var rect = (activeItem || section).getBoundingClientRect();
    var nx = (e.clientX - rect.left) / rect.width - 0.5;
    var ny = (e.clientY - rect.top) / rect.height - 0.5;
    // Clamp — cursor often sits well outside the active row's vertical
    // bounds (it's only ~1/5 of the section).
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


// ------- Headline word cycle (home only) ------- //
//
// The last word of the home headline rotates through a list of alternates.
// Animation style is picked by data-cycle-style on .cycle-word; each style
// is a "builder" returning a repeat:-1 timeline. Cleanup runs from
// studio-barba.js's `before` hook so the timeline tears down before the
// leaving container is detached.
//
// To add a new style: write buildXyz(items, tokens), register it in
// CYCLE_STRATEGIES, set data-cycle-style="xyz" on the markup.

var CYCLE_WORD_SELECTOR = ".home-headline .cycle-word";
var headlineCycleState = {
  ctx: null,
  timeline: null,
  resizeHandler: null,
  // Bumped on init/cleanup so a stale fonts.ready promise from a
  // superseded init can detect it lost the race and bail.
  generation: 0
};

var CYCLE_STRATEGIES = {
  "slot": buildSlot,
  "bounce-drop": buildBounceDrop
};
var DEFAULT_CYCLE_STYLE = "slot";

function readDurationToken(name) {
  var raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return null;
  if (raw.indexOf("ms") !== -1) return parseFloat(raw) / 1000;
  if (raw.indexOf("s") !== -1) return parseFloat(raw);
  return null;
}

function readRawToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function getCycleTokens() {
  // GSAP accepts a cubic-bezier string directly, so reading CSS tokens
  // keeps the headline in step with the rest of the platform's motion.
  var easeInOut = readRawToken("--ease-in-out") || "power2.inOut";
  var easeIn = readRawToken("--ease-in") || "power2.in";
  return {
    // ─── slot tweakables (banked) ───────────────────────────────────────
    swapDuration: readDurationToken("--duration-m") || 0.6,
    swapEase: easeInOut,

    // pauseBetweenSwaps — hold time between swaps, seconds. 0 = continuous.
    pauseBetweenSwaps: readDurationToken("--duration-6xl") || 3,

    // ─── bounce-drop tweakables ─────────────────────────────────────────
    // Tweak and reload — values are read fresh on every init.
    //
    // letterExitDuration   — how long one letter takes to fall out
    // letterEnterDuration  — how long one letter takes to drop in + settle
    // letterDelay          — gap between letters; bigger = slower ripple
    // bounceStrength       — entry overshoot. 1.0 barely, 1.4 lively, 2.0 cartoony
    // swapOverlap          — when entry begins as a fraction of exit (0.5 = midway)
    // letterFadeOutFraction — fraction of letterExitDuration over which
    //                         the opacity fade completes. Smaller = letters
    //                         disappear sooner (fade finishes well before
    //                         the clip edge). 1.0 = fade matches y-movement.
    //
    // bounceStrength is the one non-token ease — back.out has no CSS
    // bezier equivalent. Deliberate exception to token-only motion.
    letterExitDuration: readDurationToken("--duration-l") || 0.8,
    letterExitEase: easeIn,
    letterEnterDuration: readDurationToken("--duration-xl") || 1.2,
    bounceStrength: "back.out(1.2)",
    letterDelay: 0.05,
    swapOverlap: 0.5,
    letterFadeOutFraction: 0.15
  };
}

// Slot-machine roll. Outgoing word slides up out, incoming slides up in.
// Single axis, ease-in-out, one confident sweep.
function buildSlot(items, tokens) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].classList.contains("is-active")) {
      gsap.set(items[i], { yPercent: 0, opacity: 1, visibility: "visible" });
    } else {
      gsap.set(items[i], { yPercent: 100, opacity: 1, visibility: "hidden" });
    }
  }
  // repeatDelay holds the loop boundary (last swap → first swap) for the
  // same gap as every other pair, so the cycle reads continuously.
  var tl = gsap.timeline({ repeat: -1, repeatDelay: tokens.pauseBetweenSwaps });
  for (var k = 0; k < items.length; k++) {
    var outEl = items[k];
    var inEl = items[(k + 1) % items.length];
    // First swap at t=0; subsequent swaps after the inter-swap pause.
    var position = (k === 0) ? 0 : "+=" + tokens.pauseBetweenSwaps;
    tl.add(slotSwap(outEl, inEl, tokens), position);
  }
  return tl;
}

function slotSwap(outEl, inEl, tokens) {
  return gsap.timeline()
    .set(inEl, { yPercent: 100, opacity: 1, visibility: "visible" }, 0)
    .to(outEl, { yPercent: -100, duration: tokens.swapDuration, ease: tokens.swapEase }, 0)
    .to(inEl, { yPercent: 0, duration: tokens.swapDuration, ease: tokens.swapEase }, 0)
    .set(outEl, { visibility: "hidden", yPercent: 100 });
}

// Per-letter drop with a bounce landing. Outgoing chars fall down with a
// left→right stagger; incoming chars drop in from above and overshoot.
function buildBounceDrop(items, tokens) {
  if (typeof SplitText === "undefined") {
    console.warn("[studio-home] SplitText missing, bounce-drop falling back to slot");
    return buildSlot(items, tokens);
  }

  // SplitText.create inside gsap.context() auto-reverts on ctx.revert()
  // (GSAP 3.11+). `create` is the forward-compatible API; prefer it over
  // `new SplitText(...)`.
  var splits = [];
  for (var i = 0; i < items.length; i++) {
    splits.push(SplitText.create(items[i], { type: "chars" }));
  }

  // Active item visible at y=0; all others parked above and hidden.
  for (var j = 0; j < items.length; j++) {
    var isActive = items[j].classList.contains("is-active");
    gsap.set(items[j], { visibility: isActive ? "visible" : "hidden" });
    gsap.set(splits[j].chars, {
      yPercent: isActive ? 0 : -120,
      opacity: isActive ? 1 : 0
    });
  }

  // repeatDelay holds the loop boundary (last swap → first swap) for the
  // same gap as every other pair, so the cycle reads continuously.
  var tl = gsap.timeline({ repeat: -1, repeatDelay: tokens.pauseBetweenSwaps });
  for (var k = 0; k < items.length; k++) {
    var outItem = items[k];
    var inItem = items[(k + 1) % items.length];
    var outChars = splits[k].chars;
    var inChars = splits[(k + 1) % items.length].chars;
    // First swap at t=0; subsequent swaps after the inter-swap pause.
    var position = (k === 0) ? 0 : "+=" + tokens.pauseBetweenSwaps;
    tl.add(bounceDropSwap(outItem, outChars, inItem, inChars, tokens), position);
  }
  return tl;
}

function bounceDropSwap(outItem, outChars, inItem, inChars, tokens) {
  // Entry leads at swapOverlap × letterExitDuration so the crossfade is
  // independent of letterDelay or character count.
  var entryStart = tokens.letterExitDuration * tokens.swapOverlap;
  return gsap.timeline()
    // Idempotent start state — every swap begins from a known config
    // regardless of prior state, including the loop wrap.
    .set(outChars, { yPercent: 0, opacity: 1 }, 0)
    .set(inChars, { yPercent: -120, opacity: 0 }, 0)
    // Outgoing y — full duration.
    .to(outChars, {
      yPercent: 120,
      duration: tokens.letterExitDuration,
      ease: tokens.letterExitEase,
      stagger: tokens.letterDelay
    }, 0)
    // Outgoing fade — quicker, so chars are invisible before they reach
    // the wrapper's bottom clip edge. Linear ease for a clean dissolve
    // over the short window.
    .to(outChars, {
      opacity: 0,
      duration: tokens.letterExitDuration * tokens.letterFadeOutFraction,
      ease: "none",
      stagger: tokens.letterDelay
    }, 0)
    // Show inItem when its first char starts moving so there's no
    // phantom-container window before the entry animation.
    .set(inItem, { visibility: "visible" }, entryStart)
    // Incoming.
    .to(inChars, {
      yPercent: 0,
      opacity: 1,
      duration: tokens.letterEnterDuration,
      ease: tokens.bounceStrength,
      stagger: tokens.letterDelay
    }, entryStart)
    // Hide outItem at end of swap.
    .set(outItem, { visibility: "hidden" });
}

function pickStrategy(wrapper) {
  var key = wrapper.getAttribute("data-cycle-style") || DEFAULT_CYCLE_STYLE;
  return CYCLE_STRATEGIES[key] || CYCLE_STRATEGIES[DEFAULT_CYCLE_STYLE];
}

// Width of the widest item, in pixels. Briefly forces each into the
// layout flow to read offsetWidth, then restores prior styles.
function measureLongestItem(wrapper, items) {
  var prevMinWidth = wrapper.style.minWidth;
  wrapper.style.minWidth = "0";
  var max = 0;
  var saved = [];
  for (var i = 0; i < items.length; i++) {
    saved.push({
      position: items[i].style.position,
      visibility: items[i].style.visibility
    });
    items[i].style.position = "relative";
    items[i].style.visibility = "hidden";
  }
  for (var j = 0; j < items.length; j++) {
    var w = items[j].offsetWidth;
    if (w > max) max = w;
  }
  for (var k = 0; k < items.length; k++) {
    items[k].style.position = saved[k].position;
    items[k].style.visibility = saved[k].visibility;
  }
  wrapper.style.minWidth = prevMinWidth;
  return max;
}

function applyMinWidth(wrapper, items) {
  var px = measureLongestItem(wrapper, items);
  if (px > 0) wrapper.style.minWidth = px + "px";
}

function initHeadlineCycle() {
  // Guard before cleanup — cleanup calls timeline.kill() which assumes GSAP.
  if (typeof gsap === "undefined") {
    console.warn("[studio-home] GSAP missing, headline cycle bailing");
    return;
  }

  var wrapper = document.querySelector(CYCLE_WORD_SELECTOR);
  if (!wrapper) return;

  // Idempotent — Barba may re-fire init on home re-entry.
  cleanupHeadlineCycle();

  // Reduced motion: leave the active item visible (CSS default), do nothing.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var items = wrapper.querySelectorAll(".cycle-word-item");
  if (items.length < 2) return;

  headlineCycleState.generation++;
  var generation = headlineCycleState.generation;

  // Wait for fonts so item widths are stable before measurement.
  var ready = (document.fonts && document.fonts.ready) || Promise.resolve();
  ready.then(function () {
    // Bail if a newer init or cleanup has run while we were waiting.
    if (generation !== headlineCycleState.generation) return;
    if (!document.body.contains(wrapper)) return;

    applyMinWidth(wrapper, items);

    var build = pickStrategy(wrapper);
    var tokens = getCycleTokens();

    headlineCycleState.ctx = gsap.context(function () {
      headlineCycleState.timeline = build(items, tokens);
    }, wrapper);

    headlineCycleState.resizeHandler = function () {
      if (!document.body.contains(wrapper)) return;
      applyMinWidth(wrapper, items);
    };
    window.addEventListener("resize", headlineCycleState.resizeHandler);
  });
}

function cleanupHeadlineCycle() {
  // Bump generation so any pending fonts.ready from the active cycle bails.
  headlineCycleState.generation++;
  if (headlineCycleState.timeline) {
    headlineCycleState.timeline.kill();
    headlineCycleState.timeline = null;
  }
  if (headlineCycleState.ctx) {
    headlineCycleState.ctx.revert();
    headlineCycleState.ctx = null;
  }
  if (headlineCycleState.resizeHandler) {
    window.removeEventListener("resize", headlineCycleState.resizeHandler);
    headlineCycleState.resizeHandler = null;
  }
}

window.initHeadlineCycle = initHeadlineCycle;
window.cleanupHeadlineCycle = cleanupHeadlineCycle;
