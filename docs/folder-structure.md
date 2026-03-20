---
title: "Folders"
subtitle: "File organization and directory structure"
description: "Guide defining where files live and why in the project structure."
section: "Project"
order: 4
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
- `brand-book/` → Brand identity tokens (customised per project)
- `templates/` → Component and page templates
- `docs/` → Documentation markdown source and generator
- `src/` → Source files (pages, JS)

## assets/

Single source of truth for all assets. No duplication.

- `css/style.css` → Site layout and component styles
- `css/markdown.css` → Markdown rendering styles (code blocks, tables, syntax highlighting)
- `fonts/` → Web fonts
- `icons/` → Favicons and app icons
- `images/` → Logos, Open Graph images, general images
- `video/` → Video assets

## design-system/

The design system framework. Contains all utility classes, layout primitives, components, and default tokens.

- `design-system.css` → Core design system stylesheet
- `index.html` → Styleguide preview (renders with default tokens)

## brand-book/

Brand identity tokens. Customise this per project. The design system reads these tokens via `var(--brand-*, fallback)`.

- `brand-book.css` → Brand tokens (fonts, colours)
- `index.html` → Brand preview page (logo, palette, typography, icons)

## src/

### src/js/
- JavaScript modules and scripts

### src/pages/
- HTML page files

## templates/

- `component-template.js` → JavaScript component template
- `component-template.css` → CSS component template
- `page-template.html` → HTML page template

## docs/

- Markdown documentation files (source of truth for generated HTML)
- `docs.config.js` → Project-specific doc settings (fonts, footer, description) — stays when generator is upgraded
- `generator/` → Documentation site engine (replaceable — drop in a new version to upgrade)
  - `template.html` → HTML template used for generation
  - `generate-docs.js` → Generator script (outputs HTML to project root)
  - `VERSION` → Current engine version

## CSS Loading Order

The generated HTML loads CSS in this order:

1. `design-system/design-system.css` → Framework tokens, utilities, layout primitives
2. `brand-book/brand-book.css` → Brand token overrides (fonts, colours)
3. `assets/css/markdown.css` → Markdown content rendering
4. `assets/css/style.css` → Site layout and components

New site-specific CSS goes in `assets/css/style.css`.

## Notes

Empty folders are tracked using `.gitkeep` to preserve structure in the template.

### Favicons

Favicons live in `assets/icons/`.

They are referenced directly in the HTML `<head>` and are treated as brand assets, not part of the design system.
