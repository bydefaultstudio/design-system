---
title: "bd-cursor"
subtitle: "In-house custom cursor system for desktop interactions"
description: "Documentation for bd-cursor — the ByDefault reusable cursor library for any project. Covers cursor states, interaction types, and progressive enhancement."
section: "Website"
subsection: "Interactions"
order: 3
---

# bd-cursor

Our in-house custom cursor system. Replaces the default cursor with a smooth, animated dot and halo that responds to interactive elements. Desktop only (991px+) — falls back to the default cursor on mobile and touch devices.

### Install

Add the CSS and JS to your project:

```html
<link rel="stylesheet" href="path/to/bd-cursor.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="path/to/bd-cursor.js"></script>
```

Add the cursor elements to your `<body>`:

```html
<div class="cursor-default"></div>
<div class="cursor-halo"></div>
```

### Usage

Add `data-cursor` to any element to change the cursor style on hover.

```html
<a href="#" data-cursor="link">Link cursor</a>
<button data-cursor="button">Button cursor</button>
<div data-cursor="drag">Drag cursor</div>
```

---

## Live Demos

Hover over each element to see the cursor change. Desktop only.

### Navigation Cursors

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Link</p>
      <div><a href="javascript:void(0)" data-cursor="link" style="font-size: var(--font-size-l);">Hover for link cursor</a></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Button</p>
      <div><button class="button" data-cursor="button">Hover for button cursor</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">External</p>
      <div><a href="javascript:void(0)" data-cursor="external" style="font-size: var(--font-size-l);">Hover for external cursor</a></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Home</p>
      <div><a href="javascript:void(0)" data-cursor="home" style="font-size: var(--font-size-l);">Hover for home cursor</a></div>
    </div>
  </div>
</div>

```html
<a href="#" data-cursor="link">Link</a>
<button data-cursor="button">Button</button>
<a href="#" data-cursor="external">External link</a>
<a href="#" data-cursor="home">Home</a>
```

### Action Cursors

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Plus</p>
      <div><button class="button is-outline" data-cursor="plus">Hover for plus cursor</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Close</p>
      <div><button class="button is-outline" data-cursor="close">Hover for close cursor</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Check</p>
      <div><button class="button is-outline" data-cursor="check">Hover for check cursor</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Search</p>
      <div><button class="button is-outline" data-cursor="search">Hover for search cursor</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Info</p>
      <div><button class="button is-outline" data-cursor="info">Hover for info cursor</button></div>
    </div>
  </div>
</div>

```html
<button data-cursor="plus">Plus</button>
<button data-cursor="close">Close</button>
<button data-cursor="check">Check</button>
<button data-cursor="search">Search</button>
<button data-cursor="info">Info</button>
```

### Directional Cursors

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Arrow Left / Right</p>
      <div style="display: flex; gap: var(--space-m);">
        <button class="button is-outline" data-cursor="arrow-left">Arrow left</button>
        <button class="button is-outline" data-cursor="arrow-right">Arrow right</button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Chevron Left / Right</p>
      <div style="display: flex; gap: var(--space-m);">
        <button class="button is-outline" data-cursor="chevron-left">Chevron left</button>
        <button class="button is-outline" data-cursor="chevron-right">Chevron right</button>
      </div>
    </div>
  </div>
</div>

```html
<button data-cursor="arrow-left">Arrow left</button>
<button data-cursor="arrow-right">Arrow right</button>
<button data-cursor="chevron-left">Chevron left</button>
<button data-cursor="chevron-right">Chevron right</button>
```

### Interactive Cursors

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Drag</p>
      <div data-cursor="drag" style="padding: var(--space-xl); border: 1px dashed var(--border-faded); border-radius: var(--radius-m); text-align: center;">Hover for drag cursor</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Click Anywhere</p>
      <div data-cursor="click-anywhere" style="padding: var(--space-xl); border: 1px dashed var(--border-faded); border-radius: var(--radius-m); text-align: center;">Hover for click-anywhere cursor</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Scroll</p>
      <div data-cursor="scroll" style="padding: var(--space-xl); border: 1px dashed var(--border-faded); border-radius: var(--radius-m); text-align: center;">Hover for scroll cursor</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Look</p>
      <div data-cursor="look" style="padding: var(--space-xl); border: 1px dashed var(--border-faded); border-radius: var(--radius-m); text-align: center;">Hover for look cursor</div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Text</p>
      <div data-cursor="text" style="padding: var(--space-xl); border: 1px dashed var(--border-faded); border-radius: var(--radius-m); text-align: center;">Hover for text cursor</div>
    </div>
  </div>
</div>

```html
<div data-cursor="drag">Drag area</div>
<div data-cursor="click-anywhere">Click anywhere</div>
<div data-cursor="scroll">Scroll area</div>
<div data-cursor="look">Look</div>
<div data-cursor="text">Text area</div>
```

### Social Cursors

<div class="demo-preview">
  <div class="block gap-m">
    <div style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
      <a href="javascript:void(0)" data-cursor="instagram" class="button is-outline">Instagram</a>
      <a href="javascript:void(0)" data-cursor="tiktok" class="button is-outline">TikTok</a>
      <a href="javascript:void(0)" data-cursor="linkedin" class="button is-outline">LinkedIn</a>
      <a href="javascript:void(0)" data-cursor="youtube" class="button is-outline">YouTube</a>
      <a href="javascript:void(0)" data-cursor="email" class="button is-outline">Email</a>
      <a href="javascript:void(0)" data-cursor="chat" class="button is-outline">Chat</a>
    </div>
  </div>
</div>

```html
<a href="#" data-cursor="instagram">Instagram</a>
<a href="#" data-cursor="tiktok">TikTok</a>
<a href="#" data-cursor="linkedin">LinkedIn</a>
<a href="#" data-cursor="youtube">YouTube</a>
<a href="#" data-cursor="email">Email</a>
<a href="#" data-cursor="chat">Chat</a>
```

---

## All Cursor Types

| Value | Description |
|-------|-------------|
| `pointer` | Generic pointer |
| `link` | Link indicator |
| `button` | Button indicator |
| `text` | Text selection cursor |
| `external` | External link icon |
| `home` | Home icon |
| `plus` | Plus / add |
| `close` | Close / X |
| `check` | Checkmark |
| `search` | Search icon |
| `info` | Info icon |
| `look` | Eye / look |
| `drag` | Drag indicator |
| `click-anywhere` | Click anywhere prompt |
| `scroll` | Scroll prompt |
| `locked` | Locked state |
| `case-study` | Case study indicator |
| `arrow-left` | Left arrow |
| `arrow-right` | Right arrow |
| `chevron-left` | Left chevron |
| `chevron-right` | Right chevron |
| `x` | Close / dismiss |
| `chat` | Chat icon |
| `instagram` | Instagram icon |
| `tiktok` | TikTok icon |
| `linkedin` | LinkedIn icon |
| `youtube` | YouTube icon |
| `email` | Email icon |

## Dependencies

- **GSAP** — cursor movement and press animation
- Desktop only (991px+), skipped on touch devices
- Requires `.cursor-default` and `.cursor-halo` elements in DOM
- Adds `custom-cursor-active` class to `<body>` when active
