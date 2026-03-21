# Project Progress

Track what's been done and what still needs doing across sessions.

---

## Design System / Brand Book Separation

The core restructure: split the monolithic `src/css/design-system.css` into two independent projects that work in conjunction.

### Architecture Decisions
- **Conjunction pattern**: brand-book defines `--brand-*` tokens, design system reads them via `var(--brand-*, fallback)`. Load order doesn't matter.
- **Three projects inside master**: design-system, brand-book, docs — each with its own index.html preview
- **Master project is the template**: clone it per client, customise the brand book, build pages in `src/`
- **Brand book is tokens only**: no component overrides. Defines fonts, colours, logo, iconography.
- **Assets stay in `src/`**: brand-book only contains CSS and its index.html preview. All images, favicons, etc. remain in `src/assets/`.

### Completed
- [x] Create `design-system/` folder with `design-system.css` (conjunction pattern with `var(--brand-*, fallback)`)
- [x] Create `design-system/index.html` — full styleguide with all sections (colors, typography, buttons, forms, callouts, blocks/gaps, grid, borders, containers, max-width, section spacing)
- [x] Create `brand-book/` folder with `brand-book.css` (brand tokens using `--brand-` prefix)
- [x] Create `brand-book/index.html` — brand preview page (logo, palette, typography, icons)
- [x] Update `templates/page-template.html` to load both CSS files
- [x] Update `docs/docs.config.js` with new paths
- [x] Update `docs/generator/template.html` with new paths
- [x] Remove old `styleguide/` folder
- [x] Remove old `ds-files/` folder
- [x] Remove old `src/css/design-system.css`
- [x] Remove old `src/css/brand.css`
- [x] Add disabled button state (`:disabled` styling)
- [x] Add form elements to design system (inputs, textarea, select, checkbox, radio, fieldset)
- [x] Add callout/alert components to design system (note, tip, warning, caution, important)

### To Do
- [x] Delete orphaned doc site pages (architecture.html, components-utilities.html, design-system.html, development-standards.html, layout-primitives.html, quick-reference.html)
- [x] Update `docs/setup.md` — references `src/css/design-system.css`, needs to reference `brand-book/brand-book.css`
- [x] Update `docs/folder-structure.md` — still lists `styleguide/`, `src/css/`, old structure
- [x] Update `docs/upgrading-docs.md` — references `src/css/design-system.css` convention, stale config example
- [x] Update `CLAUDE.md` — references `src/css/design-system.css` as single source of truth
- [x] Regenerate docs after all md updates
- [x] Add smooth scroll for anchor links in docs site (already existed in docs.css)
- [ ] Commit all changes and push to GitHub
- [x] Set up VS Code Live Server to serve from project root (`.vscode/settings.json`)
- [x] Set up GitHub Codespaces / Dev Container configuration (`.devcontainer/devcontainer.json`)

---

## Future Work (Not Started)

These items were discussed but explicitly deferred. CSS/HTML only — no JavaScript.

### Design System CSS — Elements to Add
- [ ] Code snippets (`<code>`, `<pre>`, `<kbd>`)
- [ ] Tables (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- [ ] Horizontal rules (`<hr>`)
- [ ] Details/summary (`<details>`, `<summary>`)
- [ ] Definition lists (`<dl>`, `<dt>`, `<dd>`)
- [ ] Badges / tags (small inline labels)
- [ ] Breadcrumbs
- [ ] Pagination
- [ ] Progress bars
- [ ] Tooltips (CSS-only)
- [ ] Cards (content container pattern)
- [ ] Tabs (CSS-only with radio inputs)
- [ ] Accordion (CSS-only with checkbox/details)
- [ ] Avatar / profile image circles
- [ ] Dividers (horizontal/vertical)
- [ ] Skeleton loading placeholders

### Brand Book Enhancements
- [ ] Logo usage guidelines section in brand-book/index.html
- [ ] Iconography preview section
- [ ] Brand dos/don'ts section

---
