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
  <pre><code>.button {
  background: var(--button-primary);
  color: var(--button-text);
  border-radius: var(--radius-m);
}</code></pre>
</div>

```html
<pre><code>.button {
  background: var(--button-primary);
  color: var(--button-text);
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

## Accessibility notes

- `code` and `pre` elements are announced by screen readers as code
- `kbd` is announced as "keyboard input" by most screen readers
- Ensure code blocks have sufficient colour contrast in both light and dark modes

---

## Do / Don't

**Do:**
- Use `code` for inline references to variables, functions, filenames
- Use `pre > code` for multi-line code examples
- Use `kbd` for keyboard shortcuts and key references

**Don't:**
- Don't use `code` for emphasis — use `strong` or `em` instead
- Don't use `pre` without a nested `code` element
