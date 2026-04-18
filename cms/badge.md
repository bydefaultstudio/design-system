---
title: "Badge"
subtitle: "Status labels and category indicators"
description: "How to use badge components for status labels, version tags, and category indicators."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 2
status: "published"
access: "team"
client: "internal"
---

# Badge

Badges are small inline labels used to indicate status, category, or metadata. They use the brand display font (`var(--font-tertiary)`) with uppercase styling.

The `.badge` class is required. Colour variants use the `data-color` attribute — the same API as button.

---

## Anatomy

The badge uses `data-color` for semantic colour variants. No component-level tokens — badge references system tokens directly.

| Axis | Mechanism | Example |
|---|---|---|
| Colour | `data-color` | `data-color="success"` |

---

## Basic usage

<div class="demo-preview">
  <span class="badge">Default</span>
</div>

```html
<span class="badge">Default</span>
```

---

## Colour

`data-color` applies a semantic colour. The badge background uses the status background token and text uses the status foreground.

| Semantic | Brand alias | Use for |
|---|---|---|
| `data-color="danger"` | `data-color="red"` | Errors, critical status |
| `data-color="success"` | `data-color="green"` | Live, published, positive |
| `data-color="warning"` | `data-color="yellow"` | Draft, pending, attention |
| `data-color="info"` | `data-color="blue"` | Informational, neutral |
| `data-color="accent"` | `data-color="purple"` | Emphasis, special |

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <span class="badge">Default</span>
  <span class="badge" data-color="success">Success</span>
  <span class="badge" data-color="warning">Warning</span>
  <span class="badge" data-color="danger">Danger</span>
  <span class="badge" data-color="info">Info</span>
  <span class="badge" data-color="accent">Accent</span>
</div>

```html
<span class="badge">Default</span>
<span class="badge" data-color="success">Success</span>
<span class="badge" data-color="warning">Warning</span>
<span class="badge" data-color="danger">Danger</span>
<span class="badge" data-color="info">Info</span>
<span class="badge" data-color="accent">Accent</span>
```

---

## Styling

Badge uses system tokens directly — no component-level token indirection.

| Property | Value |
|---|---|
| Font family | `var(--font-tertiary)` |
| Font size | `var(--font-2xs)` |
| Padding | `var(--space-2xs) var(--space-s)` |
| Border radius | `0` |
| Background | `var(--background-darker)` |
| Text colour | `var(--text-primary)` |

---

## Accessibility

- Badges are presentational — they do not require ARIA roles
- Ensure the badge text provides sufficient context (avoid colour-only meaning)
- If a badge conveys critical status, pair it with descriptive text nearby

---

## Usage rules

**Do**

- Use badges for metadata: status, version, category
- Keep badge text short (1-2 words)
- Use `data-color` for meaning — not decoration

**Don't**

- Don't use badges as buttons — they are not interactive
- Don't rely on colour alone to convey meaning
