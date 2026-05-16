/**
 * Script Purpose: Studio Barba init — hierarchy-aware page transitions
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.7.0
 * Last Updated: 2026-05-16
 *
 * Architecture:
 *
 *   1. Resolver — resolveScenario(fromEl, toEl) → "open" | "close" | "swap" | "fade" | "push"
 *      Answers "what's happening?" based on data-level attributes.
 *
 *   2. Map — TRANSITION_MAP { open: "rise", close: "slide-down", ... }
 *      Answers "which animation runs for this scenario?"
 *      Change one line here to globally swap how a scenario looks.
 *
 *   3. Library — TRANSITIONS { "rise": { leave(), enter() }, ... }
 *      Named animations. Each receives the scenario's motion token (not its own).
 *
 *   4. Motion tokens — MOTION { pageOpen, pageClose, pageSwap, pageFade, pageRise }
 *      Read once from CSS custom properties. Indexed by scenario name.
 *
 * Three-level page model:
 *   L0 = home (index.html)         — the master / feed
 *   L1 = work / about / contact    — top-level destinations
 *   L2 = case studies / articles   — feed items
 *
 * Scenario rules:
 *   home → anything       open   (rise: overlay + entering page lifts in)
 *   anything → home       close  (slide-down: page falls away, home revealed)
 *   non-home → non-home   swap   (rise: same as open, with header up-then-down)
 *   next-read card click  push   (push-up: card aligned flush with header)
 *   same page / unknown   fade   (rise: defensive fallback)
 *
 * Reduced motion: instant swap.
 */

// Studio Barba v0.7.0

// Flag set by click handler on .next-read — consumed once by resolveScenario
var _nextReadNav = false;

// Scenario resolved in `before` hook and consumed by `studioLeave`. Avoids
// calling resolveScenario twice per transition (which would double-consume
// the one-shot _nextReadNav flag and misclassify next-read clicks).
var _pendingScenario = null;

// The active GSAP transition timeline. Stored so the after hook can kill it
// (defensive — it has normally completed by then). One timeline per transition.
var _pendingTimeline = null;

// Scroll offset (-scrollY) captured in the `before` hook and consumed by
// studioLeave. Captured there because the compensating transform, the
// is-animating class, and window.scrollTo(0,0) must all run in one
// synchronous block — once scrollTo fires, window.scrollY reads 0, so the
// value can't be re-derived later (fixes Bug B: page flash when scrolled).
var _pendingScrollOffset = 0;

document.addEventListener("click", function detectNextReadClick(e) {
  if (e.target.closest(".is-next-read") || e.target.closest(".case-study-slider a")) {
    _nextReadNav = true;
  }
});

//
//------- Utility Functions -------//
//

// Read prefers-reduced-motion at call time, not init time, so OS toggles take effect
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Read a numeric data attribute, returning NaN if missing
function readNumberAttr(el, attr) {
  if (!el) return NaN;
  const raw = el.getAttribute(attr);
  if (raw === null || raw === "") return NaN;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : NaN;
}

// Capitalize first letter — turns "open" into "Open" for MOTION key lookup
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Resolve which scenario applies based on the two containers' data-level.
//
// Returns a semantic scenario name (not an animation name):
//   "push"  — next-read click (article → article via next-read card)
//   "open"  — home → anything
//   "close" — anything → home
//   "swap"  — non-home → non-home
//   "fade"  — fallback
function resolveScenario(fromEl, toEl) {
  // Next-read click — consume the flag set by the click handler
  if (_nextReadNav) {
    _nextReadNav = false;
    return "push";
  }

  const fromLevel = readNumberAttr(fromEl, "data-level");
  const toLevel = readNumberAttr(toEl, "data-level");
  const safeFromLevel = Number.isFinite(fromLevel) ? fromLevel : 0;
  const safeToLevel = Number.isFinite(toLevel) ? toLevel : 0;

  // Anything → Home: close
  if (safeToLevel === 0 && safeFromLevel > 0) return "close";

  // Home → Anything: open
  if (safeFromLevel === 0 && safeToLevel > 0) return "open";

  // Non-home → Non-home: swap (reuses push-up)
  if (safeFromLevel > 0 && safeToLevel > 0) return "swap";

  // Same page or unknown
  return "fade";
}

