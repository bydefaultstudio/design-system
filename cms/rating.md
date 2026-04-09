---
title: "Rating"
subtitle: "Interactive and read-only star ratings"
description: "How to use the rating component for star-based ratings and reviews."
section: "Design System"
subsection: "Feedback"
order: 4
status: "published"
access: "team"
client: "internal"
---

Ratings display a star-based score. They can be interactive (click to rate) or read-only (display only). The component supports size variants and fires a `rating-change` custom event.

---

## Tokens

| Token | Default (Light) | Default (Dark) | Purpose |
|-------|-----------------|----------------|---------|
| `--rating-color` | `var(--yellow)` | — | Filled star colour |
| `--rating-color-empty` | `var(--neutral-300)` | `var(--neutral-700)` | Empty star colour |
| `--rating-size` | `1.5rem` | — | Star size |

---

## Interactive rating

<div class="demo-preview">
  <div class="rating" data-value="0" aria-label="Rate this item">
    <button class="rating-star" aria-label="1 star" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="2 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="3 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="4 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="5 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
  </div>
</div>

```html
<div class="rating" data-value="0" aria-label="Rate this item">
  <button class="rating-star" aria-label="1 star" type="button"><!-- star SVG --></button>
  <button class="rating-star" aria-label="2 stars" type="button"><!-- star SVG --></button>
  <button class="rating-star" aria-label="3 stars" type="button"><!-- star SVG --></button>
  <button class="rating-star" aria-label="4 stars" type="button"><!-- star SVG --></button>
  <button class="rating-star" aria-label="5 stars" type="button"><!-- star SVG --></button>
</div>
```

---

## Pre-filled rating

Set `data-value` to the initial score.

<div class="demo-preview">
  <div class="rating" data-value="3" aria-label="Rating: 3 out of 5">
    <button class="rating-star is-filled" aria-label="1 star" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star is-filled" aria-label="2 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star is-filled" aria-label="3 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="4 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
    <button class="rating-star" aria-label="5 stars" type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>
  </div>
</div>

---

## Read-only

Add `.is-readonly` to disable interaction.

<div class="demo-preview">
  <div class="rating is-readonly" data-value="4" aria-label="Rating: 4 out of 5">
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
  </div>
</div>

---

## Size variants

<div class="demo-preview" style="display: flex; align-items: center; gap: var(--space-xl);">
  <div class="rating rating--sm is-readonly" data-value="4" aria-label="Small rating">
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
  </div>
  <div class="rating rating--lg is-readonly" data-value="4" aria-label="Large rating">
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star is-filled"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
    <span class="rating-star"><svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
  </div>
</div>

```html
<div class="rating rating--sm">...</div>  <!-- 1rem stars -->
<div class="rating">...</div>             <!-- 1.5rem stars (default) -->
<div class="rating rating--lg">...</div>  <!-- 2rem stars -->
```

---

## JavaScript

Include `assets/js/rating.js` on any page using interactive ratings. The script auto-initialises all `.rating:not(.is-readonly)` elements.

The component fires a `rating-change` custom event on the `.rating` element when the value changes:

```js
document.querySelector('.rating').addEventListener('rating-change', function (e) {
  console.log('New rating:', e.detail.value);
});
```

---

## Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` | Focuses the rating group |
| `ArrowRight` | Increases rating by 1 |
| `ArrowLeft` | Decreases rating by 1 |
| `Enter` / `Space` | Selects the focused star |

---

## Accessibility notes

- Each star button needs `aria-label` (e.g. "1 star", "2 stars")
- The rating group needs `aria-label` describing the context
- Read-only ratings use `<span>` instead of `<button>` since they are not interactive

---

## Do / Don't

**Do:**
- Use ratings for user feedback and reviews
- Show the numeric value alongside the stars when space allows
- Use `.is-readonly` for display-only ratings

**Don't:**
- Don't use ratings for binary yes/no feedback — use a toggle or buttons
- Don't use more than 5 stars
