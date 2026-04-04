---
title: "Typography"
subtitle: "Typography tokens and text components"
description: "Complete reference for typography tokens including font scale, line height, font weight, and letter spacing."
section: "Design System"
subsection: ""
order: 3
slug: "typography"
status: "published"
access: "team"
client: "internal"
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

<div class="demo-preview is-joined type-demo">
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
  <p>Body text — the default paragraph style used for all running content.</p>
  <p class="text-size-small">Small text — used for secondary content and supporting details.</p>
  <p class="text-size-xsmall">Extra small text — used for captions, footnotes, and metadata.</p>
  <p class="eyebrow">Eyebrow Label</p>
  <blockquote>Blockquote — used for pullquotes and highlighted passages.</blockquote>
</div>

```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
<p>Body text paragraph.</p>
<p class="text-size-small">Small text.</p>
<p class="text-size-xsmall">Extra small text.</p>
<p class="eyebrow">Eyebrow Label</p>
<blockquote>Blockquote text.</blockquote>
```

> All headings (h1–h6) share `margin-top: --space-xl` and `margin-bottom: --space-l`. Body text color is `--text-primary` for all elements.

---

## Font Size

Font size tokens define the typographic scale for all text elements. They use `rem` units and scale with the root font-size (16px).

| Token | Value (rem) | Pixel equivalent |
| --- | --- | --- |
| `--font-2xs` | 0.75rem | 12px |
| `--font-xs` | 0.875rem | 14px |
| `--font-s` | 1rem | 16px |
| `--font-m` | 1.125rem | 18px |
| `--font-l` | 1.375rem | 22px |
| `--font-xl` | 1.75rem | 28px |
| `--font-2xl` | 2rem | 32px |
| `--font-3xl` | 2.5rem | 40px |
| `--font-4xl` | 3rem | 48px |
| `--font-5xl` | 3.4375rem | 55px |
| `--font-6xl` | 4rem | 64px |
| `--font-7xl` | 4.5rem | 72px |

<div class="demo-preview is-joined">
  <div class="block gap-s">
    <div style="font-size: var(--font-2xs);">--font-2xs (0.75rem / 12px)</div>
    <div style="font-size: var(--font-xs);">--font-xs (0.875rem / 14px)</div>
    <div style="font-size: var(--font-s);">--font-s (1rem / 16px)</div>
    <div style="font-size: var(--font-m);">--font-m (1.125rem / 18px)</div>
    <div style="font-size: var(--font-l);">--font-l (1.375rem / 22px)</div>
    <div style="font-size: var(--font-xl);">--font-xl (1.75rem / 28px)</div>
    <div style="font-size: var(--font-2xl);">--font-2xl (2rem / 32px)</div>
    <div style="font-size: var(--font-3xl);">--font-3xl (2.5rem / 40px)</div>
    <div style="font-size: var(--font-4xl);">--font-4xl (3rem / 48px)</div>
    <div style="font-size: var(--font-5xl);">--font-5xl (3.4375rem / 55px)</div>
    <div style="font-size: var(--font-6xl);">--font-6xl (4rem / 64px)</div>
    <div style="font-size: var(--font-7xl);">--font-7xl (4.5rem / 72px)</div>
  </div>
</div>

```css
h1 {
  font-size: var(--font-3xl);
}
```

---

## Body Text Token

`--text-body` is a semantic token that controls the font size for all body-level text: paragraphs, code, inputs, tables, and buttons. Changing this single token updates all of them at once.

| Token | Default value | Applies to |
| --- | --- | --- |
| `--text-body` | `var(--font-m)` (18px) | body, code, pre, kbd, samp, inputs, textarea, select, buttons |

**To change body text size globally**, edit one line in `design-system.css`:

```css
--text-body: var(--font-l); /* bump all body text to 22px */
```

Elements with independent sizing (headings, labels, legends, small button variants, display classes) are not affected.

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

<div class="demo-preview is-joined">
  <div class="block row gap-xl" style="flex-wrap: wrap; align-items: flex-start;">
    <div style="line-height: var(--line-height-s); max-width: 18rem; padding: var(--space-m); background: var(--background-faded);">
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">line-height-s (1)</p>
      Typography tokens provide a consistent, modular system for all text across the products. They are designed for clarity, readability, and hierarchy.
    </div>
    <div style="line-height: var(--line-height-m); max-width: 18rem; padding: var(--space-m); background: var(--background-faded);">
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">line-height-m (1.3)</p>
      Typography tokens provide a consistent, modular system for all text across the products. They are designed for clarity, readability, and hierarchy.
    </div>
    <div style="line-height: var(--line-height-l); max-width: 18rem; padding: var(--space-m); background: var(--background-faded);">
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">line-height-l (1.4)</p>
      Typography tokens provide a consistent, modular system for all text across the products. They are designed for clarity, readability, and hierarchy.
    </div>
    <div style="line-height: var(--line-height-xl); max-width: 18rem; padding: var(--space-m); background: var(--background-faded);">
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">line-height-xl (1.6)</p>
      Typography tokens provide a consistent, modular system for all text across the products. They are designed for clarity, readability, and hierarchy.
    </div>
    <div style="line-height: var(--line-height-2xl); max-width: 18rem; padding: var(--space-m); background: var(--background-faded);">
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">line-height-2xl (1.8)</p>
      Typography tokens provide a consistent, modular system for all text across the products. They are designed for clarity, readability, and hierarchy.
    </div>
  </div>
</div>

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

<div class="demo-preview is-joined">
  <div class="block gap-s" style="font-size: var(--font-l);">
    <div style="font-weight: var(--font-weight-light);">Light (300) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-regular);">Regular (400) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-medium);">Medium (500) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-semi-bold);">Semi-Bold (600) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-bold);">Bold (700) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-extra-bold);">Extra-Bold (800) — The quick brown fox</div>
    <div style="font-weight: var(--font-weight-black);">Black (900) — The quick brown fox</div>
  </div>
</div>

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

<div class="demo-preview is-joined">
  <div class="block gap-l">
    <div>
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">letter-spacing-s (0.03em)</p>
      <div style="letter-spacing: var(--letter-spacing-s); font-size: var(--font-l); text-transform: uppercase;">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">letter-spacing-m (0.06em)</p>
      <div style="letter-spacing: var(--letter-spacing-m); font-size: var(--font-l); text-transform: uppercase;">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">letter-spacing-l (0.08em)</p>
      <div style="letter-spacing: var(--letter-spacing-l); font-size: var(--font-l); text-transform: uppercase;">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: var(--space-xs);">letter-spacing-xl (0.11em)</p>
      <div style="letter-spacing: var(--letter-spacing-xl); font-size: var(--font-l); text-transform: uppercase;">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
    </div>
  </div>
</div>

```css
.eyebrow {
  letter-spacing: var(--letter-spacing-m);
}
```
