---
title: "Callout"
subtitle: "Draw attention to what matters"
description: "How to use callout styles and semantic variants in the design system."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 1
status: "published"
access: "team"
client: "internal"
---

# Callout

Callouts are used to **highlight important information** within content. They draw attention to informational notes, success tips, warnings, and other contextual messages.

The `.callout` class is required. Type variants use `data-type` with the shared status vocabulary (`info`, `success`, `warning`, `danger`, `accent`). The icon layout uses the `data-icon` boolean attribute.

---

## Anatomy

| Axis | Mechanism | Example |
|---|---|---|
| Type (semantic) | `data-type` | `data-type="info"` |
| Icon layout | `data-icon` (boolean) | `data-icon` |

No component-level tokens — callout references status tokens directly.

Callout uses `data-type` (not `data-color`) because the type describes **what the content means**, not just what colour to apply. Display components like badge, tag, and button use `data-color` for visual colour. Feedback components like callout and toast use `data-type` for semantic meaning.

---

## Status colour tokens

Callout types are powered by status colour tokens defined in `:root`:

| Token | Default | Purpose |
|---|---|---|
| `var(--status-info)` | `var(--blue)` | Informational content |
| `var(--status-info-bg)` | `var(--blue-lighter)` | Info background |
| `var(--status-success)` | `var(--green)` | Tips, positive feedback |
| `var(--status-success-bg)` | `var(--green-lighter)` | Success background |
| `var(--status-warning)` | `var(--yellow-darker)` | Warnings, attention needed |
| `var(--status-warning-bg)` | `var(--yellow-lighter)` | Warning background |
| `var(--status-danger)` | `var(--red)` | Risks, destructive actions |
| `var(--status-danger-bg)` | `var(--red-lighter)` | Danger background |
| `var(--status-accent)` | `var(--purple)` | Emphasis, special importance |
| `var(--status-accent-bg)` | `var(--purple-lighter)` | Accent background |

Callouts, badges, toasts, and other components reference these tokens directly — no intermediate `--callout-*` layer needed.

---

## Base callout

The `.callout` class provides the structural foundation with neutral styling.

<div class="demo-preview is-joined">
  <div class="callout">
    <p class="callout-description">General-purpose highlighted content.</p>
  </div>
</div>

```html
<div class="callout">
  <p class="callout-description">General-purpose highlighted content.</p>
</div>
```

---

## Types

Use `data-type` to set the semantic variant. Each type applies a coloured background and accent colour to the title and icon. The type names are shared with toast — one vocabulary across all feedback components.

| `data-type` | Use for |
|---|---|
| `info` | Useful information users should know |
| `success` | Helpful advice, positive outcomes |
| `warning` | Urgent information to avoid problems |
| `danger` | Risks or negative outcomes |
| `accent` | Key information, emphasis |

### Info

<div class="demo-preview is-joined">
  <div class="callout" data-type="info">
    <div class="callout-title">Note</div>
    <p class="callout-description">Useful information that users should know.</p>
  </div>
</div>

```html
<div class="callout" data-type="info">
  <div class="callout-title">Note</div>
  <p class="callout-description">Useful information that users should know.</p>
</div>
```

### Success

<div class="demo-preview is-joined">
  <div class="callout" data-type="success">
    <div class="callout-title">Tip</div>
    <p class="callout-description">Helpful advice for doing things better.</p>
  </div>
</div>

```html
<div class="callout" data-type="success">
  <div class="callout-title">Tip</div>
  <p class="callout-description">Helpful advice for doing things better.</p>
</div>
```

### Warning

<div class="demo-preview is-joined">
  <div class="callout" data-type="warning">
    <div class="callout-title">Warning</div>
    <p class="callout-description">Urgent information to avoid problems.</p>
  </div>
</div>

```html
<div class="callout" data-type="warning">
  <div class="callout-title">Warning</div>
  <p class="callout-description">Urgent information to avoid problems.</p>
</div>
```

