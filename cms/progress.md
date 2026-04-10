---
title: "Progress"
subtitle: "Show how far along something is"
description: "How to use the progress bar component for showing completion status."
section: "Design System"
subsection: "Feedback"
order: 4
status: "published"
access: "team"
client: "internal"
---

Progress bars use the native `<progress>` element styled with design system tokens. They indicate completion percentage and support status colour variants.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `var(--progress-track)` | `var(--background-darker)` | Track (unfilled) background |
| `var(--progress-fill)` | `var(--text-primary)` | Fill (completed) colour |
| `var(--progress-radius)` | `var(--radius-pill)` | Corner radius |
| `var(--progress-height)` | `var(--space-s)` | Bar height |

---

## Basic usage

<div class="demo-preview">
  <progress class="progress-bar" value="60" max="100">60%</progress>
</div>

```html
<progress class="progress-bar" value="60" max="100">60%</progress>
```

The fallback text (`60%`) is shown in browsers that do not support `<progress>`.

---

## Status variants

<div class="demo-preview" style="display: grid; gap: var(--space-m);">
  <progress class="progress-bar progress-bar--success" value="100" max="100">100%</progress>
  <progress class="progress-bar progress-bar--warning" value="40" max="100">40%</progress>
  <progress class="progress-bar progress-bar--danger" value="10" max="100">10%</progress>
</div>

```html
<progress class="progress-bar progress-bar--success" value="100" max="100">100%</progress>
<progress class="progress-bar progress-bar--warning" value="40" max="100">40%</progress>
<progress class="progress-bar progress-bar--danger" value="10" max="100">10%</progress>
```

---

## Accessibility notes

- The native `<progress>` element is announced by screen readers automatically
- Always include fallback text content inside the element
- If the progress represents a named process, associate it with a label using `aria-label` or a visible `<label>`

---

## Do / Don't

**Do:**
- Use status variants to indicate outcome (green for complete, red for critical)
- Include fallback text inside the `<progress>` element

**Don't:**
- Don't use progress bars for indeterminate loading — use a spinner or skeleton instead
- Don't animate the value attribute with JS unless the operation is genuinely progressing
