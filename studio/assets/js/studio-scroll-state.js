/**
 * Script Purpose: Toggle body.is-scrolling while the page is actively scrolling
 * Author: By Default
 * Created: 2026-04-29
 * Version: 1.0.0
 * Last Updated: 2026-04-29
 */

console.log("Studio Scroll State v1.0.0");

//
//------- Body Scroll State -------//
//

// Adds `is-scrolling` to <body> on every scroll event and removes it
// HIDE_DELAY ms after the last one. Any element can opt into scroll-only
// visibility with: body.is-scrolling .my-overlay { opacity: 1; }
//
// Listener lives on window and is registered once at DOMContentLoaded; it
// survives Barba transitions because Barba only swaps the <main> container.
//
// Two suppression rules prevent post-navigation flicker:
//   1. Ignore scroll events while body.is-animating is on (covers the in-
//      transition scrollTo(0,0) inside studio-barba.js leave hook).
//   2. Ignore scroll events for SUPPRESS_AFTER_NAV ms after the studio:
//      after-nav event (covers the second scrollTo(0,0) in the after hook,
//      which runs AFTER is-animating has already been removed).
function initScrollState() {
  var HIDE_DELAY = 500;
  var SUPPRESS_AFTER_NAV = 150;
  var body = document.body;
  var timeout = null;
  var suppressUntil = 0;

  function handleScroll() {
    if (body.classList.contains("is-animating")) return;
    if (performance.now() < suppressUntil) return;
    body.classList.add("is-scrolling");
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(function clearScrollState() {
      body.classList.remove("is-scrolling");
      timeout = null;
    }, HIDE_DELAY);
  }

  function handleAfterNav() {
    suppressUntil = performance.now() + SUPPRESS_AFTER_NAV;
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    body.classList.remove("is-scrolling");
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("studio:after-nav", handleAfterNav);
}

document.addEventListener("DOMContentLoaded", initScrollState);
