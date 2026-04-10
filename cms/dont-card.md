---
title: "Don't Card"
subtitle: "A card variant for flagging prohibited patterns"
description: "How to use the don't card pattern to communicate non-negotiable rules in brand and design-system docs."
section: "Design System"
layer: "docs-site"
subsection: "Content"
order: 3
status: "published"
access: "team"
client: "internal"
---

The don't card extends the standard `.card` to communicate a **non-negotiable rule** — used in brand books and design-system pages to flag prohibited patterns ("don't recolour the logo", "don't break the grid", "don't override tokens"). It uses the `--status-danger` colour for the icon so the rule reads as a stop signal at a glance.

It is deliberately small: a coloured icon, a short rule title, and one or two sentences of context. Pair them in a 3-column grid to present a set of rules together.

---

## Anatomy

```
.card.dont-card
  .dont-card-icon          ← coloured (--status-danger) icon slot
    {{icon:close-circled}}
  .card-title              ← short rule
  .card-description        ← one-line context
```

| Element | Class | Purpose |
|---|---|---|
| Wrapper | `.card.dont-card` | Standard card with vertical stack layout |
| Icon slot | `.dont-card-icon` | Coloured icon container — sized 2rem, `--status-danger` |
| Rule title | `.card-title` | Short imperative — "Don't recolour the logo" |
| Body | `.card-description` | One-line reason or context |

---

## Single rule

```html
<div class="card dont-card">
  <div class="dont-card-icon">{{icon:close-circled}}</div>
  <h4 class="card-title">Don't apply an outline</h4>
  <p class="card-description">The logotype is solid. Outlines, strokes, and hairline borders are not part of the system.</p>
</div>
```

---

## Rules grid

Use a 3-column grid (`.grid.cols-3.gap-m`) when presenting a set of rules together. Each card sits in its own grid cell.

```html
<div class="grid cols-3 gap-m">
  <div class="card dont-card">
    <div class="dont-card-icon">{{icon:close-circled}}</div>
    <h4 class="card-title">Don't recolour the logotype</h4>
    <p class="card-description">The wordmark is monochrome — pure black or pure white only.</p>
  </div>
  <div class="card dont-card">
    <div class="dont-card-icon">{{icon:close-circled}}</div>
    <h4 class="card-title">Don't stretch or distort</h4>
    <p class="card-description">Scale uniformly. Never squash, stretch, skew, or warp the proportions.</p>
  </div>
  <div class="card dont-card">
    <div class="dont-card-icon">{{icon:close-circled}}</div>
    <h4 class="card-title">Don't apply at an angle</h4>
    <p class="card-description">Keep the logotype upright. No tilts, rotations, or "playful" angles.</p>
  </div>
</div>
```

---

## Icon choice

The default icon is `close-circled` (a circled X) because it reads as a clear stop signal across cultures and is already in the brand icon registry. If a more specific icon better describes the rule (e.g. `palette` for "don't recolour", `crop` for "don't crop"), substitute it — the icon slot accepts any brand icon. The colour is set on `.dont-card-icon` and inherits via `currentColor`.

---

## Do / Don't

**Do:**

- Use the don't card for **non-negotiable rules** in brand and design-system docs
- Keep titles short and imperative — "Don't X", not "X should not be Y"
- Use a 3-column grid for sets of 6+ rules; a 2-column grid is fine for 3–4
- Pair with a "Do" section in plain prose nearby so readers see both sides

**Don't:**

- Don't use the don't card for soft preferences — use a callout or plain text instead
- Don't write more than two sentences in `.card-description` — if a rule needs that much explanation, it belongs in the surrounding prose
- Don't substitute the danger colour for another status — the red is the visual signal that makes the pattern read as "stop"
- Don't nest don't cards inside each other or inside callouts
