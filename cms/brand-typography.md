---
title: "Typography"
subtitle: "The four type families behind the brand"
description: "The brand type system — a variable sans for interface, a display font for headlines, a brand face for display, a mono for code — and where each one is loaded from."
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

The brand runs on four type families. Each one has a job; together they cover everything from a 12px tooltip to a 72px hero headline.

This page is the **brand-side** view — what each typeface is for, how it feels, and what to reach for in which situation. For the developer-facing token reference (sizes, weights, line heights), see [Typography](../design-system/typography.html).

---

## Zalando Sans — interface and body

A variable sans-serif with a weight range of 300–900 and width range of 75%–125%. Clean, modern, and highly legible at all sizes. It does not call attention to itself, which is exactly why it works for body copy and UI: the eye reads through it, not at it.

Use Zalando Sans for body text, navigation, buttons, form fields, captions, and anything else that needs to be read quickly without friction.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-primary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 500;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Zalando Sans</p>
  </div>
</div>

**Loaded from:** self-hosted variable font in [`assets/fonts/zalando-sans/`](../assets/fonts/zalando-sans/).
**Licence:** proprietary — self-host for By Default properties only.
**Weights in use:** 300–900 (variable).

---

## trust-3a — headlines and editorial

A display typeface loaded via Adobe Typekit. It carries weight without feeling stuffy — the right register for editorial headlines, big statements, and the kind of brand moments where the type itself should be doing some of the lifting.

Use trust-3a for headings (`h1`–`h6`), pull quotes, hero statements, and anywhere a headline needs to feel like a *headline* rather than just larger body text.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-secondary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 400;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0; font-family: var(--font-primary);">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">trust-3a</p>
  </div>
</div>

**Loaded from:** Adobe Typekit — [`use.typekit.net/wgr3lwl.css`](https://use.typekit.net/wgr3lwl.css).
**Licence:** Adobe Fonts subscription — served via Typekit CDN.
**Weights in use:** as provided by the Typekit kit.

---

## Bugrino — brand display

A distinctive sans-serif used for brand moments, eyebrows, buttons, and badges. Available in Regular, Medium, and Bold weights with Bold Italic.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-tertiary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 700;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Bugrino</p>
  </div>
</div>

**Loaded from:** self-hosted in [`assets/fonts/bugrino/`](../assets/fonts/bugrino/).
**Licence:** commercial — self-host for By Default properties only.
**Weights in use:** 400, 500, 700, 700 italic.

---

## IBM Plex Mono — code and labels

IBM's open monospace from the Plex superfamily. Rounded, even, and unmistakably technical. Use it for code blocks, inline `code`, keyboard shortcuts, file paths, and any small label that needs to read as "machine output" rather than running prose.

<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-quaternary);">
      <p style="font-size: var(--font-10xl); margin: 0; line-height: 1; font-weight: 500;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">IBM Plex Mono</p>
  </div>
</div>

**Loaded from:** self-hosted in [`assets/fonts/ibm-plex-mono/`](../assets/fonts/ibm-plex-mono/).
**Licence:** SIL Open Font Licence 1.1.
**Weights in use:** 400, 500, 600.

---

## When to reach for which

| Context | Family | Token |
| --- | --- | --- |
| Body copy, paragraphs, lists | Zalando Sans | `var(--font-primary)` |
| Buttons, form fields, navigation | Zalando Sans | `var(--font-primary)` |
| Page headings (`h1`–`h6`) | trust-3a | `var(--font-secondary)` |
| Hero statements, pull quotes | trust-3a | `var(--font-secondary)` |
| Brand display, eyebrows, badges | Bugrino | `var(--font-tertiary)` |
| Code blocks, file paths, kbd | IBM Plex Mono | `var(--font-quaternary)` |

---

## Pairing rules

**Do**

- Use trust-3a for the headline and Zalando Sans for everything underneath. That's the default rhythm.
- Lean on weight, not colour, to create hierarchy inside Zalando Sans body copy.
- Use Bugrino for brand moments — eyebrows, display text, buttons — where the type needs personality.
- Use Plex Mono for anything that should feel literally "as written" — file names, terminal output, raw values.

**Don't**

- Don't set body copy in trust-3a. It's a display font — at small sizes the texture gets noisy.
- Don't pair trust-3a with another serif or display font. It's the only display face in the system.
- Don't use Plex Mono for decorative text. It carries a strong "code" connotation; it shouldn't be doing aesthetic duty.
- Don't use Bugrino for body copy or long reads — it's a brand accent, not a workhorse.

---

## See also

- [Typography](../design-system/typography.html) — full token reference (sizes, weights, line heights, letter spacing)
- [Tokens](../design-system/tokens.html) — every CSS variable with raw values
