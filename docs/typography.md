---
title: "Typography"
subtitle: "Typography tokens and text components"
description: "Complete reference for typography tokens including font scale, line height, font weight, and letter spacing."
section: "Design System"
order: 3
---

Typography tokens provide a **consistent, modular system** for all text across the products. They are designed for **clarity, readability, and hierarchy**, while remaining flexible across devices.

The system uses three font families — a primary sans-serif for body and UI, a secondary serif for headings, and a tertiary monospace for code and labels. Each text element is composed from a deliberate combination of size, weight, line height, and spacing tokens. This means you never set raw CSS values for text — you always reference a token.

---

## Element Reference

This table shows the complete token set applied to each text element in the design system. Use it as a quick lookup when building or reviewing layouts.

| Element | Font Size | Line Height | Weight | Family | Extra |
| --- | --- | --- | --- | --- | --- |
| **h1** | `--font-6xl` (4rem) | `--line-height-s` (1) | `--font-weight-regular` (400) | `--font-secondary` | — |
| **h2** | `--font-5xl` (3.4375rem) | `--line-height-s` (1) | `--font-weight-regular` (400) | `--font-secondary` | — |
| **h3** | `--font-4xl` (3rem) | `1.1` | `--font-weight-regular` (400) | `--font-secondary` | — |
| **h4** | `--font-3xl` (2.5rem) | `1.1` | `--font-weight-regular` (400) | `--font-secondary` | — |
| **h5** | `--font-2xl` (2rem) | `--line-height-s` (1) | `--font-weight-regular` (400) | `--font-secondary` | — |
| **h6** | `--font-l` (1.375rem) | `--line-height-l` (1.4) | `--font-weight-regular` (400) | `--font-secondary` | — |
| **body / p** | `--font-m` (1.125rem) | `--line-height-l` (1.4) | `--font-weight-regular` (400) | `--font-primary` | — |
| **.text-size-small** | `--font-s` (1rem) | `--line-height-xl` (1.6) | `--font-weight-regular` (400) | `--font-primary` | — |
| **.text-size-xsmall** | `--font-xs` (0.875rem) | `--line-height-xl` (1.6) | `--font-weight-regular` (400) | `--font-primary` | — |
| **.eyebrow** | `--font-xs` (0.875rem) | `--line-height-m` (1.3) | `--font-weight-extra-bold` (800) | `--font-primary` | `letter-spacing: --letter-spacing-xl` · `text-transform: uppercase` |
| **blockquote** | inherits body | inherits body | inherits body | `--font-secondary` | `border-left` · `padding-left` |

> All headings (h1–h6) share `margin-top: --space-xl` and `margin-bottom: --space-l`. Body text color is `--text-primary` for all elements.

---

## Font Size

Font size tokens define the typographic scale for all text elements. They use `rem` units and scale automatically via the root font-size — no per-token mobile overrides needed.

The root font-size uses `clamp(14px, 0.5rem + 1vw, 16px)` for fluid scaling between 14px (small screens) and 16px (large screens). All `rem`-based tokens scale uniformly with it.

| Token | Value (rem) | Desktop (16px root) | Mobile (14px root) |
| --- | --- | --- | --- |
| `--font-2xs` | 0.75rem | 12px | 10.5px |
| `--font-xs` | 0.875rem | 14px | 12.25px |
| `--font-s` | 1rem | 16px | 14px |
| `--font-m` | 1.125rem | 18px | 15.75px |
| `--font-l` | 1.375rem | 22px | 19.25px |
| `--font-xl` | 1.75rem | 28px | 24.5px |
| `--font-2xl` | 2rem | 32px | 28px |
| `--font-3xl` | 2.5rem | 40px | 35px |
| `--font-4xl` | 3rem | 48px | 42px |
| `--font-5xl` | 3.4375rem | 55px | 48.125px |
| `--font-6xl` | 4rem | 64px | 56px |
| `--font-7xl` | 4.5rem | 72px | 63px |

**Usage:**

```css
h1 {
  font-size: var(--font-3xl);
}

p {
  font-size: var(--font-m);
}
```

---

## Line Height

Line height tokens control the vertical rhythm of text, ensuring consistent spacing between lines. They help establish visual hierarchy and improve readability.

| Token | Value | Usage |
| --- | --- | --- |
| `--line-height-s` | 1 | Tight line height for headings (H1, H2) |
| `--line-height-m` | 1.3 | Medium line height for subheadings and UI elements |
| `--line-height-l` | 1.4 | Loose line height for body text and paragraphs |
| `--line-height-xl` | 1.6 | Extra loose line height |
| `--line-height-2xl` | 1.8 | Maximum line height for spacious text |

**Usage:**

```css
h1 {
  line-height: var(--line-height-s);
}

p {
  line-height: var(--line-height-l);
}
```

---

## Font Weight

Font weight tokens provide a consistent scale for text emphasis and hierarchy. They enable precise control over typographic weight across the design system.

| Token | Value | Description |
| --- | --- | --- |
| `--font-weight-light` | 300 | Light weight |
| `--font-weight-regular` | 400 | Regular/normal weight |
| `--font-weight-medium` | 500 | Medium weight |
| `--font-weight-semi-bold` | 600 | Semi-bold weight |
| `--font-weight-bold` | 700 | Bold weight |
| `--font-weight-extra-bold` | 800 | Extra-bold weight |
| `--font-weight-black` | 900 | Black/heavy weight |

**Usage:**

```css
body {
  font-weight: var(--font-weight-regular);
}

h1 {
  font-weight: var(--font-weight-bold);
}
```

---

## Letter Spacing

Letter spacing tokens control the horizontal spacing between characters. They use em-based values for proportional scaling with font size, ensuring consistent spacing regardless of the font size used.

| Token | Value | Description |
| --- | --- | --- |
| `--letter-spacing-s` | 0.03em | Small letter spacing |
| `--letter-spacing-m` | 0.06em | Medium letter spacing |
| `--letter-spacing-l` | 0.08em | Large letter spacing |
| `--letter-spacing-xl` | 0.11em | Extra large letter spacing |

**Usage:**

```css
.eyebrow {
  letter-spacing: var(--letter-spacing-m);
}
```
