/**
 * Case Study Page Scripts
 * Version: 0.4.0
 * Purpose: Toggle, sticky info panel, fixed button for case study pages
 */

// studio-case-study v0.4.0

// ------ Module state ------ //

var caseStudyToggleBound = false;
var csResizeObserver = null;
var csIntersectionObserver = null;
var csTransitionTimeout = null;
var CS_TRANSITION_MS = 800;
var CS_TRANSITION_FALLBACK_MS = CS_TRANSITION_MS + 100;

// SVG icon markup (shared between header toggle and fixed toggle)
var CS_ICON_ADD = '<div class="svg-icn cs-toggle-icon cs-toggle-icon-add" data-icon="add"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 15C11 13.8954 10.1046 13 9 13H4V11H9C10.1046 11 11 10.1046 11 9V4H13V9C13 10.1046 13.8954 11 15 11H20V13H15C13.8954 13 13 13.8954 13 15V20H11V15Z" fill="currentColor"/></svg></div>';
var CS_ICON_CLOSE = '<div class="svg-icn cs-toggle-icon cs-toggle-icon-close" data-icon="close"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>';


// ------ Toggle ------ //

function initCaseStudyToggle() {
  if (caseStudyToggleBound) return;
  caseStudyToggleBound = true;

  document.addEventListener("click", function handleCsToggle(e) {
    var btn = e.target.closest("[data-cs-toggle]");
    if (!btn) return;
    var cs = document.querySelector("[data-cs]");
    if (!cs) return;
    var isOpening = !cs.classList.contains("is-info-open");
    cs.classList.toggle("is-info-open");
    document.body.classList.toggle("is-cs-open", isOpening);

    if (isOpening) {
      var content = cs.querySelector(".cs-content");
      var body = cs.querySelector(".cs-body");

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
      var inner = cs.querySelector(".cs-content-inner");
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
  var inner = document.querySelector(".cs-page.is-info-open .cs-content-inner");
  if (!inner) return;

  var csBody = inner.closest(".cs-body");
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

  var inner = document.querySelector(".cs-page.is-info-open .cs-content-inner");
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
  var wrap = document.getElementById("cs-toggle-wrap");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.id = "cs-toggle-wrap";
  wrap.className = "cs-toggle-wrap";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "button cs-toggle";
  btn.setAttribute("data-cs-toggle", "");
  btn.setAttribute("aria-label", "Toggle project information");
  btn.innerHTML =
    '<span class="cs-toggle-label">Project information</span>' +
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

  var headerToggle = document.querySelector(".cs-header .cs-toggle");
  var wrap = ensureFixedToggleWrap();

  if (!headerToggle) {
    // Not a case study page — hide the wrap
    wrap.classList.remove("is-visible");
    wrap.classList.remove("is-hidden");
    return;
  }

  // Show the wrap (starts hidden via is-hidden until scroll triggers)
  wrap.classList.add("is-visible");
  wrap.classList.add("is-hidden");

  csIntersectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        wrap.classList.add("is-hidden");
      } else {
        wrap.classList.remove("is-hidden");
      }
    });
  }, { threshold: 0 });

  csIntersectionObserver.observe(headerToggle);
}


// ------ Init + Cleanup ------ //

function cleanupCaseStudy() {
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
  document.body.classList.remove("is-cs-open");
}

function initCaseStudy() {
  cleanupCaseStudy();
  initCaseStudyToggle();
  initCaseStudyFixedToggle();
}

window.initCaseStudy = initCaseStudy;
window.cleanupCaseStudy = cleanupCaseStudy;

document.addEventListener("DOMContentLoaded", function () {
  initCaseStudy();
});
