---
title: "Button"
subtitle: "Actions that communicate intent and hierarchy"
description: "How to use button styles and modifiers in the design system."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Data Entry"
order: 1
status: "published"
access: "team"
client: "internal"
---

# Button

Buttons are interactive elements used to trigger actions. They size to their content by default and should communicate **clear intent and hierarchy**.

The `.button` class is required. The bare `<button>` element only has a minimal reset — always add `class="button"` to get the full component appearance.

---

## Anatomy

The button uses a CSS pattern called **CUBE** — *Composition, Utility, Block, Exception*. The practical consequence for anyone writing HTML or CSS:

- **Attributes (`data-*`) change what the button looks like** — variant, size, colour, plus booleans for icon-only and full-width. In CUBE terms, these are *Exceptions*.
- **State classes (`.is-*`) change what the button is doing right now** — loading, disabled, active.
- **The base CSS is written once.** Every `data-*` attribute is a set of token overrides, so stacking multiple attributes composes without conflict — each one rewrites its own tokens.

Each axis of variation has its own mechanism:

| Axis | Mechanism | Example |
|---|---|---|
| Variant (hierarchy) | `data-variant` | `data-variant="outline"` |
| Size | `data-size` | `data-size="small"` |
| Colour | `data-color` | `data-color="danger"` |
| Icon-only | `data-icon-only` (boolean) | `data-icon-only` |
| Full width | `data-full-width` (boolean) | `data-full-width` |
| State (transient) | `.is-*` class | `.is-loading` |


---

## Primary

The default `.button` is the most prominent action on the page. Filled, high contrast, black by default.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <button class="button">Primary Action</button>
  <button class="button" disabled>Primary Disabled</button>
</div>

```html
<button class="button">Primary Action</button>
<button class="button" disabled>Primary Disabled</button>
```

---

## Variants

Variants change shape and visual hierarchy. Use to reduce visual competition between buttons on the same surface.

### Outline

Transparent background with a primary border. Use `data-variant="outline"` for secondary actions.

<div class="demo-preview is-joined">
  <button class="button" data-variant="outline">Secondary Action</button>
</div>

```html
<button class="button" data-variant="outline">Secondary Action</button>
```

### Faded

Subtle filled background (15% alpha of the primary colour). Use `data-variant="faded"` for low-priority or passive actions.

<div class="demo-preview is-joined">
  <button class="button" data-variant="faded">Optional Action</button>
</div>

```html
<button class="button" data-variant="faded">Optional Action</button>
```

### Outline faded

Transparent background with a faded border. Use `data-variant="outline-faded"` for tertiary or utility actions.

<div class="demo-preview is-joined">
  <button class="button" data-variant="outline-faded">Tertiary Action</button>
</div>

```html
<button class="button" data-variant="outline-faded">Tertiary Action</button>
```

### Transparent

No background, no border — the button is invisible until hovered. Use `data-variant="transparent"` for icon buttons in toolbars, overlays, or minimal UI where the button chrome should disappear.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button" data-variant="transparent">Transparent</button>
  <button class="button" data-variant="transparent" data-icon-only aria-label="Settings">{{icon:sun}}</button>
</div>

```html
<button class="button" data-variant="transparent">Transparent</button>
```

### Text

Unstyled text-only button with no padding. Adds underline on hover. Use `data-variant="text"` for inline actions that should look like a text link but semantically remain a button.

<div class="demo-preview is-joined">
  <button class="button" data-variant="text">Learn more</button>
</div>

```html
<button class="button" data-variant="text">Learn more</button>
```

### All variants side by side

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button">Primary</button>
  <button class="button" data-variant="outline">Outline</button>
  <button class="button" data-variant="faded">Faded</button>
  <button class="button" data-variant="outline-faded">Outline faded</button>
  <button class="button" data-variant="transparent">Transparent</button>
  <button class="button" data-variant="text">Text</button>
</div>

---

## Sizes

`data-size` reduces padding and font size. Use for dense UI, sidebar actions, or compact contexts.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button">Default</button>
  <button class="button" data-size="small">Small</button>
  <button class="button" data-size="xsmall">Extra small</button>
</div>

```html
<button class="button">Default</button>
<button class="button" data-size="small">Small</button>
<button class="button" data-size="xsmall">Extra small</button>
```

Sizes compose with variants:

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button" data-variant="outline" data-size="small">Small outline</button>
  <button class="button" data-variant="faded" data-size="xsmall">Xsmall faded</button>
</div>

