---
title: "Components"
subtitle: "Component specification and build rules"
description: "Master specification for all design system components — naming, tokens, accessibility, and build process."
section: "Docs"
subsection: "Dev"
order: 20
status: "published"
access: "team"
client: "internal"
---

This document defines the rules and conventions for building components in the By Default design system. All contributors must follow these patterns to keep the system consistent and predictable.

---

## Naming convention

- **Base class:** `.component-name` (e.g. `.badge`, `.card`, `.toast`)
- **Modifiers:** `.component-name--modifier` (e.g. `.badge--success`, `.card--flush`)
- **State classes:** `.is-state` (e.g. `.is-active`, `.is-open`, `.is-disabled`, `.is-hidden`, `.is-loading`) — shared across components
- **Utility overrides:** use `!important` only on utility classes (e.g. `.gap-m`)
- **JS hooks:** use `data-*` attributes, never CSS class names

**Legacy note:** The button component uses `.is-outline`, `.is-faded`, `.is-small`, `.is-xsmall`, `.is-icon` as modifiers. These predate the `--modifier` convention and are kept for backward compatibility. New components must use `--modifier` syntax.

---

## Token rule

Every visual value in component CSS must reference a CSS custom property defined in `:root`. Never hardcode hex values, pixel values (except structural ones like `border-radius: 50%`), or raw font values.

Component tokens follow this pattern:
```css
--component-property: var(--semantic-token);
```

Example:
```css
--card-background: var(--background-primary);
--card-border: var(--border-faded);
--card-radius: var(--radius-m);
--card-padding: var(--space-xl);
```

---

## File rule

| What | Where |
|------|-------|
| Component CSS | `assets/css/design-system.css` under a numbered section heading |
| Component JS (if needed) | `assets/js/component-name.js` |
| Documentation source | `cms/component-name.md` |
| Generated docs page | `design-system/component-name.html` |

Section headings in `design-system.css` follow the format:
```css
/* ------ 16. BADGE ------ */
```

---

## Accessibility rule

Every interactive component must include:

| Requirement | Details |
|-------------|---------|
| ARIA roles | Correct `role` attribute (e.g. `role="tablist"`, `role="tab"`, `role="tabpanel"`) |
| ARIA attributes | `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-current`, `aria-label` as needed |
| Keyboard support | Tab to focus, Enter/Space to activate, Escape to dismiss (where applicable), Arrow keys for navigation (tabs, menus) |
| Focus indicator | `box-shadow: 0 0 0 2px color-mix(in srgb, var(--input-focus), transparent 75%)` |
| Screen reader text | Use `aria-label` or visually hidden text for icon-only actions |

---

## Component status

| Component | CSS class | Needs JS | Docs page |
|-----------|-----------|----------|-----------|
| Button | `.button` | No | `button.md` |
| Form elements | `.form-group`, `.form-check`, `.form-toggle`, `.segmented-control` | No | `form.md` |
| Callout | `.callout` | No | `callout.md` |
| Disclosure | `details`/`summary` | No | `disclosure.md` |
| Badge | `.badge` | No | `badge.md` |
| Card | `.card` | No | `card.md` |
| Breadcrumb | `.breadcrumb` | No | `breadcrumb.md` |
| Tabs | `.tabs`, `.tab` | Yes (`tabs.js`) | `tabs.md` |
| Progress | `.progress-bar` | No | `progress.md` |
| Tooltip | `[data-tooltip]` | No | `tooltip.md` |
| Toast | `.toast` | Yes (`toast.js`) | `toast.md` |
| Code / Pre / Kbd | `code`, `pre`, `kbd` | No | `code.md` |
| Mark / Abbr / Figure | `mark`, `abbr`, `figure` | No | `mark.md` |

---

## Dark mode rule

Components must **not** contain dark-mode-specific CSS. They rely entirely on semantic token overrides in `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)`.

The only exception is when a component uses brand-palette tokens directly (avoid this). If unavoidable, add the override to both the `[data-theme="dark"]` block and the `@media` fallback block.

Current exceptions:
- `mark` element — uses `--yellow-light` via `--mark-background` token, requires dark mode override
- Scrollbar — uses neutral scale tokens directly, requires dark mode override

---

## How to add a new component

1. **Define tokens** in `:root` (in `design-system.css`, after existing component tokens):
   ```css
   /* -- Component tokens -- */
   --component-property: var(--semantic-token);
   ```

2. **Add dark mode overrides** if the component uses non-semantic tokens — add to both `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)` blocks.

3. **Write CSS** in `design-system.css` under a new numbered section:
   ```css
   /* ------ N. COMPONENT NAME ------ */
   ```

4. **Write JS** (only if needed) in `assets/js/component-name.js`. Follow the existing pattern: IIFE, named functions, version logged to console.

5. **Write documentation** in `cms/component-name.md` following the standard frontmatter and content structure.

6. **Update this spec file** — add the component to the status table above.

7. **Regenerate docs:**
   ```bash
   cd cms/generator && npm run docgen
   ```
