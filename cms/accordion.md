---
title: "Accordion"
subtitle: "Expandable sections with single or multi-open modes"
description: "How to use the accordion component for collapsible, grouped content."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 5
status: "published"
access: "team"
client: "internal"
---

Accordions group related content into collapsible sections. They support two modes: **single** (opening one panel closes the others) and **multi** (each panel toggles independently). The component requires JavaScript (`assets/js/accordion.js`).

The accordion is **structural only** — it provides open/close mechanics, icon animation, and keyboard navigation but no visual styling (borders, padding, colours). Consuming pages add their own styles to match their context.

---

## Basic usage

Include the script on any page that uses accordions:

```html
<script src="/assets/js/accordion.js"></script>
```

The script auto-initialises all `.accordion` containers on DOMContentLoaded. No manual setup needed.

<div class="demo-preview">
  <div class="accordion" data-accordion="multi" style="border-top: var(--border-s) solid var(--border-faded);">
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="demo-panel-1" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Brand tokens</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="demo-panel-1" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Colour, typography, and spacing primitives that define the visual identity.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="demo-panel-2" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Semantic tokens</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="demo-panel-2" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Purpose-driven aliases that map brand primitives to interface roles.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="demo-panel-3" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Layout primitives</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="demo-panel-3" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Structural building blocks for page composition — sections, containers, blocks.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<div class="accordion" data-accordion="multi">
  <div class="accordion-item">
    <button type="button" class="accordion-header"
            aria-expanded="false" aria-controls="panel-1">
      <span class="accordion-title">Heading text</span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>
    <div class="accordion-content" id="panel-1" role="region">
      <div class="accordion-inner">
        <div class="accordion-body">
          Content goes here.
        </div>
      </div>
    </div>
  </div>
  <!-- More .accordion-item elements -->
</div>
```

---

## Structure

The three-element panel structure exists because of how the CSS grid animation works:

```
.accordion-content  → grid container (grid-template-rows: 0fr → 1fr)
  .accordion-inner  → overflow clipper (overflow: hidden, min-height: 0)
    .accordion-body → consumer content and padding live here
```

**Why three elements?** The grid row collapses `.accordion-inner` to zero height, but padding on `.accordion-inner` itself would bleed through the `0fr` state and prevent full collapse. `.accordion-body` sits inside the clipping boundary, so its padding gets hidden when the panel is closed.

**Rule:** Never put padding or margin on `.accordion-inner`. Always use `.accordion-body` for spacing.

---

## Modes

### Multi-open (default)

Each panel toggles independently. Set `data-accordion="multi"` or omit the attribute entirely.

```html
<div class="accordion" data-accordion="multi">
```

### Single-open

Opening one panel closes all siblings. Set `data-accordion="single"`.

<div class="demo-preview">
  <div class="accordion" data-accordion="single" style="border-top: var(--border-s) solid var(--border-faded);">
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="single-panel-1" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">First section</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="single-panel-1" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Opening this panel closes the others.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="single-panel-2" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Second section</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="single-panel-2" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Only one panel can be open at a time.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="single-panel-3" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Third section</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="single-panel-3" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Mutual exclusion keeps the interface focused.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<div class="accordion" data-accordion="single">
  <!-- Items behave as mutual-exclusion group -->
</div>
```

---

## JavaScript

### Auto-initialisation

The script initialises all `.accordion` containers automatically on DOMContentLoaded. No manual setup is required.

### Re-initialisation (SPA / Barba)

For single-page apps or Barba transitions, call `initAccordion()` after new content is injected:

```js
if (typeof window.initAccordion === "function") {
  window.initAccordion();
}
```

The function is safe to call multiple times — headers that are already bound are skipped via a `data-accordion-bound` guard.

### Scoping

The component uses `:scope > .accordion-item` to select only direct-child items. This means nested accordions work correctly — each level manages its own items without interfering with inner or outer levels.

---

## Nested accordions

Combine single-open and multi-open modes across nesting levels. The outer accordion controls top-level navigation while inner accordions allow independent exploration within each section.

<div class="demo-preview">
  <div class="accordion" data-accordion="single" style="border-top: var(--border-s) solid var(--border-faded);">
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="nested-outer-1" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Design</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="nested-outer-1" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l); padding-left: var(--space-l);">
            <div class="accordion" data-accordion="multi">
              <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
                <button type="button" class="accordion-header" aria-expanded="false" aria-controls="nested-inner-1" style="padding: var(--space-s) 0; color: var(--text-secondary); font-size: var(--font-size-s);">
                  <span class="accordion-title">Brand identity</span>
                  <span class="accordion-icon" aria-hidden="true" style="width: 18px; height: 18px;"></span>
                </button>
                <div class="accordion-content" id="nested-inner-1" role="region">
                  <div class="accordion-inner">
                    <div class="accordion-body" style="padding-bottom: var(--space-m);">
                      <p class="text-secondary" style="font-size: var(--font-size-s);">Logo, colour palette, typography selection.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
                <button type="button" class="accordion-header" aria-expanded="false" aria-controls="nested-inner-2" style="padding: var(--space-s) 0; color: var(--text-secondary); font-size: var(--font-size-s);">
                  <span class="accordion-title">Design system</span>
                  <span class="accordion-icon" aria-hidden="true" style="width: 18px; height: 18px;"></span>
                </button>
                <div class="accordion-content" id="nested-inner-2" role="region">
                  <div class="accordion-inner">
                    <div class="accordion-body" style="padding-bottom: var(--space-m);">
                      <p class="text-secondary" style="font-size: var(--font-size-s);">Tokens, components, layout primitives.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion-item" style="border-bottom: var(--border-s) solid var(--border-faded);">
      <button type="button" class="accordion-header" aria-expanded="false" aria-controls="nested-outer-2" style="padding: var(--space-m) 0; color: var(--text-primary);">
        <span class="accordion-title">Development</span>
        <span class="accordion-icon" aria-hidden="true"></span>
      </button>
      <div class="accordion-content" id="nested-outer-2" role="region">
        <div class="accordion-inner">
          <div class="accordion-body" style="padding-bottom: var(--space-l);">
            <p class="text-secondary">Front-end implementation, CMS integration, deployment.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<!-- Outer: single-open -->
