---
title: "Copy Button"
subtitle: "One-click clipboard copy with feedback"
description: "How to use the copy button component for copying text to the clipboard with visual feedback."
section: "Design System"
subsection: ""
order: 30
slug: "copy-button"
status: "published"
access: "team"
client: "internal"
---

Copy buttons copy a specified text value to the clipboard on click and show a "Copied!" confirmation. They extend the `.button` component and use the `data-copy` attribute to define what to copy.

---

## Basic usage

<div class="demo-preview">
  <button class="button is-outline is-small copy-btn" data-copy="var(--text-primary)" type="button" aria-label="Copy to clipboard">
    <span class="copy-btn-label-default">Copy</span>
    <span class="copy-btn-label-copied">Copied!</span>
  </button>
</div>

```html
<button class="button is-outline is-small copy-btn" data-copy="var(--text-primary)" type="button">
  <span class="copy-btn-label-default">Copy</span>
  <span class="copy-btn-label-copied">Copied!</span>
</button>
```

The `data-copy` attribute contains the text that will be copied to the clipboard. The button shows "Copied!" for 2 seconds after a successful copy.

---

## Sizes

<div class="demo-preview" style="display: flex; gap: var(--space-m); align-items: center;">
  <button class="button is-outline copy-btn" data-copy="Regular size" type="button">
    <span class="copy-btn-label-default">Copy</span>
    <span class="copy-btn-label-copied">Copied!</span>
  </button>
  <button class="button is-outline is-small copy-btn" data-copy="Small size" type="button">
    <span class="copy-btn-label-default">Copy</span>
    <span class="copy-btn-label-copied">Copied!</span>
  </button>
  <button class="button is-outline is-xsmall copy-btn" data-copy="Extra small" type="button">
    <span class="copy-btn-label-default">Copy</span>
    <span class="copy-btn-label-copied">Copied!</span>
  </button>
</div>

---

## JavaScript

Include `assets/js/copy-button.js` on any page using copy buttons. The script handles all `.copy-btn[data-copy]` elements via event delegation.

```html
<script src="/assets/js/copy-button.js"></script>
```

---

## Accessibility notes

- Add `aria-label="Copy to clipboard"` for clarity
- The "Copied!" state provides visual feedback — for screen readers, consider adding an `aria-live` region

---

## Do / Don't

**Do:**
- Use copy buttons next to code blocks, token values, and URLs
- Keep the `data-copy` value accurate to what the user expects

**Don't:**
- Don't use copy buttons for large blocks of text — use a textarea with select-all instead
