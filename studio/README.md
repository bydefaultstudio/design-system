# Studio — By Default agency site

The By Default agency website. Marketing site, not a docs site.

This folder lives inside the BrandOS repo so it can share `assets/css/design-system.css` from the parent project. Everything else (HTML, studio CSS, JS, images, fonts, icons) is self-contained inside `studio/` so the folder can be lifted out and deployed standalone when ready.

## Structure

```
studio/
├── index.html                  # Home (the master feed, level 0)
├── work.html                   # Level 1, order 0
├── about.html                  # Level 1, order 1
├── contact.html                # Level 1, order 2
├── templates/
│   └── page-template.html      # Canonical page template — copy this for new pages
└── assets/
    ├── css/
    │   └── studio.css          # Layout system + page-transition styles
    ├── js/
    │   ├── studio.js           # Sidebar collapse, mobile drawer, active nav
    │   └── studio-barba.js     # Hierarchy-aware Barba page transitions
    ├── images/
    │   └── og/                 # Open Graph share images
    ├── fonts/                  # Custom web fonts (if any beyond Google Fonts)
    ├── icons/                  # Favicons + app icons
    └── svg-icons/              # SVG component icons
```

## CSS load order

Each page loads CSS in this order:

1. `../assets/css/design-system.css` — shared, foundation + core (read-only from studio)
2. `assets/css/studio.css` — studio-local, loads last so cascade overrides work

## Layout system

The layout is a **CSS Grid** with two columns and two rows:

```
┌──────────────┬────────────────────────────────┐
│              │  top bar                       │
│              ├────────────────────────────────┤
│   sidebar    │                                │
│              │  main (Barba container)        │
│              │                                │
└──────────────┴────────────────────────────────┘
```

- **Sidebar** is `position: sticky` and fills the left column full height. Hosts the logo, intro text, primary nav, and a footer slot with the collapse toggle.
- **Top bar** sits in the top-right cell — it spans the viewport width *minus* the sidebar, never full-width on desktop.
- **Main** is the bottom-right cell. Hosts the Barba wrapper and the per-page content.

CSS variables in `studio.css`:

```css
--sidebar-width: 280px;
--sidebar-collapsed-width: 64px;
--top-bar-height: 64px;
--mobile-drawer-width: min(85vw, 320px);
```

### Sidebar collapse (desktop)

Click the toggle in the sidebar footer → sidebar shrinks to a 64px icons-only rail. Labels hide; the `data-tooltip` attribute on each link shows a single-letter abbreviation. State is persisted in `localStorage` under the key `studio-sidebar-collapsed`.

### Mobile drawer (≤768px)

Below 768px the grid collapses to a single column. The sidebar becomes a fixed-position drawer that slides in from the left:

- **Hamburger button** in the top bar opens it
- **Backdrop** click closes it
- **Escape** key closes it
- **Body scroll** is locked while it's open
- After a Barba navigation finishes, the drawer auto-closes

### 12-column grid (opt-in)

Add `data-grid` to a `.section-content` to make it a 12-column CSS grid. Children declare their column span via `data-col-span="1..12"` and an optional start position via `data-col-start="1..12"`.

```html
<div class="section-content" data-grid>
  <div class="block" data-col-span="6">…</div>
  <div class="block" data-col-span="4" data-col-start="9">…</div>
  <div class="block">…</div> <!-- no attributes → full 12 cols, fresh row -->
</div>
```

- **Column gap**: `--studio-gap` (12px). **Row gap**: `--space-xl` (24px).
- A child without `data-col-span` defaults to full width (span 12).
- Auto-flow: a child with `data-col-span="4"` and no start drops at the next available slot. Two consecutive `data-col-span="4"` blocks land at columns 1–4 and 5–8, leaving 9–12 empty.
- Two children with the same `data-col-start` don't collide — grid auto-flow places them on consecutive rows in the same column track.
- Below 768px the grid collapses to a single column; spans and starts are ignored. Per-breakpoint span overrides aren't supported yet — add when a real use case appears.

## Page transitions (Barba)

