/**
 * Accordion component
 * Initialises all .accordion containers on the page.
 * Supports single-open and multi-open modes via data-accordion attribute.
 *
 * Usage:
 *   <div class="accordion" data-accordion="single|multi">
 *     <div class="accordion-item">
 *       <button class="accordion-trigger" aria-expanded="false" aria-controls="panel-id">
 *         <span class="accordion-title">Heading</span>
 *         <span class="accordion-icon" aria-hidden="true"></span>
 *       </button>
 *       <div class="accordion-panel" id="panel-id" role="region">
 *         <div class="accordion-panel-inner">Content</div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Modes:
 *   data-accordion="single" — opening one item closes siblings
 *   data-accordion="multi"  — each item toggles independently (default)
 *
 * @version 1.0.0
 */
(function () {
  function initAccordion() {
    document.querySelectorAll(".accordion").forEach(function (accordion) {
      var mode = accordion.getAttribute("data-accordion") || "multi";
      var items = Array.from(accordion.querySelectorAll(":scope > .accordion-item"));

      items.forEach(function (item) {
        var trigger = item.querySelector(".accordion-trigger");
        if (!trigger || trigger.dataset.accordionBound) return;
        trigger.dataset.accordionBound = "true";

        trigger.addEventListener("click", function () {
          var wasOpen = item.classList.contains("is-open");

          if (mode === "single") {
            items.forEach(function (other) {
              other.classList.remove("is-open");
              var t = other.querySelector(".accordion-trigger");
              if (t) t.setAttribute("aria-expanded", "false");
            });
          }

          if (!wasOpen) {
            item.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
          } else {
            item.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
          }
        });
      });
    });
  }

  // Expose globally for Barba re-init
  window.initAccordion = initAccordion;

  // Auto-init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordion);
  } else {
    initAccordion();
  }
})();
