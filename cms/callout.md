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

Callouts are used to **highlight important information** within content. They draw attention to notes, tips, warnings, and other contextual messages.

---

## Core Principles

- Callouts use a **base + variant** pattern (like buttons and borders)
- The base `.callout` class provides structure and neutral styling
- Variant classes add semantic color via left border and background tint
- All colors are controlled by semantic tokens that can be customized per project

---

## Status Color Tokens

Callout variants are powered by status color tokens defined in `:root`. Each status has a foreground and background token:

| Token | Default | Purpose |
|---|---|---|
| `var(--status-info)` | `var(--blue)` | Informational, notes |
| `var(--status-info-bg)` | `var(--blue-lighter)` | Info background |
| `var(--status-success)` | `var(--green)` | Tips, positive feedback |
| `var(--status-success-bg)` | `var(--green-lighter)` | Success background |
| `var(--status-warning)` | `var(--yellow-darker)` | Warnings, attention needed |
| `var(--status-warning-bg)` | `var(--yellow-lighter)` | Warning background |
| `var(--status-danger)` | `var(--red)` | Caution, destructive actions |
| `var(--status-danger-bg)` | `var(--red-lighter)` | Danger background |
| `var(--status-accent)` | `var(--purple)` | Important, emphasis |
| `var(--status-accent-bg)` | `var(--purple-lighter)` | Accent background |

Callouts, badges, and other components reference these tokens directly — no intermediate `--callout-*` layer needed.

---

## Base Callout

The `.callout` class provides the structural foundation:

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

**Structural properties:**
- Left border using `var(--border-l)` width (4px)
- Padding using spacing tokens
- Neutral background (`var(--background-faded)`)
- First/last child margin normalization

---

## Callout Title

Use `.callout-title` inside any callout for a styled heading:

<div class="demo-preview is-joined">
  <div class="callout callout-note">
    <div class="callout-title">Note</div>
    <p class="callout-description">Content here.</p>
  </div>
</div>

```html
<div class="callout callout-note">
  <div class="callout-title">Note</div>
  <p class="callout-description">Content here.</p>
</div>
```

The title inherits the variant's accent color automatically.

---

## Callout with Icon

Icons are **optional**. Add `.callout--icon` to the `.callout` element to enable the icon layout. No wrapper div needed — the icon, title, and description are all direct children with their own classes.

<div class="demo-preview is-joined">
  <div class="callout callout-note callout--icon">
    {{icon:info}}
    <div class="callout-title">Note</div>
    <p class="callout-description">This callout has an icon for extra visual context.</p>
  </div>
</div>

```html
<div class="callout callout-note callout--icon">
  <div class="icn-svg" data-icon="info"><!-- info SVG --></div>
  <div class="callout-title">Note</div>
  <p class="callout-description">This callout has an icon for extra visual context.</p>
</div>
```

**How it works:**
- `.callout--icon` switches the callout to a two-column CSS grid
- The `.icn-svg` is pinned to row 1, column 1 — vertically centered with the title via `align-self: center`
- `.callout-title` and `.callout-description` auto-flow into column 2
- The icon stays aligned with the title regardless of title font size (`font-s`, `h2`, `h3`, etc.)
- To remove the icon, drop `.callout--icon` and the `.icn-svg`

| Class | Role |
|---|---|
| `.callout--icon` | Enables two-column grid layout |
| `.icn-svg` | Icon (direct child, pinned to row 1, vertically centered with title) |
| `.callout-title` | Title text (row 1, column 2) |
| `.callout-description` | Description content (below title, column 2) |

---

## Recommended Icons

Each variant has a suggested icon for visual consistency. These are recommendations — any brand icon can be used.

| Variant | Icon | Shorthand |
|---|---|---|
| `.callout-note` | {{icon:info}} Info circle | `{{icon:info}}` |
| `.callout-tip` | {{icon:bolt}} Lightning bolt | `{{icon:bolt}}` |
| `.callout-warning` | {{icon:warning}} Warning triangle | `{{icon:warning}}` |
| `.callout-caution` | {{icon:close-circled}} Close circle | `{{icon:close-circled}}` |
| `.callout-important` | {{icon:exclamation}} Exclamation circle | `{{icon:exclamation}}` |

---

## Variants

### Note (`.callout-note`)

For useful information users should know, even when skimming.

<div class="demo-preview is-joined">
  <div class="callout callout-note">
    <div class="callout-title">Note</div>
    <p class="callout-description">Useful information that users should know.</p>
  </div>
</div>

```html
<div class="callout callout-note">
  <div class="callout-title">Note</div>
  <p class="callout-description">Useful information that users should know.</p>
</div>
```

With icon:

<div class="demo-preview is-joined">
  <div class="callout callout-note callout--icon">
    {{icon:info}}
    <div class="callout-title">Note</div>
    <p class="callout-description">Useful information that users should know.</p>
  </div>
</div>