Studio uses **Barba 2.x** (loaded from CDN, no parent dependency) with a single hierarchy-aware transition based on a **three-level page model**.

### Page hierarchy

| Level | Pages | Role |
|---|---|---|
| **L0** | `index.html` | Home — the floor. Always conceptually beneath everything. Never moves. |
| **L1** | `about.html`, `services.html`, `products.html`, `contact.html`, `styleguide.html` | Top-level destinations. Rise over home (`enter`), drop down to reveal home (`exit`). |
| **L2** | `work/*.html`, `articles/*.html` | Feed items (case studies, articles). Same enter/exit as L1; L2 → L2 sibling navigation uses `swap`. The article next-read card uses `advance` (a frozen continuous-reading push). |

Every Barba container declares its level via `data-level` and its position via `data-order`:

```html
<div data-barba="container"
     data-barba-namespace="work"
     data-level="1"
     data-order="0"
     data-page-title="Work — By Default"
     data-page-description="...">
```

Current pages:

| Page | `data-level` | `data-order` |
|---|---|---|
| `index.html` | `0` | `0` |
| `about.html` | `1` | `1` |
| `contact.html` | `1` | `2` |
| `products.html` | `1` | `4` |
| `work/*.html` (case studies) | `2` | per front-matter |
| `articles/*.html` | `2` | per front-matter |

L2 pages are generated; the generator fills `data-level` / `data-order` from front-matter.

### Architecture (read before touching the transition code)

The whole transition system rests on **one invariant**:

> `[data-barba="container"]` is **never** transformed, **never** `position:absolute`, and **never** carries an opaque `background`. A single inner **`[data-barba-stage]`** wrapper is the **only** transformed node, and the opaque page background lives on **`.page-wrapper`** (inside the stage), so it rides the transform with the content.

Consequences that have each been a real bug when violated:

- **Transforms target `stageOf(container)`** = `container > [data-barba-stage]` (falls back to the container only if the wrapper is missing — every page must have the wrapper). Transforming the container makes it the containing block for its `position:fixed`/`sticky` descendants, which then snap.
- **Background must be on `.page-wrapper`, not the container.** The container never moves; an opaque background on it (or on the leaving-pin rule) sits static over the `.page-overlay` during `enter` and over home during `exit` — the page reads as "no overlay / no home underneath". `.main` / `.layout` are the opaque backstop beneath everything.
- **The leaving container is pinned `position:fixed`** (CSS-scoped to `[data-studio-role="leave"]`, set atomically in the `before` hook) so the entering page stays in flow and never reflows. Scroll is never zeroed while a page is still visible.
- The hard-refresh loading curtain (`bd-intro.js`) and the GSAP/ScrollTrigger system (`bd-animations.js`) are independent; never `ScrollTrigger.refresh()` with a live stage transform.

### Scenarios and the transition factory

`resolveScenario(fromEl, toEl)` reads the two containers' `data-level` and returns one of **five scenarios**. There is **no `TRANSITION_MAP`** — a single `buildTransition(scenario, data, opts)` factory builds one GSAP timeline per navigation from the **`SCENARIOS` descriptor table** near the top of `studio-barba.js`. Each descriptor is `{ motion, shape, header }`.

| Trigger | Scenario | Shape | Motion token | What it looks like |
|---|---|---|---|---|
| **Home → anything** (L0 → L1/L2) | `enter` | `rise` | `--motion-page-open` | Entering stage lifts up from the bottom + scales in; `.page-overlay` dims home beneath. |
| **Anything → home** (L1/L2 → L0) | `exit` | `drop` | `--motion-page-close` | Leaving stage falls away; home scales/brightens in behind. |
| **Non-home → non-home** (L1↔L1, L2↔L2, L1↔L2) | `swap` | `rise` | `--motion-page-swap` | Same shape as `enter`. The case-study slider uses this (standard lateral move). |
| **Article next-read card** | `advance` | `push` | `--motion-page-swap` | **Frozen geometry**: the leaving article slides up so the next article's title lands where the card title was. Side sticky chrome rides up with it. |
| Same URL / unknown | `fade` | `fade` | `--motion-page-fade` | True crossfade fallback. |

