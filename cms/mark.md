---
title: "Mark, Abbr & Figure"
subtitle: "Highlighted text, abbreviations, and media captions"
description: "How to use mark, abbr, and figure elements in the design system."
section: "Design System"
subsection: "Content"
order: 10
slug: "mark"
status: "published"
access: "team"
client: "internal"
---

The design system styles three semantic HTML elements for inline and block-level content enrichment.

---

## Highlighted text (mark)

The `<mark>` element highlights text with a yellow background. In dark mode, the background shifts to a semi-transparent yellow.

<div class="demo-preview">
  <p>This is <mark>highlighted text</mark> within a paragraph.</p>
</div>

```html
<p>This is <mark>highlighted text</mark> within a paragraph.</p>
```

---

## Abbreviations (abbr)

The `<abbr>` element indicates an abbreviation or acronym. It renders with a dotted underline and shows the full text on hover via the native `title` attribute.

<div class="demo-preview">
  <p>The design system uses <abbr title="Cascading Style Sheets">CSS</abbr> custom properties for all tokens.</p>
</div>

```html
<p>The design system uses <abbr title="Cascading Style Sheets">CSS</abbr> custom properties.</p>
```

---

## Figure and figcaption

The `<figure>` element wraps media content (images, code blocks, diagrams) with an optional `<figcaption>` for descriptive text.

<div class="demo-preview">
  <figure>
    <div style="background: var(--background-faded); padding: var(--space-3xl); text-align: center; border-radius: var(--radius-m);">Image placeholder</div>
    <figcaption>Caption text describing the image above.</figcaption>
  </figure>
</div>

```html
<figure>
  <img src="image.jpg" alt="Description">
  <figcaption>Caption text describing the image above.</figcaption>
</figure>
```

---

## Accessibility notes

- `<mark>` is announced by some screen readers as "highlighted" — use it for genuinely highlighted content, not for visual styling
- `<abbr>` with `title` shows its expansion on hover — for critical abbreviations, spell out the full term on first use in the text
- `<figure>` images must have meaningful `alt` text; `<figcaption>` provides supplementary context, not a replacement for `alt`

---

## Do / Don't

**Do:**
- Use `<mark>` for search result highlights or key phrases
- Use `<abbr>` for technical acronyms with a `title` attribute
- Use `<figure>` for any media that benefits from a caption

**Don't:**
- Don't use `<mark>` as a general-purpose text highlighter for emphasis — use `<strong>` or `<em>`
- Don't omit `title` on `<abbr>` — it is the only way to convey the expansion
- Don't use `<figcaption>` without a parent `<figure>`
