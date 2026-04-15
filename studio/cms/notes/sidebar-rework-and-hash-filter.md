# Studio — Page progress bar + cross-page filter fix + sidebar logo markup

## Context

Three connected problems surfaced while testing the sidebar rework:

1. **Filter hash lost through Barba nav.** Clicking **Work** from a case-study page navigates to home but `window.location.hash` comes through empty — filter never applies, user sees unfiltered feed.
2. **No feedback during cross-page navigation.** Even once we fix (1), the user clicks Work → page transition → manifest fetch → filter → scroll happens silently over 400–1500 ms. The user has no indication that "I asked for work, the system is working on it."
3. **Sidebar logo** uses inline `<svg>` with our own `.svg-icn` wrapper. The design-system pattern expects `<div class="svg-logo-by-default-centered">`. The user pasted the correct markup to use.

The timing issue (1) is a bug. (2) is a UX improvement that *also* gives us a reliable visual signal for when the whole arrival sequence is "done" (transition + filter + scroll). Solving them together means the progress bar isn't just decorative — it's the thing gating the scroll, so the user understands they're being taken to the feed on purpose.

**Outcome:**
- A **page progress bar** component — a fixed 5 px strip at the top of the viewport that advances during page navigation and fades out on completion. Reusable for every page load, not just hash-filter arrivals.
- **Correct filter behaviour** across all entry points: click from another page, paste URL, reload — all arrive on home, filtered, scrolled, with progress bar completing at the end.
- **Updated sidebar logo** using the supplied `.svg-logo-by-default-centered` markup.

---

## 1. Page progress bar — `studio/assets/js/page-progress.js`

A small, standalone module. Not coupled to Barba or to the feed filter. Exposes a tiny API that any page-level action can drive.

### 1a. Markup (added once to the layout shell)

```html
<div class="page-progress" data-page-progress aria-hidden="true">
  <div class="page-progress-fill"></div>
</div>
```

Plain divs, not `<progress>`. A native `<progress>` element can't smoothly animate from arbitrary percentages without pausing (value changes are step-discrete), and it can't carry the fade-out state we need. We take inspiration from [design-system/progress.html](design-system/progress.html) — `.progress-bar` semantic scale (`--success`, `--warning`, `--danger` modifiers) — but page-progress is a distinct component with its own fixed-to-viewport behaviour, so it earns its own class namespace.

