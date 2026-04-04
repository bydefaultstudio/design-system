---
title: "Iconography"
subtitle: "Icon usage, sizing, and integration guidelines"
description: "How to use icons in the design system — SVG standards, wrapper classes, accessibility, and tooling."
section: "Design System"
subsection: ""
order: 7
slug: "iconography"
status: "published"
access: "team"
client: "internal"
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

<div class="demo-preview is-joined">
  <div class="block row gap-l align-center">
  <div class="icn-svg" data-icon="arrow-right">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M14.4679 14.7071C15.0979 14.0771 14.6517 13 13.7608 13H4V11H13.7608C14.6517 11 15.0979 9.92286 14.4679 9.29289L10.575 5.4L12 4L20 12L12 20L10.575 18.6L14.4679 14.7071Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="icn-svg" data-icon="check">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="icn-svg" data-icon="close">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="icn-svg" data-icon="search">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M18.6 20L15.5658 16.9658C14.8452 16.2452 13.7005 16.2131 12.7513 16.584C12.6932 16.6067 12.6344 16.6287 12.575 16.65C11.925 16.8833 11.2333 17 10.5 17C8.68333 17 7.14583 16.3708 5.8875 15.1125C4.62917 13.8542 4 12.3167 4 10.5C4 8.68333 4.62917 7.14583 5.8875 5.8875C7.14583 4.62917 8.68333 4 10.5 4C12.3167 4 13.8542 4.62917 15.1125 5.8875C16.3708 7.14583 17 8.68333 17 10.5C17 11.2333 16.8833 11.925 16.65 12.575C16.6287 12.6344 16.6067 12.6932 16.584 12.7513C16.2131 13.7005 16.2452 14.8452 16.9658 15.5658L20 18.6L18.6 20ZM10.5 15C11.75 15 12.8125 14.5625 13.6875 13.6875C14.5625 12.8125 15 11.75 15 10.5C15 9.25 14.5625 8.1875 13.6875 7.3125C12.8125 6.4375 11.75 6 10.5 6C9.25 6 8.1875 6.4375 7.3125 7.3125C6.4375 8.1875 6 9.25 6 10.5C6 11.75 6.4375 12.8125 7.3125 13.6875C8.1875 14.5625 9.25 15 10.5 15Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="icn-svg" data-icon="info">
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <path d="M13 18H11V10H13V18Z" fill="currentColor"/><path d="M12 6C12.35 6 12.646 6.12064 12.8877 6.3623C13.1294 6.60397 13.25 6.9 13.25 7.25C13.25 7.6 13.1294 7.89603 12.8877 8.1377C12.646 8.37936 12.35 8.5 12 8.5C11.65 8.5 11.354 8.37936 11.1123 8.1377C10.8706 7.89603 10.75 7.6 10.75 7.25C10.75 6.9 10.8706 6.60397 11.1123 6.3623C11.354 6.12064 11.65 6 12 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
    </svg>
  </div>
  </div>
</div>

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

<div class="demo-preview is-joined">
  <div class="block row gap-m align-center">
  <button class="button is-icon" aria-label="Close">
    <div class="icn-svg" data-icon="close">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>
      </svg>
    </div>
  </button>
  <button class="button is-icon" aria-label="Search">
    <div class="icn-svg" data-icon="search">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M18.6 20L15.5658 16.9658C14.8452 16.2452 13.7005 16.2131 12.7513 16.584C12.6932 16.6067 12.6344 16.6287 12.575 16.65C11.925 16.8833 11.2333 17 10.5 17C8.68333 17 7.14583 16.3708 5.8875 15.1125C4.62917 13.8542 4 12.3167 4 10.5C4 8.68333 4.62917 7.14583 5.8875 5.8875C7.14583 4.62917 8.68333 4 10.5 4C12.3167 4 13.8542 4.62917 15.1125 5.8875C16.3708 7.14583 17 8.68333 17 10.5C17 11.2333 16.8833 11.925 16.65 12.575C16.6287 12.6344 16.6067 12.6932 16.584 12.7513C16.2131 13.7005 16.2452 14.8452 16.9658 15.5658L20 18.6L18.6 20ZM10.5 15C11.75 15 12.8125 14.5625 13.6875 13.6875C14.5625 12.8125 15 11.75 15 10.5C15 9.25 14.5625 8.1875 13.6875 7.3125C12.8125 6.4375 11.75 6 10.5 6C9.25 6 8.1875 6.4375 7.3125 7.3125C6.4375 8.1875 6 9.25 6 10.5C6 11.75 6.4375 12.8125 7.3125 13.6875C8.1875 14.5625 9.25 15 10.5 15Z" fill="currentColor"/>
      </svg>
    </div>
  </button>
  </div>
