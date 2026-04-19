---
title: "Disclosure"
subtitle: "Reveal content on demand"
description: "How to use the native details/summary disclosure pattern in the design system."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 7
status: "published"
access: "team"
client: "internal"
---

The disclosure component uses native HTML `<details>` and `<summary>` elements to create expandable/collapsible content sections. No JavaScript required for the toggle behaviour.

---

## Core Principles

- Uses **native HTML** (`<details>/<summary>`) for built-in accessibility and keyboard support
- Hidden by default — content is revealed on demand
- Chevron indicator sits on the **left** of the summary text, rotating from right-pointing (closed) to down-pointing (open)
- Disclosure content aligns with the summary text (indented past the chevron)
- Styled with design system tokens (fonts, colors, spacing, borders)
- The `.disclosure-content` wrapper provides consistent padding and typography
- The `.disclosure-table` pattern displays key-value pairs (e.g. CSS properties)
- The `.copy-btn` provides copy-to-clipboard functionality (requires minimal JS)

---

## Basic Usage

<div class="demo-preview is-joined">
  <details>
    <summary>Show details</summary>
    <div class="disclosure-content">
      <p>Content revealed when expanded.</p>
    </div>
  </details>
</div>

```html
<details>
  <summary>Show details</summary>
  <div class="disclosure-content">
    <p>Content revealed when expanded.</p>
  </div>
</details>
```

---

## Key-Value Table Pattern

Use `.disclosure-table` with a `<dl>` to display property-value pairs:

<div class="demo-preview is-joined">
  <details>
    <summary>Show details</summary>
    <div class="disclosure-content">
      <dl class="disclosure-table">
        <dt>Font size</dt>
        <dd>var(--font-7xl) <span class="token-tag">48px</span></dd>
        <dt>Line height</dt>
        <dd>var(--line-height-s) <span class="token-tag">1</span></dd>
        <dt>Weight</dt>
        <dd>var(--font-weight-regular) <span class="token-tag">400</span></dd>
      </dl>
    </div>
  </details>
</div>

```html
<details>
  <summary>Show details</summary>
  <div class="disclosure-content">
    <dl class="disclosure-table">
      <dt>Font size</dt>
      <dd>var(--font-7xl) <span class="token-tag">48px</span></dd>
      <dt>Line height</dt>
      <dd>var(--line-height-s) <span class="token-tag">1</span></dd>
      <dt>Weight</dt>
      <dd>var(--font-weight-regular) <span class="token-tag">400</span></dd>
    </dl>
  </div>
</details>
```

The `<dt>` labels are styled with `var(--text-faded)` and the `<dd>` values with `var(--text-primary)`. The `.token-tag` span shows the resolved value inline.

---

## Copy Button

Add a `.copy-btn` inside `.disclosure-content` with a `data-copy` attribute containing the text to copy. Use `&#10;` for newlines in the `data-copy` value.

<div class="demo-preview is-joined">
  <details>
    <summary>Show details</summary>
    <div class="disclosure-content">
      <dl class="disclosure-table">
        <dt>Font size</dt>
        <dd>var(--font-7xl) <span class="token-tag">48px</span></dd>
        <dt>Line height</dt>
        <dd>var(--line-height-s) <span class="token-tag">1</span></dd>
      </dl>
      <button class="button copy-btn" data-size="small"
        data-copy="font-size: var(--font-7xl);&#10;line-height: var(--line-height-s);"
        aria-label="Copy CSS for Heading 1">
        Copy CSS
      </button>
    </div>
  </details>
</div>

```html
<details>
  <summary>Show details</summary>
  <div class="disclosure-content">
    <dl class="disclosure-table">
      <dt>Font size</dt>
      <dd>var(--font-7xl) <span class="token-tag">48px</span></dd>
      <dt>Line height</dt>
      <dd>var(--line-height-s) <span class="token-tag">1</span></dd>
    </dl>
    <button class="button copy-btn" data-size="small"
      data-copy="font-size: var(--font-7xl);&#10;line-height: var(--line-height-s);"
      aria-label="Copy CSS for Heading 1">
      Copy CSS
    </button>
  </div>
</details>
```

The button requires a small JS handler:

```js
document.addEventListener('click', function (event) {
  var button = event.target.closest('.copy-btn');
  if (!button) return;
  var text = button.getAttribute('data-copy');
  navigator.clipboard.writeText(text).then(function () {
    button.textContent = 'Copied';
    button.classList.add('is-copied');
    setTimeout(function () {
      button.textContent = 'Copy CSS';
      button.classList.remove('is-copied');
    }, 1500);
  });
});
```

---

## Accessibility

- Native `<details>/<summary>` provides keyboard support (Enter/Space to toggle)
- `summary` is focusable and announced as a disclosure widget by screen readers
- `.copy-btn` should include an `aria-label` describing what will be copied
- Focus-visible outlines are styled using `var(--input-focus)` token

---

## When to use

- **Styleguide**: Show CSS details beneath typography, color, and component demos
- **Documentation**: Collapse supplementary information that not all readers need
- **Forms**: Hide advanced options or additional context

## When not to use

- For primary content that all users need to see — use visible layout instead
- For navigation — use proper nav patterns
- For multi-panel accordions with mutual exclusion — this pattern allows multiple open simultaneously

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Tokens

| Token | Default | What it controls |
|---|---|---|
| `--border-s` | — | Border width for container and content separator |
| `--border-faded` | — | Border colour |
| `--font-quaternary` | — | Monospace font for summary and content |
| `--font-2xs` | — | Font size for summary and content text |
| `--text-faded` | — | Summary text colour, table labels |
| `--text-secondary` | — | Summary hover colour, content text |
| `--text-primary` | — | Table values |
| `--text-accent` | — | Copy button text |
| `--text-link` | — | Copy button hover text |
| `--background-faded` | — | Copy button background |
| `--background-secondary` | — | Copy button hover background |
| `--status-success` | — | Copied state colour |
| `--input-focus` | — | Focus ring colour |
| `--space-xs` | — | Border radius |
| `--space-s`, `--space-m` | — | Padding values |

### Selectors

| Selector | Purpose |
|---|---|
| `details` | Base container — border, border-radius |
| `summary` | Toggle trigger — left-side chevron via `::before`, pointer cursor |
| `.disclosure-content` | Content wrapper — padding, border-top separator, monospace font |
| `.disclosure-table` | Grid layout for key-value pairs (2-column: label + value) |
| `.disclosure-table dt` | Key label — faded text colour |
| `.disclosure-table dd` | Value — primary text colour |
| `.copy-btn` | Copy-to-clipboard button — uses design system button |
| `.copy-btn.is-copied` | Copied state — success colour feedback |