// Wrap WAAPI Animation in a promise
function animate(el, keyframes, options) {
  return new Promise(function runAnimation(resolve) {
    if (!el || prefersReducedMotion()) {
      resolve();
      return;
    }
    var anim = el.animate(keyframes, options);
    anim.onfinish = resolve;
    anim.oncancel = resolve;
  });
}

// Detect external / non-Barba links so we can let the browser handle them normally
function shouldPrevent(payload) {
  var el = payload && payload.el;
  if (!el) return false;

  if (el.hasAttribute("data-barba-prevent")) return true;
  if (el.target === "_blank") return true;

  var href = el.getAttribute("href");
  if (!href) return true;
  if (href.startsWith("#")) return true;
  if (href.startsWith("mailto:")) return true;
  if (href.startsWith("tel:")) return true;

  try {
    var url = new URL(href, location.href);
    if (url.origin !== location.origin) return true;

    // Normalize pathnames — strip .html, index.html, trailing slashes
    var normLink = url.pathname.replace(/\/?(index)?\.html$/, "") || "/";
    var normPage = location.pathname.replace(/\/?(index)?\.html$/, "") || "/";

    // Same page with hash — let the browser scroll to the anchor
    if (normLink === normPage && url.hash) return true;

    // Same page without hash — block both Barba and browser navigation
    if (normLink === normPage && !url.hash) {
      if (payload.event) payload.event.preventDefault();
      return true;
    }
  } catch (e) {
    return true;
  }

  return false;
}

//
//------- Motion Tokens -------//
//
// All page-transition timing comes from the design system's semantic motion
// tokens. Studio never hardcodes durations or easing curves — see cms/motion.md
// for the full token reference. The four page-level tokens are read once at
// module load and cached in the MOTION constant below.

function readToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();
}

function readMotion(scope) {
  return {
    duration: parseInt(readToken("--motion-page-" + scope + "-duration"), 10),
    easing: readToken("--motion-page-" + scope + "-easing"),
  };
}

var MOTION = {
  pageOpen: readMotion("open"),
  pageClose: readMotion("close"),
  pageSwap: readMotion("swap"),
  pageFade: readMotion("fade"),
  pagePush: readMotion("swap"), // push reuses swap timing
  pageRise: readMotion("open"), // rise reuses open timing across open/swap/fade
};

