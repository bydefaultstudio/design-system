---
title: "Color"
subtitle: "Palette, scales, and semantic colour mappings"
description: "Visual reference for all color tokens — brand palette, primitive scales, and semantic mappings."
author: "Studio"
section: "Design System"
layer: "foundation"
subsection: ""
order: 3
status: "published"
access: "team"
client: "internal"
---

Color tokens define the shared, reusable color values that power both design and code. This page shows what each color looks like. For the full token list with values, see the [Tokens](tokens.html) page.

Colors are organised into two layers: **primitive tokens** (raw values) and **semantic tokens** (intent-based aliases). Always use semantic tokens in production code — primitives are the building blocks that semantic tokens reference.

---

## Brand Palette

The core brand colors that define the project identity. These are set per-project in the Brand Tokens section of `design-system.css`.

<div class="color-list border border-faded">
  <div class="color-row" style="background-color: var(--off-white);" data-token="--off-white"><span class="color-row-name">off-white</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--warm-white);" data-token="--warm-white"><span class="color-row-name">warm-white</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--warm-black);" data-token="--warm-black"><span class="color-row-name">warm-black</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--off-black);" data-token="--off-black"><span class="color-row-name">off-black</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Accent Colors

<div class="grid cols-2 gap-m">
  <div class="color-list border border-faded">
    <div class="color-row" style="background-color: var(--red-lighter);" data-token="--red-lighter"><span class="color-row-name">red-lighter</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row" style="background-color: var(--red-light);" data-token="--red-light"><span class="color-row-name">red-light</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--red);" data-token="--red"><span class="color-row-name">red</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--red-dark);" data-token="--red-dark"><span class="color-row-name">red-dark</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  </div>
  <div class="color-list border border-faded">
    <div class="color-row" style="background-color: var(--blue-lighter);" data-token="--blue-lighter"><span class="color-row-name">blue-lighter</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row" style="background-color: var(--blue-light);" data-token="--blue-light"><span class="color-row-name">blue-light</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--blue);" data-token="--blue"><span class="color-row-name">blue</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--blue-dark);" data-token="--blue-dark"><span class="color-row-name">blue-dark</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  </div>
  <div class="color-list border border-faded">
    <div class="color-row" style="background-color: var(--yellow-lighter);" data-token="--yellow-lighter"><span class="color-row-name">yellow-lighter</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row" style="background-color: var(--yellow-light);" data-token="--yellow-light"><span class="color-row-name">yellow-light</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--yellow);" data-token="--yellow"><span class="color-row-name">yellow</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--yellow-dark);" data-token="--yellow-dark"><span class="color-row-name">yellow-dark</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  </div>
  <div class="color-list border border-faded">
    <div class="color-row" style="background-color: var(--green-lighter);" data-token="--green-lighter"><span class="color-row-name">green-lighter</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row" style="background-color: var(--green-light);" data-token="--green-light"><span class="color-row-name">green-light</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--green);" data-token="--green"><span class="color-row-name">green</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--green-dark);" data-token="--green-dark"><span class="color-row-name">green-dark</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  </div>
  <div class="color-list border border-faded">
    <div class="color-row" style="background-color: var(--purple-lighter);" data-token="--purple-lighter"><span class="color-row-name">purple-lighter</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row" style="background-color: var(--purple-light);" data-token="--purple-light"><span class="color-row-name">purple-light</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--purple);" data-token="--purple"><span class="color-row-name">purple</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
    <div class="color-row is-text-light" style="background-color: var(--purple-dark);" data-token="--purple-dark"><span class="color-row-name">purple-dark</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  </div>
</div>

---

## Primitive Scales

### Neutral

Warm grey ramp from lightest to near-black, used for backgrounds, borders, and secondary text.

<div class="color-list border border-faded">
  <div class="color-row" style="background-color: var(--neutral-50);" data-token="--neutral-50"><span class="color-row-name">neutral-50</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-100);" data-token="--neutral-100"><span class="color-row-name">neutral-100</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-150);" data-token="--neutral-150"><span class="color-row-name">neutral-150</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-200);" data-token="--neutral-200"><span class="color-row-name">neutral-200</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-300);" data-token="--neutral-300"><span class="color-row-name">neutral-300</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-400);" data-token="--neutral-400"><span class="color-row-name">neutral-400</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--neutral-500);" data-token="--neutral-500"><span class="color-row-name">neutral-500</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-600);" data-token="--neutral-600"><span class="color-row-name">neutral-600</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-700);" data-token="--neutral-700"><span class="color-row-name">neutral-700</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-800);" data-token="--neutral-800"><span class="color-row-name">neutral-800</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-900);" data-token="--neutral-900"><span class="color-row-name">neutral-900</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-950);" data-token="--neutral-950"><span class="color-row-name">neutral-950</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--neutral-990);" data-token="--neutral-990"><span class="color-row-name">neutral-990</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Black Alpha

