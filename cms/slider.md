---
title: "Slider"
subtitle: "Range input with styled track and thumb"
description: "How to use the slider component for range selection with live value display."
section: "Design System"
subsection: "Data Entry"
order: 6
slug: "slider"
status: "published"
access: "team"
client: "internal"
---

Sliders style the native `<input type="range">` element with design system tokens. They support labels, live value display, and disabled states.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--slider-track-height` | `4px` | Track height |
| `--slider-thumb-size` | `18px` | Thumb diameter |
| `--slider-track-background` | `var(--background-darker)` | Track fill |
| `--slider-fill` | `var(--text-primary)` | Active fill colour |
| `--slider-thumb-background` | `var(--text-primary)` | Thumb colour |
| `--slider-thumb-border` | `var(--background-primary)` | Thumb border |
| `--slider-radius` | `var(--radius-pill)` | Track corner radius |

---

## Basic usage

<div class="demo-preview">
  <input type="range" min="0" max="100" value="50">
</div>

```html
<input type="range" min="0" max="100" value="50">
```

---

## With label and live value

Use `.slider-wrapper`, `.slider-header`, and `.slider-value` for a labelled slider with live value display.

<div class="demo-preview">
  <div class="slider-wrapper">
    <div class="slider-header">
      <label for="demo-opacity">Opacity</label>
      <span class="slider-value" id="demo-opacity-val">75%</span>
    </div>
    <input type="range" id="demo-opacity" min="0" max="100" value="75" step="1" oninput="document.getElementById('demo-opacity-val').textContent = this.value + '%'">
  </div>
</div>

```html
<div class="slider-wrapper">
  <div class="slider-header">
    <label for="opacity">Opacity</label>
    <span class="slider-value" id="opacity-val">75%</span>
  </div>
  <input type="range" id="opacity" min="0" max="100" value="75"
    oninput="document.getElementById('opacity-val').textContent = this.value + '%'">
</div>
```

---

## Disabled

<div class="demo-preview">
  <input type="range" min="0" max="100" value="30" disabled>
</div>

```html
<input type="range" min="0" max="100" value="30" disabled>
```

---

## Accessibility notes

- The native `<input type="range">` is announced by screen readers automatically
- Always pair with a `<label>` or `aria-label`
- The `min`, `max`, `step`, and `value` attributes are exposed to assistive technology

---

## Do / Don't

**Do:**
- Use sliders for continuous values (volume, opacity, price range)
- Show the current value with `.slider-value` for clarity
- Use `step` to control precision

**Don't:**
- Don't use sliders for precise numeric entry — use a number input instead
- Don't use sliders without a visible label or value indicator
