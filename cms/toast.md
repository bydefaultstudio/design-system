---
title: "Toast"
subtitle: "Notification messages"
description: "How to use the toast component for temporary notification messages."
section: "Design System"
subsection: ""
order: 20
slug: "toast"
status: "published"
access: "team"
client: "internal"
---

Toasts are temporary notifications that appear in the bottom-right corner and dismiss automatically. They require JavaScript (`assets/js/toast.js`).

---

## Tokens

| Token | Default (Light) | Default (Dark) | Purpose |
|-------|-----------------|----------------|---------|
| `--toast-background` | `var(--warm-black)` | `var(--neutral-100)` | Toast background |
| `--toast-text` | `var(--off-white)` | `var(--warm-black)` | Toast text colour |
| `--toast-radius` | `var(--radius-m)` | — | Corner radius |

Status variants use the global `--status-*` tokens for the left border accent.

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

---

## API

```js
showToast(message, type, duration);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | — | Toast message text (required) |
| `type` | string | `'default'` | `'default'`, `'success'`, `'warning'`, `'danger'`, `'info'` |
| `duration` | number | `4000` | Auto-dismiss time in milliseconds |

---

## Variants

```js
showToast('Changes saved.', 'success');
showToast('Connection unstable.', 'warning');
showToast('Failed to save.', 'danger');
showToast('New version available.', 'info');
```

Each variant adds a coloured left border using `--status-*` tokens.

---

## HTML structure

The JS creates this markup automatically:

```html
<div class="toast-container" aria-live="polite" aria-atomic="false">
  <div class="toast toast--success" role="alert">
    <span class="toast-message">Changes saved.</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  </div>
</div>
```

The container is injected once at the end of `<body>`. Individual toasts are appended and removed automatically.

---

## Accessibility notes

- The container uses `aria-live="polite"` so screen readers announce new toasts
- Each toast has `role="alert"`
- The dismiss button has `aria-label="Dismiss"`
- Toasts auto-dismiss after the specified duration — users can also dismiss manually

---

## Do / Don't

**Do:**
- Use toasts for transient, non-blocking feedback (save confirmations, status updates)
- Keep messages short and actionable

**Don't:**
- Don't use toasts for critical errors that require user action — use a modal or inline alert
- Don't stack more than 3 toasts simultaneously
