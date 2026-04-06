---
title: "Badge"
subtitle: "Status labels and category indicators"
description: "How to use badge and pill components for status labels, version tags, and category indicators."
section: "Design System"
subsection: "Feedback"
order: 1
slug: "badge"
status: "published"
access: "team"
client: "internal"
---

Badges are small inline labels used to indicate status, category, or metadata. They use the mono font (`--font-tertiary`) and pill shape by default.

---

## Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--badge-font-size` | `var(--font-2xs)` | Font size |
| `--badge-padding-y` | `var(--space-2xs)` | Vertical padding |
| `--badge-padding-x` | `var(--space-s)` | Horizontal padding |
| `--badge-radius` | `var(--radius-pill)` | Border radius (pill) |

Status variants reuse the global `--status-*` tokens.

---

## Basic usage

<div class="demo-preview">
  <span class="badge">Default</span>
</div>

```html
<span class="badge">Default</span>
```

---

## Variants

<div class="demo-preview" style="display: flex; gap: var(--space-m); flex-wrap: wrap;">
  <span class="badge">Default</span>
  <span class="badge badge--success">Success</span>
  <span class="badge badge--warning">Warning</span>
  <span class="badge badge--danger">Danger</span>
  <span class="badge badge--info">Info</span>
  <span class="badge badge--accent">Accent</span>
</div>

```html
<span class="badge">Default</span>
<span class="badge badge--success">Success</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--danger">Danger</span>
<span class="badge badge--info">Info</span>
<span class="badge badge--accent">Accent</span>
```

Each variant uses `color-mix()` to create a transparent tinted background from the corresponding `--status-*` token.

---

## Accessibility notes

- Badges are presentational — they do not require ARIA roles
- Ensure the badge text provides sufficient context (avoid colour-only meaning)
- If a badge conveys critical status, pair it with descriptive text nearby

---

## Do / Don't

**Do:**
- Use badges for metadata: status, version, category
- Keep badge text short (1-2 words)

**Don't:**
- Don't use badges as buttons — they are not interactive
- Don't rely on colour alone to convey meaning
