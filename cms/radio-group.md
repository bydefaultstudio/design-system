---
title: "Radio Group"
subtitle: "Grouped radio options with label and hint"
description: "How to use the radio group component for single-selection option lists."
section: "Design System"
subsection: ""
order: 32
slug: "radio-group"
status: "published"
access: "team"
client: "internal"
---

Radio groups wrap multiple radio inputs with consistent spacing, an optional group label, and hint text. They support vertical and horizontal layouts.

---

## Basic vertical group

<div class="demo-preview">
  <div class="radio-group">
    <div class="form-check">
      <input type="radio" name="demo-plan" id="demo-plan-free" checked>
      <label for="demo-plan-free">Free</label>
    </div>
    <div class="form-check">
      <input type="radio" name="demo-plan" id="demo-plan-pro">
      <label for="demo-plan-pro">Pro</label>
    </div>
    <div class="form-check">
      <input type="radio" name="demo-plan" id="demo-plan-enterprise">
      <label for="demo-plan-enterprise">Enterprise</label>
    </div>
  </div>
</div>

```html
<div class="radio-group">
  <div class="form-check">
    <input type="radio" name="plan" id="plan-free" checked>
    <label for="plan-free">Free</label>
  </div>
  <div class="form-check">
    <input type="radio" name="plan" id="plan-pro">
    <label for="plan-pro">Pro</label>
  </div>
  <div class="form-check">
    <input type="radio" name="plan" id="plan-enterprise">
    <label for="plan-enterprise">Enterprise</label>
  </div>
</div>
```

---

## Horizontal group

<div class="demo-preview">
  <div class="radio-group is-horizontal">
    <div class="form-check">
      <input type="radio" name="demo-size" id="demo-size-s" checked>
      <label for="demo-size-s">Small</label>
    </div>
    <div class="form-check">
      <input type="radio" name="demo-size" id="demo-size-m">
      <label for="demo-size-m">Medium</label>
    </div>
    <div class="form-check">
      <input type="radio" name="demo-size" id="demo-size-l">
      <label for="demo-size-l">Large</label>
    </div>
  </div>
</div>

```html
<div class="radio-group is-horizontal">
  ...
</div>
```

---

## With group label

<div class="demo-preview">
  <fieldset>
    <legend class="radio-group-label">Shipping method</legend>
    <div class="radio-group">
      <div class="form-check">
        <input type="radio" name="demo-shipping" id="demo-shipping-standard" checked>
        <label for="demo-shipping-standard">Standard (5-7 days)</label>
      </div>
      <div class="form-check">
        <input type="radio" name="demo-shipping" id="demo-shipping-express">
        <label for="demo-shipping-express">Express (2-3 days)</label>
      </div>
      <div class="form-check">
        <input type="radio" name="demo-shipping" id="demo-shipping-next">
        <label for="demo-shipping-next">Next day</label>
      </div>
    </div>
  </fieldset>
</div>

```html
<fieldset>
  <legend class="radio-group-label">Shipping method</legend>
  <div class="radio-group">
    ...
  </div>
</fieldset>
```

---

## With hint text

<div class="demo-preview">
  <fieldset>
    <legend class="radio-group-label">Notification frequency</legend>
    <div class="radio-group">
      <div class="form-check">
        <input type="radio" name="demo-freq" id="demo-freq-instant" checked>
        <label for="demo-freq-instant">Instant</label>
      </div>
      <div class="form-check">
        <input type="radio" name="demo-freq" id="demo-freq-daily">
        <label for="demo-freq-daily">Daily digest</label>
      </div>
      <div class="form-check">
        <input type="radio" name="demo-freq" id="demo-freq-weekly">
        <label for="demo-freq-weekly">Weekly summary</label>
      </div>
    </div>
    <span class="radio-group-hint">Choose how often you want to receive email notifications.</span>
  </fieldset>
</div>

```html
<span class="radio-group-hint">Choose how often you want to receive notifications.</span>
```

---

## Disabled option

<div class="demo-preview">
  <div class="radio-group">
    <div class="form-check">
      <input type="radio" name="demo-tier" id="demo-tier-basic" checked>
      <label for="demo-tier-basic">Basic</label>
    </div>
    <div class="form-check">
      <input type="radio" name="demo-tier" id="demo-tier-premium" disabled>
      <label for="demo-tier-premium">Premium (coming soon)</label>
    </div>
  </div>
</div>

---

## Accessibility notes

- Use `<fieldset>` + `<legend>` to group related radio inputs — this is the recommended accessible pattern
- Each radio must have an associated `<label>` via the `for` attribute
- Disabled radios are automatically excluded from keyboard navigation
- Arrow keys move between options within a radio group (native browser behaviour)

---

## Do / Don't

**Do:**
- Use radio groups when the user must pick exactly one option from a list
- Use `<fieldset>` + `<legend>` for groups of 3+ options
- Pre-select a sensible default when possible

**Don't:**
- Don't use radio groups for on/off toggles — use a checkbox or toggle switch
- Don't use radio groups for multi-select — use checkboxes instead
