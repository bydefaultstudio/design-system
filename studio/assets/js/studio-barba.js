/**
 * Script Purpose: Studio Barba init — hierarchy-aware page transitions
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.8.0
 * Last Updated: 2026-05-16
 *
 * Architecture (GSAP timelines, CSS-driven parked state):
 *
 *   1. resolveScenario(fromEl, toEl) → "open" | "close" | "swap" | "fade" | "push"
 *      "What's happening?" — from the two containers' data-level attributes.
 *
 *   2. runTransition(scenario, data, opts) — a switch that builds and runs the
 *      scenario's GSAP timeline. open/swap/fade → riseTimeline; close →
 *      slideDownTimeline; push → pushUpTimeline. One timeline per transition,
 *      stored on _pendingTimeline for the after hook to kill.
 *
 *   3. MOTION { pageRise, pageClose, pagePush } — design system motion tokens
 *      read once at load; gsapMotion() bridges the cubic-bezier token to a
 *      GSAP ease (no CustomEase plugin needed, tokens stay source of truth).
 *
 * The page-overlay is a persistent .page-overlay div in each page's chrome
 * (queried, not JS-injected). The page-header's parked offscreen state for
 * rise scenarios is a CSS rule (body.is-animating[data-studio-scenario]
 * .page-header), not inline JS — GSAP overrides it while animating and it
 * auto-reverts when is-animating
 * is removed (no WAAPI cancel race).
 *
 * Three-level page model:
 *   L0 = home (index.html)         — the master / feed
 *   L1 = work / about / contact    — top-level destinations
 *   L2 = case studies / articles   — feed items
 *
 * Scenario rules:
 *   home → anything       open   (rise: overlay dims, entering page lifts in)
 *   anything → home       close  (slide-down: page falls away, home revealed)
 *   non-home → non-home   swap   (rise: same as open)
 *   next-read card click  push   (push-up: card aligned flush with header)
 *   same page / unknown   fade   (rise: defensive fallback)
 *
 * Reduced motion: instant swap (each timeline builder early-returns).
 */

// Studio Barba v0.8.0

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

// Next-read card top (viewport-relative, pre-bridge) captured in the `before`
// hook for the "push" scenario and consumed by studioLeave. Mirrors
// _pendingScrollOffset: it MUST be read before the bridge transform +
// scrollTo(0,0), because getBoundingClientRect includes ancestor transforms —
// measuring after the bridge inflated pushDistance by scrollY and the article
// over-travelled (Bug 4: push felt too fast / overshot the viewport top).
// null is the sentinel for "not measured" (not push, or a next-read click
// with no .article-lead.is-next-read — e.g. .case-study-slider links) so
// pushUpTimeline can fall back to a full-viewport push instead of a dead
// zero-distance hold; a numeric 0 means "card already flush, no travel".
var _pendingNextReadTop = null;

// Rise header choreography (Bug 3) handoff: set by animatePageHeader's
// open/swap/fade branch in the `before` hook, consumed by riseTimeline which
// owns the actual tweens (so the after hook's kill+clearProps contract is
// unchanged). _pendingHeaderOut = was there a visible old header to slide out;
// _pendingHeaderEyebrow = the new eyebrow to swap in offscreen at the midpoint
// (null = no midpoint swap — already applied for the no-old-header case).
var _pendingHeaderOut = false;
var _pendingHeaderEyebrow = null;

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
  pageRise: readMotion("open"),  // open/swap/fade all rise — reuse open timing
  pageClose: readMotion("close"),
  pagePush: readMotion("swap"),  // push reuses swap timing
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
//------- Transition Timelines -------//
//
// One GSAP timeline per scenario. Each builder takes Barba's `data`
// (data.current.container = leaving, data.next.container = entering) plus
// per-scenario opts, stores the timeline on _pendingTimeline so the after
// hook can kill it, and returns a Promise that resolves on completion.
// Reduced motion short-circuits to an instant resolve (no animation).

// slide-down's enter brings home back from a scaled/dimmed state. Start
// values for that — studio-specific stylistic choices, not foundation tokens.
var SLIDE_DOWN_ENTER_SCALE_FROM = 0.96;
var SLIDE_DOWN_ENTER_OPACITY_FROM = 0.7;
var SLIDE_DOWN_ENTER_ORIGIN = "50% 0%";

