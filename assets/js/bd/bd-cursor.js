/**
 * Script Purpose: Desktop custom cursor
 * Author: Erlen Masson
 * Version: 3.0
 * Last Updated: April 8, 2026
 * Notes: Zero-dependency vanilla JS — no GSAP required
 */

console.log("Script - Cursor v3.0");

function initBdCursor() {
  // Idempotency guard — Barba transitions may re-load this script when navigating
  // from a non-website page to a website page, but the cursor itself lives outside
  // the swapped container and only needs to set up its listeners once.
  if (window.__bdCursorInited) return;
  window.__bdCursorInited = true;

  const cursor = document.querySelector(".cursor-default");
  const cursorHalo = document.querySelector(".cursor-halo");

  if (!cursor || !cursorHalo) {
    console.warn("Custom Cursor skipped — .cursor-default or .cursor-halo not found.");
    return;
  }

  document.body.classList.add("custom-cursor-active");

  // ------- Cursor Type Detection ------- //

  function getCursorTypeAtPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const host = el.closest("[data-cursor]");
    return host ? host.getAttribute("data-cursor") : null;
  }

  function setCursorType(type) {
    const prev = setCursorType._activeType || null;
    if (type === prev) return;

    if (prev) cursor.classList.remove(`cursor-${prev}`);

    if (type) {
      cursor.classList.add("cursor-custom", `cursor-${type}`);
    } else {
      cursor.classList.remove("cursor-custom");
    }

    setCursorType._activeType = type || null;
  }

  // ------- Animation State ------- //

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let haloX = 0;
  let haloY = 0;
  let rafId = null;
  let lastTime = 0;
  let firstMove = true;

  // ------- Animation Configuration ------- //
  // Edit these values to customize cursor behavior

  const CURSOR_LERP = 0.25;   // Cursor follow speed (lower = smoother trail)
  const HALO_LERP = 0.25;     // Halo follow speed (matches cursor so both layers stay together)
  const SNAP_THRESHOLD = 0.5;  // Snap to target below this distance (px)

  // ------- Animation Loop ------- //

  function animate(time) {
    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / (1000 / 60); // Normalize to 60fps
    lastTime = time;

    // Delta-time corrected lerp for consistent feel across refresh rates
    const cursorFactor = 1 - Math.pow(1 - CURSOR_LERP, dt);
    const haloFactor = 1 - Math.pow(1 - HALO_LERP, dt);

    // Interpolate cursor position
    cursorX += (mouseX - cursorX) * cursorFactor;
    cursorY += (mouseY - cursorY) * cursorFactor;

    // Interpolate halo position
    haloX += (mouseX - haloX) * haloFactor;
    haloY += (mouseY - haloY) * haloFactor;

    // Snap when close enough
    const cursorDist = Math.abs(mouseX - cursorX) + Math.abs(mouseY - cursorY);
    const haloDist = Math.abs(mouseX - haloX) + Math.abs(mouseY - haloY);

    if (cursorDist < SNAP_THRESHOLD) { cursorX = mouseX; cursorY = mouseY; }
    if (haloDist < SNAP_THRESHOLD) { haloX = mouseX; haloY = mouseY; }

    // Apply transforms (GPU-composited, -50% preserves CSS centering offset)
    cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
    cursorHalo.style.transform = `translate3d(calc(${haloX}px - 50%), calc(${haloY}px - 50%), 0)`;

    // Keep animating while there's distance to cover
    if (cursorDist >= SNAP_THRESHOLD || haloDist >= SNAP_THRESHOLD) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
      lastTime = 0;
    }
  }

  function startAnimation() {
    if (!rafId) {
      lastTime = 0;
      rafId = requestAnimationFrame(animate);
    }
  }

  // ------- Event Listeners ------- //

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Snap to mouse instantly on first move (avoid lerping from 0,0)
    if (firstMove) {
      cursorX = mouseX;
      cursorY = mouseY;
      haloX = mouseX;
      haloY = mouseY;
      cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
      cursorHalo.style.transform = `translate3d(calc(${haloX}px - 50%), calc(${haloY}px - 50%), 0)`;
      firstMove = false;
    }

    startAnimation();

    const type = getCursorTypeAtPoint(mouseX, mouseY);
    setCursorType(type);
  });

  document.addEventListener("mousedown", () => {
    cursorHalo.classList.add("cursor-pressed");
  });

  document.addEventListener("mouseup", () => {
    cursorHalo.classList.remove("cursor-pressed");
  });
}

// Run immediately if DOM is already ready (Barba transitions or late script load),
// otherwise wait for DOMContentLoaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBdCursor);
} else {
  initBdCursor();
}
