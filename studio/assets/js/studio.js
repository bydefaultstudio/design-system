/**
 * Script Purpose: Studio site entry — sidebar collapse, mobile drawer, active nav, page tracking, contact form
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.6.0
 * Last Updated: 2026-04-12
 */

console.log("Studio v0.6.0");

//
//------- Utility Functions -------//
//

// Resolve current page filename, defaulting to index.html
function getCurrentPagePath() {
  var path = location.pathname.split("/").pop();
  return path && path.length > 0 ? path : "index.html";
}

// Live height of the pinned top chrome. 0 on desktop (mobile-bar hidden),
// 56 on mobile. Used by scroll-offset math in filters, TOC spy, push-up.
function getMobileBarHeight() {
  var bar = document.querySelector(".mobile-bar");
  return bar ? bar.offsetHeight : 0;
}

//
//------- Main Functions -------//
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

// Compute the relative path from the current page back to studio/index.html.
// Walks location.pathname looking for the "studio" segment and counts how
// many directories deep we are from there.
//
// Examples:
// Compute how many directory levels deep the current page is from the site root.
// Works whether deployed at /studio/ (dev) or / (production).
//   /index.html                      → depth 0 → ""
//   /articles/article-1.html         → depth 1 → "../"
//   /studio/index.html               → depth 0 → ""
//   /studio/articles/article-1.html  → depth 1 → "../"
function getStudioPrefix() {
  var segments = location.pathname.split("/").filter(Boolean);
  // If "studio" is in the path, measure depth after it; otherwise from root
  var studioIdx = segments.indexOf("studio");
  var base = studioIdx !== -1 ? studioIdx + 1 : 0;
  // Subtract 1 for the filename itself (last segment)
  var depth = segments.length - base - 1;
  return depth <= 0 ? "" : "../".repeat(depth);
}

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
    close.className = "button is-icon close-btn";
    close.setAttribute("aria-label", "Close");
    close.innerHTML = '<div class="svg-icn" data-icon="close"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"></path></svg></div>';

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

// Expose for studio-barba.js to call after each navigation
window.studioRefreshActiveNav = studioRefreshActiveNav;

//
//------- Feed Filters -------//
//

