---
title: "Typography"
subtitle: "The three type families behind the brand"
description: "The brand type system — a sans for interface, a serif for headlines, a mono for code — and where each one is loaded from."
author: "Studio"
section: "Brand Book"
layer: "core"
subsection: "Visual Identity"
order: 3
status: "published"
access: "team"
client: "internal"
dropcap: true
---

The brand runs on three type families. Each one has a job; together they cover everything from a 12px tooltip to a 72px hero headline.

This page is the **brand-side** view — what each typeface is for, how it feels, and what to reach for in which situation. For the developer-facing token reference (sizes, weights, line heights), see [Typography](../design-system/typography.html).

---

## Inclusive Sans — interface and body

A geometric humanist sans designed by Olivia King for **maximum legibility at small sizes**. Open apertures, generous spacing, neutral personality. It does not call attention to itself, which is exactly why it works for body copy and UI: the eye reads through it, not at it.

Use Inclusive Sans for body text, navigation, buttons, form fields, captions, and anything else that needs to be read quickly without friction.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-primary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 500;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Inclusive Sans</p>
  </div>
</div>

**Loaded from:** Google Fonts CDN — [`fonts.googleapis.com`](https://fonts.google.com/specimen/Inclusive+Sans).
**Licence:** SIL Open Font Licence 1.1 (free to use, embed, and self-host).
**Weights in use:** 300, 400, 500, 600, 700.

---

## RecifeText — headlines and editorial

A contemporary text serif from DSType, drawn by Dino dos Santos. Tall x-height, low contrast, slightly informal. It carries weight without feeling stuffy — the right register for editorial headlines, big statements, and the kind of brand moments where the type itself should be doing some of the lifting.

Use RecifeText for headings (`h1`–`h6`), pull quotes, hero statements, and anywhere a headline needs to feel like a *headline* rather than just larger body text.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-secondary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 400;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0; font-family: var(--font-primary);">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">RecifeText</p>
  </div>
</div>

**Loaded from:** self-hosted in [`assets/fonts/recife-text/`](../assets/fonts/recife-text/).
**Licence:** Commercial — DSType desktop + web licence. Self-host for By Default properties only; do not redistribute or serve from a public CDN.
**Weights in use:** 400 (regular).

---

## IBM Plex Mono — code and labels

IBM's open monospace from the Plex superfamily. Rounded, even, and unmistakably technical. Use it for code blocks, inline `code`, keyboard shortcuts, file paths, and any small label that needs to read as "machine output" rather than running prose.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-tertiary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 500;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">IBM Plex Mono</p>
  </div>
</div>

**Loaded from:** Google Fonts CDN — [`fonts.googleapis.com`](https://fonts.google.com/specimen/IBM+Plex+Mono).
**Licence:** SIL Open Font Licence 1.1.
**Weights in use:** 400, 500, 600.

---

## When to reach for which

| Context | Family | Token |
| --- | --- | --- |
| Body copy, paragraphs, lists | Inclusive Sans | `var(--font-primary)` |
| Buttons, form fields, navigation | Inclusive Sans | `var(--font-primary)` |
| Page headings (`h1`–`h6`) | RecifeText | `var(--font-secondary)` |
| Hero statements, pull quotes | RecifeText | `var(--font-secondary)` |
| Code blocks, file paths, kbd | IBM Plex Mono | `var(--font-tertiary)` |

---

## Pairing rules

**Do**

- Use RecifeText for the headline and Inclusive Sans for everything underneath. That's the default rhythm.
- Lean on weight, not colour, to create hierarchy inside Inclusive Sans body copy.
- Use Plex Mono for anything that should feel literally "as written" — file names, terminal output, raw values.

**Don't**

- Don't set body copy in RecifeText. It's a display serif — at small sizes the texture gets noisy.
- Don't pair RecifeText with another serif. It's the only serif in the system.
- Don't use Plex Mono for decorative text. It carries a strong "code" connotation; it shouldn't be doing aesthetic duty.

---

## See also

- [Typography](../design-system/typography.html) — full token reference (sizes, weights, line heights, letter spacing)
- [Tokens](../design-system/tokens.html) — every CSS variable with raw values
