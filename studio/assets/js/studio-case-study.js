/**
 * Case Study Page Scripts
 * Version: 0.5.0
 * Purpose: Toggle, sticky info panel, fixed button, related work slider
 */

// studio-case-study v0.5.0

// ------ Module state ------ //

var caseStudyToggleBound = false;
var csResizeObserver = null;
var csIntersectionObserver = null;
var csTransitionTimeout = null;
var csSplideInstance = null;
var CS_TRANSITION_MS = 800;
var CS_TRANSITION_FALLBACK_MS = CS_TRANSITION_MS + 100;

// SVG icon markup (shared between header toggle and fixed toggle)
var CS_ICON_ADD = '<div class="svg-icn case-study-toggle-icon case-study-toggle-icon-add"><svg data-icon="add" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 15C11 13.8954 10.1046 13 9 13H4V11H9C10.1046 11 11 10.1046 11 9V4H13V9C13 10.1046 13.8954 11 15 11H20V13H15C13.8954 13 13 13.8954 13 15V20H11V15Z" fill="currentColor"/></svg></div>';
var CS_ICON_CLOSE = '<div class="svg-icn case-study-toggle-icon case-study-toggle-icon-close"><svg data-icon="close" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>';


// ------ Toggle ------ //

function initCaseStudyToggle() {
  if (caseStudyToggleBound) return;
  caseStudyToggleBound = true;

  document.addEventListener("click", function handleCsToggle(e) {
    var btn = e.target.closest("[data-case-study-toggle]");
    if (!btn) return;
    var cs = document.querySelector("[data-case-study]");
    if (!cs) return;
    var isOpening = !cs.classList.contains("is-info-open");
    cs.classList.toggle("is-info-open");
    document.body.classList.toggle("is-case-study-open", isOpening);

    if (isOpening) {
      var content = cs.querySelector(".case-study-content");
      var body = cs.querySelector(".case-study-body");

      function afterTransition() {
        updateCsStickyTop();
        if (body) {
          body.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(function () {
          initCsStickyObserver();
        }, 600);
      }

      if (content) {
        var fired = false;
        content.addEventListener("transitionend", function onEnd(evt) {
          if (evt.target !== content || evt.propertyName !== "width" || fired) return;
          fired = true;
          content.removeEventListener("transitionend", onEnd);
          afterTransition();
        });
        if (csTransitionTimeout) clearTimeout(csTransitionTimeout);
        csTransitionTimeout = setTimeout(function () {
          if (!fired) {
            fired = true;
            afterTransition();
          }
          csTransitionTimeout = null;
        }, CS_TRANSITION_FALLBACK_MS);
      }
    } else {
      if (csTransitionTimeout) {
        clearTimeout(csTransitionTimeout);
        csTransitionTimeout = null;
      }
      var inner = cs.querySelector(".case-study-content-inner");
      if (inner) {
        inner.style.top = "";
        inner.style.position = "";
      }
      if (csResizeObserver) {
        csResizeObserver.disconnect();
        csResizeObserver = null;
      }
    }
  });
}


// ------ Sticky Info Panel ------ //

function updateCsStickyTop() {
  var inner = document.querySelector(".case-study-page.is-info-open .case-study-content-inner");
  if (!inner) return;

  var csBody = inner.closest(".case-study-body");
  if (!csBody) return;

  var isStacked = getComputedStyle(csBody).flexDirection === "column";
  if (isStacked) {
    inner.style.position = "";
    inner.style.top = "";
    return;
  }

  var contentHeight = inner.offsetHeight;
  var viewportHeight = window.innerHeight;
  var topValue;

  if (contentHeight <= viewportHeight) {
    topValue = "0px";
  } else {
    topValue = -(contentHeight - viewportHeight) + "px";
  }

  inner.style.position = "sticky";
  inner.style.top = topValue;
}

function initCsStickyObserver() {
  if (csResizeObserver) {
    csResizeObserver.disconnect();
    csResizeObserver = null;
  }

  var inner = document.querySelector(".case-study-page.is-info-open .case-study-content-inner");
  if (!inner) return;

  csResizeObserver = new ResizeObserver(function () {
    updateCsStickyTop();
  });
  csResizeObserver.observe(inner);
}

var csResizeTimeout = null;
window.addEventListener("resize", function () {
  clearTimeout(csResizeTimeout);
  csResizeTimeout = setTimeout(updateCsStickyTop, 150);
});


// ------ Fixed Toggle Wrap (persistent, outside Barba) ------ //

function ensureFixedToggleWrap() {
  var wrap = document.getElementById("case-study-toggle-wrap");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.id = "case-study-toggle-wrap";
  wrap.className = "case-study-toggle-wrap";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "button case-study-toggle";
  btn.setAttribute("data-case-study-toggle", "");
  btn.setAttribute("aria-label", "Toggle project information");
  btn.innerHTML =
    '<span class="case-study-toggle-label">Project information</span>' +
    CS_ICON_ADD + CS_ICON_CLOSE;

  wrap.appendChild(btn);

  // Insert into .main (outside Barba container, but inside the layout)
  var main = document.querySelector(".main");
  if (main) {
    main.appendChild(wrap);
  }

  return wrap;
}

function initCaseStudyFixedToggle() {
  if (csIntersectionObserver) {
    csIntersectionObserver.disconnect();
    csIntersectionObserver = null;
  }

  var headerToggle = document.querySelector(".case-study-header .case-study-toggle");
  var slider = document.querySelector(".case-study-slider");
  var wrap = ensureFixedToggleWrap();

  if (!headerToggle) {
    wrap.classList.remove("is-visible");
    wrap.classList.remove("is-hidden");
    return;
  }

  wrap.classList.add("is-visible");
  wrap.classList.add("is-hidden");

  // Track both boundaries: header toggle (top) and slider (bottom)
  var headerVisible = true;
  var sliderVisible = false;

  function updateVisibility() {
    if (headerVisible || sliderVisible) {
      wrap.classList.add("is-hidden");
    } else {
      wrap.classList.remove("is-hidden");
    }
  }

  csIntersectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.target === headerToggle) {
        headerVisible = entry.isIntersecting;
      } else if (entry.target === slider) {
        sliderVisible = entry.isIntersecting;
      }
    });
    updateVisibility();
  }, { threshold: 0 });

  csIntersectionObserver.observe(headerToggle);
  if (slider) csIntersectionObserver.observe(slider);
}


