/**
 * Script Purpose: Testimonials carousel for the home page —
 *   Splide v4 slider with center focus, autoplay, free drag with snap,
 *   plus a per-slide word-fade animation driven by GSAP SplitText.
 * Author: By Default
 * Created: 2026-04-27
 * Version: 0.1.0
 *
 * Data: TESTIMONIALS array below. Each entry has a `brand` field that
 * matches a `name` in studio-logos.js LOGOS — the testimonial mark
 * (circular black avatar) is rendered from that shared SVG sprite via
 * window.renderLogoSpriteMarkup() with the "avatar" variant. Brands
 * that define an `avatar` block in LOGOS get a dedicated avatar
 * artwork; brands without one fall back to their default mark.
 *
 * Cleanup: destroyTestimonialSliders() must run before re-mount on Barba
 * navigation. It disconnects the IntersectionObserver, kills GSAP tweens
 * on cached words, reverts SplitText, and destroys the Splide instance.
 */

console.log("Studio Testimonials v0.1.0");

//
//------- Tuning -------//
//
// Word-by-word reveal feel. Lower baseline = words "appear" rather than
// brighten. Stagger pacing matches comfortable reading (~5 words/sec).
// QUOTE_REST_MS is the read-time the user gets after the animation
// completes, before the carousel auto-advances — so total slide hold
// scales with quote length: animation + REST.

var WORD_FADE_DURATION_MS = 500;
var WORD_STAGGER_MS = 220;
var QUOTE_BASELINE_OPACITY = 0.2;
var WORD_EASE = "power2.out";
var QUOTE_REST_MS = 4500;

//
//------- Testimonial data -------//
//

var TESTIMONIALS = [
  {
    quote: "Their work led to a 10% YoY increase in site traffic, driving improved commercial growth and stronger audience engagement.",
    attribution: "Creative Director, Country & Townhouse",
    brand: "country-and-town-house",
  },
  {
    quote: "They shaped who we are today and 100% the best investment we've made.",
    attribution: "Design Director, REVOLT",
    brand: "revolt",
  },
  {
    quote: "Thank you so much for such great professionalism, super fast turnarounds, absolutely beautiful work.",
    attribution: "CMO, Paramount, BET TV",
    brand: "bet",
  },
  {
    quote: "Explosive revenue growth, new product development, increased customer retention! Experience working together: magical.",
    attribution: "VP EMEA, HYPEBEAST",
    brand: "hypebeast",
  },
];

//
//------- Module state -------//
//

// SplitText instances cached per quote element. WeakMap so entries
// auto-collect when the quote DOM is removed by Splide on re-mount.
var splitInstanceCache = new WeakMap();

// Live tracking of mounted Splide instances + their IntersectionObservers.
// Both arrays drained by destroyTestimonialSliders().
var testimonialInstances = [];
var testimonialObservers = [];

// Short debounce flag. Splide fires `active` multiple times in rapid
// succession during initial mount (clones:6 + focus:center settles
// through several active states). Without this guard, competing
// animateTestimonialQuote calls race through GSAP's stagger/overwrite
// system and leave word[0] of the active slide stuck at the 0.2 baseline.
var isTransitioning = false;

//
//------- Helpers -------//
//

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

//
//------- Slide construction -------//
//

function buildTestimonialSlides(slider) {
  var list = slider.querySelector(".splide__list");
  if (!list || !TESTIMONIALS.length) return;
  list.innerHTML = "";
  TESTIMONIALS.forEach(function buildOne(t) {
    var li = document.createElement("li");
    li.className = "splide__slide testimonial-slide";
    // Per-slide hold = word-reveal animation duration + read-time rest.
    // Splide reads data-splide-interval per slide (overrides global
    // interval). Set before mount so clones inherit the attribute.
    var wordCount = t.quote.trim().split(/\s+/).length;
    var animationMs = (wordCount - 1) * WORD_STAGGER_MS + WORD_FADE_DURATION_MS;
    li.setAttribute("data-splide-interval", animationMs + QUOTE_REST_MS);
    li.innerHTML =
      '<div class="testimonial-mark" data-logo="' + t.brand + '"></div>' +
      '<div class="testimonial-card">' +
        '<p class="testimonial-quote">' + window.attrEscape(t.quote) + '</p>' +
        '<div class="testimonial-attribution label">' + window.attrEscape(t.attribution) + '</div>' +
      '</div>';
    list.appendChild(li);

    // Inject the brand SVG into the mark via the canonical helper.
    // .testimonial-mark is the circular badge (60px, overflow:hidden);
    // the .svg-logo wrapper inside carries inline aspect-ratio +
    // equal-area dimensions for optical sizing within the badge.
    var mark = li.querySelector(".testimonial-mark");
    var dims = typeof window.getLogoSpriteDimensions === "function"
      ? window.getLogoSpriteDimensions(t.brand, 5, { variant: "avatar" })
      : null;
    var markup = typeof window.renderLogoSpriteMarkup === "function"
      ? window.renderLogoSpriteMarkup(t.brand, {
          variant: "avatar",
          className: "testimonial-logo-mark",
        })
      : null;
    if (mark && markup && dims) {
      mark.innerHTML = markup;
      var inner = mark.firstElementChild;
      inner.style.width = dims.w + "rem";
      inner.style.height = dims.h + "rem";
    }
  });
}

