/**
 * Script Purpose: Sidebar collapse, mobile drawer, page close, active nav, sidebar slot
 * Author: By Default
 * Created: 2026-04-23
 * Version: 0.1.0
 * Last Updated: 2026-04-23
 */

console.log("Studio Nav v0.1.0");

//
//------- Sidebar Collapse -------//
//

// Sidebar collapse (desktop) — persisted in localStorage. aria-expanded on
// the toggle carries the state for assistive tech (label stays semantic).
function initSidebarCollapse() {
  var STORAGE_KEY = "studio-sidebar-collapsed";
  var toggle = document.querySelector("[data-sidebar-toggle]");

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    document.body.classList.add("is-sidebar-collapsed");
  }

  if (!toggle) return;

  function syncAria() {
    var collapsed = document.body.classList.contains("is-sidebar-collapsed");
    // When collapsed, the sidebar contents are "not expanded" → false.
    toggle.setAttribute("aria-expanded", String(!collapsed));
  }
  syncAria();

  toggle.addEventListener("click", function handleSidebarToggle() {
    var collapsed = document.body.classList.toggle("is-sidebar-collapsed");
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    syncAria();
  });
}

//
//------- Mobile Drawer -------//
//

// Mobile drawer — slide-in sidebar with backdrop, Escape to close, body scroll
// lock. Proper modal pattern: aria-expanded on hamburger, inert on .main while
// open, focus trap inside the drawer, focus restored to hamburger on close.
function initMobileDrawer() {
  var hamburger = document.querySelector("[data-sidebar-hamburger]");
  var sidebar = document.querySelector(".sidebar");
  var main = document.querySelector(".main");
  var backdrop = document.querySelector("[data-sidebar-backdrop]");
  var previouslyFocused = null;

  function getFocusable(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
    );
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    if (!document.body.classList.contains("is-mobile-nav-open")) return;
    if (!sidebar) return;
    var focusable = getFocusable(sidebar);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openDrawer() {
    if (document.body.classList.contains("is-mobile-nav-open")) return;
    previouslyFocused = document.activeElement;
    document.body.classList.add("is-mobile-nav-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "true");
    if (main) main.setAttribute("inert", "");
    // Move focus into the drawer so keyboard / AT users land inside it.
    if (sidebar) {
      var focusable = getFocusable(sidebar);
      if (focusable.length) focusable[0].focus();
    }
  }

  function closeDrawer(skipFocusRestore) {
    if (!document.body.classList.contains("is-mobile-nav-open")) return;
    document.body.classList.remove("is-mobile-nav-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    if (main) main.removeAttribute("inert");
    // When closing due to Barba navigation (skipFocusRestore=true), don't
    // snap focus to the hamburger — afterEnter will focus <main> instead.
    if (!skipFocusRestore) {
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      } else if (hamburger) {
        hamburger.focus();
      }
    }
    previouslyFocused = null;
  }

  if (hamburger) {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.addEventListener("click", function handleHamburgerClick() {
      if (document.body.classList.contains("is-mobile-nav-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function handleBackdropClick() {
      closeDrawer();
    });
  }

  document.addEventListener("keydown", function handleKeydown(e) {
    if (e.key === "Escape") closeDrawer();
    else trapFocus(e);
  });

  // Close drawer after a Barba navigation finishes — skip focus restore
  // because afterEnter will focus <main> for screen reader announcement.
  document.addEventListener("studio:after-nav", function handleNavClose() {
    closeDrawer(true);
  });
}

//
//------- Nav Link Sync -------//
//

// Fix all sidebar nav links, sidebar slot links, and the close button after
// Barba navigations. Links are written as "contact.html" or "../contact.html"
// — after Barba changes the URL, the relative path may no longer resolve
// correctly. This strips any existing prefix and re-applies the correct one.
function syncNavHrefs() {
  var prefix = getStudioPrefix();
  var links = document.querySelectorAll(".nav-link, .sidebar-slot-link");
  links.forEach(function fixHref(link) {
    var href = link.getAttribute("href");
    if (!href) return;
    // Strip any ../ prefix to get the bare filename (e.g. "contact.html")
    var filename = href.replace(/^(\.\.\/)+/, "");
    link.setAttribute("href", prefix + filename);
  });

  // Also fix the close button
  var close = document.getElementById("studio-close-btn");
  if (close) close.href = prefix + "index.html";
}

// Update the close button's href to the right relative path for the current page
function syncPageCloseHref() {
  syncNavHrefs();
}

//
//------- Page Close -------//
//

// Close button href sync, Escape key handler, and data-level seeding.
// The close button markup now lives in the HTML template.
function initPageClose() {
  syncPageCloseHref();

  // Re-sync the href after every Barba navigation (location.pathname changes)
  document.addEventListener("studio:after-nav", syncPageCloseHref);

  // Escape key — navigate home via the close link (triggers Barba transition)
  document.addEventListener("keydown", function handleEscapeClose(e) {
    if (e.key !== "Escape") return;
    var level = document.body.getAttribute("data-current-level");
    if (level === "1" || level === "2") {
      var closeLink = document.getElementById("studio-close-btn");
      if (closeLink) closeLink.click();
    }
  });

  // Seed body[data-current-level] from the initial container.
  // After this, studio-barba.js's afterEnter hook keeps it in sync on every navigation.
  if (!document.body.hasAttribute("data-current-level")) {
    var initialContainer = document.querySelector('[data-barba="container"]');
    var level = (initialContainer && initialContainer.getAttribute("data-level")) || "0";
    document.body.setAttribute("data-current-level", level);
  }
}

//
//------- Active Nav -------//
//

// Active state — toggles .is-active + aria-current on the matching nav link
// AND the matching sidebar work card. Runs on DOMContentLoaded and after every
// Barba transition (called from the afterEnter hook in studio-barba.js).
function studioRefreshActiveNav() {
  var current = getCurrentPagePath();

  // -- Top nav links (.nav-link) --
  var navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(function markNavActive(link) {
    var href = link.getAttribute("href") || "";
    // Compare filenames only — strip any ../ prefix
    var linkFile = href.replace(/^(\.\.\/)+/, "");
    var isActive = linkFile === current;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  // -- Sidebar slot links (.sidebar-slot-link, case study cards) --
  // Extract the terminal filename from the href — robust against absolute
  // paths (/work/slug.html), relative paths (../work/slug.html), and
  // post-syncNavHrefs rewrites. Order-independent with syncNavHrefs.
  // Strips .html from both sides so clean URLs (/work/starry) still match
  // hrefs written with .html (/work/starry.html).
  var bare = current.replace(/\.html$/, "");
  var slotLinks = document.querySelectorAll(".sidebar-slot-link");
  slotLinks.forEach(function markSlotActive(link) {
    var href = link.getAttribute("href") || "";
    var hrefSlug = href.split("/").pop().split("?")[0].split("#")[0].replace(/\.html$/, "");
    var isActive = hrefSlug !== "" && hrefSlug === bare;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

//
//------- Sidebar Slot -------//
//

// Sidebar slot links are now in the HTML template. This function syncs
// their hrefs after Barba navigations (handled by syncNavHrefs).
function initSidebarSlot() {
  syncNavHrefs();
}

//
//------- Expose on window -------//
//

window.studioRefreshActiveNav = studioRefreshActiveNav;
window.initSidebarSlot = initSidebarSlot;
window.syncNavHrefs = syncNavHrefs;
