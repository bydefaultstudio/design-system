---
title: "Splide"
subtitle: "Lightweight carousel library — setup, extensions, and best practices"
description: "Quick reference for Splide slider setup across projects including CDN links, common configurations, and responsive patterns."
section: "Website"
subsection: "Libraries"
order: 2
---

# Splide

Quick reference for setting up and using Splide across projects.

## Setup

### CDN

```html
<!-- Core -->
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide-core.min.css">

<!-- Extensions (optional) -->
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-intersection@0.2.0/dist/js/splide-extension-intersection.min.js"></script>
```

### Extensions

| Extension | Purpose |
|-----------|---------|
| **AutoScroll** | Continuous ticker scrolling (logo bars, marquees) |
| **Intersection** | Pause/play based on viewport visibility |

## Required HTML Structure

```html
<div class="my-slider splide">
  <div class="splide__track">
    <ul class="splide__list">
      <li class="splide__slide">Slide 1</li>
      <li class="splide__slide">Slide 2</li>
      <li class="splide__slide">Slide 3</li>
    </ul>
  </div>
</div>
```

The `splide__track` and `splide__list` wrappers are required.

## Basic Pattern

```javascript
const el = document.querySelector('.my-slider');
if (!el) return;

const splide = new Splide(el, { type: "slide", perPage: 3, gap: "2rem" });
splide.mount();

// With extensions:
splide.mount({ AutoScroll });
```

## Best Practices

### Always Check Element Exists

```javascript
if (!document.querySelector('.slider')) return;
```

### Responsive Breakpoints

Use `max-width` logic — the value is the maximum screen width for that config:

```javascript
breakpoints: {
  991: { perPage: 2 },
  600: { perPage: 1 }
}
```

### Performance

- Avoid more than 3 Splide instances per page
- Use the Intersection extension to pause offscreen sliders
- Only use `autoWidth: true` when slide widths genuinely vary

### Loop Mode Requires Enough Slides

`type: "loop"` needs enough slides to fill the viewport. If too few, Splide falls back to `"slide"` mode silently.

## Common Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `"slide"` / `"loop"` / `"fade"` | Transition mode |
| `perPage` | number | Visible slides |
| `perMove` | number | Slides per advance |
| `gap` | string | CSS gap between slides |
| `speed` | number | Transition duration (ms) |
| `drag` | boolean / `"free"` | Dragging behavior |
| `snap` | boolean | Snap after free drag |
| `focus` | `"center"` / number | Active slide alignment |
| `autoWidth` | boolean | Use natural slide width |
| `rewind` | boolean | Loop back to start |
| `arrows` | boolean | Show prev/next arrows |
| `pagination` | boolean | Show dot navigation |
| `autoplay` | boolean | Auto-advance |
| `interval` | number | Autoplay interval (ms) |

## Troubleshooting

- **Not rendering**: Check `splide__track` and `splide__list` wrappers exist
- **Not looping**: Need enough slides to fill viewport in loop mode
- **AutoScroll not working**: Pass extension to mount: `splide.mount({ AutoScroll })`
- **Responsive not applying**: Breakpoints use max-width, check values don't conflict
