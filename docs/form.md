---
title: "Form"
subtitle: "Form element styling and patterns"
description: "How to use form elements, labels, inputs, and layout patterns in the design system."
section: "Design System"
order: 10
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

---

## Labels

Labels are styled as block elements with medium weight:

```html
<label for="name">Full name</label>
<input type="text" id="name" placeholder="Enter your name">
```

**Properties:** `display: block`, `font-size: var(--font-s)`, `font-weight: var(--font-weight-medium)`, bottom margin for spacing from the input.

---

## Text Inputs

All standard text input types are styled globally:

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

```html
<label for="message">Message</label>
<textarea id="message" placeholder="Enter your message..."></textarea>
```

**Properties:** `min-height: 120px`, `resize: vertical`.

---

## Select

Selects use a custom dropdown arrow via an inline SVG background:

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

```html
<input type="text" value="Cannot edit" disabled>
```

**Properties:** `--input-disabled-bg` background, `--input-disabled-text` color, `cursor: not-allowed`.

---

## Checkbox & Radio

Checkboxes and radios use the native browser rendering with `accent-color` for brand alignment:

```html
<div class="form-check">
  <input type="checkbox" id="terms">
  <label for="terms">I agree to the terms</label>
</div>
```

**Properties:** consistent sizing via `width`/`height` tokens, `accent-color: var(--input-focus)`.

---

## Layout Patterns

### Form Group

Use `.form-group` to wrap a label + input pair with consistent bottom spacing:

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
| Use semantic tokens for customization | Hardcode colors on individual inputs |
| Use `<fieldset>` for logical grouping | Use `<div>` with borders to fake fieldsets |
| Keep inputs full-width by default | Set fixed widths unless layout requires it |