// ------ Related Work Slider ------ //

var SPLIDE_JS = "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js";
var SPLIDE_CSS = "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css";

function ensureSplide(callback) {
  if (typeof Splide !== "undefined") return callback();
  // Inject CSS if not already present
  if (!document.querySelector('link[href*="splide"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SPLIDE_CSS;
    document.head.appendChild(link);
  }
  // Inject JS
  var script = document.createElement("script");
  script.src = SPLIDE_JS;
  script.onload = callback;
  document.head.appendChild(script);
}

function initCaseStudySlider() {
  var list = document.querySelector("[data-case-study-slides]");
  if (!list || typeof window.loadStudioContent !== "function") return;

  var barbaContainer = document.querySelector("[data-barba-namespace]");
  var currentSlug = (barbaContainer ? barbaContainer.getAttribute("data-barba-namespace") : "").replace(/^work-/, "");
  var prefix = typeof window.getStudioPrefix === "function" ? window.getStudioPrefix() : "";

  window.loadStudioContent().then(function (data) {
    var studies = (data.caseStudies || []).filter(function (cs) { return cs.slug !== currentSlug; });
    if (!studies.length) return;

    list.innerHTML = studies.map(function (entry) {
      var src = entry.thumbnailVideo || entry.thumbnail || entry.hero || "";
      var alt = (entry.thumbnailAlt || entry.title || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      var media = entry.thumbnailVideo
        ? '<video class="vdo-thumb" src="' + src + '" poster="' + (entry.thumbnailVideoPoster || entry.thumbnail || entry.hero || "").replace(/"/g, "&quot;") + '" muted playsinline preload="metadata" aria-hidden="true"></video>'
        : '<img class="img-thumb" src="' + src + '" alt="' + alt + '" loading="lazy">';

      return '<div class="splide__slide case-study-slide">' +
        '<a href="' + prefix + entry.url + '" class="post" data-post-type="standard">' +
          '<div class="post-thumbnail" data-ratio="16:9">' + media + '</div>' +
          '<div class="post-header"><span class="post-label label">Case study</span></div>' +
          '<div class="post-body">' +
            '<h3 class="post-title">' + entry.title + '</h3>' +
            (entry.synopsis ? '<p class="post-excerpt">' + entry.synopsis + '</p>' : '') +
            (entry.client ? '<div class="post-meta bottom-meta"><span class="post-meta-item post-client label">' + entry.client + '</span></div>' : '') +
          '</div>' +
        '</a>' +
      '</div>';
    }).join("");

    ensureSplide(function () {
      var styles = getComputedStyle(document.documentElement);
      var gap = styles.getPropertyValue("--studio-gap").trim() || "1rem";

      csSplideInstance = new Splide(list.closest(".case-study-splide"), {
        type: "loop",
        perPage: 3,
        perMove: 1,
        gap: gap,
        arrows: true,
        pagination: false,
        speed: 800,
        easing: "ease-out",
        padding: { left: gap, right: gap },
        trimSpace: false,
        breakpoints: {
          991: { perPage: 2, padding: { left: gap, right: gap } },
          600: { perPage: 1, padding: { left: gap, right: gap } }
        }
      }).mount();

      if (typeof window.initThumbHover === "function") window.initThumbHover(list);
    });
  });
}


// ------ Init + Cleanup ------ //

function cleanupCaseStudy() {
  if (csSplideInstance) {
    csSplideInstance.destroy();
    csSplideInstance = null;
  }
  if (csResizeObserver) {
    csResizeObserver.disconnect();
    csResizeObserver = null;
  }
  if (csIntersectionObserver) {
    csIntersectionObserver.disconnect();
    csIntersectionObserver = null;
  }
  if (csTransitionTimeout) {
    clearTimeout(csTransitionTimeout);
    csTransitionTimeout = null;
  }
  if (csResizeTimeout) {
    clearTimeout(csResizeTimeout);
    csResizeTimeout = null;
  }
  document.body.classList.remove("is-case-study-open");
}

function initCaseStudy() {
  cleanupCaseStudy();
  initCaseStudyToggle();
  initCaseStudyFixedToggle();
  initCaseStudySlider();
}

window.initCaseStudy = initCaseStudy;
window.cleanupCaseStudy = cleanupCaseStudy;

document.addEventListener("DOMContentLoaded", function () {
  initCaseStudy();
});
