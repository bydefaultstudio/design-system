---
title: "Breadcrumb"
subtitle: "Show where you are in the hierarchy"
description: "How to use the breadcrumb component for showing navigation hierarchy."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 3
status: "published"
access: "team"
client: "internal"
---

Breadcrumbs show the user's location within a site hierarchy. The component uses native `<nav>` with `aria-label` for accessibility.

---

## Basic usage

<div class="demo-preview">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span class="breadcrumb-separator" aria-hidden="true">/</span>
    <a href="/design-system/">Design System</a>
    <span class="breadcrumb-separator" aria-hidden="true">/</span>
    <span aria-current="page">Breadcrumb</span>
  </nav>
</div>

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <a href="/design-system/">Design System</a>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <span aria-current="page">Breadcrumb</span>
</nav>
```

---

## Structure

| Element | Role |
|---------|------|
| `<nav class="breadcrumb">` | Container with `aria-label="Breadcrumb"` |
| `<a href="...">` | Navigable ancestor pages |
| `<span class="breadcrumb-separator">` | Visual separator with `aria-hidden="true"` |
| `<span aria-current="page">` | Current page (not a link) |

---

## Multi-level example

Breadcrumbs support any depth. The last item uses `aria-current="page"` and is rendered as a `<span>` (not a link) to indicate the current location.

<div class="demo-preview">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span class="breadcrumb-separator" aria-hidden="true">/</span>
    <a href="/design-system/">Design System</a>
    <span class="breadcrumb-separator" aria-hidden="true">/</span>
    <a href="/design-system/content/">Content</a>
    <span class="breadcrumb-separator" aria-hidden="true">/</span>
    <span aria-current="page">Breadcrumb</span>
  </nav>
</div>

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <a href="/design-system/">Design System</a>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <a href="/design-system/content/">Content</a>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <span aria-current="page">Breadcrumb</span>
</nav>
```

The `aria-current="page"` attribute signals to assistive technology that this is the current page. It also receives distinct styling — primary text colour and medium font weight — so sighted users can identify the active page at a glance.

---

## Accessibility

- Always wrap in a `<nav>` element with `aria-label="Breadcrumb"`
- The current page uses `aria-current="page"` and is not a link
- Separators use `aria-hidden="true"` so screen readers skip them
- Links are focusable with standard keyboard navigation

---

## Usage rules

**Do:**
- Use breadcrumbs on pages with clear hierarchical structure
- Mark the current page with `aria-current="page"`

**Don't:**
- Don't use breadcrumbs on single-level pages (e.g. homepage)
- Don't make the current page a clickable link

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Styling

| Property | Value |
|---|---|
| Display | `flex` |
| Align items | `center` |
| Flex wrap | `wrap` |
| Gap | `var(--space-xs)` |
| Font size | `var(--font-xs)` |
| Color | `var(--text-faded)` |

### Selectors

| Selector | Purpose |
|---|---|
| `.breadcrumb` | Base container — flex row with wrapping |
| `.breadcrumb a` | Ancestor links — faded colour, underline on hover |
| `.breadcrumb a:hover` | Hover state — `var(--text-primary)` with underline |
| `.breadcrumb-separator` | Visual separator — faded colour, `user-select: none` |
| `.breadcrumb [aria-current="page"]` | Current page — `var(--text-primary)`, medium weight |
