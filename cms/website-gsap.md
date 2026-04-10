---
title: "GSAP"
subtitle: "GreenSock Animation Platform — setup, plugins, and best practices"
description: "Quick reference for GSAP setup across projects including required scripts, plugin registration, and performance best practices."
author: "Studio"
section: "Website"
layer: "app"
subsection: "Libraries"
order: 1
---

# GSAP

Quick reference for setting up and using GSAP across projects.

## Install

Since GSAP v3.13+, all plugins (including premium ones like ScrollSmoother and SplitText) are available directly from public npm. No private registry or auth token needed.

```bash
npm install gsap
```

### Plugin Registration

Import and register all plugins before use:

```javascript
import { gsap } from "gsap";

import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Draggable, ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);
```

### Plugins

| Plugin | Type | Purpose |
|--------|------|---------|
| `ScrollTrigger` | Free | Scroll-based animation triggers and pinning |
| `ScrollToPlugin` | Free | Smooth animated scrolling to targets |
| `Draggable` | Free | Drag and drop interactions |
| `ScrollSmoother` | Premium | Smooth scroll effect for non-touch devices |
| `SplitText` | Premium | Split text into characters, words, or lines for animation |

## Best Practices

### Always Check Elements Exist

```javascript
const el = document.querySelector('.target');
if (!el) return;
```

### Respect Reduced Motion

```javascript
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(element, { opacity: 1 });
  return;
}
```

### Use GPU Acceleration for 3D

```javascript
gsap.to(el, {
  scale: 0.8,
  rotationZ: 15,
  force3D: true
});
```

### Debounce ScrollTrigger Refresh

Call `ScrollTrigger.refresh()` after DOM changes, but debounce it (150ms minimum).

### Prevent Duplicate Animations

Mark elements after processing to avoid re-binding:

```javascript
if (el.dataset.bound) return;
// ... animate ...
el.dataset.bound = "1";
```

### Cache SplitText Instances

Don't re-split on every animation — cache and revert on resize:

```javascript
const cache = new Map();
const split = cache.get(el) || new SplitText(el, { type: "words" });
cache.set(el, split);

// On resize:
split.revert();
```

### ScrollSmoother — Non-Touch Only

```javascript
if (!("ontouchstart" in window)) {
  ScrollSmoother.create({ smooth: 1, effects: true });
}
```

### Easing

Use `power2.out` as the default. Reserve `power3.out` or `power4.out` for snappy/aggressive effects.

## Performance

- Limit scrub animations to 3–4 per page
- Avoid SplitText on large text blocks
- Wait for fonts before splitting text (`document.fonts.ready`)
- Use `markers: true` during development, remove in production