---

## Icon-only

A boolean attribute. Add `data-icon-only` to produce a circular button with equal padding, designed for buttons whose content is a single icon. Always include `aria-label` for accessibility.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button" data-icon-only aria-label="Close">{{icon:close}}</button>
  <button class="button" data-icon-only data-variant="faded" aria-label="Settings">{{icon:sun}}</button>
  <button class="button" data-icon-only data-variant="outline" aria-label="Menu">{{icon:menu}}</button>
  <button class="button" data-icon-only data-color="danger" aria-label="Delete">{{icon:close}}</button>
</div>

```html
<button class="button" data-icon-only aria-label="Close">
  <div class="svg-icn" data-icon="close"><!-- SVG --></div>
</button>

<button class="button" data-icon-only data-variant="faded" aria-label="Settings">
  <div class="svg-icn" data-icon="sun"><!-- SVG --></div>
</button>
```

---

## Full width

A boolean attribute. Add `data-full-width` to make the button span its container. Use for form submits, stacked CTAs on narrow viewports, and modal primary actions.

<div class="demo-preview is-joined">
  <button class="button" data-full-width>Submit</button>
</div>

```html
<button class="button" data-full-width>Submit</button>
```

### Alternative: layout-driven stretching

For cases where multiple children should stretch together, use `.align-stretch` on the parent `.block`:

```html
<form class="block align-stretch gap-m">
  <input type="email" placeholder="Email">
  <button class="button">Subscribe</button>
</form>
```

---

## Colour

`data-color` applies a semantic or brand colour. The colour cascades through the component's tokens, so every variant picks it up automatically.

| Semantic | Brand alias | Use for |
|---|---|---|
| `data-color="danger"` | `data-color="red"` | Destructive actions, errors |
| `data-color="success"` | `data-color="green"` | Confirmations, positive outcomes |
| `data-color="warning"` | `data-color="yellow"` | Caution, attention needed |
| `data-color="info"` | `data-color="blue"` | Informational, neutral CTAs |
| `data-color="accent"` | `data-color="purple"` | Emphasis, special actions |

### Primary coloured

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <button class="button" data-color="danger">Danger</button>
  <button class="button" data-color="success">Success</button>
  <button class="button" data-color="warning">Warning</button>
  <button class="button" data-color="info">Info</button>
  <button class="button" data-color="accent">Accent</button>
</div>

### Outline coloured

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <button class="button" data-variant="outline" data-color="danger">Danger</button>
  <button class="button" data-variant="outline" data-color="success">Success</button>
  <button class="button" data-variant="outline" data-color="warning">Warning</button>
  <button class="button" data-variant="outline" data-color="info">Info</button>
  <button class="button" data-variant="outline" data-color="accent">Accent</button>
</div>

### Faded coloured

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <button class="button" data-variant="faded" data-color="danger">Danger</button>
  <button class="button" data-variant="faded" data-color="success">Success</button>
  <button class="button" data-variant="faded" data-color="warning">Warning</button>
  <button class="button" data-variant="faded" data-color="info">Info</button>
  <button class="button" data-variant="faded" data-color="accent">Accent</button>
</div>

```html
<button class="button" data-color="danger">Danger</button>
<button class="button" data-variant="outline" data-color="success">Success</button>
<button class="button" data-variant="faded" data-color="info">Info</button>
```

---

## Hover

All buttons transition on hover. The CSS property used is `background-color` (not the `background` shorthand).

**Filled buttons** (primary and all `data-color` variants): reduce to `opacity: 0.9`.

**Unfilled variants** (outline, faded, outline-faded, transparent, text): gain a subtle accent fill at 10% alpha of the button's identity colour.

```css
/* Filled hover */
.button:hover { opacity: 0.9; }

/* Unfilled hover */
.button[data-variant="outline"]:hover,
.button[data-variant="faded"]:hover,
.button[data-variant="outline-faded"]:hover,
.button[data-variant="transparent"]:hover,
.button[data-variant="text"]:hover {
  background-color: color-mix(in srgb, var(--button-color), var(--alpha-10));
}
```

The **text** variant also adds an underline on hover.

---

## States

States are transient — runtime-toggled, not permanent properties. They use `.is-*` classes shared across components.

| Class | Purpose |
|---|---|
| `.is-disabled` (or `disabled` attribute) | Opacity 0.4, pointer events disabled |
| `.is-loading` | Pointer disabled, reduced opacity |
| `.is-active` | Pressed or selected state |

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button">Default</button>
  <button class="button" disabled>Disabled</button>
  <button class="button is-loading">Saving...</button>
  <button class="button is-active" data-variant="faded">Active</button>
