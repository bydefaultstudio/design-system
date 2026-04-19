---
title: "Code"
subtitle: "Inline code, code blocks, and keyboard shortcuts"
description: "How to use code, pre, and kbd elements in the design system."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 11
status: "published"
access: "team"
client: "internal"
---

The design system styles three code-related elements: inline `code`, block-level `pre`, and keyboard shortcuts `kbd`. All use the mono font (`var(--font-quaternary)`).

---

## Inline code

<div class="demo-preview">
  <p>Use <code>var(--text-primary)</code> for the main text colour.</p>
</div>

```html
<p>Use <code>var(--text-primary)</code> for the main text colour.</p>
```

Inline code gets a subtle background, small padding, and rounded corners. It uses `word-break: break-word` to wrap within narrow containers.

---

## Code blocks

<div class="demo-preview">
  <pre><code>.card {
  background-color: var(--background-primary);
  color: var(--text-primary);
  border-radius: var(--radius-m);
}</code></pre>
</div>

```html
<pre><code>.card {
  background-color: var(--background-primary);
  color: var(--text-primary);
}</code></pre>
```

Code blocks use `pre` with a nested `code` element. The inner `code` resets inline code styles (background, padding, border-radius) so they don't stack.

---

## Keyboard shortcuts

<div class="demo-preview is-centered">
  <kbd>⌘</kbd> + <kbd>K</kbd>
</div>

```html
<kbd>⌘</kbd> + <kbd>K</kbd>
```

The `kbd` element renders with a subtle 3D key appearance using `border` and `box-shadow`.

---

## Combining kbd elements

<div class="demo-preview is-centered">
  <p>Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command palette.</p>
</div>

```html
<p>Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the command palette.</p>
```

---

## Accessibility

- `code` and `pre` elements are announced by screen readers as code
- `kbd` is announced as "keyboard input" by most screen readers
- Ensure code blocks have sufficient colour contrast in both light and dark modes

---

## Usage rules

**Do:**
- Use `code` for inline references to variables, functions, filenames
- Use `pre > code` for multi-line code examples
- Use `kbd` for keyboard shortcuts and key references

**Don't:**
- Don't use `code` for emphasis — use `strong` or `em` instead
- Don't use `pre` without a nested `code` element

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Inline `code`

| Property | Value |
|---|---|
| Font family | `var(--font-quaternary)` |
| Font size | `calc(var(--text-body) - .2em)` |
| Background | `color-mix(in srgb, var(--text-primary), var(--alpha-5))` |
| Padding | `var(--space-2xs) var(--space-xs)` |
| Border radius | `var(--radius-xs)` |
| Color | `var(--text-primary)` |
| White space | `nowrap` |

### Code blocks (`pre`)

| Property | Value |
|---|---|
| Background | `var(--background-secondary)` |
| Border | `var(--border-s) solid var(--border-faded)` |
| Padding | `var(--space-l)` |
| Overflow | `overflow-x: auto` |
| Font family | `var(--font-quaternary)` |
| Font size | `calc(var(--text-body) - 2px)` |
| Line height | `var(--line-height-xl)` |

`pre code` resets the inline code background, padding, and border-radius to prevent stacking.

### Keyboard shortcut (`kbd`)

| Property | Value |
|---|---|
| Display | `inline-block` |
| Padding | `var(--space-xs) var(--space-s)` |
| Font family | `var(--font-quaternary)` |
| Font size | `var(--font-2xs)` |
| Line height | `var(--line-height-m)` |
| Color | `var(--text-secondary)` |
| Background | `var(--background-faded)` |
| Border | `var(--border-s) solid var(--border-secondary)` |
| Border radius | `var(--radius-xs)` |
| Box shadow | `0 1px 0 var(--border-secondary)` |

### Selectors

| Selector | Purpose |
|---|---|
| `code` | Inline code styling |
| `pre` | Code block container |
| `pre code` | Resets inline code styles inside blocks |
| `kbd` | Keyboard shortcut key appearance |
