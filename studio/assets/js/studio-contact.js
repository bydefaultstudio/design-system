/**
 * Script Purpose: Contact form — chips, validation, submission, abandonment, inactivity nudge, UTM
 * Author: By Default
 * Created: 2026-04-12
 * Version: 0.1.0
 */

console.log("Studio Contact v0.1.0");

(function studioContact() {

  // -- Configuration --

  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXTR61Qbsk5F4Mx1L0bT27xxO6SSTxYmj2lM9KRFUwDvUs9nfgAFIO76Eiut5r8StG/exec";
  var SUBMIT_LABEL = "Send message";
  var SUBMIT_LOADING_LABEL = "Sending\u2026";
  var SUBMIT_SENT_LABEL = "Sent";
  var CHECK_SVG = '<div class="svg-icn" data-icon="check"><svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"></path></svg></div>';
  var INACTIVITY_TIMEOUT = 45000; // 45 seconds
  var SESSION_FLAG_KEY = "exit_prompt_shown";

  // -- State --

  var formState = {
    touched: false,
    submitted: false,
    fields: { name: false, email: false, message: false },
    formEnteredAt: null
  };

  var inactivityTimer = null;

  // -- Selectors --

  function getWrapper() { return document.querySelector("[data-contact-wrapper]"); }
  function getForm() { return document.querySelector('[data-studio-form="contact"]'); }
  function getSuccessEl() { return document.querySelector(".contact-success"); }
  function getAbandonDialog() { return document.getElementById("abandon-dialog"); }
  function getBottomSheet() { return document.querySelector(".contact-bottom-sheet"); }
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
      setBeforeUnload(true);
      startInactivityTimer();
      console.log("[studio-contact] form touched — abandonment protection active");
    }
    resetInactivityTimer();
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
    console.log("[studio-contact] submitting form:", payload);

    // If no backend URL yet, log and show success (development mode)
    if (!APPS_SCRIPT_URL) {
      console.log("[studio-contact] no backend URL — skipping fetch, showing success");
      showSuccess(form);
      return;
    }

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function onSuccess() {
      console.log("[studio-contact] form submitted successfully");
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
    setBeforeUnload(false);
    clearInactivityTimer();
    console.log("[studio-contact] showing success state");

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
    console.log("[studio-contact] wrapper switched to success state");
  }

  //
  //------- Abandonment Recovery -------//
  //

  // Stored destination when navigation is blocked
  var pendingDestination = null;

  function shouldBlockNavigation() {
    return formState.touched
      && !formState.submitted
      && !sessionStorage.getItem(SESSION_FLAG_KEY);
  }

  // Called by studio-barba.js via window.studioContactShouldPrevent
  function checkAbandonOnNav(payload) {
    var container = document.querySelector('[data-barba-namespace="contact"]');
    // Only intercept if we're currently on the contact page
    if (!container || !container.closest('[data-barba="container"]')) return false;
    // Check if the contact container is the *current* one (not the incoming one)
    var wrapper = document.querySelector('[data-barba="wrapper"]');
    if (wrapper && wrapper.firstElementChild !== container.closest('[data-barba="container"]')) return false;

    if (!shouldBlockNavigation()) return false;

    // Store destination and show dialog
    pendingDestination = payload.el ? payload.el.getAttribute("href") : null;
    showAbandonDialog();
    return true;
  }

  // Expose for studio-barba.js
  window.studioContactShouldPrevent = checkAbandonOnNav;

  function showAbandonDialog() {
    var dialog = getAbandonDialog();
    if (!dialog) return;

    sessionStorage.setItem(SESSION_FLAG_KEY, "true");
    console.log("[studio-contact] showing abandon dialog");
    dialog.showModal();
  }

  function initAbandonDialog() {
    var dialog = getAbandonDialog();
    if (!dialog) return;

    var backBtn = dialog.querySelector("[data-abandon-back]");
    var closeBtn = dialog.querySelector("[data-abandon-close]");

    if (backBtn) {
      backBtn.addEventListener("click", function onBack() {
        dialog.close();
        // Focus the first empty required field
        var form = getForm();
        if (form) {
          var nameInput = form.querySelector("#contact-name");
          var emailInput = form.querySelector("#contact-email");
          if (nameInput && !nameInput.value.trim()) { nameInput.focus(); return; }
          if (emailInput && !emailInput.value.trim()) { emailInput.focus(); return; }
          nameInput && nameInput.focus();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function onClose() {
        dialog.close();
        formState.touched = false; // prevent re-triggering
        if (pendingDestination && typeof window.barba !== "undefined") {
          window.barba.go(pendingDestination);
        }
        pendingDestination = null;
      });
    }

    // Backdrop click = close (same as "Close" action)
    dialog.addEventListener("click", function onBackdropClick(e) {
      if (e.target === dialog) {
        closeBtn && closeBtn.click();
      }
    });
  }

  //
  //------- beforeunload (browser back / tab close) -------//
  //

  function onBeforeUnload(e) {
    if (shouldBlockNavigation()) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  function setBeforeUnload(active) {
    if (active) {
      window.addEventListener("beforeunload", onBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", onBeforeUnload);
    }
  }

  //
  //------- Mobile Inactivity Nudge -------//
  //

  function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  function startInactivityTimer() {
    if (!isTouchDevice()) return;
    clearInactivityTimer();
    inactivityTimer = setTimeout(showBottomSheet, INACTIVITY_TIMEOUT);
  }

  function resetInactivityTimer() {
    if (!isTouchDevice() || !formState.touched || formState.submitted) return;
    clearInactivityTimer();
    inactivityTimer = setTimeout(showBottomSheet, INACTIVITY_TIMEOUT);
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }

  function showBottomSheet() {
    if (formState.submitted) return;
    if (sessionStorage.getItem(SESSION_FLAG_KEY)) return;

    var sheet = getBottomSheet();
    if (!sheet) return;

    sessionStorage.setItem(SESSION_FLAG_KEY, "true");
    console.log("[studio-contact] showing inactivity bottom sheet");
    sheet.hidden = false;
    sheet.setAttribute("aria-hidden", "false");

    // Trigger slide-in on next frame
    requestAnimationFrame(function () {
      sheet.classList.add("is-visible");
    });
  }

  function dismissBottomSheet() {
    var sheet = getBottomSheet();
    if (!sheet) return;

    sheet.classList.remove("is-visible");
    sheet.classList.add("is-dismissing");

    setTimeout(function hideSheet() {
      sheet.hidden = true;
      sheet.setAttribute("aria-hidden", "true");
      sheet.classList.remove("is-dismissing");
    }, 200);

    // Focus first empty field
    var form = getForm();
    if (form) {
      var nameInput = form.querySelector("#contact-name");
      var emailInput = form.querySelector("#contact-email");
      if (nameInput && !nameInput.value.trim()) { nameInput.focus(); return; }
      if (emailInput && !emailInput.value.trim()) { emailInput.focus(); return; }
    }
  }

  function initBottomSheet() {
    var sheet = getBottomSheet();
    if (!sheet) return;

    var backdrop = sheet.querySelector(".contact-bottom-sheet-backdrop");
    var dismissBtn = sheet.querySelector("[data-sheet-dismiss]");

    if (backdrop) backdrop.addEventListener("click", dismissBottomSheet);
    if (dismissBtn) dismissBtn.addEventListener("click", dismissBottomSheet);

    // Swipe-down to dismiss
    var panel = sheet.querySelector(".contact-bottom-sheet-panel");
    if (panel) {
      var startY = 0;
      panel.addEventListener("touchstart", function onTouchStart(e) {
        startY = e.touches[0].clientY;
      }, { passive: true });

      panel.addEventListener("touchend", function onTouchEnd(e) {
        var endY = e.changedTouches[0].clientY;
        if (endY - startY > 40) dismissBottomSheet();
      }, { passive: true });
    }

    // Reset inactivity timer on interaction
    ["touchstart", "scroll", "keydown"].forEach(function bindReset(event) {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
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
      console.log("[studio-contact] no contact form found on this page");
      return;
    }

    // Don't re-init if already submitted this session
    var wrapper = getWrapper();
    if (wrapper && wrapper.classList.contains("is-submitted")) {
      console.log("[studio-contact] form already submitted — skipping init");
      return;
    }

    console.log("[studio-contact] initialising contact form");

    // Reset state for fresh form
    formState = {
      touched: false,
      submitted: false,
      fields: { name: false, email: false, message: false },
      formEnteredAt: null
    };

    initChips();
    console.log("[studio-contact] ✓ chips ready");

    initAbandonDialog();
    console.log("[studio-contact] ✓ abandon dialog ready");

    initBottomSheet();
    console.log("[studio-contact] ✓ bottom sheet ready");

    initUTM();
    var source = sessionStorage.getItem("contact_source") || "direct";
    console.log("[studio-contact] ✓ UTM ready (source: " + source + ")");

    // Guard against duplicate listeners on the same form element
    if (form.dataset.contactBound) {
      console.log("[studio-contact] form already bound — skipping listener setup");
      return;
    }
    form.dataset.contactBound = "true";

    initStateTracking(form);
    console.log("[studio-contact] ✓ state tracking ready");

    initBlurValidation(form);
    console.log("[studio-contact] ✓ validation ready");

    form.addEventListener("submit", handleSubmit);
    console.log("[studio-contact] ✓ submit handler ready");

    console.log("[studio-contact] ✓ backend: " + (APPS_SCRIPT_URL ? APPS_SCRIPT_URL.substring(0, 50) + "..." : "none (dev mode)"));
    console.log("[studio-contact] ✓ form fully initialised");

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
  //   contact.html#dialog      — abandon dialog open
  //   contact.html#sheet       — mobile bottom sheet visible
  //   contact.html#selected    — chips with selections pre-filled
  //   contact.html#sending     — submit button in loading state
  //

  function applyHashState(form) {
    var hash = location.hash.replace("#", "");
    if (!hash) return;

    var dialog = getAbandonDialog();
    var sheet = getBottomSheet();
    var btn = getSubmitBtn();

    switch (hash) {

      case "success":
        var w = getWrapper();
        if (w) w.classList.add("is-submitted");
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

      case "dialog":
        if (dialog) dialog.showModal();
        break;

      case "sheet":
        if (sheet) {
          sheet.hidden = false;
          sheet.setAttribute("aria-hidden", "false");
          sheet.classList.add("is-visible");
        }
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
