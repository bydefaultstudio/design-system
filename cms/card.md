---
title: "Card"
subtitle: "Contained content surfaces"
description: "How to use the card component for grouping related content in a contained surface."
section: "Design System"
subsection: ""
order: 15
slug: "card"
status: "published"
access: "team"
client: "internal"
---

Cards are surface containers that group related content with a border and background. They support padding modifiers and an interactive (clickable) variant.

---

## Tokens

| Token | Default (Light) | Default (Dark) | Purpose |
|-------|-----------------|----------------|---------|
| `--card-background` | `var(--background-primary)` | `var(--background-secondary)` | Surface colour |
| `--card-border` | `var(--border-faded)` | `var(--border-faded)` | Border colour |
| `--card-radius` | `var(--radius-m)` | — | Corner radius |
| `--card-padding` | `var(--space-xl)` | — | Internal padding |

---

## Basic usage

<div class="demo-preview">
  <div class="card">
    <p>Card content goes here. Cards provide a contained surface for grouping related information.</p>
  </div>
</div>

```html
<div class="card">
  <p>Card content goes here.</p>
</div>
```

---

## Flush card

Remove internal padding with `.card--flush` — useful when the card contains a full-bleed image or nested content that manages its own spacing.

<div class="demo-preview">
  <div class="card card--flush">
    <div style="padding: var(--space-xl); background: var(--background-faded);">
      Full-bleed content area
    </div>
  </div>
</div>

```html
<div class="card card--flush">
  <!-- Content manages its own padding -->
</div>
```

---

## Interactive card

Wrap in an `<a>` tag with `.card--interactive` for clickable cards. Adds hover shadow and focus ring.

<div class="demo-preview">
  <a class="card card--interactive" href="#">
    <p><strong>Clickable card</strong></p>
    <p>This entire card is a link.</p>
  </a>
</div>

```html
<a class="card card--interactive" href="#">
  <p><strong>Clickable card</strong></p>
  <p>This entire card is a link.</p>
</a>
```

---

## Accessibility notes

- Use semantic HTML inside cards (`<h3>`, `<p>`, `<ul>`, etc.)
- Interactive cards (`<a>`) automatically receive focus ring on `focus-visible`
- If a card contains multiple interactive elements, do not wrap the entire card in an `<a>`

---

## Do / Don't

**Do:**
- Use cards to group related content visually
- Use `.card--flush` when content needs full-bleed layout

**Don't:**
- Don't nest interactive cards inside other interactive elements
- Don't use cards purely for visual decoration — they should contain meaningful content
