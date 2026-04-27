# Session Handover — Studio transition jumps fixed (page-header refactor + supporting cleanups)

## What landed this round (2026-04-27)

The persistent `.page-header` was reflowing the document on every show/hide because `position: sticky` takes flow space — `[hidden]` toggles caused visible 3.5 rem jumps (down on open, up after close). Fixed by switching the header to `position: fixed` (out of flow) and reserving its visual space via `padding-top` on the entering page-wrapper, keyed to the container's own `data-level` (NOT body-level state, which updates too late). Three supporting fixes shipped alongside.

### Architectural refactor — `.page-header` out of flow

[studio/assets/css/studio.css](studio/assets/css/studio.css):
- `.page-header` → `position: fixed; top: 0; left: var(--sidebar-width); right: 0; z-index: 100`. Old `[data-sticky]` rule (and its mobile override) removed.
- `body.is-sidebar-collapsed .page-header { left: var(--sidebar-collapsed-width) }` follows sidebar collapse, with a `transition: left var(--duration-s)` for smooth tracking.
- Mobile media query: `.page-header { left: 0; top: var(--mobile-bar-height) }` plus `body.is-sidebar-collapsed .page-header { left: 0 }`.
- Wrapper space reservation: `[data-barba="container"][data-level="1"] > .page-wrapper, [data-barba="container"][data-level="2"] > .page-wrapper { padding-top: var(--studio-bar-height) }` — same value on desktop and mobile.
- Defensive `.page-header[hidden] { display: none }` retained.
- The `data-sticky` HTML attribute remains across 20 files as a harmless no-op.

### Supporting fixes

**Sticky-element fade rules** ([studio.css:798-810](studio/assets/css/studio.css#L798)) — extended the existing `.section-header` is-animating fade to also cover `.toc-block`, `.share-block`, `.case-study-content-inner`. Same root cause (transformed-ancestor breaks sticky); same patch.

**Scroll-snap timing** ([studio-barba.js:429-432](studio/assets/js/studio-barba.js#L429)) — apply leaving container's compensating transform BEFORE `window.scrollTo(0, 0)` instead of waiting for the GSAP timeline to resolve. Closes the 300–600 ms window where the user could see the un-compensated home page snapped to scrollY=0.

**Next-read morph alignment** ([studio-barba.js:411-414](studio/assets/js/studio-barba.js#L411)) — `nextReadTop` now subtracts both `mobileBar.offsetHeight` AND `pageHeader.offsetHeight`. The next-read card lands flush below the page-header where the entering article's `.article-lead` actually sits, instead of at viewport top behind the header.

**Cleanup** ([studio-barba.js:514-519](studio/assets/js/studio-barba.js#L514)) — dropped redundant `pageHeader.style.transform = ""` from the close `.then()`. The `after` hook clears it on every transition; one place is enough.

## Verification

`npm run serve:studio` → http://localhost:2000/. Walk through:

1. Home (any scroll position) → article — no jump down at start; header slides in from above; both meet at T=1200.
2. Article → home — header slides up off the top; home settles cleanly with no upward jump at T=1200.
3. Article 1 → article 2 (next-read card) — card lands flush below page-header; morph aligns.
4. Article 1 → article 2 (sidebar nav) — header doesn't move; eyebrow stays "Article".
5. Open article with TOC + share rails sticky-pinned, navigate away — TOC + share fade smoothly, no glitch.
6. Open case study with sticky info panel, navigate away — info panel fades smoothly.
7. Sidebar collapse with header visible — header repositions smoothly (transition on `left`).
8. Mobile — header sits below mobile bar; article content correctly padded; sticky elements fade.
9. Reduced motion — header appears/disappears instantly via the existing `animate()` short-circuit.

## Pre-flight commit

Checkpoint `17d9c57` ("persist studio page-header outside barba container, animate in sync with transitions") captures all prior work in this stream — persistent header migration, animation coordination, generator updates, all 17 page HTML changes, accordion spacing tokens, styleguide additions. Created before this round so we have a clean rollback target.

## Tech debt deferred (raised by outsider review, not in this round)

These came up during the four-agent pressure-test of the plan but were out of scope:

- **CSS-grid shell** — `<main>` could use `grid-template-rows: auto 1fr` with `.page-header` in row 1 instead of fixed + padding. Cleaner conceptually but introduces conditional row-sizing timing issues. Consider for a future layout refactor.
- **Rect-based morph targeting** — read the entering `.article-lead.getBoundingClientRect()` directly instead of subtracting offsets. Robust to any future top chrome (announcement bar, breadcrumb). Defer until the next time the morph breaks.
- **"Don't scroll the window"** — the snap-then-compensate pattern is a smell. Cleaner: animate transforms only, never `window.scrollTo` during transitions. Bigger refactor.
- **Stop transforming the scroll container** — root architectural fix for sticky-children glitches. Would require an overlay technique for the leaving page. The opacity fade is the pragmatic patch.

## Outstanding flags from earlier passes

- **Case-study toggle race** ([studio-case-study.js](studio/assets/js/studio-case-study.js)) — global click handler can call `ScrollTrigger.refresh()` mid-transition. Add an `is-animating` guard. Low priority unless hit.
- **Share-link listener accumulation** ([studio-article.js:130-155](studio/assets/js/studio-article.js#L130)) — event listeners attached on each page enter, never removed. Minor leak. Use event delegation scoped to container.
- **Multiple `ScrollTrigger.refresh()` calls** — redundant but not harmful.

## Files changed (this round only — diff vs `17d9c57`)

| File | Why |
|---|---|
| [studio/assets/css/studio.css](studio/assets/css/studio.css) | page-header → fixed; wrapper padding-top rule; expanded sticky-fade rule; mobile media query update |
| [studio/assets/js/studio-barba.js](studio/assets/js/studio-barba.js) | scroll-compensation order; next-read offset includes page-header; close `.then()` cleanup simplified |

No HTML / template changes. No generator regenerate.

## Memory updates

- Updated [project_studio_page_header.md](.claude/memory/project_studio_page_header.md) — current architecture (position: fixed, wrapper padding-top, animation coordination via WAAPI).
- Created [feedback_layout_flow_reflow.md](.claude/memory/feedback_layout_flow_reflow.md) — rule of thumb: avoid `[hidden]` on in-flow elements during transitions; default to fixed/absolute and reserve space via padding.
- Updated [MEMORY.md](.claude/memory/MEMORY.md) index.

## Plan files

- Approved plan for this round: `/Users/erlenmasson/.claude/plans/lets-make-a-plan-vast-leaf.md`
- Earlier session plans: `/Users/erlenmasson/.claude/plans/transition-polish-pass.md` (superseded by the architectural refactor) and `/Users/erlenmasson/.claude/plans/page-header-transition-coordination.md` (animation coordination, shipped in checkpoint commit).
