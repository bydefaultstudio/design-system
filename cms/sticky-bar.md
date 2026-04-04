---
title: "Sticky Bar"
subtitle: "Sticky contextual toolbar for page-level controls"
description: "How to use the sticky bar component for breadcrumbs, actions, dropdowns, tabs, toggles, and contextual navigation."
section: "Design System"
subsection: ""
order: 23
slug: "sticky-bar"
status: "published"
access: "team"
client: "internal"
---

The sticky bar is a horizontal bar that sticks below the page header as the user scrolls. It provides contextual controls for the current page — breadcrumbs, tabs, dropdowns, toggles, or any combination.

Child components (tabs, breadcrumbs, toggles, segmented controls) are automatically styled when placed inside a `.sticky-bar` — they stretch to fill the bar height and align correctly without extra classes.

---

## Tokens

The sticky bar uses existing design system tokens. No component-specific tokens are needed.

| Property | Value | Purpose |
|----------|-------|---------|
| `position` | `sticky` | Sticks to the top of the viewport on scroll |
| `top` | `0` | Default position (override to sit below a fixed header) |
| `z-index` | `40` | Sits above page content, below modals |
| `background` | `var(--background-primary)` | Matches the page background |
| `border-bottom` | `var(--border-s) solid var(--border-faded)` | Subtle bottom border on inner |

---

## Breadcrumbs

The most common usage — breadcrumb navigation inside the bar.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">
        <a href="#">Home</a>
        <span class="breadcrumb-separator">/</span>
        <a href="#">Design System</a>
        <span class="breadcrumb-separator">/</span>
        <span>Button</span>
      </nav>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">
      <a href="#">Home</a>
      <span class="breadcrumb-separator">/</span>
      <a href="#">Design System</a>
      <span class="breadcrumb-separator">/</span>
      <span>Button</span>
    </nav>
  </div>
</div>
```

---

## Tabs

Tab-style anchor links for page section navigation. Inside a `.sticky-bar`, tabs automatically stretch to the full bar height and the active indicator aligns with the bottom border.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <div class="tabs">
        <a href="#" class="tab is-active">Overview</a>
        <a href="#" class="tab">Components</a>
        <a href="#" class="tab">Tokens</a>
      </div>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <div class="tabs">
      <a href="#section-1" class="tab is-active">Overview</a>
      <a href="#section-2" class="tab">Components</a>
      <a href="#section-3" class="tab">Tokens</a>
    </div>
  </div>
</div>
```

---

## Dropdown

Dropdowns inside the sticky bar use the standard `.dropdown` component. The trigger gets tighter horizontal padding automatically when inside a `.sticky-bar`.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">
        <a href="#">Design System</a>
        <span class="breadcrumb-separator">/</span>
        <span>Color</span>
      </nav>
      <div class="sticky-bar-actions">
        <div class="dropdown">
          <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
            <div class="icn-svg" data-icon="more-horizontal"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 10L6 10V14H2L2 10ZM10 10L14 10V14H10V10ZM18 10L22 10V14H18V10Z" fill="currentColor"/></svg></div>
          </button>
          <div class="dropdown-menu is-right">
            <a href="#" class="dropdown-item">Download</a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">View source</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">...</nav>
    <div class="sticky-bar-actions">
      <div class="dropdown">
        <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
          <!-- icon -->
        </button>
        <div class="dropdown-menu is-right">
          <a href="#" class="dropdown-item">Download</a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">View source</a>
        </div>
      </div>
    </div>
  </div>
</div>
```

See the [Dropdown](dropdown.html) docs for the full component reference.

---

## Toggle

Form toggles centre vertically inside the bar automatically.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <span class="text-size-small">Dark mode</span>
      <label class="form-toggle">
        <input type="checkbox" role="switch">
        <span class="form-toggle-track"></span>
      </label>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <span>Dark mode</span>
    <label class="form-toggle">
      <input type="checkbox" role="switch">
      <span class="form-toggle-track"></span>
    </label>
  </div>
</div>
```

---

## Segmented control

