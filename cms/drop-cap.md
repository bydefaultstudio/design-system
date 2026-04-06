---
title: "Drop Cap"
subtitle: "Decorative initial letters for editorial and long-form paragraphs"
description: "How to use the drop cap style for decorative initial letters."
section: "Design System"
subsection: "Content"
order: 7
slug: "drop-cap"
status: "published"
access: "team"
client: "internal"
---

A drop cap styles the first letter of a paragraph as a large decorative initial that the surrounding text wraps around. Apply it to the opening paragraph of an article or editorial piece.

---

## Usage

Add `.drop-cap` directly to a `<p>` element. The paragraph must be long enough for text to wrap alongside the letter — at least 3 full lines.

<div class="demo-preview">
  <p class="drop-cap">Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing, and is performed by typesetters, compositors, typographers, and graphic designers.</p>
</div>

```html
<p class="drop-cap">Your paragraph text...</p>
```

---

## Do / Don't

**Do:**

- Use on the opening paragraph of a long article or editorial piece
- Ensure the paragraph is long enough — at least 3 full lines of text alongside the drop cap
- Use once per section, not on every paragraph

**Don't:**

- Don't apply to short paragraphs — the float will break the layout
- Don't use on headings, lists, or elements other than `<p>`
- Don't use inside narrow containers like cards or sidebars
