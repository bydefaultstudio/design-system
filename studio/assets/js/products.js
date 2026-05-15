/**
 * Script Purpose: Products page — sticky-scroll image swap and 4-step quiz.
 * Author: By Default
 * Created: 2026-05-02
 * Version: 0.3.0
 * Last Updated: 2026-05-04
 *
 * Features:
 *   1. Sticky-scroll IntersectionObserver — swaps the right-column image as
 *      each .product-section crosses viewport centre.
 *   2. Quiz state machine — four steps (Q1 multi-select; Q2/Q3/Q4 single-select)
 *      with additive product scoring (Q1+Q2), asset advice (Q3), and a
 *      deployment phrase (Q4). Q2 + Q4 each include a "Not sure yet" filler
 *      that contributes nothing. Renders 1-3 recommended-card elements with
 *      thumbnail + name + tagline.
 *
 * Bootstrap:
 *   Exposed via window.initProducts; called from studio.js on DOMContentLoaded
 *   and on the studio:after-nav event dispatched by studio-barba.js.
 */

console.log("Script - Products v0.3.0");


// ------ Module state ------ //

var walkthroughObserver = null;


// ------ Walkthrough (sticky-scroll image swap) ------ //

function initWalkthrough(scope) {
  var sections = scope.querySelectorAll(".product-section");
  var images = scope.querySelectorAll(".walkthrough-image");

  if (!sections.length || !images.length) return;

  // Disconnect any observer left over from a previous Barba navigation.
  if (walkthroughObserver) {
    walkthroughObserver.disconnect();
    walkthroughObserver = null;
  }

  // rootMargin -50% top and -50% bottom defines a 1px-tall band at the
  // viewport centre — sections become "active" as they cross it.
  walkthroughObserver = new IntersectionObserver(
    function handleWalkthroughIntersect(entries) {
      entries.forEach(function checkEntry(entry) {
        if (!entry.isIntersecting) return;
        var product = entry.target.dataset.product;
        if (!product) return;
        images.forEach(function updateImage(img) {
          img.classList.toggle("is-active", img.dataset.image === product);
        });
      });
    },
    {
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0
    }
  );

  sections.forEach(function observeSection(section) {
    walkthroughObserver.observe(section);
  });
}


// ------ Quiz config ------ //
//
// Q1 (multi-select) and Q2 (single-select) score products additively.
// Q3 (single-select) maps to one of three asset-advice sentences.
// Q4 (single-select) maps to one deployment phrase.
// Q2 + Q4 each include "Not sure yet" (data-answer="unsure") as a filler so
// the grid lays out as a clean rectangle. "unsure" contributes nothing —
// no score, no deployment sentence.
//
// Result: 1-3 product cards (filter score > 0, cap at 3, tie-break by
// PRODUCT_PRIORITY), plus a combined advice + deployment paragraph.

var PRODUCT_PRIORITY = ["SHOP", "PERSONALISE", "STORYTELL", "INFORM", "MAP"];

// Display names — keys stay uppercase (scoring/priority lookups); cards render
// the sentence-cased version below.
var PRODUCT_NAMES = {
  SHOP:        "Shop",
  PERSONALISE: "Personalise",
  STORYTELL:   "Storytell",
  INFORM:      "Inform",
  MAP:         "Map"
};

var PRODUCT_TAGLINES = {
  SHOP:        "Product discovery, made immersive.",
  PERSONALISE: "The right experience for every visitor.",
  STORYTELL:   "Made for stories worth finishing.",
  INFORM:      "Make data worth exploring.",
  MAP:         "Tell stories through real places."
};

var Q1_SCORES = {
  buy:       { SHOP: 1 },
  learn:     { STORYTELL: 1, INFORM: 1 },
  customise: { PERSONALISE: 1 },
  explore:   { MAP: 1 }
};