Semi-transparent black values for overlays, shadows, borders, and tints.

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--black);" data-token="--black"><span class="color-row-name">black</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-95);" data-token="--black-alpha-95"><span class="color-row-name">black-alpha-95</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-90);" data-token="--black-alpha-90"><span class="color-row-name">black-alpha-90</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-80);" data-token="--black-alpha-80"><span class="color-row-name">black-alpha-80</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-70);" data-token="--black-alpha-70"><span class="color-row-name">black-alpha-70</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-60);" data-token="--black-alpha-60"><span class="color-row-name">black-alpha-60</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--black-alpha-50);" data-token="--black-alpha-50"><span class="color-row-name">black-alpha-50</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-40);" data-token="--black-alpha-40"><span class="color-row-name">black-alpha-40</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-30);" data-token="--black-alpha-30"><span class="color-row-name">black-alpha-30</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-20);" data-token="--black-alpha-20"><span class="color-row-name">black-alpha-20</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-15);" data-token="--black-alpha-15"><span class="color-row-name">black-alpha-15</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-10);" data-token="--black-alpha-10"><span class="color-row-name">black-alpha-10</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-5);" data-token="--black-alpha-5"><span class="color-row-name">black-alpha-5</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--black-alpha-3);" data-token="--black-alpha-3"><span class="color-row-name">black-alpha-3</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### White Alpha

Semi-transparent white values for highlights and light overlays. Shown on a dark background for visibility.

<div class="color-list border border-faded" style="background: var(--neutral-800);">
  <div class="color-row is-text-light" style="background-color: var(--white);" data-token="--white"><span class="color-row-name">white</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-95);" data-token="--white-alpha-95"><span class="color-row-name">white-alpha-95</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-90);" data-token="--white-alpha-90"><span class="color-row-name">white-alpha-90</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-80);" data-token="--white-alpha-80"><span class="color-row-name">white-alpha-80</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-70);" data-token="--white-alpha-70"><span class="color-row-name">white-alpha-70</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-60);" data-token="--white-alpha-60"><span class="color-row-name">white-alpha-60</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-50);" data-token="--white-alpha-50"><span class="color-row-name">white-alpha-50</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-40);" data-token="--white-alpha-40"><span class="color-row-name">white-alpha-40</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-30);" data-token="--white-alpha-30"><span class="color-row-name">white-alpha-30</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-20);" data-token="--white-alpha-20"><span class="color-row-name">white-alpha-20</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-15);" data-token="--white-alpha-15"><span class="color-row-name">white-alpha-15</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-10);" data-token="--white-alpha-10"><span class="color-row-name">white-alpha-10</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--white-alpha-5);" data-token="--white-alpha-5"><span class="color-row-name">white-alpha-5</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

---

## Semantic Colors

Semantic colors map primitive tokens to **meaning and intent**. Use these in layouts and components — never use primitives directly.

### Text

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--text-primary);" data-token="--text-primary"><span class="color-row-name">text-primary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--text-secondary);" data-token="--text-secondary"><span class="color-row-name">text-secondary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--text-plain);" data-token="--text-plain"><span class="color-row-name">text-plain</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--text-faded);" data-token="--text-faded"><span class="color-row-name">text-faded</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--text-accent);" data-token="--text-accent"><span class="color-row-name">text-accent</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--text-link);" data-token="--text-link"><span class="color-row-name">text-link</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--text-inverted);" data-token="--text-inverted"><span class="color-row-name">text-inverted</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Background

<div class="color-list border border-faded">
  <div class="color-row" style="background-color: var(--background-primary);" data-token="--background-primary"><span class="color-row-name">background-primary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--background-secondary);" data-token="--background-secondary"><span class="color-row-name">background-secondary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--background-plain);" data-token="--background-plain"><span class="color-row-name">background-plain</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--background-faded);" data-token="--background-faded"><span class="color-row-name">background-faded</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--background-darker);" data-token="--background-darker"><span class="color-row-name">background-darker</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Solid colour backgrounds