```html
<div class="callout callout-note callout--icon">
  <div class="icn-svg" data-icon="info"><!-- info SVG --></div>
  <div class="callout-title">Note</div>
  <p class="callout-description">Useful information that users should know.</p>
</div>
```

### Tip (`.callout-tip`)

For helpful advice on doing things better or more easily.

<div class="demo-preview is-joined">
  <div class="callout callout-tip">
    <div class="callout-title">Tip</div>
    <p class="callout-description">Helpful advice for doing things better.</p>
  </div>
</div>

```html
<div class="callout callout-tip">
  <div class="callout-title">Tip</div>
  <p class="callout-description">Helpful advice for doing things better.</p>
</div>
```

With icon:

<div class="demo-preview is-joined">
  <div class="callout callout-tip callout--icon">
    {{icon:bolt}}
    <div class="callout-title">Tip</div>
    <p class="callout-description">Helpful advice for doing things better.</p>
  </div>
</div>

```html
<div class="callout callout-tip callout--icon">
  <div class="icn-svg" data-icon="bolt"><!-- bolt SVG --></div>
  <div class="callout-title">Tip</div>
  <p class="callout-description">Helpful advice for doing things better.</p>
</div>
```

### Warning (`.callout-warning`)

For urgent information that needs immediate attention.

<div class="demo-preview is-joined">
  <div class="callout callout-warning">
    <div class="callout-title">Warning</div>
    <p class="callout-description">Urgent information to avoid problems.</p>
  </div>
</div>

```html
<div class="callout callout-warning">
  <div class="callout-title">Warning</div>
  <p class="callout-description">Urgent information to avoid problems.</p>
</div>
```

With icon:

<div class="demo-preview is-joined">
  <div class="callout callout-warning callout--icon">
    {{icon:warning}}
    <div class="callout-title">Warning</div>
    <p class="callout-description">Urgent information to avoid problems.</p>
  </div>
</div>

```html
<div class="callout callout-warning callout--icon">
  <div class="icn-svg" data-icon="warning"><!-- warning SVG --></div>
  <div class="callout-title">Warning</div>
  <p class="callout-description">Urgent information to avoid problems.</p>
</div>
```

### Caution (`.callout-caution`)

For advising about risks or negative outcomes.

<div class="demo-preview is-joined">
  <div class="callout callout-caution">
    <div class="callout-title">Caution</div>
    <p class="callout-description">Risks or negative outcomes of certain actions.</p>
  </div>
</div>

```html
<div class="callout callout-caution">
  <div class="callout-title">Caution</div>
  <p class="callout-description">Risks or negative outcomes of certain actions.</p>
</div>
```

With icon:

<div class="demo-preview is-joined">
  <div class="callout callout-caution callout--icon">
    {{icon:close-circled}}
    <div class="callout-title">Caution</div>
    <p class="callout-description">Risks or negative outcomes of certain actions.</p>
  </div>
</div>

```html
<div class="callout callout-caution callout--icon">
  <div class="icn-svg" data-icon="close-circled"><!-- close-circled SVG --></div>
  <div class="callout-title">Caution</div>
  <p class="callout-description">Risks or negative outcomes of certain actions.</p>
</div>
```

### Important (`.callout-important`)

For key information users need to achieve their goal.

<div class="demo-preview is-joined">
  <div class="callout callout-important">
    <div class="callout-title">Important</div>
    <p class="callout-description">Key information users need to know.</p>
  </div>
</div>

```html
<div class="callout callout-important">
  <div class="callout-title">Important</div>
  <p class="callout-description">Key information users need to know.</p>
</div>
```

With icon:

<div class="demo-preview is-joined">
  <div class="callout callout-important callout--icon">
    {{icon:exclamation}}
    <div class="callout-title">Important</div>
    <p class="callout-description">Key information users need to know.</p>
  </div>
</div>

```html
<div class="callout callout-important callout--icon">
  <div class="icn-svg" data-icon="exclamation"><!-- exclamation SVG --></div>
  <div class="callout-title">Important</div>
  <p class="callout-description">Key information users need to know.</p>
</div>
```

---

## Rules

| Do | Don't |
|---|---|
| Use semantic variants for meaning | Use color to decorate without purpose |
| Keep callout content concise | Put entire sections inside callouts |
| Use `.callout-title` for labeling | Use headings (h1–h6) inside callouts |
| Use recommended icons for visual consistency | Add icons to every callout — use them when they add clarity |
| Customize `--status-*` tokens per project | Hardcode colors on individual callouts |

---

## Relationship to Alerts

The site also includes an `.alert` component (`.alert-note`, `.alert-tip`, `.alert-important`, `.alert-warning`, `.alert-caution`) for inline callout boxes — typically used in documentation content. These share the same colour tokens as the design system callouts.

The design system callouts (`.callout`) are the **structured, project-wide** equivalent with icon support and richer layout. For simple inline messages, use `.alert`. For prominent UI callouts, use `.callout`.
