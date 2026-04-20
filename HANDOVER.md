# Session Handover — Case Study Layout

## What was built

Two-panel toggle layout for studio case study pages:

- **Visual mode (default):** Header (client eyebrow, title, synopsis, service tags) + full-width visuals
- **Info mode (toggled):** Visuals shrink to 50%, text content slides in from the right with 800ms cubic-bezier transition
- **Fixed toggle button:** Appears bottom-right when header button scrolls out of view. Created dynamically by JS outside Barba container (same pattern as close button).
- **Sticky info panel:** `position: sticky` with JS-calculated `top` value based on content height vs viewport height

## Key files

- `studio/cms/generator/templates/case-study-inner.html` — HTML template
- `studio/cms/generator/lib/render-page.js` — template variable rendering
- `studio/cms/generator/generate-studio.js` — body splitting at `---` divider
- `studio/assets/css/studio.css` — all `.cs-*` styles under `/* ------ CASE STUDY ------ */`
- `studio/assets/js/studio-case-study.js` — toggle, sticky, fixed button (v0.3.0)
- `studio/assets/js/studio-barba.js` — calls `window.initCaseStudy` in the `after` hook

## Architecture decisions

- **Markdown splitting:** `---` in body separates visuals (above) from info text (below). No divider = no toggle.
- **Fixed button:** Dynamic DOM creation via `ensureFixedToggleWrap()`, appended to `.main` outside Barba container
- **Icon sync:** `body.is-cs-open` class drives CSS icon swap on both header and fixed buttons
- **Sticky:** `overflow: clip` (not `hidden`) on `.cs-content` — `hidden` breaks sticky
- **Script loading:** `studio-case-study.js` included on ALL pages (L0/L1/L2) for Barba navigation

## Commits

- `08fe6ef` — initial case study layout (template, generator, CSS, toggle, placeholders)
- **Uncommitted** — overflow:clip fix, separate JS file, fixed button wrap, body.is-cs-open, script tags on all pages

## Outstanding

1. **Sticky info panel** — needs real-world testing with varied content lengths
2. **Console logs** — verbose debug logs still in `studio-case-study.js`, remove once confirmed working
3. **Uncommitted changes** — need committing
4. **Rapid toggle edge cases** — guards in place but not stress-tested