Inject via JS on module load (so we don't touch every HTML file):
- `initPageProgress()` creates the element if it doesn't exist and appends to `<body>`.

### 1b. CSS — `studio/assets/css/studio.css`

```css
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-s) var(--ease-out);
}

.page-progress.is-active {
  opacity: 1;
}

.page-progress.is-fading {
  opacity: 0;
  transition-delay: var(--duration-m); /* lingers full-width before fading */
}

.page-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--text-accent);
  transform-origin: left;
  transition: width var(--duration-m) var(--ease-out);
}
```

No rounded corners. Colour pulled from `--text-accent` (matches active-nav colour).

### 1c. JS API

```js
// Public API on window
window.pageProgress = {
  start(),         // -> visible, advances to 20% at easing
  set(pct),        // -> advances to a specific percentage (0–100)
  complete(),      // -> rushes to 100%, then fades out
  cancel(),        // -> instant reset (for aborted transitions)
};
```

Internal state: `{ el, fill, active: false, value: 0, timers: [] }`. One instance per page (singleton).

- `start()` — set active class, kick value to 10%, then schedule gentle progression (25 → 40 → 60) on staggered timeouts to simulate activity while the real work happens. Cap at 80% if nobody calls `complete()` — so the bar never fakes completion.
- `set(pct)` — direct width update. Called by consumers who know their progress (e.g. "manifest fetched = 60%").
- `complete()` — jump to 100%, add `is-fading` after a tick, remove both classes + reset width once the fade finishes.
- `cancel()` — immediate cleanup without the 100% flash.

All durations/easings from motion tokens — no hardcoded ms.

### 1d. Integration points — full lifecycle coverage

The progress bar is **driven by consumers**, not by Barba's internals. We wire it into every lifecycle signal Barba gives us plus the non-Barba first-paint path. Single ownership rule: **exactly one place decides when to complete for each scenario** — either `hooks.after` or `applyFilterFromHash` (mutually exclusive).

**Barba navigation lifecycle mapped to progress**

Barba 2 fires hooks in this order: `before → beforeLeave → leave → afterLeave → beforeEnter → enter → afterEnter → after`. Mapping to the three we care about:

| Barba hook | Progress call | Notes |
|---|---|---|
| `before` | `pageProgress.start()` | bar appears at 10%, begins gentle auto-advance |
| `beforeEnter` | `pageProgress.set(40)` | new container is in DOM; leaves animation is done |
| `afterEnter` | `pageProgress.set(70)` | enter animation is done; studio features (feed, TOC etc.) initializing |
| `after` | **decide**: complete OR hand off (see below) | transition fully settled |

Registering `beforeEnter` is new — we'll add it alongside the three existing hooks so the bar has a real checkpoint at the halfway mark regardless of transition duration (our open/close/swap transitions have different motion token durations; relying on timeouts would mismatch them).

**Completion ownership — decision at `hooks.after`**

```
if (pendingFilterSlug || location.hash.slice(1) in HASH_TO_FILTER) {
  // The filter+scroll chain in initFeed() owns completion.
  // Don't touch the bar here.
} else {
  pageProgress.complete(); // normal nav, we're done.
}
```

This keeps `initFeed()` as the single authority when a filter is about to run — avoiding a race where `after` completes the bar at 100% then filter+scroll kicks in for another 500 ms with nothing on screen.

**Error + abort paths**

Barba can fail to fetch the target page, or the user can click a new link mid-transition (Barba cancels the in-flight one). We need to recover the progress bar in both cases:

| Signal | Progress call |
|---|---|
| `barba.init({ requestError: fn })` — HTTP fetch fails | `pageProgress.cancel()` inside the callback; fall back to browser nav |
| New Barba nav starts while one is in flight | `start()` is idempotent — calling it again resets and restarts. Guard inside the module. |
| User hits browser Back/Forward | Barba intercepts popstate and fires the full hook chain normally → covered by the table above |
| `prefers-reduced-motion` | bar still renders (it's a progress indicator, not decoration) but internal transitions collapse to near-zero duration. Consumers don't need to know. |

**Non-Barba first paint (hard reload, direct URL load)**

```
DOMContentLoaded
  → pageProgress.start()
  → studio inits run
  → initFeed() resolves manifest
  → if hash/slug present: applyFilterFromHash() owns complete()
    else: pageProgress.complete() once initFeed's render finishes
```

`initFeed()` is the only first-paint consumer that needs progress awareness because it's the only async init. All other inits (Barba, sidebar posts, thumb hover, bd-video) are synchronous once the manifest is in.

**`initFeed()` instrumentation**

```js
function initFeed() {
  var feed = document.querySelector("[data-feed]");
  if (!feed) return;
  if (window.pageProgress) window.pageProgress.set(80);
  loadStudioContent().then(function (data) {
    feed.innerHTML = "";
    // …render items…
    if (typeof markReadPosts === "function") markReadPosts();
    if (typeof window.initThumbHover === "function") window.initThumbHover(feed);
    applyFilterFromHash(); // owns complete() if a filter runs; otherwise no-op
    // If no filter ran, finalise the bar.
    if (pendingFilterSlug === null && !HASH_TO_FILTER[location.hash.slice(1)]) {
      if (window.pageProgress) window.pageProgress.complete();
    }
  });
}
```

Note: `applyFilterFromHash()` clears `pendingFilterSlug` internally, so the post-check works regardless of which entry point (click vs hash vs nothing) is active.

**Summary — who completes the bar**

| Scenario | Who calls `complete()` |
|---|---|
| Barba nav to a non-home page | `hooks.after` |
| Barba nav to home, no filter | `hooks.after` |
| Barba nav to home + hash/slug | `applyFilterFromHash()` (after filter+scroll chain) |
| Hard reload on non-home page | `hooks.after` (Barba runs once on first load too) OR first-paint handler if Barba isn't reachable |
| Hard reload on home, no hash | `initFeed()` tail, after render |
| Hard reload on home with hash | `applyFilterFromHash()` (after filter+scroll chain) |
| Request error | `requestError` callback → `cancel()` |
| Nav cancelled mid-flight | `start()` of the new nav resets |

Only ONE owner per path. No overlapping `complete()` calls.

### 1e. File-level summary

**New files:**
- `studio/assets/js/page-progress.js` — ~80 lines, self-contained IIFE following the existing module style (see `thumb-hover.js` as reference). Exposes `window.pageProgress`.

**Edited files:**
- [studio/assets/css/studio.css](studio/assets/css/studio.css) — add `.page-progress` rules (section 1b above).
- [studio/assets/js/studio-barba.js](studio/assets/js/studio-barba.js) — call `pageProgress.start()` in `hooks.before`; `pageProgress.set(60)` in `hooks.afterEnter`; `pageProgress.complete()` in `hooks.after` **only when no hash-filter is pending**.
- [studio/assets/js/studio.js](studio/assets/js/studio.js) — `initFeed()` calls `pageProgress.set(80)` post-fetch and `pageProgress.complete()` after filter+scroll settles; on DOM ready (first load, non-Barba) call `pageProgress.start()` if the body's initial level is 0 or a hash is pending.
- Five page templates (index, about, contact, templates/page-template.html, cms/generator/templates/layout.html) — add `<script src="…/page-progress.js" defer></script>` alongside the other studio scripts.

---

## 2. Cross-page filter hash fix

Keep the same dual-transport approach from the previous draft, but gate the `complete()` call on the filter/scroll chain finishing.

### 2a. Module state

In [studio/assets/js/studio.js](studio/assets/js/studio.js):

```js
var pendingFilterSlug = null; // survives Barba transition even when hash is dropped
```

### 2b. Capture on click

Extend the existing delegate at [studio/assets/js/studio.js:276-299](studio/assets/js/studio.js#L276-L299). In the off-home branch:

```js
if (!feed) {
  var slug = btn.getAttribute("data-filter-hash");
  if (slug) pendingFilterSlug = slug;
  return;
}
```

### 2c. Consume on home arrival

Update `applyFilterFromHash()` at [studio/assets/js/studio.js:873-889](studio/assets/js/studio.js#L873-L889):

```js
function applyFilterFromHash() {
  var slug = pendingFilterSlug || (window.location.hash || "").replace(/^#/, "");
  pendingFilterSlug = null;
  var target = HASH_TO_FILTER[slug];
  if (!target) {
    // Nothing to filter — page-progress completes now (no filter+scroll to wait for).
    if (window.pageProgress) window.pageProgress.complete();
    return;
  }
  var link = document.querySelector('[data-filter="' + target + '"]');
  if (!link) {
    if (window.pageProgress) window.pageProgress.complete();
    return;
  }
  // Restore URL hash (Barba may have dropped it). Keeps state bookmarkable.
  if (location.hash !== "#" + slug) {
    history.replaceState(null, "", "#" + slug);
  }
  pendingHashScrollBaseline = window.scrollY;
  link.click();
  // The filter's setTimeout chain (FLIP animation + scrollTo) finishes ~400 ms
  // after click. Complete the progress bar at the tail of that chain.
  setTimeout(function completeAfterFilter() {
    if (window.pageProgress) window.pageProgress.complete();
  }, readDuration("--duration-2xs") + readDuration("--duration-s") + 50);
}
```

Using the same motion tokens the filter handler uses so the progress bar's completion timing always tracks the real animation duration.

### 2d. Barba hook wiring

Expose a helper from [studio/assets/js/studio.js](studio/assets/js/studio.js) so studio-barba.js can ask whether a filter is about to run without duplicating the hash-map:

```js
window.studioHasPendingFilter = function () {
  return (
    pendingFilterSlug !== null ||
    (location.hash.slice(1) in HASH_TO_FILTER)
  );
};
```

Then in [studio/assets/js/studio-barba.js](studio/assets/js/studio-barba.js) wire all four hooks + error handler:

```js
window.barba.hooks.before(function onBefore() {
  document.body.classList.add("is-animating");
  document.dispatchEvent(new CustomEvent("studio:before-nav"));
  if (window.pageProgress) window.pageProgress.start();
});

window.barba.hooks.beforeEnter(function onBeforeEnter() {
  if (window.pageProgress) window.pageProgress.set(40);
});

window.barba.hooks.afterEnter(function onAfterEnter(data) {
  // …existing meta + level sync + studio:after-nav dispatch…
  if (window.pageProgress) window.pageProgress.set(70);
});

window.barba.hooks.after(function onAfter(data) {
  // …existing inits…
  // Completion: hand off to applyFilterFromHash() when a filter is pending,
  // otherwise we own it.
  var isHome = data.next.container.getAttribute("data-level") === "0";
  var willFilter = isHome &&
                   typeof window.studioHasPendingFilter === "function" &&
                   window.studioHasPendingFilter();
  if (!willFilter && window.pageProgress) {
    window.pageProgress.complete();
  }
});

window.barba.init({
  transitions: [studioTransition],
  prevent: shouldPrevent,
  prefetchIgnore: true,
  debug: false,
  requestError: function onRequestError() {
    if (window.pageProgress) window.pageProgress.cancel();
  },
});
```

---

## 3. Sidebar logo markup swap

### 3a. Replace the logo element

Current markup in all five sidebars (index / about / contact / templates/page-template.html / cms/generator/templates/layout.html):

```html
<a href="…index.html" class="sidebar-logo" aria-label="By Default — Home">
  <div class="svg-icn" data-icon="logo">
    <svg viewBox="0 0 1050 505" …>…</svg>
  </div>
</a>
```

New markup (user-provided):

```html
<a href="…index.html" class="sidebar-logo" aria-label="By Default — Home">
  <div class="svg-logo-by-default-centered">
    <svg viewBox="0 0 1050 505" fill="none" aria-hidden="true" width="100%" height="100%">…same 9 paths…</svg>
  </div>
</a>
```

Note: the snippet supplied by the user has `style="aspect-ratio: 1050 / 505%"` — that's invalid CSS (the `%` breaks the ratio). We drop the inline style and enforce the aspect ratio via CSS on `.sidebar-logo` instead, which already has `aspect-ratio: 1050 / 505` from the previous round.

### 3b. CSS selectors to update

[studio/assets/css/studio.css](studio/assets/css/studio.css) — replace the `.sidebar-logo .svg-icn` selector with `.sidebar-logo .svg-logo-by-default-centered`:

```css
.sidebar-logo .svg-logo-by-default-centered,
.sidebar-logo svg {
  display: block;
  width: 100%;
  height: 100%;
}
```

---

## 4. Files touched

| File | Change |
|---|---|
| **NEW** `studio/assets/js/page-progress.js` | Page progress bar module. Exposes `window.pageProgress`. |
| [studio/assets/css/studio.css](studio/assets/css/studio.css) | `.page-progress` rules; swap `.svg-icn` selector for `.svg-logo-by-default-centered`. |
| [studio/assets/js/studio.js](studio/assets/js/studio.js) | `pendingFilterSlug` variable; capture on off-home click; consume with fallback; progress-bar `set`/`complete` calls. |
| [studio/assets/js/studio-barba.js](studio/assets/js/studio-barba.js) | Progress-bar start/set/complete hooked into `before`/`afterEnter`/`after`. Conditional complete when hash filter is pending. |
| [studio/index.html](studio/index.html) | Swap logo markup. Add `<script src="assets/js/page-progress.js" defer></script>`. |
| [studio/about.html](studio/about.html) | Same logo + script additions. |
| [studio/contact.html](studio/contact.html) | Same. |
| [studio/templates/page-template.html](studio/templates/page-template.html) | Same. |
| [studio/cms/generator/templates/layout.html](studio/cms/generator/templates/layout.html) | Same, with `../` prefix on script src. Rebuild L2s via `npm run gen`. |

---

## 5. Verification

### Progress bar
1. Any page → click any nav link. A thin accent-coloured bar should flash at the top, advance as the page transitions, and fade out once the new page is settled.
2. Hard reload any page. Progress bar shows during initial load and clears when ready.
3. Reduced-motion check — with OS "Reduce motion" on, progress bar still shows but without easing jank (already handled by motion tokens).

### Cross-page filter
4. From `/work/a-website-as-dynamic-as-the-people-behind-it.html`, click **Work**. Expected: page transitions to home, URL becomes `/#work`, feed filters to case studies, page scrolls to feed, progress bar completes at the scroll-finish.
5. From `/articles/naming-things.html`, click **Articles**. Same sequence for articles filter.
6. Paste `http://localhost:8000/#work` into browser address bar. Expected: same filtered state on load, progress completes at end of filter+scroll.
7. Bookmark after (4). Paste into new tab. Expected: same state.
8. On home with `#work` active, click **Work** again. Expected: scrolls to feed (unchanged). Progress bar starts + completes briefly to acknowledge.
9. From a case study, click **Contact**. No filter state captured. Progress bar behaves like a normal nav (start/afterEnter-60/after-complete).

### Logo
10. Every page's sidebar shows the new centered By-Default mark at the correct aspect ratio, under `.svg-logo-by-default-centered`.
11. DevTools: the old `.svg-icn[data-icon="logo"]` selector has no matches. The new selector is in use.

---

## 6. Out of scope

- No Barba patches / forks — the dual-transport approach works with what Barba gives us.
- Progress bar is not a general-purpose design-system component (yet). If it proves useful, we promote it into `docs-site` or `core` layer later.
- No change to `--duration-*` motion tokens. Progress-bar pacing uses the existing scale.
- No renaming of `applyFilterFromHash` even though it now reads more than just the hash — deferred until a cleaner name emerges with more use cases.
