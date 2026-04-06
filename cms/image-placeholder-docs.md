---
title: "Image Placeholder"
subtitle: "Generate SVG placeholder images by URL"
description: "A URL-based SVG placeholder image generator. Set custom dimensions, colours, and text for rapid prototyping."
section: "Tools"
subsection: ""
order: 4
slug: "image-placeholder-docs"
status: "published"
access: "admin"
client: "internal"
toolUrl: "image-placeholder.html"
toolAccess: "public"
toolLabel: "Open Tool"
---

The Image Placeholder tool generates SVG placeholder images on the fly via URL parameters. Change the URL to change the image — no image libraries required.

---

## URL Schema

```
/image/[width]x[height]
/image/[width]
/image/[width]x[height]/[bgColor]
/image/[width]x[height]/[bgColor]/[fgColor]
/image/[width]x[height]/[bgColor]/[fgColor]?text=Hello+World
```

---

## Size

- `600x400` — width 600, height 400
- `400` — 400 × 400 square (height defaults to width)
- Minimum: 10 × 10 px
- Maximum: 4000 × 4000 px (values outside range are clamped silently)

---

## Colour

Colours are specified without `#` in the URL path.

| Format | Example | Notes |
|---|---|---|
| 6-digit hex | `ff0000` | Standard hex colour |
| 3-digit hex | `f00` | Expanded to `ff0000` internally |
| CSS name | `orange`, `white` | Full W3C CSS Color 3 list |
| Keyword | `transparent` | Renders a checkerboard pattern |

- Default background: `cccccc`
- Default text: `333333`
- Invalid values fall back to defaults silently

---

## Text

- `?text=Hello+World` — spaces via `+`
- `?text=Hello\nWorld` — literal `\n` in URL creates a line break
- Default label: the dimensions, e.g. `600 × 400`
- All text is HTML-escaped before embedding in the SVG

---

## Examples

```html
<!-- Basic -->
<img src="https://bydefault.design/image/800x400" alt="">

<!-- Square -->
<img src="https://bydefault.design/image/400" alt="">

<!-- CSS colour names -->
<img src="https://bydefault.design/image/600x400/orange/white" alt="">

<!-- Transparent background -->
<img src="https://bydefault.design/image/600x400/transparent/333333" alt="">

<!-- Multi-line label -->
<img src="https://bydefault.design/image/600x400?text=Hero\nSection" alt="">
```
