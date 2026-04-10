---
title: "bd-animations"
subtitle: "In-house animation system built on GSAP and ScrollTrigger"
description: "Documentation for bd-animations — the ByDefault reusable animation library for any project. Covers data attributes, animation types, text splitting, and configuration."
section: "Website"
layer: "app"
subsection: "Interactions"
order: 1
---

# bd-animations

Our in-house animation library built on GSAP and ScrollTrigger. Drop it into any project and add scroll-triggered animations with a single data attribute — no custom JS needed.

### Install

Add the following to your `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/SplitText.min.js"></script>
<script src="path/to/bd-animations.js"></script>
```

### Usage

Add `data-bd-animate` to any element. It animates on scroll into view.

```html
<h2 data-bd-animate>Fades in</h2>
<h2 data-bd-animate="slide-up">Slides up</h2>
<h2 data-bd-animate="scale-in">Scales in</h2>
```

---

## Fade & Slide

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Fade (default)</p>
      <h2 data-bd-animate="fade" data-bd-scrub="true">This text fades in</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Slide Up</p>
      <h2 data-bd-animate="slide-up" data-bd-scrub="true">This text slides up</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Slide Down</p>
      <h2 data-bd-animate="slide-down" data-bd-scrub="true">This text slides down</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Slide Left</p>
      <h2 data-bd-animate="slide-left" data-bd-scrub="true">This text slides from left</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Slide Right</p>
      <h2 data-bd-animate="slide-right" data-bd-scrub="true">This text slides from right</h2>
    </div>
  </div>
</div>

```html
<h2 data-bd-animate="fade">Fade in</h2>
<h2 data-bd-animate="slide-up">Slide up</h2>
<h2 data-bd-animate="slide-down">Slide down</h2>
<h2 data-bd-animate="slide-left">Slide from left</h2>
<h2 data-bd-animate="slide-right">Slide from right</h2>
```

---

## Effects

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Scale In</p>
      <h2 data-bd-animate="scale-in" data-bd-scrub="true">Scales from 80% to 100%</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Blur In</p>
      <h2 data-bd-animate="blur-in" data-bd-scrub="true">Blur to clear</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bounce In</p>
      <h2 data-bd-animate="bounce-in" data-bd-scrub="true">Bouncy entrance</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Rotate In</p>
      <h2 data-bd-animate="rotate-in" data-bd-scrub="true">Rotates into place</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Flip</p>
      <h2 data-bd-animate="flip" data-bd-scrub="true">3D flip effect</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Tilt</p>
      <h2 data-bd-animate="tilt" data-bd-scrub="true">3D perspective tilt</h2>
    </div>
  </div>
</div>

```html
<h2 data-bd-animate="scale-in">Scale in</h2>
<h2 data-bd-animate="blur-in">Blur in</h2>
<h2 data-bd-animate="bounce-in">Bounce in</h2>
<h2 data-bd-animate="rotate-in">Rotate in</h2>
<h2 data-bd-animate="flip">Flip</h2>
<h2 data-bd-animate="tilt">Tilt</h2>
```

---

## Text Animations

Use `data-text-animate` to split and animate text by characters, words, or lines.

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Characters</p>
      <h2 data-text-animate="chars" data-bd-scrub="true">Each character animates</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Words</p>
      <h2 data-text-animate="words" data-bd-scrub="true">Each word animates in sequence</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Lines</p>
      <p data-text-animate="lines" data-bd-scrub="true" style="max-width: 40ch; font-size: var(--font-size-l);">This paragraph animates line by line based on where the text wraps in the container.</p>
    </div>
  </div>
</div>

```html
<h2 data-text-animate="chars">Character animation</h2>
<h2 data-text-animate="words">Word animation</h2>
<p data-text-animate="lines">Line animation</p>
```

---

## Delays

Use `data-bd-delay` to stagger elements.

<div class="demo-preview">
  <div class="block gap-s">
    <h2 data-bd-animate="slide-up" data-bd-delay="0">First — no delay</h2>
    <h2 data-bd-animate="slide-up" data-bd-delay="0.2">Second — 0.2s</h2>
    <h2 data-bd-animate="slide-up" data-bd-delay="0.4">Third — 0.4s</h2>
    <h2 data-bd-animate="slide-up" data-bd-delay="0.6">Fourth — 0.6s</h2>
  </div>
</div>

```html
<h2 data-bd-animate="slide-up" data-bd-delay="0">No delay</h2>
<h2 data-bd-animate="slide-up" data-bd-delay="0.2">0.2s</h2>
<h2 data-bd-animate="slide-up" data-bd-delay="0.4">0.4s</h2>
<h2 data-bd-animate="slide-up" data-bd-delay="0.6">0.6s</h2>
```

