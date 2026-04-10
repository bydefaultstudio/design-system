---
title: "Homepage"
subtitle: "Complete guide to homepage-specific features including video interactions, logo animations, and slider components"
description: "Documentation for homepage JavaScript functionality including video hover effects, mobile autoplay, logo scroll animations, testimonial sliders, and sticky service cards."
section: "Website"
layer: "app"
subsection: "Pages"
order: 1
---

# Homepage

**Version 1.9.4** - Homepage-specific JavaScript features for ByDefault website

This guide covers all homepage-specific functionality including video interactions, logo animations, sliders, and sticky card animations.

## Overview

The homepage module (`homepage.js`) provides comprehensive functionality for the homepage including:

- Video hover and autoplay interactions
- Brand logo scroll animations
- Logo ticker/slider
- Testimonial slider with text animations
- Blog post slider
- Sticky service cards with 3D transforms

---

## Video Interactions

### Desktop Video Hover

Videos play on hover when user moves mouse over work post items (desktop only).

**HTML Structure:**
```html
<div class="work_post-wrapper">
  <video class="vdo_thumb" src="video.mp4"></video>
  <!-- Other content -->
</div>
```

**Behavior:**
- **Desktop only** (992px+) - Skipped on touch devices
- Video plays from start on mouse enter
- Video pauses and resets on mouse leave
- Videos are muted, no controls, no autoplay

**Configuration:**
- `muted: true`
- `autoplay: false`
- `loop: false`
- `controls: false`

### Mobile Video Autoplay

Videos automatically play when they enter the viewport on mobile/touch devices.

**How it works:**
1. Waits for user interaction (scroll, touch, click)
2. Uses IntersectionObserver to detect when video is 50% visible
3. Plays video when in viewport
4. Pauses and resets when out of viewport

**Requirements:**
- Touch device detection
- User interaction required (browser autoplay policy)
- 50% viewport threshold

**Configuration:**
- `muted: true` (required for autoplay)
- `threshold: 0.5` (50% visible)
- Resets to first frame when out of view

---

## Brand Logo Scroll Animation

Brand logos within work posts get a scrolling class during page scroll.

**HTML Structure:**
```html
<div class="work_post-wrapper">
  <div class="thumb-brand-logo">
    <!-- Logo content -->
  </div>
</div>
```

**Behavior:**
- Adds `.scrolling` class to all brand logos during scroll
- Removes class 500ms after scrolling stops
- Debounced to prevent excessive class toggling

**CSS Integration:**
```css
.thumb-brand-logo {
  /* Default state */
  transition: opacity 0.3s;
}

.thumb-brand-logo.scrolling {
  /* Scrolling state */
  opacity: 0.6;
}
```

---

## Sliders

### Logo Slider/Ticker

Continuous horizontal scrolling logo ticker using Splide.

**HTML Structure:**
```html
<div class="logo-slider">
  <div class="splide__track">
    <div class="splide__list">
      <!-- Logo items -->
    </div>
  </div>
</div>
```

**Configuration:**
- `type: "loop"` - Infinite loop
- `autoWidth: true` - Natural width per logo
- `drag: false` - Disable manual dragging
- `autoScroll` - Continuous scrolling
  - `speed: 0.3` (desktop)
  - `speed: 0.5` (mobile, 600px breakpoint)
- `gap: "1rem"` - Spacing between logos

**Responsive:**
- Desktop: Slower scroll (0.3)
- Mobile (600px): Faster scroll (0.5)

### Testimonial Slider

Testimonial carousel with autoplay, text animations, and custom arrows.

**HTML Structure:**
```html
<div class="testimonial-slider">
  <div class="splide__track">
    <div class="splide__list">
      <div class="splide__slide">
        <p class="testimonial-text">Testimonial content</p>
      </div>
    </div>
  </div>
</div>
```

**Configuration:**
- `autoWidth: true` - Natural width per slide
- `focus: "center"` - Center-focused navigation
- `perPage: 1` - One slide visible
- `gap: "2rem"` - Spacing between slides
- `drag: "free"` - Free dragging
- `snap: true` - Snap to slides
- `type: "loop"` - Infinite loop
- `autoplay: true` - Auto-advance
  - `interval: 9000` (9 seconds)
  - `pauseOnHover: false`
- `speed: 1500` - Transition duration
- Custom arrow SVG path
- Intersection detection - Pauses when out of view

**Breakpoints:**
- Desktop: `gap: "2rem"`
- Mobile (600px): `gap: "1.5rem"`

**Text Animation:**
- Uses SplitText to animate words
- Words fade in with stagger (0.2s)
- Baseline opacity: 0.3 (inactive)
- Active opacity: 1.0 (current slide)
- Smooth transitions between slides

**Custom Cursor:**
- Arrow buttons get `data-cursor` attributes
- `data-cursor="arrow-left"` for previous
- `data-cursor="arrow-right"` for next

### Blog Post Slider

Slider for displaying blog posts (3 columns desktop, responsive).

**HTML Structure:**
```html
<div class="blog-slider">
  <div class="splide__track">
    <div class="splide__list">
      <!-- Blog post cards -->
    </div>
  </div>
</div>
```