Solid colour blocks for hero sections, callouts, ad units, and any marketing surface that needs to lean on a brand colour. Each token resolves to the brand primitive when overridden in a client theme — otherwise the design system default applies.

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--background-accent);" data-token="--background-accent"><span class="color-row-name">background-accent</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--background-black);" data-token="--background-black"><span class="color-row-name">background-black</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--background-white);" data-token="--background-white"><span class="color-row-name">background-white</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--background-blue);" data-token="--background-blue"><span class="color-row-name">background-blue</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--background-red);" data-token="--background-red"><span class="color-row-name">background-red</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--background-green);" data-token="--background-green"><span class="color-row-name">background-green</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Border

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--border-primary);" data-token="--border-primary"><span class="color-row-name">border-primary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--border-secondary);" data-token="--border-secondary"><span class="color-row-name">border-secondary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--border-faded);" data-token="--border-faded"><span class="color-row-name">border-faded</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Button

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--button-primary);" data-token="--button-primary"><span class="color-row-name">button-primary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row" style="background-color: var(--button-text);" data-token="--button-text"><span class="color-row-name">button-text</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--button-secondary);" data-token="--button-secondary"><span class="color-row-name">button-secondary</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-dark" style="background-color: var(--button-faded);" data-token="--button-faded"><span class="color-row-name">button-faded</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

### Status

Status tokens now reference the dark shade of each accent colour family. `var(--status-info)` maps to `var(--blue-dark)` (previously `var(--green)`), aligning with the conventional use of blue for informational states. In dark mode, status tokens flip to the light shades for readability.

<div class="color-list border border-faded">
  <div class="color-row is-text-light" style="background-color: var(--status-info);" data-token="--status-info"><span class="color-row-name">status-info</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--status-success);" data-token="--status-success"><span class="color-row-name">status-success</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--status-warning);" data-token="--status-warning"><span class="color-row-name">status-warning</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--status-danger);" data-token="--status-danger"><span class="color-row-name">status-danger</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
  <div class="color-row is-text-light" style="background-color: var(--status-accent);" data-token="--status-accent"><span class="color-row-name">status-accent</span><span class="color-row-actions"><button class="color-copy-btn" data-format="hex" aria-label="Copy hex value">Hex</button><button class="color-copy-btn" data-format="css" aria-label="Copy CSS variable">CSS</button></span></div>
</div>

---

## Dark Mode

The design system uses a `data-theme` attribute to switch between light and dark modes. **Light mode is the default** — dark mode is an opt-in override, not a baseline. Activate it by setting `data-theme="dark"` on any element; tokens inherit through the cascade.

Dark mode values (e.g. `#1a1a1a`, `#e8e6e3`) are **overrides applied via `[data-theme="dark"]`** — never use them as primary values, and never hardcode them. If you're working from a dark-looking screenshot, confirm the intended theme before writing code.

### How It Works

- **`:root`** — light mode tokens (always present)
- **`[data-theme="dark"]`** — overrides semantic tokens with dark values
- **`@media (prefers-color-scheme: dark)`** — no-JS fallback for users with a dark OS preference

The toggle button in the site header sets `data-theme="dark"` on `<html>` and persists the choice in `localStorage`.

### Scoped Usage

You can apply dark mode to any element, not just the page:

<div class="demo-preview is-joined">
  <div class="grid">
    <div style="background: var(--background-faded); color: var(--text-primary); padding: var(--space-xl); border: var(--border-s) solid var(--border-secondary); font-size: var(--font-xl);">
      <div class="block gap-xs">
        <h4>Light mode</h4>
        <span>Primary text</span>
        <span style="color: var(--text-faded);">Faded text</span>
        <span style="color: var(--text-accent);">Accent text</span>
      </div>
    </div>
    <div data-theme="dark" style="background: var(--background-primary); color: var(--text-primary); padding: var(--space-xl); border: var(--border-s) solid var(--border-secondary);">
      <div class="block gap-xs">
        <h4>Dark mode</h4>
        <p>Primary text</p>
        <p style="color: var(--text-faded);">Faded text</p>
        <p style="color: var(--text-accent);">Accent text</p>
      </div>
    </div>
  </div>
</div>

```html
<!-- Dark card on a light page -->
<div data-theme="dark" class="card">
  <p>This section uses dark mode tokens</p>
</div>
```

All semantic tokens inside that element resolve to their dark values via CSS custom property inheritance.

### Customizing Dark Mode

Edit the `[data-theme="dark"]` block in `design-system.css` (section 2b). When changing a value, also update the `@media (prefers-color-scheme: dark)` fallback (section 2c) to keep them in sync.
