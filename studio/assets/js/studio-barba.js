/**
 * Script Purpose: Studio Barba init — hierarchy-aware page transitions
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.8.0
 * Last Updated: 2026-05-16
 *
 * Architecture (one GSAP timeline factory, stage-only transforms):
 *
 *   1. resolveScenario(fromEl, toEl) → "enter" | "exit" | "swap" | "advance"
 *      | "fade" — from the two containers' data-level attributes.
 *
 *   2. buildTransition(scenario, data, opts) — THE factory. Builds one GSAP
 *      timeline from the SCENARIOS descriptor table (page-stage shape +
 *      serial page-header beats + overlay). Replaces the old per-scenario
 *      builders + runTransition + the _pendingHeader* handoff globals. Stored
 *      on _pendingTimeline for the after hook to kill. One reduced-motion
 *      guard at the top (duration:0 state-only timeline).
 *
 *   3. MOTION { enter, exit, swap, advance, fade } — design system motion
 *      tokens read once at load (token NAMES unchanged: --motion-page-open/
 *      close/swap/fade); gsapMotion() bridges the cubic-bezier token to a
 *      GSAP ease (no CustomEase plugin, tokens stay source of truth).
 *
 * Transforms target the inner [data-barba-stage] only — never the container
 * (Phase 1/2), so it's never a containing-block trap for sticky/fixed. The
 * leaving container is pinned position:fixed (CSS-scoped to
 * data-studio-role=leave) so the entering page never reflows. The page-header
 * is choreographed entirely inside the factory timeline (serial OUT → page →
 * eyebrow swap → IN for enter/exit/swap; instant eyebrow for advance/fade) —
 * no CSS parked rule, no before-hook prep.
 *
 * Three-level page model:
 *   L0 = home (index.html)         — the master / feed
 *   L1 = work / about / contact    — top-level destinations
 *   L2 = case studies / articles   — feed items
 *
 * Scenario rules:
 *   home → anything       enter    (rise: overlay dims, entering page lifts in)
 *   anything → home        exit    (drop: page falls away, home revealed)
 *   non-home → non-home    swap    (rise: same shape as enter)
 *   next-read card click   advance (push: frozen — title-shift, sides ride)
 *   same page / unknown    fade    (true crossfade)
 *
 * Reduced motion: single guard in buildTransition (instant state swap).
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

// Next-read card top (viewport-relative, pre-pin) captured in the `before`
// hook for the "advance" scenario and consumed by studioLeave. It MUST be
// read before the inline `top` pin + scrollTo(0,0): getBoundingClientRect
// includes ancestor offsets, so measuring after would inflate pushDistance
// (Bug 4: advance felt too fast / overshot the viewport top). null is the
// sentinel for "not measured" (not advance, or a next-read click with no
// .article-lead.is-next-read) so the factory falls back to a full-viewport
// push instead of a dead zero-distance hold; a numeric 0 means "card already
// flush, no travel".
var _pendingNextReadTop = null;

// Scroll offset (window.scrollY) captured in the `before` hook BEFORE the
// scrollTo(0,0) zeroes it, consumed by studioLeave. Used only by the `exit`
// (drop) shape to clip the leaving stage to the originally-visible viewport
// strip so deep-scroll content above it can't whip into view as the stage
// drops. Same capture-before-pin discipline as _pendingNextReadTop; 0 is a
// valid value (exit from the top → no-op inset).
var _pendingScrollOffset = 0;

// Leaving stage's full (untransformed) document height, measured in the
// `before` hook BEFORE the pin/transform could poison the rect. Used with
// _pendingScrollOffset to clip the `exit` leaving stage to a viewport-sized
// STRIP (top AND bottom inset) — a top-only inset on a full-document-height
// stage leaves the rest of the page painting over the home stage for the
// whole drop, hiding it until the very end. The strip travels off as the
// stage drops, progressively revealing home.
var _pendingStageHeight = 0;

document.addEventListener("click", function detectNextReadClick(e) {
  // Only the article next-read card triggers the "advance" push. The
  // case-study slider deliberately uses the standard lateral transition
  // ("swap", resolved by level) — not the next-read push.
  if (e.target.closest(".is-next-read")) {
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
// Returns a finalised scenario name (see SCENARIOS):
//   "advance" — next-read click (article → next article via the card)
//   "enter"   — home → anything
//   "exit"    — anything → home
//   "swap"    — non-home → non-home
//   "fade"    — fallback (same page / unknown)
function resolveScenario(fromEl, toEl) {
  // Next-read click — consume the flag set by the click handler
  if (_nextReadNav) {
    _nextReadNav = false;
    return "advance";
  }

  const fromLevel = readNumberAttr(fromEl, "data-level");
  const toLevel = readNumberAttr(toEl, "data-level");
  const safeFromLevel = Number.isFinite(fromLevel) ? fromLevel : 0;
  const safeToLevel = Number.isFinite(toLevel) ? toLevel : 0;

  // Anything → Home
  if (safeToLevel === 0 && safeFromLevel > 0) return "exit";

  // Home → Anything
  if (safeFromLevel === 0 && safeToLevel > 0) return "enter";

  // Non-home → Non-home
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

// Keyed by the finalised scenario name. The CSS custom-property TOKEN names
// never change (--motion-page-open/close/swap/fade is the design-system
// contract) — only the scenario identifiers were renamed, so the readMotion
// argument stays the token suffix. advance keeps the swap token so its frozen
// timing is bit-identical to the old pushUpTimeline. fade now consumes the
// previously-unused --motion-page-fade (resolves the old fade==rise borrow).
var MOTION = {
  enter: readMotion("open"),
  exit: readMotion("close"),
  swap: readMotion("swap"),
  advance: readMotion("swap"),
  fade: readMotion("fade"),
};

// Header slide (out/in) has no semantic motion token yet (--motion-element-*
// is reserved in cms/motion.md but undefined). Per motion.md, an un-named
// motion event may read primitives directly — never hardcode ms/easing.
// Follow-up ticket: add --motion-element-{enter,exit} to cms/motion.md.
var HEADER_DUR = (parseInt(readToken("--duration-s"), 10) || 400) / 1000;
var HEADER_EASE = cssCubicBezierToEase(readToken("--ease-in-out"));

// Overlay reaches full dim at 30% of the rise page tween. A dimensionless
// choreography ratio of a token-derived duration (not a hardcoded duration).
var OVERLAY_RATIO = 0.3;

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

// Resolve a container's transform stage — the single inner element every
// transition animates, so the container itself is never transformed and
// therefore never a containing block for its position:sticky/fixed
// descendants (the whole page + its sticky chrome moves as one rigid unit).
// `:scope >` is mandatory (a reused/cached container must not match a nested
// stage); falls back to the container if the wrapper is absent so a
// half-migrated page degrades to the old behaviour instead of throwing.
function stageOf(container) {
  return (
    (container && container.querySelector(":scope > [data-barba-stage]")) ||
    container
  );
}

// Finalised transition taxonomy. One factory (buildTransition) builds a single
// GSAP timeline per transition from this data table — no per-scenario builder
// functions, no _pendingHeader* handoff globals.
//   shape  — the page-stage motion: rise (enter/swap), drop (exit),
//            push (advance, frozen geometry), fade (true crossfade).
//   header — "serial": OUT fully → page → eyebrow swap → IN (enter/exit/swap).
//            "instant": eyebrow swaps at t=0, no header motion (advance/fade).
var SCENARIOS = {
  enter: { motion: "enter", shape: "rise", header: "serial" },
  exit: { motion: "exit", shape: "drop", header: "serial" },
  swap: { motion: "swap", shape: "rise", header: "serial" },
  advance: { motion: "advance", shape: "push", header: "instant" },
  fade: { motion: "fade", shape: "fade", header: "instant" },
};

// nextReadTop (advance): a number ≥ 0 (floored — a flush card legitimately
// yields 0 / no travel) when a next-read card was measured pre-pin (Bug 4),
// or null for a next-read click with no measurable card → full-viewport
// fallback so it still animates.
function resolvePushDistance(opts) {
  var nrt = opts ? opts.nextReadTop : null;
  return typeof nrt === "number" ? Math.max(0, nrt) : window.innerHeight;
}

// Instant header sync — eyebrow text + hidden toggle, no motion. Used by the
// advance/fade ("instant") path and the reduced-motion guard. Clears any
// inline transform so a prior interrupted slide can't leave it offscreen.
function applyHeaderInstant(header, newEyebrow) {
  if (!header) return;
  var eb = header.querySelector(".eyebrow-header");
  if (eb) eb.textContent = newEyebrow;
  header.toggleAttribute("hidden", !newEyebrow);
  gsap.set(header, { clearProps: "transform" });
}

// Pure synchronous reader (no tweens, no globals) — what the header does this
// transition. enter from home has no visible old header (→ no OUT, just IN);
// exit goes to home (no eyebrow, OUT only, hide after); swap does the full
// OUT → swap → IN.
function planHeader(scenario, headerEl, nextContainer) {
  var desc = SCENARIOS[scenario];
  var newEyebrow = (
    (nextContainer && nextContainer.getAttribute("data-page-eyebrow")) || ""
  ).trim();
  if (!desc || desc.header === "instant") {
    return { out: false, in: false, swapAtEnd: false, hideAfter: false, newEyebrow: newEyebrow };
  }
  if (scenario === "exit") {
    return { out: true, in: false, swapAtEnd: false, hideAfter: true, newEyebrow: "" };
  }
  // enter / swap
  var eb = headerEl ? headerEl.querySelector(".eyebrow-header") : null;
  var oldEyebrow = (eb ? eb.textContent : "").trim();
  var hasVisibleOld =
    headerEl && !headerEl.hasAttribute("hidden") && oldEyebrow !== "";
  return {
    out: !!hasVisibleOld, // enter-from-home: no visible old header → no OUT
    in: newEyebrow !== "", // skip IN if the next page has no eyebrow
    swapAtEnd: true, // swap eyebrow text after the page beat, before IN
    hideAfter: false,
    newEyebrow: newEyebrow,
  };
}

// Append the page-stage tween(s) to `tl` at position `pos` for the shape.
// Explicit per-shape branches (readability over a parametric tween). The
// container is never transformed — only the stage (Phase 2). y:"100vh" stays
// (the stage is full-document-height, so yPercent would be wrong — amdt C).
function installShape(tl, shape, ctx, pos) {
  var gm = ctx.gm;
  if (shape === "rise") {
    if (ctx.overlay) {
      tl.fromTo(
        ctx.overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: gm.duration * OVERLAY_RATIO, ease: "none" },
        pos
      );
    }
    tl.fromTo(
      ctx.enterStage,
      { y: "100vh", scale: 0.77, transformOrigin: "50% 100%" },
      { y: 0, scale: 1, duration: gm.duration, ease: gm.ease },
      pos
    );
  } else if (shape === "drop") {
    // Issue B — clip the leaving stage to the originally-visible viewport
    // STRIP before it falls. The container is pinned top:-scrollY, so in the
    // stage's own (untransformed) box the visible viewport is the band
    // y in [scrollOffset, scrollOffset + innerHeight]. We inset BOTH the top
    // (scrollOffset px — hides the deep-scroll content above the user that
    // would otherwise whip in) AND the bottom (everything below the viewport
    // — a top-only inset on a full-document-height stage keeps the rest of
    // the page painting over the z-index:1 home stage for the whole drop,
    // hiding home until the very end). Static (set, never tweened): clip-path
    // is evaluated in the element's pre-transform box, so the y translate
    // carries this strip rigidly with the page — it slides off as the stage
    // drops, progressively revealing home, with no GSAP shape interpolation.
    // Guarded scrollOffset > 0 (same discipline as the before-hook pin /
    // scrollTo): exit-from-top has nothing to whip and a clip would only
    // impose a needless clipping context on the leaving page's fixed/sticky
    // chrome for the whole drop. No offset → no clip at all.
    if (ctx.scrollOffset > 0) {
      var vh = window.innerHeight;
      var bottomInset = Math.max(0, ctx.stageHeight - ctx.scrollOffset - vh);
      tl.set(
        ctx.leaveStage,
        {
          clipPath:
            "inset(" + ctx.scrollOffset + "px 0px " + bottomInset + "px 0px)",
        },
        pos
      );
    }
    tl.fromTo(
      ctx.leaveStage,
      { y: 0 },
      { y: window.innerHeight, duration: gm.duration, ease: gm.ease },
      pos
    );
    tl.fromTo(
      ctx.enterStage,
      {
        scale: SLIDE_DOWN_ENTER_SCALE_FROM,
        opacity: SLIDE_DOWN_ENTER_OPACITY_FROM,
        transformOrigin: SLIDE_DOWN_ENTER_ORIGIN,
      },
      { scale: 1, opacity: 1, duration: gm.duration, ease: gm.ease },
      pos
    );
  } else if (shape === "push") {
    // Frozen advance geometry — leaving stage slides up by the measured
    // distance so the next title lands where the card title was; the side
    // sticky chrome rides up rigidly with it (no mask).
    tl.fromTo(
      ctx.leaveStage,
      { y: 0 },
      { y: -ctx.pushDistance, duration: gm.duration, ease: gm.ease },
      pos
    );
  } else {
    // fade — true crossfade, NO y/scale (resolves the old fade==rise borrow).
    tl.fromTo(
      ctx.leaveStage,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: gm.duration, ease: gm.ease },
      pos
    );
    tl.fromTo(
      ctx.enterStage,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: gm.duration, ease: gm.ease },
      pos
    );
  }
}

// THE factory. One timeline per transition (stored on _pendingTimeline so the
// kill/clearProps contract is unchanged). Replaces riseTimeline /
// slideDownTimeline / pushUpTimeline / runTransition and the per-builder
// reduced-motion early-returns. studioLeave calls this directly.
function buildTransition(scenario, data, opts) {
  var desc = SCENARIOS[scenario] || SCENARIOS.fade; // unknown → fade (safe)
  var enterStage = stageOf(data.next.container);
  var leaveStage = stageOf(data.current.container);
  var overlay = desc.shape === "rise" ? document.querySelector(".page-overlay") : null;
  var header = document.querySelector(".page-header");
  var hp = planHeader(scenario, header, data.next.container);

  // Single reduced-motion guard (replaces the per-builder early-returns).
  // duration:0 timeline (not a bare Promise.resolve — matches the animated
  // path's resolve-on-onComplete shape against Barba's sync barrier). No
  // willChange, full clearProps on the entering stage so no transform/scale
  // residue leaks.
  if (prefersReducedMotion()) {
    return new Promise(function (resolve) {
      var rtl = gsap.timeline({ onComplete: resolve });
      _pendingTimeline = rtl;
      rtl.set(
        enterStage,
        { clearProps: "transform,transformOrigin,scale,opacity,willChange" },
        0
      );
      applyHeaderInstant(header, hp.newEyebrow);
    });
  }

  var gm = gsapMotion(MOTION[desc.motion]);
  return new Promise(function (resolve) {
    var tl = gsap.timeline({ onComplete: resolve });
    _pendingTimeline = tl;

    // Promote only the stage(s) this scenario actually transforms. Cleared
    // (with transform) before the rAF that refreshes ScrollTrigger.
    //   rise  — entering rises (leaving is pinned, not transformed)
    //   drop  — leaving slides down AND entering (home) scales/opacities in
    //   push  — leaving slides up (entering is untouched)
    //   fade  — both crossfade
    var promote = [];
    if (desc.shape !== "push") promote.push(enterStage);
    if (desc.shape !== "rise") promote.push(leaveStage);
    gsap.set(promote, { willChange: "transform" });

    // advance / fade — eyebrow swaps instantly (continuous feel), no header
    // motion. Page beat at t=0.
    if (desc.header === "instant") {
      applyHeaderInstant(header, hp.newEyebrow);
      installShape(tl, desc.shape, {
        enterStage: enterStage,
        leaveStage: leaveStage,
        overlay: overlay,
        gm: gm,
        pushDistance: resolvePushDistance(opts),
        scrollOffset: opts && typeof opts.scrollOffset === "number" ? opts.scrollOffset : 0,
        stageHeight: opts && typeof opts.stageHeight === "number" ? opts.stageHeight : 0,
      }, 0);
      return;
    }

    // SERIAL header choreography (user-specified, sequential — not overlapped):
    // Beat A: OUT (only if a visible old header) → Beat B: page (+ overlay) →
    // eyebrow swap → Beat C: IN. .to for OUT (header rests at y:0, no from
    // needed); fromTo immediateRender:false for IN so the sequenced from-state
    // is applied at its position, not at build (no fromTo fight on the header).
    var pageStart = 0;
    if (hp.out && header) {
      tl.to(header, { y: "-100%", duration: HEADER_DUR, ease: HEADER_EASE }, 0);
      pageStart = HEADER_DUR;
    }

    installShape(tl, desc.shape, {
      enterStage: enterStage,
      leaveStage: leaveStage,
      overlay: overlay,
      gm: gm,
      pushDistance: resolvePushDistance(opts),
      scrollOffset: opts && typeof opts.scrollOffset === "number" ? opts.scrollOffset : 0,
      stageHeight: opts && typeof opts.stageHeight === "number" ? opts.stageHeight : 0,
    }, pageStart);
    var pageEnd = pageStart + gm.duration;

    // INVARIANT: this swap/unhide call and the IN fromTo below share the
    // SAME position (pageEnd). GSAP runs same-position items in insertion
    // order, so the call MUST stay inserted before the fromTo — it unhides
    // the header (enter-from-home: it was [hidden]) so the IN slide is
    // visible. Do not reorder these two blocks.
    if ((hp.swapAtEnd || hp.hideAfter) && header) {
      tl.call(
        function swapHeaderEyebrow() {
          var eb = header.querySelector(".eyebrow-header");
          if (eb) eb.textContent = hp.newEyebrow;
          header.toggleAttribute("hidden", !hp.newEyebrow);
        },
        null,
        pageEnd
      );
    }

    if (hp.in && header) {
      tl.fromTo(
        header,
        { y: "-100%" },
        { y: 0, duration: HEADER_DUR, ease: HEADER_EASE, immediateRender: false },
        pageEnd
      );
    }
  });
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
    // a11y: the leaving page animates out over several hundred ms before
    // Barba removes it. inert takes it out of the AT tree AND the keyboard
    // tab order for that window so focus/screen-reader can't land in a
    // departing page (mirrors the drawer's inert-on-.main pattern). Barba
    // detaches the node in `after`, so the attribute dies with it; the
    // defensive after-hook clear also strips it for any cached-reuse case.
    data.current.container.setAttribute("inert", "");
    data.next.container.setAttribute("data-studio-scenario", scenario);
    data.next.container.setAttribute("data-studio-role", "enter");

    // Advance distance was measured in the `before` hook BEFORE the pin +
    // scrollTo could poison getBoundingClientRect (Bug 4). Pass it through
    // verbatim — null (not advance / no next-read card) vs numeric (measured,
    // may be 0) is resolved in the factory so a card-less next-read still
    // animates.
    var nextReadTop = _pendingNextReadTop;
    _pendingNextReadTop = null;

    // Scroll offset captured pre-scrollTo (Issue B). Consumed only by the
    // `exit` (drop) shape to strip-clip the leaving stage.
    var scrollOffset = _pendingScrollOffset;
    _pendingScrollOffset = 0;
    var stageHeight = _pendingStageHeight;
    _pendingStageHeight = 0;

    // No per-scenario CONTAINER transform any more: every scenario pins the
    // leaving container out of flow via the before-hook inline `top: -scrollY`
    // (non-transform, so its sticky/fixed descendants never hit the
    // containing-block trap) and animates only the stage. clip-path on the
    // CONTAINER is still forbidden (it would reintroduce that trap), but the
    // `exit` drop DOES need a strip clip — applied to the STAGE (already the
    // transformed node, paint-only, no box/containing-block change) so the
    // above-scroll content can't whip in as the full-height stage falls.

    // GSAP element-out animations (skip for advance — morph would conflict
    // with the frozen title-shift).
    var outPromise = Promise.resolve();
    if (scenario !== "advance" && typeof window.bdAnimateElementsOut === "function") {
      outPromise = window.bdAnimateElementsOut(data.current.container);
    }

    // After elements are out: build + run the scenario's one GSAP timeline
    // (page stage + overlay + serial header all in it). studioEnter is a
    // no-op; sync:true makes barba wait for both. Cleanup is in the after hook.
    return outPromise.then(function () {
      return buildTransition(scenario, data, {
        nextReadTop: nextReadTop,
        scrollOffset: scrollOffset,
        stageHeight: stageHeight,
      });
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

// (The persistent page-header is now choreographed entirely inside
// buildTransition's single timeline — serial OUT → page → eyebrow swap → IN
// for enter/exit/swap, instant eyebrow for advance/fade. There is no separate
// animatePageHeader and no before-hook header prep: the factory's first
// header tween sets its own start state inline at timeline build, so there is
// no parked-state micro-gap to race — the CSS parked rule is deleted.)

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
    // never a painted frame where the leaving page is is-animating +
    // scroll-zeroed but NOT yet pinned (Bug B). One non-transform pin for
    // every scenario (leaving container position:fixed; top:-scrollY, CSS
    // scoped to data-studio-role=leave); the visible motion is on the stage.
    var leavingEl = data && data.current ? data.current.container : null;
    var scrollY = window.scrollY || 0;
    // Bug 4: capture the next-read card's true position BEFORE the pin +
    // scrollTo below poison getBoundingClientRect (it includes ancestor
    // offsets). Reset _pendingNextReadTop unconditionally so a hung
    // bdAnimateElementsOut on a prior transition can't leak a stale value.
    // _nextReadNav stays read only by resolveScenario below (its sole
    // consumer — re-reading here would misclassify).
    _pendingNextReadTop = null;
    // Same capture-before-scrollTo discipline: snapshot the scroll offset now
    // (window.scrollY is zeroed in the atomic block below) for the `exit`
    // stage clip. Reset-then-set unconditionally so a hung prior transition
    // can't leak a stale value.
    _pendingScrollOffset = scrollY;
    // Measure the leaving stage's full height NOW (pre-pin, no transform yet
    // so the rect is the true untransformed document height). Needed for the
    // `exit` strip clip's bottom inset. Same reset-then-set discipline.
    _pendingStageHeight = 0;
    if (leavingEl) {
      var leavingStageEl = stageOf(leavingEl);
      if (leavingStageEl) {
        _pendingStageHeight = leavingStageEl.getBoundingClientRect().height;
      }
    }
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
    // Resolve scenario once per transition — the sole consumer of the
    // one-shot _nextReadNav. studioLeave reads _pendingScenario (its
    // `_pendingScenario || resolveScenario(...)` short-circuits, so it never
    // re-consumes). resolveScenario does no DOM mutation/measurement, so it's
    // safe above the positioning block. All scenarios now share ONE
    // non-transform pin — there is no longer a per-scenario compensation
    // branch.
    _pendingScenario = resolveScenario(
      data && data.current ? data.current.container : null,
      data && data.next ? data.next.container : null
    );
    // Parallax freeze (Phase 0). The scrollTo(0,0) in the atomic block below
    // would re-drive the live [data-bd-parallax] scrub:1 ScrollTrigger on the
    // still-visible leaving page — the parallax "jump". Freeze just those
    // triggers in place: disable(false) stops them updating WITHOUT reverting
    // their tween values. The `false` is mandatory — the default `true`
    // reverts the bd-animations context on a still-visible page and makes
    // content vanish (a known dead-end). Scoped to parallax triggers inside
    // the leaving container only, so bd-animations scroll-reveals are
    // untouched. The frozen triggers die with the leaving context in the
    // after hook (bdAnimationsCleanup) — no restore needed. Runs before the
    // atomic block (synchronous, no paint) so Bug B atomicity is preserved.
    if (typeof ScrollTrigger !== "undefined" && leavingEl) {
      ScrollTrigger.getAll()
        .filter(function isLeavingParallaxTrigger(st) {
          return st.trigger && leavingEl.contains(st.trigger)
              && st.trigger.closest("[data-bd-parallax]");
        })
        .forEach(function freezeTrigger(st) { st.disable(false); });
    }
    // Atomic positioning block — one synchronous task, no paint between
    // statements, so there is never a frame where the leaving page is
    // is-animating + scroll-zeroed but NOT yet pinned (Bug B).
    //
    // The pin (position:fixed) is CSS-scoped to [data-studio-role="leave"]
    // so the ENTERING container stays position:relative in normal flow and
    // never reflows on the is-animating→removed flip (that flip was the
    // "advance" end-jump). data-studio-role is also set in studioLeave, but
    // it MUST be set here too so the pin rule applies in this same paint-free
    // task as is-animating + scrollTo — otherwise a scrolled leaving page
    // could paint unpinned for a frame. The inline `top:-scrollY` (no
    // !important on the rule) overrides its top:0 so the leaving page stays
    // where the user was scrolled — WITHOUT a transform, so its sticky/fixed
    // descendants never fall into the containing-block trap. The visible
    // motion lives entirely on the stage (see the timelines).
    document.body.classList.add("is-animating");
    if (leavingEl) {
      leavingEl.setAttribute("data-studio-role", "leave");
    }
    if (leavingEl && scrollY > 0) {
      leavingEl.style.top = (-scrollY) + "px";
    }
    if (scrollY > 0) {
      window.scrollTo(0, 0);
    }
    // Surface the scenario on <body> so CSS can react during the transition
    // (e.g. lifting .page-header above the .page-overlay during rise).
    document.body.setAttribute("data-studio-scenario", _pendingScenario);
    // The page-header is choreographed inside buildTransition's timeline now —
    // no before-hook header prep. The factory's first header tween sets its
    // own start state inline at build (synchronous, same tick as Barba leave),
    // so there is no parked-state micro-gap to race; the CSS park is deleted.
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
    // Amendment I — the factory timeline has completed (sync:true: leave's
    // promise resolved on onComplete before this hook), so the entering stage
    // is at its identity end-state but still carries that inline transform +
    // willChange. productSpotlightTrigger / bd-counter rebuild on the
    // studio:after-nav dispatch below (before the `after` hook's authoritative
    // clear), so clear the entering stage HERE first — they must never measure
    // a transformed / layer-promoted node. Idempotent with the after-hook
    // clear (clearProps on already-cleared props is a no-op); end-state is
    // identity so this is visually a no-op — it only removes the latent trap.
    var aiStage = stageOf(data.next.container);
    if (aiStage) {
      gsap.set(aiStage, {
        clearProps: "transform,transformOrigin,scale,opacity,willChange",
      });
    }
    updateMetaFromContainer(data.next.container);
    // a11y (WCAG 4.1.3): announce the route change. The title swap is silent
    // to screen readers and the focused <main> has no accessible name, so
    // without this a Barba navigation is unannounced. Write the new page
    // name into the persistent visually-hidden polite region (.route-status,
    // outside the Barba wrapper so it survives the swap). Prefer the short
    // eyebrow ("About", "Products"); fall back to the freshly-set title.
    var routeStatus = document.getElementById("studio-route-status");
    if (routeStatus) {
      var routeName = (
        data.next.container.getAttribute("data-page-eyebrow") || ""
      ).trim();
      routeStatus.textContent = routeName || document.title;
    }
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
    var leavingContainer = data && data.current ? data.current.container : null;
    // The stages are what the timelines transformed (never the containers).
    var nextStage = nextContainer ? stageOf(nextContainer) : null;
    var leavingStage = leavingContainer ? stageOf(leavingContainer) : null;

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
    gsap.killTweensOf(
      [pageOverlay, pageHeader, nextStage, leavingStage].filter(Boolean)
    );
    if (nextContainer) {
      nextContainer.removeAttribute("data-studio-role");
      nextContainer.removeAttribute("data-studio-scenario");
    }

    // Overlay must reset BEFORE is-animating is removed: while is-animating is
    // set the entering container is z-index 300; once removed it drops to
    // auto, and a still-opaque overlay (z-index 200) would cover the new page
    // for a frame. (The old "header must reset AFTER is-animating" constraint
    // is retired — Phase 3 deletes the CSS parked-header rule it dodged, so
    // the header has no is-animating-conditional state left to race; it's
    // cleared together with the stages below. Bug A stays structurally fixed
    // by GSAP timeline ownership, not by this ordering.)
    if (pageOverlay) {
      gsap.set(pageOverlay, { clearProps: "opacity,visibility,transform" });
    }

    document.body.classList.remove("is-animating");
    document.body.removeAttribute("data-studio-scenario");

    // Header + stages carried the transition motion. Clear transform +
    // willChange synchronously here (before the rAF) so bdAnimationsInit /
    // ScrollTrigger.refresh never measure a transformed / layer-promoted
    // node. nextStage was already cleared in afterEnter (amendment I) —
    // re-clearing is an idempotent no-op.
    // clipPath: the `exit` drop sets a static strip clip on the leaving
    // stage. The leaving stage normally detaches with its container, but a
    // reused/cached container would otherwise keep a phantom clip (same
    // defensive case as the inline `top` clear below).
    gsap.set([pageHeader, nextStage, leavingStage].filter(Boolean), {
      clearProps: "transform,transformOrigin,scale,opacity,visibility,clipPath,willChange",
    });

    // Defensive: the before hook sets an inline `top` on the leaving
    // container (the non-transform pin). Barba normally detaches that node so
    // the inline dies with it, but if a cached container is ever reused a
    // stale `top` would offset it. Clear it if still connected. (clearProps
    // removes the inline even though GSAP didn't set it.)
    if (leavingContainer && leavingContainer.isConnected) {
      gsap.set(leavingContainer, { clearProps: "top" });
      // Same defensive reasoning: drop the inert set in studioLeave if a
      // cached leaving container is ever reused (normally Barba detaches it).
      leavingContainer.removeAttribute("inert");
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
