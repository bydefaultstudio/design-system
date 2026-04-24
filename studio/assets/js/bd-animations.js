/**
 * Script Purpose: ByDefault Animations (Studio)
 * Author: Erlen Masson
 * Version: 3.0.0
 * Created: 5 Feb 2025
 * Last Updated: 23 April 2026
 *
 * Refactored for Barba.js integration using gsap.context().
 * All animations are scoped to a container and cleaned up
 * automatically between page transitions via ctx.revert().
 */

(function () {
  "use strict";

  // Guard: bail if GSAP failed to load (prevents cascading script death)
  if (typeof gsap === "undefined") {
    console.warn("bd-animations: GSAP not loaded, skipping init");
    // Force-show all CSS-hidden elements so content isn't invisible
    document.querySelectorAll("[data-bd-animate],[data-bd-enter],[data-text-animate]")
      .forEach(function (el) { el.style.opacity = "1"; });
    return;
  }

  console.log("Script - Animations v3.0.0 (Studio)");

  // Register plugins once — survives ctx.revert()
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ------- Module State ------- //

  var ctx = null;
  var currentContainer = null;
  var resizeListenerAttached = false;
  var activeObserver = null;

  // ------- Configurable Parameters ------- //

  var animationStagger = { chars: 0.05, words: 0.1, lines: 0.15 };

  function getFadeStart() {
    return window.innerWidth < 768 ? "top 100%" : "top 100%";
  }

  function getFadeEnd() {
    return window.innerWidth < 768 ? "top 60%" : "bottom 75%";
  }

  function getFadeEndChars() {
    return window.innerWidth < 768 ? "top 50%" : "bottom 75%";
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ------- Helpers ------- //

  function getScrubValue(element) {
    if (!element.hasAttribute("data-bd-scrub")) return undefined;

    var scrubAttr = element.getAttribute("data-bd-scrub");

    if (!scrubAttr || scrubAttr === "") return true;
    if (scrubAttr.toLowerCase() === "true") return true;

    var numericValue = parseFloat(scrubAttr);
    if (!isNaN(numericValue) && numericValue > 0) {
      return Math.max(numericValue, 0.1);
    }

    return undefined;
  }

  function getDelayValue(element, defaultDelay) {
    if (defaultDelay === undefined) defaultDelay = 0;
    var delayAttr = element.getAttribute("data-bd-delay");
    if (!delayAttr) return defaultDelay;

    var delayValue = parseFloat(delayAttr);
    if (isNaN(delayValue) || delayValue < 0) return defaultDelay;
    return delayValue;
  }

  function isInViewport(element) {
    var rect = element.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    var visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    var visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);

    if (visibleHeight <= 0 || visibleWidth <= 0) return false;

    var elementArea = rect.height * rect.width;
    var visibleArea = visibleHeight * visibleWidth;
    return (visibleArea / elementArea) * 100 >= 2;
  }

  // Helper: create a standard scroll-triggered animation
  // Reduces repetition across the 15+ animation functions
  function createScrollAnimation(sel, fromProps, toProps, self) {
    sel.forEach(function (element) {
      var scrubValue = getScrubValue(element);
      var delayValue = getDelayValue(element);

      gsap.set(element, fromProps);

      var tweenConfig = Object.assign({ duration: 0.8 }, toProps, {
        delay: delayValue,
        scrollTrigger: {
          trigger: element,
          start: getFadeStart(),
          end: getFadeEnd()
        }
      });

      if (scrubValue !== undefined) {
        tweenConfig.scrollTrigger.scrub = scrubValue;
      } else {
        tweenConfig.scrollTrigger.once = true;
      }

      gsap.to(element, tweenConfig);
    });
  }

  //
  // ------- Scroll Reveal Animations ------- //
  //

  function textAnimations(self) {
    // Global reduced-motion guard — all animation functions skip
    if (prefersReducedMotion()) {
      var allAnimated = self.selector("[data-bd-animate], [data-text-animate]");
      allAnimated.forEach(function (el) {
        gsap.set(el, { opacity: 1, clearProps: "transform,filter" });
      });
      return;
    }

    // Base animations (fade/slide)
    baseTextAnimations(self);

    // SplitText animations
    fadeCharacters(self);
    fadeWords(self);
    fadeLines(self);
    fadeRichText(self);
    fadeList(self);

    // Specialized effects
    slideUp(self);
    slideDown(self);
    slideFromLeft(self);
    slideFromRight(self);
    scaleIn(self);
    rotateIn(self);
    expandSpacing(self);
    skewText(self);
    flipText(self);
    fadeInOut(self);
    blurIn(self);
    bounceIn(self);
    shakeText(self);
    flashText(self);
    tiltText(self);
    // Note: neonText removed — uses hardcoded colors, not suitable for studio
    fadeInViewport(self);
  }

  // ------- Base Animations (fade/slide) ------- //

  function baseTextAnimations(self) {
    // Legacy shim: convert data-text-animate="element" to data-bd-animate="fade"
    self.selector("[data-text-animate='element']").forEach(function (element) {
      if (!element.hasAttribute("data-bd-animate")) {
        element.setAttribute("data-bd-animate", "fade");
      }
    });

    var allElements = self.selector("[data-bd-animate]");
    var fadeElements = [];
    var slideElements = [];

    allElements.forEach(function (element) {
      var animateValue = element.getAttribute("data-bd-animate");
      if (!animateValue || animateValue === "fade") {
        fadeElements.push(element);
      } else if (animateValue === "slide") {
        slideElements.push(element);
      }
      // Other values handled by specialized functions
    });

    // Fade elements
    createScrollAnimation(
      fadeElements,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
      self
    );

    // Slide elements
    createScrollAnimation(
      slideElements,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      self
    );
  }

  // ------- In-Viewport (above-fold on load) ------- //

  function fadeInViewport(self) {
    self.selector("[data-bd-animate='in-view'], [data-text-animate='in-view']").forEach(function (el) {
      if (isInViewport(el)) {
        // Already visible — animate immediately (no ScrollTrigger)
        var delay = getDelayValue(el, 0);
        var fromY = parseFloat(el.getAttribute("data-bd-from-y") || "0") || 0;
        var fromX = parseFloat(el.getAttribute("data-bd-from-x") || "0") || 0;
        var fromScale = parseFloat(el.getAttribute("data-bd-from-scale") || "1") || 1;

        gsap.fromTo(
          el,
          { autoAlpha: 0, y: fromY, x: fromX, scale: fromScale, force3D: true },
          { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: 0.8, delay: delay, ease: "power2.out" }
        );
      } else {
        // Out of viewport — create a standard fade ScrollTrigger instead of mutating the attribute
        gsap.set(el, { opacity: 0 });
        gsap.to(el, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: getFadeStart(),
            end: getFadeEnd(),
            once: true
          }
        });
      }
    });
  }

  // ------- SplitText Animations ------- //
  // Context tracks SplitText instances automatically in GSAP 3.12+

  // Helper for SplitText scroll config — handles scrub vs once consistently
  function splitScrollConfig(element, endFn) {
    var scrubValue = getScrubValue(element);
    var config = {
      trigger: element,
      start: getFadeStart(),
      end: endFn()
    };
    if (scrubValue !== undefined) {
      config.scrub = scrubValue;
    } else {
      config.once = true;
    }
    return config;
  }

  function fadeCharacters(self) {
    self.selector("[data-text-animate='chars']").forEach(function (element) {
      var split = new SplitText(element, { type: "chars", tag: "span" });
      gsap.set(split.chars, { opacity: 0 });

      gsap.to(split.chars, {
        opacity: 1,
        ease: "power1.inOut",
        stagger: animationStagger.chars,
        scrollTrigger: splitScrollConfig(element, getFadeEndChars)
      });
    });
  }

  function fadeWords(self) {
    self.selector("[data-text-animate='words']").forEach(function (element) {
      var split = new SplitText(element, { type: "words", tag: "span" });
      gsap.set(split.words, { opacity: 0 });

      gsap.to(split.words, {
        opacity: 1,
        ease: "power1.inOut",
        stagger: animationStagger.words,
        scrollTrigger: splitScrollConfig(element, getFadeEnd)
      });
    });
  }

  function fadeLines(self) {
    self.selector("[data-text-animate='lines']").forEach(function (element) {
      var split = new SplitText(element, { type: "lines" });
      gsap.set(split.lines, { opacity: 0 });

      gsap.to(split.lines, {
        opacity: 1,
        ease: "power1.inOut",
        stagger: animationStagger.lines,
        scrollTrigger: splitScrollConfig(element, getFadeEnd)
      });
    });
  }

  function fadeRichText(self) {
    self.selector("[data-text-animate='rich-text']").forEach(function (richTextElement) {
      var elements = richTextElement.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, span, strong, em, a, ul, ol, li, blockquote, figure"
      );
      if (elements.length === 0) return;

      elements.forEach(function (element) {
        var split = new SplitText(element, { type: "lines", tag: "span" });
        gsap.set(split.lines, { opacity: 0 });

        gsap.to(split.lines, {
          opacity: 1,
          ease: "power1.inOut",
          stagger: animationStagger.lines,
          scrollTrigger: splitScrollConfig(richTextElement, getFadeEnd)
        });
      });
    });
  }

  function fadeList(self) {
    self.selector("[data-text-animate='list']").forEach(function (list) {
      var items = list.querySelectorAll("li");
      if (items.length === 0) return;

      gsap.set(items, { opacity: 0 });
      gsap.to(items, {
        opacity: 1,
        stagger: 0.2,
        ease: "power2.inOut",
        scrollTrigger: splitScrollConfig(list, getFadeEnd)
      });
    });
  }

  // ------- Specialized Scroll Animations ------- //

  function slideUp(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='slide-up']"),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, ease: "power2.out" },
      self
    );
  }

  function slideDown(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='slide-down']"),
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, ease: "power2.out" },
      self
    );
  }

  function slideFromLeft(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='slide-left']"),
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, ease: "power2.out" },
      self
    );
  }

  function slideFromRight(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='slide-right']"),
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, ease: "power2.out" },
      self
    );
  }

  function scaleIn(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='scale-in']"),
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, ease: "power2.out" },
      self
    );
  }

  function rotateIn(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='rotate-in']"),
      { opacity: 0, rotate: -15 },
      { opacity: 1, rotate: 0, ease: "power2.out" },
      self
    );
  }

  function expandSpacing(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='expand-spacing']"),
      { opacity: 0, letterSpacing: "-2px" },
      { opacity: 1, letterSpacing: "normal", ease: "power2.out" },
      self
    );
  }

  function skewText(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='skew']"),
      { opacity: 0, skewX: "15deg" },
      { opacity: 1, skewX: "0deg", ease: "power2.out" },
      self
    );
  }

  function flipText(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='flip']"),
      { opacity: 0, rotateX: -90 },
      { opacity: 1, rotateX: 0, ease: "power2.out" },
      self
    );
  }

  function fadeInOut(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='fade-in-out']"),
      { opacity: 0 },
      { opacity: 1, ease: "power2.inOut" },
      self
    );
  }

  function blurIn(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='blur-in']"),
      { opacity: 0, filter: "blur(10px)" },
      { opacity: 1, filter: "blur(0px)", ease: "power2.out" },
      self
    );
  }

  function bounceIn(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='bounce-in']"),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, ease: "bounce.out" },
      self
    );
  }

  function shakeText(self) {
    self.selector("[data-bd-animate='shake']").forEach(function (element) {
      gsap.set(element, { x: 0 });
      gsap.to(element, {
        x: "+=10",
        repeat: 5,
        yoyo: true,
        ease: "power2.out",
        delay: getDelayValue(element),
        scrollTrigger: {
          trigger: element,
          start: getFadeStart(),
          end: getFadeEnd(),
          scrub: getScrubValue(element)
        }
      });
    });
  }

  // Note: flash and neon use repeat: -1 (infinite). Context.revert() kills them
  // and restores elements to their from-state. Since these elements are always
  // inside the Barba container (removed from DOM on navigation), this is safe.
  function flashText(self) {
    self.selector("[data-bd-animate='flash']").forEach(function (element) {
      gsap.fromTo(
        element,
        { opacity: 0 },
        { opacity: 1, repeat: -1, yoyo: true, duration: 0.5, ease: "power2.out" }
      );
    });
  }

  function tiltText(self) {
    createScrollAnimation(
      self.selector("[data-bd-animate='tilt']"),
      { rotateY: 90, opacity: 0 },
      { rotateY: 0, opacity: 1, duration: 1, ease: "power2.out" },
      self
    );
  }

  //
  // ------- Pin Elements ------- //
  //

  function pinElements(self) {
    var pinnedEls = self.selector("[data-pin]");
    if (!pinnedEls.length) return;

    // Desktop only — matchMedia auto-reverts pins below breakpoint
    ScrollTrigger.matchMedia({
      "(min-width: 992px)": function () {
        pinnedEls.forEach(function (el) {
          var offset = parseFloat(el.getAttribute("data-pin")) || 0;
          var trigger = el.parentElement;

          ScrollTrigger.create({
            trigger: trigger,
            start: "top " + offset + "px",
            end: function () {
              return "+=" + (trigger.offsetHeight - el.offsetHeight);
            },
            pin: el,
            pinSpacing: false,
            invalidateOnRefresh: true
          });
        });
      }
    });
  }

  //
  // ------- Refresh Observer ------- //
  //

  function refreshObserve(self) {
    var targets = self.selector("[data-refresh]");
    if (!targets.length) return;

    var timeout;
    var observer = new ResizeObserver(function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });

    // Store observer so bdAnimationsCleanup can disconnect it
    activeObserver = observer;
  }

  //
  // ------- Resize Handling ------- //
  //

  function debounce(func) {
    var timer;
    return function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, 150);
    };
  }

  function handleResize() {
    if (!ctx || !currentContainer) return;

    // Full reinit: revert context (reverts SplitText + kills ScrollTriggers)
    // then recreate with fresh measurements. Happens in a single frame so
    // no visible flicker — elements are set to initial state immediately.
    window.bdAnimationsInit(currentContainer);
  }

  function addResizeListener() {
    if (resizeListenerAttached) return;
    resizeListenerAttached = true;
    window.addEventListener("resize", debounce(handleResize));
  }

  //
  // ------- Lifecycle API (called by studio-barba.js) ------- //
  //

  /**
   * Initialize all scroll animations scoped to a container.
   * Creates a gsap.context() — all GSAP work inside is auto-tracked.
   */
  window.bdAnimationsInit = function bdAnimationsInit(container) {
    // Clean up any existing context first
    if (ctx) {
      ctx.revert();
      ctx = null;
    }

    currentContainer = container || document.body;

    ctx = gsap.context(function (self) {
      textAnimations(self);
      pinElements(self);
      refreshObserve(self);
    }, currentContainer);
  };

  /**
   * Kill all GSAP animations, ScrollTriggers, SplitText, and pins.
   * Called before Barba leave transition.
   */
  window.bdAnimationsCleanup = function bdAnimationsCleanup() {
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
    if (ctx) {
      ctx.revert();
      ctx = null;
    }
    currentContainer = null;
  };

  /**
   * Animate [data-bd-leave] elements OUT. Returns a timeout-guarded Promise.
   * Called in studioLeave() before the WAAPI page transition.
   */
  window.bdAnimateElementsOut = function bdAnimateElementsOut(container) {
    if (prefersReducedMotion()) return Promise.resolve();

    var elements = container.querySelectorAll("[data-bd-leave]");
    if (!elements.length) return Promise.resolve();

    var tl = gsap.timeline();

    elements.forEach(function (el) {
      var type = el.getAttribute("data-bd-leave");
      var delay = getDelayValue(el);

      switch (type) {
        case "slide-down":
          tl.to(el, { opacity: 0, y: 40, duration: 0.4, ease: "power2.in", delay: delay }, 0);
          break;
        case "slide-up":
          tl.to(el, { opacity: 0, y: -40, duration: 0.4, ease: "power2.in", delay: delay }, 0);
          break;
        case "blur":
          tl.to(el, { opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "power2.in", delay: delay }, 0);
          break;
        case "scale":
          tl.to(el, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in", delay: delay }, 0);
          break;
        case "fade":
        default:
          tl.to(el, { opacity: 0, duration: 0.3, ease: "power2.in", delay: delay }, 0);
          break;
      }
    });

    // Safety: resolve even if timeline is killed (prevents Barba deadlock)
    // Use totalDuration() to account for delays within the timeline
    return Promise.race([
      tl.then(),
      new Promise(function (r) {
        setTimeout(r, tl.totalDuration() * 1000 + 200);
      })
    ]);
  };

  /**
   * Animate [data-bd-enter] elements IN after the page transition.
   * Appended to existing context via ctx.add() for unified cleanup.
   */
  window.bdAnimateElementsIn = function bdAnimateElementsIn(container) {
    if (!ctx || prefersReducedMotion()) return;

    ctx.add(function () {
      var elements = container.querySelectorAll("[data-bd-enter]");
      if (!elements.length) return;

      elements.forEach(function (el) {
        var type = el.getAttribute("data-bd-enter");
        var delay = getDelayValue(el);

        switch (type) {
          case "slide":
          case "slide-up":
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", delay: delay }
            );
            break;
          case "blur-in":
            gsap.fromTo(
              el,
              { autoAlpha: 0, filter: "blur(10px)" },
              { autoAlpha: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out", delay: delay }
            );
            break;
          case "scale":
            gsap.fromTo(
              el,
              { autoAlpha: 0, scale: 0.9 },
              { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out", delay: delay }
            );
            break;
          case "fade":
          default:
            gsap.fromTo(
              el,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: delay }
            );
            break;
        }
      });
    });
  };

  //
  // ------- Initial Load ------- //
  //

  document.fonts.ready
    .then(function () {
      var container = document.querySelector("[data-barba='container']") || document.body;
      window.bdAnimationsInit(container);
      window.bdAnimateElementsIn(container);
      addResizeListener();
    })
    .catch(function () {
      console.error("bd-animations: font loading error, initializing anyway");
      var container = document.querySelector("[data-barba='container']") || document.body;
      window.bdAnimationsInit(container);
      addResizeListener();
    });
})();
