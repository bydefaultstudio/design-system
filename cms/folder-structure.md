---
title: "Folders"
subtitle: "File organization and directory structure"
description: "Guide defining where files live and why in the project structure."
section: "Docs"
layer: "app"
subsection: "Dev"
order: 2
status: "published"
access: "admin"
client: "internal"
---

This document defines where files live and why.

Do not add new top-level folders without updating this file.

## Root Level

- `index.html` → Generated docs hub (homepage)
- `*.html` → Generated documentation pages (flat at root)
- `README.md` → Project overview and getting started
- `PROJECT_BRIEF.md` → Project brief and requirements
- `PROJECT_PROGRESS.md` → Progress tracker for ongoing work
- `CLAUDE.md` → Claude Code development rules (authoritative)
- `assets/` → All project assets (CSS, fonts, icons, images, video)
- `design-system/` → Design system framework (shared across projects)
- `brand-book/` → Brand preview page (brand tokens now live in `assets/css/design-system.css`)
- `templates/` → Component and page templates
- `cms/` → Documentation markdown source and generator
- `tools/` → Live tool apps (CPM calculator, SVG cleaner, display ad preview)
- `src/` → Source files (pages, JS)
- `themes/` → Client theme overrides (one CSS file per client)
- `cdn/` → Webflow project code (JS + CSS served via CDN)

## assets/

Single source of truth for all assets. No duplication.

- `css/design-system.css` → Core design system framework (tokens, utilities, layout primitives)
- `css/style.css` → Site layout, component styles, and markdown content rendering
- `js/auth.js` → Authentication module (Netlify Identity)
- `js/auth-config.js` → Auth role hierarchy and settings
- `js/theme-config.js` → Theme registry (maps clientFolder → CSS path + Google Fonts URL)
- `js/theme-loader.js` → Dynamic theme loading/unloading module
- `fonts/` → Web fonts
- `icons/` → Favicons and app icons
- `images/` → All images, organised by type:
  - `logos/` → Site and publication logos
  - `og/` → Open Graph social sharing images
  - `illustrations/` → Decorative and UI illustrations
  - `svg-icons/` → SVG component icons
- `video/` → Video assets

## design-system/

The design system styleguide preview.

- `index.html` → Styleguide preview (renders with default tokens)

The design system CSS (`assets/css/design-system.css`) lives in the assets folder alongside other stylesheets.

## brand-book/

Brand preview page. Brand tokens now live directly in `assets/css/design-system.css`.

- `index.html` → Brand preview page (logo, palette, typography, icons)

## themes/

Client theme overrides. Each file overrides design system semantic tokens and the neutral colour scale for a specific client brand. Themes are loaded dynamically by `theme-loader.js` based on the user's auth identity.

- `theme-template.css` → Starter template (copy and customise per client)

Register themes in `assets/js/theme-config.js`. See [Setup — Client Theming](setup.md#client-theming) for usage.

## cdn/

JavaScript and CSS files served to Webflow projects via CDN (jsdelivr). Each subfolder represents a Webflow site. Global scripts shared across sites live in `assets/js/bd/`.

- `studio/` → By Default agency website (bydefault.studio)
  - `js/` → Page-specific scripts (homepage, hero, blog, case study, etc.)
  - `css/` → Page-specific styles (hero section)
- `fifa-wc26/` → FIFA World Cup 2026 interactive stadium map
  - `js/` → Map script
- `la-interactive-map/` → LA interactive map
  - `js/` → Map script

Additional project folders can be added as needed. Project overview docs are generated to `projects/` from `cms/projects-*.md`.

## src/

### src/js/
- JavaScript modules and scripts

### src/pages/
- HTML page files

## templates/

- `component-template.js` → JavaScript component template
- `component-template.css` → CSS component template
- `page-template.html` → HTML page template

## cms/

- Markdown documentation files (source of truth for generated HTML)
- `docs.config.js` → Project-specific doc settings (fonts, footer, description) — stays when generator is upgraded
- `clients/` → Client-specific markdown documentation (one subfolder per client)
- `generator/` → Documentation site engine (replaceable — drop in a new version to upgrade)
  - `template.html` → HTML template used for generation
  - `generate-docs.js` → Generator script (outputs HTML to project root)
  - `VERSION` → Current engine version

## CSS Loading Order

The generated HTML loads CSS in this order:

1. `assets/css/design-system.css` → Brand tokens, framework tokens, utilities, layout primitives
2. `themes/client-name.css` → Client theme overrides (optional)
3. `assets/css/style.css` → Site layout, components, and markdown content rendering

New site-specific CSS goes in `assets/css/style.css`.

## tools/

Live tool apps. Each tool is a standalone HTML page.

- `cpm-calculator.html` → CPM & Spend Calculator
- `svg-cleaner.html` → Browser-based SVG cleaner UI
- `display-ad-preview.html` → Celtra ad preview sandbox

The SVG cleaner CLI script lives at `assets/js/svg-clean.js`.

## Notes

Empty folders are tracked using `.gitkeep` to preserve structure in the template.

### Favicons

Favicons live in `assets/icons/`.

They are referenced directly in the HTML `<head>` and are treated as brand assets, not part of the design system.
