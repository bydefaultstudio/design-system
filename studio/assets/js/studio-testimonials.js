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
 * window.resolveLogoSvg().
 *
 * Cleanup: destroyTestimonialSliders() must run before re-mount on Barba
 * navigation. It disconnects the IntersectionObserver, kills GSAP tweens
 * on cached words, reverts SplitText, and destroys the Splide instance.
 */

console.log("Studio Testimonials v0.1.0");

//
//------- Testimonial data -------//
//

var TESTIMONIALS = [
  {
    quote: "Their work led to a 10% YoY increase in site traffic, driving improved commercial growth and stronger audience engagement.",
    attribution: "Creative Director, Country & Townhouse",
    brand: "country-and-townhouse",
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
    li.innerHTML =
      '<div class="testimonial-card">' +
        '<div class="testimonial-mark" data-logo="' + t.brand + '"></div>' +
        '<p class="testimonial-quote">' + window.attrEscape(t.quote) + '</p>' +
        '<div class="testimonial-attribution label">' + window.attrEscape(t.attribution) + '</div>' +
      '</div>';
    list.appendChild(li);

    // Inject the brand SVG into the mark via the shared optical-sizing helper.
    // The mark itself is intentionally unstyled in CSS — the user writes
    // their own .testimonial-mark / .testimonial-mark > svg rules and may
    // use the --logo-w / --logo-h variables for optical sizing.
    var mark = li.querySelector(".testimonial-mark");
    var info = typeof window.resolveLogoSvg === "function"
      ? window.resolveLogoSvg(t.brand, 5)
      : null;
    if (info) {
      mark.style.setProperty("--logo-w", info.w + "rem");
      mark.style.setProperty("--logo-h", info.h + "rem");
      mark.innerHTML = info.svg;
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
    gsap.set(words, { opacity: 0.2 });
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
      gsap.set(activeEntry.words, { opacity: 0.2 });
      gsap.to(activeEntry.words, {
        opacity: 1,
        duration: 2.2,
        ease: "power2.out",
        stagger: 0.1,
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
    if (current <= 0.25) return;
    gsap.killTweensOf(entry.words);
    gsap.to(entry.words, {
      opacity: 0.2,
      duration: 0.4,
      ease: "power2.out",
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
        autoWidth: true,
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
        // autoWidth disables Splide's auto-clone calculation. Force enough
        // clones (n × 1.5) so the loop seam never produces a visible gap
        // when 2-3 slides are visible at once on wide viewports.
        clones: 6,
        breakpoints: {
          // Gap-only tightening for narrow tablets — separate from the
          // 768px studio mobile/desktop layout flip.
          600: { gap: "1.5rem" },
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