// rise — open / swap / fade. Overlay dims, entering page lifts + scales in,
// page-header slides in (parked at -100% by the CSS rule). All parallel in
// one timeline, total = pageRise duration. Leaving page stays still
// (scroll-compensated in the before hook).
function riseTimeline(data) {
  if (prefersReducedMotion()) return Promise.resolve();
  var el = data.next.container;
  // The leaving page is positioned by an inline `top: -scrollY` set in the
  // before hook (no transform), so it stays visually pinned where the user
  // was scrolled to while the new page rises over it — WITHOUT becoming a
  // transformed ancestor. rise therefore applies no transform to the leaving
  // container at all (close/push do, because they move it).
  var overlay = document.querySelector(".page-overlay");
  var header = document.querySelector(".page-header:not([hidden])");
  var gm = gsapMotion(MOTION.pageRise);
  return new Promise(function (resolve) {
    var tl = gsap.timeline({ onComplete: resolve });
    _pendingTimeline = tl;
    if (overlay) {
      tl.fromTo(
        overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: gm.duration * 0.3, ease: "none" },
        0
      );
    }
    tl.fromTo(
      el,
      { y: "100vh", scale: 0.77, transformOrigin: "50% 100%" },
      { y: 0, scale: 1, duration: gm.duration, ease: gm.ease },
      0
    );
    // Header choreography (Bug 3). Consume the handoff into locals and clear
    // the globals immediately (the swap callback fires during playback, so it
    // must close over the local, not the global). Beat 1: old header slides
    // out (only if there was a visible one). Midpoint: eyebrow text swaps
    // offscreen. Beat 3: header slides in last and lands on top. All in this
    // timeline → after hook's kill + clearProps cleans it; GSAP owns the
    // visible state start-to-end, so Bug A stays structurally fixed.
    var doHeaderOut = _pendingHeaderOut;
    var swapEyebrowText = _pendingHeaderEyebrow;
    _pendingHeaderOut = false;
    _pendingHeaderEyebrow = null;
    if (header) {
      if (doHeaderOut) {
        tl.to(
          header,
          { y: "-100%", duration: gm.duration * 0.3, ease: gm.ease },
          0
        );
      }
      if (swapEyebrowText !== null) {
        tl.call(
          function swapHeaderEyebrow() {
            var eb = header.querySelector(".eyebrow-header");
            if (eb) eb.textContent = swapEyebrowText;
            header.toggleAttribute("hidden", !swapEyebrowText);
          },
          null,
          gm.duration * 0.3
        );
      }
      // Beat 3 — slide the (new-eyebrow) header back in, landing last.
      // Skipped when swapEyebrowText === "" (defensive: a swap into a page
      // with no eyebrow — Beat 1 already slid the old header out and the
      // midpoint hid it; there is nothing to bring back). null (from-home,
      // no Beat 1) and a non-empty string (normal swap) both slide in.
      if (swapEyebrowText !== "") {
        tl.fromTo(
          header,
          { y: "-100%" },
          { y: 0, duration: gm.duration * 0.5, ease: gm.ease },
          gm.duration * 0.5
        );
      }
    }
  });
}

