---
title: "Spacing"
subtitle: "Spacing tokens and units"
description: "Complete reference for spacing tokens including units, space tokens, section spacing, and border tokens."
section: "Design System"
order: 4
---

Spacing tokens define **distance**, not intent. They are reused for gaps, padding, and margins depending on context.

## Unit Tokens

Units act as the basic measure for spacing, typography, and layout tokens.

They represent neutral values and best used in **semantic tokens and utility classes**, rather than applied directly in layouts or components. Using units in this way ensures spacing and sizing stay consistent, predictable, and easy to update across the system without creating individual values.

| Unit | px | rem |
| --- | --- | --- |
| `none` | 0 | 0 |
| `2xs` | 2 | 0.125 |
| `xs` | 4 | 0.25 |
| `s` | 8 | 0.5 |
| `m` | 12 | 0.75 |
| `l` | 16 | 1 |
| `xl` | 24 | 1.5 |
| `2xl` | 32 | 2 |
| `3xl` | 40 | 2.5 |
| `4xl` | 48 | 3 |
| `5xl` | 56 | 3.5 |
| `6xl` | 64 | 4 |
| `7xl` | 72 | 4.5 |
| `8xl` | 80 | 5 |
| `9xl` | 88 | 5.5 |
| `10xl` | 96 | 6 |
| `11xl` | 104 | 6.5 |
| `12xl` | 112 | 7 |
| `13xl` | 120 | 7.5 |
| `14xl` | 160 | 10 |

**Usage:**

```css
:root {
  --space-m: var(--m);
  --space-l: var(--l);
}
```

---

## Space Tokens

Space tokens provide responsive spacing values that scale between desktop and mobile devices. They are used for gaps, padding, and margins to maintain consistent spacing throughout the interface.

| Token | Desktop | Mobile |
| --- | --- | --- |
| `--space-xs` | `XS` | `XS` |
| `--space-s` | `S` | `XS` |
| `--space-m` | `M` | `S` |
| `--space-l` | `L` | `M` |
| `--space-xl` | `XL` | `L` |
| `--space-2xl` | `2XL` | `XL` |
| `--space-3xl` | `3XL` | `2XL` |
| `--space-4xl` | `4XL` | `2XL` |
| `--space-6xl` | `6XL` | `4XL` |

**Usage:**

```css
.card {
  padding: var(--space-m);
  margin-bottom: var(--space-l);
}
```

---

## Padding

Padding utilities apply internal padding to elements. These are convenience utilities for quick spacing adjustments.

| Class | Spacing |
| --- | --- |
| `.padding-s` | `var(--space-s)` |
| `.padding-m` | `var(--space-m)` |
| `.padding-l` | `var(--space-l)` |
| `.padding-xl` | `var(--space-xl)` |
| `.padding-2xl` | `var(--space-2xl)` |
| `.padding-3xl` | `var(--space-3xl)` |

**Usage**

```html
<div class="padding-m">
  <!-- Content with medium padding on all sides -->
</div>
```

**Important**

- These utilities apply internal padding only (all sides).
- They are convenience utilities for quick spacing adjustments.
- They do not replace section spacing or layout primitives.
- For section-level spacing, use section spacing combo classes (see Layout).
- For component-level spacing, prefer blocks with gap modifiers.

---

## Section Spacing

Section spacing tokens control the **vertical rhythm between sections**. They scale responsively between desktop and mobile.

| Token | Desktop | Mobile |
| --- | --- | --- |
| `--section-xs` | XL | L |
| `--section-s` | 2XL | XL |
| `--section-m` | 6XL | 2XL |
| `--section-l` | 10XL | 5XL |
| `--section-xl` | 14XL | 8XL |

**Usage:**

```css
.top-small {
  padding-top: var(--section-s);
}
```
