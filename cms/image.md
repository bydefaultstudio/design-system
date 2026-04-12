---
title: "Image"
subtitle: "Aspect ratios and responsive image patterns"
description: "Guide to using the image component with base styles and aspect-ratio combo classes."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 13
status: "published"
access: "team"
client: "internal"
---

Images use a **composable architecture** similar to borders. The `.img` base class provides consistent display behaviour, and aspect-ratio combo classes control proportions independently.

---

## Base Class

The `.img` class turns images into block-level elements with responsive width and cover-fit behaviour.

<div class="demo-preview">
  <img class="img" src="../assets/images/og/og-default.jpg" alt="Example image" style="max-width: 480px;">
</div>

```html
<img class="img" src="image.jpg" alt="Description">
```

| Property | Value | Purpose |
|---|---|---|
| `display` | `block` | Removes inline whitespace gap |
| `width` | `100%` | Fills container width |
| `height` | `auto` | Maintains natural aspect ratio |
| `object-fit` | `cover` | Crops to fill when aspect ratio is forced |

---

## Aspect Ratio Combos

Add an aspect-ratio class alongside `.img` to enforce proportions. The image will crop to fit using `object-fit: cover`.

### 1:1

<div class="demo-preview">
  <img class="img img-1x1" src="../assets/images/og/og-default.jpg" alt="1:1 aspect ratio" style="max-width: 240px;">
</div>

```html
<img class="img img-1x1" src="image.jpg" alt="Description">
```

### 3:2

<div class="demo-preview">
  <img class="img img-3x2" src="../assets/images/og/og-default.jpg" alt="3:2 aspect ratio" style="max-width: 360px;">
</div>

```html
<img class="img img-3x2" src="image.jpg" alt="Description">
```

### 4:3

<div class="demo-preview">
  <img class="img img-4x3" src="../assets/images/og/og-default.jpg" alt="4:3 aspect ratio" style="max-width: 360px;">
</div>

```html
<img class="img img-4x3" src="image.jpg" alt="Description">
```

### 16:9

<div class="demo-preview">
  <img class="img img-16x9" src="../assets/images/og/og-default.jpg" alt="16:9 aspect ratio" style="max-width: 480px;">
</div>

```html
<img class="img img-16x9" src="image.jpg" alt="Description">
```

### 21:9

<div class="demo-preview">
  <img class="img img-21x9" src="../assets/images/og/og-default.jpg" alt="21:9 aspect ratio" style="max-width: 480px;">
</div>

```html
<img class="img img-21x9" src="image.jpg" alt="Description">
```

---

## Available Classes

| Class | Effect |
|---|---|
| `.img` | Base image — block display, full width, cover fit |
| `.img-1x1` | Square (1:1) |
| `.img-3x2` | Landscape (3:2) |
| `.img-4x3` | Landscape (4:3) |
| `.img-16x9` | Widescreen (16:9) |
| `.img-21x9` | Ultra-wide (21:9) |

---

## Usage with Components

Images compose with component-specific classes. For example, inside a card:

```html
<a class="card card--flush card--interactive" href="#">
  <img class="img img-16x9 card-image" src="image.jpg" alt="Description">
  <div style="padding: var(--card-padding);">
    <h3 class="card-title">Card with image</h3>
    <p class="card-description">Supporting text below the image.</p>
  </div>
</a>
```

Here `.img` provides the base display, `.img-16x9` sets the aspect ratio, and `.card-image` adds the top border-radius specific to cards.

---

## How Object-Fit Works

When an aspect ratio is applied, the image may not match its natural proportions. `object-fit: cover` ensures the image always fills the frame, cropping from the centre rather than stretching or letterboxing.

- **Without aspect ratio** — image displays at natural proportions, no cropping
- **With aspect ratio** — image crops to fill the forced proportions

---

## Do Not

- Do not use `.img` on decorative SVG icons — use `.svg-icn` instead
- Do not hardcode `width` and `height` attributes when using `.img` — the class manages sizing
- Do not combine multiple aspect-ratio classes on one element