var Q2_SCORES = {
  campaign: { SHOP: 1, PERSONALISE: 1, STORYTELL: 1 },
  guide:    { PERSONALISE: 1, SHOP: 1, MAP: 1 },
  story:    { STORYTELL: 1, INFORM: 1 },
  research: { INFORM: 1, STORYTELL: 1 },
  location: { MAP: 1, PERSONALISE: 1 }
  // "unsure" intentionally absent → no score contribution.
};

var Q3_ADVICE = {
  existing: "We'll work with what you have.",
  new:      "We'll create everything from scratch.",
  mix:      "We'll work with what you have and fill the gaps."
};

var Q4_DEPLOYMENTS = {
  venue: "an in-venue activation",
  app:   "an embed inside your platform",
  site:  "a standalone microsite"
  // "unsure" intentionally absent → no deployment sentence.
};


// ------ Computation ------ //

function computeProductRecommendations(q1Answers, q2Answer) {
  var scores = { SHOP: 0, PERSONALISE: 0, STORYTELL: 0, INFORM: 0, MAP: 0 };

  q1Answers.forEach(function addQ1(answer) {
    var map = Q1_SCORES[answer] || {};
    Object.keys(map).forEach(function bumpQ1(product) { scores[product] += map[product]; });
  });

  if (q2Answer && Q2_SCORES[q2Answer]) {
    var q2Map = Q2_SCORES[q2Answer];
    Object.keys(q2Map).forEach(function bumpQ2(product) { scores[product] += q2Map[product]; });
  }

  return Object.keys(scores)
    .filter(function nonZero(product) { return scores[product] > 0; })
    .sort(function rank(a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      return PRODUCT_PRIORITY.indexOf(a) - PRODUCT_PRIORITY.indexOf(b);
    })
    .slice(0, 3);
}

// Q4 is single-select. Returns "" for missing or "unsure".
function buildDeploymentSentence(q4Answer) {
  if (!q4Answer) return "";
  var phrase = Q4_DEPLOYMENTS[q4Answer];
  if (!phrase) return "";
  return "This lives as " + phrase + ".";
}

function buildAdviceSentence(q3Answer) {
  return Q3_ADVICE[q3Answer] || "";
}


// ------ Quiz DOM helpers ------ //

function setActiveStage(card, stepNumber) {
  var stages = card.querySelectorAll(".quiz-progress .stage");
  stages.forEach(function syncStage(stage) {
    var stageValue = parseInt(stage.dataset.stage, 10);
    stage.classList.toggle("is-active", stageValue <= stepNumber);
  });
}

function showStep(card, stepNumber) {
  var steps = card.querySelectorAll(".quiz-step");
  steps.forEach(function toggleStep(step) {
    step.hidden = parseInt(step.dataset.step, 10) !== stepNumber;
  });
}

function hasAnswer(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value !== "";
}

function syncNavButtons(card, stepNumber, answers) {
  var prev = card.querySelector("#quizPrev");
  var next = card.querySelector("#quizNext");
  if (!prev || !next) return;

  prev.disabled = stepNumber === 1;
  next.disabled = !hasAnswer(answers[stepNumber]);

  // "See result" on the last step; "Next" otherwise. Keep trailing svg-icn intact.
  var label = stepNumber === 4 ? "See result" : "Next";
  if (next.firstChild && next.firstChild.nodeType === Node.TEXT_NODE) {
    next.firstChild.textContent = label + " ";
  }
}

// Single-select: replace selection. Updates aria-checked + .is-selected + tabindex.
function setSingleSelection(step, answer) {
  var options = step.querySelectorAll(".quiz-option");
  options.forEach(function syncOption(option) {
    var match = option.dataset.answer === answer;
    option.classList.toggle("is-selected", match);
    option.setAttribute("aria-checked", match ? "true" : "false");
    option.tabIndex = match ? 0 : -1;
  });
}

