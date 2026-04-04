---
title: "Callout"
subtitle: "Callout and alert component guidelines"
description: "How to use callout styles and semantic variants in the design system."
section: "Design System"
subsection: ""
order: 9
slug: "callout"
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

Callout variants are powered by status color tokens defined in `:root`. These are project-customizable primitives:

| Token | Default | Purpose |
|---|---|---|
| `--status-info` | `var(--green)` | Informational, notes |
| `--status-success` | `#1a7f37` | Tips, positive feedback |
| `--status-warning` | `#9a6700` | Warnings, attention needed |
| `--status-danger` | `#cf222e` | Caution, destructive actions |
| `--status-accent` | `#8250df` | Important, emphasis |

Each status color generates two semantic tokens:
- `--callout-{type}` — the border/title color
- `--callout-{type}-bg` — a 10% tint for the background

---

## Base Callout

The `.callout` class provides the structural foundation:

<div class="demo-preview is-joined">
  <div class="callout">
    <p>General-purpose highlighted content.</p>
  </div>
</div>

```html
<div class="callout">
  <p>General-purpose highlighted content.</p>
</div>
```

**Structural properties:**
- Left border using `--border-l` width (4px)
- Padding using spacing tokens
- Neutral background (`--background-faded`)
- First/last child margin normalization

---

## Callout Title

Use `.callout-title` inside any callout for a styled heading:

<div class="demo-preview is-joined">
  <div class="callout callout-note">
    <div class="callout-title">Note</div>
    <p>Content here.</p>
  </div>
</div>

```html
<div class="callout callout-note">
  <div class="callout-title">Note</div>
  <p>Content here.</p>
</div>
```

The title inherits the variant's accent color automatically.

---

## Variants

### Note (`.callout-note`)

For useful information users should know, even when skimming.

<div class="demo-preview is-joined">
  <div class="callout callout-note">
    <div class="callout-title">Note</div>
    <p>Useful information that users should know.</p>
  </div>
</div>

```html
<div class="callout callout-note">
  <div class="callout-title">Note</div>
  <p>Useful information that users should know.</p>
</div>
```

### Tip (`.callout-tip`)

For helpful advice on doing things better or more easily.

<div class="demo-preview is-joined">
  <div class="callout callout-tip">
    <div class="callout-title">Tip</div>
    <p>Helpful advice for doing things better.</p>
  </div>
</div>

```html
<div class="callout callout-tip">
  <div class="callout-title">Tip</div>
  <p>Helpful advice for doing things better.</p>
</div>
```

### Warning (`.callout-warning`)

For urgent information that needs immediate attention.

<div class="demo-preview is-joined">
  <div class="callout callout-warning">
    <div class="callout-title">Warning</div>
    <p>Urgent information to avoid problems.</p>
  </div>
</div>

```html
<div class="callout callout-warning">
  <div class="callout-title">Warning</div>
  <p>Urgent information to avoid problems.</p>
</div>
```

### Caution (`.callout-caution`)

For advising about risks or negative outcomes.

<div class="demo-preview is-joined">
  <div class="callout callout-caution">
    <div class="callout-title">Caution</div>
    <p>Risks or negative outcomes of certain actions.</p>
  </div>
</div>

```html
<div class="callout callout-caution">
  <div class="callout-title">Caution</div>
  <p>Risks or negative outcomes of certain actions.</p>
</div>
```

### Important (`.callout-important`)

For key information users need to achieve their goal.

<div class="demo-preview is-joined">
  <div class="callout callout-important">
    <div class="callout-title">Important</div>
    <p>Key information users need to know.</p>
  </div>
</div>

```html
<div class="callout callout-important">
  <div class="callout-title">Important</div>
  <p>Key information users need to know.</p>
</div>
```

---

## Rules

| Do | Don't |
|---|---|
| Use semantic variants for meaning | Use color to decorate without purpose |
| Keep callout content concise | Put entire sections inside callouts |
| Use `.callout-title` for labeling | Use headings (h1–h6) inside callouts |
| Customize `--status-*` tokens per project | Hardcode colors on individual callouts |

---

## Relationship to Alerts

The site also includes an `.alert` component (`.alert-note`, `.alert-tip`, `.alert-important`, `.alert-warning`, `.alert-caution`) for inline callout boxes — typically used in documentation content. These share the same colour tokens as the design system callouts.

The design system callouts (`.callout`) are the **structured, project-wide** equivalent with icon support and richer layout. For simple inline messages, use `.alert`. For prominent UI callouts, use `.callout`.
