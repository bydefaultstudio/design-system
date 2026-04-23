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

  function closeDrawer() {
    if (!document.body.classList.contains("is-mobile-nav-open")) return;
    document.body.classList.remove("is-mobile-nav-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    if (main) main.removeAttribute("inert");
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      previouslyFocused.focus();
    } else if (hamburger) {
      hamburger.focus();
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
    backdrop.addEventListener("click", closeDrawer);
  }

  document.addEventListener("keydown", function handleKeydown(e) {
    if (e.key === "Escape") closeDrawer();
    else trapFocus(e);
  });

  // Close drawer after a Barba navigation finishes
  document.addEventListener("studio:after-nav", closeDrawer);
}

//
//------- Nav Link Sync -------//
//

// Fix all sidebar nav links and the close button after Barba navigations.
// Nav links are written as "contact.html" or "../contact.html" — after Barba
// changes the URL, the relative path may no longer resolve correctly.
// This strips any existing prefix and re-applies the correct one.
function syncNavHrefs() {
  var prefix = getStudioPrefix();
  var links = document.querySelectorAll(".nav-link");
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

// Inject the close button wrapper (icon + ESC label) once and seed
// body[data-current-level] from the initial Barba container so it's
// visible from frame one on direct loads of L1/L2 pages.
function initPageClose() {
  if (!document.getElementById("studio-close-wrap")) {
    var wrap = document.createElement("div");
    wrap.id = "studio-close-wrap";
    wrap.className = "close-btn-wrap";

    var close = document.createElement("a");
    close.id = "studio-close-btn";
    close.className = "button close-btn";
    close.setAttribute("data-icon-only", "");
    close.setAttribute("data-size", "small");
    close.setAttribute("aria-label", "Close");
    close.innerHTML = '<div class="svg-icn"><svg data-icon="close" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"></path></svg></div>';

    var label = document.createElement("span");
    label.className = "close-btn-label";
    label.textContent = "ESC";

    wrap.appendChild(label);
    wrap.appendChild(close);
    document.body.appendChild(wrap);
  }

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

// Active nav link state — toggles .is-active + aria-current on the matching sidebar link
function studioRefreshActiveNav() {
  var current = getCurrentPagePath();
  var links = document.querySelectorAll(".nav-link");
  links.forEach(function markActive(link) {
    var href = link.getAttribute("href") || "";
    // Compare filenames only — strip any ../ prefix
    var linkFile = href.replace(/^(\.\.\/)+/, "");
    var isActive = linkFile === current;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

//
//------- Sidebar Slot -------//
//

var SERVICES_REGISTRY = [
  {
    url: "services.html",
    title: "Interactive Ads",
    excerpt: "Ad formats that turn audiences into active participants with digital advertising formats",
    thumb: "https://bydefault.design/image/96x64"
  },
  {
    url: "services.html",
    title: "Interactive Content",
    excerpt: "Editorial and branded content people do, not just see. Memory sticks. Trust compounds.",
    thumb: "https://bydefault.design/image/96x64"
  },
  {
    url: "services.html",
    title: "Interactive Activations",
    excerpt: "Campaign moments designed for participation — built to make the digital experience feel like the brand.",
    thumb: "https://bydefault.design/image/96x64"
  }
];

function initSidebarSlot() {
  var container = document.querySelector(".sidebar-slot");
  if (!container) return;

  // Remove previously-rendered service links without wiping the section title
  // that's nested inside .sidebar-slot.
  container.querySelectorAll(".sidebar-slot-link").forEach(function remove(el) {
    el.remove();
  });

  var prefix = getStudioPrefix();

  SERVICES_REGISTRY.forEach(function buildPost(entry) {
    var link = document.createElement("a");
    link.className = "sidebar-slot-link";
    link.href = prefix + entry.url;
    link.innerHTML =
      '<img src="' + entry.thumb + '" alt="" class="sidebar-slot-link-thumb" loading="lazy">' +
      '<span class="sidebar-slot-link-text">' +
        '<span class="sidebar-slot-link-title">' + entry.title + '</span>' +
        '<span class="sidebar-slot-link-excerpt">' + entry.excerpt + '</span>' +
      '</span>';
    container.appendChild(link);
  });
}

//
//------- Expose on window -------//
//

window.studioRefreshActiveNav = studioRefreshActiveNav;
window.initSidebarSlot = initSidebarSlot;
window.syncNavHrefs = syncNavHrefs;
