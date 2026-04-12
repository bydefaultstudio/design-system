---
title: "Button"
subtitle: "Actions that communicate intent and hierarchy"
description: "How to use button styles and modifiers in the design system."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Data Entry"
order: 1
status: "published"
access: "team"
client: "internal"
---

Buttons are interactive elements used to trigger actions. They size to their content by default and should communicate **clear intent and hierarchy**.

The `.button` class is required for styled buttons. The bare `<button>` element has only a minimal reset — always add `class="button"` to get the full button appearance.

---

## Primary Button

The default `.button` is the most prominent action on the page.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div><button class="button">Primary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Hover</p>
      <div><button class="button" style="transform: scale(1.05);">Primary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div><button class="button" disabled>Primary Action</button></div>
    </div>
  </div>
</div>

```html
<button class="button">Primary Action</button>
<button class="button" disabled>Primary Action</button>
```

---

## Outline Button

`.is-outline` removes the filled background and uses a border instead. Use for secondary actions that shouldn't compete with the primary CTA.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div><button class="button is-outline">Secondary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Hover</p>
      <div><button class="button is-outline" style="transform: scale(1.05);">Secondary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div><button class="button is-outline" disabled>Secondary Action</button></div>
    </div>
  </div>
</div>

```html
<button class="button is-outline">Secondary Action</button>
```

---

## Faded Button

`.is-faded` applies a subtle background for low-priority or passive actions.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div><button class="button is-faded">Optional Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Hover</p>
      <div><button class="button is-faded" style="transform: scale(1.05);">Optional Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div><button class="button is-faded" disabled>Optional Action</button></div>
    </div>
  </div>
</div>

```html
<button class="button is-faded">Optional Action</button>
```

---

## Outline + Faded

`.is-outline.is-faded` combines both modifiers for tertiary or utility actions.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div><button class="button is-outline is-faded">Tertiary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Hover</p>
      <div><button class="button is-outline is-faded" style="transform: scale(1.05);">Tertiary Action</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div><button class="button is-outline is-faded" disabled>Tertiary Action</button></div>
    </div>
  </div>
</div>

```html
<button class="button is-outline is-faded">Tertiary Action</button>
```

---

## Small Button

`.is-small` reduces font size and padding for dense UI areas.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div class="block row gap-m">
        <button class="button is-small">Small Primary</button>
        <button class="button is-small is-outline">Small Outline</button>
        <button class="button is-small is-faded">Small Faded</button>
        <button class="button is-small is-outline is-faded">Small Tertiary</button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div class="block row gap-m">
        <button class="button is-small" disabled>Small Primary</button>
        <button class="button is-small is-outline" disabled>Small Outline</button>
      </div>
    </div>
  </div>
</div>

```html
<button class="button is-small">Small Primary</button>
<button class="button is-small is-outline">Small Outline</button>
<button class="button is-small is-faded">Small Faded</button>
```

---

## Icon Button

`.is-icon` creates a circular button designed for icons only. Always include `aria-label` for accessibility.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Default</p>
      <div class="block row gap-m">
        <button class="button is-icon" aria-label="Close">
          <div class="svg-icn" data-icon="close">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>
            </svg>
          </div>
        </button>
        <button class="button is-icon is-faded" aria-label="Search">
          <div class="svg-icn" data-icon="search">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M18.6 20L15.5658 16.9658C14.8452 16.2452 13.7005 16.2131 12.7513 16.584C12.6932 16.6067 12.6344 16.6287 12.575 16.65C11.925 16.8833 11.2333 17 10.5 17C8.68333 17 7.14583 16.3708 5.8875 15.1125C4.62917 13.8542 4 12.3167 4 10.5C4 8.68333 4.62917 7.14583 5.8875 5.8875C7.14583 4.62917 8.68333 4 10.5 4C12.3167 4 13.8542 4.62917 15.1125 5.8875C16.3708 7.14583 17 8.68333 17 10.5C17 11.2333 16.8833 11.925 16.65 12.575C16.6287 12.6344 16.6067 12.6932 16.584 12.7513C16.2131 13.7005 16.2452 14.8452 16.9658 15.5658L20 18.6L18.6 20ZM10.5 15C11.75 15 12.8125 14.5625 13.6875 13.6875C14.5625 12.8125 15 11.75 15 10.5C15 9.25 14.5625 8.1875 13.6875 7.3125C12.8125 6.4375 11.75 6 10.5 6C9.25 6 8.1875 6.4375 7.3125 7.3125C6.4375 8.1875 6 9.25 6 10.5C6 11.75 6.4375 12.8125 7.3125 13.6875C8.1875 14.5625 9.25 15 10.5 15Z" fill="currentColor"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Disabled</p>
      <div class="block row gap-m">
        <button class="button is-icon" aria-label="Close" disabled>
          <div class="svg-icn" data-icon="close">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
              <path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</div>