//
//------- Word split + animation -------//
//

function initTestimonialSplit(slider) {
  var quotes = slider.querySelectorAll(".testimonial-quote");
  quotes.forEach(function splitOne(quote) {
    // Defensive: skip elements bd-animations.js already handles. Prevents
    // double-split if a future dev adds `data-text-animate` to a quote.
    if (quote.hasAttribute("data-text-animate")) return;
    if (splitInstanceCache.has(quote)) return;
    var split = new SplitText(quote, { type: "words", tag: "span" });
    // SplitText can emit empty/whitespace-only spans at the start of a
    // quote when the rendered DOM has any leading text node before the
    // first visible word. An invisible word[0] sitting at 0.2 makes the
    // first VISIBLE word look like it never animates. Filter to only
    // spans with non-empty text.
    var words = split.words.filter(function (w) {
      return w.textContent.trim().length > 0;
    });
    splitInstanceCache.set(quote, { split: split, words: words });
    // Reveal the parent <p> (CSS keeps it at opacity 0 for FOUC), then
    // dim the words to baseline. Per-word opacity is animated independently.
    gsap.set(quote, { opacity: 1 });
    gsap.set(words, { opacity: QUOTE_BASELINE_OPACITY });
  });
}

function animateTestimonialQuote(activeSlide, slider) {
  // Reduced-motion: render every word at full opacity, no animation.
  if (reducedMotion()) {
    slider.querySelectorAll(".testimonial-quote").forEach(function (quote) {
      var entry = splitInstanceCache.get(quote);
      if (entry) gsap.set(entry.words, { opacity: 1 });
    });
    return;
  }

  // Block rapid duplicate calls. Even with the clone filter on the active
  // event, edge cases (loop transitions, drag-snap settle) can fire two
  // active events within a few ms; this guard keeps the staggered ripple
  // from racing with itself.
  if (isTransitioning) return;
  isTransitioning = true;
  setTimeout(function () { isTransitioning = false; }, 100);

  // Active slide: kill any in-flight word tweens, hard-reset every word
  // to the 0.2 baseline so the stagger ramp-up starts from a known state,
  // then ripple to 1. The explicit gsap.set is critical — without it,
  // word[0] can be left mid-cross-fade by a previous call's overwrite
  // and never reaches 1. This three-step pattern (kill → set → to)
  // mirrors the original Webflow implementation that shipped without
  // the first-word-stuck bug.
  var activeQuote = activeSlide && activeSlide.querySelector(".testimonial-quote");
  if (activeQuote) {
    var activeEntry = splitInstanceCache.get(activeQuote);
    if (activeEntry) {
      gsap.killTweensOf(activeEntry.words);
      gsap.set(activeEntry.words, { opacity: QUOTE_BASELINE_OPACITY });
      gsap.to(activeEntry.words, {
        opacity: 1,
        duration: WORD_FADE_DURATION_MS / 1000,
        ease: WORD_EASE,
        stagger: WORD_STAGGER_MS / 1000,
        overwrite: "auto",
      });
    }
  }

  // Inactive slides: only fade words that are still elevated above the
  // baseline. Skipping already-dim slides avoids redundant cross-call
  // tweens that would race with the active stagger and clip its
  // delayed children.
  slider.querySelectorAll(".splide__slide").forEach(function (slide) {
    if (slide === activeSlide) return;
    var quote = slide.querySelector(".testimonial-quote");
    var entry = splitInstanceCache.get(quote);
    if (!entry || !entry.words.length) return;
    var current = gsap.getProperty(entry.words[0], "opacity");
    if (current <= QUOTE_BASELINE_OPACITY * 2) return;
    gsap.killTweensOf(entry.words);
    gsap.to(entry.words, {
      opacity: QUOTE_BASELINE_OPACITY,
      duration: 0.4,
      ease: WORD_EASE,
      overwrite: "auto",
    });
  });
}

//
//------- Pause-when-offscreen + manual pause/play -------//
//

function attachVisibilityPause(slider, instance) {
  var io = new IntersectionObserver(function onIntersect(entries) {
    entries.forEach(function (entry) {
      var Autoplay = instance.Components && instance.Components.Autoplay;
      if (!Autoplay) return;
      if (entry.isIntersecting) {
        // Respect the user's manual pause across scroll-out / scroll-in.
        // If they explicitly paused via the toggle, don't auto-resume.
        var pauseBtn = slider.querySelector(".testimonial-pause");
        if (pauseBtn && pauseBtn.classList.contains("is-paused")) return;
        Autoplay.play();
      } else {
        Autoplay.pause();
      }
    });
  }, { threshold: 0.5 });
  io.observe(slider);
  testimonialObservers.push(io);
}