</div>

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

<div class="demo-preview is-joined">
  <div class="block row gap-l align-center">
  <div style="color: var(--text-primary);">
    <div class="icn-svg" data-icon="info">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M13 18H11V10H13V18Z" fill="currentColor"/><path d="M12 6C12.35 6 12.646 6.12064 12.8877 6.3623C13.1294 6.60397 13.25 6.9 13.25 7.25C13.25 7.6 13.1294 7.89603 12.8877 8.1377C12.646 8.37936 12.35 8.5 12 8.5C11.65 8.5 11.354 8.37936 11.1123 8.1377C10.8706 7.89603 10.75 7.6 10.75 7.25C10.75 6.9 10.8706 6.60397 11.1123 6.3623C11.354 6.12064 11.65 6 12 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
      </svg>
    </div>
  </div>
  <div style="color: var(--text-accent);">
    <div class="icn-svg" data-icon="info">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M13 18H11V10H13V18Z" fill="currentColor"/><path d="M12 6C12.35 6 12.646 6.12064 12.8877 6.3623C13.1294 6.60397 13.25 6.9 13.25 7.25C13.25 7.6 13.1294 7.89603 12.8877 8.1377C12.646 8.37936 12.35 8.5 12 8.5C11.65 8.5 11.354 8.37936 11.1123 8.1377C10.8706 7.89603 10.75 7.6 10.75 7.25C10.75 6.9 10.8706 6.60397 11.1123 6.3623C11.354 6.12064 11.65 6 12 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
      </svg>
    </div>
  </div>
  <div style="color: var(--text-faded);">
    <div class="icn-svg" data-icon="info">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M13 18H11V10H13V18Z" fill="currentColor"/><path d="M12 6C12.35 6 12.646 6.12064 12.8877 6.3623C13.1294 6.60397 13.25 6.9 13.25 7.25C13.25 7.6 13.1294 7.89603 12.8877 8.1377C12.646 8.37936 12.35 8.5 12 8.5C11.65 8.5 11.354 8.37936 11.1123 8.1377C10.8706 7.89603 10.75 7.6 10.75 7.25C10.75 6.9 10.8706 6.60397 11.1123 6.3623C11.354 6.12064 11.65 6 12 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
      </svg>
    </div>
  </div>
  </div>
</div>

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

Use the [SVG Cleaner](../tools/svg-cleaner.html) to prepare icons before adding them to the codebase. The tool automates the required cleanup:

- Strips `xmlns` attributes
- Sets fills to `currentColor` (when enabled)
- Wraps in `.icn-svg` with `data-icon` attribute (when "Icon" is checked)
- Strips XML comments
- Optional minification

For CLI usage:

```bash
echo '<svg>...</svg>' | node assets/js/svg-clean.js --current-color --icon --icon-name arrow-right --strip-comments
```

---

## Brand Icons Only

This project uses a custom brand icon set — **no external icon libraries are permitted**. Do not use Material Design, Font Awesome, Heroicons, Feather, or any other third-party icon source.

Before adding any icon to a page:

1. **Check the [Icon Registry](icon-registry.html)** — it lists every available brand icon with its `data-icon` name and intended usage
2. **Use the matching brand icon** — copy the SVG from `assets/images/svg-icons/`
3. **If no icon exists for your need** — request one from the design team. Do not substitute a generic icon.

This ensures visual consistency across the entire site. A mismatched icon from an external library breaks the brand language even if it "looks close enough."

---

## Icon Shorthand

Use `{{icon:name}}` in any markdown file processed by the doc generator to render an inline icon. The shorthand is expanded at build time — the actual SVG is read from `assets/images/svg-icons/` and injected as a standard `.icn-svg` wrapper.

```
{{icon:check}}         → renders the check icon
{{icon:arrow-right}}   → renders the arrow-right icon
{{icon:t-shirt}}       → renders the t-shirt icon
```

The `name` must match a key from the [Icon Registry](icon-registry.html). If the name is not found, a warning is logged during generation and an HTML comment is output instead.

This shorthand only works in files processed by `cms/generator/generate-docs.js` — it does not work in standalone HTML pages.

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