// slide-down — close. Leaving page slides one viewport-height down (opaque);
// home scales + brightens back from the receded state. The clip-path applied
// in studioLeave keeps a scrolled article from content-whip.
function slideDownTimeline(data) {
  if (prefersReducedMotion()) return Promise.resolve();
  var leavingEl = data.current.container;
  var el = data.next.container;
  var offset = _pendingScrollOffset || 0;
  var gm = gsapMotion(MOTION.pageClose);
  return new Promise(function (resolve) {
    var tl = gsap.timeline({ onComplete: resolve });
    _pendingTimeline = tl;
    if (leavingEl) {
      tl.fromTo(
        leavingEl,
        { y: offset },
        { y: offset + window.innerHeight, duration: gm.duration, ease: gm.ease },
        0
      );
    }
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
}

// push-up — push (next-read card). Current article pushes up by a measured
// distance; the next article sits at y:0 behind (no enter animation).
function pushUpTimeline(data, opts) {
  if (prefersReducedMotion()) return Promise.resolve();
  var leavingEl = data.current.container;
  // nextReadTop is the pre-bridge measured distance (Bug 4): a number (>= 0,
  // floored — a flush card legitimately yields 0 / no travel, and the floor
  // prevents reverse-travel on very short articles) when a next-read card was
  // found, or null for a next-read click with no measurable card (e.g.
  // .case-study-slider links) — fall back to a full-viewport push so it still
  // animates instead of dead-cutting.
  var nrt = opts ? opts.nextReadTop : null;
  var pushDistance = typeof nrt === "number"
    ? Math.max(0, nrt)
    : window.innerHeight;
  var offset = _pendingScrollOffset || 0;
  var gm = gsapMotion(MOTION.pagePush);
  return new Promise(function (resolve) {
    var tl = gsap.timeline({ onComplete: resolve });
    _pendingTimeline = tl;
    tl.fromTo(
      leavingEl,
      { y: offset },
      { y: offset - pushDistance, duration: gm.duration, ease: gm.ease },
      0
    );
  });
}

// Dispatch a scenario to its timeline. open / swap / fade all rise; close
// slides down; push pushes up. Unknown → rise (safe default).
function runTransition(scenario, data, opts) {
  switch (scenario) {
    case "close":
      return slideDownTimeline(data);
    case "push":
      return pushUpTimeline(data, opts);
    case "open":
    case "swap":
    case "fade":
    default:
      return riseTimeline(data);
  }
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

    // Push distance was measured in the `before` hook BEFORE the bridge
    // transform + scrollTo poisoned getBoundingClientRect (Bug 4). Consume the
    // stashed value here, mirroring how scrollOffset consumes
    // _pendingScrollOffset below. Pass it through verbatim — null (not push /
    // no next-read card) vs numeric (measured, may be 0) is resolved in
    // pushUpTimeline so a card-less next-read still animates.
    var nextReadTop = _pendingNextReadTop;
    _pendingNextReadTop = null;

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

    // rise no longer pins the leaving container with a transform — the before
    // hook positions it via inline `top: -scrollY` (no transform, so its
    // sticky/fixed descendants don't fall into the containing-block trap).
    // close/push still transform the leaving container via their own fromTo
    // (start value = scrollOffset), unchanged.

    // GSAP element-out animations (skip for push — morph would conflict)
    var outPromise = Promise.resolve();
    if (scenario !== "push" && typeof window.bdAnimateElementsOut === "function") {
      outPromise = window.bdAnimateElementsOut(data.current.container);
    }

    // After elements are out: run the scenario's GSAP timeline. The whole
    // transition (both containers, overlay, header) lives in that one
    // timeline; studioEnter is a no-op. sync:true makes barba wait for both.
    // GSAP cleanup is deferred to the after hook.
    return outPromise.then(function () {
      return runTransition(scenario, data, { nextReadTop: nextReadTop });
    });
  },
  enter: function studioEnter() {
    return Promise.resolve();
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
//   open         — From home, where the header is [hidden]/empty: no old
//                   header to slide out. Reveal it with the NEW eyebrow,
//                   parked offscreen (translateY(-100%)); riseTimeline's
//                   Beat 3 slides it in last so it lands on top.
//   close        — header slides UP off the top (translateY 0 → -100%), in sync
//                   with the leaving page sliding down. After the animation, hide
//                   + clear the eyebrow.
//   swap / fade  — Old header IS visible. Pin it at y:0 (overriding the CSS
//                   parked rule so it doesn't snap offscreen — no pop) keeping
//                   the OLD eyebrow. riseTimeline runs the 3-beat choreography:
//                   Beat 1 slide old header out, swap eyebrow offscreen at the
//                   midpoint, Beat 3 slide new header in last.
//   push         — header doesn't move; eyebrow swaps instantly (matches the
//                   continuous-article feel of the next-read transition).
//
// The open/swap/fade tweens live in riseTimeline's _pendingTimeline (not here)
// so the after hook's kill + clearProps contract is unchanged and GSAP owns
// the visible state start-to-end — the CSS parked rule is only the Bug A race
// net for the before→set micro-gap. This branch only preps the start state
// synchronously (same tick is-animating is added) and stashes the handoff.
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

  if (scenario === "push") {
    // push — header doesn't move; eyebrow swaps instantly (continuous-article
    // feel). Unchanged from before.
    if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
    pageHeader.toggleAttribute("hidden", !newEyebrow);
    return Promise.resolve();
  }

  // open / swap / fade — prep the header start state synchronously and stash
  // the handoff; riseTimeline owns the tweens. hasOldHeader: is there a
  // visible header (non-empty eyebrow, not [hidden]) to slide out?
  var oldEyebrow = (eyebrowEl ? eyebrowEl.textContent : "").trim();
  var hasOldHeader = !pageHeader.hasAttribute("hidden") && oldEyebrow !== "";

  if (prefersReducedMotion()) {
    // riseTimeline early-returns under reduced motion — finalise the header
    // now (instant), no tween, no stale handoff. Set inline y:0 (NOT
    // clearProps): is-animating + data-studio-scenario are already on <body>,
    // so the CSS parked rule would otherwise hold the header offscreen for the
    // whole transition and snap it in only when the after hook removes
    // is-animating. Inline y:0 overrides the park so it rests in place at once.
    if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
    pageHeader.toggleAttribute("hidden", !newEyebrow);
    gsap.set(pageHeader, { y: 0 });
    _pendingHeaderOut = false;
    _pendingHeaderEyebrow = null;
    return Promise.resolve();
  }

  _pendingHeaderOut = hasOldHeader;
  if (hasOldHeader) {
    // Keep the OLD eyebrow; pin at y:0 so the CSS parked rule can't snap it
    // offscreen before Beat 1 slides it out. New eyebrow swaps at the midpoint.
    _pendingHeaderEyebrow = newEyebrow;
    gsap.set(pageHeader, { y: 0 });
  } else {
    // No old header (from home). Apply the NEW eyebrow now, parked offscreen,
    // ready for Beat 3 to slide in. No Beat 1, no midpoint swap.
    if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
    pageHeader.toggleAttribute("hidden", !newEyebrow);
    gsap.set(pageHeader, { y: "-100%" });
    _pendingHeaderEyebrow = null;
  }
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
    // top:0 without the offsetting compensation (Bug B: page flashes to its
    // top when navigating while scrolled). Two compensation methods, branched
    // by scenario below:
    //   rise (open/swap/fade): the leaving page does NOT visibly move (only
    //     the new page rises), so compensate with a NON-transform inline
    //     `top: -scrollY`. No transform on the leaving container → its
    //     position:sticky/fixed descendants don't fall into the
    //     transformed-ancestor containing-block trap (no fade needed for them
    //     on rise — see studio.css scenario-split opacity rule).
    //   close/push: the leaving page IS the motion (slides down / pushes up),
    //     so it must be transformed — keep the original translateY bridge.
    var leavingEl = data && data.current ? data.current.container : null;
    var scrollY = window.scrollY || 0;
    _pendingScrollOffset = -scrollY;
    // Bug 4: capture the next-read card's true position BEFORE the bridge
    // transform + scrollTo below poison getBoundingClientRect (it includes
    // ancestor transforms). Reset these handoff globals unconditionally every
    // transition (genuinely mirroring _pendingScrollOffset — the close/push
    // branches of animatePageHeader return without clearing the header ones,
    // so a hung bdAnimateElementsOut on a prior rise must not leak stale state
    // into a later rise). Peek at _nextReadNav non-destructively: resolveScenario
    // below stays its sole consumer (re-reading it here would misclassify).
    _pendingNextReadTop = null;
    _pendingHeaderOut = false;
    _pendingHeaderEyebrow = null;
    if (_nextReadNav && leavingEl) {
      var nextReadEl = leavingEl.querySelector(".article-lead.is-next-read");
      if (nextReadEl) {
        var nrMobileBar = document.querySelector(".mobile-bar");
        var nrPageHeader = document.querySelector(".page-header:not([hidden])");
        var nrTopBar = (nrMobileBar ? nrMobileBar.offsetHeight : 0)
                     + (nrPageHeader ? nrPageHeader.offsetHeight : 0);
        _pendingNextReadTop = nextReadEl.getBoundingClientRect().top - nrTopBar;
      }
    }
    // Resolve scenario BEFORE positioning so the atomic block can branch its
    // compensation method. Still called exactly once per transition — the
    // sole consumer of the one-shot _nextReadNav. studioLeave reads
    // _pendingScenario (its `_pendingScenario || resolveScenario(...)`
    // short-circuits, so it never re-consumes). resolveScenario does no DOM
    // mutation/measurement, so moving it above the positioning block keeps the
    // Bug 4 next-read measurement (already done above) unaffected.
    _pendingScenario = resolveScenario(
      data && data.current ? data.current.container : null,
      data && data.next ? data.next.container : null
    );
    var isRise = _pendingScenario === "open"
              || _pendingScenario === "swap"
              || _pendingScenario === "fade";
    // Atomic positioning block — one synchronous task, no paint between
    // statements, so there is never a frame with the container absolute/top:0
    // and no compensation (Bug B).
    if (isRise) {
      // is-animating flips the container to position:absolute; top:0
      // (studio.css). Inline `top:-scrollY` (no !important on that rule)
      // overrides it — applied ONLY to the leaving container, never to
      // data.next. No transform → no containing-block trap for its
      // sticky/fixed descendants.
      document.body.classList.add("is-animating");
      if (leavingEl && scrollY > 0) {
        leavingEl.style.top = (-scrollY) + "px";
      }
      if (scrollY > 0) {
        window.scrollTo(0, 0);
      }
    } else {
      // close/push — unchanged from the original bridge: transform while still
      // position:relative, THEN is-animating, THEN snap to top.
      if (leavingEl && scrollY > 0) {
        leavingEl.style.transform = "translateY(" + scrollY + "px)";
      }
      document.body.classList.add("is-animating");
      if (scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }
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

    // Defensive: rise sets an inline `top` on the leaving container. Barba
    // normally detaches that node so the inline dies with it, but if a cached
    // container is ever reused, a stale `top` would offset it. Clear it if the
    // node is still connected. (clearProps removes the inline even though GSAP
    // didn't set it.)
    var leavingContainer = data && data.current ? data.current.container : null;
    if (leavingContainer && leavingContainer.isConnected) {
      gsap.set(leavingContainer, { clearProps: "top" });
    }

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