```html
<button class="button is-icon" aria-label="Close">
  <div class="svg-icn" data-icon="close"><!-- SVG icon --></div>
</button>

<button class="button is-icon is-faded" aria-label="Search">
  <div class="svg-icn" data-icon="search"><!-- SVG icon --></div>
</button>
```

---

## Button Group

`.button-group` is a flex container for grouping multiple buttons together. It provides consistent spacing, wraps on smaller screens, and vertically centres buttons of different sizes.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Left-aligned (default)</p>
      <div class="button-group">
        <button class="button">Confirm</button>
        <button class="button is-outline">Cancel</button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Centred</p>
      <div class="button-group justify-center">
        <button class="button">Confirm</button>
        <button class="button is-outline">Cancel</button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Right-aligned</p>
      <div class="button-group justify-end">
        <button class="button is-faded">Cancel</button>
        <button class="button">Confirm</button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Mixed sizes</p>
      <div class="button-group">
        <button class="button">Primary</button>
        <button class="button is-small is-outline">Small Secondary</button>
        <button class="button is-small is-faded">Small Tertiary</button>
      </div>
    </div>
  </div>
</div>

```html
<div class="button-group">
  <button class="button">Confirm</button>
  <button class="button is-outline">Cancel</button>
</div>

<div class="button-group justify-center">...</div>
<div class="button-group justify-end">...</div>
```

| Class | Effect |
| --- | --- |
| `.button-group` | Flex container with consistent gap |
| `.justify-center` | Centre-aligns the group |
| `.justify-end` | Right-aligns the group |

---

## All Variants

A side-by-side comparison of every button style at default size.

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap; align-items: center;">
    <button class="button">Primary</button>
    <button class="button is-outline">Outline</button>
    <button class="button is-faded">Faded</button>
    <button class="button is-outline is-faded">Outline Faded</button>
    <button class="button is-small">Small</button>
    <button class="button is-icon" aria-label="Icon"><div class="svg-icn" data-icon="add"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="currentColor"/></svg></div></button>
  </div>
</div>

---

## Copy Button

The `.copy-btn` adds clipboard copy functionality to any button. It copies the value from `data-copy` and shows a "Copied!" state. Three variants are available. See the [Copy Button](copy-button.html) docs for full details.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Icon + Text</p>
      <div class="block row gap-m">
        <button class="button is-small is-outline copy-btn" data-copy="var(--button-primary)" type="button">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div> Copy</span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div> Copied!</span>
        </button>
        <button class="button is-small is-outline copy-btn is-copied" type="button">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div> Copy</span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div> Copied!</span>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Icon Only</p>
      <div class="block row gap-m">
        <button class="button is-small is-outline copy-btn is-icon-only" data-copy="var(--button-primary)" data-tooltip="Copy" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
        <button class="button is-small is-outline copy-btn is-icon-only is-copied" data-tooltip="Copied!" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Ghost</p>
      <div class="block row gap-m">
        <button class="button copy-btn is-ghost" data-copy="var(--button-primary)" data-tooltip="Copy" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
        <button class="button copy-btn is-ghost is-copied" data-tooltip="Copied!" type="button" aria-label="Copy">
          <span class="copy-btn-default"><div class="svg-icn" data-icon="copy"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div></span>
          <span class="copy-btn-copied"><div class="svg-icn" data-icon="check"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M9.54998 18L3.84998 12.3L5.27498 10.875L8.13576 13.7358C8.91681 14.5168 10.1831 14.5168 10.9642 13.7358L18.725 5.97501L20.15 7.40001L9.54998 18Z" fill="currentColor"/></svg></div></span>
        </button>
      </div>
    </div>
  </div>
</div>

```html
<!-- Icon + Text -->
<button class="button is-small is-outline copy-btn" data-copy="value" type="button">
  <span class="copy-btn-default">{{icon:copy}} Copy</span>
  <span class="copy-btn-copied">{{icon:check}} Copied!</span>
</button>

<!-- Icon Only -->
<button class="button is-small is-outline copy-btn is-icon-only" data-copy="value" data-tooltip="Copy" type="button" aria-label="Copy">
  <span class="copy-btn-default">{{icon:copy}}</span>
  <span class="copy-btn-copied">{{icon:check}}</span>
</button>

<!-- Ghost -->
<button class="button copy-btn is-ghost" data-copy="value" data-tooltip="Copy" type="button" aria-label="Copy">
  <span class="copy-btn-default">{{icon:copy}}</span>
  <span class="copy-btn-copied">{{icon:check}}</span>
</button>
```

Requires `assets/js/copy-button.js`.

---

## Usage Rules

- Buttons should **never stretch full width** by default
- Use one clear primary button per section when possible
- Use outline or faded styles to reduce visual competition
- Use icon buttons **only** when the icon meaning is clear
- If a button feels too prominent or too quiet, change the modifier — not the base styles
