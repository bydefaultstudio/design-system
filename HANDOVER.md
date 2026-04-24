# Session Handover — Studio Transitions & Animation Fixes

## What was done this session

### 1. Case study → case study transition fix
Case study slider clicks now use **push-up** transition (same as article next-read) instead of conveyor-up. The conveyor had a white flash caused by a timing desync — `leave()` chained through async GSAP cleanup before starting WAAPI, while `enter()` started immediately.

### 2. GSAP cleanup deferred to after hook
`bdAnimationsCleanup()` (which calls `ctx.revert()`) moved from `leave()` to the `after` hook's rAF. Previously it ran before the WAAPI animation, snapping `data-bd-animate` elements back to `opacity: 0` while the leaving page was still visible (e.g. `.case-study-visuals` disappearing mid-push).

### 3. Logo ticker global loading
`studio-logos.js` added to all pages (was only on `about.html`). Via Barba, scripts from the new page don't re-execute — so `buildLogoSlides` was `undefined` when navigating to about from any other entry page. Also removed duplicate `logoSlider()` call from `studio:after-nav` to prevent double-init race with async CDN script loading.

### 4. Case study CSS transition scoped
`.case-study-visuals` had `transition: 800ms cubic-bezier(...)` (all properties). This fought GSAP's opacity animation on `data-bd-animate="fade"`. Scoped to `transition-property: width` only (needed for info panel toggle).

### 5. Header image restructure (about + services)
Moved hero images out of `-header` sections into new `-hero` sections with mask divs:
- `about-header` → text only. New `about-hero` section with `.about-hero-thumbnail` mask div
- `services-header` → text only. New `services-hero` section with `.services-hero-thumbnail` mask div
- Headers now match the pattern: `case-study-header`, `article-header` = text/info only

### 6. Above-fold animations changed to slide-up
All above-fold `data-bd-animate="fade"` changed to `slide-up` (fade + 50px translateY):
- `section.home-hero` (index.html)
- `.about-hero-thumbnail` (about.html)
- `.services-hero-thumbnail` (services.html)
- `section.article-hero` (article template)

## Updated architecture

```
Barba leave → bdAnimateElementsOut (data-bd-leave, skip for push/swap) → WAAPI transition
Barba after → rAF → bdAnimationsCleanup (ctx.revert) → bdAnimationsInit (new context) → bdAnimateElementsIn (data-bd-enter) → ScrollTrigger.refresh
```

## Key files modified

| File | What |
|---|---|
| `studio/assets/js/studio-barba.js` | Case study slider clicks trigger push, GSAP cleanup deferred to after hook rAF |
| `studio/assets/js/studio.js` | Removed duplicate logoSlider from studio:after-nav |
| `studio/assets/css/studio.css` | Scoped case-study-visuals transition to width, added hero thumbnail mask styles, removed .about-header img |
| `studio/about.html` | Hero image moved to new about-hero section with mask div |
| `studio/services.html` | Hero image moved to new services-hero section with mask div |
| `studio/index.html` | Home hero fade → slide-up, added studio-logos.js script |
| `studio/cms/generator/templates/article-inner.html` | Article hero fade → slide-up |
| `studio/cms/generator/templates/layout.html` | Added studio-logos.js to L2 shared scripts |
| All L0/L1 pages | Added studio-logos.js script tag |
| All L2 pages | Rebuilt via generator |

## Uncommitted changes

The following changes are staged but **not yet committed**:
- Case study CSS transition scoping (width only)
- About + services header restructure (image → own section with mask)
- Above-fold fade → slide-up on all pages
- Article template + L2 rebuild

## Outstanding items

1. **`data-bd-enter` / `data-bd-leave` available but unused** — above-fold entrance animations removed to avoid push/close transition conflicts. Functions remain in bd-animations.js for future use.

2. **`data-pin` and `data-refresh`** — built into bd-animations.js but not used on any elements yet.

3. **Above-fold animation timing** — `data-bd-animate` elements above the fold wait for ScrollTrigger's batch cycle (rAF + internal scheduling) before revealing. Could add a viewport check to `createScrollAnimation()` to animate immediately when already in view. Not yet implemented — deferred for now.

## Commits

- `2329973` — fix case study transitions, defer gsap cleanup, load logo ticker globally
- `96685f3` — add gsap scroll animations to studio, wire into barba lifecycle

## Data attribute reference

```html
<!-- Scroll reveals -->
<div data-bd-animate="fade">              <!-- fade in -->
<div data-bd-animate="slide">             <!-- fade + slide up 40px -->
<div data-bd-animate="slide-up">          <!-- slide up 50px -->
<div data-bd-animate="blur-in">           <!-- blur 10px → clear -->
<div data-bd-animate="scale-in">          <!-- scale 0.8 → 1 -->
<div data-bd-scrub>                       <!-- scroll-linked -->
<div data-bd-delay="0.2">                 <!-- delay in seconds -->

<!-- Text splits (scroll-linked) -->
<h1 data-text-animate="chars">            <!-- character by character -->
<h2 data-text-animate="words">            <!-- word by word -->
<p data-text-animate="lines">             <!-- line by line -->

<!-- Pinning (desktop only, 992px+) -->
<div data-pin="80">                       <!-- pin 80px from top -->

<!-- Dynamic content refresh -->
<div data-refresh>                        <!-- watch for height changes -->
```
