---
title: "Typography"
subtitle: "Type scale, weights, and reading rhythm"
description: "Complete reference for typography tokens including font scale, line height, font weight, and letter spacing."
author: "Studio"
section: "Design System"
layer: "foundation"
subsection: ""
order: 4
status: "published"
access: "team"
client: "internal"
---

Typography tokens provide a **consistent, modular system** for all text across the products. They are designed for **clarity, readability, and hierarchy**, while remaining flexible across devices.

The system uses four font families — a primary sans-serif for body and UI, a secondary display font for headings, a tertiary brand font for display and buttons, and a monospace for code. Fonts are self-hosted (Zalando Sans, Bugrino, IBM Plex Mono) or loaded via Adobe Typekit (trust-3a). For the full list of typography token values, see the [Tokens](tokens.html) page.

---

## Font Sizes

The full type scale used across the system. Reference these tokens when setting font sizes on any element.

The scale uses a **progressive step** approach: +2px in the body range, +4px in the heading range, and +8px in the display range. This gives more granularity where it matters most.

| Token | Value | px Equivalent | Step |
| --- | --- | --- | --- |
| `var(--font-3xs)` | 0.625rem | 10px | — |
| `var(--font-2xs)` | 0.75rem | 12px | +2px |
| `var(--font-xs)` | 0.875rem | 14px | +2px |
| `var(--font-s)` | 1rem | 16px | +2px |
| `var(--font-m)` | 1.125rem | 18px | +2px |
| `var(--font-l)` | 1.25rem | 20px | +2px |
| `var(--font-xl)` | 1.375rem | 22px | +2px |
| `var(--font-2xl)` | 1.5rem | 24px | +2px |
| `var(--font-3xl)` | 1.75rem | 28px | +4px |
| `var(--font-4xl)` | 2rem | 32px | +4px |
| `var(--font-5xl)` | 2.25rem | 36px | +4px |
| `var(--font-6xl)` | 2.5rem | 40px | +4px |
| `var(--font-7xl)` | 3rem | 48px | +8px |
| `var(--font-8xl)` | 3.5rem | 56px | +8px |
| `var(--font-9xl)` | 4rem | 64px | +8px |
| `var(--font-10xl)` | 4.5rem | 72px | +8px |

---

## Headings

All headings use `var(--font-secondary)` (trust-3a). `h1` and `h2` use the role-based type tokens (`--headline-*` and `--title-*`) with fluid `clamp()` sizing that scales smoothly with viewport width. Lower headings use fixed sizes from the type scale.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 1</p>
      <h1 style="margin: 0;">Build systems that scale with your ambition</h1>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 2</p>
      <h2 style="margin: 0;">Every detail contributes to the whole</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 3</p>
      <h3 style="margin: 0;">Structure creates clarity in complexity</h3>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 4</p>
      <h4 style="margin: 0;">Good defaults eliminate guesswork</h4>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 5</p>
      <h5 style="margin: 0;">Constraints unlock creative freedom</h5>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Heading 6</p>
      <h6 style="margin: 0;">Small decisions compound over time</h6>
    </div>
  </div>
</div>

```html
<h1>Build systems that scale with your ambition</h1>
<h2>Every detail contributes to the whole</h2>
<h3>Structure creates clarity in complexity</h3>
```

| Element | Size | Range | Line Height | Letter Spacing |
| --- | --- | --- | --- | --- |
| `h1` | `var(--headline-size)` | 32px → 56px (fluid) | `var(--line-height-s)` (1) | -0.02em |
| `h2` | `var(--title-size)` | 24px → 40px (fluid) | `var(--line-height-m)` (1.2) | -0.01em |
| `h3` | `var(--font-3xl)` | 28px | `var(--line-height-m)` (1.2) | — |
| `h4` | `var(--font-2xl)` | 24px | `var(--line-height-m)` (1.2) | — |
| `h5` | `var(--font-xl)` | 22px | `var(--line-height-m)` (1.2) | — |
| `h6` | `var(--font-xl)` | 22px | `var(--line-height-l)` (1.4) | — |

