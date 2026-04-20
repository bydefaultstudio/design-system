---
title: "Toast"
subtitle: "Temporary feedback that confirms an action"
description: "How to use the toast component for temporary notification messages."
author: "Studio"
section: "Design System"
layer: "core"
subsection: "Feedback"
order: 6
status: "published"
access: "team"
client: "internal"
---

# Toast

Toasts are temporary notifications that appear in the bottom-right corner and dismiss automatically. They require JavaScript (`assets/js/toast.js`).

Toast uses `data-type` for semantic message types — the same attribute and vocabulary as callout. Both are feedback components where the type describes what the message means, not just what colour to show.

---

## Basic usage

Include the script on any page that uses toasts:

```html
<script src="/assets/js/toast.js"></script>
```

Then call `showToast()` from JavaScript:

```js
showToast('Changes saved successfully.');
```

<div class="demo-preview">
  <button class="button" onclick="showToast('Changes saved successfully.')">Show default toast</button>
</div>

---

## Types

Use the second argument to set the message type. The JS sets `data-type` on the toast element, which drives the CSS colour.

<div class="demo-preview">
  <div class="block gap-s">
    <div class="toast" data-type="success" role="alert" style="position: static; max-width: 100%;">
      <span class="toast-message">Changes saved successfully.</span>
      <button class="toast-close" aria-label="Dismiss">{{icon:close}}</button>
    </div>
    <div class="toast" data-type="warning" role="alert" style="position: static; max-width: 100%;">
      <span class="toast-message">Your session will expire in 5 minutes.</span>
      <button class="toast-close" aria-label="Dismiss">{{icon:close}}</button>
    </div>
    <div class="toast" data-type="danger" role="alert" style="position: static; max-width: 100%;">
      <span class="toast-message">Failed to upload file. Please try again.</span>
      <button class="toast-close" aria-label="Dismiss">{{icon:close}}</button>
    </div>
    <div class="toast" data-type="info" role="alert" style="position: static; max-width: 100%;">
      <span class="toast-message">New comment on your project.</span>
      <button class="toast-close" aria-label="Dismiss">{{icon:close}}</button>
    </div>
  </div>
</div>

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <button class="button" onclick="showToast('Changes saved.', 'success')">Success</button>
  <button class="button" onclick="showToast('Connection unstable.', 'warning')">Warning</button>
  <button class="button" onclick="showToast('Failed to save.', 'danger')">Danger</button>
  <button class="button" onclick="showToast('New version available.', 'info')">Info</button>
</div>

```js
showToast('Changes saved.', 'success');
showToast('Connection unstable.', 'warning');
showToast('Failed to save.', 'danger');
showToast('New version available.', 'info');
```

Each variant uses `--status-*` and `--status-*-bg` tokens for colour.

---

## JavaScript

### API

```js
showToast(message, type, duration);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | — | Toast message text (required) |
| `type` | string | `'default'` | `'default'`, `'success'`, `'warning'`, `'danger'`, `'info'` |
| `duration` | number | `4000` | Auto-dismiss time in milliseconds |

### HTML structure

The JS creates this markup automatically:

```html
<div class="toast-container" aria-live="polite" aria-atomic="false">
  <div class="toast" data-type="success" role="alert">
    <span class="toast-message">Changes saved.</span>
    <button class="toast-close" aria-label="Dismiss">
      <div class="svg-icn" data-icon="close">...</div>
    </button>
  </div>
</div>
```

The container is injected once at the end of `<body>`. Individual toasts are appended and removed automatically.

---

## Accessibility

- The container uses `aria-live="polite"` so screen readers announce new toasts
- Each toast has `role="alert"`
- The dismiss button has `aria-label="Dismiss"`
- Toasts auto-dismiss after the specified duration — users can also dismiss manually

---

## Usage rules

**Do**

- Use toasts for transient, non-blocking feedback (save confirmations, status updates)
- Keep messages short and actionable

**Don't**

- Don't use toasts for critical errors that require user action — use a modal or inline alert
- Don't stack more than 3 toasts simultaneously

---

## CSS reference

This section documents how the component is built. For usage, see the sections above.

### Styling

| Property | Value (Light) | Value (Dark) |
|---|---|---|
| Background | `var(--warm-black)` | `var(--neutral-100)` |
| Text colour | `var(--off-white)` | `var(--warm-black)` |

### Selectors

| Selector | Purpose |
|---|---|
| `.toast-container` | Fixed position container (bottom-right), holds all toasts |
| `.toast` | Individual toast — background, text colour, layout |
| `.toast[data-type="success"]`, `.toast[data-type="green"]` | Success colour variant |
| `.toast[data-type="warning"]`, `.toast[data-type="yellow"]` | Warning colour variant |
| `.toast[data-type="danger"]`, `.toast[data-type="red"]` | Danger colour variant |
| `.toast[data-type="info"]`, `.toast[data-type="blue"]` | Info colour variant |
| `.toast-message` | Message text span |
| `.toast-close` | Dismiss button |
