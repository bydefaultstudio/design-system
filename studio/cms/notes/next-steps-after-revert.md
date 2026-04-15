# Studio sidebar rework + hash filter — notes after revert

State at time of writing: reverted to commit d211c6e. The full session snapshot
is preserved in git stash (`git stash list` → `studio-rework-session-snapshot-2026-04-15`),
restorable with `git stash apply stash@{0}`.

The full plan is alongside this file: `sidebar-rework-and-hash-filter.md`.

## What the rework was meant to deliver

1. **Sidebar rework** — replace `.feed-filters` with unified nav (About / Work /
   Articles / Contact). Work + Articles double as homepage filters via
   `index.html#work` / `index.html#articles` hashes.
2. **Logo swap** — use `.svg-logo-by-default-centered` (centered primary mark,
   1050×505 viewBox) inside an `.intro-block` flex column with the sidebar intro.
3. **Sidebar-about section** — title + paragraph + "Read more →" above the work list.
4. **Burger button** — to the right of the nav row, removes the old tooltips.
5. **Page progress bar** (`page-progress.js`) — fixed 5px top strip driven by
   Barba lifecycle hooks. See plan section 1.
6. **Cross-page hash filter** — clicking Work/Articles from a non-home page
   transitions to home with the filter applied and the feed scrolled into view.

## What worked

- Sidebar markup, nav, intro-block, sidebar-about, burger.
- Logo swap with correct aspect ratio (1050 / 505).
- `page-progress.js` component itself — start/set/complete/cancel API,
  Barba-hook integration. Useful as a standalone module.
- Cross-page hash transport via `pendingFilterSlug` (Barba was dropping the URL
  hash on cross-pathname nav, so we kept the slug in JS state).

## What broke (the reason for the revert)

A scroll overshoot when arriving at home with `#articles` (or `#work`).
Symptom: page scrollY jumps several hundred pixels ~2 seconds after load.
Document `scrollHeight` (1852) was much larger than `htmlHeight` (1076), so
something is rendering outside the html box and contributing to scroll height
without claiming layout — but no element's `offsetHeight` accounts for the
~776px overflow.

What we ruled out via instrumentation:
- Not a `window.scrollTo` / `scrollBy` / `scrollIntoView` / `focus` / `scrollTop`
  call — all monkey-patched, none fired during the overshoot.
- Not `history.scrollRestoration` — set to `"manual"`, no change.
- Not a leftover Barba `is-animating` class.
- Not a leftover `transform` on `[data-barba="container"]` (computed `none`).
- Not the `min-height: 100vh` on the container (moving it under `is-animating`
  did not remove the whitespace).

What we never confirmed:
- Which actual element is producing the 776px of overflow. Likely candidate
  before reverting: `bd-video` player elements (scrubber, controls) with
  `position: absolute; bottom: -N`, since bd-video init runs right before the
  watch logs go sideways. Run this in DevTools on the broken page to name it:

```js
const limit = document.documentElement.offsetHeight;
[...document.querySelectorAll('body *')]
  .map(el => {
    const r = el.getBoundingClientRect();
    return { el, bottom: r.bottom + scrollY, pos: getComputedStyle(el).position, t: getComputedStyle(el).transform };
  })
  .filter(x => x.bottom > limit + 5)
  .sort((a, b) => b.bottom - a.bottom)
  .slice(0, 10)
  .forEach(x => console.log(
    Math.round(x.bottom), x.pos, x.t,
    x.el.tagName + '.' + (typeof x.el.className === 'string' ? x.el.className : '')
  ));
```

## Recommended next attempt

1. Reapply the rework piece-by-piece, starting with the **sidebar markup +
   logo + intro-block** only. Verify scroll behaviour stays clean.
2. Then add the **page-progress.js** component (purely additive).
3. Then add **cross-page hash filter** (pendingFilterSlug + applyFilterFromHash).
4. **Before** wiring any scroll-into-view or scroll-locking logic, find the
   overflow source using the script above. Fix the actual element. Do not work
   around it with monkey-patched scroll APIs or scroll locks — that's what
   accumulated the dead code in the reverted session.

## Files removed by the revert

- `studio/assets/js/page-progress.js` (was untracked — orphan after revert)
- `studio/assets/js/thumb-hover.js` (was untracked — orphan after revert)

If keeping these, ensure they are referenced by the rebuilt HTML; otherwise
delete. Both are recoverable from `stash@{0}` if lost.