`h1` and `h2` use `clamp()` for fluid sizing — no media query breakpoints needed. Display text uses negative letter-spacing for tighter, more impactful headlines.

---

## Body Text

The default paragraph style used for all running content. The `var(--text-body)` token controls the base size globally — changing it updates paragraphs, inputs, code, tables, and buttons at once. Size modifier classes let you step up or down from the default.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Large</p>
      <p class="text-size-xlarge" style="margin: 0;">Lead paragraphs and hero text that needs to stand out from regular body copy.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <p class="text-size-large" style="margin: 0;">Introductory text and section summaries that sit between headings and body text in the hierarchy.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium (default)</p>
      <p style="margin: 0;">The default body text size. This is what you get without adding any size class — the baseline for all running content.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Small</p>
      <p class="text-size-small" style="margin: 0;">Secondary content, supporting details, and supplementary information that doesn't need to compete with body text for attention.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Small</p>
      <p class="text-size-xsmall" style="margin: 0;">Captions, footnotes, metadata, and fine print — available but not prominent.</p>
    </div>
  </div>
</div>

```html
<p class="text-size-xlarge">Lead paragraph text.</p>
<p class="text-size-large">Introductory text.</p>
<p>Default body text (no class needed).</p>
<p class="text-size-small">Smaller supporting text.</p>
<p class="text-size-xsmall">Captions and metadata.</p>
```

| Element | Token | px | Line Height | Value |
| --- | --- | --- | --- | --- |
| `.text-size-xlarge` | `var(--font-3xl)` | 28px | `var(--line-height-l)` | 1.4 |
| `.text-size-large` | `var(--font-xl)` | 22px | `var(--line-height-l)` | 1.4 |
| `p` (default) | `var(--font-m)` | 18px | `var(--line-height-l)` | 1.4 |
| `.text-size-small` | `var(--font-s)` | 16px | `var(--line-height-xl)` | 1.6 |
| `.text-size-xsmall` | `var(--font-xs)` | 14px | `var(--line-height-xl)` | 1.6 |

---

## Eyebrow

A small, uppercase label used to provide context above headings, within sections, or inline with other content. The `.eyebrow` class works on any element — `<p>`, `<span>`, `<h2>`, or anything else.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-s">
      <p class="eyebrow" style="margin: 0;">Case Study</p>
      <h2 style="margin: 0; color: var(--text-faded);">Building a design system from the ground up</h2>
      <p style="margin: 0; color: var(--text-faded);">A design system is more than a collection of components — it is a shared language between design and engineering.</p>
    </div>
    <div class="block gap-s">
      <span class="eyebrow">Latest Update</span>
      <h3 style="margin: 0; color: var(--text-faded);">New components added to the library</h3>
    </div>
    <div class="block gap-s">
      <h2 class="eyebrow" style="margin: 0;">Section Label</h2>
      <p style="margin: 0; color: var(--text-faded);">An eyebrow on an h2 resets it to the small uppercase style, useful when you need heading semantics without heading size.</p>
    </div>
  </div>
</div>

```html
<!-- On a paragraph -->
<p class="eyebrow">Case Study</p>
<h2>Building a design system from the ground up</h2>

<!-- On a span (inline) -->
<span class="eyebrow">Latest Update</span>

<!-- On a heading (semantic heading, eyebrow style) -->
<h2 class="eyebrow">Section Label</h2>

```

| Element | Token | Line Height | Value |
| --- | --- | --- | --- |
| `.eyebrow` | `var(--font-xs)` | `var(--line-height-m)` | 1.2 |

---

## Blockquote

Used for pullquotes and highlighted passages. Renders in the secondary serif font with a left border accent.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Short quote</p>
      <blockquote style="margin: 0;">
        <p>Good typography is invisible. Bad typography is everywhere.</p>
      </blockquote>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Long quote</p>
      <blockquote style="margin: 0;">
        <p>A design system is more than a collection of components — it is a shared language between design and engineering. When done well, it reduces inconsistency, speeds up delivery, and creates a foundation that scales with the product.</p>
      </blockquote>
    </div>
  </div>
