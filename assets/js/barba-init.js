/**
 * barba-init.js — Page transitions for the BrandOS docs site
 *
 * Built on the same architecture as studio/assets/js/studio-barba.js:
 *
 *   1. Resolver — resolveScenario(fromEl, toEl) → "open" | "close" | "swap" | "fade"
 *      Answers "what's happening?" based on data-level and data-section attributes.
 *
 *   2. Map — TRANSITION_MAP { open: "slide-up", close: "slide-down", ... }
 *      Answers "which animation runs for this scenario?"
 *      Change one line here to globally swap how a scenario looks.
 *
 *   3. Library — TRANSITIONS { "slide-up": { leave(), enter() }, ... }
 *      Named animations using WAAPI. Each receives the scenario's motion token.
 *
 *   4. Motion tokens — MOTION { pageOpen, pageClose, pageSwap, pageFade }
 *      Read once from CSS custom properties. Indexed by scenario name.
 *
 *   5. Scroll compensation — scroll-then-animate
 *      scrollTo(0,0) runs synchronously in leave() BEFORE the animation starts.
 *      The leaving container receives a negative translateY offset so it visually
 *      stays put at the user's prior scroll position. Enter animations start and
 *      end at natural positions (translateY(0)), so WAAPI fill:forwards is benign.
 *
 * Docs-site additions (not in studio):
 *   - Per-page script re-execution (GSAP, Splide, bd-* modules)
 *   - GSAP/ScrollTrigger lifecycle (kill on leave, refresh on enter)
 *   - Auth re-filter (bdRefreshAccessFilter) after each transition
 *   - Head meta updater (title, description, OG tags — full HTML parsing)
 *   - Route prevention (auth pages, tool apps, role-switch redirects)
 *   - Horizontal sibling navigation (slide-left / slide-right)
 *
 * Page hierarchy:
 *   L1 = section index (brand/index.html, design-system/index.html)
 *   L2 = doc pages (brand/logo.html, design-system/button.html)
 *
 * @version 4.0.0
 */
