---
title: "Tabs"
subtitle: "Switch between related content without leaving the page"
description: "How to use the tabs component for switching between content panels."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 4
status: "published"
access: "team"
client: "internal"
---

Tabs organise content into panels that the user switches between. The component requires JavaScript (`assets/js/tabs.js`) for interaction and follows the WAI-ARIA tabs pattern.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `var(--tab-active-color)` | `var(--text-primary)` | Active tab text colour |
| `var(--tab-inactive-color)` | `var(--text-faded)` | Inactive tab text colour |
| `var(--tab-indicator-color)` | `var(--text-primary)` | Bottom border indicator |

---

## Basic usage

<div class="demo-preview">
  <div class="tabs" role="tablist" aria-label="Demo tabs">
    <button class="tab is-active" role="tab" aria-selected="true" aria-controls="demo-panel-1" id="demo-tab-1">Tab One</button>
    <button class="tab" role="tab" aria-selected="false" aria-controls="demo-panel-2" id="demo-tab-2">Tab Two</button>
    <button class="tab" role="tab" aria-selected="false" aria-controls="demo-panel-3" id="demo-tab-3">Tab Three</button>
  </div>
  <div class="tab-panel" id="demo-panel-1" role="tabpanel" aria-labelledby="demo-tab-1">
    <p>Panel 1 content</p>
  </div>
  <div class="tab-panel is-hidden" id="demo-panel-2" role="tabpanel" aria-labelledby="demo-tab-2">
    <p>Panel 2 content</p>
  </div>
  <div class="tab-panel is-hidden" id="demo-panel-3" role="tabpanel" aria-labelledby="demo-tab-3">
    <p>Panel 3 content</p>
  </div>
</div>

```html
<div class="tabs" role="tablist" aria-label="Section name">
  <button class="tab is-active" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Tab One</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Tab Two</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3">Tab Three</button>
</div>

<div class="tab-panel" id="panel-1" role="tabpanel" aria-labelledby="tab-1">
  Panel 1 content
</div>
<div class="tab-panel is-hidden" id="panel-2" role="tabpanel" aria-labelledby="tab-2">
  Panel 2 content
</div>
<div class="tab-panel is-hidden" id="panel-3" role="tabpanel" aria-labelledby="tab-3">
  Panel 3 content
</div>
```

---

## JavaScript

Include `assets/js/tabs.js` on any page that uses tabs. The script automatically initialises all `[role="tablist"]` elements on the page.

```html
<script src="/assets/js/tabs.js"></script>
```

No manual initialisation is required.

---

## Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` | Moves focus to the active tab, then to the panel |
| `ArrowRight` | Moves focus to the next tab |
| `ArrowLeft` | Moves focus to the previous tab |
| `Home` | Moves focus to the first tab |
| `End` | Moves focus to the last tab |
| `Enter` / `Space` | Activates the focused tab (via click) |

---

## Accessibility notes

- The tab list uses `role="tablist"` with a descriptive `aria-label`
- Each tab uses `role="tab"` with `aria-selected` and `aria-controls`
- Each panel uses `role="tabpanel"` with `aria-labelledby`
- Hidden panels use `.is-hidden` (`display: none`) so they are removed from the tab order
- Focus ring appears on `focus-visible`

---

## Do / Don't

**Do:**
- Use unique IDs for tabs and panels on each page
- Set one tab as `is-active` and `aria-selected="true"` by default
- Provide a descriptive `aria-label` on the tablist

**Don't:**
- Don't use tabs for sequential steps (use a stepper pattern instead)
- Don't nest tablists inside tab panels
