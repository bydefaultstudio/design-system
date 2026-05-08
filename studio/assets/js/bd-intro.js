/**
 * Script Purpose: First-load loading curtain
 * Author: Erlen Masson
 * Version: 1.1.0
 *
 * Plays on every real document load (first visit, refresh, hard refresh,
 * deep-link arrival). Never plays on Barba SPA transitions — those don't
 * fire DOMContentLoaded, so this script's boot() is unreachable on link
 * clicks. Mounts a dark overlay with a wordmark drop animation while the
 * page boots underneath, then dismisses when the page signals studio:ready.
 *
 *  - Scroll-locks <body> via position:fixed (iOS Safari safe).
 *  - Sets `inert` on .sidebar, .mobile-bar, .page-header, <main>
 *    so keyboard + screen-reader can't reach occluded content.
 *  - Captures + restores keyboard focus across the lock window.
 *  - Reduced motion: skips the curtain entirely; still fires the
 *    intro-complete event so gated reveals run.
 *  - bfcache restore mid-curtain: recovers via pageshow guard.
 */

(function () {
  "use strict";

  console.log("Script - bd-intro v1.1.0 (Studio)");

  /* ------------------------------- Config ------------------------------ */

  var CONFIG = {
    size: 0.42,         // logo width as fraction of viewport (desktop)
    maxWidth: 300,      // hard cap on logo width in px (overrides size on wide viewports)
    speed: 1400,        // total ms per piece (fall + spring window)
    rotation: 1.0,      // rotation multiplier
    overshoot: 10,      // px — first-bounce amplitude
    bounce: 1.0,        // pace multiplier
    friction: 5.0,      // damping rate
    fadeMs: 600,        // curtain fade-out duration
    staggerRatio: 0.16  // stagger as fraction of speed
  };

  var FALL_RATIO = 0.55;
  var SPRING_SAMPLES = 30;
  var REF_OSCILLATIONS = 2.5;

  var ORIGINAL_W = 1050;
  var ORIGINAL_H = 505;

  var INERT_SELECTORS = [".sidebar", ".mobile-bar", ".page-header", "main#main"];

  /* ------------------------------ Logo data --------------------------- */

  var PIECES_DATA = [
    {
      id: "fault",
      bounds: { x: 350, y: 267, w: 700, h: 238 },
      rotStart: 2.2,
      bounceDamp: 1.0,
      paths: [
        "M383.323 500L381.991 498.668V390.11C381.991 379.454 375.997 373.46 365.341 373.46H352.021L350.689 372.128V327.332L352.021 326H380.659L381.991 324.668L382.018 268.332L383.35 267H473.593L474.925 268.332L474.898 304.862L473.566 306.194H455.251C443.929 306.194 438.601 312.014 438.601 323.336V324.668L439.933 326H473.566L474.898 327.332V372.128L473.566 373.46H455.251C444.595 373.46 438.601 379.454 438.601 390.11V498.668L437.269 500H383.323Z",
        "M562.413 500C502.806 500 473.835 463.196 473.835 413.246C473.835 363.296 502.806 326 562.413 326H647.661L648.993 327.332V498.668L647.661 500H562.413ZM562.413 444.056C578.397 444.056 592.383 432.734 592.383 412.754C592.383 392.774 578.397 381.452 562.413 381.452C546.429 381.452 532.443 392.774 532.443 412.754C532.443 432.734 546.429 444.056 562.413 444.056Z",
        "M833.179 326L834.511 327.332V498.668L833.179 500H675.337L674.005 498.668V327.332L675.337 326H729.283L730.615 327.332V424.076C730.615 439.061 738.94 447.386 753.925 447.386H754.591C769.576 447.386 777.901 439.061 777.901 424.076V327.332L779.233 326H833.179Z",
        "M860.837 500L859.505 498.668V268.332L860.837 267H914.783L916.115 268.332V430.736C916.115 441.392 922.109 447.386 932.765 447.386H933.764L935.096 448.718V498.668L933.764 500H860.837Z",
        "M959.347 500L958.015 498.668V390.602C958.015 379.946 952.021 373.952 941.365 373.952H928.045L926.713 372.62V327.332L928.045 326H956.683L958.015 324.668V278.222L959.347 276.89H1013.29L1014.63 278.222V324.668L1015.96 326H1048.67L1050 327.332V372.62L1048.67 373.952H1030.35C1019.7 373.952 1014.63 379.946 1014.63 390.602V434.732C1014.63 445.388 1019.7 450.05 1030.35 450.05H1048.67L1050 451.382V498.668L1048.67 500H959.347Z"
      ]
    },
    {
      id: "de",
      bounds: { x: 0, y: 267, w: 348, h: 238 },
      rotStart: -2.8,
      bounceDamp: 0.65,
      paths: [
        "M88.578 500C28.971 500 0 462.371 0 412.421C0 362.471 28.971 326 88.578 326H113.542L114.874 324.668V268.332L116.206 267H170.152L171.484 268.332V498.668L170.152 500H88.578ZM88.578 444.056C104.562 444.056 118.548 432.734 118.548 412.754C118.548 392.774 104.562 381.452 88.578 381.452C72.594 381.452 58.608 392.774 58.608 412.754C58.608 432.734 72.594 444.056 88.578 444.056Z",
        "M270.184 504.995C218.236 504.995 185.602 466.7 185.602 412.754C185.602 358.808 216.238 320.513 268.186 320.513C313.474 320.513 348.106 348.152 348.106 405.095V429.071L346.774 430.403H257.863C250.537 430.403 245.875 434.399 245.875 441.725C245.875 451.382 253.867 459.041 268.852 459.041C280.174 459.041 286.834 454.712 288.166 448.385L289.498 447.053H343.444L344.776 448.385C341.113 483.35 309.811 504.995 270.184 504.995ZM279.175 397.769C286.501 397.769 290.497 393.107 290.497 385.781C290.497 375.125 281.506 367.133 268.519 367.133C255.532 367.133 246.541 375.125 246.541 385.781C246.541 393.107 250.537 397.769 257.863 397.769H279.175Z"
      ]
    },
    {
      id: "by",
      bounds: { x: 382, y: 0, w: 351, h: 306 },
      rotStart: 2.4,
      bounceDamp: 0.35,
      paths: [
        "M383.332 233L382 231.668V1.332L383.332 0L437.258 0L438.59 1.332V57.668L439.922 59H465.23C524.837 59 553.808 95.963 553.808 145.913C553.808 195.863 524.837 233 465.23 233H383.332ZM465.23 177.056C481.214 177.056 495.2 165.734 495.2 145.754C495.2 125.774 481.214 114.452 465.23 114.452C449.246 114.452 435.26 125.774 435.26 145.754C435.26 165.734 449.246 177.056 465.23 177.056Z",
        "M559.84 306L558.508 304.668V268.332L559.84 267H601.132C613.453 267 618.448 261.305 620.446 252.314L621.445 248.318C623.776 238.328 618.115 233 608.125 233H598.468L597.136 231.668L548.518 60.332L549.85 59H607.126L629.437 157.901C631.102 164.894 634.765 168.557 640.759 168.557C646.753 168.557 650.416 164.894 652.081 157.901L674.392 59H731.668L733 60.332L663.096 304.668L661.764 306H559.84Z"
      ]
    }
  ];

  /* ------------------------------ Helpers ----------------------------- */

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function effectiveSizeFraction(stageW) {
    var isMobile = stageW < 720;
    if (isMobile) {
      var minD = 0.18, maxD = 0.85;
      var minM = 0.32, maxM = 0.95;
      var t = (CONFIG.size - minD) / (maxD - minD);
      t = Math.max(0, Math.min(1, t));
      return minM + (maxM - minM) * t;
    }
    return CONFIG.size;
  }

  function getStagger() {
    return Math.round(CONFIG.speed * CONFIG.staggerRatio);
  }

  function getEffectiveOscillations() {
    return ((1 - FALL_RATIO) / FALL_RATIO) * REF_OSCILLATIONS * CONFIG.bounce;
  }

  /* --------------------------- Scroll lock + inert -------------------- */

  var savedScrollY = 0;
  var inertElements = [];
  var previouslyFocused = null;

  function lockPage() {
    // Capture the current focus target BEFORE applying inert (which would
    // strip focus from any element inside .sidebar / .mobile-bar /
    // .page-header / <main>). Restored in unlockPage.
    previouslyFocused = document.activeElement;

    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = "-" + savedScrollY + "px";
    document.body.classList.add("is-intro-loading");

    inertElements = [];
    INERT_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.hasAttribute("inert")) {
          el.setAttribute("inert", "");
          inertElements.push(el);
        }
      });
    });
  }

  // Idempotent: safe on a fresh document (no-op) and after a crashed prior
  // run (clears residue). Restores body, scroll, inert, focus — all the
  // state lockPage() touches. Called BEFORE the curtain fades so the
  // page beneath is already at the correct scroll position; the fade then
  // reveals it without a post-fade snap.
  function unlockPage() {
    document.body.classList.remove("is-intro-loading");
    document.body.style.top = "";
    if (savedScrollY > 0) {
      window.scrollTo(0, savedScrollY);
    }

    inertElements.forEach(function (el) {
      if (el && el.removeAttribute) el.removeAttribute("inert");
    });
    inertElements = [];

    // Belt-and-braces: clear any leftover inert on chrome regions from
    // a crashed prior run (bfcache restore, exception in lockPage flow).
    INERT_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel + "[inert]").forEach(function (el) {
        el.removeAttribute("inert");
      });
    });

    // Restore keyboard/AT focus. If the captured element is still in the
    // DOM and focusable, refocus it. Otherwise fall back to <main> with a
    // programmatic tabindex so screen readers announce the page heading.
    if (previouslyFocused) {
      var target = previouslyFocused;
      previouslyFocused = null;
      if (target && target !== document.body && document.contains(target) &&
          typeof target.focus === "function") {
        try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      } else {
        var main = document.querySelector("main#main");
        if (main && typeof main.focus === "function") {
          if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
          try { main.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        }
      }
    }
  }

  /* --------------------------- DOM construction ----------------------- */

  function buildPieces(stage) {
    var rect = stage.getBoundingClientRect();
    var stageW = rect.width;
    var stageH = rect.height;

    var widthFraction = effectiveSizeFraction(stageW);
    // Clamp the logo's actual rendered width to CONFIG.maxWidth so the wordmark
    // doesn't dominate wide viewports. Below the cap, scale follows the fraction.
    var logoW = Math.min(stageW * widthFraction, CONFIG.maxWidth);
    var scale = logoW / ORIGINAL_W;
    var logoH = ORIGINAL_H * scale;
    var logoOriginX = (stageW - logoW) / 2;
    var logoOriginY = (stageH - logoH) / 2 + Math.min(40, stageH * 0.04);

    var pieces = [];

    PIECES_DATA.forEach(function (data) {
      var w = data.bounds.w * scale;
      var h = data.bounds.h * scale;

      var el = document.createElement("div");
      el.className = "bd-intro-piece";
      el.style.width  = w + "px";
      el.style.height = h + "px";

      el.innerHTML =
        '<svg width="' + w + '" height="' + h + '" ' +
            'viewBox="' + data.bounds.x + " " + data.bounds.y + " " + data.bounds.w + " " + data.bounds.h + '" ' +
            'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          data.paths.map(function (d) { return '<path d="' + d + '"/>'; }).join("") +
        "</svg>";

      stage.appendChild(el);

      var finalX = logoOriginX + data.bounds.x * scale;
      var finalY = logoOriginY + data.bounds.y * scale;
      var startY = -h - 80;

      var initialRot = data.rotStart * CONFIG.rotation;
      el.style.transform =
        "translate(" + finalX + "px, " + startY + "px) rotate(" + initialRot + "deg)";

      pieces.push({
        data: data,
        el: el,
        finalX: finalX,
        finalY: finalY,
        startY: startY
      });
    });

    return pieces;
  }

  /* ------------------------- Keyframe generation ---------------------- */

  function buildKeyframes(piece) {
    var data = piece.data;
    var finalX = piece.finalX;
    var finalY = piece.finalY;
    var startY = piece.startY;

    var rotStart = data.rotStart * CONFIG.rotation;
    var amp = CONFIG.overshoot * data.bounceDamp;
    var oscillations = getEffectiveOscillations();
    var fric = CONFIG.friction;

    var keyframes = [];

    keyframes.push({
      offset: 0,
      transform: "translate(" + finalX + "px, " + startY + "px) rotate(" + rotStart + "deg)",
      easing: "cubic-bezier(0.42, 0, 0.85, 0.62)"
    });

    keyframes.push({
      offset: FALL_RATIO,
      transform: "translate(" + finalX + "px, " + (finalY + amp) + "px) rotate(0deg)",
      easing: "linear"
    });

    for (var i = 1; i <= SPRING_SAMPLES; i++) {
      var t = i / SPRING_SAMPLES;
      var y = amp * Math.cos(2 * Math.PI * oscillations * t) * Math.exp(-fric * t);
      var offset = FALL_RATIO + (1 - FALL_RATIO) * t;
      keyframes.push({
        offset: Math.min(0.9999, offset),
        transform: "translate(" + finalX + "px, " + (finalY + y) + "px) rotate(0deg)",
        easing: "linear"
      });
    }

    keyframes.push({
      offset: 1,
      transform: "translate(" + finalX + "px, " + finalY + "px) rotate(0deg)"
    });

    return keyframes;
  }

  /* ------------------------------ Animate ----------------------------- */

  function dropPiece(piece) {
    var keyframes = buildKeyframes(piece);
    var anim = piece.el.animate(keyframes, {
      duration: CONFIG.speed,
      fill: "forwards"
    });
    return anim.finished;
  }

  function runDropAnimation(curtain) {
    var stage = curtain.querySelector(".bd-intro-stage");
    if (!stage) return Promise.resolve();

    curtain.classList.add("bd-intro--active");

    var pieces = buildPieces(stage);
    if (!pieces.length) return Promise.resolve();

    var stagger = getStagger();
    var allFinished = [];

    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          pieces.forEach(function (piece, i) {
            setTimeout(function () {
              allFinished.push(dropPiece(piece));
              if (i === pieces.length - 1) {
                Promise.all(allFinished).then(resolve);
              }
            }, i * stagger);
          });
        });
      });
    });
  }

  /* ------------------------------ Dismiss ----------------------------- */

  function fadeOutAndRemove(curtain) {
    return new Promise(function (resolve) {
      curtain.classList.add("bd-intro--leaving");
      var done = false;
      function cleanup() {
        if (done) return;
        done = true;
        if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
        resolve();
      }
      curtain.addEventListener("transitionend", cleanup, { once: true });
      // Fallback in case transitionend doesn't fire
      setTimeout(cleanup, CONFIG.fadeMs + 200);
    });
  }

  /* ------------------------- Ready signal (Promise B) ----------------- */
  // Resolves on `studio:ready` if not already fired. If the event fires
  // before this listener registers, we'd miss it — to avoid that, we
  // attach the listener synchronously on script load.

  var studioReadyResolve = null;
  var studioReadyPromise = new Promise(function (resolve) {
    studioReadyResolve = resolve;
  });

  function onStudioReady() {
    if (studioReadyResolve) {
      studioReadyResolve();
      studioReadyResolve = null;
    }
  }

  // Check the latched flag in case bd-animations.js fired studio:ready
  // before this script's listener attached (cached-font cold-load race).
  if (document.documentElement.dataset.studioReady === "true") {
    onStudioReady();
  } else {
    document.addEventListener("studio:ready", onStudioReady, { once: true });
  }

  /* ------------------------------- Boot ------------------------------- */

  function dispatchAllComplete() {
    document.dispatchEvent(new CustomEvent("studio:intro-complete"));
    document.dispatchEvent(new CustomEvent("bd:intro-complete"));
  }

  function skipCurtain(curtain) {
    // Hide markup if present, fire events on next frame so gated reveals
    // (which listen for studio:intro-complete) run.
    if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain);
    requestAnimationFrame(dispatchAllComplete);
  }

  function boot() {
    var curtain = document.getElementById("bd-intro");
    if (!curtain) return;

    // Defensive cleanup: clear any residue from a crashed prior run
    // before re-locking. unlockPage() is idempotent so this is a no-op
    // on a fresh document — cheap insurance.
    unlockPage();

    // Reduced motion — full bypass, no flash, no animation. AT users and
    // anyone who wants to skip the intro can set this preference.
    if (prefersReducedMotion()) {
      skipCurtain(curtain);
      return;
    }

    curtain.style.setProperty("--bd-intro-fade-ms", CONFIG.fadeMs + "ms");

    // Lock page + inert chrome before animation begins.
    lockPage();

    // Promise A: drop animation finished
    var animationDone = runDropAnimation(curtain);

    // Promise B: studio:ready (already wired above)
    // Promise C: one rAF tick after both A + B settle
    var allReady = Promise.all([animationDone, studioReadyPromise]).then(function () {
      return new Promise(function (r) { requestAnimationFrame(r); });
    });

    allReady.then(function () {
      // Dispatch studio:intro-complete BEFORE fade — gated reveals fire
      // during the curtain's exit, not after.
      document.dispatchEvent(new CustomEvent("studio:intro-complete"));

      // Restore body state BEFORE fade so the page beneath is already at
      // its restored scroll position. The fade then reveals it without a
      // post-fade snap on long-page refreshes.
      unlockPage();

      return fadeOutAndRemove(curtain);
    }).then(function () {
      // bd:intro-complete fires AFTER the curtain DOM is fully gone so
      // post-curtain reveals (sidebar stagger) play in the open.
      document.dispatchEvent(new CustomEvent("bd:intro-complete"));
    }).catch(function (err) {
      // Hard failure path: still restore the page so the user isn't
      // stranded in a scroll-locked state with inert chrome.
      console.error("bd-intro: dismiss failed, force-restoring page", err);
      unlockPage();
      if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain);
      document.dispatchEvent(new CustomEvent("studio:intro-complete"));
      document.dispatchEvent(new CustomEvent("bd:intro-complete"));
    });
  }

  /* --------------------------- bfcache recovery ----------------------- */
  // If the user navigates away mid-curtain, the browser may freeze the
  // page in bfcache with `is-intro-loading` + inert chrome still set.
  // On Back, pageshow fires with `event.persisted === true` and no
  // DOMContentLoaded — boot() never re-runs. Recover here so the user
  // doesn't land on a scroll-locked, inert page.

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    if (!document.body.classList.contains("is-intro-loading")) return;

    var curtain = document.getElementById("bd-intro");
    if (curtain) {
      curtain.classList.remove("bd-intro--active", "bd-intro--leaving");
    }
    unlockPage();
    // Flush gated listeners so anything waiting on the curtain finalizes.
    document.dispatchEvent(new CustomEvent("studio:intro-complete"));
    document.dispatchEvent(new CustomEvent("bd:intro-complete"));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