// Multi-select: toggle aria-pressed + .is-selected on a single option.
function toggleMultiSelection(option, pressed) {
  option.classList.toggle("is-selected", pressed);
  option.setAttribute("aria-pressed", pressed ? "true" : "false");
}

function clearSelections(card) {
  var options = card.querySelectorAll(".quiz-option");
  options.forEach(function clearOption(option) {
    option.classList.remove("is-selected");
    if (option.hasAttribute("aria-checked")) option.setAttribute("aria-checked", "false");
    if (option.hasAttribute("aria-pressed")) option.setAttribute("aria-pressed", "false");
    option.tabIndex = 0;
  });
}

// Roving tabindex — only used for single-select (radiogroup) steps.
// Multi-select buttons all stay tabIndex 0; users navigate with Tab.
function syncStepTabindex(step) {
  var options = step.querySelectorAll(".quiz-option");
  if (!options.length) return;

  if (step.dataset.select === "single") {
    var selected = step.querySelector('.quiz-option[aria-checked="true"]');
    var focusable = selected || options[0];
    options.forEach(function setTabIndex(option) {
      option.tabIndex = option === focusable ? 0 : -1;
    });
  } else {
    options.forEach(function setTabIndex(option) { option.tabIndex = 0; });
  }
}

function focusStepEntry(step) {
  var focusable;
  if (step.dataset.select === "single") {
    focusable = step.querySelector('.quiz-option[aria-checked="true"]')
      || step.querySelector(".quiz-option");
  } else {
    focusable = step.querySelector('.quiz-option[aria-pressed="true"]')
      || step.querySelector(".quiz-option");
  }
  if (focusable) focusable.focus();
}


// ------ Result rendering ------ //

function renderResult(card, answers) {
  var products = computeProductRecommendations(answers[1], answers[2]);
  var resultProducts = card.querySelector("#quizResultProducts");
  var advice = card.querySelector("#quizResultAdvice");
  var deployment = card.querySelector("#quizResultDeployment");

  if (resultProducts) {
    resultProducts.dataset.count = String(Math.max(1, products.length));
    resultProducts.innerHTML = "";
    products.forEach(function renderCard(product) {
      var el = document.createElement("div");
      el.className = "recommended-card";

      var thumb = document.createElement("div");
      thumb.className = "card-thumb";
      thumb.setAttribute("aria-hidden", "true");
      thumb.dataset.product = product;
      var thumbImg = document.createElement("img");
      thumbImg.src = "https://bydefault.design/image/1080x1080";
      thumbImg.alt = "";
      thumb.appendChild(thumbImg);

      var text = document.createElement("div");
      text.className = "card-text";
      var name = document.createElement("span");
      name.className = "name";
      name.textContent = PRODUCT_NAMES[product] || product;
      var tagline = document.createElement("p");
      tagline.className = "tagline";
      tagline.textContent = PRODUCT_TAGLINES[product] || "";
      text.appendChild(name);
      text.appendChild(tagline);

      el.appendChild(thumb);
      el.appendChild(text);
      resultProducts.appendChild(el);
    });
  }

  // Combine advice + deployment into a single paragraph (the advice element).
  // The deployment <p> in the HTML is left blank or removed.
  if (advice) {
    var sentences = [buildAdviceSentence(answers[3]), buildDeploymentSentence(answers[4])]
      .filter(function nonEmpty(s) { return !!s; });
    advice.textContent = sentences.join(" ");
  }
  if (deployment) deployment.textContent = "";
}


// ------ Quiz init ------ //