function attachPauseToggle(slider, instance) {
  var btn = slider.querySelector(".testimonial-pause");
  if (!btn) return;
  var Autoplay = instance.Components && instance.Components.Autoplay;
  if (!Autoplay) return;
  btn.addEventListener("click", function onPauseClick() {
    var nowPaused = !btn.classList.contains("is-paused");
    btn.classList.toggle("is-paused", nowPaused);
    btn.setAttribute("aria-pressed", String(nowPaused));
    if (nowPaused) {
      Autoplay.pause();
      btn.setAttribute("aria-label", "Play testimonial autoplay");
    } else {
      Autoplay.play();
      btn.setAttribute("aria-label", "Pause testimonial autoplay");
    }
  });
}

//
//------- Mount + destroy -------//
//

function mountTestimonialSliders() {
  destroyTestimonialSliders();
  if (!TESTIMONIALS.length) return;
  var sliders = document.querySelectorAll(".testimonial-slider");
  if (!sliders.length) return;

  window.ensureSplide(function onSplideReady() {
    sliders.forEach(function mountOne(slider) {
      buildTestimonialSlides(slider);

      var instance = new Splide(slider, {
        type: "loop",
        // fixedWidth as a percentage scales every slide to a fraction of
        // the Splide track width. The track already accounts for the
        // sidebar (400px on desktop, drawer-hidden below 768px), so the
        // slide grows/shrinks fluidly with the available main content area.
        // Breakpoints bump the percentage on smaller screens where the
        // user usually wants more of the viewport given to the card.
        fixedWidth: "50%",
        focus: "center",
        gap: "2rem",
        drag: "free",
        snap: true,
        autoplay: !reducedMotion(),
        interval: 5000,
        speed: 1500,
        pauseOnHover: false,
        pauseOnFocus: false,
        pagination: false,
        easing: "ease-out",
        trimSpace: false,
        // fixedWidth disables Splide's auto-clone calculation. Force
        // enough clones so the loop seam never produces a visible gap
        // when 2-3 slides are visible at once on wide viewports.
        clones: 6,
        breakpoints: {
          // <=768px viewport: sidebar collapses to a drawer (off-screen),
          // full viewport is available. Bump the percentage so the card
          // gets more breathing room, tighten the gap.
          768: { fixedWidth: "85%", gap: "1.5rem" },
          // <=480px (small phones): nearly full-width card.
          480: { fixedWidth: "92%", gap: "1rem" },
        },
      });

      instance.on("mounted", function onMounted() {
        // SplitText runs after Splide has injected clones, so all 8
        // .testimonial-quote nodes (4 originals + 4 clones via clones:6)
        // get split here.
        initTestimonialSplit(slider);
        // Splide v4 stamps generic aria-labels on adopted arrows during
        // mount — re-apply our descriptive labels.
        var prev = slider.querySelector(".splide__arrow--prev");
        var next = slider.querySelector(".splide__arrow--next");
        if (prev) prev.setAttribute("aria-label", "Previous testimonial");
        if (next) next.setAttribute("aria-label", "Next testimonial");
      });

      // Splide fires `active` once per clone of the active logical slide
      // (verified via diagnostic — testimonial 1 fires 4 events: clone03,
      // slide01, clone07, clone11). Without filtering, an offscreen clone
      // can win the race and the visible centered slide never animates.
      // Skip clones via the stable `splide__slide--clone` class (set at
      // clone-creation time, synchronously available — unlike `is-visible`
      // which Splide applies AFTER the active event fires). Filtering out
      // clones leaves only the original (the visible centered slide).
      instance.on("active", function onActive(Slide) {
        if (!Slide || !Slide.slide) return;
        if (Slide.slide.classList.contains("splide__slide--clone")) return;
        animateTestimonialQuote(Slide.slide, slider);
      });

      instance.mount();
      attachVisibilityPause(slider, instance);
      attachPauseToggle(slider, instance);
      testimonialInstances.push({ instance: instance, slider: slider });
    });
  });
}

function destroyTestimonialSliders() {
  // Disconnect all visibility observers first so they don't fire on
  // detached instances mid-teardown.
  testimonialObservers.forEach(function (io) {
    try { io.disconnect(); } catch (e) {}
  });
  testimonialObservers = [];

  testimonialInstances.forEach(function destroyOne(entry) {
    var slider = entry.slider;
    // Kill GSAP tweens + revert SplitText on every cached quote so the
    // <span> word wrapping is unwound and tween targets aren't orphaned.
    slider.querySelectorAll(".testimonial-quote").forEach(function (quote) {
      var cacheEntry = splitInstanceCache.get(quote);
      if (cacheEntry) {
        gsap.killTweensOf(cacheEntry.words);
        try { cacheEntry.split.revert(); } catch (e) {}
        splitInstanceCache.delete(quote);
      }
    });
    try { entry.instance.destroy(true); } catch (e) {}
  });
  testimonialInstances = [];
}

//
//------- Expose on window -------//
//

window.mountTestimonialSliders = mountTestimonialSliders;
window.destroyTestimonialSliders = destroyTestimonialSliders;
