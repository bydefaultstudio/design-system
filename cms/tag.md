---
title: "Tag"
subtitle: "Dismissible labels and filter chips"
description: "How to use the tag component for labels, filters, and categorisation."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 3
status: "published"
access: "team"
client: "internal"
---

# Tag

Tags are small interactive labels used for categorisation, filtering, and metadata display. They support colour variants via `data-color` and can be dismissible with a remove button.

The `.tag` class is required. Colour variants use the `data-color` attribute — the same API as button and badge.

---

## Anatomy

| Axis | Mechanism | Example |
|---|---|---|
| Colour | `data-color` | `data-color="success"` |

No component-level tokens — tag references system tokens directly (`var(--background-darker)`, `var(--border-faded)`, `var(--radius-s)`).

---

## Basic usage

<div class="demo-preview">
  <span class="tag">Default tag</span>
</div>

```html
<span class="tag">Default tag</span>
```

---

## Colour

`data-color` applies a semantic colour to background, border, and text.

<div class="demo-preview">
  <div class="tag-group">
    <span class="tag">Default</span>
    <span class="tag" data-color="success">Success</span>
    <span class="tag" data-color="warning">Warning</span>
    <span class="tag" data-color="danger">Danger</span>
    <span class="tag" data-color="info">Info</span>
  </div>
</div>

```html
<span class="tag" data-color="success">Success</span>
<span class="tag" data-color="warning">Warning</span>
<span class="tag" data-color="danger">Danger</span>
<span class="tag" data-color="info">Info</span>
```

---

## Dismissible tag

Add a `.tag-remove` button inside the tag. Clicking it removes the tag from the DOM.

<div class="demo-preview">
  <div class="tag-group">
    <span class="tag">Design <button class="tag-remove" aria-label="Remove Design tag" type="button">{{icon:close}}</button></span>
    <span class="tag" data-color="info">Active <button class="tag-remove" aria-label="Remove Active tag" type="button">{{icon:close}}</button></span>
    <span class="tag" data-color="success">Published <button class="tag-remove" aria-label="Remove Published tag" type="button">{{icon:close}}</button></span>
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

## Accessibility

- The remove button must have `aria-label` describing what is being removed
- Tags are presentational — they don't require ARIA roles
- When used as filters, consider announcing removal to screen readers via a live region

---

## Usage rules

**Do**

- Use tags for categorisation and filter indicators
- Use `data-color` to indicate state (success, warning, danger)
- Include `aria-label` on every remove button

**Don't**

- Don't use tags as buttons — they are labels, not actions
- Don't use tags for navigation

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Styling

| Property | Value |
|---|---|
| Display | `inline-flex` |
| Align items | `center` |
| Gap | `var(--space-xs)` |
| Font family | `var(--font-primary)` |
| Font size | `var(--font-xs)` |
| Font weight | `var(--font-weight-medium)` |
| Line height | `var(--line-height-xs)` |
| Padding | `var(--space-xs) var(--space-xs) var(--space-xs) var(--space-s)` |
| Border radius | `var(--radius-s)` |
| Background | `var(--background-darker)` |
| Border | `var(--border-s) solid var(--border-faded)` |
| Color | `var(--text-primary)` |
| White space | `nowrap` |

### Selectors

| Selector | Purpose |
|---|---|
| `.tag` | Base tag styling |
| `.tag[data-color="success"]` | Green status colour (alias: `green`) |
| `.tag[data-color="warning"]` | Yellow status colour (alias: `yellow`) |
| `.tag[data-color="danger"]` | Red status colour (alias: `red`) |
| `.tag[data-color="info"]` | Blue status colour (alias: `blue`) |
| `.tag-remove` | Dismiss button inside a tag |
| `.tag-remove:hover` | Dismiss button hover — full opacity, subtle background |
| `.tag-group` | Flex wrapper for multiple tags with `gap: var(--space-xs)` |