### Danger

<div class="demo-preview is-joined">
  <div class="callout" data-type="danger">
    <div class="callout-title">Caution</div>
    <p class="callout-description">Risks or negative outcomes of certain actions.</p>
  </div>
</div>

```html
<div class="callout" data-type="danger">
  <div class="callout-title">Caution</div>
  <p class="callout-description">Risks or negative outcomes of certain actions.</p>
</div>
```

### Accent

<div class="demo-preview is-joined">
  <div class="callout" data-type="accent">
    <div class="callout-title">Important</div>
    <p class="callout-description">Key information users need to know.</p>
  </div>
</div>

```html
<div class="callout" data-type="accent">
  <div class="callout-title">Important</div>
  <p class="callout-description">Key information users need to know.</p>
</div>
```

---

## Callout with icon

Add the `data-icon` boolean attribute to enable a two-column grid layout with the icon pinned alongside the title.

<div class="demo-preview is-joined">
  <div class="callout" data-type="info" data-icon>
    {{icon:info}}
    <div class="callout-title">Note</div>
    <p class="callout-description">This callout has an icon for extra visual context.</p>
  </div>
</div>

```html
<div class="callout" data-type="info" data-icon>
  <div class="svg-icn" data-icon="info"><!-- info SVG --></div>
  <div class="callout-title">Note</div>
  <p class="callout-description">This callout has an icon for extra visual context.</p>
</div>
```

How it works:

- `data-icon` switches the callout to a two-column CSS grid
- The `.svg-icn` is pinned to row 1, column 1 — vertically centered with the title
- `.callout-title` and `.callout-description` auto-flow into column 2

### Recommended icons

| Type | Icon | Shorthand |
|---|---|---|
| `info` | {{icon:info}} Info circle | `{{icon:info}}` |
| `success` | {{icon:bolt}} Lightning bolt | `{{icon:bolt}}` |
| `warning` | {{icon:warning}} Warning triangle | `{{icon:warning}}` |
| `danger` | {{icon:close-circled}} Close circle | `{{icon:close-circled}}` |
| `accent` | {{icon:exclamation}} Exclamation circle | `{{icon:exclamation}}` |

### All types with icons

<div class="demo-preview is-joined">
  <div class="callout" data-type="info" data-icon>
    {{icon:info}}
    <div class="callout-title">Note</div>
    <p class="callout-description">Useful information that users should know.</p>
  </div>
</div>

<div class="demo-preview is-joined">
  <div class="callout" data-type="success" data-icon>
    {{icon:bolt}}
    <div class="callout-title">Tip</div>
    <p class="callout-description">Helpful advice for doing things better.</p>
  </div>
</div>

<div class="demo-preview is-joined">
  <div class="callout" data-type="warning" data-icon>
    {{icon:warning}}
    <div class="callout-title">Warning</div>
    <p class="callout-description">Urgent information to avoid problems.</p>
  </div>
</div>

<div class="demo-preview is-joined">
  <div class="callout" data-type="danger" data-icon>
    {{icon:close-circled}}
    <div class="callout-title">Caution</div>
    <p class="callout-description">Risks or negative outcomes of certain actions.</p>
  </div>
</div>

<div class="demo-preview is-joined">
  <div class="callout" data-type="accent" data-icon>
    {{icon:exclamation}}
    <div class="callout-title">Important</div>
    <p class="callout-description">Key information users need to know.</p>
  </div>
</div>

---

## Usage rules

| Do | Don't |
|---|---|
| Use `data-type` for semantic meaning | Use colour to decorate without purpose |
| Keep callout content concise | Put entire sections inside callouts |
| Use `.callout-title` for labeling | Use headings (h1–h6) inside callouts |
| Use recommended icons for visual consistency | Add icons to every callout — use only when they add clarity |
| Customise `--status-*` tokens per project | Hardcode colours on individual callouts |
