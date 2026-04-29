# Session Handover — Studio transition jumps fixed (shipped + pushed)

## Status

**Pushed live to `origin/main` on 2026-04-27.** Two commits in this stream:

- `17d9c57` — checkpoint: persistent page-header migration + animation coordination (everything from prior sessions, captured before the architectural refactor as a clean rollback target)
- `c642726` — fix studio transition jumps: page-header out of flow + sticky fades + scroll-snap timing

## What was shipped this round

The persistent `.page-header` was reflowing the document on every show/hide because `position: sticky` takes flow space — `[hidden]` toggles caused visible 3.5 rem jumps (down on open, up after close). Switched the header to `position: fixed` (out of flow) and reserved its visual space via `padding-top` on the entering page-wrapper, keyed to the container's own `data-level`. Three supporting fixes shipped alongside.

### Architectural refactor — `.page-header` out of flow

[studio/assets/css/studio.css](studio/assets/css/studio.css):
- `.page-header` → `position: fixed; top: 0; left: var(--sidebar-width); right: 0; z-index: 100`. Old `[data-sticky]` rule + mobile override removed.
- `body.is-sidebar-collapsed .page-header { left: var(--sidebar-collapsed-width) }` follows sidebar, with `transition: left var(--duration-s)`.
- Mobile: `.page-header { left: 0; top: var(--mobile-bar-height) }`; collapsed override forces `left: 0`.
- Wrapper space reservation: `[data-barba="container"][data-level="1|2"] > .page-wrapper { padding-top: var(--studio-bar-height) }` — same value desktop and mobile.
- `data-sticky` attribute remains in markup as a harmless no-op.

### Supporting fixes

