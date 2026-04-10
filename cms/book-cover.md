---
title: "Book Cover"
subtitle: "The card variant used on overview and landing index pages"
description: "How to use the book-cover pattern to build scannable section index grids."
author: "Studio"
section: "Design System"
layer: "docs-site"
subsection: "Content"
order: 4
status: "published"
access: "team"
client: "internal"
---

The book cover is the card variant used on **overview and landing index pages** — the home page, brand-book index, design-system index, docs and tools indexes, and every client home page. Each card is the "cover" of a section the visitor can open: a short title, an optional one-line subtitle, and a generous square of negative space framed by a header and footer strip.

It pairs with `.grid.cols-2.gap-xl` for a calm, two-column index layout. The header and footer span the full width of the card. The centred title and subtitle sit between them, and every cover has the same minimum height so a row of mixed-length titles still reads as a uniform shelf.

---

## Anatomy

```
a.book-cover
  header.book-cover-header
    .icn-svg                ← open-full icon (top right, hover only)
  .book-cover-content
    .book-cover-title       ← short section name
    .book-cover-description ← one-line subtitle (optional)
  footer.book-cover-footer
    .book-cover-author      ← author label (left)
```

| Element | Class | Purpose |
|---|---|---|
| Wrapper | `a.book-cover` | Self-contained interactive card — no `.card` needed |
| Header | `header.book-cover-header` | Full-width strip with the open-full icon (top right, fades in on hover) |
| Content | `.book-cover-content` | Centred title + subtitle, fills the remaining vertical space |
| Title | `.book-cover-title` | Short section name (1–4 words) |
| Subtitle | `.book-cover-description` | One-line description (optional) |
| Footer | `footer.book-cover-footer` | Full-width strip with author (left), reserved for future meta on the right |
| Author | `.book-cover-author` | Author label, defaults to `Studio` |

Defaults:

- `min-height: 200px` — every cover has the same vertical presence
- `display: flex; flex-direction: column` — header pinned top, footer pinned bottom, content fills the middle and is centred
- `text-align: center` on the wrapper — title and subtitle are always centred
- Header and footer have a hairline `--card-border` separator
- Inherits `--card-background`, `--card-border`, and `--card-padding` from the card token scale, so it stays visually consistent with the rest of the system

---

## Single cover

<div class="demo-preview">
  <a href="#" class="book-cover">
    <header class="book-cover-header">{{icon:open-full}}</header>
    <div class="book-cover-content">
      <h3 class="book-cover-title">Brand Book</h3>
      <p class="book-cover-description" data-text-wrap="pretty">Brand identity, values, positioning, and visual guidelines</p>
    </div>
    <footer class="book-cover-footer">
      <span class="book-cover-author"><em>by</em> Studio</span>
    </footer>
  </a>
</div>

```html
<a href="brand/" class="book-cover">
  <header class="book-cover-header">
    <div class="icn-svg" data-icon="open-full"><!-- inline svg --></div>
  </header>
  <div class="book-cover-content">
    <h3 class="book-cover-title">Brand Book</h3>
    <p class="book-cover-description" data-text-wrap="pretty">Brand identity, values, positioning, and visual guidelines</p>
  </div>
  <footer class="book-cover-footer">
    <span class="book-cover-author"><em>by</em> Studio</span>
  </footer>
</a>
```

For auto-generated covers (the doc generator builds these from `cms/*.md` frontmatter), set the author with the `author:` frontmatter field — it falls back to `Studio` when omitted.

```yaml
---
title: "Brand Book"
author: "Erlen"
---
```

---

## Index grid

Use `.grid.cols-2.gap-xl` for the standard overview layout. Two columns gives every section room to breathe and keeps the page scannable.

<div class="demo-preview">
  <div class="grid cols-2 gap-xl">
    <a href="#" class="book-cover">
      <header class="book-cover-header">{{icon:open-full}}</header>
      <div class="book-cover-content">
        <h3 class="book-cover-title">Brand Book</h3>
        <p class="book-cover-description" data-text-wrap="pretty">Brand identity, values, positioning, and visual guidelines</p>
      </div>
      <footer class="book-cover-footer">
        <span class="book-cover-author"><em>by</em> Studio</span>
      </footer>
    </a>
    <a href="#" class="book-cover">
      <header class="book-cover-header">{{icon:open-full}}</header>
      <div class="book-cover-content">
        <h3 class="book-cover-title">Design System</h3>
        <p class="book-cover-description" data-text-wrap="pretty">Tokens, components, and styling patterns</p>
      </div>
      <footer class="book-cover-footer">
        <span class="book-cover-author"><em>by</em> Erlen</span>
      </footer>
    </a>
    <a href="#" class="book-cover">
      <header class="book-cover-header">{{icon:open-full}}</header>
      <div class="book-cover-content">
        <h3 class="book-cover-title">Tools</h3>
        <p class="book-cover-description" data-text-wrap="pretty">Utilities for ad operations, SVG processing, and more</p>
      </div>
      <footer class="book-cover-footer">
        <span class="book-cover-author"><em>by</em> Studio</span>
      </footer>
    </a>
    <a href="#" class="book-cover">
      <header class="book-cover-header">{{icon:open-full}}</header>
      <div class="book-cover-content">
        <h3 class="book-cover-title">Documentation</h3>
        <p class="book-cover-description" data-text-wrap="pretty">Technical docs for layout, CSS, JavaScript, and project setup</p>
      </div>
      <footer class="book-cover-footer">
        <span class="book-cover-author"><em>by</em> Studio</span>
      </footer>
    </a>
  </div>
</div>

```html
<div class="grid cols-2 gap-xl">
  <a href="brand/" class="book-cover">
    <header class="book-cover-header">{{icon:open-full}}</header>
    <div class="book-cover-content">
      <h3 class="book-cover-title">Brand Book</h3>
      <p class="book-cover-description" data-text-wrap="pretty">Brand identity, values, positioning, and visual guidelines</p>
    </div>
    <footer class="book-cover-footer">
      <span class="book-cover-author"><em>by</em> Studio</span>
    </footer>
  </a>
  <!-- repeat for each section -->
</div>
```

---

## Resizing the shelf

Change the `min-height` on `.book-cover` in `design-system.css` to resize every cover at once. Don't override per-card — the consistent height is what makes the index read as a shelf.

```css
.book-cover {
  min-height: 200px; /* edit this */
}
```

---

## Do / Don't

**Do:**

- Use `.book-cover` on **overview and landing index pages** — wherever the visitor is choosing a section to open
- Pair with `.grid.cols-2.gap-xl` — two columns is the canonical index layout
- Keep titles short (1–4 words) so they don't wrap to a third line
- Keep subtitles to one sentence — `data-text-wrap="pretty"` will handle the line breaks
- Use it as a self-contained class — no `.card` or `.card--interactive` needed alongside

**Don't:**

- Don't use `.book-cover` for editorial cards inside an article — use `.card.card--interactive` for that
- Don't override `min-height` per-card — uniform height is the point
- Don't put extra content inside `.book-cover-content` — the centred slot is title + subtitle only
- Don't swap the header icon per-card — keeping `open-full` everywhere is what tells the visitor "this opens"
- Don't combine with `.card` — `.book-cover` is fully standalone and ships with its own background, border, and hover states
- Don't mix `.book-cover` and `.card.card--interactive` in the same grid — pick one pattern per surface
