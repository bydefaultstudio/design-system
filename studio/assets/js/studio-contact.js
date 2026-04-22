/**
 * Script Purpose: Contact form — chips, validation, submission, abandonment, inactivity nudge, UTM
 * Author: By Default
 * Created: 2026-04-12
 * Version: 0.1.0
 */

console.log("Studio Contact v0.1.0");

(function studioContact() {

  // Flip to true when debugging; ships as false so the form is quiet in prod.
  // console.warn / console.error are left unconditional — real problems.
  var DEBUG = false;
  var log = DEBUG ? console.log.bind(console) : function noop() {};

  // -- Configuration --

  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXTR61Qbsk5F4Mx1L0bT27xxO6SSTxYmj2lM9KRFUwDvUs9nfgAFIO76Eiut5r8StG/exec";
  var SUBMIT_LABEL = "Send message";
  var SUBMIT_LOADING_LABEL = "Sending\u2026";
  var SUBMIT_SENT_LABEL = "Sent";
  var CHECK_SVG = '<div class="svg-icn"><svg data-icon="check" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"></path></svg></div>';

  // -- State --

  var formState = {
    touched: false,
    submitted: false,
    fields: { name: false, email: false, message: false },
    formEnteredAt: null
  };


  // -- Selectors --

  function getWrapper() { return document.querySelector("[data-contact-wrapper]"); }
  function getForm() { return document.querySelector('[data-studio-form="contact"]'); }
  function getSuccessEl() { return document.querySelector(".contact-success"); }
  function getSubmitBtn() { return document.querySelector("[data-contact-submit]"); }

  //
  //------- Chip Toggle Logic -------//
  //

  // Chip clicks use document-level delegation so they work after Barba swaps
  var chipsListenerBound = false;

  function initChips() {
    if (chipsListenerBound) return;
    chipsListenerBound = true;

    document.addEventListener("click", function handleChipClick(e) {
      var chip = e.target.closest(".contact-chips .button[data-chip-value]");
      if (!chip) return;

      var group = chip.closest("[role='radiogroup'], [role='group']");
      if (!group) return;

      var isRadio = group.getAttribute("role") === "radiogroup";

      if (isRadio) {
        // Single-select: deselect all others
        group.querySelectorAll(".button[data-chip-value]").forEach(function deselect(c) {
          c.classList.remove("is-selected");
          c.setAttribute("aria-checked", "false");
        });
        chip.classList.add("is-selected");
        chip.setAttribute("aria-checked", "true");
      } else {
        // Multi-select: toggle
        var pressed = chip.getAttribute("aria-pressed") === "true";
        chip.classList.toggle("is-selected", !pressed);
        chip.setAttribute("aria-pressed", String(!pressed));
      }

      markTouched();
    });
  }

  // Read selected chip values from a group
  function getChipValues(form, role) {
    var group = form.querySelector("[role='" + role + "']");
    if (!group) return role === "radiogroup" ? "" : "";
    var attr = role === "radiogroup" ? "aria-checked" : "aria-pressed";
    var selected = [];
    group.querySelectorAll(".button[data-chip-value]").forEach(function check(c) {
      if (c.getAttribute(attr) === "true") {
        selected.push(c.getAttribute("data-chip-value"));
      }
    });
    return selected.join(", ");
  }

  //
  //------- Form State Tracking -------//
  //

  function markTouched() {
    if (!formState.touched) {
      formState.touched = true;
      formState.formEnteredAt = Date.now();
      log("[studio-contact] form touched");
    }
  }

  function initStateTracking(form) {
    if (!form) return;

    var nameInput = form.querySelector("#contact-name");
    var emailInput = form.querySelector("#contact-email");
    var messageInput = form.querySelector("#contact-message");

    function trackField(input, key) {
      if (!input) return;
      input.addEventListener("input", function onInput() {
        formState.fields[key] = input.value.trim().length > 0;
        markTouched();
        clearFieldError(input);
      });
    }

    trackField(nameInput, "name");
    trackField(emailInput, "email");
    trackField(messageInput, "message");
  }

  //
  //------- Validation -------//
  //

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var NAME_MIN_LENGTH = 2;

  function validateName(input) {
    if (!input) return true;
    var val = input.value.trim();
    if (!val) {
      showFieldError(input, "contact-name-error", "Please enter your name so we know who we\u2019re talking to.");
      return false;
    }
    if (val.length < NAME_MIN_LENGTH) {
      showFieldError(input, "contact-name-error", "Your name needs to be at least " + NAME_MIN_LENGTH + " characters.");
      return false;
    }
    clearFieldError(input);
    return true;
  }

  function validateEmail(input) {
    if (!input) return true;
    var val = input.value.trim();
    var tick = document.querySelector(".contact-email-tick");

    if (!val) {
      showFieldError(input, "contact-email-error", "Please enter your email address so we can get back to you.");
      if (tick) tick.hidden = true;
      return false;
    }
    if (!EMAIL_RE.test(val)) {
      showFieldError(input, "contact-email-error", "That doesn\u2019t look like a valid email address. Please check and try again.");
      if (tick) tick.hidden = true;
      return false;
    }

    clearFieldError(input);
    if (tick) tick.hidden = false;
    return true;
  }

  function showFieldError(input, errorId, message) {
    input.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorId);
    var errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearFieldError(input) {
    input.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    // Find the sibling error span
    var field = input.closest(".contact-field");
    if (field) {
      var errorEl = field.querySelector(".form-error");
      if (errorEl) errorEl.hidden = true;
    }
  }

  function initBlurValidation(form) {
    if (!form) return;

    var nameInput = form.querySelector("#contact-name");
    var emailInput = form.querySelector("#contact-email");

    if (nameInput) {
      nameInput.addEventListener("blur", function onNameBlur() {
        if (formState.fields.name || nameInput.value.trim()) validateName(nameInput);
      });
    }

    if (emailInput) {
      emailInput.addEventListener("blur", function onEmailBlur() {
        if (formState.fields.email || emailInput.value.trim()) validateEmail(emailInput);
      });
    }
  }

  function validateAll(form) {
    var nameInput = form.querySelector("#contact-name");
    var emailInput = form.querySelector("#contact-email");

    var nameOk = validateName(nameInput);
    var emailOk = validateEmail(emailInput);

    if (!nameOk && nameInput) { nameInput.focus(); return false; }
    if (!emailOk && emailInput) { emailInput.focus(); return false; }

    return true;
  }

  //
  //------- Submission -------//
  //

  function buildPayload(form) {
    var name = (form.querySelector("#contact-name") || {}).value || "";
    var email = (form.querySelector("#contact-email") || {}).value || "";
    var message = (form.querySelector("#contact-message") || {}).value || "";
    var services = getChipValues(form, "group");
    var budget = getChipValues(form, "radiogroup");
    var source = sessionStorage.getItem("contact_source") || "direct";

    var timeOnForm = formState.formEnteredAt
      ? Math.round((Date.now() - formState.formEnteredAt) / 1000)
      : 0;

    return {
      name: name.trim(),
      email: email.trim(),
      services: services,
      budget: budget,
      message: message.trim(),
      meta: {
        source: source,
        medium: sessionStorage.getItem("contact_medium") || "",
        campaign: sessionStorage.getItem("contact_campaign") || "",
        referrer: sessionStorage.getItem("sessionReferrer") || "",
        landingPage: sessionStorage.getItem("landingPage") || "",
        pagesViewed: JSON.parse(sessionStorage.getItem("pagesViewed") || "[]"),
        timeOnForm: timeOnForm,
        viewport: window.innerWidth + "x" + window.innerHeight
      }
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;

    // Honeypot check — if filled, fake success
    var honeypot = form.querySelector("#website");
    if (honeypot && honeypot.value) {
      showSuccess(form);
      return;
    }

    if (!validateAll(form)) {
      console.warn("[studio-contact] validation failed — form not submitted");
      return;
    }

    var btn = getSubmitBtn();
    var errorCallout = form.querySelector(".contact-error-callout");

    // Enter loading state
    if (btn) {
      btn.disabled = true;
      btn.textContent = SUBMIT_LOADING_LABEL;
    }
    if (errorCallout) errorCallout.hidden = true;

    var payload = buildPayload(form);
    log("[studio-contact] submitting form:", payload);

    // If no backend URL yet, log and show success (development mode)
    if (!APPS_SCRIPT_URL) {
      log("[studio-contact] no backend URL — skipping fetch, showing success");
      showSuccess(form);
      return;
    }

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function onSuccess() {
      log("[studio-contact] form submitted successfully");
      showSuccess(form);
    }).catch(function onError(err) {
      console.error("[studio-contact] submission failed:", err);
      // Re-enable button
      if (btn) {
        btn.disabled = false;
        btn.textContent = SUBMIT_LABEL;
      }
      // Show error callout
      if (errorCallout) errorCallout.hidden = false;
    });
  }

  function showSuccess(form) {
    formState.submitted = true;
    log("[studio-contact] showing success state");

    var wrapper = getWrapper();
    var successEl = getSuccessEl();
    if (!wrapper || !successEl) return;

    // Personalise the success message
    var nameVal = (form.querySelector("#contact-name") || {}).value || "";
    var bodyEl = successEl.querySelector("[data-contact-success-body]");
    if (bodyEl && nameVal.trim()) {
      bodyEl.textContent = "Thanks, " + nameVal.trim() + ". We\u2019ll read this properly and come back to you within one business day.";
    }

    // Show "Sent ✓" on the button
    var btn = getSubmitBtn();
    if (btn) {
      btn.innerHTML = CHECK_SVG + SUBMIT_SENT_LABEL;
      btn.disabled = true;
    }

    // Switch to success state immediately — the wrapper class hides form, shows success
    wrapper.classList.add("is-submitted");
    log("[studio-contact] wrapper switched to success state");

    // Build recommendations based on selected services
    renderRecommendations(form);
  }

  //
  //------- Post-Submit Recommendations -------//
  //

  // Map service selections to keywords for scoring feed items
  var SERVICE_KEYWORDS = {
    "Interactive Advertising": ["advertising", "campaign", "ad", "media", "display"],
    "Interactive Content": ["content", "editorial", "article", "website", "redesign"],
    "Interactive Activations": ["activation", "campaign", "experience", "event", "identity"]
  };

  function renderRecommendations(form) {
    var container = document.querySelector("[data-contact-recommendations]");
    if (!container) return;

    var services = getChipValues(form, "group");
    var selectedServices = services ? services.split(", ") : [];

    // Collect keywords from selected services
    var keywords = [];
    selectedServices.forEach(function (svc) {
      if (SERVICE_KEYWORDS[svc]) {
        keywords = keywords.concat(SERVICE_KEYWORDS[svc]);
      }
    });

    // Find feed items from the home page (Barba caches the L0 container)
    var feedItems = document.querySelectorAll(".post-item");
    if (!feedItems.length) {
      // Try Barba's cached containers
      var allContainers = document.querySelectorAll('[data-barba="container"]');
      allContainers.forEach(function (c) {
        if (!feedItems.length || feedItems.length === 0) {
          var items = c.querySelectorAll(".post-item");
          if (items.length) feedItems = items;
        }
      });
    }

    if (!feedItems.length) {
      log("[studio-contact] no feed items in DOM — pulling fallback from manifest");
      renderManifestFallback(container);
      return;
    }

    // Score each feed item
    var scored = [];
    feedItems.forEach(function (item) {
      var link = item.querySelector("a.post");
      if (!link) return;

      var title = (item.querySelector(".post-title") || {}).textContent || "";
      var excerpt = (item.querySelector(".post-excerpt") || {}).textContent || "";
      var readTime = (item.querySelector(".post-read-time") || {}).textContent || "";
      var href = link.getAttribute("href") || "";
      var titleLower = title.toLowerCase();
      var excerptLower = excerpt.toLowerCase();

      var score = 0;
      keywords.forEach(function (kw) {
        if (titleLower.indexOf(kw) !== -1) score += 2;
        if (excerptLower.indexOf(kw) !== -1) score += 1;
      });

      scored.push({
        title: title,
        excerpt: excerpt,
        readTime: readTime,
        href: href,
        score: score
      });
    });

    // Sort by score descending, then take top 3
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, 3);

    log("[studio-contact] recommendations:", top.map(function (r) { return r.title + " (" + r.score + ")"; }));
    renderCards(container, top);
  }

  function renderManifestFallback(container) {
    var loader = window.loadStudioContent;
    if (typeof loader !== "function") {
      renderEvergreenFallback(container);
      return;
    }
    loader().then(function (data) {
      var articles = (data && data.articles) || [];
      var cases = (data && data.caseStudies) || [];
      if (!articles.length && !cases.length) {
        renderEvergreenFallback(container);
        return;
      }
      var prefix = (typeof window.getStudioPrefix === "function") ? window.getStudioPrefix() : "";
      var picks = [];
      var topArticle = articles[0];
      if (topArticle) {
        picks.push({
          eyebrow: "Read our latest article",
          title: topArticle.title,
          excerpt: topArticle.synopsis || "",
          readTime: topArticle.readTime || "",
          href: prefix + topArticle.url
        });
      }
      var topCase = cases[0];
      if (topCase) {
        picks.push({
          eyebrow: "Explore our latest project",
          title: topCase.title,
          excerpt: topCase.synopsis || "",
          readTime: "",
          href: prefix + topCase.url
        });
      }
      renderCards(container, picks);
    }).catch(function () {
      renderEvergreenFallback(container);
    });
  }

  function renderEvergreenFallback(container) {
    renderCards(container, [{
      eyebrow: "More from By Default",
      title: "See our latest writing",
      excerpt: "",
      readTime: "",
      href: "/index.html#articles"
    }]);
  }

  function renderCards(container, items) {
    items.forEach(function (rec) {
      var card = document.createElement("a");
      card.href = rec.href;
      card.className = "contact-rec-card";

      if (rec.eyebrow) {
        var eyebrowEl = document.createElement("span");
        eyebrowEl.className = "contact-rec-eyebrow";
        eyebrowEl.textContent = rec.eyebrow;
        card.appendChild(eyebrowEl);
      }

      var titleEl = document.createElement("span");
      titleEl.className = "contact-rec-title";
      titleEl.textContent = rec.title;
      card.appendChild(titleEl);

      if (rec.excerpt) {
        var excerptEl = document.createElement("span");
        excerptEl.className = "contact-rec-excerpt";
        excerptEl.textContent = rec.excerpt;
        card.appendChild(excerptEl);
      }

      if (rec.readTime) {
        var metaEl = document.createElement("span");
        metaEl.className = "contact-rec-meta";
        metaEl.innerHTML = '<div class="svg-icn"><svg data-icon="clock" aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M15.3 16.7L16.7 15.3L13 11.6V7H11V12.4L15.3 16.7ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2167 20 16.1042 19.2208 17.6625 17.6625C19.2208 16.1042 20 14.2167 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 14.2167 4.77917 16.1042 6.3375 17.6625C7.89583 19.2208 9.78333 20 12 20Z" fill="currentColor"></path></svg></div>' + rec.readTime;
        card.appendChild(metaEl);
      }

      container.appendChild(card);
    });
  }

  //
  //------- UTM Detection -------//
  //

  function initUTM() {
    var params = new URLSearchParams(window.location.search);
    var source = params.get("utm_source") || sessionStorage.getItem("contact_source") || "direct";
    var medium = params.get("utm_medium") || sessionStorage.getItem("contact_medium") || "";
    var campaign = params.get("utm_campaign") || sessionStorage.getItem("contact_campaign") || "";

    sessionStorage.setItem("contact_source", source);
    if (medium) sessionStorage.setItem("contact_medium", medium);
    if (campaign) sessionStorage.setItem("contact_campaign", campaign);

    // LinkedIn copy variant
    if (source.indexOf("linkedin") !== -1) {
      var signal = document.querySelector("[data-contact-speed-signal]");
      if (signal) {
        signal.innerHTML = "You\u2019re in the right place. Takes 60 seconds \u2014 we reply within one business day."
          + '<br><span class="text-faded" style="font-size:var(--font-s)">We work with marketing leads and founders at growth-stage companies.</span>';
      }
    }
  }

  //
  //------- Initialization -------//
  //

  function init() {
    var form = getForm();
    if (!form) {
      log("[studio-contact] no contact form found on this page");
      return;
    }

    // Don't re-init if already submitted this session
    var wrapper = getWrapper();
    if (wrapper && wrapper.classList.contains("is-submitted")) {
      log("[studio-contact] form already submitted — skipping init");
      return;
    }

    log("[studio-contact] initialising contact form");

    // Reset state for fresh form
    formState = {
      touched: false,
      submitted: false,
      fields: { name: false, email: false, message: false },
      formEnteredAt: null
    };

    initChips();
    log("[studio-contact] ✓ chips ready");

    initUTM();
    var source = sessionStorage.getItem("contact_source") || "direct";
    log("[studio-contact] ✓ UTM ready (source: " + source + ")");

    // Guard against duplicate listeners on the same form element
    if (form.dataset.contactBound) {
      log("[studio-contact] form already bound — skipping listener setup");
      return;
    }
    form.dataset.contactBound = "true";

    initStateTracking(form);
    log("[studio-contact] ✓ state tracking ready");

    initBlurValidation(form);
    log("[studio-contact] ✓ validation ready");

    form.addEventListener("submit", handleSubmit);
    log("[studio-contact] ✓ submit handler ready");

    log("[studio-contact] ✓ backend: " + (APPS_SCRIPT_URL ? APPS_SCRIPT_URL.substring(0, 50) + "..." : "none (dev mode)"));
    log("[studio-contact] ✓ form fully initialised");

    // Hash-based preview states for styling
    applyHashState(form);
  }

  //
  //------- Hash Preview States -------//
  //
  // Append a hash to the URL to jump to a specific state for styling:
  //
  //   contact.html#success     — post-submit success state
  //   contact.html#error       — form with validation errors shown
  //   contact.html#network     — form with network error callout
  //   contact.html#selected    — chips with selections pre-filled
  //   contact.html#sending     — submit button in loading state
  //

  function applyHashState(form) {
    var hash = location.hash.replace("#", "");
    if (!hash) return;

    var btn = getSubmitBtn();

    switch (hash) {

      case "success":
        var w = getWrapper();
        if (w) w.classList.add("is-submitted");
        renderRecommendations(form);
        break;

      case "error":
        var nameInput = form.querySelector("#contact-name");
        var emailInput = form.querySelector("#contact-email");
        if (nameInput) showFieldError(nameInput, "contact-name-error", "We need your name to know who we\u2019re talking to.");
        if (emailInput) showFieldError(emailInput, "contact-email-error", "That doesn\u2019t look quite right \u2014 check the email address.");
        break;

      case "network":
        var callout = form.querySelector(".contact-error-callout");
        if (callout) callout.hidden = false;
        break;

      case "selected":
        // Pre-select some chips for visual testing
        var serviceChips = form.querySelectorAll('[role="group"] .button[data-chip-value]');
        if (serviceChips[0]) { serviceChips[0].classList.add("is-selected"); serviceChips[0].setAttribute("aria-pressed", "true"); }
        if (serviceChips[2]) { serviceChips[2].classList.add("is-selected"); serviceChips[2].setAttribute("aria-pressed", "true"); }
        var budgetChips = form.querySelectorAll('[role="radiogroup"] .button[data-chip-value]');
        if (budgetChips[1]) { budgetChips[1].classList.add("is-selected"); budgetChips[1].setAttribute("aria-checked", "true"); }
        break;

      case "sending":
        if (btn) {
          btn.disabled = true;
          btn.textContent = SUBMIT_LOADING_LABEL;
        }
        break;
    }
  }

  // Init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-init after Barba navigations to the contact page
  document.addEventListener("studio:after-nav", function onAfterNav() {
    var container = document.querySelector('[data-barba-namespace="contact"]');
    if (container) init();
  });

})();
