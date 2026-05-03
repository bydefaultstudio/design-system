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
  var CHECK_SVG = '<div class="svg-icn"><svg data-icon="check" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><use href="/assets/images/svg-icons/_sprite.svg#check"/></svg></div>';

  // -- State --

  var formState = {
    touched: false,
    submitted: false,
    fields: { name: false, email: false, type: false, message: false },
    formEnteredAt: null
  };


  // -- Selectors --

  function getWrapper() { return document.querySelector("[data-contact-form-state]"); }
  function getForm() { return document.querySelector('[data-studio-form="contact"]'); }
  function getSuccessEl() { return document.querySelector(".contact-success"); }
  function getSubmitBtn() { return document.querySelector("[data-contact-submit]"); }

  //
  //------- Chip Toggle Logic -------//
  //

  // Chip clicks/keyboard use document-level delegation so they work after Barba swaps.
  // radiogroup chips follow the WAI-ARIA APG radio pattern: roving tabindex,
  // arrow keys to move and select, Home/End to jump, Space/Enter to activate.
  var chipsListenerBound = false;

  function initChips() {
    if (chipsListenerBound) return;
    chipsListenerBound = true;

    document.addEventListener("click", handleChipClick);
    document.addEventListener("keydown", handleChipKeydown);
  }

  function handleChipClick(e) {
    var chip = e.target.closest(".contact-chips .button[data-chip-value]");
    if (!chip) return;
    var group = chip.closest("[role='radiogroup'], [role='group']");
    if (!group) return;
    selectChip(chip, group);
    markTouched();
    clearChipGroupError(group);
  }

  function handleChipKeydown(e) {
    var chip = e.target.closest(".contact-chips .button[data-chip-value]");
    if (!chip) return;
    var group = chip.closest("[role='radiogroup']");
    if (!group) return; // Only radiogroups need keyboard nav; multi-select groups use Tab/Space natively

    var key = e.key;
    var isNavKey = key === "ArrowLeft" || key === "ArrowUp" || key === "ArrowRight" || key === "ArrowDown" || key === "Home" || key === "End";
    var isActionKey = key === " " || key === "Enter";

    if (!isNavKey && !isActionKey) return;
    e.preventDefault();

    if (isActionKey) {
      selectChip(chip, group);
      markTouched();
      clearChipGroupError(group);
      return;
    }

    var chips = Array.prototype.slice.call(group.querySelectorAll(".button[data-chip-value]"));
    var currentIndex = chips.indexOf(chip);
    var nextIndex = currentIndex;

    if (key === "ArrowLeft" || key === "ArrowUp") {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : chips.length - 1;
    } else if (key === "ArrowRight" || key === "ArrowDown") {
      nextIndex = currentIndex < chips.length - 1 ? currentIndex + 1 : 0;
    } else if (key === "Home") {
      nextIndex = 0;
    } else if (key === "End") {
      nextIndex = chips.length - 1;
    }

    if (nextIndex !== currentIndex) {
      selectChip(chips[nextIndex], group);
      chips[nextIndex].focus();
      markTouched();
      clearChipGroupError(group);
    }
  }

  function selectChip(chip, group) {
    var isRadio = group.getAttribute("role") === "radiogroup";

    if (isRadio) {
      // Single-select: deselect all others, update aria-checked + roving tabindex
      group.querySelectorAll(".button[data-chip-value]").forEach(function deselect(c) {
        c.classList.remove("is-selected");
        c.setAttribute("aria-checked", "false");
        c.setAttribute("tabindex", "-1");
      });
      chip.classList.add("is-selected");
      chip.setAttribute("aria-checked", "true");
      chip.setAttribute("tabindex", "0");
      formState.fields.type = true;
    } else {
      // Multi-select: toggle aria-pressed
      var pressed = chip.getAttribute("aria-pressed") === "true";
      chip.classList.toggle("is-selected", !pressed);
      chip.setAttribute("aria-pressed", String(!pressed));
    }
  }

  function clearChipGroupError(group) {
    var errorId = group.getAttribute("aria-describedby");
    if (errorId) {
      var errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.hidden = true;
    }
    group.removeAttribute("aria-invalid");
    group.removeAttribute("aria-describedby");
  }

  // Read selected chip values from a group. Returns the data-chip-value(s) from
  // chips marked aria-checked (radiogroup) or aria-pressed (group). For
  // radiogroup the result is a single value or empty string; for multi-select
  // groups it's a comma-joined list.
  function getChipValues(form, role) {
    var group = form.querySelector("[role='" + role + "']");
    if (!group) return "";
    var attr = role === "radiogroup" ? "aria-checked" : "aria-pressed";
    var selected = [];
    group.querySelectorAll(".button[data-chip-value]").forEach(function check(c) {
      if (c.getAttribute(attr) === "true") {
        selected.push(c.getAttribute("data-chip-value"));
      }
    });
    return selected.join(", ");
  }

  function initRovingTabindex(form) {
    // Each radiogroup needs exactly one tab stop. If a chip is already
    // aria-checked, that's the stop; otherwise the first chip gets it.
    form.querySelectorAll("[role='radiogroup']").forEach(function setupGroup(group) {
      var chips = group.querySelectorAll(".button[data-chip-value]");
      var checkedChip = group.querySelector(".button[aria-checked='true']");
      chips.forEach(function setTabindex(chip, i) {
        if (checkedChip) {
          chip.setAttribute("tabindex", chip === checkedChip ? "0" : "-1");
        } else {
          chip.setAttribute("tabindex", i === 0 ? "0" : "-1");
        }
      });
    });
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

  function validateMessage(input) {
    if (!input) return true;
    var val = input.value.trim();
    if (!val) {
      showFieldError(input, "contact-message-error", "Tell us a sentence or two so we can prepare for the conversation.");
      return false;
    }
    clearFieldError(input);
    return true;
  }

  function validateType(form) {
    var typeValue = getChipValues(form, "radiogroup");
    if (typeValue) {
      var errorEl = document.getElementById("contact-type-error");
      if (errorEl) errorEl.hidden = true;
      var group = form.querySelector("#contact-type-group");
      if (group) {
        group.removeAttribute("aria-invalid");
        group.removeAttribute("aria-describedby");
      }
      return true;
    }
    var group2 = form.querySelector("#contact-type-group");
    var errorEl2 = document.getElementById("contact-type-error");
    if (group2) {
      group2.setAttribute("aria-invalid", "true");
      group2.setAttribute("aria-describedby", "contact-type-error");
    }
    if (errorEl2) {
      errorEl2.textContent = "Pick one so we know how to route this.";
      errorEl2.hidden = false;
    }
    return false;
  }

  function initBlurValidation(form) {
    if (!form) return;

    var nameInput = form.querySelector("#contact-name");
    var emailInput = form.querySelector("#contact-email");
    var messageInput = form.querySelector("#contact-message");

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

    if (messageInput) {
      messageInput.addEventListener("blur", function onMessageBlur() {
        if (formState.fields.message || messageInput.value.trim()) validateMessage(messageInput);
      });
    }
  }

  function validateAll(form) {
    var nameInput = form.querySelector("#contact-name");
    var emailInput = form.querySelector("#contact-email");
    var messageInput = form.querySelector("#contact-message");

    var nameOk = validateName(nameInput);
    var emailOk = validateEmail(emailInput);
    var typeOk = validateType(form);
    var messageOk = validateMessage(messageInput);

    if (!nameOk && nameInput) { nameInput.focus(); return false; }
    if (!emailOk && emailInput) { emailInput.focus(); return false; }
    if (!typeOk) {
      var firstChip = form.querySelector("#contact-type-group .button[data-chip-value]");
      if (firstChip) firstChip.focus();
      return false;
    }
    if (!messageOk && messageInput) { messageInput.focus(); return false; }

    return true;
  }

  //
  //------- Submission -------//
  //

  function buildPayload(form) {
    var name = (form.querySelector("#contact-name") || {}).value || "";
    var email = (form.querySelector("#contact-email") || {}).value || "";
    var message = (form.querySelector("#contact-message") || {}).value || "";
    var type = getChipValues(form, "radiogroup");
    var source = sessionStorage.getItem("contact_source") || "direct";

    var timeOnForm = formState.formEnteredAt
      ? Math.round((Date.now() - formState.formEnteredAt) / 1000)
      : 0;

    var sessionStartedAt = parseInt(sessionStorage.getItem("sessionStartedAt"), 10) || Date.now();
    var totalTimeOnSite = Math.round((Date.now() - sessionStartedAt) / 1000);

    return {
      name: name.trim(),
      email: email.trim(),
      type: type,
      message: message.trim(),
      meta: {
        source: source,
        medium: sessionStorage.getItem("contact_medium") || "",
        campaign: sessionStorage.getItem("contact_campaign") || "",
        referrer: sessionStorage.getItem("sessionReferrer") || "",
        landingPage: sessionStorage.getItem("landingPage") || "",
        pagesViewed: JSON.parse(sessionStorage.getItem("pagesViewed") || "[]"),
        timeOnForm: timeOnForm,
        totalTimeOnSite: totalTimeOnSite,
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

    // Personalise the success title with the user's name
    var nameVal = (form.querySelector("#contact-name") || {}).value || "";
    var titleEl = successEl.querySelector("[data-contact-success-title]");
    if (titleEl && nameVal.trim()) {
      titleEl.textContent = "Thanks " + nameVal.trim() + ".";
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

  // Phase 1 stub: every chip choice shows latest article + latest case study
  // from the manifest. Phase 2 will replace this with chip-driven, tag-filtered
  // recommendations using a `contactPost` field in post frontmatter.
  function renderRecommendations(form) {
    var container = document.querySelector("[data-contact-recommendations]");
    if (!container) return;
    renderManifestFallback(container);
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
      var picks = [];
      if (articles[0]) picks.push(articles[0]);
      if (cases[0]) picks.push(cases[0]);
      renderCards(container, picks);
    }).catch(function () {
      renderEvergreenFallback(container);
    });
  }

  // Manifest unavailable — hide the recommendations section entirely rather
  // than render a sad text-only fallback that doesn't match the editorial layout.
  function renderEvergreenFallback(container) {
    container.style.display = "none";
  }

  // Renders post cards using the editorial layout. Mirrors renderFeedItem +
  // buildThumbnailBlock from studio-feed.js so the recommendations look
  // identical to the home feed (header → body → thumbnail order, video
  // hover-to-play, placeholder fallback, ratio handling).
  function renderCards(container, items) {
    // Clear any previously-rendered cards so double-fires don't stack
    container.querySelectorAll(".post-item").forEach(function clear(el) {
      el.parentNode.removeChild(el);
    });

    var prefix = (typeof window.getStudioPrefix === "function") ? window.getStudioPrefix() : "";
    var formatDate = (typeof window.formatStudioDate === "function") ? window.formatStudioDate : function (iso) { return iso; };
    var attrEsc = (typeof window.attrEscape === "function") ? window.attrEscape : function (s) {
      return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    items.forEach(function (entry) {
      var isArticle = entry.type === "article";
      var label = isArticle ? "Article" : "Case study";
      var excerpt = entry.synopsis ? '<p class="post-excerpt">' + entry.synopsis + '</p>' : "";
      var clientLabel = !isArticle && entry.client ? '<span class="post-client-label label">' + entry.client + '</span>' : "";

      var metaParts = ['<span class="post-meta-item post-date label">' + formatDate(entry.date) + '</span>'];
      if (isArticle && entry.readTime) {
        metaParts.push('<span class="post-meta-item post-read-time label">' + entry.readTime + '</span>');
      }

      // Thumbnail block — mirrors buildThumbnailBlock in studio-feed.js
      var hasVideo = !!entry.thumbnailVideo;
      var src = hasVideo ? entry.thumbnailVideo : (entry.thumbnail || entry.hero);
      var usedPlaceholder = false;
      if (!src) {
        src = "https://bydefault.design/image/400x500?text=" + encodeURIComponent(entry.title || "");
        usedPlaceholder = true;
      }
      var alt = attrEsc(entry.thumbnailAlt || entry.title || "");
      var ratio = entry.thumbnailRatio || (usedPlaceholder ? "4:5" : "");
      var thumbRatioAttr = ratio ? ' data-ratio="' + attrEsc(ratio) + '"' : "";
      var mediaStyle = entry.thumbnailFocus ? ' style="object-position: ' + attrEsc(entry.thumbnailFocus) + ';"' : "";

      var mediaHtml;
      if (hasVideo) {
        var poster = entry.thumbnailVideoPoster || entry.thumbnail || entry.hero || "";
        var posterAttr = poster ? ' poster="' + attrEsc(poster) + '"' : "";
        mediaHtml = '<video class="vdo-thumb" src="' + attrEsc(src) + '"' + posterAttr +
          ' muted playsinline preload="metadata" aria-hidden="true"' + mediaStyle + "></video>";
      } else {
        mediaHtml = '<img class="img-thumb" src="' + attrEsc(src) + '" alt="' + alt + '" loading="lazy"' + mediaStyle + ">";
      }

      var thumbHtml = '<div class="post-thumbnail"' + thumbRatioAttr + ">" + mediaHtml + "</div>";

      var iconCheck = window.ICON_CHECK || "";
      var readBadge = '<div class="post-read-status badge label"><div class="svg-icn">' + iconCheck + '</div>Read</div>';

      var wrap = document.createElement("div");
      wrap.className = "post-item";
      wrap.innerHTML =
        '<a href="' + prefix + entry.url + '" class="post" data-layout="editorial">' +
          '<div class="post-header">' +
            '<span class="post-label label">' + label + '</span>' +
            readBadge +
          '</div>' +
          '<div class="post-body">' +
            '<h3 class="post-title">' + entry.title + '</h3>' +
            excerpt +
            clientLabel +
            '<div class="post-meta bottom-meta">' + metaParts.join("") + '</div>' +
          '</div>' +
          thumbHtml +
        '</a>';

      container.appendChild(wrap);
    });

    // Bind hover-to-play on any <video class="vdo-thumb"> we just rendered,
    // and pick up any "is-read" state from past visits.
    if (typeof window.initThumbHover === "function") window.initThumbHover(container);
    if (typeof window.markReadPosts === "function") window.markReadPosts();
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
      fields: { name: false, email: false, type: false, message: false },
      formEnteredAt: null
    };

    initChips();
    initRovingTabindex(form);
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
        // Auto-fill a test name so the personalised "Thanks {name}." H2 renders
        var nameInput = form.querySelector("#contact-name");
        if (nameInput && !nameInput.value) {
          nameInput.value = "Sarah";
        }
        showSuccess(form);
        break;

      case "error":
        var nameInput = form.querySelector("#contact-name");
        var emailInput = form.querySelector("#contact-email");
        var messageInput = form.querySelector("#contact-message");
        if (nameInput) showFieldError(nameInput, "contact-name-error", "We need your name to know who we\u2019re talking to.");
        if (emailInput) showFieldError(emailInput, "contact-email-error", "That doesn\u2019t look quite right \u2014 check the email address.");
        var typeGroup = form.querySelector("#contact-type-group");
        var typeError = document.getElementById("contact-type-error");
        if (typeGroup) {
          typeGroup.setAttribute("aria-invalid", "true");
          typeGroup.setAttribute("aria-describedby", "contact-type-error");
        }
        if (typeError) {
          typeError.textContent = "Pick one so we know how to route this.";
          typeError.hidden = false;
        }
        if (messageInput) showFieldError(messageInput, "contact-message-error", "Tell us a sentence or two so we can prepare for the conversation.");
        break;

      case "network":
        var callout = form.querySelector(".contact-error-callout");
        if (callout) callout.hidden = false;
        break;

      case "selected":
        // Pre-select the middle chip in the Type radiogroup for visual testing
        var typeChips = form.querySelectorAll("#contact-type-group .button[data-chip-value]");
        typeChips.forEach(function setChip(c, i) {
          var pick = i === 1;
          c.classList.toggle("is-selected", pick);
          c.setAttribute("aria-checked", String(pick));
          c.setAttribute("tabindex", pick ? "0" : "-1");
        });
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
