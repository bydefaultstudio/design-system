/**
 * Script Purpose: Studio Barba init — hierarchy-aware page transitions
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.6.0
 * Last Updated: 2026-05-15
 *
 * Architecture:
 *
 *   1. Resolver — resolveScenario(fromEl, toEl) → "open" | "close" | "swap" | "fade"
 *      Answers "what's happening?" based on data-level attributes.
 *
 *   2. Map — TRANSITION_MAP { open: "slide-up", close: "slide-down", ... }
 *      Answers "which animation runs for this scenario?"
 *      Change one line here to globally swap how a scenario looks.
 *
 *   3. Library — TRANSITIONS { "slide-up": { leave(), enter() }, ... }
 *      Named animations. Each receives the scenario's motion token (not its own).
 *
 *   4. Motion tokens — MOTION { pageOpen, pageClose, pageSwap, pageFade }
 *      Read once from CSS custom properties. Indexed by scenario name.
 *
 * Three-level page model:
 *   L0 = home (index.html)         — the master / feed
 *   L1 = work / about / contact    — top-level destinations
 *   L2 = case studies / articles   — feed items
 *
 * Scenario rules:
 *   home → anything       open   (new page appears over the floor)
 *   anything → home       close  (current page leaves, floor revealed)
 *   non-home → non-home   swap   (reuses push-up animation — asymmetric)
 *   same page / unknown   fade   (crossfade fallback)
 *
 * Reduced motion: instant swap.
 */

// Studio Barba v0.6.0

// Flag set by click handler on .next-read — consumed once by resolveScenario
var _nextReadNav = false;

// Scenario resolved in `before` hook and consumed by `studioLeave`. Avoids
// calling resolveScenario twice per transition (which would double-consume
// the one-shot _nextReadNav flag and misclassify next-read clicks).
var _pendingScenario = null;

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
};

//
//------- Transition Map -------//
//
// Maps each scenario (what's happening) to an animation name (what it looks
// like). Change one line here to globally swap the visual for a scenario.
// The animation always receives the *scenario's* motion token, so the timing
// still matches the intent even if the visual changes.

var TRANSITION_MAP = {
  open:  "slide-up",
  close: "slide-down",
  swap:  "push-up",
  push:  "push-up",
  fade:  "fade",
};

//
//------- Transition Library -------//
//
// Named animations. Each entry has a leave(el, motion, opts) and
// enter(el, motion, opts) method. They receive:
//   el     — the Barba container to animate
//   motion — { duration, easing } from the scenario's motion token
//   opts   — { scrollOffset } (leave only — for scroll compensation)

// Home scale-and-dim: how much home recedes during a page open. Tweakable
// here without leaking into the design system tokens (these are studio-
// specific stylistic choices, not foundation-level motion semantics).
var HOME_SCALE_DOWN = 0.96;
var HOME_DIM_OPACITY = 0.7;
var HOME_TRANSFORM_ORIGIN = "50% 0%";

// Page-transition travel distance. Used by slide-down's leave (close) and
// slide-up's enter (open) so the two animations are true mirrors of each
// other — same magnitude, opposite direction. 100vh = exactly one viewport
// height. Paired with the clip-path applied to the leaving container in
// studioLeave on close, so a scrolled article slides cleanly out as one
// rigid strip — no content-whip.
var PAGE_TRAVEL = "100vh";

