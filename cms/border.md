---
title: "Border"
subtitle: "Composable border system"
description: "Guide to using the composable border architecture for flexible border styling."
section: "Design System"
subsection: ""
order: 5
slug: "border"
status: "published"
access: "team"
client: "internal"
---

Borders use a **composable architecture** that separates structural positioning from styling concerns. This approach keeps the system extensible without class explosion.

## Core Principles


- All border styling resolves through CSS variables

- **Structural** where the border appears (.border, .border-top, .border-bottom)
- **Width** how thick the border is (`.border-s`, `.border-m`, `.border-l`)
- **Style** how the line is drawn (`.border-solid`, `.border-dashed`, `.border-dotted`)
- **Color** what the border represents (`.border-primary`, `.border-secondary`, `.border-faded`)

All border styles resolve through CSS variables to keep behaviour consistent across the system.
Do not create combined classes like `.border-top-m` or hardcode border values inside structural classes.

---

## Border Structure

Structural classes define **where** the border appears, not how it looks.

| Class | Effect |
| --- | --- |
| `.border` | Border on all sides |
| `.border-top` | Border on top only |
| `.border-bottom` | Border on bottom only |
| `.border-left` | Border on left only |
| `.border-right` | Border on right only |

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap;">
    <div class="border" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border</div>
    <div class="border-top" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-top</div>
    <div class="border-bottom" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-bottom</div>
    <div class="border-left" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-left</div>
    <div class="border-right" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-right</div>
  </div>
</div>

#### Example

```html
<section class="border-bottom">
  <!-- Content with bottom border -->
</section>
```

---

## Border Width

Width combo classes modify the border thickness.

| Class | Width | Description |
| --- | --- | --- |
| `.border-s` | 1px | Small border (default) |
| `.border-m` | 2px | Medium border |
| `.border-l` | 4px | Large border |

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap;">
    <div class="border border-s" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-s (1px)</div>
    <div class="border border-m" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-m (2px)</div>
    <div class="border border-l" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-l (4px)</div>
  </div>
</div>

#### Example

```html
<div class="border border-m">
  <!-- Content with medium border on all sides -->
</div>
```

---

## Border Style

Style combo classes modify the border appearance.

| Class | Style | Description |
| --- | --- | --- |
| `.border-solid` | solid | Solid border (default) |
| `.border-dashed` | dashed | Dashed border |
| `.border-dotted` | dotted | Dotted border |

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap;">
    <div class="border border-solid" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-solid</div>
    <div class="border border-dashed" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-dashed</div>
    <div class="border border-dotted" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-dotted</div>
  </div>
</div>

#### Example

```html
<div class="border border-dashed">
  <!-- Content with dashed border -->
</div>
```

---

## Boder Color

Color combo classes modify the border color using semantic tokens.

| Class | Color | Description |
| --- | --- | --- |
| `.border-primary` | `var(--border-primary)` | Strong border (default) |
| `.border-secondary` | `var(--border-secondary)` | Secondary color border |
| `.border-faded` | `var(--border-faded)` | Faded border |

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap;">
    <div class="border border-primary" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-primary</div>
    <div class="border border-secondary" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-secondary</div>
    <div class="border border-faded" style="padding: var(--space-l) var(--space-xl); text-align: center; min-width: 8rem;">.border-faded</div>
  </div>
</div>

#### Example

```html
<div class="border border-secondary">
  <!-- Content with subtle border -->
</div>
```

---

## Limitations

Native CSS dashed/dotted borders do not support adjustable dash spacing. This system intentionally avoids SVG or background-based borders to maintain simplicity and performance.

---

## Rules

- Use the smallest possible number of classes
- Prefer semantic color tokens
- Keep the system extensible without class explosion
- Structural classes define position only
- Combo classes modify one concern each
- All styling resolves through CSS variables