</div>

```html
<button class="button" disabled>Disabled</button>
<button class="button is-loading">Saving...</button>
<button class="button is-active" data-variant="faded">Active</button>
```

---

## Buttons vs links

All attributes and state classes work identically on `<button>` and `<a class="button">`. The CSS targets `.button` — it doesn't care about the element.

Use `<button>` when clicking **does something on this page**. Use `<a href>` when clicking **goes somewhere else**.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button" type="submit">Submit (button)</button>
  <a class="button" href="#" data-variant="outline">Navigate (link)</a>
</div>

```html
<button class="button" type="submit">Submit (button)</button>
<a class="button" href="/work" data-variant="outline">Navigate (link)</a>
```

### Disabled links

HTML has no native `disabled` on `<a>`. Use this three-part pattern:

<div class="demo-preview is-joined">
  <a class="button is-disabled" aria-disabled="true" tabindex="-1">Can't click</a>
</div>

```html
<a class="button is-disabled"
   aria-disabled="true"
   tabindex="-1">
  Can't click
</a>
```

---

## Extending the button

When you need something that doesn't fit the attribute API — a close button that turns red on hover, a nav item styled like a button, a hero CTA with a display font — create a **role class** that overrides tokens.

### Role classes — the pattern

Role classes override tokens, never duplicate the base. The base's structure is preserved automatically.

```css
/* ------ CLOSE BUTTON ------ */
.close-btn {
  --button-color: var(--text-faded);
  --button-text-color: var(--background-primary);
}
.close-btn:hover {
  --button-color: var(--status-danger);
}
```

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap; align-items: center;">
  <button class="button close-btn" data-icon-only aria-label="Close">{{icon:close}}</button>
</div>

```html
<button class="button close-btn" data-icon-only aria-label="Close">
  <div class="svg-icn" data-icon="close"><!-- SVG --></div>
</button>
```

### Tokens available for role class overrides

| Token | Default | What it controls |
|---|---|---|
| `--button-color` | `var(--text-primary)` | The button's identity color — feeds bg, border, and variant text |
| `--button-faded` | `color-mix(... --button-color ...)` | 15% alpha of button color — used by faded variants |
| `--button-bg` | `var(--button-color)` | Background fill |
| `--button-border` | `var(--button-color)` | Border stroke |
| `--button-text-color` | `var(--text-inverted)` | Text colour |
| `--button-font` | `var(--font-secondary)` | Font family |
| `--button-text-size` | `var(--text-body)` | Text size |
| `--button-padding-y` | `var(--space-m)` | Vertical padding |
| `--button-padding-x` | `var(--space-xl)` | Horizontal padding |
| `--button-radius` | `0` | Corner radius |
| `--button-gap` | `var(--space-s)` | Icon-to-text gap |

---

## Button group

`.button-group` is a flex container for grouping multiple buttons with consistent spacing.

<div class="demo-preview is-joined" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <div class="button-group">
    <button class="button">Confirm</button>
    <button class="button" data-variant="outline">Cancel</button>
  </div>
</div>

```html
<div class="button-group">
  <button class="button">Confirm</button>
  <button class="button" data-variant="outline">Cancel</button>
</div>
```

---

## Accessibility

- Icon-only buttons (`data-icon-only`) **must** include `aria-label` describing the action
- `disabled` attribute or `.is-disabled` class prevents interaction and is announced by screen readers
- Loading buttons (`.is-loading`) should set `aria-busy="true"` for screen reader clarity
- Focus ring appears automatically on `:focus-visible`
- Disabled links require `aria-disabled="true"` and `tabindex="-1"` alongside `.is-disabled`
- Choose elements by semantics: `<button>` for actions, `<a href>` for navigation

---

## Usage rules

**Do**

- Use one clear primary button per section when possible
- Use `data-variant` to reduce visual competition between actions
- Use `data-color` for meaning (danger for destructive, success for positive) — not decoration
- Include `aria-label` on every icon button
- Create a role class when a styling pattern repeats in multiple places

**Don't**

- Don't make buttons full-width by default — use `data-full-width` or `.align-stretch` when needed
- Don't use `data-color` when hierarchy already communicates the meaning
- Don't stack more than two coloured buttons on the same surface
- Don't use `.is-active` for permanent variants — if something is always outlined, it's a `data-variant`, not a state
