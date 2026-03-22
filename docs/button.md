---
title: "Button"
subtitle: "Button component and usage guidelines"
description: "How to use button styles and modifiers in the design system."
section: "Design System"
order: 8
---

Buttons are interactive elements used to trigger actions.  
They size to their content by default and should communicate **clear intent and hierarchy**.

---

## Base Button

`.button` (or the `button` element) is the default and most commonly used button.

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

```html
<button class="button is-icon">
  <div class="icn-svg">
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

## Usage Rules

* Buttons should **never stretch full width by default**
* Use one clear primary button per section when possible
* Use outline or faded styles to reduce visual competition
* Use icon buttons **only** when the icon meaning is clear

If a button feels too prominent or too quiet, change the modifier — not the base styles.
