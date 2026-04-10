---
title: "Tag"
subtitle: "Dismissible labels and filter chips"
description: "How to use the tag component for labels, filters, and categorisation."
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 3
status: "published"
access: "team"
client: "internal"
---

Tags are small interactive labels used for categorisation, filtering, and metadata display. They support status variants and can be dismissible with a remove button.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `var(--tag-font-size)` | `var(--font-xs)` | Font size |
| `var(--tag-padding-y)` | `var(--space-2xs)` | Vertical padding |
| `var(--tag-padding-x)` | `var(--space-s)` | Horizontal padding |
| `var(--tag-radius)` | `var(--radius-s)` | Corner radius |
| `var(--tag-background)` | `var(--background-darker)` | Default background |
| `var(--tag-border)` | `var(--border-faded)` | Border colour |

---

## Basic usage

<div class="demo-preview">
  <span class="tag">Default tag</span>
</div>

```html
<span class="tag">Default tag</span>
```

---

## Variants

<div class="demo-preview">
  <div class="tag-group">
    <span class="tag">Default</span>
    <span class="tag tag--success">Success</span>
    <span class="tag tag--warning">Warning</span>
    <span class="tag tag--danger">Danger</span>
    <span class="tag tag--info">Info</span>
  </div>
</div>

```html
<span class="tag tag--success">Success</span>
<span class="tag tag--warning">Warning</span>
<span class="tag tag--danger">Danger</span>
<span class="tag tag--info">Info</span>
```

---

## Dismissible tag

Add a `.tag-remove` button inside the tag. Clicking it removes the tag from the DOM.

<div class="demo-preview">
  <div class="tag-group">
    <span class="tag">Design <button class="tag-remove" aria-label="Remove Design tag" type="button">{{icon:close}}</button></span>
    <span class="tag tag--info">Active <button class="tag-remove" aria-label="Remove Active tag" type="button">{{icon:close}}</button></span>
    <span class="tag tag--success">Published <button class="tag-remove" aria-label="Remove Published tag" type="button">{{icon:close}}</button></span>
  </div>
</div>

```html
<span class="tag">
  Design
  <button class="tag-remove" aria-label="Remove Design tag" type="button">{{icon:close}}</button>
</span>
```

---

## Tag group

Use `.tag-group` to wrap multiple tags with consistent spacing.

<div class="demo-preview">
  <div class="tag-group">
    <span class="tag">HTML</span>
    <span class="tag">CSS</span>
    <span class="tag">JavaScript</span>
    <span class="tag">TypeScript</span>
    <span class="tag">React</span>
  </div>
</div>

```html
<div class="tag-group">
  <span class="tag">HTML</span>
  <span class="tag">CSS</span>
  <span class="tag">JavaScript</span>
</div>
```

---

## In context — active filters

<div class="demo-preview">
  <div class="block gap-s">
    <p class="text-size-small">Active filters:</p>
    <div class="tag-group">
      <span class="tag">Status: Active <button class="tag-remove" aria-label="Remove filter" type="button">{{icon:close}}</button></span>
      <span class="tag">Type: Component <button class="tag-remove" aria-label="Remove filter" type="button">{{icon:close}}</button></span>
      <span class="tag">Version: 2.0 <button class="tag-remove" aria-label="Remove filter" type="button">{{icon:close}}</button></span>
    </div>
  </div>
</div>

---

## JavaScript

Tag dismiss uses a simple inline event listener — no separate JS file needed:

```js
document.addEventListener('click', function (e) {
  var removeBtn = e.target.closest('.tag-remove');
  if (removeBtn) {
    var tag = removeBtn.closest('.tag');
    if (tag) tag.remove();
  }
});
```

---

## Accessibility notes

- The remove button must have `aria-label` describing what is being removed
- Tags are presentational — they don't require ARIA roles
- When used as filters, consider announcing removal to screen readers via a live region

---

## Do / Don't

**Do:**
- Use tags for categorisation and filter indicators
- Use status variants to indicate state (success, warning, danger)
- Include `aria-label` on every remove button

**Don't:**
- Don't use tags as buttons — they are labels, not actions
- Don't use tags for navigation