// Filter the content feed by type. Uses event delegation on [data-feed-filters]
// so it works after Barba navigations back to home without re-binding.
//
// Transition style is set via data-feed-transition on the feed container:
//   fade (default)    — simple opacity
//   scale             — opacity + scale to 0
//   stagger           — opacity with staggered reveal
//   scale-stagger     — opacity + scale with staggered reveal
//
// FLIP animation: posts that stay visible smoothly glide to their new
// positions after the masonry grid reflows, instead of snapping.
function initFeedFilters() {
  function readDuration(name) {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue(name), 10) || 0;
  }

  function readEasing() {
    return getComputedStyle(document.documentElement).getPropertyValue("--ease-out").trim() || "ease-out";
  }

  // FLIP: capture position of every visible post
  function capturePositions(items) {
    var positions = new Map();
    items.forEach(function capture(item) {
      if (!item.hidden) {
        var rect = item.getBoundingClientRect();
        positions.set(item, { x: rect.left, y: rect.top });
      }
    });
    return positions;
  }

  // FLIP: animate items from old position to new position
  function flipAnimate(items, firstPositions, duration, easing) {
    items.forEach(function animate(item) {
      if (item.hidden) return;
      var first = firstPositions.get(item);
      if (!first) return;

      var last = item.getBoundingClientRect();
      var dx = first.x - last.left;
      var dy = first.y - last.top;

      // Only animate if the item actually moved
      if (dx === 0 && dy === 0) return;

      item.animate(
        [
          { transform: "translate(" + dx + "px, " + dy + "px)" },
          { transform: "translate(0, 0)" }
        ],
        { duration: duration, easing: easing, fill: "none" }
      );
    });
  }

  document.addEventListener("click", function handleFilterClick(e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;

    var filterValue = btn.getAttribute("data-filter");
    var feed = document.querySelector("[data-feed]");
    if (!feed) return;

    // Already active — just scroll to feed top
    if (btn.classList.contains("is-active")) {
      var styles = getComputedStyle(document.documentElement);
      var scrollOffset = parseInt(styles.getPropertyValue("--scroll-offset"), 10) || 0;
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - getMobileBarHeight() - scrollOffset;
      window.scrollTo({ top: Math.max(0, feedTop), behavior: "smooth" });
      return;
    }

    // Read transition config
    var transition = feed.getAttribute("data-feed-transition") || "fade";
    var useStagger = transition === "stagger" || transition === "scale-stagger";
    var hideDuration = readDuration("--duration-2xs") || 100;
    var flipDuration = readDuration("--duration-s") || 400;
    var staggerDelay = readDuration("--duration-stagger") || 30;
    var easing = readEasing();

    // Sync active state on filter buttons
    var allButtons = document.querySelectorAll("[data-filter]");
    allButtons.forEach(function updateActive(b) {
      b.classList.toggle("is-active", b === btn);
    });

    var items = feed.querySelectorAll(".post-item");
    var toHide = [];
    var toShow = [];

    items.forEach(function categorise(item) {
      var type = item.getAttribute("data-feed-type");
      var matches = filterValue === "all" || type === filterValue;
      if (matches && item.hidden) {
        toShow.push(item);
      } else if (!matches && !item.hidden) {
        toHide.push(item);
      }
    });

    // FLIP step 1 — First: capture current positions of all visible items
    var firstPositions = capturePositions(items);

    // Phase 1: fade/scale out non-matching items
    toHide.forEach(function fadeOut(item) {
      item.classList.add("is-hiding");
    });

    // Phase 2: after hide completes, reflow + reveal + FLIP
    setTimeout(function hideAndShow() {
      // Remove hidden items from flow
      toHide.forEach(function hide(item) {
        item.hidden = true;
        item.classList.remove("is-hiding");
      });

      // Prepare showing items in their start state (invisible)
      toShow.forEach(function prepare(item) {
        item.classList.add("is-showing");
        item.hidden = false;
      });

      // Force reflow — browser calculates new layout positions
      void feed.offsetWidth;

      // FLIP step 2–4 — Last, Invert, Play: animate surviving items to new positions
      flipAnimate(items, firstPositions, flipDuration, easing);

      // Phase 3: reveal new items (staggered or all at once)
      if (useStagger) {
        toShow.forEach(function reveal(item, i) {
          setTimeout(function staggerReveal() {
            item.classList.remove("is-showing");
          }, i * staggerDelay);
        });
      } else {
        toShow.forEach(function reveal(item) {
          item.classList.remove("is-showing");
        });
      }

      // Scroll after DOM has updated
      var styles = getComputedStyle(document.documentElement);
      var scrollOffset = parseInt(styles.getPropertyValue("--scroll-offset"), 10) || 0;
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - getMobileBarHeight() - scrollOffset;
      window.scrollTo({ top: Math.max(0, feedTop), behavior: "smooth" });
    }, hideDuration);
  });
}

//
//------- Page Visit Tracking -------//
//

// Record the current page path in sessionStorage so we know which pages
// the user has seen this session. Called on init + after every Barba nav.
function trackPageView() {
  var path = location.pathname;
  var viewed = JSON.parse(sessionStorage.getItem("pagesViewed") || "[]");
  if (viewed.indexOf(path) === -1) {
    viewed.push(path);
    sessionStorage.setItem("pagesViewed", JSON.stringify(viewed));
  }
}

// Also capture referrer and landing page on first visit
function initSessionTracking() {
  if (!sessionStorage.getItem("landingPage")) {
    sessionStorage.setItem("landingPage", location.pathname);
  }
  if (!sessionStorage.getItem("sessionReferrer") && document.referrer) {
    sessionStorage.setItem("sessionReferrer", document.referrer);
  }
  trackPageView();
  document.addEventListener("studio:after-nav", trackPageView);
}

// Scan feed posts and mark any that link to pages the user has already visited.
// Injects a badge with check icon into the top-right of the .post card.
var ICON_CHECK = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg>';

