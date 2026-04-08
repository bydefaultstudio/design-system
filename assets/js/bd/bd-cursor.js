/**
 * Script Purpose: Desktop custom cursor
 * Author: Erlen Masson
 * Version: 2.1.3
 * Last Updated: December 9, 2024
 */

console.log("Script - Cursor v2.1.3");

document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".cursor-default");
  const cursorHalo = document.querySelector(".cursor-halo");

  if (!cursor || !cursorHalo) {
    console.warn("Custom Cursor skipped — .cursor-default or .cursor-halo not found.");
    return;
  }

  if (typeof gsap === 'undefined') {
    console.warn("Custom Cursor skipped — GSAP library not found.");
    return;
  }

  document.body.classList.add("custom-cursor-active");
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

  let mouseX = 0;
  let mouseY = 0;

  // ------- Cursor Animation Configuration ------- //
  // Edit these values to customize cursor behavior
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.to(cursor, {
      x: mouseX,
      y: mouseY,
      duration: 0.25,        // Cursor follow speed (seconds)
      ease: "power3.out",    // Cursor follow easing
      overwrite: "auto",
    });

    gsap.to(cursorHalo, {
      x: mouseX,
      y: mouseY,
      duration: 0.1,         // Halo follow speed (seconds) - faster than cursor
      ease: "none",          // Halo follow easing
      overwrite: "auto",
    });

    const type = getCursorTypeAtPoint(mouseX, mouseY);
    setCursorType(type);
  });

  document.addEventListener("mousedown", () => {
    cursorHalo.classList.add("cursor-pressed");
    gsap.to(cursorHalo, {
      width: 90,
      height: 90,
      duration: 0.2,
      ease: "power2.out"
    });
  });

  document.addEventListener("mouseup", () => {
    cursorHalo.classList.remove("cursor-pressed");
    gsap.to(cursorHalo, {
      width: 10,
      height: 10,
      duration: 0.2,
      ease: "power2.out"
    });
  });
});
