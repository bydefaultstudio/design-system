---
title: "Hero"
subtitle: "Interactive portfolio showcase with key visual spawning system"
description: "Complete guide to the hero section system including key visual spawning, interactive elements, and responsive design for the ByDefault website portfolio showcase."
section: "Website"
layer: "app"
subsection: "Pages"
order: 2
---

# Hero

## Overview
The hero section is an interactive portfolio showcase that spawns key visuals when users click or tap. It's designed to create an engaging, gallery-like experience that showcases work through animated visual elements.

## File Structure
```
hero/
 hero.js              # Main JavaScript functionality
 hero.css             # Styling and responsive design
 hero-test.html       # Development test file
 hero-backup.js       # Backup version
 README.md            # This documentation
```

## Key Features

### Interactive Visual Spawning
- **Click/Tap to Spawn**: Users can click anywhere in the hero section to spawn key visuals
- **Consecutive Selection**: Visuals are selected in order from the collection
- **Responsive Sizing**: Different display widths based on aspect ratio and screen size
- **Smooth Animations**: GSAP-powered enter, dwell, and exit animations

### Multi-Asset Support
- **Images**: PNG, JPG, WebP, AVIF formats
- **Videos**: MP4 with poster images and autoplay
- **GIFs**: Treated as images for optimal performance

### Responsive Design
- **Mobile Detection**: Automatically adjusts settings for mobile vs desktop
- **Aspect Ratio Handling**: Proper container sizing with CSS `aspect-ratio`
- **Object Fit**: Images and videos use `object-fit: cover` for proper cropping

## HTML Structure

### Basic Hero Container
```html
<section id="key-visual-container">
  <div class="hero-content">
    <h1 class="hero-title">Click Anywhere</h1>
  </div>
</section>
```

### Webflow CMS Integration
```html
<!-- Hidden JSON feed for CMS data -->
<div id="kv-json-feed" style="display: none;">
  <script type="application/json" class="kv-json">
    {
      "type": "image",
      "src": "https://example.com/image.jpg",
      "poster": "https://example.com/poster.jpg",
      "alt": "Image description",
      "ratio": "16:9",
      "weight": 1,
      "drop": "season1",
      "order": 1
    }
  </script>
</div>
```

## JavaScript API

### Initialization
The hero section automatically initializes when the DOM is ready:
```javascript
// The KeyVisualCollection class initializes automatically
// No manual initialization needed
```

### Configuration
```javascript
// Responsive display widths (automatically calculated)
const widths = {
  '16:9': '45vw',  // Landscape
  '4:5': '30vw',   // Portrait
  '1:1': '35vw',   // Square
  '2:1': '90vw',   // Ultra-wide landscape
  '9:16': '30vw'   // Ultra-tall portrait
};

// Mobile widths (larger for better mobile experience)
const mobileWidths = {
  '16:9': '70vw',
  '4:5': '50vw',
  '1:1': '55vw',
  '2:1': '90vw',
  '9:16': '45vw'
};
```

### Animation Configuration
```javascript
// Desktop animation settings
const desktopConfig = {
  enterDuration: 0.8,
  dwellDuration: 3000,
  exitDuration: 1.2,
  driftDistance: [10, 10],
  driftXMultiplier: 0.1,
  scaleRange: [0.8, 1.2],
  rotationRange: [-15, 15]
};

// Mobile animation settings (optimized for touch)
const mobileConfig = {
  enterDuration: 0.6,
  dwellDuration: 3000,
  exitDuration: 1.0,
  driftDistance: [20, 30],
  driftXMultiplier: 0.2,
  scaleRange: [0.7, 1.1],
  rotationRange: [-10, 10]
};
```

## CSS Classes

### Container
- `#key-visual-container` - Main hero container (full viewport height)
- `#key-visual-overlay` - Fixed overlay for spawned visuals
- `.hero-content` - Content wrapper with centering

### Visual Elements
- `.key-visual` - Individual spawned visual container
- `.key-visual img` - Image elements with `object-fit: cover`
- `.key-visual video` - Video elements with `object-fit: cover`

