/**
 * bd-site-init.js — Site-wide page-init dispatcher
 *
 * Calls window.init* for each per-page tool module on initial load and after
 * every Barba navigation (via the bd:after-nav event dispatched from
 * barba-init.js's refreshPageInit).
 *
 * Each init function is responsible for early-bailing if its target element
 * is absent on the current page — this file is unconditional, the modules
 * decide whether they apply.
 *
 * To register a new page module:
 *   1. Have the module expose window.initFoo at module load
 *   2. Add a call to bdRunPageInits below
 *
 * @version 1.0.0
 */
(function () {
  'use strict';

  console.log('[bd-site-init] v1.0.0 loaded');

  function bdRunPageInits() {
    if (typeof window.initCpmCalculator === 'function')    window.initCpmCalculator();
    if (typeof window.initWorldClock === 'function')       window.initWorldClock();
    if (typeof window.initImagePlaceholder === 'function') window.initImagePlaceholder();
    if (typeof window.initSvgCleaner === 'function')       window.initSvgCleaner();
    if (typeof window.initNotionForm === 'function')       window.initNotionForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bdRunPageInits);
  } else {
    bdRunPageInits();
  }

  document.addEventListener('bd:after-nav', bdRunPageInits);
})();
