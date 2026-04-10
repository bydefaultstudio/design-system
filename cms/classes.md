---
title: "Classes"
subtitle: "Every utility class in one place"
description: "Every utility class in BrandOS — text, color, spacing, layout, and borders. Click any class to copy."
section: "Design System"
subsection: ""
order: 2
status: "published"
access: "team"
client: "internal"
---

A flat reference of every utility class in the system. Click any class, value, or token to copy it. For the full architecture and live demos see [Typography](typography.html), [Color](color.html), [Spacing](spacing.html), [Border](border.html), and [HTML Layout](../docs/layout.html).

Every chip on this page follows the same convention so the markdown source matches what gets copied:

- `` `.class-name` `` → utility class, copies `.class-name`
- `` `var(--token-name)` `` → CSS variable, copies `var(--token-name)`
- `` `#abc123` `` → hex colour, copies `#abc123` and renders a swatch

---

## Text Size

Two scales sit side by side. The semantic scale is the default — reach for `.text-size-medium` for body and only drop to the granular `.font-*` classes when you need a precise step on the type ramp.

### Semantic sizes

| Class | Token | Value |
| --- | --- | --- |
| `.text-size-xsmall` | `var(--font-xs)` | `14px` |
| `.text-size-small` | `var(--font-s)` | `16px` |
| `.text-size-medium` | `var(--font-m)` | `18px` |
| `.text-size-large` | `var(--font-xl)` | `22px` |
| `.text-size-xlarge` | `var(--font-3xl)` | `28px` |

### Granular scale

| Class | Token | Value |
| --- | --- | --- |
| `.font-2xs` | `var(--font-2xs)` | `12px` |
| `.font-xs` | `var(--font-xs)` | `14px` |
| `.font-s` | `var(--font-s)` | `16px` |
| `.font-m` | `var(--font-m)` | `18px` |
| `.font-l` | `var(--font-l)` | `20px` |
| `.font-xl` | `var(--font-xl)` | `22px` |
| `.font-2xl` | `var(--font-2xl)` | `24px` |
| `.font-3xl` | `var(--font-3xl)` | `28px` |
| `.font-4xl` | `var(--font-4xl)` | `32px` |
| `.font-5xl` | `var(--font-5xl)` | `36px` |
| `.font-6xl` | `var(--font-6xl)` | `40px` |
| `.font-7xl` | `var(--font-7xl)` | `48px` |
| `.font-8xl` | `var(--font-8xl)` | `56px` |
| `.font-9xl` | `var(--font-9xl)` | `64px` |
| `.font-10xl` | `var(--font-10xl)` | `72px` |

---

## Text Color

Semantic intent — never reach for primitive color tokens directly.

| Class | Token | Description |
| --- | --- | --- |
| `.text-primary` | `var(--text-primary)` | Default body text |
| `.text-secondary` | `var(--text-secondary)` | Supporting text |
| `.text-plain` | `var(--text-plain)` | Pure black |
| `.text-faded` | `var(--text-faded)` | De-emphasised text |
| `.text-accent` | `var(--text-accent)` | Accent / highlight |
| `.text-link` | `var(--text-link)` | Link color |

---

## Background Color

| Class | Token | Description |
| --- | --- | --- |
| `.bg-primary` | `var(--background-primary)` | Off-white page background |
| `.bg-secondary` | `var(--background-secondary)` | Warm white alternate |
| `.bg-plain` | `var(--background-plain)` | Pure white |
| `.bg-faded` | `var(--background-faded)` | Subtle tinted background |

---

## Section Spacing

Macro vertical rhythm — apply to a `<section>` to control the space above or below it. Values shrink on mobile.

| Class | Token | Desktop | Mobile |
| --- | --- | --- | --- |
| `.top-small` | `var(--section-s)` | `32px` | `24px` |
| `.top-medium` | `var(--section-m)` | `64px` | `32px` |
| `.top-large` | `var(--section-l)` | `96px` | `56px` |
| `.top-xl` | `var(--section-xl)` | `160px` | `80px` |
| `.bottom-small` | `var(--section-s)` | `32px` | `24px` |
| `.bottom-medium` | `var(--section-m)` | `64px` | `32px` |
| `.bottom-large` | `var(--section-l)` | `96px` | `56px` |
| `.bottom-xl` | `var(--section-xl)` | `160px` | `80px` |

---

## Gap

Micro spacing for `.block` and `.grid` — sets the gap between flex or grid children.

| Class | Token | Value |
| --- | --- | --- |
| `.gap-none` | `var(--space-none)` | `0px` |
| `.gap-xs` | `var(--space-xs)` | `4px` |
| `.gap-s` | `var(--space-s)` | `8px` |
| `.gap-m` | `var(--space-m)` | `12px` |
| `.gap-l` | `var(--space-l)` | `16px` |
| `.gap-xl` | `var(--space-xl)` | `24px` |
| `.gap-2xl` | `var(--space-2xl)` | `32px` |
| `.gap-3xl` | `var(--space-3xl)` | `40px` |

`.block` defaults to `.gap-m` (12px) when no gap class is added.

---

## Padding