</div>

```html
<blockquote>
  <p>Good typography is invisible. Bad typography is everywhere.</p>
</blockquote>
```

| Element | Token | Line Height | Value |
| --- | --- | --- | --- |
| `blockquote` | `var(--font-m)` | `var(--line-height-l)` | 1.4 |

---

## Links

Links use text-color underlines with a hover transition. The default state shows `var(--text-plain)` text with a `var(--text-link)` coloured underline. On hover, the text colour shifts to `var(--text-link)` and the underline moves down slightly. External links (`target="_blank"`) automatically show a share icon via `::after` that inherits the link colour.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Inline link</p>
      <p style="margin: 0;">Read the full <a href="#">brand guidelines</a> before starting any new project.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">External link</p>
      <p style="margin: 0;">Typography is powered by <a href="https://fonts.adobe.com/typekit" target="_blank" rel="noopener noreferrer">Adobe Typekit</a> and self-hosted variable fonts.</p>
    </div>
  </div>
</div>

```html
<!-- Inline link -->
<p>Read the full <a href="/brand">brand guidelines</a> before starting.</p>

<!-- External link (icon added automatically) -->
<p>Typography is powered by <a href="https://fonts.adobe.com/typekit" target="_blank" rel="noopener noreferrer">Adobe Typekit</a> and self-hosted variable fonts.</p>
```

| Property | Value |
| --- | --- |
| Default colour | `var(--text-plain)` |
| Underline colour | `var(--text-link)` |
| Hover colour | `var(--text-link)` |
| Underline offset | 2.5px → 4px on hover |
| Underline thickness | 1.5px |
| Transition | 0.3s all |
| External icon | `::after` on `a[target="_blank"]`, inherits `currentColor` |

---

## Font Families

The system uses four font stacks, each with a distinct role.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Primary — Zalando Sans</p>
      <p style="margin: 0; font-family: var(--font-primary); font-size: var(--font-3xl);">Typography is the voice of design</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Secondary — trust-3a</p>
      <p style="margin: 0; font-family: var(--font-secondary); font-size: var(--font-3xl);">Typography is the voice of design</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Tertiary — Bugrino</p>
      <p style="margin: 0; font-family: var(--font-tertiary); font-size: var(--font-3xl);">Typography is the voice of design</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Quaternary — IBM Plex Mono</p>
      <p style="margin: 0; font-family: var(--font-quaternary); font-size: var(--font-3xl);">Typography is the voice of design</p>
    </div>
  </div>
</div>

```css
body { font-family: var(--font-primary); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-secondary); }
code, pre, kbd { font-family: var(--font-quaternary); }
```

| Token | Font | Source | Used For |
| --- | --- | --- | --- |
| `var(--font-primary)` | Zalando Sans | Self-hosted (variable font) | Body text, UI, labels |
| `var(--font-secondary)` | trust-3a | Adobe Typekit | Headings, blockquotes |
| `var(--font-tertiary)` | Bugrino | Self-hosted (woff2) | Brand display, eyebrows, buttons, badges |
| `var(--font-quaternary)` | IBM Plex Mono | Self-hosted (ttf) | Code, pre, kbd |

---

## Font Weight

Available weight values from light to black. All headings default to regular weight.

<div class="demo-preview is-joined">
  <div class="block gap-s">
    <div class="block gap-m">
      <p class="demo-eyebrow">Light</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-light);">Design is not just what it looks like</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Regular</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-regular);">Systems scale when decisions are shared</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-medium);">Tokens turn intention into consistency</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Semi-Bold</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-semi-bold);">Structure creates clarity in complexity</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bold</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-bold);">Good defaults eliminate guesswork</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra-Bold</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-extra-bold);">Constraints unlock creative freedom</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Black</p>
      <div class="font-4xl" style="font-weight: var(--font-weight-black);">Build with purpose, not by accident</div>
    </div>
  </div>
</div>

```css
font-weight: var(--font-weight-bold);
```