<div class="accordion" data-accordion="single">
  <div class="accordion-item">
    <button type="button" class="accordion-header" aria-expanded="false">
      <span class="accordion-title">Design</span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>
    <div class="accordion-content">
      <div class="accordion-inner">
        <div class="accordion-body">

          <!-- Inner: multi-open -->
          <div class="accordion" data-accordion="multi">
            <div class="accordion-item">
              <button type="button" class="accordion-header" aria-expanded="false"
                      aria-controls="inner-panel-1">
                <span class="accordion-title">Brand identity</span>
                <span class="accordion-icon" aria-hidden="true"></span>
              </button>
              <div class="accordion-content" id="inner-panel-1" role="region">
                <div class="accordion-inner">
                  <div class="accordion-body">Content</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next focusable element (including accordion headers) |
| `Enter` / `Space` | Toggle the focused panel open or closed |
| `ArrowDown` | Move focus to the next header in the group (wraps to first) |
| `ArrowUp` | Move focus to the previous header in the group (wraps to last) |
| `Home` | Move focus to the first header in the group |
| `End` | Move focus to the last header in the group |

Arrow key navigation is scoped to each accordion level — nested accordions navigate independently.

---

## Accessibility notes

- Each `.accordion-header` is a `<button>` element, ensuring native keyboard support (Enter/Space)
- `aria-expanded` on headers is updated dynamically by the script (`"false"` when closed, `"true"` when open)
- `aria-controls` on the header links to the `id` on the corresponding `.accordion-content`
- `.accordion-content` uses `role="region"` as a landmark for assistive technology
- `.accordion-icon` has `aria-hidden="true"` — it's decorative, not informational
- Focus-visible ring appears on keyboard navigation, suppressed on mouse click

---

## Styling guide

The accordion CSS in `design-system.css` is deliberately structural — it handles the flex layout of headers, the grid-based expand/collapse animation, and the icon rotation. It does **not** set:

- Borders between items
- Padding on headers or content
- Text colour, font size, or weight
- Background colour
- Hover states

Consuming pages add these styles to match their context. Apply padding to `.accordion-body`, never to `.accordion-inner`.

**Example — bordered accordion with padding:**

```css
.faq-accordion .accordion-item {
  border-bottom: var(--border-s) solid var(--border-faded);
}

.faq-accordion .accordion-header {
  padding: var(--space-m) 0;
  color: var(--text-primary);
}

.faq-accordion .accordion-header:hover {
  color: var(--text-secondary);
}

.faq-accordion .accordion-body {
  padding-bottom: var(--space-l);
}
```

```html
<div class="faq-accordion accordion" data-accordion="single">
  <!-- Items inherit the visual styles from .faq-accordion -->
</div>
```

---

## CSS class reference

| Class | Purpose |
|-------|---------|
| `.accordion` | Container. Requires `data-accordion="single\|multi"` |
| `.accordion-item` | Individual panel wrapper (direct child of `.accordion`) |
| `.accordion-header` | `<button>` trigger — flex layout with gap between title and icon |
| `.accordion-title` | Optional `<span>` for heading text inside the header |
| `.accordion-icon` | Plus/minus icon — rotates the vertical bar 90 degrees when open |
| `.accordion-content` | Grid container — animates `grid-template-rows: 0fr → 1fr` |
| `.accordion-inner` | Overflow clipper — `overflow: hidden`, `min-height: 0`. Never apply padding here |
| `.accordion-body` | Content wrapper — consumer padding and content live here |
| `.is-open` | State class added to `.accordion-item` when the panel is expanded |

---

## Accordion vs disclosure

Use **accordion** when content is grouped and benefits from single-open mutual exclusion, or when you need keyboard navigation between panels (ArrowUp/Down).

Use **disclosure** (`<details>`/`<summary>`) for standalone collapsible sections where multiple panels being open simultaneously is the expected behaviour and native HTML semantics are preferred.

---

## Do / Don't

**Do:**
- Use for FAQ sections, grouped service descriptions, or settings panels
- Use single mode when content is mutually exclusive
- Provide clear, descriptive header text that tells users what's inside
- Use `aria-controls` and matching `id` attributes for accessibility
- Apply padding to `.accordion-body`, not `.accordion-inner`

**Don't:**
- Don't use for navigation — use proper nav patterns
- Don't nest more than two levels deep
- Don't put critical content that all users need inside a collapsed panel
- Don't use when a simple list or visible layout would serve better
- Don't put padding or margin on `.accordion-inner` — it will bleed through when collapsed
