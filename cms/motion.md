---
title: "Motion"
subtitle: "The motion tokens that govern every transition, animation, and micro-interaction"
description: "Complete reference for motion tokens including easing primitives, duration primitives, and semantic page-level motion. Same t-shirt scale as spacing and type."
author: "Studio"
section: "Design System"
layer: "foundation"
subsection: ""
order: 7
status: "published"
access: "team"
client: "internal"
---

Motion tokens define **timing and rhythm**, not intent. They are reused for page transitions, component animations, and micro-interactions depending on context.

The system is built in two layers, the same model as color and spacing: **primitives** (raw easings and durations, named on the same t-shirt scale as `--space-*` and `--font-*`) → **semantic tokens** (named by intent, e.g. `--motion-page-open`). Always use semantic tokens in components — never hardcode `cubic-bezier()` or millisecond values inline.

The philosophy: durations follow the same t-shirt scale as spacing and type. Easings use the standard CSS keyword names (`in`, `out`, `in-out`) with refined cubic-bezier values. Zero new vocabulary to memorise — if you already know how `--space-m` works, you already know how `--duration-m` works.

---

## Easing Primitives

Three primitives, named after the standard CSS easing keywords. The cubic-bezier values are our refined replacements for the browser defaults.

| Token | Value | Use for |
| --- | --- | --- |
| `var(--ease-in)` | `cubic-bezier(0.4, 0, 1, 1)` | Exits. Fast start, slow end. The element accelerates away. |
| `var(--ease-out)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances. Slow start, slow end with a long graceful tail. The element settles into place. |
| `var(--ease-in-out)` | `cubic-bezier(0.65, 0, 0.35, 1)` | Swaps and continuous motion. Symmetric. Reads as a single sweep. |

<div class="demo-preview is-joined">
  <style>
    .motion-easing-demo { display: flex; flex-direction: column; gap: var(--space-m); }
    .motion-easing-row { display: flex; align-items: center; gap: var(--space-m); }
    .motion-easing-label { font-family: var(--font-quaternary); font-size: var(--font-xs); width: 90px; flex-shrink: 0; }
    .motion-easing-track { flex: 1; height: 4px; background: var(--background-darker); border-radius: var(--radius-pill); position: relative; }
    .motion-easing-dot { position: absolute; top: 50%; left: 0; width: 16px; height: 16px; margin-top: -8px; margin-left: -8px; background: var(--text-primary); border-radius: 50%; animation: motion-easing-travel 1600ms infinite; }
    .motion-easing-dot.is-ease-in { animation-timing-function: var(--ease-in); }
    .motion-easing-dot.is-ease-out { animation-timing-function: var(--ease-out); }
    .motion-easing-dot.is-ease-in-out { animation-timing-function: var(--ease-in-out); }
    @keyframes motion-easing-travel { 0% { left: 0; } 50% { left: 100%; } 50.01% { left: 0; opacity: 0; } 50.5% { opacity: 1; } 100% { left: 100%; } }
  </style>
  <div class="motion-easing-demo">
    <div class="motion-easing-row">
      <p class="motion-easing-label">ease-in</p>
      <div class="motion-easing-track"><div class="motion-easing-dot is-ease-in"></div></div>
    </div>
    <div class="motion-easing-row">
      <p class="motion-easing-label">ease-out</p>
      <div class="motion-easing-track"><div class="motion-easing-dot is-ease-out"></div></div>
    </div>
    <div class="motion-easing-row">
      <p class="motion-easing-label">ease-in-out</p>
      <div class="motion-easing-track"><div class="motion-easing-dot is-ease-in-out"></div></div>
    </div>
  </div>
</div>

```css
transition-timing-function: var(--ease-out);
```

---

## Duration Primitives

Six durations on the same t-shirt scale as `--space-*`, `--font-*`, and `--radius-*`. Extendable in either direction (`2xs`, `2xl`, etc.) when a new use case demands it.

| Token | Value | Use for |
| --- | --- | --- |
| `var(--duration-2xs)` | `100ms` | Hovers, presses, tooltips appearing |
| `var(--duration-xs)` | `200ms` | Small UI feedback (toasts, focus rings, button state) |
| `var(--duration-s)` | `400ms` | Element-level transitions (dropdowns, expanding rows, fade swaps) |
| `var(--duration-m)` | `600ms` | Surface-level transitions (drawers, modals, page swaps) |
| `var(--duration-l)` | `800ms` | Page-level openings (full-area entrances) |
| `var(--duration-xl)` | `1200ms` | Hero motion, deliberate reveals, intro animations |

<div class="demo-preview is-joined">
  <style>
    .motion-duration-demo { display: flex; flex-direction: column; gap: var(--space-m); }
    .motion-duration-row { display: flex; align-items: center; gap: var(--space-m); }
    .motion-duration-label { font-family: var(--font-quaternary); font-size: var(--font-xs); width: 110px; flex-shrink: 0; }
    .motion-duration-track { flex: 1; height: 4px; background: var(--background-darker); border-radius: var(--radius-pill); position: relative; overflow: hidden; }
    .motion-duration-bar { position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: var(--text-primary); transform-origin: 0 50%; animation-name: motion-duration-fill; animation-timing-function: var(--ease-in-out); animation-iteration-count: infinite; }
    .motion-duration-bar.is-2xs { animation-duration: 2000ms; --d: var(--duration-2xs); }
    .motion-duration-bar.is-xs  { animation-duration: 2000ms; --d: var(--duration-xs); }
    .motion-duration-bar.is-s   { animation-duration: 2000ms; --d: var(--duration-s); }
    .motion-duration-bar.is-m   { animation-duration: 2000ms; --d: var(--duration-m); }
    .motion-duration-bar.is-l   { animation-duration: 2000ms; --d: var(--duration-l); }
    .motion-duration-bar.is-xl  { animation-duration: 2400ms; }
    @keyframes motion-duration-fill { 0%, 100% { transform: scaleX(0); } 50%, 90% { transform: scaleX(1); } }
  </style>
  <div class="motion-duration-demo">
    <div class="motion-duration-row">
      <p class="motion-duration-label">2xs · 100ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-2xs" style="animation-duration: 100ms; animation-direction: alternate;"></div></div>
    </div>
    <div class="motion-duration-row">
      <p class="motion-duration-label">xs · 200ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-xs" style="animation-duration: 200ms; animation-direction: alternate;"></div></div>
    </div>
    <div class="motion-duration-row">
      <p class="motion-duration-label">s · 400ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-s" style="animation-duration: 400ms; animation-direction: alternate;"></div></div>
    </div>
    <div class="motion-duration-row">
      <p class="motion-duration-label">m · 600ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-m" style="animation-duration: 600ms; animation-direction: alternate;"></div></div>
    </div>
    <div class="motion-duration-row">
      <p class="motion-duration-label">l · 800ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-l" style="animation-duration: 800ms; animation-direction: alternate;"></div></div>
    </div>
    <div class="motion-duration-row">
      <p class="motion-duration-label">xl · 1200ms</p>
      <div class="motion-duration-track"><div class="motion-duration-bar is-xl" style="animation-duration: 1200ms; animation-direction: alternate;"></div></div>
    </div>
  </div>
</div>

```css
transition-duration: var(--duration-m);
```

---

## Semantic Motion Tokens

Named by intent. These compose primitives. Components and product code only ever read the semantic layer — never the primitives directly.

In v1 only **page-level** semantic tokens exist, because that's the first consumer (studio's Barba page transitions). Element-, surface-, and feedback-level tokens will be added when a real component needs them.

| Semantic token | Composes | Used for |
| --- | --- | --- |
| `--motion-page-open` | `--duration-l` + `--ease-out` | A page rising into view (slide-up). 800ms with a long graceful tail. |
| `--motion-page-close` | `--duration-m` + `--ease-in-out` | A page falling away (slide-down). 600ms — slightly faster than open, because the user has already decided to leave. |
| `--motion-page-swap` | `--duration-m` + `--ease-in-out` | Sibling-page navigation (the conveyor). Single continuous sweep. |
| `--motion-page-fade` | `--duration-s` + `--ease-in-out` | Crossfade fallback when no direction is known. |

Each semantic token is stored as **two CSS variables** — one for duration, one for easing — so consumers can plug them into either CSS shorthand (`transition`) or JS animation APIs (`element.animate(keyframes, { duration, easing })`) without parsing.

```css
/* The four page tokens, as declared in design-system.css */
--motion-page-open-duration:  var(--duration-l);
--motion-page-open-easing:    var(--ease-out);

