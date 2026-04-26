---
title: "Layout"
subtitle: "How content is structured, spaced, and contained"
description: "How to use blocks, grids, containers, max-width utilities, and section spacing to compose page layouts."
author: "Studio"
section: "Design System"
layer: "foundation"
subsection: ""
order: 9
status: "published"
access: "team"
client: "internal"
---

Layout primitives control **structure and flow** — how content stacks, how columns form, and how sections are contained. They work with spacing tokens (see [Spacing](spacing.html)) but serve a different purpose: spacing defines distance, layout defines arrangement.

For the full page hierarchy (`body → page-wrapper → page-content → section → padding-global → container → block`), see the [Layout docs](../docs/layout.html).

---

## Blocks

A `.block` is a vertical flex stack with a default gap of `var(--space-m)` between children. It is the fundamental building block for content layout.

### Default gap

<div class="demo-preview">
  <div class="block border border-faded" style="padding: var(--space-l);">
    <div class="bg-faded" style="padding: var(--space-m);">First item</div>
    <div class="bg-faded" style="padding: var(--space-m);">Second item</div>
    <div class="bg-faded" style="padding: var(--space-m);">Third item</div>
  </div>
  <p class="text-size-xsmall text-faded"><code>.block</code> — default gap is <code>--space-m</code> (12px)</p>
</div>

```html
<div class="block">
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</div>
```

### Gap modifiers

Add `.gap-*` to control spacing between children. These work on both `.block` and `.grid`.

<div class="demo-preview">
  <div class="grid cols-2 gap-l">
    <div class="block gap-s">
      <div class="block gap-none border border-faded" style="padding: var(--space-l);">
        <div class="bg-faded" style="padding: var(--space-m);">First item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Second item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Third item</div>
      </div>
      <p class="text-size-xsmall text-faded"><code>.block .gap-none</code></p>
    </div>
    <div class="block gap-s">
      <div class="block gap-xs border border-faded" style="padding: var(--space-l);">
        <div class="bg-faded" style="padding: var(--space-m);">First item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Second item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Third item</div>
      </div>
      <p class="text-size-xsmall text-faded"><code>.block .gap-xs</code></p>
    </div>
    <div class="block gap-s">
      <div class="block gap-s border border-faded" style="padding: var(--space-l);">
        <div class="bg-faded" style="padding: var(--space-m);">First item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Second item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Third item</div>
      </div>
      <p class="text-size-xsmall text-faded"><code>.block .gap-s</code></p>
    </div>
    <div class="block gap-s">
      <div class="block gap-l border border-faded" style="padding: var(--space-l);">
        <div class="bg-faded" style="padding: var(--space-m);">First item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Second item</div>
        <div class="bg-faded" style="padding: var(--space-m);">Third item</div>
      </div>
      <p class="text-size-xsmall text-faded"><code>.block .gap-l</code></p>
    </div>
  </div>
</div>

| Class | Gap | Token |
|-------|-----|-------|
| `.gap-none` | 0 | `var(--space-none)` |
| `.gap-xs` | 4px | `var(--space-xs)` |
| `.gap-s` | 8px | `var(--space-s)` |
| `.gap-m` | 12px | `var(--space-m)` (default) |
| `.gap-l` | 16px | `var(--space-l)` |
| `.gap-xl` | 24px | `var(--space-xl)` |
| `.gap-2xl` | 32px | `var(--space-2xl)` |
| `.gap-3xl` | 48px | `var(--space-3xl)` |

### Horizontal row

Add `.row` to a block to switch from vertical stacking to horizontal layout. Use `.row-reverse` for right-to-left order.

<div class="demo-preview">
  <div class="block gap-s">
    <div class="block row gap-xl border border-faded" style="padding: var(--space-l);">
      <div class="bg-faded" style="padding: var(--space-m) var(--space-xl);">Left</div>
      <div class="bg-faded" style="padding: var(--space-m) var(--space-xl);">Centre</div>
      <div class="bg-faded" style="padding: var(--space-m) var(--space-xl);">Right</div>
    </div>
    <p class="text-size-xsmall text-faded"><code>.block .row .gap-xl</code></p>
  </div>
</div>

```html
<div class="block row gap-xl">
  <div>Left</div>
  <div>Centre</div>
  <div>Right</div>
</div>
```

### Alignment modifiers

Use alignment classes on `.block` (or `.block .row`) to control cross-axis and main-axis positioning.

| Class | Effect |
|-------|--------|
| `.align-start` | `align-items: flex-start` |
| `.align-center` | `align-items: center` |
| `.align-end` | `align-items: flex-end` |
| `.justify-center` | `justify-content: center` |
| `.justify-end` | `justify-content: flex-end` |

---

## Grid

CSS grid layout with column presets. The default is a responsive 2-column grid. Add `.cols-3` or `.cols-4` for more columns, and `.gap-*` to control gutter size.

### Default (2 columns)

