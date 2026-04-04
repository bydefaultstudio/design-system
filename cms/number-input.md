---
title: "Number Input"
subtitle: "Stepper input with increment and decrement"
description: "How to use the number input component with stepper buttons for precise numeric entry."
section: "Design System"
subsection: ""
order: 31
slug: "number-input"
status: "published"
access: "team"
client: "internal"
---

The number input wraps a native `<input type="number">` with decrement and increment buttons for easier interaction. It respects `min`, `max`, and `step` attributes.

---

## Basic usage

<div class="demo-preview">
  <div class="number-input" role="group" aria-label="Quantity">
    <button class="number-input-btn" data-number-decrement type="button" aria-label="Decrease">&minus;</button>
    <input type="number" value="1" min="0" max="99" aria-label="Quantity">
    <button class="number-input-btn" data-number-increment type="button" aria-label="Increase">+</button>
  </div>
</div>

```html
<div class="number-input" role="group" aria-label="Quantity">
  <button class="number-input-btn" data-number-decrement type="button" aria-label="Decrease">&minus;</button>
  <input type="number" value="1" min="0" max="99" aria-label="Quantity">
  <button class="number-input-btn" data-number-increment type="button" aria-label="Increase">+</button>
</div>
```

---

## With min, max, and step

<div class="demo-preview">
  <div class="block gap-s">
    <label for="demo-step">Quantity (step 5, min 0, max 100)</label>
    <div class="number-input" role="group" aria-label="Quantity">
      <button class="number-input-btn" data-number-decrement type="button" aria-label="Decrease">&minus;</button>
      <input type="number" id="demo-step" value="10" min="0" max="100" step="5" aria-label="Quantity">
      <button class="number-input-btn" data-number-increment type="button" aria-label="Increase">+</button>
    </div>
  </div>
</div>

```html
<input type="number" value="10" min="0" max="100" step="5">
```

---

## Disabled

<div class="demo-preview">
  <div class="number-input" role="group" aria-label="Quantity">
    <button class="number-input-btn" data-number-decrement type="button" aria-label="Decrease" disabled>&minus;</button>
    <input type="number" value="3" disabled aria-label="Quantity">
    <button class="number-input-btn" data-number-increment type="button" aria-label="Increase" disabled>+</button>
  </div>
</div>

---

## JavaScript

Include `assets/js/number-input.js` on any page. The script handles all `[data-number-increment]` and `[data-number-decrement]` buttons via event delegation.

```html
<script src="/assets/js/number-input.js"></script>
```

---

## Accessibility notes

- Wrap in `role="group"` with `aria-label` describing the input
- Each button needs `aria-label` ("Increase" / "Decrease")
- The native `<input type="number">` handles value announcements
- `min`, `max`, `step` are respected by the JS and exposed to assistive technology

---

## Do / Don't

**Do:**
- Use number inputs for small, precise quantities (1-99)
- Always set `min` and `max` to prevent invalid values
- Pair with a `<label>` for context

**Don't:**
- Don't use for large numeric ranges — use a slider instead
- Don't use for values that aren't truly numeric (e.g. phone numbers)
