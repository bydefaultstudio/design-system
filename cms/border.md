---
title: "Border"
subtitle: "Composable borders — position, width, style, colour"
description: "Guide to using the composable border architecture for flexible border styling."
section: "Design System"
subsection: ""
order: 6
status: "published"
access: "team"
client: "internal"
---

Borders use a **composable architecture** that separates positioning from styling. Structural classes define where the border appears, and combo classes modify width, style, and color independently. For border token values, see the [Tokens](tokens.html) page.

---

## Structure

Structural classes define **where** the border appears. By default, borders use `--border-s` width, solid style, and `--border-primary` color.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">All sides</p>
      <div class="border padding-l">Content with border on all sides</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Top</p>
      <div class="border-top padding-l">Content with top border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bottom</p>
      <div class="border-bottom padding-l">Content with bottom border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Left</p>
      <div class="border-left padding-l">Content with left border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Right</p>
      <div class="border-right padding-l">Content with right border</div>
    </div>
  </div>
</div>

```html
<div class="border">All sides</div>
<div class="border-top">Top only</div>
<div class="border-bottom">Bottom only</div>
<div class="border-left">Left only</div>
<div class="border-right">Right only</div>
```

| Class | Effect |
| --- | --- |
| `.border` | Border on all sides |
| `.border-top` | Top only |
| `.border-bottom` | Bottom only |
| `.border-left` | Left only |
| `.border-right` | Right only |

---

## Width

Width classes modify the border thickness. The default is `--border-s`.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Small (default)</p>
      <div class="border border-s padding-l">1.5px border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium</p>
      <div class="border border-m padding-l">2px border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <div class="border border-l padding-l">4px border</div>
    </div>
  </div>
</div>

```html
<div class="border border-m">Medium border on all sides</div>
```

| Class | Token | px Equivalent |
| --- | --- | --- |
| `.border-s` | `--border-s` | 1.5px |
| `.border-m` | `--border-m` | 2px |
| `.border-l` | `--border-l` | 4px |

---

## Style

Style classes modify the border appearance. The default is solid.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Solid (default)</p>
      <div class="border border-solid padding-l">Solid border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Dashed</p>
      <div class="border border-dashed padding-l">Dashed border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Dotted</p>
      <div class="border border-dotted padding-l">Dotted border</div>
    </div>
  </div>
</div>

```html
<div class="border border-dashed">Dashed border</div>
```

| Class | Style |
| --- | --- |
| `.border-solid` | Solid (default) |
| `.border-dashed` | Dashed |
| `.border-dotted` | Dotted |

---

## Color

Color classes modify the border color using semantic tokens.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Primary (default)</p>
      <div class="border border-primary padding-l">Strong, prominent border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Secondary</p>
      <div class="border border-secondary padding-l">Medium, neutral border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Faded</p>
      <div class="border border-faded padding-l">Subtle, light border</div>
    </div>
  </div>
</div>

```html
<div class="border border-faded">Subtle border</div>
```

| Class | Token |
| --- | --- |
| `.border-primary` | `--border-primary` |
| `.border-secondary` | `--border-secondary` |
| `.border-faded` | `--border-faded` |

---

## Radius

Border radius tokens control corner rounding. Apply them directly via CSS — there are no utility classes for radius.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Small</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-xs);">4px radius</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Small</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-s);">6px radius</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-m);">10px radius</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-l);">16px radius</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Large</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-xl);">24px radius</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Pill</p>
      <div class="border border-faded padding-l" style="border-radius: var(--radius-pill);">Fully rounded</div>
    </div>
  </div>
</div>

```css
border-radius: var(--radius-m);
```

| Token | Value |
| --- | --- |
| `--radius-xs` | 4px |
| `--radius-s` | 6px |
| `--radius-m` | 10px |
| `--radius-l` | 16px |
| `--radius-xl` | 24px |
| `--radius-pill` | 999px |

---

## Composing Borders

Combine structural, width, style, and color classes to build any border you need. Each class modifies a single concern.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Top + medium + dashed + secondary</p>
      <div class="border-top border-m border-dashed border-secondary padding-l">Composed border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bottom + large + primary</p>
      <div class="border-bottom border-l border-primary padding-l">Composed border</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">All sides + faded + dotted</p>
      <div class="border border-faded border-dotted padding-l">Composed border</div>
    </div>
  </div>
</div>

```html
<div class="border-top border-m border-dashed border-secondary">
  Composed: top + medium + dashed + secondary
</div>
```
