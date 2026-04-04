---
title: "Button"
subtitle: "Button component and usage guidelines"
description: "How to use button styles and modifiers in the design system."
section: "Design System"
subsection: ""
order: 8
slug: "button"
status: "published"
access: "team"
client: "internal"
---

Buttons are interactive elements used to trigger actions.  
They size to their content by default and should communicate **clear intent and hierarchy**.

**Important:** The `.button` class is required for styled buttons. The bare `<button>` element has only a minimal reset (no background, border, or padding) — it does not inherit button component styling. Always add `class="button"` to get the full button appearance.

**Naming note:** Button modifiers use the legacy `.is-*` pattern (`.is-outline`, `.is-faded`, etc.). New components in the design system use the `.component--modifier` pattern. The `.is-*` modifiers on buttons are kept for backward compatibility.

---

## Base Button

`.button` is the default and most commonly used button.

Use this when you want to highlight a **primary action**.

### When to use
- Primary calls to action
- Form submissions
- Key user decisions

### Default Styling
- **Font:** Primary font, `var(--button-font-size)`
- **Background:** `var(--button-primary)`
- **Text color:** `var(--button-text)`
- **Border:** `var(--border-m)` solid `var(--button-primary)`

<div class="demo-preview is-joined">
  <button class="button">Primary Action</button>
</div>

```html
<button class="button">Primary Action</button>
```

---

## Outline Button

`.is-outline` removes the filled background and uses a border instead.

### When to use

* Secondary actions
* Actions that should not visually compete with the primary CTA
* Buttons placed near strong visual content

<div class="demo-preview is-joined">
  <button class="button is-outline">Secondary Action</button>
</div>

```html
<button class="button is-outline">Secondary Action</button>
```

---

## Faded Button

`.is-faded` applies a subtle background using `var(--button-faded)`.

### When to use

* Low-priority actions
* Passive or optional interactions
* UI controls that should feel lightweight

<div class="demo-preview is-joined">
  <button class="button is-faded">Optional Action</button>
</div>

```html
<button class="button is-faded">Optional Action</button>
```

---

## Outline + Faded

`.is-outline.is-faded` combines both modifiers.

### When to use

* Tertiary actions
* Utility controls
* Actions that should be visible but de-emphasised

<div class="demo-preview is-joined">
  <button class="button is-outline is-faded">Tertiary Action</button>
</div>

```html
<button class="button is-outline is-faded">Tertiary Action</button>
```

---

## Small Button

`.is-small` reduces font size and padding.

### When to use

* Dense UI areas
* Tables, cards, or compact layouts
* Secondary actions inside components

<div class="demo-preview is-joined">
  <button class="button is-small">Small Action</button>
</div>

```html
<button class="button is-small">Small Action</button>
```

---

## Icon Button

`.is-icon` creates a circular button designed for icons only.

### When to use

* Icon-only actions
* Toolbar controls
* Repeated UI actions (close, add, expand)

<div class="demo-preview is-joined">
  <button class="button is-icon" aria-label="Close">
    <div class="icn-svg" data-icon="close">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>
      </svg>
    </div>
  </button>
</div>

```html
<button class="button is-icon" aria-label="Close">
  <div class="icn-svg" data-icon="close">
    <!-- SVG icon -->
  </div>
</button>
```

---

## Disabled Button

`:disabled` or `.is-disabled` reduces opacity and prevents interaction.

### When to use

* Actions that are temporarily unavailable
* Form submissions when validation is incomplete
* Controls that require a prerequisite action

<div class="demo-preview is-joined">
  <div class="block row gap-m">
    <button class="button" disabled>Disabled Action</button>
    <button class="button is-outline" disabled>Disabled Outline</button>
  </div>
</div>

```html
<button class="button" disabled>Disabled Action</button>
<button class="button is-outline" disabled>Disabled Outline</button>
```

**Styling:** `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none`.

---

## Combining Modifiers

Button modifiers can be combined to match intent and context.

### Common combinations

| Combination            | Use case                     |
| ---------------------- | ---------------------------- |
| `.is-outline.is-faded` | Tertiary or utility actions  |
| `.is-small.is-outline` | Compact secondary actions    |
| `.is-small.is-faded`   | Low-priority compact actions |

---

## Button Group

`.button-group` is a flex container for grouping multiple buttons together. Use it whenever two or more buttons sit side by side.

### Why use it

- Provides consistent spacing between buttons (`var(--space-m)`)
- Wraps buttons cleanly on smaller screens (`flex-wrap: wrap`)
- Vertically centres buttons of different sizes (`align-items: center`)

### Default (left-aligned)

<div class="demo-preview is-joined">
  <div class="button-group">
    <button class="button">Primary</button>
    <button class="button is-outline">Secondary</button>
  </div>
</div>

```html
<div class="button-group">
  <button class="button">Primary</button>
  <button class="button is-outline">Secondary</button>
</div>
```

### Centred

Add `.justify-center` to horizontally centre the group.

<div class="demo-preview is-joined">
  <div class="button-group justify-center">
    <button class="button">Primary</button>
    <button class="button is-outline">Secondary</button>
  </div>
</div>

```html
<div class="button-group justify-center">
  <button class="button">Primary</button>
  <button class="button is-outline">Secondary</button>
</div>
```

### Right-aligned

Add `.justify-end` to push buttons to the right.

<div class="demo-preview is-joined">
  <div class="button-group justify-end">
    <button class="button is-faded">Cancel</button>
    <button class="button">Confirm</button>
  </div>
</div>

```html
<div class="button-group justify-end">
  <button class="button is-faded">Cancel</button>
  <button class="button">Confirm</button>
</div>
```

### Combo classes

| Class | Effect |
|-------|--------|
| `.justify-center` | Centre-aligns the button group |
| `.justify-end` | Right-aligns the button group |

---

## Usage Rules

* Buttons should **never stretch full width by default**
* Use one clear primary button per section when possible
* Use outline or faded styles to reduce visual competition
* Use icon buttons **only** when the icon meaning is clear

If a button feels too prominent or too quiet, change the modifier — not the base styles.