// All page transitions use PAGE_TRAVEL (100vh) — see clip-path in studioLeave for content-whip prevention on scrolled pages.
var TRANSITIONS = {

  // -- slide-up --
  // Default for "open". New page rises one viewport height from below
  // (PAGE_TRAVEL = 100vh → 0). Home (the leaving container) stays
  // anchored in place but scales down slightly and dims — selling the
  // layered depth of the page model. Transform-origin: 50% 0% so the
  // scale reads as "receding into the background", not "shrinking
  // inward". Mirror of slide-down: same travel magnitude, opposite
  // direction; home's scale-dim here is inverted as home's scale-brighten
  // in slide-down's enter.
  "slide-up": {
    leave: function slideUpLeave(el, motion, opts) {
      var offset = (opts && opts.scrollOffset) || 0;
      var startY = offset + "px";
      el.style.transformOrigin = HOME_TRANSFORM_ORIGIN;
      return animate(
        el,
        [
          { transform: "translateY(" + startY + ") scale(1)",                              opacity: 1 },
          { transform: "translateY(" + startY + ") scale(" + HOME_SCALE_DOWN + ")", opacity: HOME_DIM_OPACITY },
        ],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
    enter: function slideUpEnter(el, motion) {
      return animate(
        el,
        [
          { transform: "translateY(" + PAGE_TRAVEL + ")", opacity: 1 },
          { transform: "translateY(0)",                   opacity: 1 },
        ],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
  },

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
    leave: function slideDownLeave(el, motion, opts) {
      var offset = (opts && opts.scrollOffset) || 0;
      var startY = offset + "px";
      return animate(
        el,
        [
          { transform: "translateY(" + startY + ")",                                  opacity: 1 },
          { transform: "translateY(calc(" + startY + " + " + PAGE_TRAVEL + "))",     opacity: 1 },
        ],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
    enter: function slideDownEnter(el, motion) {
      el.style.transformOrigin = HOME_TRANSFORM_ORIGIN;
      return animate(
        el,
        [
          { transform: "scale(" + HOME_SCALE_DOWN + ")", opacity: HOME_DIM_OPACITY },
          { transform: "scale(1)",                       opacity: 1 },
        ],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
    },
  },

  // -- push-up --
  // Used for "push" (next-read card click) and "swap" (non-home ↔ non-home
  // sidebar nav). Asymmetric one-motion recipe: the current page pushes
  // upward by a measured distance; the new page sits at translateY(0)
  // behind, no enter animation. For push: opts.nextReadTop is measured
  // to align the next-read card flush with the top of the viewport. For
  // swap: nextReadTop is unset, falling back to window.innerHeight so
  // the leaving page slides one viewport height off the top.
  //
  // clip-path applied in studioLeave (close + swap) prevents content-whip
  // when a scrolled leaving page translates.
  "push-up": {
    leave: function pushUpLeave(el, motion, opts) {
      var pushDistance = (opts && opts.nextReadTop) || window.innerHeight;
      var offset = (opts && opts.scrollOffset) || 0;
      var startY = offset + "px";
      var endY = (offset - pushDistance) + "px";

      return animate(
        el,
        [
          { transform: "translateY(" + startY + ")" },
          { transform: "translateY(" + endY + ")" },
        ],
        { duration: motion.duration, easing: motion.easing, fill: "forwards" }
      );
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

function runLeave(el, scenario, scrollOffset, extra) {
  var animationName = TRANSITION_MAP[scenario] || "fade";
  var transition = TRANSITIONS[animationName] || TRANSITIONS["fade"];
  var motion = MOTION["page" + capitalize(scenario)] || MOTION.pageFade;
  var opts = { scrollOffset: scrollOffset };
  if (extra) { for (var k in extra) { if (extra.hasOwnProperty(k)) opts[k] = extra[k]; } }
  return transition.leave(el, motion, opts);
}

function runEnter(el, scenario) {
  var animationName = TRANSITION_MAP[scenario] || "fade";
  var transition = TRANSITIONS[animationName] || TRANSITIONS["fade"];
  var motion = MOTION["page" + capitalize(scenario)] || MOTION.pageFade;
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

    // Scroll compensation: capture the user's scroll position, apply the
    // compensating transform to the leaving container BEFORE the scroll snap
    // (so the user never sees an un-compensated frame), then snap the window
    // to top so absolute-positioned containers render in the visible area.
    // runLeave's WAAPI animation starts from translateY(scrollY) → end state,
    // so the inline transform here is exactly the start frame — no double-
    // application, no one-frame snap.
    var scrollY = window.scrollY || 0;
    if (scrollY > 0) {
      data.current.container.style.transform = "translateY(" + scrollY + "px)";
      window.scrollTo(0, 0);
    }
    var scrollOffset = -scrollY;

    // On close, clip the leaving container to the user's current viewport
    // strip so only the visible content translates during the WAAPI slide.
    // Without this, translating a tall (e.g. 4000px) article container
    // exposes content from above/below the user's scroll position — which
    // reads as "the article scrolling back to its top" while it also
    // slides down. clip-path inset() values are in the element's own
    // pre-transform coordinates, so they follow the translate cleanly.
    if (scenario === "close" || scenario === "swap") {
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
//   open  — header slides DOWN from above the viewport (translateY -100% → 0),
//           in sync with the entering page sliding UP from below. Eyebrow set
//           upfront so the bar carries the right label as it slides in.
//   close — header slides UP off the top (translateY 0 → -100%), in sync with
//           the leaving page sliding DOWN. After the animation, hide + clear.
//   swap / push / fade — header doesn't move; eyebrow swaps instantly via the
//           same path as syncPageHeaderFrom (used on cross-type swaps).
function animatePageHeader(scenario, nextContainer) {
  var pageHeader = document.querySelector(".page-header");
  if (!pageHeader) return Promise.resolve();
  var eyebrowEl = pageHeader.querySelector(".eyebrow-header");
  var newEyebrow = ((nextContainer && nextContainer.getAttribute("data-page-eyebrow")) || "").trim();

  if (scenario === "open") {
    if (eyebrowEl) eyebrowEl.textContent = newEyebrow;
    pageHeader.removeAttribute("hidden");
    return animate(
      pageHeader,
      [{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }],
      { duration: MOTION.pageOpen.duration, easing: MOTION.pageOpen.easing, fill: "forwards" }
    );
  }

  if (scenario === "close") {
    return animate(
      pageHeader,
      [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
      { duration: MOTION.pageClose.duration, easing: MOTION.pageClose.easing, fill: "forwards" }
    ).then(function onCloseDone() {
      // The `after` hook clears pageHeader.style.transform on every transition,
      // so don't duplicate that here. Just hide the element and reset the eyebrow.
      pageHeader.toggleAttribute("hidden", true);
      if (eyebrowEl) eyebrowEl.textContent = "";
    });
  }

  // swap / push / fade — instant eyebrow swap, header doesn't move
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
    document.body.classList.add("is-animating");
    // Resolve scenario once per transition. studioLeave will read it from
    // _pendingScenario instead of re-resolving (which would re-consume the
    // _nextReadNav flag and misclassify next-read clicks).
    _pendingScenario = resolveScenario(
      data && data.current ? data.current.container : null,
      data && data.next ? data.next.container : null
    );
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
    document.body.classList.remove("is-animating");
    // Clean up role/scenario attributes + any inline styles set by the
    // animation (transform from scroll-compensation, transformOrigin/opacity
    // from the home scale-and-dim) so they don't leak into the next transition.
    if (data && data.next && data.next.container) {
      data.next.container.removeAttribute("data-studio-role");
      data.next.container.removeAttribute("data-studio-scenario");
      data.next.container.style.transform = "";
      data.next.container.style.transformOrigin = "";
      data.next.container.style.opacity = "";
      data.next.container.style.clipPath = "";
    }
    // Clear inline transform on the persistent page-header so subsequent
    // transitions start from a clean slate (close leaves it at translateY(-100%)
    // until cleanup; open leaves it at translateY(0) which is identity but
    // still worth clearing).
    var pageHeader = document.querySelector(".page-header");
    if (pageHeader) pageHeader.style.transform = "";
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