---

## Special Effects

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Neon</p>
      <h2 data-bd-animate="neon">Neon glow flicker</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Shake</p>
      <h2 data-bd-animate="shake">This element shakes</h2>
    </div>
  </div>
</div>

```html
<h2 data-bd-animate="neon">Neon glow</h2>
<h2 data-bd-animate="shake">Shake</h2>
```

---

## Scrub

Tie animation to scroll position with `data-bd-scrub`. Without scrub, the animation fires once. With scrub, it plays and reverses as you scroll.

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Without scrub (fires once)</p>
      <h2 data-bd-animate="slide-up">This slides up once</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">With scrub (scroll-tied)</p>
      <h2 data-bd-animate="slide-up" data-bd-scrub="true">This follows your scroll</h2>
    </div>
  </div>
</div>

```html
<!-- Fires once -->
<h2 data-bd-animate="slide-up">Plays once</h2>

<!-- Scroll-tied -->
<h2 data-bd-animate="slide-up" data-bd-scrub="true">Follows scroll</h2>

<!-- Custom speed (0.1 = slow, 5.0 = fast) -->
<h2 data-bd-animate="slide-up" data-bd-scrub="0.5">Medium scrub</h2>
```

---

## In-View Positioning

Use `data-bd-animate="in-view"` with custom start positions via `data-bd-from-*` attributes.

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">From below</p>
      <h2 data-bd-animate="in-view" data-bd-from-y="80">Starts 80px below</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">From left</p>
      <h2 data-bd-animate="in-view" data-bd-from-x="-100">Starts 100px from left</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Scaled down</p>
      <h2 data-bd-animate="in-view" data-bd-from-scale="0.5">Starts at 50% scale</h2>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Combined</p>
      <h2 data-bd-animate="in-view" data-bd-from-y="50" data-bd-from-x="-50" data-bd-from-scale="0.8">Below + left + scaled</h2>
    </div>
  </div>
</div>

```html
<div data-bd-animate="in-view" data-bd-from-y="80">From below</div>
<div data-bd-animate="in-view" data-bd-from-x="-100">From left</div>
<div data-bd-animate="in-view" data-bd-from-scale="0.5">Scaled</div>
<div data-bd-animate="in-view" data-bd-from-y="50" data-bd-from-x="-50" data-bd-from-scale="0.8">Combined</div>
```

| Attribute | Description |
|-----------|-------------|
| `data-bd-from-y` | Vertical offset (`"50"` down, `"-30"` up) |
| `data-bd-from-x` | Horizontal offset (`"100"` right, `"-50"` left) |
| `data-bd-from-scale` | Starting scale (`"0.8"` = 80%) |

Only works with `data-bd-animate="in-view"`.

---

## All Animations

| Animation | Value | Description |
|-----------|-------|-------------|
| Fade | `fade` or empty | Default fade in |
| Slide | `slide` | Fade + slide up |
| Slide Up | `slide-up` | Slide up |
| Slide Down | `slide-down` | Slide down |
| Slide Left | `slide-left` | Slide from left |
| Slide Right | `slide-right` | Slide from right |
| Scale In | `scale-in` | Scale 80% to 100% |
| Rotate In | `rotate-in` | Rotate -15 deg to 0 |
| Expand Spacing | `expand-spacing` | Letter spacing expand |
| Skew | `skew` | Skew effect |
| Flip | `flip` | 3D flip |
| Fade In/Out | `fade-in-out` | Smooth fade |
| Blur In | `blur-in` | Blur to clear |
| Bounce In | `bounce-in` | Bouncy entrance |
| Shake | `shake` | Shake effect |
| Flash | `flash` | Continuous flash |
| Neon | `neon` | Neon glow |
| Tilt | `tilt` | 3D perspective tilt |
| In View | `in-view` | Custom start position |

### Text Animations

| Value | Description |
|-------|-------------|
| `data-text-animate="chars"` | Animate each character |
| `data-text-animate="words"` | Animate each word |
| `data-text-animate="lines"` | Animate each line |
| `data-text-animate="rich-text"` | Animate rich text elements |
| `data-text-animate="list"` | Animate list items |

### Modifiers

| Attribute | Description |
|-----------|-------------|
| `data-bd-delay` | Delay in seconds (e.g. `"0.5"`) |
| `data-bd-scrub` | Scroll-tied (`"true"` or `"0.1"` to `"5.0"`) |

---

## Dependencies

- **GSAP** + **ScrollTrigger** + **SplitText**
- Respects `prefers-reduced-motion`
- Debounced resize (150ms)
- Duplicate prevention via `data-bd-bound`

### Legacy

`data-text-animate="element"` is auto-converted to `data-bd-animate="fade"`.