// GSAP has no built-in cubic-bezier ease and the CustomEase plugin isn't
// loaded. To keep the design system motion tokens as the single source of
// truth (CLAUDE.md §3 — never hardcode easing), parse the token's
// cubic-bezier(x1,y1,x2,y2) and return a GSAP-compatible easing function.
// Standard WebKit UnitBezier solve: Newton-Raphson with a bisection fallback.
function cssCubicBezierToEase(cssValue) {
  var m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(cssValue || "");
  if (!m) return "power2.inOut"; // safe GSAP fallback if token isn't a cubic-bezier
  var x1 = +m[1], y1 = +m[2], x2 = +m[3], y2 = +m[4];
  function curve(t, a, b) {
    var c = 3 * a, bb = 3 * (b - a) - c, aa = 1 - c - bb;
    return ((aa * t + bb) * t + c) * t;
  }
  function curveSlope(t, a, b) {
    var c = 3 * a, bb = 3 * (b - a) - c, aa = 1 - c - bb;
    return (3 * aa * t + 2 * bb) * t + c;
  }
  function solveForT(x) {
    var t = x;
    for (var i = 0; i < 8; i++) {
      var dx = curve(t, x1, x2) - x;
      if (Math.abs(dx) < 1e-6) return t;
      var d = curveSlope(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    var lo = 0, hi = 1;
    t = x;
    for (var j = 0; j < 20; j++) {
      var xv = curve(t, x1, x2);
      if (Math.abs(xv - x) < 1e-6) break;
      if (x > xv) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  }
  return function easeFn(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return curve(solveForT(p), y1, y2);
  };
}

// Convert a MOTION entry { duration(ms), easing(css) } to GSAP params.
function gsapMotion(m) {
  return { duration: (m.duration || 0) / 1000, ease: cssCubicBezierToEase(m.easing) };
}

//
//------- Transition Map -------//
//
// Maps each scenario (what's happening) to an animation name (what it looks
// like). Change one line here to globally swap the visual for a scenario.
// The animation always receives the *scenario's* motion token, so the timing
// still matches the intent even if the visual changes.

var TRANSITION_MAP = {
  open:  "rise",
  close: "slide-down",
  swap:  "rise",
  push:  "push-up",
  fade:  "rise",
};

//
//------- Transition Library -------//
//
// Named animations. Each entry has a leave(el, motion, opts) and
// enter(el, motion, opts) method. They receive:
//   el     — the Barba container to animate
//   motion — { duration, easing } from the scenario's motion token
//   opts   — { scrollOffset } (leave only — for scroll compensation)

// slide-down's enter brings home back up from a scaled/dimmed state.
// These are the start values for that animation (home appears scaled
// and dim, then animates back to identity). Studio-specific stylistic
// choices, not foundation-level motion semantics.
var SLIDE_DOWN_ENTER_SCALE_FROM = 0.96;
var SLIDE_DOWN_ENTER_OPACITY_FROM = 0.7;
var SLIDE_DOWN_ENTER_ORIGIN = "50% 0%";

// Page-transition travel distance. Used by slide-down's leave (close) and
// slide-up's enter (open) so the two animations are true mirrors of each
// other — same magnitude, opposite direction. 100vh = exactly one viewport
// height. Paired with the clip-path applied to the leaving container in
// studioLeave on close, so a scrolled article slides cleanly out as one
// rigid strip — no content-whip.
var PAGE_TRAVEL = "100vh";

// All page transitions use PAGE_TRAVEL (100vh) — see clip-path in studioLeave for content-whip prevention on scrolled pages.
var TRANSITIONS = {

  // -- slide-down --
  // Default for "close". Leaving page slides one viewport height downward
  // (PAGE_TRAVEL = 100vh) — physically clears the viewport, opaque the
  // whole way, no fade needed. Home (the entering container) stays
  // anchored in place but scales BACK up from 0.96 → 1 and brightens
  // from 0.7 → 1, the inverse of slide-up's leave. Mirror of slide-up:
  // same travel magnitude, opposite direction.
  //
  // The leaving container also receives a clip-path (applied in
  // studioLeave) that constrains it to the user's current viewport strip,
  // so on a scrolled article only the visible content slides out — no
  // content from elsewhere in the article passes through the viewport.
  "slide-down": {
    leave: function slideDownLeave() {
      return Promise.resolve();
    },
    enter: function slideDownEnter(el, motion) {
      if (prefersReducedMotion()) return Promise.resolve();
      // The leaving container is still in the DOM (Barba removes it after
      // both promises resolve); find it by the role attribute studioLeave set.
      var leavingEl = document.querySelector('[data-studio-role="leave"]');
      var offset = _pendingScrollOffset || 0;
      var gm = gsapMotion(motion);
      return new Promise(function slideDownTimeline(resolve) {
        var tl = gsap.timeline({ onComplete: resolve });
        _pendingTimeline = tl;
        // Leaving page slides one viewport-height down, opaque the whole way.
        // Exact mirror of the previous WAAPI keyframes: y goes from the
        // scroll offset to offset + 100vh (window.innerHeight). The clip-path
        // applied in studioLeave keeps a scrolled article from content-whip.
        if (leavingEl) {
          tl.fromTo(
            leavingEl,
            { y: offset },
            { y: offset + window.innerHeight, duration: gm.duration, ease: gm.ease },
            0
          );
        }
        // Entering page (home) scales + brightens back from the receded state.
        tl.fromTo(
          el,
          {
            scale: SLIDE_DOWN_ENTER_SCALE_FROM,
            opacity: SLIDE_DOWN_ENTER_OPACITY_FROM,
            transformOrigin: SLIDE_DOWN_ENTER_ORIGIN,
          },
          { scale: 1, opacity: 1, duration: gm.duration, ease: gm.ease },
          0
        );
      });
    },
  },

  // -- rise --
  // Default for "open", "swap", "fade". One GSAP timeline, three actors,
  // all parallel — total duration = motion.duration (no chained phase 2):
  //
  //   - .page-overlay: autoAlpha 0 → 1 over the first 30%, then holds (GSAP
  //     keeps the end value for the remaining 70% of the timeline).
  //   - entering page (el): y 100vh → 0, scale 0.77 → 1, origin bottom-center.
  //   - .page-header: parked at translateY(-100%) by the CSS rule
  //     body.is-animating[data-studio-scenario=…] .page-header; slides
  //     y -100% → 0 starting at 50% so it lands exactly with the page.
  //
  // The leaving page stays still (scroll-compensated in studioLeave). The
  // whole visual lives in `enter`; `leave` is a no-op resolve. With sync:true
  // barba waits for both — the timeline's onComplete resolves enter.
  "rise": {
    leave: function riseLeave() {
      return Promise.resolve();
    },
    enter: function riseEnter(el, motion) {
      if (prefersReducedMotion()) return Promise.resolve();
      var overlay = ensureOverlay();
      var header = document.querySelector(".page-header:not([hidden])");
      var gm = gsapMotion(motion);
      return new Promise(function riseTimeline(resolve) {
        var tl = gsap.timeline({ onComplete: resolve });
        _pendingTimeline = tl;
        tl.fromTo(
          overlay,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: gm.duration * 0.3, ease: "none" },
          0
        );
        tl.fromTo(
          el,
          { y: "100vh", scale: 0.77, transformOrigin: "50% 100%" },
          { y: 0, scale: 1, duration: gm.duration, ease: gm.ease },
          0
        );
        if (header) {
          tl.fromTo(
            header,
            { y: "-100%" },
            { y: 0, duration: gm.duration * 0.5, ease: gm.ease },
            gm.duration * 0.5
          );
        }
      });
    },
  },

  // -- push-up --
  // Used for "push" only (next-read card click). Asymmetric one-motion recipe:
  // the current page pushes upward by a measured distance; the new page sits
  // at translateY(0) behind, no enter animation. opts.nextReadTop is measured
  // to align the next-read card flush with the top of the viewport.
  //
  // clip-path applied in studioLeave (close only) prevents content-whip when
  // a scrolled leaving page translates.
  "push-up": {
    leave: function pushUpLeave(el, motion, opts) {
      if (prefersReducedMotion()) return Promise.resolve();
      var pushDistance = (opts && opts.nextReadTop) || window.innerHeight;
      var offset = (opts && opts.scrollOffset) || 0;
      var gm = gsapMotion(motion);
      // Exact mirror of the previous WAAPI keyframes — y from the scroll
      // offset to offset - pushDistance. The new page sits at translateY(0)
      // behind (no enter animation). Visually unchanged from before.
      return new Promise(function pushUpTimeline(resolve) {
        var tl = gsap.timeline({ onComplete: resolve });
        _pendingTimeline = tl;
        tl.fromTo(
          el,
          { y: offset },
          { y: offset - pushDistance, duration: gm.duration, ease: gm.ease },
          0
        );
      });
    },
    enter: function pushUpEnter() {
      // No animation — new page is already in position behind the leaving page
      return Promise.resolve();
    },
  },

  // -- fade --
  // Crossfade fallback. Used when the scenario is unknown or when the same
  // page is navigated to.
  "fade": {
    leave: function fadeLeave(el, motion) {
      return animate(
        el,
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
    enter: function fadeEnter(el, motion) {
      return animate(
        el,
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
  },
};

//
//------- Runners -------//
//
// Look up the animation for a scenario and run it. The animation always
// receives the scenario's motion token, so the timing follows the intent
// even if you remap which animation a scenario uses.

// rise serves three scenarios (open/swap/fade) but always uses pageRise
// timing for visual consistency. Other animations key off their scenario.
function motionForScenario(scenario, animationName) {
  if (animationName === "rise") return MOTION.pageRise;
  return MOTION["page" + capitalize(scenario)] || MOTION.pageFade;
}

function runLeave(el, scenario, scrollOffset, extra) {
  var animationName = TRANSITION_MAP[scenario] || "fade";
  var transition = TRANSITIONS[animationName] || TRANSITIONS["fade"];
  var motion = motionForScenario(scenario, animationName);
  var opts = { scrollOffset: scrollOffset };
  if (extra) { for (var k in extra) { if (extra.hasOwnProperty(k)) opts[k] = extra[k]; } }
  return transition.leave(el, motion, opts);
}

function runEnter(el, scenario) {
  var animationName = TRANSITION_MAP[scenario] || "fade";
  var transition = TRANSITIONS[animationName] || TRANSITIONS["fade"];
  var motion = motionForScenario(scenario, animationName);
  return transition.enter(el, motion, {});
}

//
//------- Barba Transition -------//
//

var studioTransition = {
  name: "studio-directional",
  sync: true,
  leave: function studioLeave(data) {
    // Use the scenario resolved in the `before` hook. Defensive fallback to
    // resolveScenario in case `before` didn't fire (shouldn't happen).
    var scenario = _pendingScenario || resolveScenario(data.current.container, data.next.container);
    _pendingScenario = null;
    // Mark scenario + role on both containers so the CSS can layer them
    // correctly during the animation (Barba 2.x does NOT apply its own
    // .barba-leave / .barba-enter classes).
    data.current.container.setAttribute("data-studio-scenario", scenario);
    data.current.container.setAttribute("data-studio-role", "leave");
    data.next.container.setAttribute("data-studio-scenario", scenario);
    data.next.container.setAttribute("data-studio-role", "enter");

    // For push scenario, capture next-read card position before scroll snap.
    // Subtract the top bar height (mobile bar + persistent page-header) so the
    // card stops flush BELOW the fixed page-header — aligned with the entering
    // article's .article-lead (which sits below the header in flow due to
    // the wrapper's padding-top).
    var nextReadTop = 0;
    if (scenario === "push") {
      var nextRead = data.current.container.querySelector(".article-lead.is-next-read");
      var mobileBar = document.querySelector(".mobile-bar");
      var pageHeader = document.querySelector(".page-header:not([hidden])");
      var topBarHeight = (mobileBar ? mobileBar.offsetHeight : 0)
                       + (pageHeader ? pageHeader.offsetHeight : 0);
      if (nextRead) nextReadTop = nextRead.getBoundingClientRect().top - topBarHeight;
    }

    // Scroll compensation was applied atomically in the `before` hook (the
    // transform on the leaving container, is-animating, and scrollTo(0,0)
    // all run there in one synchronous block — see Bug B). Here we only
    // consume the captured offset for the close/push animation math.
    var scrollOffset = _pendingScrollOffset || 0;

    // On close, clip the leaving container to the user's current viewport
    // strip so only the visible content translates during the WAAPI slide.
    // Without this, translating a tall (e.g. 4000px) article container
    // exposes content from above/below the user's scroll position — which
    // reads as "the article scrolling back to its top" while it also
    // slides down. clip-path inset() values are in the element's own
    // pre-transform coordinates, so they follow the translate cleanly.
    //
    // Rise (open/swap/fade) and push do not translate the leaving container,
    // so the clip is unnecessary for them.
    if (scenario === "close") {
      var scrollY = -scrollOffset; // scrollOffset = -scrollY (captured in before)
      var containerHeight = data.current.container.offsetHeight;
      var viewportHeight = window.innerHeight;
      var insetTop = scrollY;
      var insetBottom = Math.max(0, containerHeight - scrollY - viewportHeight);
      data.current.container.style.clipPath =
        "inset(" + insetTop + "px 0 " + insetBottom + "px 0)";
    }

    // GSAP element-out animations (skip for push — morph would conflict)
    var outPromise = Promise.resolve();
    if (scenario !== "push" && typeof window.bdAnimateElementsOut === "function") {
      outPromise = window.bdAnimateElementsOut(data.current.container);
    }

    // After elements are out: run WAAPI page transition.
    // GSAP cleanup is deferred to the after hook so ctx.revert() doesn't
    // snap animated elements to opacity:0 while the leaving page is still visible.
    return outPromise.then(function () {
      return runLeave(data.current.container, scenario, scrollOffset, { nextReadTop: nextReadTop });
    });
  },
  enter: function studioEnter(data) {
    var scenario = data.next.container.getAttribute("data-studio-scenario") || "fade";
    return runEnter(data.next.container, scenario);
  },
};

//
//------- Hooks -------//
//

function updateMetaFromContainer(container) {
  if (!container) return;
  var newTitle = container.getAttribute("data-page-title");
  var newDesc = container.getAttribute("data-page-description");
  if (newTitle) document.title = newTitle;
  if (newDesc) {
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", newDesc);
  }
}

// Instant sync — used at first paint and as the body of the no-animation scenarios.
// Reads the next container's data-page-eyebrow and applies it to the persistent
// page-header (which lives outside the Barba wrapper, so it's never destroyed).
function syncPageHeaderFrom(container) {
  if (!container) return;
  var pageHeader = document.querySelector(".page-header");
  if (!pageHeader) return;
  var newEyebrow = (container.getAttribute("data-page-eyebrow") || "").trim();
  var eyebrowEl = pageHeader.querySelector(".eyebrow-header");
  if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
  pageHeader.toggleAttribute("hidden", !newEyebrow);
}

// Coordinate the persistent page-header with the page transition. Runs in the
// `before` hook with the resolved scenario.
//
//   open         — Prepare phase only: set the new eyebrow, remove [hidden],
//                   park the header at translateY(-100%) (offscreen, above).
//                   riseEnter chains the actual slide-down AFTER the page rise
//                   completes, so the header arrives last and lands on top.
//   close        — header slides UP off the top (translateY 0 → -100%), in sync
//                   with the leaving page sliding down. After the animation, hide
//                   + clear the eyebrow.
//   swap / fade  — Animate the OLD header out (translateY 0 → -100%) over the
//                   first ~30% of the rise duration, then swap the eyebrow text
//                   offscreen. The slide-IN with the new eyebrow happens in
//                   riseEnter after the page rise completes.
//   push         — header doesn't move; eyebrow swaps instantly (matches the
//                   continuous-article feel of the next-read transition).
function animatePageHeader(scenario, nextContainer) {
  var pageHeader = document.querySelector(".page-header");
  if (!pageHeader) return Promise.resolve();
  var eyebrowEl = pageHeader.querySelector(".eyebrow-header");
  var newEyebrow = ((nextContainer && nextContainer.getAttribute("data-page-eyebrow")) || "").trim();

  if (scenario === "close") {
    // Close is NOT a rise scenario, so the CSS parked-state rule doesn't
    // apply — the header slides up off the top then hides. GSAP gsap.to
    // (not part of _pendingTimeline; runs concurrently with slide-down).
    function finishClose() {
      pageHeader.toggleAttribute("hidden", true);
      if (eyebrowEl) eyebrowEl.textContent = "";
    }
    if (prefersReducedMotion()) {
      finishClose();
      return Promise.resolve();
    }
    var gmc = gsapMotion(MOTION.pageClose);
    return new Promise(function (resolve) {
      gsap.to(pageHeader, {
        y: "-100%",
        duration: gmc.duration,
        ease: gmc.ease,
        onComplete: function onCloseHeaderDone() {
          finishClose();
          resolve();
        },
      });
    });
  }

  // open / swap / fade / push — just set the eyebrow text + reveal.
  // For rise scenarios (open/swap/fade) the CSS rule
  //   body.is-animating[data-studio-scenario="..."] .page-header
  // parks the header at translateY(-100%) the moment is-animating is added;
  // the rise timeline slides it in. No inline transform here = no WAAPI
  // cancel race (fixes Bug A). For push the header doesn't move.
  if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
  pageHeader.toggleAttribute("hidden", !newEyebrow);
  return Promise.resolve();
}

//
//------- Initialize -------//
//

function initStudioBarba() {
  if (typeof window.barba === "undefined") {
    console.warn("[studio-barba] Barba not loaded — falling back to normal navigation");
    return;
  }

  window.barba.hooks.before(function onBefore(data) {
    // Scroll compensation — ATOMIC with is-animating + scrollTo so there is
    // never a painted frame where the leaving container is position:absolute
    // top:0 without the offsetting transform (Bug B: page flashes to its top
    // when navigating while scrolled). Set the transform while the container
    // is still position:relative, THEN add is-animating, THEN snap to top.
    var leavingEl = data && data.current ? data.current.container : null;
    var scrollY = window.scrollY || 0;
    _pendingScrollOffset = -scrollY;
    if (leavingEl && scrollY > 0) {
      leavingEl.style.transform = "translateY(" + scrollY + "px)";
    }
    document.body.classList.add("is-animating");
    if (scrollY > 0) {
      window.scrollTo(0, 0);
    }
    // Resolve scenario once per transition. studioLeave will read it from
    // _pendingScenario instead of re-resolving (which would re-consume the
    // _nextReadNav flag and misclassify next-read clicks).
    _pendingScenario = resolveScenario(
      data && data.current ? data.current.container : null,
      data && data.next ? data.next.container : null
    );
    // Surface the scenario on <body> so CSS can react during the transition
    // (e.g. lifting .page-header above the .page-overlay during rise).
    document.body.setAttribute("data-studio-scenario", _pendingScenario);
    // Coordinate the persistent page-header with the page transition. open/close
    // animate the header in/out; swap/push/fade just sync the eyebrow text.
    animatePageHeader(_pendingScenario, data && data.next ? data.next.container : null);
    // Lightweight state cleanup — remove body classes and disconnect observers
    // so they don't fire during the transition. Splide instances are NOT
    // destroyed here (that would strip inline styles while the old container
    // is still visible). Full cleanup + reinit happens in the after hook's rAF.
    document.body.classList.remove("is-case-study-open");
    // Headline word cycle (home only) — kill while the .cycle-word element
    // is still in the DOM (i.e. before Barba detaches the leaving container)
    // so gsap.context.revert() can restore its scoped styles cleanly.
    var leavingNs = data && data.current ? data.current.namespace : null;
    if (leavingNs === "home" && typeof window.cleanupHeadlineCycle === "function") {
      window.cleanupHeadlineCycle();
    }
    document.dispatchEvent(new CustomEvent("studio:before-nav"));
  });

  window.barba.hooks.afterEnter(function onAfterEnter(data) {
    updateMetaFromContainer(data.next.container);
    // Sync body[data-current-level] with the new container's data-level
    // (drives close-button visibility + any future level-aware CSS hooks)
    var newLevel = data.next.container.getAttribute("data-level") || "0";
    document.body.setAttribute("data-current-level", newLevel);
    if (typeof window.studioRefreshActiveNav === "function") {
      window.studioRefreshActiveNav();
    }
    if (typeof window.initBdVideo === "function") {
      window.initBdVideo(data.next.container);
    }
    document.dispatchEvent(new CustomEvent("studio:after-nav"));
    // Focus <main> so screen readers announce the new page. Runs after
    // studio:after-nav (synchronous) so closeDrawer has removed inert first.
    var mainEl = document.getElementById("main");
    if (mainEl) mainEl.focus({ preventScroll: true });
  });

  window.barba.hooks.after(function onAfter(data) {
    // Init features that query the DOM — must run after the old container
    // is fully removed so querySelector finds the new page's elements.
    if (typeof window.initNextRead === "function") {
      window.initNextRead();
    }
    if (typeof window.initToc === "function") {
      window.initToc();
    }
    if (typeof window.initShareLinks === "function") {
      window.initShareLinks();
    }
    if (typeof window.initSidebarSlot === "function") {
      window.initSidebarSlot();
    }
    var pageOverlay = document.querySelector(".page-overlay");
    var pageHeader = document.querySelector(".page-header");
    var nextContainer = data && data.next ? data.next.container : null;

    // Every transition is a GSAP timeline/tween now. Kill the transition
    // timeline (rise / slide-down / push-up) and any standalone tweens on
    // the animated elements (the close-header gsap.to isn't in the
    // timeline). GSAP holds its end-state as an inline style, so the
    // clearProps below fully resets it — there is no WAAPI cancel()
    // revert-to-pre-state race, so Bug A is structurally gone.
    if (_pendingTimeline) {
      _pendingTimeline.kill();
      _pendingTimeline = null;
    }
    gsap.killTweensOf([pageOverlay, pageHeader, nextContainer].filter(Boolean));
    if (nextContainer) {
      nextContainer.removeAttribute("data-studio-role");
      nextContainer.removeAttribute("data-studio-scenario");
    }

    // Cleanup order matters — two opposing constraints:
    //
    //  1. Overlay must reset BEFORE is-animating is removed. While
    //     is-animating is set the entering container is z-index 300; once
    //     removed it drops to auto. If the overlay (z-index 200) were still
    //     opaque at that moment it would cover the new page for a frame.
    //  2. Header must reset AFTER is-animating is removed. The CSS rule
    //     body.is-animating[data-studio-scenario] .page-header parks it at
    //     translateY(-100%). GSAP holds its end-state (translateY(0)) as an
    //     inline transform that OVERRIDES that rule — so the header stays
    //     correct through the class removal. If we cleared its inline while
    //     is-animating were still set, the parked -100% rule would apply
    //     for a frame (this was the root of Bug A).
    if (pageOverlay) {
      gsap.set(pageOverlay, { clearProps: "opacity,visibility,transform" });
    }

    document.body.classList.remove("is-animating");
    document.body.removeAttribute("data-studio-scenario");

    gsap.set([pageHeader, nextContainer].filter(Boolean), {
      clearProps: "transform,transformOrigin,opacity,visibility,clipPath",
    });

    window.scrollTo(0, 0);

    // Deferred init — runs after layout settles (is-animating removed,
    // containers back to static positioning, scroll at top).
    requestAnimationFrame(function () {
      // Clean up old GSAP context now that the leaving container is gone.
      // Must run before bdAnimationsInit creates the new context.
      if (typeof window.bdAnimationsCleanup === "function") {
        window.bdAnimationsCleanup();
      }
      // Features that measure layout (Splide, logo slider)
      if (typeof window.initCaseStudy === "function") {
        window.initCaseStudy();
      }
      if (typeof window.logoSlider === "function") {
        window.logoSlider();
      }
      if (typeof window.initReportTicker === "function") {
        window.initReportTicker();
      }
      if (typeof window.mountTestimonialSliders === "function") {
        window.mountTestimonialSliders();
      }
      // GSAP scroll animations
      if (typeof window.bdAnimationsInit === "function") {
        window.bdAnimationsInit(data.next.container);
      }
      if (typeof window.bdAnimateElementsIn === "function") {
        window.bdAnimateElementsIn(data.next.container);
      }
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });

  // Hover-prefetch plugin (optional; skipped if CDN script didn't load).
  if (typeof window.barbaPrefetch !== "undefined") {
    window.barba.use(window.barbaPrefetch);
  }

  window.barba.init({
    preventRunning: true,
    transitions: [studioTransition],
    prevent: shouldPrevent,
    debug: false,
  });

  // Initial sync — persistent header lives in static HTML with hand-authored eyebrow,
  // but on home (data-page-eyebrow="") it must be hidden from first paint.
  syncPageHeaderFrom(document.querySelector('[data-barba="container"]'));
}

// Wait for Barba CDN script to load before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStudioBarba);
} else {
  initStudioBarba();
}
