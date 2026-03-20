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

- `index.html` → Welcome page (replace with project homepage)
- `README.md` → Project overview and getting started
- `PROJECT_BRIEF.md` → Project brief and requirements
- `PROJECT_PROGRESS.md` → Progress tracker for ongoing work
- `CLAUDE.md` → Claude Code development rules (authoritative)
- `design-system/` → Design system framework (shared across projects)
- `brand-book/` → Brand identity tokens (customised per project)
- `templates/` → Component and page templates
- `docs/` → Documentation files and generator
- `src/` → Source files

## design-system/

The design system framework. Contains all utility classes, layout primitives, components, and default tokens.

- `design-system.css` → Core design system stylesheet
- `index.html` → Styleguide preview (renders with default tokens)

## brand-book/

Brand identity tokens. Customise this per project. The design system reads these tokens via `var(--brand-*, fallback)`.

- `brand-book.css` → Brand tokens (fonts, colours)
- `index.html` → Brand preview page (logo, palette, typography, icons)

## src/

### src/assets/
- `fonts/` → Web fonts
- `icons/` → Favicons and app icons
- `images/` → General image assets and Open Graph images
- `video/` → Video assets

### src/css/
- `style.css` → Project-specific styles (sits on top of the design system)

### src/js/
- JavaScript modules and scripts

### src/pages/
- HTML page files

## templates/

- `component-template.js` → JavaScript component template
- `component-template.css` → CSS component template
- `page-template.html` → HTML page template

## docs/

- Markdown documentation files
- `docs.config.js` → Project-specific doc settings (fonts, footer, description) — stays when generator is upgraded
- `generator/` → Documentation site engine (replaceable — drop in a new version to upgrade)
  - `VERSION` → Current engine version
  - `assets/` → Engine CSS (`docs.css`, `markdown.css`) — copied to `site/assets/` on generation
- `site/` → Generated HTML documentation
  - `assets/images/` → Project-specific logo and favicons — not overwritten by the generator

## Notes

Empty folders are tracked using `.gitkeep` to preserve structure in the template.

### Favicons

Favicons live in `src/assets/icons/`.

They are referenced directly in the HTML `<head>` and are treated as brand assets, not part of the design system.
