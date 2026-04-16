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

## Page transitions (Barba)

Studio uses **Barba 2.x** (loaded from CDN, no parent dependency) with a single hierarchy-aware transition based on a **three-level page model**.

### Page hierarchy

| Level | Pages | Role |
|---|---|---|
| **L0** | `index.html` | Home — the floor. Always conceptually beneath everything. Never moves. |
| **L1** | `about.html`, `work.html`, `contact.html` | Top-level destinations. Open over home, close down to reveal home. |
| **L2** | `work/case-study-*.html`, `articles/article-*.html` | Feed items (case studies, articles). Same opening / closing as L1, but L2 → L2 sibling navigation uses a special conveyor transition. |

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
| `work/mastercards-interactive-map.html` | `2` | `0` |
| `articles/naming-things.html` | `2` | `0` |

### Scenarios and transitions

The transition system separates **scenarios** (what's happening) from **animations** (what it looks like). `resolveScenario()` determines the scenario; `TRANSITION_MAP` near the top of `studio-barba.js` controls which animation runs for each scenario.

| From → To | Scenario | Default animation | What it looks like |
|---|---|---|---|
| **Home → anything** (L0 → L1 / L0 → L2) | `open` | `slide-up` | New page rises from the bottom; home scales down and dims underneath. |
| **Anything → home** (L1 → L0 / L2 → L0) | `close` | `slide-down` | Current page falls off the bottom; home scales back up and brightens. |
| **Non-home → non-home** (L1 ↔ L1, L2 ↔ L2, L1 ↔ L2) | `swap` | `conveyor-up` | **Conveyor**: old page rides off the top while the new page rises from the bottom in a single continuous upward sweep. |
| Same page or unknown | `fade` | `fade` | Crossfade fallback. |

**Swapping a transition:** change one line in `TRANSITION_MAP` (e.g. `open: "fade"`) and the scenario's visual changes globally. The animation always receives the scenario's motion token, so the timing stays correct regardless of which animation you map to it.

**Why one rule for all non-home transitions?** It's the simplest mental model: if you're not going to home and you're not coming from home, you're swapping siblings — conveyor handles all of those cases.

Reduced-motion users get instant swaps automatically via `prefers-reduced-motion: reduce`.

### Close button

Every non-home page has an X in the top-right of the main area. It's a real `<a href="index.html">` (computed relative to the current page so it works at any depth) that Barba intercepts and runs the `close` scenario. **Same code path as clicking "Home" in the sidebar** — no special close logic.

The close button:
- Is **injected once** by `studio.js` on init (no per-page HTML)
- Is **shown / hidden via CSS** based on `body[data-current-level]` (set on init from the initial Barba container, kept in sync by the `afterEnter` Barba hook)
- Has its `href` re-computed after every Barba navigation, so it always points to the right relative path back to `index.html`
- Falls back to a real navigation when JavaScript is disabled

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

## Deploying standalone

When the site is ready to ship as its own deployable project:

1. Copy `../assets/css/design-system.css` → `studio/assets/css/design-system.css`
2. Find/replace `../assets/css/` → `assets/css/` across `studio/**/*.html`
3. Copy any referenced images, fonts, and icons into `studio/assets/`
4. Confirm the Google Fonts `<link>` is still inline in every page

Barba is loaded from CDN, so there is **no JS dependency** on the parent project to copy. After the steps above, `studio/` is fully self-contained and can be deployed from its own root.
