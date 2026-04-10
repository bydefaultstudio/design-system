---
title: "Color"
subtitle: "Brand palette and how to use it"
description: "The brand colour palette — neutrals, accents, and the rules that decide which one to reach for in any given context."
author: "Studio"
section: "Brand Book"
layer: "core"
subsection: "Visual Identity"
order: 2
status: "published"
access: "team"
client: "internal"
dropcap: true
---

The By Default palette is built around a **warm neutral spine** and **five accent hues**. The neutrals do almost all of the work — the accents punctuate. This is a brand that gets loud rarely, and on purpose.

This page is the **brand-side** view — what each colour is *for*, and how the palette behaves as a whole. For the developer-facing token reference (CSS variable names, hex values, semantic mappings), see [Color](../design-system/color.html).

---

## The neutral spine

Four neutrals carry the brand. Every page is one of these four behind the type, every time. Choosing between them is the whole game — warm vs cool, bright vs heavy.

<div class="grid cols-2 gap-l">
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--off-white); min-height: 160px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">off-white</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--warm-white); min-height: 160px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">warm-white</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--warm-black); min-height: 160px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">warm-black</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--off-black); min-height: 160px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">off-black</p>
    </div>
  </div>
</div>

**off-white** is the default page background in light mode. It's slightly cooler than `warm-white` and reads as "clean" rather than "warm".

**warm-white** is the editorial alternative — slightly creamier, a touch more print-feeling. Reach for it when a section needs to feel handmade rather than systemic.

**warm-black** is the default page background in dark mode and the default text colour in light mode. It's not pure black; it carries a touch of warmth so it doesn't read as cold or clinical.

**off-black** is the heavier alternative — closer to true black, used for emphasis blocks, full-bleed dark sections, and anywhere the brand wants to feel weightier.

---

## The accent hues

Five accents. Each one has a meaning the team should keep consistent — drift is what makes a system feel undisciplined.

<div class="grid cols-2 gap-l">
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--red); min-height: 120px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Red</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--blue); min-height: 120px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Blue</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--yellow); min-height: 120px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Yellow</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--green); min-height: 120px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Green</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview" style="background-color: var(--purple); min-height: 120px;"></div>
    <div class="asset-card-footer">
      <p class="asset-card-title">purple — creative, brand moments</p>
    </div>
  </div>
</div>

Each hue ships with a four-step ramp — `lighter`, `light`, base, and `dark` — for backgrounds, fills, and text. The ramps are documented in full on the [Color](../design-system/color.html) token page.

---

## How the palette breathes

The system is **neutral-first by a long way**. On any given page you should see one of the four neutrals filling the background, body copy in `warm-black` or `warm-white`, and at most one or two accents — used as a focused signal, not as decoration.

If a layout needs three accents to feel alive, the layout is the problem. Push harder on type, scale, and whitespace before reaching for another colour.

**Light mode** runs on `off-white` background with `warm-black` text. Accents sit at their base or `dark` step.
**Dark mode** runs on `warm-black` background with `off-white` text. Accents shift to their `light` or `lighter` step so they hold contrast against the dark surface.

---

## Do / Don't

**Do**

- Use semantic tokens (`--text-primary`, `--background-faded`, `--border-secondary`) in production code rather than primitives like `--neutral-700`.
- Pair accents with neutral surfaces. A red badge on an off-white card is correct. A red card on a yellow background is not.
- Match the accent to the meaning. Green is success. Red is error. Don't reuse them as decoration.

**Don't**

- Don't introduce new hues. The palette is closed by design. If a page seems to need a sixth colour, the page needs less colour, not more.
- Don't mix `warm-white` and `off-white` on the same screen. Pick a side.
- Don't apply accents to body copy. Accents are for marks, badges, links, and focused fills — not text blocks.

---

## See also

- [Color](../design-system/color.html) — full token reference, primitive scales, semantic mappings, alpha tokens
- [Tokens](../design-system/tokens.html) — every CSS variable with raw values