Segmented controls centre vertically inside the bar automatically.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <span class="text-size-small">View</span>
      <div class="segmented-control" role="group" aria-label="View mode">
        <button class="segmented-control-btn is-active" type="button">Grid</button>
        <button class="segmented-control-btn" type="button">List</button>
        <button class="segmented-control-btn" type="button">Table</button>
      </div>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <span>View</span>
    <div class="segmented-control" role="group" aria-label="View mode">
      <button class="segmented-control-btn is-active" type="button">Grid</button>
      <button class="segmented-control-btn" type="button">List</button>
      <button class="segmented-control-btn" type="button">Table</button>
    </div>
  </div>
</div>
```

---

## Combined

A realistic example combining breadcrumbs, tabs, and a dropdown action menu in one bar.

<div class="demo-preview">
  <div class="sticky-bar" style="position: relative;">
    <div class="sticky-bar-inner">
      <div class="tabs">
        <a href="#" class="tab is-active">Overview</a>
        <a href="#" class="tab">Settings</a>
        <a href="#" class="tab">Activity</a>
      </div>
      <div class="sticky-bar-actions">
        <div class="dropdown">
          <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
            <div class="icn-svg" data-icon="more-horizontal"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 10L6 10V14H2L2 10ZM10 10L14 10V14H10V10ZM18 10L22 10V14H18V10Z" fill="currentColor"/></svg></div>
          </button>
          <div class="dropdown-menu is-right">
            <a href="#" class="dropdown-item">Export</a>
            <a href="#" class="dropdown-item">Share</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<div class="sticky-bar">
  <div class="sticky-bar-inner">
    <div class="tabs">
      <a href="#overview" class="tab is-active">Overview</a>
      <a href="#settings" class="tab">Settings</a>
      <a href="#activity" class="tab">Activity</a>
    </div>
    <div class="sticky-bar-actions">
      <div class="dropdown">
        <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="More options">
          <!-- icon -->
        </button>
        <div class="dropdown-menu is-right">
          <a href="#" class="dropdown-item">Export</a>
          <a href="#" class="dropdown-item">Share</a>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Supported child components

Any of these components automatically adapt when placed inside a `.sticky-bar`:

| Component | Behaviour inside sticky bar |
|-----------|---------------------------|
| `.tabs` / `.tab` | Stretches to full bar height, indicator aligns with bottom border |
| `.breadcrumb` | Centres vertically |
| `.sticky-bar-breadcrumbs` | Centres vertically (docs-specific breadcrumb variant) |
| `.form-toggle` | Centres vertically |
| `.segmented-control` | Centres vertically |
| `.dropdown` | Stretches to full bar height, trigger gets compact padding |
| `.sticky-bar-actions` | Stretches to full bar height, aligns right |

---

## Structure

| Element | Class | Purpose |
|---------|-------|---------|
| Outer wrapper | `.sticky-bar` | Sticky positioning and background |
| Content wrapper | `.sticky-bar-inner` | Flexbox layout, border, padding |
| Breadcrumbs | `.sticky-bar-breadcrumbs` | Breadcrumb navigation (docs variant) |
| Actions | `.sticky-bar-actions` | Right-aligned action group |
| Dropdown | `.dropdown` | Standard dropdown component (see [Dropdown docs](dropdown.html)) |

---

## Docs site overrides

On the documentation site, `style.css` overrides the default `top: 0` to sit below the fixed site header:

```css
.sticky-bar {
  top: var(--header-height);
}

.sticky-bar-inner {
  max-width: 1080px;
  margin: 0 auto;
  height: var(--sticky-bar-height);
}
```

Tool pages (calculator, SVG cleaner) may set their own `max-width` and `padding` on `.sticky-bar-inner` to match their layout.

---

## Accessibility notes

- Use `<nav>` with `aria-label` for breadcrumb sections
- Dropdown triggers should have `aria-label` describing their action
- Tab links are focusable via Tab key
- Toggle inputs should have `role="switch"` and associated labels

---

## Do / Don't

**Do:**
- Use the sticky bar for page-level contextual controls
- Combine children freely — tabs + dropdown, breadcrumbs + toggle, etc.
- Override `top` when the bar needs to sit below a fixed header

**Don't:**
- Don't put primary page content in the sticky bar
- Don't stack multiple sticky bars on the same page
- Don't use the sticky bar as a replacement for the main site navigation
