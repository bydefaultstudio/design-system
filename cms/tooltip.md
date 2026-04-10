---
title: "Tooltip"
subtitle: "Additional context on hover — no JavaScript required"
description: "How to use the tooltip component for showing additional context on hover."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 7
status: "published"
access: "team"
client: "internal"
---

Tooltips are CSS-only overlays that appear on hover or keyboard focus. They use the `data-tooltip` attribute — no JavaScript required.

---

## Tokens

| Token | Default (Light) | Default (Dark) | Purpose |
|-------|-----------------|----------------|---------|
| `var(--tooltip-background)` | `var(--warm-black)` | `var(--neutral-100)` | Bubble background |
| `var(--tooltip-text)` | `var(--off-white)` | `var(--warm-black)` | Bubble text colour |
| `var(--tooltip-radius)` | `var(--radius-s)` | — | Corner radius |
| `var(--tooltip-font-size)` | `var(--font-xs)` | — | Font size |

---

## Basic usage

<div class="demo-preview is-centered">
  <span data-tooltip="This is a tooltip">Hover over me</span>
</div>

```html
<span data-tooltip="This is a tooltip">Hover over me</span>
```

---

## On interactive elements

<div class="demo-preview is-centered">
  <button class="button" data-tooltip="Save your changes">Save</button>
</div>

```html
<button class="button" data-tooltip="Save your changes">Save</button>
```

On buttons and links, the cursor remains `pointer` instead of the default `help`.

---

## Positions

By default, tooltips appear above the element. Use `data-tooltip-position` to change placement.

<div class="demo-preview is-centered" style="padding: var(--space-5xl);">
  <span data-tooltip="Above (default)" style="margin-right: var(--space-xl);">Top</span>
  <span data-tooltip="Below" data-tooltip-position="bottom" style="margin-right: var(--space-xl);">Bottom</span>
  <span data-tooltip="To the left" data-tooltip-position="left" style="margin-right: var(--space-xl);">Left</span>
  <span data-tooltip="To the right" data-tooltip-position="right">Right</span>
</div>

```html
<span data-tooltip="Above (default)">Top</span>
<span data-tooltip="Below" data-tooltip-position="bottom">Bottom</span>
<span data-tooltip="To the left" data-tooltip-position="left">Left</span>
<span data-tooltip="To the right" data-tooltip-position="right">Right</span>
```

---

## Accessibility notes

- Tooltips appear on `:hover` and `:focus-visible`
- Content is set via `data-tooltip` attribute and rendered with `content: attr(data-tooltip)` — it is not accessible to screen readers
- For critical information, do not rely on tooltips alone — add `aria-label` or visible text
- Tooltips use `pointer-events: none` so they do not interfere with interaction

---

## Do / Don't

**Do:**
- Use tooltips for supplementary, non-essential information
- Keep tooltip text short (one sentence max)
- Add `aria-label` when the tooltip contains essential context

**Don't:**
- Don't put interactive content (links, buttons) in tooltips
- Don't use tooltips for critical information that must be visible
- Don't use tooltips on touch-only interfaces (they require hover)