- **Sticky-element fade** — extended the existing `.section-header is-animating` opacity fade to also cover `.toc-block`, `.share-block`, `.case-study-content-inner`. Same transformed-ancestor sticky bug, same patch. ([studio.css:798-810](studio/assets/css/studio.css#L798))
- **Scroll-snap timing** — apply leaving container's `transform: translateY(scrollY)` BEFORE `window.scrollTo(0, 0)`. Closes the 300–600 ms gap where the user could see the un-compensated home page snapped to top. ([studio-barba.js:429-432](studio/assets/js/studio-barba.js#L429))
- **Next-read morph** — `nextReadTop` now subtracts both `mobileBar.offsetHeight` AND `pageHeader.offsetHeight`. Card lands flush below the header where the entering article's `.article-lead` actually sits. ([studio-barba.js:411-414](studio/assets/js/studio-barba.js#L411))
- **Cleanup** — dropped redundant `pageHeader.style.transform = ""` from close `.then()`. The `after` hook handles it. ([studio-barba.js:514-519](studio/assets/js/studio-barba.js#L514))

## Shipped — sidebar logo wrapper (2026-04-30)

Wrapped the sidebar logo link (`.intro-block`) in a parent `<div class="intro-block-wrap">` across all 24 sidebar instances: 7 hand-authored L0/L1 pages + the L2 generator template + 16 regenerated L2 article and case study pages. The wrapper is a placeholder for future visual tuning — its CSS rule is currently empty (just a comment hook).

A 3D parallax hover effect with gradient backdrop was prototyped during the session and removed before commit. The wrapper div is the only retained residue. The static `a.intro-block:hover { opacity: 0.8 }` dim that was already in the file remains the only hover behavior.

User-side tweaks made during the session that are also in this commit:
- [studio/assets/css/studio.css](studio/assets/css/studio.css) — `.intro-block` padding tuned from `var(--space-6xl) var(--studio-gap)` → `var(--space-2xl) var(--space-xl)`
- `a.intro-block:hover` background-color: `transparent` → `var(--bg-faded-3)`

Files touched:
- 8 sidebar templates: index, services, about, contact, styleguide, 404, page-template, L2 generator layout
- 16 regenerated L2 pages under `studio/articles/` and `studio/work/`
- [studio/assets/css/studio.css](studio/assets/css/studio.css)
- [studio/assets/data/studio-content.json](studio/assets/data/studio-content.json) (manifest regen)

Known nit not addressed: [studio/index.html:279](studio/index.html#L279) `.case-study-card-title` has a duplicated `data-bd-faded` attribute. Browsers ignore the dup, kept as-is unless flagged.

---

## Shipped — sidebar pattern-b + featured feed overhaul (2026-04-27)

Sidebar pattern-b migration plus a featured-feed overhaul shipped together.

**Group 1 — sidebar tweaks the user made on `index.html`:**
- Removed `<p class="sidebar-intro">Interactive Advertising Agency</p>` from `.intro-block`
- `.sidebar-cta` content updated: "Start a project" → "About us", copy → "We are a brand and technology studio.", link text → "Learn more →"
- Note: `href="/contact.html"` on `.sidebar-cta` was kept (despite "About us / Learn more" label) — see open question below

**Group 2 — propagated those tweaks to all Pattern B pages:**
- [studio/cms/generator/templates/layout.html](studio/cms/generator/templates/layout.html) (canonical)
- [studio/about.html](studio/about.html), [studio/contact.html](studio/contact.html), [studio/services.html](studio/services.html)
- 12 L2 outputs regenerated via `npm run gen` (3 articles + 9 work)

**Group 3 — migrated three Pattern A holdouts to Pattern B sidebar wholesale:**
- [studio/404.html](studio/404.html)
- [studio/styleguide.html](studio/styleguide.html)
- [studio/templates/page-template.html](studio/templates/page-template.html)

These three previously used `.sidebar-about` (3-link nav: Work/Services/Contact, separate intro-block + sidebar-about, services-themed sidebar-slot). Now match Pattern B: 5-link nav (Home/Work/Services/About/Contact), sidebar-cta, real work-cards in sidebar-slot. Done via Node script that extracted the canonical aside from layout.html and replaced the aside block in each.

**Plus two earlier studio.css cleanups bundled into the same commit:**
- `.page-header` background-color: `var(--background-faded)` → `var(--background-primary)`
- Removed `background-color: pink;` debug rule from `article.article`

**Group 4 — featured feed overhaul:**
- Every article + case study flipped to `featured: true` (11 markdown edits) so the entire homepage feed renders with the existing featured card layout.
- 3 new placeholder articles added (`component-docs-that-dont-lie`, `when-utilities-outgrow-their-classes`, `the-smallest-design-system-that-works`) — Unsplash imagery, dummy body copy, slotted between case-study clumps for visual rhythm.
- Article dates rewritten so the date-sort interleaves articles with case-study clumps instead of pooling articles at the bottom.
- `thumbnail-ratio: "1:1"` on two articles (`naming-things`, `why-design-systems-fail`) for ratio variety. New `1:1` override added to [studio.css](studio/assets/css/studio.css#L1562) alongside the existing `9:16` override.
- `.post-client-label` introduced — client name moved out of `.post-meta` into a prominent label under the excerpt, styled like `.post-label`. White on featured cards.
- `.post-read-status` now `var(--white)` on featured cards.
- Accordion section added to [studio/styleguide.html](studio/styleguide.html) with both `multi` and `single` mode demos.
- `feed-variant` field documented on the README but unused — every entry still uses the `featured: true` short-circuit at [studio-feed.js:243](studio/assets/js/studio-feed.js#L243).

---

## 📋 Pick-up tasks for next session

In order of priority:

### 1. Decide the `.sidebar-cta` href question

The link currently points to `/contact.html` while the label reads "About us / Learn more →". Options:
- **Leave at `/contact.html`** — preserves current behaviour; "Learn more" is a soft CTA back to contact form.
- **Switch to `/about.html`** — matches the label semantically; "Learn more" leads to the about page.

Whichever you pick, applies to all 17 occurrences (1 in each hand-authored page + 1 in generator template; the L2 regenerated ones inherit from the generator).

### 2. Clean up dead `.sidebar-about*` CSS rules

After the migration, no markup uses `.sidebar-about` or `.sidebar-about-copy` anywhere. Orphaned rules in [studio.css](studio/assets/css/studio.css):
- L277 — `.intro-block:has(+ .sidebar-about:hover)::after`
- L306-336 — `.sidebar-about` block
- L338 — `.sidebar-about-copy`
- L481 — `.sidebar-about .sidebar-label`
- L644 — collapse-state rule
- L2043 — mobile collapse-state rule

Cleanup is safe — no markup or styleguide demo uses these. Keep `.sidebar-intro` rules though, since the styleguide's component table still demos that class.

### 3. Browser verification (10-step walkthrough, still pending from the polish round)

Run `npm run serve:studio` → http://localhost:2000/ and verify:

1. Home (any scroll) → article — no jump down at start; header slides in from above; converges at T=1200.
2. Article → home — header slides up, home settles cleanly with no upward jump at T=1200.
3. Article 1 → article 2 (next-read card) — card lands flush below the page-header; morph aligns.
4. Article 1 → article 2 (sidebar nav) — header doesn't move; eyebrow stays "Article".
5. Open article with TOC + share rails sticky-pinned, navigate away — TOC + share fade smoothly.
6. Open case study with sticky info panel, navigate away — info panel fades smoothly.
7. Sidebar collapse with header visible — header repositions smoothly.
8. Mobile — header below mobile bar; article content correctly padded; sticky elements fade.
9. Reduced motion — header appears/disappears instantly, no jank.
10. iOS Safari — `position: fixed` + address-bar collapse (real-device check).

### 4. Verify Pattern A → Pattern B migration in browser

The three migrated pages (`404.html`, `styleguide.html`, `templates/page-template.html`) need a visual check:
- Sidebar renders correctly (5-link nav, sidebar-cta, work cards)
- No layout breakage from the structural change (sidebar-inner wrapping changed)
- Styleguide page especially — many components share the page; verify nothing else broke
- 404 page on its own (visit a non-existent URL)
- Page-template is a developer reference — check it parses cleanly

### 5. Earlier-flagged code-smell items (not touched this round)

- **Case-study toggle race** ([studio-case-study.js](studio/assets/js/studio-case-study.js)) — global click handler can call `ScrollTrigger.refresh()` mid-transition. Add an `is-animating` guard.
- **Share-link listener accumulation** ([studio-article.js:130-155](studio/assets/js/studio-article.js#L130)) — listeners attached on each page enter, never removed. Use event delegation.
- **Multiple `ScrollTrigger.refresh()` calls** — redundant but not harmful.

## Tech debt deferred (raised by outsider review)

Recorded so they don't get lost — none blocking, all valid future improvements:

- **CSS-grid shell** — `<main>` could use `grid-template-rows: auto 1fr` with `.page-header` in row 1 instead of fixed + padding. Cleaner conceptually but introduces conditional row-sizing timing issues.
- **Rect-based morph targeting** — read the entering `.article-lead.getBoundingClientRect()` directly instead of subtracting offsets. Robust to any future top chrome (announcement bar, breadcrumb, sticky CTA).
- **"Don't scroll the window"** — the snap-then-compensate pattern is a smell. Cleaner: animate transforms only, never `window.scrollTo` during transitions.
- **Stop transforming the scroll container** — root architectural fix for sticky-children glitches. Would require an overlay technique. Current opacity fade is the pragmatic patch.

## Memory updates

- Updated `.claude/memory/project_studio_page_header.md` — current architecture (position: fixed, wrapper padding-top, animation coordination via WAAPI).
- Created `.claude/memory/feedback_layout_flow_reflow.md` — rule of thumb: avoid `[hidden]` on in-flow elements during transitions; default to fixed/absolute and reserve space via padding.
- Updated `.claude/memory/MEMORY.md` index.

## Plan files for reference

- This round (approved + shipped): `/Users/erlenmasson/.claude/plans/lets-make-a-plan-vast-leaf.md`
- Earlier sessions:
  - `/Users/erlenmasson/.claude/plans/transition-polish-pass.md` (superseded by the architectural refactor)
  - `/Users/erlenmasson/.claude/plans/page-header-transition-coordination.md` (animation coordination, captured in `17d9c57`)

## Quick orient for a fresh session

1. Read this file. Pay special attention to "Pick-up tasks for next session" — start there.
2. Read [.claude/memory/project_studio_page_header.md](.claude/memory/project_studio_page_header.md) for the page-header architecture.
3. Read [.claude/memory/feedback_layout_flow_reflow.md](.claude/memory/feedback_layout_flow_reflow.md) for the lesson on `[hidden]` reflow.
4. Run `git status` to see the uncommitted sidebar work — significant amount, intentional, ready for review + commit.
5. Most natural first move: walk pick-up task #1 (review + commit the sidebar batch) and #2 (decide the href question), then push.
