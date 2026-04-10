---
title: "bd-audio"
subtitle: "In-house sound feedback system for user interactions"
description: "Documentation for bd-audio — the ByDefault reusable audio library for any project. Covers sound attributes, volume controls, and accessibility features."
section: "Website"
layer: "app"
subsection: "Interactions"
order: 2
---

# bd-audio

Our in-house audio feedback library. Add sound effects to any interactive element with a single data attribute. Handles autoplay restrictions, respects reduced motion, and persists user preferences via localStorage.

### Install

Add the following to your `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="path/to/bd-audio.js"></script>
```

GSAP is required for the sound toggle button animation. Audio files are loaded from CDN by default.

### Usage

Add `data-bd-audio` to any element.

```html
<button data-bd-audio="click">Click sound</button>
<a href="#" data-bd-audio="hover">Hover sound</a>
<button data-bd-audio="click hover">Both</button>
```

---

## Live Demos

Click and hover the elements below to hear the sounds. Audio enables on your first click.

### Click Sounds

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Button with click sound</p>
      <div><button class="button" data-bd-audio="click">Click me</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Link with click sound</p>
      <div><a href="javascript:void(0)" data-bd-audio="click">Click this link</a></div>
    </div>
  </div>
</div>

```html
<button class="button" data-bd-audio="click">Click me</button>
<a href="#" data-bd-audio="click">Click this link</a>
```

### Hover Sounds

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Button with hover sound</p>
      <div><button class="button is-outline" data-bd-audio="hover">Hover me</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Link with hover sound</p>
      <div><a href="javascript:void(0)" data-bd-audio="hover">Hover this link</a></div>
    </div>
  </div>
</div>

```html
<button class="button is-outline" data-bd-audio="hover">Hover me</button>
<a href="#" data-bd-audio="hover">Hover this link</a>
```

### Combined

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Click + hover on same element</p>
      <div><button class="button" data-bd-audio="click hover">Hover and click me</button></div>
    </div>
  </div>
</div>

```html
<button class="button" data-bd-audio="click hover">Hover and click</button>
```

### Programmatic Sounds

These sounds are triggered via JavaScript — useful for form submissions, success states, or error handling.

<div class="demo-preview">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">Success</p>
      <div><button class="button" onclick="window.bdAudio && window.bdAudio.playSound('success')">Play success</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Error</p>
      <div><button class="button is-outline" onclick="window.bdAudio && window.bdAudio.playSound('error')">Play error</button></div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bump</p>
      <div><button class="button is-outline" onclick="window.bdAudio && window.bdAudio.playSound('bump')">Play bump</button></div>
    </div>
  </div>
</div>

```javascript
window.bdAudio.playSound('success');
window.bdAudio.playSound('error');
window.bdAudio.playSound('bump');
```

---

## Attributes

| Attribute | Description |
|-----------|-------------|
| `data-bd-audio="click"` | Play click sound on click |
| `data-bd-audio="hover"` | Play hover sound on mouseenter |
| `data-bd-audio="click hover"` | Both click and hover sounds |

## JavaScript API

```javascript
// Play a sound
window.bdAudio.playSound('click');
window.bdAudio.playSound('hover');
window.bdAudio.playSound('success');
window.bdAudio.playSound('error');
window.bdAudio.playSound('bump');

// Enable / disable
window.bdAudio.setEnabled(true);
window.bdAudio.setEnabled(false);

// Set volume for a specific sound (0.0 to 1.0)
window.bdAudio.setSoundVolume('click', 0.5);

// Get current settings
window.bdAudio.getSettings();
```

## Audio Files

| Sound | File | Default Volume |
|-------|------|---------------|
| Click | `click.mp3` | 0.3 |
| Hover | `hover.mp3` | 0.3 |
| Success | `success.mp3` | 0.2 |
| Error | `error.mp3` | 0.2 |
| Bump | `bump.mp3` | 0.2 |

---

## Sound Toggle Button

Add a toggle button with `id="bd-sound"` and two icon containers:

```html
<button id="bd-sound" aria-label="Turn sound on">
  <span class="icn-sound-on">ON icon</span>
  <span class="icn-sound-off">OFF icon</span>
</button>
```

The script handles state, aria labels, and localStorage persistence automatically.

## Dependencies

- **GSAP** — toggle button animation only
- Respects `prefers-reduced-motion`
- Audio enables on first user click (browser autoplay policy)
- Settings persisted in `localStorage` as `bd-audio-settings`
