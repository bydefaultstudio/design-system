---
title: "Iconography"
subtitle: "Icon usage, sizing, and integration guidelines"
description: "How to use icons in the design system — SVG standards, wrapper classes, accessibility, and tooling."
section: "Design System"
order: 7
access: "team"
---

Icons are inline SVG elements wrapped in a container class. They inherit colour from the surrounding text, maintain a fixed square aspect ratio, and are accessible by default.

---

## Principles

- **Inline SVG only** — never use `<img>` tags for icons. Inline SVGs allow colour inheritance and eliminate extra HTTP requests.
- **`currentColor` always** — all icon `<path>` elements must use `fill="currentColor"` so the icon inherits the parent's text colour. This keeps icons visually consistent across themes and contexts.
- **No `xmlns`** — strip `xmlns` and `xmlns:xlink` attributes from inline SVGs. They are only needed for standalone `.svg` files, not inline usage.
- **Square aspect ratio** — icons are always 1:1. Use `viewBox` to define the coordinate system, not `width`/`height`.

---

## Icon Wrapper

Use `.icn-svg` to wrap inline SVG icons. This class constrains the icon to a fixed size and enforces the square aspect ratio.

```html
<div class="icn-svg" data-icon="arrow-right">
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" fill="currentColor"/>
  </svg>
</div>
```

### Properties

| Property | Value | Purpose |
|---|---|---|
| `width` | `1.5rem` | Standard icon size |
| `height` | `1.5rem` | Matches width for square |
| `display` | `flex` | Enables centering |
| `justify-content` | `center` | Horizontal centering |
| `align-items` | `center` | Vertical centering |
| `aspect-ratio` | `1 / 1` | Enforces square shape |

### `data-icon` attribute

Always include a `data-icon` attribute with a descriptive name. This makes icons identifiable in code — raw SVG paths are unreadable without it.

```html
<div class="icn-svg" data-icon="chevron-down">...</div>
<div class="icn-svg" data-icon="close">...</div>
<div class="icn-svg" data-icon="search">...</div>
```

Use lowercase kebab-case for icon names (e.g. `arrow-right`, `chevron-down`, `external-link`).

---

## Icon in Buttons

For icon-only buttons, use `.is-icon` on the button and `.icn-svg` as the SVG wrapper.

```html
<button class="button is-icon" aria-label="Close">
  <div class="icn-svg">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" fill="currentColor"/>
    </svg>
  </div>
</button>
```

See the [Button documentation](button.html) for full button modifier details.

---

## SVG Requirements

Every icon SVG must follow these rules before being added to the codebase:

| Rule | Required | Example |
|---|---|---|
| `fill="currentColor"` | Yes | Inherits text colour from parent |
| `viewBox` attribute | Yes | `viewBox="0 0 24 24"` defines the coordinate space |
| No `xmlns` | Yes | Strip `xmlns` and `xmlns:xlink` — not needed inline |
| `width="100%" height="100%"` | Yes | SVG fills its `.icn-svg` wrapper; sizing is controlled by the wrapper class |
| `fill="none"` on `<svg>` | Yes | Prevents default black fill; paths use `fill="currentColor"` individually |
| No XML comments | Recommended | Remove `<!-- ... -->` comments for cleaner code |

### Standard `viewBox`

Use `0 0 24 24` as the default icon grid. If an icon uses a different coordinate system, preserve its original `viewBox` — do not rescale manually.

---

## Accessibility

- **Decorative icons** — add `aria-hidden="true"` to the SVG when the icon is purely visual and accompanied by text.
- **Meaningful icons** — add `aria-label` to the parent element (e.g. the button) when the icon conveys meaning without visible text.
- **Icon buttons** — always include `aria-label` on the `<button>` element.

```html
<!-- Decorative: icon next to text -->
<div class="icn-svg" data-icon="check">
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" fill="currentColor"/>
  </svg>
</div>

<!-- Meaningful: icon button with no visible text -->
<button class="button is-icon" aria-label="Close menu">
  <div class="icn-svg">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" fill="currentColor"/>
    </svg>
  </div>
</button>
```

---

## Colour

Icons inherit colour through `currentColor`. To change an icon's colour, change the text colour of its parent — never hardcode a fill value.

```html
<!-- Icon inherits the faded text colour -->
<div class="text-faded">
  <div class="icn-svg" data-icon="info">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
    </svg>
  </div>
</div>
```

---

## SVG Cleaner Tool

Use the [SVG Cleaner](../svg-cleaner/index.html) to prepare icons before adding them to the codebase. The tool automates the required cleanup:

- Strips `xmlns` attributes
- Sets fills to `currentColor` (when enabled)
- Wraps in `.icn-svg` with `data-icon` attribute (when "Icon" is checked)
- Strips XML comments
- Optional minification

For CLI usage:

```bash
echo '<svg>...</svg>' | node svg-cleaner/svg-clean.js --current-color --icon --icon-name arrow-right --strip-comments
```

---

## Naming Conventions

| Convention | Example |
|---|---|
| Lowercase kebab-case | `arrow-right`, `chevron-down` |
| Describe the shape, not the function | `arrow-right` not `go-forward` |
| Use directional suffixes | `chevron-up`, `chevron-down`, `chevron-left` |
| Use common icon vocabulary | `close`, `search`, `menu`, `check`, `plus`, `minus` |

---

## Rules

| Do | Don't |
|---|---|
| Use `fill="currentColor"` on all paths | Hardcode hex colours in SVG fills |
| Use `.icn-svg` to wrap all icons | Use `<img>` tags for icons |
| Include `data-icon` with a descriptive name | Leave icons unnamed |
| Include `aria-hidden="true"` on decorative icons | Omit accessibility attributes |
| Include `aria-label` on icon-only buttons | Rely on the icon alone to convey meaning |
| Use the SVG Cleaner to prepare icons | Manually edit SVG attributes |
| Strip `xmlns` from inline SVGs | Keep attributes meant for standalone files |
| Use `width="100%" height="100%"` on SVGs | Use fixed pixel/rem sizes on the SVG element |
| Use `fill="none"` on the `<svg>` element | Omit `fill` on `<svg>` (defaults to black) |
| Use `.icn-svg` wrapper to control icon size | Size icons via `width`/`height` on the SVG |