--motion-page-close-duration: var(--duration-m);
--motion-page-close-easing:   var(--ease-in-out);

--motion-page-swap-duration:  var(--duration-m);
--motion-page-swap-easing:    var(--ease-in-out);

--motion-page-fade-duration:  var(--duration-s);
--motion-page-fade-easing:    var(--ease-in-out);
```

---

## Naming Convention

When a new consumer needs a new semantic motion token, follow this pattern:

```
--motion-{scope}-{event}-{property}
```

| Slot | Allowed values |
| --- | --- |
| `scope` | `page` · `surface` · `element` · `feedback` |
| `event` | `open` · `close` · `swap` · `enter` · `exit` · `fade` · `hover` · `press` |
| `property` | `duration` · `easing` |

**Examples** (not yet defined — to be added when first needed):
- `--motion-surface-open-duration` — drawers, modals, the contact overlay
- `--motion-element-hover-duration` — buttons, links, hover states
- `--motion-feedback-toast-duration` — toast notifications appearing

The semantic name should describe **what kind of motion event this is**, not which component triggers it. A token called `--motion-button-hover` would be wrong — many things hover, not just buttons. `--motion-element-hover` is right.

---

## Usage in CSS

Reference the duration and easing variables separately, the same way `transition-duration` and `transition-timing-function` already split in standard CSS:

```css
.button {
  transition-property: background, color, border-color;
  transition-duration: var(--duration-2xs);
  transition-timing-function: var(--ease-out);
}

.dialog {
  transition-property: opacity, transform;
  transition-duration: var(--motion-page-fade-duration);
  transition-timing-function: var(--motion-page-fade-easing);
}
```

For component code, prefer the **semantic** token (`--motion-*`) when one exists. Fall back to the **primitives** (`--duration-*`, `--ease-*`) for genuinely new motion events that don't have a semantic name yet — but consider whether a new semantic token should be added first.

---

## Usage in JavaScript

Read the tokens once at module load via `getComputedStyle`, then use them with the Web Animations API:

```js
function readToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();
}

const MOTION = {
  pageOpen: {
    duration: parseInt(readToken("--motion-page-open-duration"), 10),
    easing:   readToken("--motion-page-open-easing"),
  },
};

element.animate(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: MOTION.pageOpen.duration, easing: MOTION.pageOpen.easing }
);
```

This is the pattern used by `studio/assets/js/studio-barba.js` for page transitions.

---

## Reduced Motion

The system does **not** define a separate set of tokens for `prefers-reduced-motion` users. Instead, individual consumers should check the user preference at animation time and either skip the animation or use `--duration-2xs` (effectively instant):

```js
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const duration = reducedMotion ? 0 : MOTION.pageOpen.duration;
```

This keeps the token surface small. If a future component needs more nuanced reduced-motion behaviour, add a `--motion-{event}-reduced-duration` variant alongside it.
