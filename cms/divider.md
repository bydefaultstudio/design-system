---
title: "Divider"
subtitle: "Visual breaks between content sections"
description: "How to use the divider component for visual separation between content sections."
section: "Design System"
layer: "core"
subsection: "Content"
order: 9
status: "published"
access: "team"
client: "internal"
---

Dividers create visual separation between content sections. They use semantic tokens for colour and thickness, and support horizontal, vertical, subtle, and strong variants.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `var(--divider-color)` | `var(--border-faded)` | Line colour |
| `var(--divider-thickness)` | `var(--border-s)` | Line thickness |
| `var(--divider-spacing)` | `var(--space-xl)` | Vertical margin |

---

## Basic usage

<div class="demo-preview">
  <p>Content above the divider.</p>
  <hr class="divider">
  <p>Content below the divider.</p>
</div>

```html
<hr class="divider">
```

The bare `<hr>` element is also styled to match `.divider` by default.

---

## Subtle variant

<div class="demo-preview">
  <p>First section.</p>
  <hr class="divider divider--subtle">
  <p>Second section with a lighter divider above.</p>
</div>

```html
<hr class="divider divider--subtle">
```

---

## Strong variant

<div class="demo-preview">
  <p>Important section boundary.</p>
  <hr class="divider divider--strong">
  <p>Next section with a heavier divider above.</p>
</div>

```html
<hr class="divider divider--strong">
```

---

## Vertical divider

Use `.divider--vertical` inside a flex row to separate inline content.

<div class="demo-preview">
  <div style="display: flex; align-items: center; gap: 0;">
    <span>Left content</span>
    <span class="divider--vertical" style="height: 1.5em;"></span>
    <span>Right content</span>
  </div>
</div>

```html
<div style="display: flex; align-items: center;">
  <span>Left content</span>
  <span class="divider--vertical"></span>
  <span>Right content</span>
</div>
```

---

## Accessibility notes

- Use `<hr>` for semantic section breaks that screen readers should announce
- For purely decorative dividers, add `role="presentation"` or use a `<div class="divider">` instead
- Vertical dividers should use `role="separator"` when they represent meaningful boundaries

---

## Do / Don't

**Do:**
- Use dividers to separate distinct content groups
- Use `var(--subtle)` for minor separation within a section
- Use `var(--strong)` for major section boundaries

**Don't:**
- Don't use dividers where spacing alone provides sufficient separation
- Don't use dividers between every element — they should be intentional
