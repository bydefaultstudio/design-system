/**
 * Script Purpose: Studio site entry — preferences, tracking, services, logo slider, orchestrator
 * Author: By Default
 * Created: 2026-04-11
 * Version: 0.7.0
 * Last Updated: 2026-04-23
 */

console.log("Studio v0.7.0");

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
