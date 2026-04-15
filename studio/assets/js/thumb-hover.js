/**
 * Script Purpose: Hover-to-play video thumbnails (feed cards + anywhere else
 *   a .vdo-thumb is used). Not related to bd-video — this is the lightweight
 *   decorative hover-swap, not the full video player.
 * Author: By Default
 * Created: 2026-04-14
 * Version: 0.1.0
 *
 * Behaviour:
 *   - Scans for `video.vdo-thumb` elements.
 *   - Trigger: closest `.post-item` ancestor if present (so the whole card
 *     activates playback), else the video element itself.
 *   - mouseenter → rewind to 0, play().
 *   - mouseleave → pause, rewind to 0.
 *   - Loops while hovered (hover duration is unpredictable).
 *   - Silent no-op on touch devices, viewports <992px, or
 *     `prefers-reduced-motion: reduce` — poster stays put.
 *   - Idempotent (guarded by data-thumb-hover-bound on the video).
 *
 * Re-init hook: window.initThumbHover(scope?) — call after injecting new
 * .vdo-thumb markup (e.g. feed re-render after Barba navigation).
 */

console.log("Thumb Hover v0.1.0");

(function () {

  function canHover() {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return false;
    if (!window.matchMedia("(min-width: 992px)").matches) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return true;
  }

  function bindThumb(video) {
    if (video.dataset.thumbHoverBound === "true") return;
    video.dataset.thumbHoverBound = "true";

    video.muted = true;
    video.loop = true;
    video.pause();
    video.currentTime = 0;

    var trigger = video.closest(".post-item") || video;

    trigger.addEventListener("mouseenter", function handleEnter() {
      video.currentTime = 0;
      video.play().catch(function () { /* autoplay policy / source errors — silent */ });
    });
    trigger.addEventListener("mouseleave", function handleLeave() {
      video.pause();
      video.currentTime = 0;
    });
  }

  function initThumbHover(scope) {
    if (!canHover()) return;
    var root = scope || document;
    root.querySelectorAll("video.vdo-thumb").forEach(bindThumb);
  }

  window.initThumbHover = initThumbHover;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initThumbHover(); });
  } else {
    initThumbHover();
  }

})();
