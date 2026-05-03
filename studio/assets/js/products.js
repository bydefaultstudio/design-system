/**
 * Script Purpose: Products page — sticky-scroll image swap and 3-step quiz.
 * Author: By Default
 * Created: 2026-05-02
 * Version: 0.1.0
 * Last Updated: 2026-05-02
 *
 * Features:
 *   1. Sticky-scroll IntersectionObserver — swaps the right-column image as
 *      each .product-section crosses viewport centre.
 *   2. Quiz state machine — three steps with deterministic recommendation
 *      logic; renders two recommended-card elements after step 3.
 *
 * Bootstrap:
 *   Self-registers on DOMContentLoaded and on the studio:after-nav event
 *   dispatched by studio-barba.js. No edits to shared scripts.
 */

console.log("Script - Products v0.1.0");


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


// ------ Quiz recommendation logic ------ //
// Q3 answer is the product name itself, so it maps directly to primary.
// Secondary is derived from outcome (Q1) first, then audience (Q2), then a
// final fallback table.

function recommendProducts(answers) {
  var outcome  = answers[0]; // sales | story | data | awareness
  var audience = answers[1]; // existing | new | partners | event
  var useCase  = answers[2]; // SHOP | PERSONALISE | STORYTELL | INFORM | MAP

  var productData = {
    SHOP:        { name: "SHOP",        reason: "A shoppable scroll guides your audience from first impression to purchase intent." },
    PERSONALISE: { name: "PERSONALISE", reason: "Choice-led journeys adapt to what each visitor actually wants — fast." },
    STORYTELL:   { name: "STORYTELL",   reason: "Deep-scroll experiences earn attention without demanding it." },
    INFORM:      { name: "INFORM",      reason: "Interactive surveys turn audience curiosity into structured insight." },
    MAP:         { name: "MAP",         reason: "Place-led experiences let audiences explore your brand through real destinations." }
  };

  var primary = useCase;
  var secondary = null;

  var outcomeMap = { sales: "SHOP", story: "STORYTELL", data: "INFORM", awareness: "STORYTELL" };
  var outcomeSecondary = outcomeMap[outcome];
  if (outcomeSecondary && outcomeSecondary !== primary) secondary = outcomeSecondary;

  if (!secondary) {
    var audienceMap = { existing: "SHOP", new: "PERSONALISE", partners: "INFORM", event: "MAP" };
    var audienceSecondary = audienceMap[audience];
    if (audienceSecondary && audienceSecondary !== primary) secondary = audienceSecondary;
  }

  if (!secondary) {
    var fallbacks = { SHOP: "PERSONALISE", PERSONALISE: "SHOP", STORYTELL: "INFORM", INFORM: "STORYTELL", MAP: "STORYTELL" };
    secondary = fallbacks[primary];
  }

  return [productData[primary], productData[secondary]];
}


// ------ Quiz rendering helpers ------ //

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

function syncNavButtons(card, stepNumber, answers) {
  var prev = card.querySelector("#quizPrev");
  var next = card.querySelector("#quizNext");
  if (!prev || !next) return;

  prev.disabled = stepNumber === 1;
  next.disabled = !answers[stepNumber - 1];

  // Update the leading text node only — leave the trailing .svg-icn intact.
  var label = stepNumber === 3 ? "See result " : "Next ";
  if (next.firstChild && next.firstChild.nodeType === Node.TEXT_NODE) {
    next.firstChild.textContent = label;
  }
}

function renderQuizResult(answers, card) {
  if (answers.length < 3 || answers.some(function isMissing(a) { return !a; })) return;
  var products = recommendProducts(answers);
  var resultProducts = card.querySelector("#quizResultProducts");
  if (!resultProducts) return;

  resultProducts.innerHTML = "";
  products.forEach(function renderCard(product) {
    var el = document.createElement("div");
    el.className = "recommended-card";
    var name = document.createElement("span");
    name.className = "name";
    name.textContent = product.name;
    var reason = document.createElement("p");
    reason.className = "reason";
    reason.textContent = product.reason;
    el.appendChild(name);
    el.appendChild(reason);
    resultProducts.appendChild(el);
  });
}

function setSelectedOption(step, answer) {
  var options = step.querySelectorAll(".quiz-option");
  options.forEach(function syncOption(option) {
    var match = option.dataset.answer === answer;
    option.classList.toggle("is-selected", match);
    option.setAttribute("aria-checked", match ? "true" : "false");
    option.tabIndex = match ? 0 : -1;
  });
}

function clearSelections(card) {
  var options = card.querySelectorAll(".quiz-option");
  options.forEach(function clearOption(option) {
    option.classList.remove("is-selected");
    option.setAttribute("aria-checked", "false");
    option.tabIndex = -1;
  });
}

// Roving tabindex — one option per step is reachable via Tab. Selected wins;
// otherwise the first. Required by the role="radiogroup" / role="radio" contract.
function syncRovingTabindex(step) {
  var options = step.querySelectorAll(".quiz-option");
  if (!options.length) return;
  var selected = step.querySelector('.quiz-option[aria-checked="true"]');
  var focusable = selected || options[0];
  options.forEach(function setTabIndex(option) {
    option.tabIndex = option === focusable ? 0 : -1;
  });
}

function focusStepEntry(step) {
  var focusable = step.querySelector('.quiz-option[aria-checked="true"]')
    || step.querySelector(".quiz-option");
  if (focusable) focusable.focus();
}


// ------ Quiz init ------ //

function initQuiz(scope) {
  var card = scope.querySelector("#quizCard");
  if (!card) return;
  if (card.dataset.initialised === "true") return;
  card.dataset.initialised = "true";

  var answers = [];
  var currentStep = 1;

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
      syncRovingTabindex(step);
      focusStepEntry(step);
    }
  }

  function setState(state) {
    card.dataset.state = state;
    var nav = card.querySelector(".quiz-nav");
    var result = card.querySelector("#quizResult");
    if (nav) nav.hidden = state !== "quiz";
    if (result) result.hidden = state !== "result";
  }

  function startQuiz() {
    if (card.dataset.state !== "idle") return;
    setState("quiz");
    goToStep(1);
  }

  function resetQuiz() {
    answers.length = 0;
    currentStep = 1;
    clearSelections(card);
    showStep(card, 0); // hides all steps (no step has data-step="0")
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
      if (currentStep < 3) {
        goToStep(currentStep + 1);
      } else {
        renderQuizResult(answers, card);
        setState("result");
        var contactCta = card.querySelector(".quiz-result-actions .button");
        if (contactCta) contactCta.focus();
      }
      return;
    }

    var option = e.target.closest(".quiz-option");
    if (option && card.contains(option)) {
      var step = option.closest(".quiz-step");
      if (!step) return;
      var stepNumber = parseInt(step.dataset.step, 10);
      answers[stepNumber - 1] = option.dataset.answer;
      setSelectedOption(step, option.dataset.answer);
      syncNavButtons(card, stepNumber, answers);
    }
  });

  // Roving tabindex + arrow-key navigation inside a radiogroup.
  card.addEventListener("keydown", function handleQuizKeydown(e) {
    var option = e.target.closest(".quiz-option");
    if (!option) return;
    var step = option.closest(".quiz-step");
    if (!step || step.hidden) return;

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
    answers[stepNumber - 1] = target.dataset.answer;
    setSelectedOption(step, target.dataset.answer);
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