(function () {
  'use strict';

  if (typeof barba === 'undefined') {
    console.warn('[Barba] core not loaded — page transitions disabled');
    return;
  }

  console.log('[Barba] v4.0.0 init');

  // ── Utilities ──

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function readNumberAttr(el, attr) {
    if (!el) return NaN;
    var raw = el.getAttribute(attr);
    if (raw === null || raw === '') return NaN;
    var n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : NaN;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function animate(el, keyframes, options) {
    return new Promise(function (resolve) {
      if (!el || prefersReducedMotion()) {
        resolve();
        return;
      }
      var anim = el.animate(keyframes, options);
      anim.onfinish = resolve;
      anim.oncancel = resolve;
    });
  }

  // ── Routes Barba must NOT intercept ──

  var AUTH_PATH_RE = /\/auth\//;
  var SUPPORT_PATH_RE = /\/support\.html(?:$|[?#])/;

  function shouldPrevent(opts) {
    if (window.__bdRoleSwitchPending) return true;

    var el = opts && opts.el;
    if (el) {
      if (el.hasAttribute && el.hasAttribute('data-barba-prevent')) return true;
      if (el.hasAttribute && el.hasAttribute('download')) return true;
      if (el.target === '_blank') return true;

      var href = el.getAttribute && el.getAttribute('href');
      if (href) {
        if (href.charAt(0) === '#') return true;
        if (href.indexOf('mailto:') === 0) return true;
        if (href.indexOf('tel:') === 0) return true;
      }
    }

    var url = opts && opts.href;
    if (url) {
      if (AUTH_PATH_RE.test(url)) return true;
      if (SUPPORT_PATH_RE.test(url)) return true;
    }

    return false;
  }

  // ── Head meta updater ──

  var META_SELECTORS = [
    'meta[name="description"]',
    'meta[name="theme-color"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:image"]',
    'meta[property="og:url"]',
    'meta[property="og:type"]',
    'meta[name="twitter:card"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image"]',
    'link[rel="canonical"]'
  ];

  function updateHeadMeta(nextHtml) {
    if (!nextHtml) return;
    var doc;
    try {
      doc = new DOMParser().parseFromString(nextHtml, 'text/html');
    } catch (e) {
      return;
    }
    if (!doc || !doc.head) return;

    // Update <title>
    if (doc.title) document.title = doc.title;

    META_SELECTORS.forEach(function (sel) {
      var nextEl = doc.head.querySelector(sel);
      var currentEl = document.head.querySelector(sel);
      if (nextEl && currentEl) {
        for (var i = 0; i < nextEl.attributes.length; i++) {
          var attr = nextEl.attributes[i];
          currentEl.setAttribute(attr.name, attr.value);
        }
      } else if (nextEl && !currentEl) {
        document.head.appendChild(nextEl.cloneNode(true));
      }
    });
  }

  // ── Per-page <script> re-execution ──

  var LIBRARY_PATTERNS = [
    /\/vendor\//,
    /cdn\.jsdelivr\.net/,
    /cdnjs\.cloudflare\.com/,
    /unpkg\.com/,
    /splidejs/,
    /highlight\.js/,
    /\/bd\/bd-animations\.js/,
    /\/bd\/bd-audio\.js/,
    /\/bd\/bd-cursor\.js/
  ];
  var bdLoadedLibSrcs = new Set();

  function isLibraryScript(src) {
    if (!src) return false;
    for (var i = 0; i < LIBRARY_PATTERNS.length; i++) {
      if (LIBRARY_PATTERNS[i].test(src)) return true;
    }
    return false;
  }

  function bdSeedLoadedLibraries() {
    document.querySelectorAll('script[src]').forEach(function (s) {
      if (isLibraryScript(s.src)) bdLoadedLibSrcs.add(s.src);
    });
  }

  function reExecuteContainerScripts(container) {
    if (!container) return;
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function (oldScript) {
      if (oldScript.src && isLibraryScript(oldScript.src)) {
        if (bdLoadedLibSrcs.has(oldScript.src)) return;
        bdLoadedLibSrcs.add(oldScript.src);
      }

      var newScript = document.createElement('script');
      for (var i = 0; i < oldScript.attributes.length; i++) {
        var attr = oldScript.attributes[i];
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.async = false;
      if (!oldScript.src) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // ── GSAP / ScrollTrigger lifecycle ──

  function killGsapInstances() {
    if (window.ScrollTrigger && typeof ScrollTrigger.getAll === 'function') {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    }
    if (window.ScrollSmoother && typeof ScrollSmoother.get === 'function') {
      var smoother = ScrollSmoother.get();
      if (smoother && typeof smoother.kill === 'function') smoother.kill();
    }
  }

  // ── Re-init helpers exposed by other modules ──

  function refreshPageInit(container) {
    try {
      if (typeof window.bdInitHighlight === 'function') window.bdInitHighlight();
      if (typeof window.bdInitTOCActiveState === 'function') window.bdInitTOCActiveState();
      if (typeof window.bdInitTableScroll === 'function') window.bdInitTableScroll();
      if (typeof window.refreshNavActive === 'function') window.refreshNavActive();
      if (typeof window.bdInitCopyButtons === 'function') window.bdInitCopyButtons();
      if (typeof window.bdRefreshAccessFilter === 'function') window.bdRefreshAccessFilter();
      if (typeof window.bdInitFeedback === 'function') window.bdInitFeedback(container);
    } catch (e) {
      console.warn('[Barba] refreshPageInit error:', e);
    }

    reExecuteContainerScripts(container);

    try {
      if (typeof window.bdAnimationsReinit === 'function') window.bdAnimationsReinit();
      if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
      }
    } catch (e) {
      console.warn('[Barba] gsap reinit error:', e);
    }
  }

  // ── Scenario resolver ──
  //
  // Reads data-level and data-section from both containers and returns a
  // semantic scenario name. The hierarchy for docs is:
  //   L1 = section index    (data-level="1")
  //   L2 = doc page         (data-level="2")
  //
  // Scenario rules:
  //   L1 → L2 (same section)    → "open"   (drilling into a doc)
  //   L2 → L1 (same section)    → "close"  (backing out to index)
  //   L2 → L2 (same section)    → "swap"   (sibling navigation)
  //   L2 → L2 (diff section)    → "open"   (cross-book jump)
  //   L1 → L1                   → "swap"   (section-to-section)
  //   anything else / NaN       → "fade"   (fallback)

  function resolveScenario(fromEl, toEl) {
    var fromLevel = readNumberAttr(fromEl, 'data-level');
    var toLevel = readNumberAttr(toEl, 'data-level');

    if (!Number.isFinite(fromLevel) || !Number.isFinite(toLevel)) return 'fade';

    var fromSection = (fromEl.getAttribute('data-section') || '');
    var toSection = (toEl.getAttribute('data-section') || '');
    var sameSection = fromSection === toSection && fromSection !== '';

    // Drilling deeper (index → doc page)
    if (toLevel > fromLevel) return 'open';

    // Backing out (doc page → index)
    if (toLevel < fromLevel) return 'close';

    // Same level — sibling or cross-section
    if (fromLevel === 2 && !sameSection) return 'open';
    if (fromLevel >= 1) return 'swap';

    return 'fade';
  }

  // ── Motion tokens ──
  // Read from CSS custom properties defined in design-system.css.
  // Cached once at init — same approach as studio-barba.js.

  function readToken(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
  }

  function readMotion(scope) {
    return {
      duration: parseInt(readToken('--motion-page-' + scope + '-duration'), 10) || 600,
      easing:   readToken('--motion-page-' + scope + '-easing') || 'ease-in-out'
    };
  }

  var MOTION = {
    pageOpen:  readMotion('open'),
    pageClose: readMotion('close'),
    pageSwap:  readMotion('swap'),
    pageFade:  readMotion('fade')
  };

  // ── Transition map ──
  // Maps each scenario (what's happening) to an animation name (what it looks
  // like). Change one line here to globally swap the visual for a scenario.
  // The animation always receives the *scenario's* motion token, so timing
  // still matches intent even if the visual changes.

  var TRANSITION_MAP = {
    open:  'slide-up',
    close: 'slide-down',
    swap:  'slide-left',
    fade:  'fade'
  };

  // ── Animation library ──
  //
  // Named animations using WAAPI. Each has leave(el, motion, opts) and
  // enter(el, motion, opts). They receive:
  //   el     — the Barba container to animate
  //   motion — { duration, easing } from the scenario's motion token
  //   opts   — { scrollOffset } (leave only — for scroll compensation)
  //
  // Scroll compensation: scrollTo(0,0) runs in leave() BEFORE any animation.
  // The leave container receives translateY(scrollOffset) (a negative value)
  // so it visually stays put. Enter animations use natural positions
  // (translateY(0) at rest), so WAAPI fill:forwards only persists identity
  // transforms — no cleanup issues.

  // How much the index recedes during a page open (stylistic, not a token)
  var INDEX_SCALE_DOWN = 0.96;
  var INDEX_DIM_OPACITY = 0.7;
  var INDEX_TRANSFORM_ORIGIN = '50% 0%';

  var TRANSITIONS = {

    // -- slide-up --
    // Default for "open". New page rises from below; index (the leaving
    // container) scales down slightly and dims — selling the layered depth
    // of the page model.
    'slide-up': {
      leave: function slideUpLeave(el, motion, opts) {
        var offset = (opts && opts.scrollOffset) || 0;
        var startY = offset + 'px';
        el.style.transformOrigin = INDEX_TRANSFORM_ORIGIN;
        return animate(el,
          [
            { transform: 'translateY(' + startY + ') scale(1)',                                opacity: 1 },
            { transform: 'translateY(' + startY + ') scale(' + INDEX_SCALE_DOWN + ')', opacity: INDEX_DIM_OPACITY }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      },
      enter: function slideUpEnter(el, motion) {
        return animate(el,
          [
            { transform: 'translateY(100%)', opacity: 1 },
            { transform: 'translateY(0)',    opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      }
    },

    // -- slide-down --
    // Default for "close". Leaving page falls off the bottom; index (the
    // entering container) scales back up from INDEX_SCALE_DOWN → 1 and
    // brightens — the inverse of slide-up's leaving animation.
    'slide-down': {
      leave: function slideDownLeave(el, motion, opts) {
        var offset = (opts && opts.scrollOffset) || 0;
        var startY = offset + 'px';
        return animate(el,
          [
            { transform: 'translateY(' + startY + ')',                  opacity: 1 },
            { transform: 'translateY(calc(' + startY + ' + 100%))', opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      },
      enter: function slideDownEnter(el, motion) {
        el.style.transformOrigin = INDEX_TRANSFORM_ORIGIN;
        return animate(el,
          [
            { transform: 'scale(' + INDEX_SCALE_DOWN + ')', opacity: INDEX_DIM_OPACITY },
            { transform: 'scale(1)',                         opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      }
    },

    // -- slide-left --
    // Default for "swap". Leaving page exits left while entering page arrives
    // from the right — forward sibling navigation.
    'slide-left': {
      leave: function slideLeftLeave(el, motion, opts) {
        var offset = (opts && opts.scrollOffset) || 0;
        var startY = offset + 'px';
        return animate(el,
          [
            { transform: 'translateY(' + startY + ') translateX(0)',     opacity: 1 },
            { transform: 'translateY(' + startY + ') translateX(-100%)', opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      },
      enter: function slideLeftEnter(el, motion) {
        return animate(el,
          [
            { transform: 'translateX(100%)', opacity: 1 },
            { transform: 'translateX(0)',    opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      }
    },

    // -- slide-right --
    // Reverse of slide-left. Leaving page exits right, entering arrives
    // from the left — backward sibling navigation.
    'slide-right': {
      leave: function slideRightLeave(el, motion, opts) {
        var offset = (opts && opts.scrollOffset) || 0;
        var startY = offset + 'px';
        return animate(el,
          [
            { transform: 'translateY(' + startY + ') translateX(0)',    opacity: 1 },
            { transform: 'translateY(' + startY + ') translateX(100%)', opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      },
      enter: function slideRightEnter(el, motion) {
        return animate(el,
          [
            { transform: 'translateX(-100%)', opacity: 1 },
            { transform: 'translateX(0)',     opacity: 1 }
          ],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      }
    },

    // -- fade --
    // Crossfade fallback for unknown or same-page navigations.
    'fade': {
      leave: function fadeLeave(el, motion) {
        return animate(el,
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      },
      enter: function fadeEnter(el, motion) {
        return animate(el,
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: motion.duration, easing: motion.easing, fill: 'forwards' }
        );
      }
    }
  };

  // ── Runners ──
  // Look up the animation for a scenario and run it. The animation always
  // receives the scenario's motion token, so timing follows intent even if
  // you remap which animation a scenario uses.

  function runLeave(el, scenario, scrollOffset) {
    var animationName = TRANSITION_MAP[scenario] || 'fade';
    var transition = TRANSITIONS[animationName] || TRANSITIONS['fade'];
    var motion = MOTION['page' + capitalize(scenario)] || MOTION.pageFade;
    return transition.leave(el, motion, { scrollOffset: scrollOffset });
  }

  function runEnter(el, scenario) {
    var animationName = TRANSITION_MAP[scenario] || 'fade';
    var transition = TRANSITIONS[animationName] || TRANSITIONS['fade'];
    var motion = MOTION['page' + capitalize(scenario)] || MOTION.pageFade;
    return transition.enter(el, motion, {});
  }

  // ── Barba transition ──

  var bdTransition = {
    name: 'bd-directional',
    sync: true,
    leave: function bdLeave(data) {
      var scenario = resolveScenario(data.current.container, data.next.container);

      // Mark scenario + role on both containers for CSS z-index rules
      data.current.container.setAttribute('data-bd-scenario', scenario);
      data.current.container.setAttribute('data-bd-role', 'leave');
      data.next.container.setAttribute('data-bd-scenario', scenario);
      data.next.container.setAttribute('data-bd-role', 'enter');

      // Scroll compensation: capture scroll FIRST, then add is-animating.
      // is-animating triggers position:absolute on containers (collapsing
      // the grid row), so scrollY must be read before the class is added.
      // This differs from the studio site because the docs wrapper lives
      // inside a .docs-layout grid — collapsing it clamps scroll to 0.
      var scrollY = window.scrollY || 0;
      document.body.classList.add('is-animating');
      if (scrollY > 0) {
        window.scrollTo(0, 0);
      }
      var scrollOffset = -scrollY;

      return runLeave(data.current.container, scenario, scrollOffset);
    },
    enter: function bdEnter(data) {
      var scenario = data.next.container.getAttribute('data-bd-scenario') || 'fade';
      return runEnter(data.next.container, scenario);
    }
  };

  // ── Init ──

  function init() {
    bdSeedLoadedLibraries();

    barba.init({
      transitions: [bdTransition],
      prevent: shouldPrevent,
      prefetchIgnore: true,
      cacheIgnore: false,
      debug: false
    });

    barba.hooks.beforeLeave(function () {
      killGsapInstances();
    });

    barba.hooks.afterEnter(function (data) {
      updateHeadMeta(data.next.html);
      refreshPageInit(data.next.container);

      // Verify the user has access to the destination page.
      // On full page loads checkAuth() handles this, but Barba bypasses it.
      var pageAccess = data.next.container.getAttribute('data-access')
                    || document.body.getAttribute('data-access');
      if (typeof window.bdCheckPageAccess === 'function') {
        window.bdCheckPageAccess(pageAccess);
      }
    });

    barba.hooks.after(function (data) {
      document.body.classList.remove('is-animating');

      // Clean up role/scenario attributes + inline styles left by animations
      if (data && data.next && data.next.container) {
        data.next.container.removeAttribute('data-bd-role');
        data.next.container.removeAttribute('data-bd-scenario');
        data.next.container.style.transform = '';
        data.next.container.style.transformOrigin = '';
        data.next.container.style.opacity = '';
      }

      // Reset role-switch flag
      window.__bdRoleSwitchPending = false;

      window.scrollTo(0, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