### Content
- `.hero-title` - Main headline (responsive typography)

## Aspect Ratio System

### Supported Ratios
- **16:9** - Landscape (45vw desktop, 70vw mobile)
- **4:5** - Portrait (30vw desktop, 50vw mobile)
- **1:1** - Square (35vw desktop, 55vw mobile)
- **2:1** - Ultra-wide landscape (90vw desktop, 90vw mobile)
- **9:16** - Ultra-tall portrait (30vw desktop, 45vw mobile)

### CSS Implementation
```css
.key-visual {
  aspect-ratio: var(--aspect-ratio, 1);
}

.key-visual img,
.key-visual video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### JavaScript Implementation
```javascript
// Set aspect ratio for proper container sizing
const aspectRatio = visual.ratio.replace(':', ' / ');
keyVisual.style.setProperty('--aspect-ratio', aspectRatio);
```

## Webflow CMS Integration

### Data Structure
```json
{
  "type": "image|video|gif",
  "src": "https://example.com/asset.jpg",
  "poster": "https://example.com/poster.jpg",
  "alt": "Alt text for accessibility",
  "ratio": "16:9|4:5|1:1|2:1|9:16",
  "weight": 1,
  "drop": "season1",
  "order": 1
}
```

### Field Mapping
- `type` - Asset type (image, video, gif)
- `src` - Asset URL
- `poster` - Video poster image URL
- `alt` - Alt text for accessibility
- `ratio` - Aspect ratio for container sizing
- `weight` - Selection weight (currently unused)
- `drop` - Season/category label
- `order` - Display order (ascending)

### Fallback Collection
If no CMS data is found, the system uses a default collection with placeholder images.

## Performance Optimizations

### Asset Loading
- **Preloading**: First asset is preloaded for better performance
- **Lazy Loading**: Videos use `preload="metadata"` to reduce initial load
- **Format Optimization**: Supports modern formats (WebP, AVIF)

### Animation Performance
- **Hardware Acceleration**: `transform: translateZ(0)` and `backface-visibility: hidden`
- **GSAP Optimization**: Uses `will-change` and optimized transforms
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

### Memory Management
- **Instance Limiting**: Maximum 20 active visuals at once
- **Automatic Cleanup**: Visuals are removed after exit animation
- **DOM Cleanup**: CMS JSON feed is removed after parsing

## Mobile Support

### Touch Events
- **Tap Detection**: Distinguishes between taps and scrolls
- **Scroll Preservation**: Allows normal scrolling while maintaining tap functionality
- **Passive Listeners**: All touch events use `passive: true` for better performance

### Responsive Adjustments
- **Larger Visuals**: Mobile gets larger display widths for better visibility
- **Simplified Animations**: Reduced complexity for mobile devices
- **Touch-Friendly**: Optimized for finger interaction

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **CSS Features**: `aspect-ratio`, `object-fit`, CSS custom properties
- **JavaScript**: ES6+ features, GSAP animations

## Integration

### Webflow Setup
1. Add the hero container element with ID `key-visual-container`
2. Include the CSS file in your project
3. Include the JavaScript file in your project
4. Add GSAP library (if not already included)
5. The hero will automatically initialize

## Troubleshooting

### Common Issues
1. **Visuals not spawning**: Check console for initialization errors
2. **Wrong aspect ratios**: Verify CSS custom properties are being set
3. **Mobile not working**: Check touch event handling and mobile detection
4. **CMS data not loading**: Verify JSON structure and container ID

### Debug Mode
Enable console logging to see:
- Responsive width calculations
- Visual creation with ratios and widths
- Mobile detection status

## Version History
- **v2.0.0** (November 14, 2025): Major update - Vimeo iframe embed support, maxWidth feature, performance optimizations, consolidated video code, improved URL decoding
- **v1.9.9**: Added aspect ratio system, mobile scroll fix, CMS integration
- **v1.7.1**: Mobile touch handling improvements
- **v1.7.0**: Initial responsive design implementation