function markReadPosts() {
  var viewed = JSON.parse(sessionStorage.getItem("pagesViewed") || "[]");
  if (!viewed.length) return;

  var posts = document.querySelectorAll(".post-item");
  posts.forEach(function checkPost(item) {
    var link = item.querySelector("a.post");
    if (!link) return;

    // Resolve the href to an absolute path for comparison
    var href = link.getAttribute("href");
    if (!href) return;
    var resolved;
    try {
      resolved = new URL(href, location.href).pathname;
    } catch (e) {
      return;
    }

    var isRead = viewed.indexOf(resolved) !== -1;
    item.classList.toggle("is-read", isRead);

    var header = link.querySelector(".post-header");
    if (!header) return;

    var existing = header.querySelector(".post-read-status");
    if (isRead && !existing) {
      var badge = document.createElement("div");
      badge.className = "post-read-status badge";
      badge.innerHTML = '<div class="svg-icn" data-icon="check">' + ICON_CHECK + '</div>Read';
      header.appendChild(badge);
    } else if (!isRead && existing) {
      existing.remove();
    }
  });
}

// Expose for external scripts to call
window.markReadPosts = markReadPosts;

//
//------- Contact Form -------//
//
// Handled by studio-contact.js (chips, validation, submission, abandonment)

//
//------- Dark Mode -------//
//

function initDarkMode() {
  var STORAGE_KEY = "studio-dark-mode";
  var toggle = document.querySelector(".dark-mode-toggle");

  function applyTheme(isDark) {
    document.body.classList.toggle("is-dark-mode", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }

  // Resolve initial state: saved preference → system preference → light
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    applyTheme(saved === "true");
  } else {
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  // Listen for OS-level theme changes (only when no explicit preference saved)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function handleSystemTheme(e) {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      applyTheme(e.matches);
    }
  });

  if (!toggle) return;

  toggle.addEventListener("click", function handleDarkModeToggle() {
    var isDark = !document.body.classList.contains("is-dark-mode");
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEY, String(isDark));
  });
}

//
//------- Sound Toggle -------//
//

function initSoundToggle() {
  var STORAGE_KEY = "studio-sound-off";
  var toggle = document.querySelector(".sound-toggle");

  function applySoundState(isSoundOff) {
    document.body.classList.toggle("is-sound-off", isSoundOff);
    // Mute/unmute all videos on the page
    var videos = document.querySelectorAll(".bd-video-player");
    videos.forEach(function muteVideo(v) { v.muted = isSoundOff; });
    // Notify other modules (bd-video, future audio components)
    document.dispatchEvent(new CustomEvent("studio:sound-changed", { detail: { muted: isSoundOff } }));
  }

  // Apply saved preference on init
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    applySoundState(true);
  }

  // Re-apply after Barba navigations (new video elements may have appeared)
  document.addEventListener("studio:after-nav", function handleNavSound() {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      applySoundState(true);
    }
  });

  if (!toggle) return;

  toggle.addEventListener("click", function handleSoundToggle() {
    var isSoundOff = !document.body.classList.contains("is-sound-off");
    applySoundState(isSoundOff);
    localStorage.setItem(STORAGE_KEY, String(isSoundOff));
  });
}

// Expose sound state check for other modules
window.studioIsSoundOff = function studioIsSoundOff() {
  return localStorage.getItem("studio-sound-off") === "true";
};

//
//------- Table of Contents (auto-generated) -------//
//

var tocObserver = null;
var tocVisibilityObserver = null;

// Convert heading text to a URL-safe slug
function slugifyHeading(text) {
  return "toc-" + text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Build a <ul> of TOC links from an array of headings
function buildTocList(headings) {
  var ul = document.createElement("ul");
  ul.className = "toc-list";
  headings.forEach(function createLink(heading) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "toc-link";
    a.textContent = heading.textContent.trim();
    a.href = "#" + heading.id;
    li.appendChild(a);
    ul.appendChild(li);
  });
  return ul;
}

