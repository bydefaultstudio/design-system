---
title: "Case Study"
subtitle: "Intelligent content pinning system for case study pages with responsive behavior"
description: "Documentation for the case study content pinning system that provides intelligent pinning behavior for content blocks with automatic height and viewport detection."
section: "Website"
subsection: "Pages"
order: 5
---

# Case Study

## Overview

The case study content pinning system provides intelligent pinning behavior for `.case-study_content-block` elements within `.case-study-content` containers. The system automatically detects content height and viewport dimensions to apply appropriate pinning logic.

## Key Features

- **Desktop Only**: Only activates on devices with `min-width: 992px`
- **Touch Device Detection**: Automatically skips on touch devices for better performance
- **Adaptive Pinning**: Automatically chooses between Short Mode and Long Mode based on content height
- **Fixed Header Support**: Respects fixed header offsets to prevent content overlap
- **Dynamic Re-measurement**: Automatically adjusts on resize and content changes
- **ScrollSmoother Integration**: Works seamlessly with existing ScrollSmoother setup

## HTML Structure

```html
<div class="case-study-content">
  <div class="case-study_content-block">
    <!-- Your case study content here -->
  </div>
</div>
```

## Pinning Modes

### Short Mode (CBH <= VH)

**When**: Content block height is less than or equal to viewport height

**Behavior**:
- Content block pins from the top of the viewport (accounting for fixed header)
- Remains fully visible while the page scrolls
- Unpins when the container section ends

**Use Case**: Short case study summaries, key metrics, or brief content blocks

### Long Mode (CBH > VH)

**When**: Content block height is greater than viewport height

**Behavior**:
- Content block pins to the viewport
- Page scroll drives internal content scrolling
- User can read through the entire content block while it appears fixed

**Use Case**: Long-form case studies, detailed analysis, or extensive content

## Configuration

### Fixed Header Support

The system automatically detects fixed headers using these selectors:
- `header[data-fixed]`
- `.header-fixed`
- `.fixed-header`
- `[data-header="fixed"]`

### Device Detection

**Desktop Breakpoint**: `min-width: 992px`

**Touch Device Detection**:
```javascript
"ontouchstart" in window ||
navigator.maxTouchPoints > 0 ||
navigator.msMaxTouchPoints > 0
```

## API

### Global Instance

```javascript
// Access the global instance
window.caseStudyPinning

// Refresh pinning manually
caseStudyPinning.refresh()

// Destroy the pinning system
caseStudyPinning.destroy()
```

### Class Usage

```javascript
// Create new instance
const pinning = new CaseStudyPinning()

// Refresh measurements
pinning.refresh()

// Cleanup
pinning.destroy()
```

## Integration with Existing Systems

### ScrollSmoother

The pinning system automatically integrates with ScrollSmoother:
- Refreshes ScrollSmoother effects after measurements
- Uses the same scroll context as ScrollSmoother
- Maintains smooth scrolling performance

### Case Study Toggle

When the case study content is toggled open/closed, the pinning system automatically refreshes to account for the new content dimensions.

## Performance Considerations

### Resize Handling

- **Debounced**: Re-measurement is debounced to 200ms to prevent excessive calculations
- **ResizeObserver**: Uses ResizeObserver for efficient change detection
- **RequestAnimationFrame**: Measurements are scheduled for optimal timing

### Memory Management

- **Cleanup**: Properly destroys ScrollTriggers and observers
- **Event Listeners**: Removes event listeners on destroy
- **Timeout Clearing**: Clears all timeouts to prevent memory leaks

## Debugging

### Console Logging

The system provides detailed console logging for debugging:

```javascript
// Device capabilities
console.log('Device capabilities:', {
  isDesktop: true,
  isTouchDevice: false
})

// Measurement data
console.log('Measurement for block 0:', {
  VH: 1080,        // Viewport height
  CBH: 600,        // Content block height
  CTH: 1200,       // Container height
  H: 80,           // Fixed header offset
  mode: 'Short'    // Pinning mode
})

// Pinning configuration
console.log('Short mode pinning for block 0:', {
  pinStart: '80px',
  pinEnd: '+=600px',
  scrollDistance: 600
})
```

### Test Page

Use `/case-study-test.html` to test the functionality:
- Contains both short and long content blocks
- Shows debug information in the bottom-left corner
- Demonstrates fixed header offset handling
- Includes toggle button functionality

## Browser Support

- **Modern Browsers**: Full support in all modern browsers
- **ResizeObserver**: Uses ResizeObserver API (polyfill available if needed)
- **GSAP**: Requires GSAP 3.12+ with ScrollTrigger and ScrollSmoother plugins

## Troubleshooting

### Pinning Not Working

1. **Check Device**: Ensure you're on desktop (992px+) and not a touch device
2. **Verify HTML Structure**: Ensure `.case-study_content-block` is inside `.case-study-content`
3. **Console Errors**: Check browser console for measurement errors
4. **ScrollTrigger**: Ensure ScrollTrigger is properly loaded

### Performance Issues

1. **Too Many Blocks**: Consider limiting the number of pinned blocks
2. **Resize Frequency**: Adjust debounce timeout if needed
3. **Complex Content**: Avoid complex animations within pinned content

### Content Not Pinning Correctly

1. **Container Height**: Ensure container has sufficient height for pinning
2. **Fixed Header**: Verify fixed header detection is working
3. **Measurement Timing**: Content may need time to load before measurement
