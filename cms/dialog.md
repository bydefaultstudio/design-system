---
title: "Dialog"
subtitle: "Focused interactions that require a response"
description: "How to use the dialog component for modal windows, confirmations, and form overlays."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Content"
order: 6
status: "published"
access: "team"
client: "internal"
---

Dialogs are modal windows built on the native `<dialog>` element. They trap focus, darken the backdrop, and support header, body, and footer sections. Opening and closing is handled via `data-dialog-open` and `data-dialog-close` attributes.

---

## Basic usage

<div class="demo-preview">
  <button class="button" type="button" data-dialog-open="demo-dialog-basic">Open dialog</button>
  <dialog id="demo-dialog-basic" class="dialog">
    <div class="dialog-header">
      <h3 class="dialog-title">Dialog title</h3>
      <button class="dialog-close" type="button" aria-label="Close">
        <div class="svg-icn" data-icon="close"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>
      </button>
    </div>
    <div class="dialog-body">
      <p>This is the dialog body content. It can contain any HTML — text, forms, images, or other components.</p>
    </div>
    <div class="dialog-footer">
      <button class="button" data-variant="faded" type="button" data-dialog-close>Cancel</button>
      <button class="button" type="button" data-dialog-close>Confirm</button>
    </div>
  </dialog>
</div>

```html
<button class="button" type="button" data-dialog-open="my-dialog">Open dialog</button>

<dialog id="my-dialog" class="dialog">
  <div class="dialog-header">
    <h3 class="dialog-title">Dialog title</h3>
    <button class="dialog-close" type="button" aria-label="Close"><!-- close icon --></button>
  </div>
  <div class="dialog-body">
    <p>Dialog content here.</p>
  </div>
  <div class="dialog-footer">
    <button class="button" data-variant="faded" type="button" data-dialog-close>Cancel</button>
    <button class="button" type="button" data-dialog-close>Confirm</button>
  </div>
</dialog>
```

---

## Confirmation dialog

A destructive action pattern with a danger-styled confirm button.

<div class="demo-preview">
  <button class="button" data-variant="outline" type="button" data-dialog-open="demo-dialog-confirm">Delete project</button>
  <dialog id="demo-dialog-confirm" class="dialog">
    <div class="dialog-header">
      <h3 class="dialog-title">Delete project?</h3>
      <button class="dialog-close" type="button" aria-label="Close">
        <div class="svg-icn" data-icon="close"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>
      </button>
    </div>
    <div class="dialog-body">
      <p>This action cannot be undone. All files, settings, and history for this project will be permanently deleted.</p>
    </div>
    <div class="dialog-footer">
      <button class="button" data-variant="faded" type="button" data-dialog-close>Cancel</button>
      <button class="button" type="button" data-dialog-close data-color="danger">Delete</button>
    </div>
  </dialog>
</div>

---

## JavaScript

Include `assets/js/dialog.js` on any page using dialogs.

```html
<script src="/assets/js/dialog.js"></script>
```

- `data-dialog-open="dialog-id"` on a trigger opens the dialog via `showModal()`
- `data-dialog-close` or `.dialog-close` inside a dialog closes it
- Clicking the backdrop also closes the dialog

---

## Keyboard interactions

| Key | Action |
|-----|--------|
| `Escape` | Closes the dialog |
| `Tab` | Cycles through focusable elements inside the dialog (focus is trapped) |
| `Enter` / `Space` | Activates the focused button |

---

## Accessibility

- Uses the native `<dialog>` element — focus trapping is handled by the browser
- The dialog title should use `aria-labelledby` pointing to the `.dialog-title` ID
- Close buttons must have `aria-label="Close"`
- The backdrop is created by the browser's `::backdrop` pseudo-element

---

## Usage rules

**Do:**
- Use dialogs for actions that require confirmation or focused input
- Keep dialog content concise — one task per dialog
- Always provide a way to dismiss (close button + Escape + backdrop click)

**Don't:**
- Don't use dialogs for content that should be inline on the page
- Don't stack dialogs on top of each other
- Don't use dialogs for simple alerts — use callouts or toasts instead

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Tokens

| Token | Default (Light) | Default (Dark) | What it controls |
|---|---|---|---|
| `--dialog-background` | `var(--background-primary)` | `var(--background-secondary)` | Dialog surface |
| `--dialog-max-width` | `560px` | — | Maximum width |
| `--dialog-shadow` | `0 8px 32px var(--black-alpha-20)` | `0 8px 40px var(--black-alpha-60)` | Drop shadow |
| `--dialog-backdrop` | `rgba(0, 0, 0, 0.6)` | — | Backdrop overlay |

### Selectors

| Selector | Purpose |
|---|---|
| `.dialog` | Base component — background, max-width, shadow, border, padding |
| `.dialog::backdrop` | Backdrop overlay colour |
| `.dialog[open]` | Open state — opacity transition for entrance animation |
| `.dialog-header` | Flex row for title + close button |
| `.dialog-title` | Dialog heading |
| `.dialog-close` | Close button (icon button reset) |
| `.dialog-close:hover` | Close button hover — text colour change |
| `.dialog-close:focus-visible` | Close button focus ring |
| `.dialog-body` | Content area with vertical padding |
| `.dialog-footer` | Footer with flex-end alignment for action buttons |
| `[data-theme="dark"] .dialog` | Dark mode overrides for background and shadow |