Notes:

- **Token names are unchanged** (`--motion-page-open/close/swap/fade`); only the scenario identifiers are `enter/exit/swap/advance/fade`. Timing always comes from the scenario's motion token (see [`cms/motion.md`](../../cms/motion.md)) — no hardcoded durations/easings.
- **`exit` strip-clips the leaving stage** (a static, paint-only `clip-path: inset(...)` on the stage, `drop` only) so a deep-scrolled page can't whip its above-scroll content into view as it falls. The clip is captured pre-pin and only applied when scrolled.
- **Page-header choreography** is folded into the same timeline: `enter/exit/swap` run it **serially** — OUT fully → page transition → eyebrow text swap → IN; `advance/fade` swap the eyebrow **instantly** (continuous-reading feel).
- **Reduced motion**: a single guard in `buildTransition` returns a `duration:0` state-only timeline — instant swap, sticky chrome correct, no per-scenario branches.

To change a scenario's feel, edit its row in the `SCENARIOS` table (shape / header / motion) — never add per-scenario builder functions or a map.

### Close button

Every non-home page has a close control in the persistent **`.page-header`** bar (`<a id="studio-close-btn" class="close-btn" href="index.html">`, the path written relative to the page's depth). It is **real per-page HTML** inside `.page-header` (not injected by JS); Barba intercepts the click and runs the `exit` scenario. **Same code path as clicking "Home" in the sidebar** — no special close logic. The eyebrow text + close bar are part of the serial header choreography above, and the bar falls back to a real navigation when JavaScript is disabled.

### What's inside the Barba container, what's outside

**Outside** the Barba container (sidebar, top bar, page close button): rendered once per full page load, never re-renders, never flickers across navigations.

**Inside** the Barba container (everything inside `<div data-barba="container">`): swapped on every navigation. This is where your page-specific content lives.

## Contact form

[`contact.html`](contact.html) is a standard L1 page with an inline contact form. It navigates via Barba like any other page — clicking Contact in the sidebar or the top-bar CTA slides the page up from home.

The submit handler in [studio.js](assets/js/studio.js) is currently a **placeholder**. It console-logs the form data and shows a success message. To wire a real backend, replace the body of `handleContactFormSubmit()` with a `fetch()` to your endpoint (Netlify Forms, Formspree, custom).

## Feed (home page)

The home page is the master feed — a mixed grid of content items (currently case studies + articles, more types possible later). Each card declares its type and date via data attributes so future filtering / sorting / category UI can hook in without changing the markup:

```html
<div class="grid gap-xl" data-feed>
  <a href="work/case-study-foo.html"
     class="post"
     data-feed-type="case-study"
     data-feed-date="2026-04-01">
    <span class="post-label">Case study</span>
    <h3 class="post-title">Title</h3>
    <p class="post-excerpt">Short summary…</p>
  </a>
</div>
```

### Class names

| Class | Purpose |
|---|---|
| `.post` | Individual feed item (the `<a>`) |
| `.post-label` | Small uppercase type label ("Case study", "Article", …) |
| `.post-title` | Item title (`<h3>`) |
| `.post-excerpt` | Short summary paragraph |

The feed container uses the design system's `.grid` utility (2 columns by default, collapses to 1 on mobile) with `.gap-xl` for spacing.

### Data attributes

| Attribute | Values | For |
|---|---|---|
| `data-feed` (on container) | — | Feed container marker for future filter/sort JS |
| `data-feed-type` | `case-study`, `article`, … | Filter by type |
| `data-feed-date` | ISO date `YYYY-MM-DD` | Sort by date |

Adding a new content type (e.g. `talk`, `video`) only needs:
1. A new card with `data-feed-type="talk"`
2. A `.post[data-feed-type="talk"] .post-label { … }` rule in `studio.css` for the accent color

Filtering and sorting UI will land in the top bar later — that's why the top bar currently sits empty next to the "Get in touch" CTA.

## Adding a new page

1. Copy `templates/page-template.html` to `studio/<page>.html`.
2. Update the head: `<title>`, `<meta name="description">`, canonical, OG, and Twitter tags.
3. On the Barba container, set:
   - `data-barba-namespace="<page>"`
   - `data-level` (`0` for home, `1` for everything else)
   - `data-order` (next free number within the level)
   - `data-page-title` (matches `<title>`)
   - `data-page-description` (matches `<meta name="description">`)
4. Replace the `<section>` content with your page content.
5. Add the page to the sidebar `<nav>` in **every** existing page (including the new one and `templates/page-template.html`). The sidebar markup is currently inlined per page — when the nav grows past ~10 links, consider extracting it into a JS injection helper.

## Conventions

- Follow the layout hierarchy from [CLAUDE.md](../CLAUDE.md) §4 inside the Barba container: `section → padding-global → container → block`. The `page-wrapper` and `page-content` slots are replaced by `.layout` + `.main` here.
- Use semantic design system tokens, never primitives.
- New CSS goes in `assets/css/studio.css`. Anything genuinely reusable belongs in the parent `assets/css/design-system.css` instead.
- JS follows [cms/js-code-structure.md](../cms/js-code-structure.md): named functions, one `console.log` at the top, init inside `DOMContentLoaded`, no globals (only `studioRefreshActiveNav` is exposed for Barba to call).
- **Aspect ratios** — apply `data-ratio="W:H"` to any element to set its aspect ratio (e.g. `data-ratio="16:9"`). Available ratios: `1:1`, `4:3`, `3:2`, `16:9`, `21:9`, `4:5`, `9:16`. Defined globally at the bottom of `assets/css/studio.css`. Components set their own default `aspect-ratio`; `data-ratio` overrides it.

### Scroll-state body class

`assets/js/studio-scroll-state.js` adds `is-scrolling` to `<body>` while the user is actively scrolling, and removes it 500ms after scrolling stops. Any element can opt into "visible only while scrolling" with two CSS rules — no per-component scroll listener needed:

```css
.my-overlay {
  opacity: 0;
  transition: opacity var(--duration-xs) var(--ease-out);
}
body.is-scrolling .my-overlay {
  opacity: 1;
}
```

The listener is registered once at `DOMContentLoaded` on `window`, so it survives Barba page transitions automatically (Barba only swaps `[data-barba="container"]`). Don't re-bind it in `afterEnter` — that would stack listeners.

First consumer: `.case-study-card-logo` on the home page case-study cards (`studio/index.html`), revealing the brand mark over the case study media while the user scrolls.

### Section naming convention

Every `<section>` inside the Barba container must have a class following **`{page}-{role}`**:

- **`{page}`** matches `data-barba-namespace` on the container (e.g. `home`, `about`, `services`, `contact`, `article`, `case-study`)
- **`{role}`** describes the section's purpose — not its appearance

**Standard roles:**

| Role | Meaning |
|---|---|
| `header` | Intro/hero area at the top |
| `hero` | A visual hero (image, video) distinct from the header |
| `body` | Main content area |
| `footer` | Closing CTA or sign-off section |
| `feed` | Content listing/grid |
| `wrapper` | Page-level div wrapping all sections (when needed) |

Roles are extensible — add new ones when a section doesn't fit. Name the purpose, not the look.

**Examples:** `home-header`, `home-hero`, `home-feed`, `about-header`, `about-services`, `services-formats`, `article-header`, `case-study-body`.

## Deploying standalone

When the site is ready to ship as its own deployable project:

1. Copy `../assets/css/design-system.css` → `studio/assets/css/design-system.css`
2. Find/replace `../assets/css/` → `assets/css/` across `studio/**/*.html`
3. Copy any referenced images, fonts, and icons into `studio/assets/`
4. Confirm the Google Fonts `<link>` is still inline in every page

Barba is loaded from CDN, so there is **no JS dependency** on the parent project to copy. After the steps above, `studio/` is fully self-contained and can be deployed from its own root.
