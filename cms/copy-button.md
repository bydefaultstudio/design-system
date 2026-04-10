---
title: "Copy Button"
subtitle: "One-click clipboard copy with feedback"
description: "How to use the copy button component for copying text to the clipboard with visual feedback."
author: "Studio"
section: "Design System"
layer: "docs-site"
subsection: "Data Entry"
order: 2
status: "published"
access: "team"
client: "internal"
---

Copy buttons copy a value to the clipboard on click and show a "Copied!" confirmation with a check icon. They extend the `.button` component and come in three variants.

All variants use the same inner markup: a `.copy-btn-default` span (shown by default) and a `.copy-btn-copied` span (shown on success). Each span contains an icon.

---

## Icon + Text

The default copy button with a copy icon and "Copy" label. Best for standalone copy actions where the purpose needs to be clear.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div>
        <button class="button is-small is-outline copy-btn" data-copy="var(--text-primary)" type="button">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div> Copy</span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div> Copied!</span>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Copied state</p>
      <div>
        <button class="button is-small is-outline copy-btn is-copied" type="button">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div> Copy</span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div> Copied!</span>
        </button>
      </div>
    </div>
  </div>
</div>

```html
<button class="button is-small is-outline copy-btn" data-copy="value" type="button">
  <span class="copy-btn-default">{{icon:copy}} Copy</span>
  <span class="copy-btn-copied">{{icon:check}} Copied!</span>
</button>
```

---

## Icon Only

`.is-icon-only` hides the text labels and shows only the icon. Best for compact UI — code blocks, table cells, and dense layouts. Always include `aria-label`.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div>
        <button class="button is-small is-outline copy-btn is-icon-only" data-copy="var(--text-primary)" data-tooltip="Copy" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Copied state</p>
      <div>
        <button class="button is-small is-outline copy-btn is-icon-only is-copied" data-tooltip="Copied!" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
  </div>
</div>

```html
<button class="button is-small is-outline copy-btn is-icon-only" data-copy="value" data-tooltip="Copy" type="button" aria-label="Copy">
  <span class="copy-btn-default">{{icon:copy}}</span>
  <span class="copy-btn-copied">{{icon:check}}</span>
</button>
```

---

## Ghost

`.is-ghost` removes the background and border for a minimal, inline copy action. Best for use alongside content where a button would be too heavy.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div>
        <button class="button copy-btn is-ghost" data-copy="var(--text-primary)" data-tooltip="Copy" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Copied state</p>
      <div>
        <button class="button copy-btn is-ghost is-copied" data-tooltip="Copied!" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="icn-svg" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="icn-svg" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
  </div>
</div>

```html
<button class="button copy-btn is-ghost" data-copy="value" data-tooltip="Copy" type="button" aria-label="Copy">
  <span class="copy-btn-default">{{icon:copy}}</span>
  <span class="copy-btn-copied">{{icon:check}}</span>
</button>
```

---

## Data Attributes

| Attribute | Description |
| --- | --- |
| `data-copy` | Static text value to copy |
| `data-clipboard-target` | CSS selector for an element whose text content should be copied |

Use `data-copy` for static values (tokens, URLs). Use `data-clipboard-target` for dynamic content (code blocks).

---

## JavaScript

Include `assets/js/copy-button.js` on any page using copy buttons. The script handles all `.copy-btn` elements via event delegation — no per-button initialisation needed.

```html
<script src="/assets/js/copy-button.js"></script>
```

---

## Accessibility

- Always include `aria-label="Copy"` on icon-only and ghost variants
- The copied state provides visual feedback via the check icon and green colour

---

## Variant Summary

| Variant | Classes | Use For |
| --- | --- | --- |
| Icon + Text | `.copy-btn` | Standalone copy actions |
| Icon Only | `.copy-btn.is-icon-only` | Code blocks, compact UI |
| Ghost | `.copy-btn.is-ghost` | Inline, minimal contexts |
