---
title: "Card"
subtitle: "Contained content surfaces"
description: "How to use the card component for grouping related content in a contained surface."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 1
status: "published"
access: "team"
client: "internal"
---

Cards are surface containers that group related content with a border and background. They support padding modifiers and an interactive (clickable) variant.

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

### Clickable card

<div class="demo-preview">
  <a class="card card--interactive" href="#">
    <h3 class="card-title">Clickable card</h3>
    <p class="card-description">This entire card is a link.</p>
  </a>
</div>

```html
<a class="card card--interactive" href="#">
  <h3 class="card-title">Clickable card</h3>
  <p class="card-description">This entire card is a link.</p>
</a>
```

### Image card

Combine `.card--flush` with `.card--interactive` to create a clickable card with a full-bleed image. The `.img` and `.card-image` classes handle display and border-radius. Use a padded inner wrapper for the text content.

<div class="demo-preview">
  <a class="card card--flush card--interactive" href="#" style="max-width: 320px;">
    <img class="img img-16x9 card-image" src="../assets/images/og/og-default.jpg" alt="Example image">
    <div style="padding: var(--space-xl);">
      <h3 class="card-title">Card with image</h3>
      <p class="card-description">Supporting text below the image.</p>
    </div>
  </a>
</div>

```html
<a class="card card--flush card--interactive" href="#">
  <img class="img img-16x9 card-image" src="image.jpg" alt="Description">
  <div style="padding: var(--space-xl);">
    <h3 class="card-title">Card with image</h3>
    <p class="card-description">Supporting text below the image.</p>
  </div>
</a>
```

---

## Accessibility

- Use semantic HTML inside cards (`<h3>`, `<p>`, `<ul>`, etc.)
- Interactive cards (`<a>`) automatically receive focus ring on `focus-visible`
- If a card contains multiple interactive elements, do not wrap the entire card in an `<a>`

---

## Usage rules

**Do:**
- Use cards to group related content visually
- Use `.card--flush` when content needs full-bleed layout

**Don't:**
- Don't nest interactive cards inside other interactive elements
- Don't use cards purely for visual decoration — they should contain meaningful content

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Styling

| Property | Value |
|---|---|
| Background | `var(--background-primary)` (dark: `var(--background-secondary)`) |
| Border | `var(--border-s) solid var(--border-faded)` |
| Radius | `var(--radius-m)` |
| Padding | `var(--space-xl)` |

### Selectors

| Selector | Purpose |
|---|---|
| `.card` | Base component — background, border, radius, padding |
| `.card--flush` | Removes padding |
| `.card--interactive` | Adds hover background, shadow, focus ring, and link styling |
| `.card-title` | Card heading — resets margin |
| `.card-description` | Card body text — secondary text colour |
| `.card-image` | Full-bleed image with top border-radius |
