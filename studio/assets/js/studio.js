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

//
//------- Main Functions -------//
//

// Sidebar collapse (desktop) — persisted in localStorage
function initSidebarCollapse() {
  var STORAGE_KEY = "studio-sidebar-collapsed";
  var toggle = document.querySelector("[data-sidebar-toggle]");

  if (localStorage.getItem(STORAGE_KEY) === "true") {
    document.body.classList.add("is-sidebar-collapsed");
  }

  if (!toggle) return;

  toggle.addEventListener("click", function handleSidebarToggle() {
    var collapsed = document.body.classList.toggle("is-sidebar-collapsed");
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  });
}

// Mobile drawer — slide-in sidebar with backdrop, Escape to close, body scroll lock
function initMobileDrawer() {
  var hamburger = document.querySelector("[data-sidebar-hamburger]");
  var backdrop = document.querySelector("[data-sidebar-backdrop]");

  function openDrawer() {
    document.body.classList.add("is-mobile-nav-open");
  }

  function closeDrawer() {
    document.body.classList.remove("is-mobile-nav-open");
  }

  if (hamburger) {
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

  document.addEventListener("keydown", function handleEscape(e) {
    if (e.key === "Escape") closeDrawer();
  });

  // Close drawer after a Barba navigation finishes
  document.addEventListener("studio:after-nav", closeDrawer);
}

// Compute the relative path from the current page back to studio/index.html.
// Walks location.pathname looking for the "studio" segment and counts how
// many directories deep we are from there.
//
// Examples:
//   /studio/index.html               → "index.html"
//   /studio/work.html                → "index.html"
//   /studio/work/case-study-1.html   → "../index.html"
//   /studio/articles/article-1.html  → "../index.html"
function getHomeRelativePath() {
  var segments = location.pathname.split("/").filter(Boolean);
  var studioIdx = segments.indexOf("studio");
  if (studioIdx === -1) return "index.html";
  // segments after "studio", minus the filename (last segment)
  var depth = segments.length - studioIdx - 2;
  return depth <= 0 ? "index.html" : "../".repeat(depth) + "index.html";
}

// Compute the relative prefix from the current page back to /studio/
// e.g. from /studio/articles/article-1.html → "../"
//      from /studio/index.html → ""
function getStudioPrefix() {
  var segments = location.pathname.split("/").filter(Boolean);
  var studioIdx = segments.indexOf("studio");
  if (studioIdx === -1) return "";
  var depth = segments.length - studioIdx - 2;
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
      var topBarHeight = parseInt(styles.getPropertyValue("--top-bar-height"), 10) || 64;
      var scrollOffset = parseInt(styles.getPropertyValue("--scroll-offset"), 10) || 0;
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - topBarHeight - scrollOffset;
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
      var topBarHeight = parseInt(styles.getPropertyValue("--top-bar-height"), 10) || 64;
      var scrollOffset = parseInt(styles.getPropertyValue("--scroll-offset"), 10) || 0;
      var feedTop = feed.getBoundingClientRect().top + window.scrollY - topBarHeight - scrollOffset;
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
  if (inThisArticle && tocBlock) {
    tocVisibilityObserver = new IntersectionObserver(function handleTocVisibility(entries) {
      entries.forEach(function checkVisibility(entry) {
        tocBlock.classList.toggle("is-visible", !entry.isIntersecting);
      });
    }, { threshold: 0 });
    tocVisibilityObserver.observe(inThisArticle);
  }

  // 4. Scroll spy — highlight active TOC link
  var topBarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--top-bar-height"), 10) || 70;
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

    navigator.clipboard.writeText(window.location.href).then(function onCopy() {
      var original = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function revert() {
        btn.textContent = original;
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
//------- Next Read -------//
//

// Article registry — ordered by date (newest first).
// Each entry: { url, title, image, readTime, date }
// URLs are relative to /studio/ (the prefix is applied at runtime).
var ARTICLE_REGISTRY = [
  {
    url: "articles/article-placeholder-1.html",
    title: "Why design systems fail (and what to do about it)",
    image: "https://bydefault.design/image/1920x1080",
    readTime: "6 min read",
    date: "Mar 28, 2026"
  },
  {
    url: "articles/article-placeholder-2.html",
    title: "The case for slower websites",
    image: "https://bydefault.design/image/1920x1080",
    readTime: "5 min read",
    date: "Mar 5, 2026"
  },
  {
    url: "articles/article-placeholder-3.html",
    title: "Naming things: the hardest problem in design systems",
    image: "https://bydefault.design/image/1920x1080",
    readTime: "7 min read",
    date: "Jan 18, 2026"
  }
];

function initNextRead() {
  var article = document.querySelector("article.article");
  if (!article) return;

  // Remove any existing next-read (Barba re-navigation)
  var existing = article.querySelector(".next-read");
  if (existing) existing.remove();

  // Find the current article in the registry by matching the URL
  var currentPath = location.pathname;
  var currentIndex = -1;
  ARTICLE_REGISTRY.forEach(function findCurrent(entry, i) {
    if (currentPath.indexOf(entry.url.replace(/^.*\//, "")) !== -1) {
      currentIndex = i;
    }
  });

  if (currentIndex === -1) return;

  // Next article wraps around to the first
  var nextIndex = (currentIndex + 1) % ARTICLE_REGISTRY.length;
  var next = ARTICLE_REGISTRY[nextIndex];
  var prefix = getStudioPrefix();

  // Build the next-read card
  var card = document.createElement("a");
  card.className = "next-read";
  card.href = prefix + next.url;
  card.innerHTML =
    '<div class="next-read-bg" style="background-image: url(' + next.image + ')"></div>' +
    '<div class="next-read-overlay"></div>' +
    '<div class="next-read-content">' +
      '<span class="next-read-label">Next read</span>' +
      '<h2 class="next-read-title">' + next.title + '</h2>' +
      '<div class="next-read-meta">' +
        '<span>' + next.readTime + '</span>' +
        '<span>' + next.date + '</span>' +
      '</div>' +
    '</div>';

  article.appendChild(card);
}

window.initNextRead = initNextRead;

//
//------- Initialize -------//
//

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
  initNextRead();

  // Re-init after Barba navigations
  document.addEventListener("studio:after-nav", markReadPosts);
  document.addEventListener("studio:after-nav", initToc);
});
