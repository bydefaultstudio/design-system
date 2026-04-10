---
title: "SVG Best Practices"
subtitle: "How to optimise SVG files for the web"
description: "Practical techniques for reducing SVG file size and keeping page load times fast."
section: "Docs"
subsection: "Code Standards"
order: 5
status: "published"
access: "team"
client: "internal"
---

SVGs are lightweight by default, but vector software often exports bloated files with unnecessary precision, hidden elements, and metadata. These techniques help you produce clean, minimal SVGs before they reach the codebase.

For automated cleanup, use the [SVG Cleaner](../tools/svg-cleaner.html) tool.

---

## Before You Export

The most impactful optimisations happen in your vector editor, before you ever look at the code.

### Reduce anchor points

Every anchor point adds characters to the path data. Vector software prioritises precision and often adds points where they aren't needed. Use your editor's simplify path tool to remove redundant anchors without visible difference.

- **Illustrator:** Object > Path > Simplify, or the Smooth tool
- **Figma:** Flatten selection, then remove unnecessary points manually

### Remove invisible elements

Delete anything that adds nothing visually:

- Elements completely behind other opaque shapes
- Elements outside the `viewBox` boundary
- Hidden layers or groups with `display: none`
- Empty `<g>` groups with no children

### Simplify hidden sections

If part of a path is behind another element or clipped by the `viewBox`, remove the unseen curves and anchors. The visible result is identical, but the path data is shorter.

### Design on whole pixels

Place anchor points on whole pixel values to avoid long decimals like `300.78000001` in the output. In Illustrator, use pixel snapping mode. This eliminates rounding issues at the source.

---

## Path Optimisation

### Round decimals

SVG exports often contain excessive decimal precision. Rounding `20.500001` to `20.5` (or even `21`) usually produces no visible difference. The SVG Cleaner's `var(--precision)` flag automates this.

Start with 2 decimal places and compare visually. For simple shapes, 1 or even 0 decimal places may be sufficient.

### Combine paths with the same style

Multiple paths that share the same fill, stroke, and other attributes can be merged into a single `<path>` element by combining their `d` attributes:

```html
<!-- Before: two separate paths -->
<path d="M38 106l232-87-108 154z" fill="#333"/>
<path d="M235 5l289 72-95-152z" fill="#333"/>

<!-- After: combined into one -->
<path d="M38 106l232-87-108 154zm235 5l289 72-95-152z" fill="#333"/>
```

In Illustrator: select all shapes, then Object > Compound Path > Make.

### Use the right element

Paths are versatile, but sometimes a `<circle>` or `<rect>` produces shorter code:

```html
<!-- Circle is shorter than the equivalent path -->
<circle cx="54" cy="54" r="54"/>

<!-- Path is shorter than rect for simple rectangles -->
<path d="M10 10h123v123H10z"/>
```

### Choose between fill and stroke

Outlining a stroke roughly doubles the anchor count. If your design can work with a stroke, keep it as a stroke rather than expanding to a filled path.

---

## Code Cleanup

### Strip metadata and comments

Vector editors add export comments, `data-name` attributes, and tool-specific class names (e.g. Illustrator's `.cls-1`). These serve no purpose in the browser. The SVG Cleaner strips comments with `var(--strip-comments)` and metadata with `var(--strip-metadata)`.

### Remove unnecessary whitespace

Spaces, newlines, and commas in path data are often optional. The SVG Cleaner's `var(--minify)` flag handles this:

| Before | After |
|---|---|
| `M 250, -125 V 375 L 40, 60` | `M250-125V375L40 60` |

### Group elements with shared styles

If multiple elements share the same attributes, wrap them in a `<g>` tag to avoid repeating the attribute on each element:

```html
<g fill="purple">
  <rect x="90" y="60" width="80" height="80"/>
  <rect x="260" y="60" width="80" height="80"/>
  <rect x="430" y="60" width="80" height="80"/>
</g>
```

### Use `<use>` for duplicates

The `<use>` element creates copies of a shape without duplicating the path data:

```html
<rect id="square" fill="purple" x="90" y="60" width="80" height="80"/>
<use href="#square" x="170"/>
<use href="#square" x="340"/>
```

---

## SVG Cleaner Flags

The [SVG Cleaner](../tools/svg-cleaner.html) automates most of these optimisations. See the [SVG Cleaner docs](../docs/svg-cleaner.html) for the full flag reference.

| Flag | What it does |
|---|---|
| `var(--strip-comments)` | Removes XML/HTML comments |
| `var(--strip-metadata)` | Removes `data-*` attributes and editor class names |
| `--precision N` | Rounds decimal values to N places |
| `var(--minify)` | Collapses whitespace and optimises path data |
| `var(--current-color)` | Sets all path fills to `currentColor` |
| `var(--size)` | Replaces width/height with `100%` |

---

## Checklist

Before adding an SVG to the codebase:

- [ ] Unnecessary anchor points removed in vector editor
- [ ] No invisible or out-of-bounds elements
- [ ] Decimals rounded to reasonable precision
- [ ] Comments and editor metadata stripped
- [ ] Paths with identical styles combined where possible
- [ ] Run through the SVG Cleaner with appropriate flags