| Class | Token | Value |
| --- | --- | --- |
| `.padding-global` | `var(--space-xl)` | Edge-safe horizontal padding for every screen |
| `.padding-s` | `var(--space-s)` | `8px` |
| `.padding-m` | `var(--space-m)` | `12px` |
| `.padding-l` | `var(--space-l)` | `16px` |
| `.padding-xl` | `var(--space-xl)` | `24px` |
| `.padding-2xl` | `var(--space-2xl)` | `32px` |
| `.padding-3xl` | `var(--space-3xl)` | `40px` |

---

## Containers & Max-widths

Containers center their content with `auto` margins. Max-widths only constrain — no centering.

### Containers

| Class | Width | Description |
| --- | --- | --- |
| `.container-small` | `640px` | Narrow centered container |
| `.container-medium` | `1040px` | Default readable width |
| `.container-large` | `1200px` | Wide centered layouts |

### Max-widths

| Class | Width | Description |
| --- | --- | --- |
| `.max-width-small` | `640px` | Narrow constraint |
| `.max-width-medium` | `960px` | Medium constraint |
| `.max-width-large` | `1200px` | Wide constraint |
| `.max-width-full` | `100%` | No constraint |

---

## Layout Primitives

Structural classes that compose the page hierarchy: `.body` → `.page-wrapper` → `.page-content` → `.section` → `.padding-global` → `.container-medium` → `.block`.

| Class | Behaviour | Description |
| --- | --- | --- |
| `.block` | flex column, `.gap-m` | Default content block — flex column with 12px gap |
| `.section` | semantic `<section>` | Vertical block, no special styling |
| `.fit-content` | `width: fit-content` | Shrink an element to its content width |

---

## Flex & Grid Modifiers

These modify `.block` (flex column by default) or `.grid` (2-column by default).

### Flex direction & alignment

| Class | Property | Description |
| --- | --- | --- |
| `.row` | `flex-direction: row` | Switch a `.block` to horizontal |
| `.row-reverse` | `flex-direction: row-reverse` | Reverse horizontal order |
| `.align-start` | `align-items: flex-start` | Cross-axis start |
| `.align-center` | `align-items: center` | Cross-axis center |
| `.align-end` | `align-items: flex-end` | Cross-axis end |
| `.justify-center` | `justify-content: center` | Main-axis center |
| `.justify-end` | `justify-content: flex-end` | Main-axis end |

### Grid

| Class | Property | Description |
| --- | --- | --- |
| `.grid` | `display: grid` | 2-column grid by default with `.gap-m` |
| `.cols-3` | `grid-template-columns: 1fr 1fr 1fr` | 3-column grid |
| `.cols-4` | `grid-template-columns: 1fr 1fr 1fr 1fr` | 4-column grid |

---

## Borders

The composable border system — combine one structural class with width, style, and color modifiers as needed. See [Border](border.html) for the full architecture.

### Structural

| Class | Description |
| --- | --- |
| `.border` | All four sides |
| `.border-top` | Top only |
| `.border-bottom` | Bottom only |
| `.border-left` | Left only |
| `.border-right` | Right only |

### Width

| Class | Token | Value |
| --- | --- | --- |
| `.border-s` | `var(--border-s)` | `1.5px` (default) |
| `.border-m` | `var(--border-m)` | `2px` |
| `.border-l` | `var(--border-l)` | `4px` |

### Style

| Class | Style |
| --- | --- |
| `.border-solid` | solid (default) |
| `.border-dashed` | dashed |
| `.border-dotted` | dotted |

### Color

| Class | Token | Description |
| --- | --- | --- |
| `.border-primary` | `var(--border-primary)` | Strong (default) |
| `.border-secondary` | `var(--border-secondary)` | Medium |
| `.border-faded` | `var(--border-faded)` | Subtle |

---

## Image Aspect Ratios

Lock an image to a fixed ratio. Use on the `<img>` element directly.

| Class | Ratio | Description |
| --- | --- | --- |
| `.img-1x1` | 1:1 | Square |
| `.img-3x2` | 3:2 | Standard photo |
| `.img-4x3` | 4:3 | Classic |
| `.img-16x9` | 16:9 | Widescreen |
| `.img-21x9` | 21:9 | Cinematic |

---

## Helpers

| Class | Property | Description |
| --- | --- | --- |
| `.eyebrow` | small uppercase label | Section eyebrows above headings |
| `.is-hidden` | `display: none !important` | Global visibility helper |

---

## Use tokens directly

A few things have **tokens but no utility classes** — apply the token via `var(...)` directly in CSS.

| Concern | Tokens |
| --- | --- |
| Font weight | `var(--font-weight-light)`, `var(--font-weight-regular)`, `var(--font-weight-medium)`, `var(--font-weight-semi-bold)`, `var(--font-weight-bold)`, `var(--font-weight-extra-bold)`, `var(--font-weight-black)` |
| Line height | `var(--line-height-xs)`, `var(--line-height-s)`, `var(--line-height-m)`, `var(--line-height-l)`, `var(--line-height-xl)`, `var(--line-height-2xl)` |
| Letter spacing | `var(--letter-spacing-s)`, `var(--letter-spacing-m)`, `var(--letter-spacing-l)`, `var(--letter-spacing-xl)` |
| Border radius | `var(--radius-xs)`, `var(--radius-s)`, `var(--radius-m)`, `var(--radius-l)`, `var(--radius-xl)`, `var(--radius-pill)` |
| Text alignment | use raw CSS `text-align` |

Every token name above is still copyable — click to grab `var(--token-name)` for your stylesheet.