| Token | Value |
| --- | --- |
| `var(--font-weight-light)` | 300 |
| `var(--font-weight-regular)` | 400 |
| `var(--font-weight-medium)` | 500 |
| `var(--font-weight-semi-bold)` | 600 |
| `var(--font-weight-bold)` | 700 |
| `var(--font-weight-extra-bold)` | 800 |
| `var(--font-weight-black)` | 900 |

---

## Line Height

Vertical rhythm values from tight display text to loose body copy. Headings use tighter values; body text uses looser values for readability.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Small</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-xs);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Small</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-s);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-m);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-l);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Large</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-xl);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">2X Large</p>
      <p class="text-size-large" style="margin: 0; line-height: var(--line-height-2xl);">Design tokens capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync across every surface.</p>
    </div>
  </div>
</div>

```css
line-height: var(--line-height-l);
```

| Token | Value | Used For |
| --- | --- | --- |
| `var(--line-height-xs)` | 0.7 | Tight display text |
| `var(--line-height-s)` | 1 | Tight display text |
| `var(--line-height-m)` | 1.2 | Headings, eyebrows |
| `var(--line-height-l)` | 1.4 | Body text, paragraphs |
| `var(--line-height-xl)` | 1.6 | Small text, captions |
| `var(--line-height-2xl)` | 1.8 | Spacious body text |

---

## Letter Spacing

Tracking values used for labels, eyebrows, and display text. Values are em-based so they scale proportionally with font size.

<div class="demo-preview is-joined">
  <div class="block gap-l">
    <div class="block gap-m">
      <p class="demo-eyebrow">Small</p>
      <div style="letter-spacing: var(--letter-spacing-s); font-size: var(--font-m); text-transform: uppercase; font-weight: var(--font-weight-semi-bold);">Design System Components</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Medium</p>
      <div style="letter-spacing: var(--letter-spacing-m); font-size: var(--font-m); text-transform: uppercase; font-weight: var(--font-weight-semi-bold);">Design System Components</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <div style="letter-spacing: var(--letter-spacing-l); font-size: var(--font-m); text-transform: uppercase; font-weight: var(--font-weight-semi-bold);">Design System Components</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Large</p>
      <div style="letter-spacing: var(--letter-spacing-xl); font-size: var(--font-m); text-transform: uppercase; font-weight: var(--font-weight-semi-bold);">Design System Components</div>
    </div>
  </div>
</div>

```css
letter-spacing: var(--letter-spacing-xl);
```

| Token | Value | Used For |
| --- | --- | --- |
| `var(--letter-spacing-xs)` | -0.03em | Negative tracking |
| `var(--letter-spacing-s)` | 0.03em | Subtle tracking |
| `var(--letter-spacing-m)` | 0.06em | Medium tracking |
| `var(--letter-spacing-l)` | 0.12em | Wide tracking |
| `var(--letter-spacing-xl)` | 0.24em | Eyebrows, labels |

---

## Type Roles

Four semantic roles compose the primitive tokens into building blocks. Each role defines four dimensions: size, weight, leading (line-height), and tracking (letter-spacing).

| Role | Size | Weight | Leading | Tracking | Used For |
| --- | --- | --- | --- | --- | --- |
| Headline | `clamp(--font-4xl, 1rem + 5vw, --font-8xl)` | 500 | `--line-height-s` (1) | -0.02em | Page hero, h1 |
| Title | `clamp(--font-2xl, 0.8rem + 2vw, --font-6xl)` | 500 | `--line-height-m` (1.2) | -0.01em | Section heads, h2 |
| Label | `--font-xs` (14px) | 500 | `--line-height-s` (1) | `--letter-spacing-m` (0.06em) | Eyebrows, meta, captions |
| Body | `--text-body` (18px) | 400 | `--line-height-xl` (1.6) | 0 | Running text |

```css
/* Use role tokens directly */
.custom-headline {
  font-size: var(--headline-size);
  font-weight: var(--headline-weight);
  line-height: var(--headline-leading);
  letter-spacing: var(--headline-tracking);
}
```

Headline and title sizes use `clamp()` for fluid scaling — they grow with the viewport between a minimum and maximum, with no breakpoints needed.