function initQuiz(scope) {
  var card = scope.querySelector("#quizCard");
  if (!card) return;
  if (card.dataset.initialised === "true") return;
  card.dataset.initialised = "true";

  // Answers keyed by step number. Q1 is an array (multi); Q2/Q3/Q4 are strings (single).
  var answers = { 1: [], 2: "", 3: "", 4: "" };
  var currentStep = 1;
  var TOTAL_STEPS = 4;

  function getStep(stepNumber) {
    return card.querySelector('.quiz-step[data-step="' + stepNumber + '"]');
  }

  function goToStep(stepNumber) {
    currentStep = stepNumber;
    showStep(card, stepNumber);
    setActiveStage(card, stepNumber);
    syncNavButtons(card, stepNumber, answers);
    var step = getStep(stepNumber);
    if (step) {
      syncStepTabindex(step);
      focusStepEntry(step);
    }
  }

  function setState(state) {
    // CSS [data-quiz-pane] rules handle pane visibility based on this attribute.
    card.dataset.state = state;
  }

  function startQuiz() {
    if (card.dataset.state !== "idle") return;
    setState("quiz");
    goToStep(1);
  }

  function resetQuiz() {
    answers[1] = [];
    answers[2] = "";
    answers[3] = "";
    answers[4] = "";
    currentStep = 1;
    clearSelections(card);
    showStep(card, 0); // hides all (no step has data-step="0")
    setActiveStage(card, 0);
    setState("idle");
    var startBtn = card.querySelector("#quizStart");
    if (startBtn) startBtn.focus();
  }

  card.addEventListener("click", function handleQuizClick(e) {
    var start = e.target.closest("#quizStart");
    if (start) { startQuiz(); return; }

    var restart = e.target.closest("#quizRestart");
    if (restart) { resetQuiz(); return; }

    var prev = e.target.closest("#quizPrev");
    if (prev) {
      if (currentStep > 1) goToStep(currentStep - 1);
      return;
    }

    var next = e.target.closest("#quizNext");
    if (next && !next.disabled) {
      if (currentStep < TOTAL_STEPS) {
        goToStep(currentStep + 1);
      } else {
        renderResult(card, answers);
        setState("result");
        var contactCta = card.querySelector(".quiz-result-actions .button");
        if (contactCta) contactCta.focus();
      }
      return;
    }

    var option = e.target.closest(".quiz-option");
    if (!option || !card.contains(option)) return;

    var step = option.closest(".quiz-step");
    if (!step) return;
    var stepNumber = parseInt(step.dataset.step, 10);
    var selectMode = step.dataset.select;
    var answer = option.dataset.answer;

    if (selectMode === "multi") {
      var current = answers[stepNumber];
      var idx = current.indexOf(answer);
      if (idx === -1) {
        current.push(answer);
        toggleMultiSelection(option, true);
      } else {
        current.splice(idx, 1);
        toggleMultiSelection(option, false);
      }
    } else {
      answers[stepNumber] = answer;
      setSingleSelection(step, answer);
    }

    syncNavButtons(card, stepNumber, answers);
  });

  // Arrow-key navigation — only for single-select (radiogroup) steps.
  // Multi-select uses regular Tab + Space/Enter (browser default for buttons).
  card.addEventListener("keydown", function handleQuizKeydown(e) {
    var option = e.target.closest(".quiz-option");
    if (!option) return;
    var step = option.closest(".quiz-step");
    if (!step || step.hidden || step.dataset.select !== "single") return;

    var options = Array.prototype.slice.call(step.querySelectorAll(".quiz-option"));
    var index = options.indexOf(option);
    var nextIndex = -1;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % options.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (index - 1 + options.length) % options.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    var target = options[nextIndex];
    var stepNumber = parseInt(step.dataset.step, 10);
    answers[stepNumber] = target.dataset.answer;
    setSingleSelection(step, target.dataset.answer);
    target.focus();
    syncNavButtons(card, stepNumber, answers);
  });
}


// ------ Page init (entry point) ------ //
// Called by studio.js on DOMContentLoaded and on studio:after-nav.
// Matches the existing per-page-script pattern (initFeed, initServices, etc.).

function initProducts() {
  var wrapper = document.querySelector(".products-wrapper");
  if (!wrapper) return;
  initWalkthrough(wrapper);
  initQuiz(wrapper);
}

window.initProducts = initProducts;
