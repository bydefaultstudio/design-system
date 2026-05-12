// bd-counter.js — Number-counting primitive driven by [data-bd-count].
// Reusable across any page; init via window.initBdCounter().
//
// Attribute API on the target element:
//   data-bd-count="1.7"           target value (number, required)
//   data-bd-decimals="1"          decimal precision (int, default 0)
//   data-bd-suffix="s"            appended verbatim (string, optional)
//   data-bd-prefix=""             prepended verbatim (string, optional)
//   data-bd-format="comma"        "comma" (default, thousand grouping) or "plain"
//
// The static text content is the no-JS / reduced-motion / pre-init render —
// it should match the formatted final value.

console.log("bd-counter.js v0.1.0");

var bdCounterCtx = null;

// -- Helpers ------------------------------------------------------

function readDurationToken(name) {
  var val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!val) return 1.2;
  var n = parseFloat(val);
  return val.endsWith("ms") ? n / 1000 : n;
}

function readEaseToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "power2.out";
}

function formatCount(value, decimals, useGrouping, prefix, suffix) {
  var num = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping
  });
  return prefix + num + suffix;
}

// -- Per-element setup --------------------------------------------

function setupCounter(el) {
  var target = parseFloat(el.getAttribute("data-bd-count"));
  if (!Number.isFinite(target)) return;

  var decimals = parseInt(el.getAttribute("data-bd-decimals"), 10) || 0;
  var format = el.getAttribute("data-bd-format") || "comma";
  var prefix = el.getAttribute("data-bd-prefix") || "";
  var suffix = el.getAttribute("data-bd-suffix") || "";
  var useGrouping = format !== "plain";

  // Reduced motion → jump straight to final value, no ScrollTrigger.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = formatCount(target, decimals, useGrouping, prefix, suffix);
    return;
  }

  // Reset visible value to zero so the tween starts from there.
  // (Hidden by data-bd-animate slide-up parent in most cases, so no flash.)
  el.textContent = formatCount(0, decimals, useGrouping, prefix, suffix);

  var snap = decimals === 0 ? 1 : Math.pow(10, -decimals);
  var state = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: "top 80%",
    once: true,
    onEnter: function () {
      gsap.to(state, {
        val: target,
        duration: readDurationToken("--duration-xl"),
        ease: readEaseToken("--ease-out"),
        snap: { val: snap },
        onUpdate: function () {
          el.textContent = formatCount(state.val, decimals, useGrouping, prefix, suffix);
        }
      });
    }
  });
}

// -- Public init / cleanup ----------------------------------------

function initBdCounter() {
  var els = document.querySelectorAll("[data-bd-count]");
  if (!els.length) return;

  if (bdCounterCtx) bdCounterCtx.revert();

  bdCounterCtx = gsap.context(function () {
    els.forEach(setupCounter);
  });
}

window.initBdCounter = initBdCounter;

// Barba cleanup — fires in the `before` hook (studio-barba.js), BEFORE the
// transition animation runs and BEFORE the container is swapped. Kills all
// ScrollTriggers and tweens created by this module so nothing leaks.
document.addEventListener("studio:before-nav", function () {
  if (bdCounterCtx) {
    bdCounterCtx.revert();
    bdCounterCtx = null;
  }
});
