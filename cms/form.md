---
title: "Form"
subtitle: "Form element styling and patterns"
description: "How to use form elements, labels, inputs, and layout patterns in the design system."
section: "Design System"
subsection: ""
order: 11
slug: "form"
status: "published"
access: "team"
client: "internal"
---

Form elements are styled globally using semantic tokens. All text inputs, textareas, selects, checkboxes, and radios share **consistent sizing, focus states, and disabled styling**.

---

## Form Tokens

All form styling is controlled by semantic tokens in `:root`:

| Token | Default | Purpose |
|---|---|---|
| `--input-border` | `var(--border-secondary)` | Default border color |
| `--input-background` | `var(--background-primary)` | Input background |
| `--input-text` | `var(--text-plain)` | Input text color |
| `--input-placeholder` | `var(--text-faded)` | Placeholder text color |
| `--input-focus` | `var(--green)` | Focus border and ring color |
| `--input-disabled-bg` | `var(--background-faded)` | Disabled background |
| `--input-disabled-text` | `var(--text-faded)` | Disabled text color |
| `--checkbox-background` | `var(--neutral-100)` | Checkbox unchecked background |
| `--checkbox-selected` | `var(--text-primary)` | Checkbox/radio checked fill |
| `--checkbox-border` | `var(--border-secondary)` | Checkbox/radio border color |
| `--checkbox-checkmark` | `var(--off-white)` | Checkmark/dot color |
| `--toggle-track` | `var(--neutral-200)` | Toggle track background |
| `--toggle-knob` | `var(--neutral-500)` | Toggle knob (unchecked) |
| `--toggle-selected` | `var(--text-primary)` | Toggle track (checked) |
| `--toggle-knob-selected` | `var(--off-white)` | Toggle knob (checked) |

---

## Labels

Labels are styled as block elements with medium weight:

<div class="demo-preview is-joined">
  <label for="demo-name">Full name</label>
  <input type="text" id="demo-name" placeholder="Enter your name">
</div>

```html
<label for="name">Full name</label>
<input type="text" id="name" placeholder="Enter your name">
```

**Properties:** `display: block`, `font-size: var(--font-s)`, `font-weight: var(--font-weight-medium)`, bottom margin for spacing from the input.

---

## Text Inputs

All standard text input types are styled globally:

<div class="demo-preview is-joined">
  <div class="form-group">
    <input type="text" placeholder="Text">
  </div>
  <div class="form-group">
    <input type="email" placeholder="Email">
  </div>
  <div class="form-group">
    <input type="number" placeholder="Number">
  </div>
</div>

```html
<input type="text" placeholder="Text">
<input type="email" placeholder="Email">
<input type="password" placeholder="Password">
<input type="number" placeholder="Number">
<input type="search" placeholder="Search">
<input type="url" placeholder="URL">
<input type="tel" placeholder="Phone">
```

**Properties:** full width, `font-size: var(--font-m)` (matches body text), `padding: var(--space-m) var(--space-l)`, border from `--input-border`, smooth focus transition.

---

## Focus State

All inputs share a consistent focus style:
- Border color changes to `--input-focus`
- A subtle box-shadow ring appears (2px, 75% transparent)
- No outline (replaced by box-shadow for consistency)

This is accessibility-safe and keyboard-visible.

---

## Textarea

Textareas have a minimum height and allow vertical resizing:

<div class="demo-preview is-joined">
  <label for="demo-message">Message</label>
  <textarea id="demo-message" placeholder="Enter your message..."></textarea>
</div>

```html
<label for="message">Message</label>
<textarea id="message" placeholder="Enter your message..."></textarea>
```

**Properties:** `min-height: 120px`, `resize: vertical`.

---

## Select

Selects use a custom dropdown arrow via an inline SVG background:

<div class="demo-preview is-joined">
  <label for="demo-country">Country</label>
  <select id="demo-country">
    <option value="" disabled selected>Choose a country</option>
    <option value="nz">New Zealand</option>
    <option value="au">Australia</option>
  </select>
</div>

```html
<label for="country">Country</label>
<select id="country">
  <option value="" disabled selected>Choose a country</option>
  <option value="nz">New Zealand</option>
  <option value="au">Australia</option>
</select>
```

**Properties:** `appearance: none`, custom caret, right padding for arrow space.

---

## Disabled State

Add the `disabled` attribute to any input, textarea, or select:

<div class="demo-preview is-joined">
  <input type="text" value="Cannot edit" disabled>
</div>

```html
<input type="text" value="Cannot edit" disabled>
```

**Properties:** `--input-disabled-bg` background, `--input-disabled-text` color, `cursor: not-allowed`.

---

## Checkbox & Radio

Checkboxes and radios use `appearance: none` with custom styling. Wrap each in `.form-check` for inline label alignment.

### Checkbox

<div class="demo-preview is-centered is-joined">
  <div class="form-check">
    <input type="checkbox" id="demo-check-1">
    <label for="demo-check-1">Unchecked</label>
  </div>
  <div class="form-check">
    <input type="checkbox" id="demo-check-2" checked>
    <label for="demo-check-2">Checked</label>
  </div>
  <div class="form-check">
    <input type="checkbox" id="demo-check-disabled" disabled>
    <label for="demo-check-disabled">Disabled</label>
  </div>