<div class="demo-preview">
  <div class="block gap-s">
    <div class="grid border border-faded border-dashed" style="padding: var(--space-l);">
      <div class="bg-faded" style="padding: var(--space-m);">Item 1</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 2</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 3</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 4</div>
    </div>
    <p class="text-size-xsmall text-faded"><code>.grid</code> — default 2 columns, gap <code>--space-m</code></p>
  </div>
</div>

```html
<div class="grid">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### 3 columns

<div class="demo-preview">
  <div class="block gap-s">
    <div class="grid cols-3 border border-faded border-dashed" style="padding: var(--space-l);">
      <div class="bg-faded" style="padding: var(--space-m);">Item 1</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 2</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 3</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 4</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 5</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 6</div>
    </div>
    <p class="text-size-xsmall text-faded"><code>.grid .cols-3</code></p>
  </div>
</div>

```html
<div class="grid cols-3">
  <div>Item 1</div>
  <div>Item 2</div>
  ...
</div>
```

### 4 columns with small gap

<div class="demo-preview">
  <div class="block gap-s">
    <div class="grid cols-4 gap-s border border-faded border-dashed" style="padding: var(--space-l);">
      <div class="bg-faded" style="padding: var(--space-m);">Item 1</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 2</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 3</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 4</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 5</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 6</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 7</div>
      <div class="bg-faded" style="padding: var(--space-m);">Item 8</div>
    </div>
    <p class="text-size-xsmall text-faded"><code>.grid .cols-4 .gap-s</code></p>
  </div>
</div>

| Class | Columns |
|-------|---------|
| `.grid` | 2 columns (default) |
| `.cols-3` | 3 columns |
| `.cols-4` | 4 columns |

---

## Containers

Containers centre content and cap its maximum width. Use them inside sections to control content density.

<div class="demo-preview is-joined">
  <div style="background: var(--background-faded); padding: var(--space-l) 0;">
    <div class="container-s" style="background: var(--background-primary); padding: var(--space-l); border: var(--border-s) solid var(--border-faded);">
      <p style="text-align: center;"><code>.container-s</code> — 640px</p>
    </div>
  </div>
  <div style="background: var(--background-faded); padding: var(--space-l) 0;">
    <div class="container-m" style="background: var(--background-primary); padding: var(--space-l); border: var(--border-s) solid var(--border-faded);">
      <p style="text-align: center;"><code>.container-m</code> — 1040px</p>
    </div>
  </div>
  <div style="background: var(--background-faded); padding: var(--space-l) 0;">
    <div class="container-l" style="background: var(--background-primary); padding: var(--space-l); border: var(--border-s) solid var(--border-faded);">
      <p style="text-align: center;"><code>.container-l</code> — 1200px</p>
    </div>
  </div>
</div>

```html
<div class="container-s">Narrow content</div>
<div class="container-m">Standard content</div>
<div class="container-l">Wide content</div>
```

| Class | Max Width | Use Case |
|-------|-----------|----------|
| `.container-s` | 640px | Long-form text, forms, narrow content |
| `.container-m` | 1040px | Standard page content |
| `.container-l` | 1200px | Dashboards, wide layouts |

### Rules

- Containers add `margin-left: auto` and `margin-right: auto` — they centre themselves
- Containers set `width: 100%` so they fill available space up to the max-width
- Nest containers inside `.padding-global` for consistent page margins

---

## Max-Width Utilities

Max-width utilities cap width **without centring**. Use them on individual elements that need a width constraint but should stay in normal flow.

| Class | Max Width |
|-------|-----------|
| `.max-width-s` | 640px |
| `.max-width-m` | 960px |
| `.max-width-l` | 1200px |
| `.max-width-full` | 100% |

```html
<p class="max-width-s">This paragraph won't exceed 640px.</p>
```

### Containers vs Max-Width

- **Container** = max-width + auto margins (centred)
- **Max-width** = max-width only (stays in flow, left-aligned)

---

## Padding Global

`.padding-global` adds consistent horizontal padding to the page. It is applied once per section row, wrapping the container.

```html
<section>
  <div class="padding-global">
    <div class="container-m">
      <!-- Content here -->
    </div>
  </div>
</section>
```

| Class | Effect |
|-------|--------|
| `.padding-global` | `padding-left: var(--space-xl)` + `padding-right: var(--space-xl)` |

---

## Padding Utilities

General-purpose padding utilities for spacing inside elements.

| Class | Value | Token |
|-------|-------|-------|
| `.padding-s` | 8px | `var(--space-s)` |
| `.padding-m` | 12px | `var(--space-m)` |
| `.padding-l` | 16px | `var(--space-l)` |
| `.padding-xl` | 24px | `var(--space-xl)` |
| `.padding-2xl` | 32px | `var(--space-2xl)` |
| `.padding-3xl` | 48px | `var(--space-3xl)` |

---

## Key Rules

- **Blocks** control micro spacing (`.gap-*` between children)
- **Grids** control column layout — use `.gap-*` for gutters
- **Containers** control width and centring — never apply spacing directly to them
- **Sections** control macro spacing (`.top-*`, `.bottom-*` classes)
- Never mix responsibilities across layers
- Never use spacer divs or apply margins inside blocks
- Always use gap utilities for spacing between siblings, not margin on individual children
