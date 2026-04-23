/**
 * Script Purpose: Studio site entry — sidebar collapse, mobile drawer, active nav, page tracking, contact form
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.6.0
 * Last Updated: 2026-04-12
 */

console.log("Studio v0.6.0");

//
//------- Page Visit Tracking -------//
//

// Record the current page path in sessionStorage so we know which pages
// the user has seen this session. Called on init + after every Barba nav.
function trackPageView() {
  var path = location.pathname;
  var viewed = JSON.parse(localStorage.getItem("pagesViewed") || "[]");
  if (viewed.indexOf(path) === -1) {
    viewed.push(path);
    localStorage.setItem("pagesViewed", JSON.stringify(viewed));
    console.log("[read-tracking] tracked new page:", path);
  }
  console.log("[read-tracking] all viewed pages:", viewed);
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

    var ICON_CHECK = '<div class="svg-icn"><svg data-icon="check" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"></path></svg></div>';
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

window.initShareLinks = initShareLinks;

//
//------- Next Read -------//
//

// Article list comes from the manifest at runtime — see loadStudioContent().

var ICON_CLOCK = '<div class="svg-icn"><svg data-icon="clock" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"></path></svg></div>';

var ICON_CALENDAR = '<div class="svg-icn"><svg data-icon="calendar" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M11.0184 14V12H13.0184V14H11.0184ZM7.01843 14V12H9.01843V14H7.01843ZM15.0184 14V12H17.0184V14H15.0184ZM11.0184 18V16H13.0184V18H11.0184ZM7.01843 18V16H9.01843V18H7.01843ZM15.0184 18V16H17.0184V18H15.0184ZM3.01843 22V4H5.01843C5.57072 4 6.01843 3.55228 6.01843 3V2H8.01843V3C8.01843 3.55228 8.46615 4 9.01843 4H15.0184C15.5707 4 16.0184 3.55228 16.0184 3V2H18.0184V3C18.0184 3.55228 18.4661 4 19.0184 4H21.0184V22H3.01843ZM5.01843 19C5.01843 19.5523 5.46615 20 6.01843 20H18.0184C18.5707 20 19.0184 19.5523 19.0184 19V11C19.0184 10.4477 18.5707 10 18.0184 10H6.01843C5.46615 10 5.01843 10.4477 5.01843 11V19ZM5.01843 7C5.01843 7.55228 5.46615 8 6.01843 8H18.0184C18.5707 8 19.0184 7.55228 19.0184 7C19.0184 6.44772 18.5707 6 18.0184 6H6.01843C5.46615 6 5.01843 6.44772 5.01843 7Z" fill="currentColor"></path></svg></div>';

function initNextRead() {
  var article = document.querySelector("article.article");
  if (!article) return;
  loadStudioContent().then(function (data) {
    var articles = (data.articles || []).slice().sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });
    if (!articles.length) return;

    // Remove any existing next-read (Barba re-navigation)
    var existingLabel = article.parentNode.querySelector(".next-read");
    if (existingLabel) existingLabel.remove();
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
          '<div class="article-header">' +
            '<div class="article-meta">' +
              (next.readTime ? '<span class="article-meta-item label"><div class="svg-icn"><svg data-icon="clock" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"/></svg></div>' + attrEscape(next.readTime) + '</span>' : '') +
              '<span class="article-meta-item label">' + formatStudioDate(next.date) + '</span>' +
            '</div>' +
            '<h1 class="article-headline">' + next.title + '</h1>' +
            (author.name
              ? '<a class="article-author">' +
                  (author.avatar ? '<img src="' + attrEscape(author.avatar) + '" alt="" class="article-author-avatar" loading="lazy">' : '') +
                  '<span class="article-author-by">by</span> ' + author.name +
                '</a>'
              : '') +
          '</div>' +
        '</div>' +
      '</section>';

    // Insert "Next read" block as a sibling between the two articles
    var nextRead = document.createElement("div");
    nextRead.className = "next-read";
    nextRead.innerHTML = '<div class="next-read-label label">Next read</div>';
    article.parentNode.appendChild(nextRead);

    article.parentNode.appendChild(wrapper);
  });
}

window.initNextRead = initNextRead;

//
//------- Initialize -------//
//

// Services page — two-level accordion + audience-tab CTA. Only binds when
// the services markup is on the page; safe to call on every nav.
function initServices() {
  // Accordion open/close is handled by the shared initAccordion()
  // from assets/js/accordion.js. This function only handles the
  // tab switcher which is services-page-specific.
  if (typeof window.initAccordion === "function") window.initAccordion();

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

// ------- Logo Ticker ------- //

var logoSplideInstances = [];

var SPLIDE_JS_URL = "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js";
var SPLIDE_CSS_URL = "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css";
var SPLIDE_AUTOSCROLL_URL = "https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js";

function destroyLogoSliders() {
  logoSplideInstances.forEach(function destroyInstance(instance) {
    instance.destroy();
  });
  logoSplideInstances = [];
}

function ensureSplideAutoScroll(callback) {
  // Both Splide core and AutoScroll already loaded
  if (typeof Splide !== "undefined" && window.splide && window.splide.Extensions && window.splide.Extensions.AutoScroll) {
    return callback();
  }

  // Inject CSS if not already present
  if (!document.querySelector('link[href*="splide"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SPLIDE_CSS_URL;
    document.head.appendChild(link);
  }

  function loadAutoScroll() {
    if (window.splide && window.splide.Extensions && window.splide.Extensions.AutoScroll) {
      return callback();
    }
    var ext = document.createElement("script");
    ext.src = SPLIDE_AUTOSCROLL_URL;
    ext.onload = callback;
    document.head.appendChild(ext);
  }

  // Load Splide core first, then AutoScroll
  if (typeof Splide === "undefined") {
    var script = document.createElement("script");
    script.src = SPLIDE_JS_URL;
    script.onload = loadAutoScroll;
    document.head.appendChild(script);
  } else {
    loadAutoScroll();
  }
}

function mountLogoSliders() {
  var logoSplides = document.querySelectorAll(".logo-slider");
  for (var i = 0; i < logoSplides.length; i++) {
    // Inject logo SVGs from studio-logos.js before Splide mounts
    if (typeof buildLogoSlides === "function") {
      buildLogoSlides(logoSplides[i]);
    }
    var instance = new Splide(logoSplides[i], {
      type: "loop",
      autoWidth: true,
      arrows: false,
      pagination: false,
      gap: "5rem",
      drag: false,
      autoScroll: {
        autoStart: true,
        speed: 0.3,
        pauseOnHover: false,
      },
      breakpoints: {
        600: {
          gap: "2.5rem",
          autoScroll: { speed: 0.3 },
        },
      },
    }).mount({
      AutoScroll: window.splide.Extensions.AutoScroll,
    });
    logoSplideInstances.push(instance);
  }
}

function logoSlider() {
  destroyLogoSliders();
  var logoSplides = document.querySelectorAll(".logo-slider");
  if (!logoSplides.length) return;
  ensureSplideAutoScroll(mountLogoSliders);
}

window.logoSlider = logoSlider;
window.destroyLogoSliders = destroyLogoSliders;

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
  logoSlider();

  // Re-init after Barba navigations
  document.addEventListener("studio:after-nav", function onAfterNav() {
    markReadPosts();
    initFeed();
    initServices();
    logoSlider();
  });
});