**Configuration:**
- `type: "slide"` - Slide transition
- `perPage: 3` - Three posts visible (desktop)
- `perMove: 1` - Slide one post at a time
- `gap: "2rem"` - Spacing between cards
- `arrows: false` - Hidden arrows
- `pagination: false` - Hidden pagination
- `rewind: true` - Loop to start
- `speed: 800` - Animation speed
- `easing: "ease-out"`

**Breakpoints:**
- 991px: `perPage: 2`, `perMove: 2`
- 600px: `perPage: 1`, `perMove: 1`

---

## Sticky Cards

### Service Cards (Sticky Animation)

Service cards that stick and transform as user scrolls (desktop, tablet).

**HTML Structure:**
```html
<div class="service-card-inner">
  <!-- Card content -->
</div>
```

**Behavior:**
- Cards pin when top reaches 100px from viewport
- Scale down from 1.0 to 0.0 as scroll progresses
- Random Z rotation (-20 to +20 degrees)
- X rotation (20 degree tilt forward)
- Last card doesn't animate (skipped)

**Requirements:**
- Desktop/tablet only (768px+)
- Respects `prefers-reduced-motion`
- `pinSpacing: false` for clean layout

**Animation:**
```javascript
scale: 1 - progress  // 1.0 to 0.0
rotationZ: randomRotationZ * progress  // Random rotation
rotationX: 20 * progress  // Forward tilt
```

### Scaling Cards (Alternative)

Alternative sticky card implementation with scaling only.

**HTML Structure:**
```html
<div class="service-card">
  <!-- Card content -->
</div>
```

**Behavior:**
- Similar to sticky cards but simpler
- Only scales down (no rotation)
- Pins at 100px from viewport top
- Last card skipped

---

## Function Reference

### `thumbVideoHover()`
Sets up video hover playback for desktop work posts. Desktop only (992px+).

### `brandLogoScroll()`
Adds scrolling class to brand logos during page scroll. Debounce: 500ms.

### `mobileVideoAutoplay()`
Enables viewport-based video autoplay on mobile/touch devices.

### `logoSlider()`
Initializes continuous scrolling logo ticker. Requires Splide + AutoScroll extension.

### `testimonialSlider()`
Initializes testimonial carousel with text animations. Requires Splide + Intersection extension + SplitText.

### `initTestimonialTextAnimation()`
Sets up text splitting and caching for testimonial animations.

### `animateTestimonialText(activeSlide)`
Animates text for active testimonial slide with word stagger.

### `blogPostSlider()`
Initializes blog post carousel slider. Requires Splide.

### `stickyCards()`
Sets up sticky service card animations with 3D transforms. Desktop/tablet (768px+). Requires GSAP + ScrollTrigger.

### `scalingCards()`
Sets up simple scaling card animations (currently commented out).

### `addCursorAttributesToArrows(splideElement)`
Adds custom cursor attributes to Splide arrow buttons.

---

## Dependencies

### Required Libraries

- **GSAP** - Animation library
- **ScrollTrigger** - Scroll-based animations
- **SplitText** - Text splitting for animations
- **Splide** - Slider library
- **Splide Extensions:**
  - AutoScroll (logo slider)
  - Intersection (testimonial slider)

### Loading Order

```html
<!-- GSAP -->
<script src="gsap.min.js"></script>
<script src="ScrollTrigger.min.js"></script>
<script src="SplitText.min.js"></script>

<!-- Splide -->
<script src="splide.min.js"></script>
<script src="splide-auto-scroll.min.js"></script>
<script src="splide-intersection.min.js"></script>

<!-- Homepage -->
<script src="js/homepage.js"></script>
```

---

## Performance Considerations

### Video Optimization
- Videos should be optimized for web delivery
- Use appropriate formats (MP4, WebM)
- Compress videos to reduce file size
- Consider lazy loading for videos below fold

### Animation Performance
- Sticky cards use `force3D: true` for GPU acceleration
- Testimonial text animations cached to prevent re-splitting
- ScrollTrigger refresh debounced to prevent excessive recalculations
- Reduced motion preferences respected

### Mobile Considerations
- Video autoplay requires user interaction
- Some effects disabled on mobile (hover effects)
- Touch events optimized for mobile devices

---

## Troubleshooting

### Videos Not Playing

**Desktop hover:**
- Check video elements have `.vdo_thumb` class
- Verify parent has `.work_post-wrapper` class
- Ensure desktop viewport (992px+)
- Check browser console for errors

**Mobile autoplay:**
- Verify touch device detection
- Ensure user has interacted with page
- Check IntersectionObserver support
- Verify video is 50% visible

### Sliders Not Working

**General:**
- Verify Splide library is loaded
- Check element selectors are correct
- Ensure DOM is ready before initialization
- Check browser console for errors

### Sticky Cards Not Animating
- Verify desktop viewport (768px+)
- Check `.service-card-inner` elements exist
- Ensure GSAP and ScrollTrigger loaded
- Check `prefers-reduced-motion` setting
- Verify ScrollTrigger refresh called

---

## Browser Support

- **Chrome** - Full support
- **Firefox** - Full support
- **Safari** - Full support (video autoplay may require user interaction)
- **Edge** - Full support

**Touch Device Support:**
- iOS Safari - Video autoplay restrictions apply
- Android Chrome - Full support
- Mobile browsers - Touch interactions optimized