function initToc() {
  // Clean up previous observers (Barba navigation)
  if (tocVisibilityObserver) {
    tocVisibilityObserver.disconnect();
    tocVisibilityObserver = null;
  }
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }

  var articleBody = document.querySelector(".article-body");
  if (!articleBody) return;

  // 1. Scan headings and auto-generate IDs
  var headings = articleBody.querySelectorAll("h2");
  if (!headings.length) return;

  headings.forEach(function assignId(heading) {
    if (!heading.id) {
      heading.id = slugifyHeading(heading.textContent);
    }
  });

  // 2. Auto-populate TOC containers (sidebar + in-this-article)
  var tocContainers = document.querySelectorAll(".toc-block, .in-this-article");
  tocContainers.forEach(function populateToc(container) {
    // Remove any existing list (Barba re-navigation)
    var existing = container.querySelector(".toc-list");
    if (existing) existing.remove();
    container.appendChild(buildTocList(headings));
  });

  // 3. Show/hide sidebar TOC based on in-this-article visibility
  var inThisArticle = document.querySelector(".in-this-article");
  var tocBlock = document.querySelector(".toc-block");
  var shareBlock = document.querySelector(".share-block");
  if (inThisArticle && (tocBlock || shareBlock)) {
    tocVisibilityObserver = new IntersectionObserver(function handleTocVisibility(entries) {
      entries.forEach(function checkVisibility(entry) {
        var visible = !entry.isIntersecting;
        if (tocBlock) tocBlock.classList.toggle("is-visible", visible);
        if (shareBlock) shareBlock.classList.toggle("is-visible", visible);
      });
    }, { threshold: 0 });
    tocVisibilityObserver.observe(inThisArticle);
  }

  // 4. Scroll spy — highlight active TOC link
  var topBarHeight = getMobileBarHeight();
  var tocLinks = document.querySelectorAll(".toc-link");

  tocObserver = new IntersectionObserver(function handleIntersect(entries) {
    entries.forEach(function checkEntry(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute("id");
        tocLinks.forEach(function updateActive(link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      }
    });
  }, {
    rootMargin: "-" + (topBarHeight + 16) + "px 0px -60% 0px",
    threshold: 0
  });

  headings.forEach(function observe(h) {
    tocObserver.observe(h);
  });

  // 4. Smooth scroll on TOC link click with top bar offset
  document.addEventListener("click", function handleTocClick(e) {
    var link = e.target.closest(".toc-link");
    if (!link) return;
    e.preventDefault();

    var targetId = link.getAttribute("href").slice(1);
    var target = document.getElementById(targetId);
    if (!target) return;

    var offset = target.getBoundingClientRect().top + window.scrollY - topBarHeight - 16;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
}

window.initToc = initToc;

//
//------- Share Links -------//
//

function initShareLinks() {
  // Copy link
  document.addEventListener("click", function handleShareCopy(e) {
    var btn = e.target.closest(".share-copy");
    if (!btn) return;

    var ICON_CHECK = '<div class="svg-icn" data-icon="check"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"></path></svg></div>';
    var originalHTML = btn.innerHTML;

    navigator.clipboard.writeText(window.location.href).then(function onCopy() {
      btn.innerHTML = ICON_CHECK + "Copied";
      setTimeout(function revert() {
        btn.innerHTML = originalHTML;
      }, 2000);
    });
  });

  // LinkedIn share
  document.addEventListener("click", function handleShareLinkedIn(e) {
    var link = e.target.closest(".share-linkedin");
    if (!link) return;
    e.preventDefault();
    var url = encodeURIComponent(window.location.href);
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url, "_blank", "width=600,height=500");
  });
}

//
//------- Sidebar Posts -------//
//

var SERVICES_REGISTRY = [
  {
    url: "contact.html",
    title: "Interactive Ads",
    excerpt: "Ad formats that turn audiences into active participants with digital advertising formats",
    thumb: "https://bydefault.design/image/96x64"
  },
  {
    url: "contact.html",
    title: "Interactive Content",
    excerpt: "Editorial and branded content people do, not just see. Memory sticks. Trust compounds.",
    thumb: "https://bydefault.design/image/96x64"
  },
  {
    url: "contact.html",
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

window.initSidebarSlot = initSidebarSlot;

//
//------- Next Read -------//
//

// Article list comes from the manifest at runtime — see loadStudioContent().

var ICON_CLOCK = '<div class="svg-icn" data-icon="clock"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"></path></svg></div>';

var ICON_CALENDAR = '<div class="svg-icn" data-icon="calendar"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M11.0184 14V12H13.0184V14H11.0184ZM7.01843 14V12H9.01843V14H7.01843ZM15.0184 14V12H17.0184V14H15.0184ZM11.0184 18V16H13.0184V18H11.0184ZM7.01843 18V16H9.01843V18H7.01843ZM15.0184 18V16H17.0184V18H15.0184ZM3.01843 22V4H5.01843C5.57072 4 6.01843 3.55228 6.01843 3V2H8.01843V3C8.01843 3.55228 8.46615 4 9.01843 4H15.0184C15.5707 4 16.0184 3.55228 16.0184 3V2H18.0184V3C18.0184 3.55228 18.4661 4 19.0184 4H21.0184V22H3.01843ZM5.01843 19C5.01843 19.5523 5.46615 20 6.01843 20H18.0184C18.5707 20 19.0184 19.5523 19.0184 19V11C19.0184 10.4477 18.5707 10 18.0184 10H6.01843C5.46615 10 5.01843 10.4477 5.01843 11V19ZM5.01843 7C5.01843 7.55228 5.46615 8 6.01843 8H18.0184C18.5707 8 19.0184 7.55228 19.0184 7C19.0184 6.44772 18.5707 6 18.0184 6H6.01843C5.46615 6 5.01843 6.44772 5.01843 7Z" fill="currentColor"></path></svg></div>';

function initNextRead() {
  var article = document.querySelector("article.article");
  if (!article) return;
  loadStudioContent().then(function (data) {
    var articles = (data.articles || []).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    if (!articles.length) return;

    // Remove any existing next-read (Barba re-navigation)
    var existing = article.parentNode.querySelector(".article.is-next-read");
    if (existing) existing.remove();

    // Match the current page to a manifest entry by slug (filename without .html)
    var currentSlug = location.pathname.replace(/^.*\//, "").replace(/\.html$/, "");
    var currentIndex = -1;
    articles.forEach(function findCurrent(entry, i) {
      if (entry.slug === currentSlug) currentIndex = i;
    });
    if (currentIndex === -1) return;

    var next = articles[(currentIndex + 1) % articles.length];
    var author = next.author || {};

    // Mirror the article structure so the next-read reads as its own article
    // card, gapped from the current one via CSS (.article + .article).
    var wrapper = document.createElement("article");
    wrapper.className = "article is-next-read";
    wrapper.setAttribute("data-article", next.slug);
    wrapper.innerHTML =
      '<a class="next-read-link" href="' + getStudioPrefix() + next.url + '" aria-label="Read: ' + attrEscape(next.title) + '"></a>' +
      '<section class="article-lead is-next-read">' +
        '<div class="padding-global top-medium bottom-medium">' +
          '<div class="next-read-label">Next read</div>' +
          '<div class="article-header">' +
            '<div class="article-meta">' +
              (next.readTime ? '<span class="article-meta-item">' + ICON_CLOCK + attrEscape(next.readTime) + '</span>' : '') +
              '<span class="article-meta-item">' + ICON_CALENDAR + formatStudioDate(next.date) + '</span>' +
            '</div>' +
            '<h1 class="article-title">' + next.title + '</h1>' +
            (author.name
              ? '<a class="article-author">' +
                  (author.avatar ? '<img src="' + attrEscape(author.avatar) + '" alt="" class="article-author-avatar" loading="lazy">' : '') +
                  '<span class="article-author-by">by</span> ' + author.name +
                '</a>'
              : '') +
          '</div>' +
        '</div>' +
      '</section>';

    article.parentNode.appendChild(wrapper);
  });
}

window.initNextRead = initNextRead;

//
//------- Studio Content (manifest from CMS) -------//
//
// Generated by studio/cms/generator/ → studio/assets/data/studio-content.json.
// Fetched once and cached for the homepage feed and the next-read card.

var STUDIO_CONTENT = null;
var STUDIO_CONTENT_PROMISE = null;

function loadStudioContent() {
  if (STUDIO_CONTENT) return Promise.resolve(STUDIO_CONTENT);
  if (STUDIO_CONTENT_PROMISE) return STUDIO_CONTENT_PROMISE;
  var url = getStudioPrefix() + "assets/data/studio-content.json";
  STUDIO_CONTENT_PROMISE = fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      STUDIO_CONTENT = data;
      return data;
    })
    .catch(function (err) {
      console.warn("studio-content.json not available:", err);
      STUDIO_CONTENT = { articles: [], caseStudies: [] };
      return STUDIO_CONTENT;
    });
  return STUDIO_CONTENT_PROMISE;
}

window.loadStudioContent = loadStudioContent;
window.getStudioPrefix = getStudioPrefix;

function attrEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function formatStudioDate(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

//
//------- Feed (homepage) -------//
//
// Renders [data-feed] from the manifest. Silently no-ops when no [data-feed]
// is present (i.e. on any page that isn't home).
//
// Ratio rules: featured variants put data-ratio on .post (CSS drives card
// shape); other variants put data-ratio on .post-thumbnail. Media: when an
// entry has thumbnailVideo it renders <video class="vdo-thumb"> for the
// thumb-hover.js hover-to-play behaviour; otherwise <img class="img-thumb">.

function buildThumbnailBlock(entry) {
  if (entry.feedVariant === "text") return { html: "", postRatioAttr: "" };

  var hasVideo = !!entry.thumbnailVideo;
  var src = hasVideo ? entry.thumbnailVideo : (entry.thumbnail || entry.hero);
  // Fallback: auto-generate a 4:5 placeholder with the title burned in
  // (bydefault.design/image already serves author avatars). Writers can
  // override by setting `thumbnail` + `thumbnail-ratio` in frontmatter.
  var usedPlaceholder = false;
  if (!src) {
    src = "https://bydefault.design/image/400x500?text=" + encodeURIComponent(entry.title || "");
    usedPlaceholder = true;
  }

  var alt = attrEscape(entry.thumbnailAlt || entry.title || "");
  var ratio = entry.thumbnailRatio || (usedPlaceholder ? "4:5" : "");
  var isFeatured = Boolean(entry.featured) || entry.feedVariant === "featured";
  var mediaStyle = entry.thumbnailFocus
    ? ' style="object-position: ' + attrEscape(entry.thumbnailFocus) + ';"'
    : "";
  var thumbRatioAttr = !isFeatured && ratio ? ' data-ratio="' + attrEscape(ratio) + '"' : "";
  var postRatioAttr = isFeatured && ratio ? ' data-ratio="' + attrEscape(ratio) + '"' : "";

  var mediaHtml;
  if (hasVideo) {
    var poster = entry.thumbnailVideoPoster || entry.thumbnail || entry.hero || "";
    var posterAttr = poster ? ' poster="' + attrEscape(poster) + '"' : "";
    mediaHtml =
      '<video class="vdo-thumb" src="' + attrEscape(src) + '"' + posterAttr +
      ' muted playsinline preload="metadata" aria-hidden="true"' + mediaStyle + "></video>";
  } else {
    mediaHtml =
      '<img class="img-thumb" src="' + attrEscape(src) + '" alt="' + alt + '" loading="lazy"' + mediaStyle + ">";
  }

  return {
    html: '<div class="post-thumbnail"' + thumbRatioAttr + ">" + mediaHtml + "</div>",
    postRatioAttr: postRatioAttr
  };
}

function renderFeedItem(entry) {
  var isArticle = entry.type === "article";
  var label = isArticle ? "Article" : "Case study";
  var postType = entry.featured ? "featured" : (entry.feedVariant || "standard");
  var excerpt = entry.synopsis ? '<p class="post-excerpt">' + entry.synopsis + '</p>' : "";

  var metaParts = ['<span class="post-meta-item post-date">' + formatStudioDate(entry.date) + '</span>'];
  if (isArticle && entry.readTime) metaParts.push('<span class="post-meta-item post-read-time">' + entry.readTime + '</span>');
  if (!isArticle && entry.client) metaParts.push('<span class="post-meta-item post-client">' + entry.client + '</span>');

  var thumb = buildThumbnailBlock(entry);

  var wrap = document.createElement("div");
  wrap.className = "post-item";
  wrap.setAttribute("data-feed-type", entry.type);
  wrap.setAttribute("data-feed-date", entry.date);
  wrap.innerHTML =
    '<a href="' + getStudioPrefix() + entry.url + '" class="post" data-post-type="' + postType + '"' + thumb.postRatioAttr + ">" +
      '<div class="post-header"><span class="post-label">' + label + '</span></div>' +
      '<div class="post-body">' +
        '<h3 class="post-title">' + entry.title + '</h3>' +
        excerpt +
        '<div class="post-meta bottom-meta">' + metaParts.join("") + '</div>' +
      '</div>' +
      thumb.html +
    '</a>';
  return wrap;
}

function initFeed() {
  var feed = document.querySelector("[data-feed]");
  if (!feed) return;
  loadStudioContent().then(function (data) {
    var all = [].concat(data.articles || [], data.caseStudies || []);
    all.sort(function (a, b) { return b.date.localeCompare(a.date); });
    feed.innerHTML = "";
    all.forEach(function (entry) { feed.appendChild(renderFeedItem(entry)); });
    if (typeof markReadPosts === "function") markReadPosts();
    if (typeof window.initThumbHover === "function") window.initThumbHover(feed);
  });
}

window.initFeed = initFeed;

//
//------- Initialize -------//
//

// Services page — two-level accordion + audience-tab CTA. Only binds when
// the services markup is on the page; safe to call on every nav.
function initServices() {
  var services = document.querySelectorAll(".service-row");
  if (services.length) {
    services.forEach(function bindService(row) {
      var trigger = row.querySelector(".service-trigger");
      if (!trigger || trigger.dataset.serviceBound) return;
      trigger.dataset.serviceBound = "true";
      trigger.addEventListener("click", function toggleService() {
        var wasOpen = row.classList.contains("is-open");
        // Single-open: close all services + reset their nested format rows.
        services.forEach(function closeOther(other) {
          other.classList.remove("is-open");
          var otherTrigger = other.querySelector(".service-trigger");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          other.querySelectorAll(".format-row.is-open").forEach(function closeFormat(fr) {
            fr.classList.remove("is-open");
            var ft = fr.querySelector(".format-trigger");
            if (ft) ft.setAttribute("aria-expanded", "false");
          });
        });
        if (!wasOpen) {
          row.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  var formats = document.querySelectorAll(".format-trigger");
  formats.forEach(function bindFormat(trigger) {
    if (trigger.dataset.formatBound) return;
    trigger.dataset.formatBound = "true";
    trigger.addEventListener("click", function toggleFormat() {
      var row = trigger.closest(".format-row");
      if (!row) return;
      var opening = !row.classList.contains("is-open");
      row.classList.toggle("is-open", opening);
      trigger.setAttribute("aria-expanded", String(opening));
    });
  });

  var tabs = document.querySelectorAll(".cta-tab");
  var panels = document.querySelectorAll(".cta-panel");
  tabs.forEach(function bindTab(tab) {
    if (tab.dataset.tabBound) return;
    tab.dataset.tabBound = "true";
    tab.addEventListener("click", function switchTab() {
      var targetId = tab.getAttribute("aria-controls");
      tabs.forEach(function syncTab(t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function syncPanel(p) {
        var active = p.id === targetId;
        p.classList.toggle("is-active", active);
        if (active) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    });
  });
}

window.initServices = initServices;

document.addEventListener("DOMContentLoaded", function initStudio() {
  initSidebarCollapse();
  initMobileDrawer();
  initDarkMode();
  initSoundToggle();
  initPageClose();
  studioRefreshActiveNav();
  initSessionTracking();
  markReadPosts();
  initFeedFilters();
  initToc();
  initShareLinks();
  initSidebarSlot();
  initFeed();
  initNextRead();
  initServices();

  // Re-init after Barba navigations
  document.addEventListener("studio:after-nav", function onAfterNav() {
    markReadPosts();
    initFeed();
    initNextRead();
    initServices();
  });
});
