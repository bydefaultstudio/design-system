---
title: "Asset Card"
subtitle: "A consistent wrapper for presenting brand assets — logos, fonts, icons, images"
description: "How to use the asset card component to present brand assets in a consistent format across the brand book and showcase pages."
author: "Studio"
section: "Design System"
layer: "docs-site"
subsection: "Content"
order: 2
status: "published"
access: "team"
client: "internal"
---

The asset card is a uniform wrapper used by the [Brand Book](../client-template/brand-book.html) and any showcase page to present a single brand asset with context. The wrapper, preview frame, and footer stay consistent — only the content inside the preview slot changes:

- A **logo** SVG
- A **font** specimen (`Aa` + alphabet)
- A brand **icon**
- A brand **image** (mood shot, hero photo)
- A token preview

It composes three parts: a preview area, an optional footer with a title and actions, and light/dark variants for testing assets against either surface. Deliberately simple — no JavaScript — so any future showcase page can reuse it without ceremony.

---

## Anatomy

```
.asset-card
  .asset-card-preview          ← centred visual area, auto min-height
    [content — logo, font, icon, image, etc.]
  .asset-card-footer           ← optional title/action row
    .asset-card-title          ← name of the asset
    .asset-card-actions        ← copy / download buttons
```

| Element | Class | Purpose |
|---|---|---|
| Wrapper | `.asset-card` | Border, vertical layout |
| Preview area | `.asset-card-preview` | Centred content area, fills remaining space |
| Light preview | `.asset-card-preview--light` | Faded background, default text colour |
| Dark preview | `.asset-card-preview--dark` | Near-black background, light text |
| Footer | `.asset-card-footer` | Bottom row, title on the left, actions on the right |
| Footer title | `.asset-card-title` | Asset name in the brand serif |
| Footer actions | `.asset-card-actions` | Action button group (compact icon-only buttons) |
| Logo preview slot | `.asset-card-preview.logo-preview` | Constrains the rendered logo width (single source of truth in CSS) |

---

## Logo asset

Add the `.logo-preview` modifier to the preview slot whenever the content is a logo `<img>`. It constrains the rendered logo width from a single CSS rule (`max-width: 240px`), so resizing every logo card across the site is a one-line change in `design-system.css`. No inline `style` on the `<img>` is needed.

```html
<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light logo-preview">
    <img src="assets/images/logos/bydefault/logo_bydefault-primary.svg" alt="By Default primary logotype">
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Light</p>
  </div>
</div>
```

A logo card with a light preview and copy/download actions in the footer.

<div class="demo-preview">
  <div class="asset-card">
    <div class="asset-card-preview asset-card-preview--light">
      <div class="svg-logo" data-icon="logo" style="max-width: 200px;">{{icon:logo}}</div>
    </div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Light</p>
    </div>
  </div>
</div>

```html
<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light">
    <div class="svg-logo" data-icon="logo">…</div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Light</p>
  </div>
</div>
```

---

## Light + dark pair

Use a 2-column grid to show light and dark variants of the same asset side by side.

```html
<div class="grid cols-2 gap-l">
  <div class="asset-card">
    <div class="asset-card-preview asset-card-preview--light">…</div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Light</p>
    </div>
  </div>
  <div class="asset-card">
    <div class="asset-card-preview asset-card-preview--dark">…</div>
    <div class="asset-card-footer">
      <p class="asset-card-title">Dark</p>
    </div>
  </div>
</div>
```

---

## Font asset

The same wrapper works for type specimens — drop the alphabet and numbers into the preview slot.

```html
<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
    <div style="font-family: var(--font-primary);">
      <p style="font-size: var(--font-9xl); margin: 0; line-height: 1;">Aa</p>
      <p style="font-size: var(--font-s); margin: var(--space-l) 0 0;">ABCDEFGHIJKLM<br>abcdefghijklm<br>0123456789</p>
    </div>
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Inclusive Sans</p>
  </div>
</div>
```

---

## Icon asset

A brand icon in the preview slot, with the icon name in the footer.

```html
<div class="asset-card">
  <div class="asset-card-preview asset-card-preview--light">
    {{icon:home}}
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">home</p>
  </div>
</div>
```

---

## Image asset

A brand image (mood shot, hero photo) in the preview slot. Use `object-fit: cover` and remove the preview padding so the image fills the frame.

```html
<div class="asset-card">
  <div class="asset-card-preview" style="padding: 0;">
    <img src="assets/images/mood/brand-hero.jpg" alt="Brand mood shot" style="width: 100%; height: 100%; object-fit: cover;">
  </div>
  <div class="asset-card-footer">
    <p class="asset-card-title">Hero — desert sunrise</p>
  </div>
</div>
```

---

## Actions

Add copy/download buttons inside `.asset-card-actions` using the standard `.copy-btn` pattern. Buttons are compact icon-only by default.

```html
<div class="asset-card-footer">
  <p class="asset-card-title">logo_brand-primary-light.svg</p>
  <div class="asset-card-actions">
    <button class="button is-small copy-btn is-icon-only" data-copy="…" data-tooltip="Copy SVG" aria-label="Copy SVG">
      <span class="copy-btn-default">{{icon:copy}}</span>
      <span class="copy-btn-copied">{{icon:check}}</span>
    </button>
    <a class="button is-small" href="assets/logos/logo_brand-primary-light.svg" download data-tooltip="Download" aria-label="Download SVG">
      {{icon:download}}
    </a>
  </div>
</div>
```

See [Copy Button](copy-button.html) for the full pattern.

---

## Do / Don't

**Do:**
- Use the asset card for single-asset previews — one logo, one font specimen, one icon, one image
- Pair light + dark variants in a 2-column grid for assets that need both
- Keep the footer compact — a title and one or two action buttons is enough
- Use the standard `.copy-btn` and `<a download>` patterns for actions

**Don't:**
- Don't put long-form content inside an asset card — it's a wrapper for a single asset, not an editorial block
- Don't override the preview min-height per-card — keep cards uniform across a grid
- Don't add `border-radius` to the wrapper — square edges are project-wide
- Don't add a third visual variant — use composition (nested grids) if you need more variety