</div>

```html
<div class="form-check">
  <input type="checkbox" id="terms">
  <label for="terms">I agree to the terms</label>
</div>
```

**Properties:** `24px` size (`--space-xl`), `--checkbox-background` fill, `--border-m` border with `--radius-xs` corners. Checked state uses `--checkbox-selected` fill with a white checkmark SVG.

### Radio

<div class="demo-preview is-centered is-joined">
  <div class="form-check">
    <input type="radio" name="demo-radio" id="demo-radio-1">
    <label for="demo-radio-1">Unchecked</label>
  </div>
  <div class="form-check">
    <input type="radio" name="demo-radio" id="demo-radio-2" checked>
    <label for="demo-radio-2">Checked</label>
  </div>
</div>

```html
<div class="form-check">
  <input type="radio" name="group" id="option-a">
  <label for="option-a">Option A</label>
</div>
```

**Properties:** same as checkbox but with `border-radius: 50%` and a centered dot on checked.

---

## Toggle / Switch

A toggle is a checkbox styled as a sliding switch. Use `.form-toggle` instead of `.form-check`. Always include `role="switch"` for accessibility.

### Default (label left)

<div class="demo-preview is-centered is-joined">
  <div class="form-toggle">
    <input type="checkbox" id="demo-toggle-1" role="switch">
    <label for="demo-toggle-1">Off</label>
  </div>
  <div class="form-toggle">
    <input type="checkbox" id="demo-toggle-2" role="switch" checked>
    <label for="demo-toggle-2">On</label>
  </div>
</div>

```html
<div class="form-toggle">
  <input type="checkbox" id="notifications" role="switch">
  <label for="notifications">Enable notifications</label>
</div>
```

### Label right

Add `.is-label-right` to place the label after the toggle.

<div class="demo-preview is-centered is-joined">
  <div class="form-toggle is-label-right">
    <input type="checkbox" id="demo-toggle-right" role="switch">
    <label for="demo-toggle-right">Label right</label>
  </div>
</div>

```html
<div class="form-toggle is-label-right">
  <input type="checkbox" id="darkmode" role="switch">
  <label for="darkmode">Dark mode</label>
</div>
```

### Disabled

<div class="demo-preview is-centered is-joined">
  <div class="form-toggle">
    <input type="checkbox" id="demo-toggle-disabled" role="switch" disabled>
    <label for="demo-toggle-disabled">Disabled</label>
  </div>
</div>

```html
<div class="form-toggle">
  <input type="checkbox" id="feature" role="switch" disabled>
  <label for="feature">Coming soon</label>
</div>
```

**Properties:** 44px × 24px pill-shaped track, 18px circular knob. Unchecked: `--toggle-track` background with `--toggle-knob` knob. Checked: `--toggle-selected` background, knob slides right and becomes `--toggle-knob-selected`.

---

## Layout Patterns

### Form Group

Use `.form-group` to wrap a label + input pair with consistent bottom spacing:

<div class="demo-preview is-joined">
  <div class="form-group">
    <label for="demo-fg-name">Name</label>
    <input type="text" id="demo-fg-name">
  </div>
  <div class="form-group">
    <label for="demo-fg-email">Email</label>
    <input type="email" id="demo-fg-email">
  </div>
</div>

```html
<div class="form-group">
  <label for="name">Name</label>
  <input type="text" id="name">
</div>
<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email">
</div>
```

### Form Check

Use `.form-check` for inline checkbox/radio + label pairs:

```html
<div class="form-check">
  <input type="checkbox" id="opt-in">
  <label for="opt-in">Subscribe to newsletter</label>
</div>
```

**Properties:** `display: flex`, `align-items: center`, `gap` for spacing. The label inside `.form-check` is inline with regular weight.

### Fieldset & Legend

Use `<fieldset>` and `<legend>` to group related form controls:

<div class="demo-preview is-joined">
  <fieldset>
    <legend>Contact details</legend>
    <div class="form-group">
      <label for="demo-phone">Phone</label>
      <input type="tel" id="demo-phone">
    </div>
  </fieldset>
</div>

```html
<fieldset>
  <legend>Contact details</legend>
  <div class="form-group">
    <label for="phone">Phone</label>
    <input type="tel" id="phone">
  </div>
</fieldset>
```

---

## Rules

| Do | Don't |
|---|---|
| Use `<label>` with `for` attribute | Use placeholder as a label replacement |
| Use `.form-group` for spacing | Add margins directly to inputs |
| Use `.form-check` for checkbox/radio pairs | Float labels next to checkboxes manually |
| Use `.form-toggle` for toggle switches | Style a checkbox as a toggle without the wrapper |
| Add `role="switch"` on toggle inputs | Use a toggle without the switch role |
| Use semantic tokens for customization | Hardcode colors on individual inputs |
| Use `<fieldset>` for logical grouping | Use `<div>` with borders to fake fieldsets |
| Keep inputs full-width by default | Set fixed widths unless layout requires it |
