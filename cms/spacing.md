---
title: "Spacing"
subtitle: "The spacing scale that governs every gap and margin"
description: "Complete reference for spacing tokens including units, space tokens, section spacing, gaps, and padding utilities."
section: "Design System"
subsection: ""
order: 5
status: "published"
access: "team"
client: "internal"
---

Spacing tokens define **distance**, not intent. They are reused for gaps, padding, and margins depending on context. For the full list of spacing token values, see the [Tokens](tokens.html) page.

The system is built in layers: **unit tokens** (raw values) → **space tokens** (semantic aliases) → **utility classes** (applied in HTML). Always use space tokens or utility classes — never hardcode pixel values.

---

## Space Scale

The space scale provides a visual reference for the spacing tokens used throughout the system.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `var(--space-none)` | 0 | 0px |
| `var(--space-2xs)` | 0.125rem | 2px |
| `var(--space-xs)` | 0.25rem | 4px |
| `var(--space-s)` | 0.5rem | 8px |
| `var(--space-m)` | 0.75rem | 12px |
| `var(--space-l)` | 1rem | 16px |
| `var(--space-xl)` | 1.5rem | 24px |
| `var(--space-2xl)` | 2rem | 32px |
| `var(--space-3xl)` | 2.5rem | 40px |
| `var(--space-4xl)` | 3rem | 48px |
| `var(--space-5xl)` | 3.5rem | 56px |
| `var(--space-6xl)` | 4rem | 64px |
| `var(--space-7xl)` | 4.5rem | 72px |
| `var(--space-8xl)` | 5rem | 80px |
| `var(--space-9xl)` | 5.5rem | 88px |
| `var(--space-10xl)` | 6rem | 96px |

<div class="demo-preview is-joined">
  <div class="block gap-l">
    <div class="block gap-s">
      <p class="demo-eyebrow">2xs · 2px</p>
      <div style="height: var(--2xs); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">xs · 4px</p>
      <div style="height: var(--xs); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">s · 8px</p>
      <div style="height: var(--s); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">m · 12px</p>
      <div style="height: var(--m); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">l · 16px</p>
      <div style="height: var(--l); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">xl · 24px</p>
      <div style="height: var(--xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">2xl · 32px</p>
      <div style="height: var(--2xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">3xl · 40px</p>
      <div style="height: var(--3xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">4xl · 48px</p>
      <div style="height: var(--4xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">6xl · 64px</p>
      <div style="height: var(--6xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">8xl · 80px</p>
      <div style="height: var(--8xl); width: 100%; background: var(--background-darker);"></div>
    </div>
    <div class="block gap-s">
      <p class="demo-eyebrow">10xl · 96px</p>
      <div style="height: var(--10xl); width: 100%; background: var(--background-darker);"></div>
    </div>
  </div>
</div>

```css
padding: var(--space-m);
gap: var(--space-xl);
margin-bottom: var(--space-l);
```

---

## Gap

Gap modifiers control the space between child elements inside a `.block`. The default gap is `var(--space-m)`.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">No gap</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-none">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Small</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-xs">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Small</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-s">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Default gap</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-m">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Large</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-l">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Extra Large</p>
      <div class="block padding-l border border-faded border-dashed">
        <div class="block gap-xl">
          <div style="padding: var(--space-s); background: var(--background-faded);">First item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Second item</div>
          <div style="padding: var(--space-s); background: var(--background-faded);">Third item</div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<div class="block gap-l">
  <div>Item one</div>
  <div>Item two</div>
  <div>Item three</div>
</div>
```

| Class | Value | px Equivalent |
| --- | --- | --- |
| `.gap-none` | 0 | 0px |
| `.gap-xs` | `var(--space-xs)` | 4px |
| `.gap-s` | `var(--space-s)` | 8px |
| `.gap-m` | `var(--space-m)` | 12px |
| `.gap-l` | `var(--space-l)` | 16px |
| `.gap-xl` | `var(--space-xl)` | 24px |
| `.gap-2xl` | `var(--space-2xl)` | 32px |
| `.gap-3xl` | `var(--space-3xl)` | 40px |

---

## Padding

Padding utilities apply internal spacing to an element on all sides.

<div class="demo-preview is-joined">
  <div class="block gap-xl">
    <div class="block gap-m">
      <p class="demo-eyebrow">.padding-s</p>
      <div class="padding-s" style="background: var(--background-faded);">
        <div style="background: var(--background-primary); padding: var(--space-s);">Content</div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">.padding-m</p>
      <div class="padding-m" style="background: var(--background-faded);">
        <div style="background: var(--background-primary); padding: var(--space-s);">Content</div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">.padding-l</p>
      <div class="padding-l" style="background: var(--background-faded);">
        <div style="background: var(--background-primary); padding: var(--space-s);">Content</div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">.padding-xl</p>
      <div class="padding-xl" style="background: var(--background-faded);">
        <div style="background: var(--background-primary); padding: var(--space-s);">Content</div>
      </div>
    </div>
  </div>
</div>

```html
<div class="padding-l">
  <!-- Content with large padding on all sides -->
</div>
```

| Class | Value | px Equivalent |
| --- | --- | --- |
| `.padding-s` | `var(--space-s)` | 8px |
| `.padding-m` | `var(--space-m)` | 12px |
| `.padding-l` | `var(--space-l)` | 16px |
| `.padding-xl` | `var(--space-xl)` | 24px |
| `.padding-2xl` | `var(--space-2xl)` | 32px |
| `.padding-3xl` | `var(--space-3xl)` | 40px |

---

## Section Spacing

Section spacing controls the vertical rhythm between major page sections. Apply `.top-*` and `.bottom-*` classes to `<section>` elements. These scale responsively between desktop and mobile.

<div class="demo-preview is-joined">
  <div class="grid cols-2 gap-l">
    <div class="block gap-m">
      <p class="demo-eyebrow">Top spacing</p>
      <div class="block gap-m">
        <div class="block gap-none border border-faded border-dashed">
          <div class="top-small bg-faded"></div>
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.top-small</code></p>
          </div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div class="top-medium bg-faded"></div>
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.top-medium</code></p>
          </div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div class="top-large bg-faded"></div>
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.top-large</code></p>
          </div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div class="top-xl bg-faded"></div>
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.top-xl</code></p>
          </div>
        </div>
      </div>
    </div>
    <div class="block gap-m">
      <p class="demo-eyebrow">Bottom spacing</p>
      <div class="block gap-m">
        <div class="block gap-none border border-faded border-dashed">
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.bottom-small</code></p>
          </div>
          <div class="bottom-small bg-faded"></div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.bottom-medium</code></p>
          </div>
          <div class="bottom-medium bg-faded"></div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.bottom-large</code></p>
          </div>
          <div class="bottom-large bg-faded"></div>
        </div>
        <div class="block gap-none border border-faded border-dashed">
          <div style="padding: var(--space-m);">
            <p class="text-size-xsmall text-faded" style="margin: 0;"><code>.bottom-xl</code></p>
          </div>
          <div class="bottom-xl bg-faded"></div>
        </div>
      </div>
    </div>
  </div>
</div>

```html
<section class="top-medium bottom-medium">
  <!-- Section content -->
</section>
```

| Class | Token | Desktop | Mobile |
| --- | --- | --- | --- |
| `.top-small` / `.bottom-small` | `var(--section-s)` | 32px | 24px |
| `.top-medium` / `.bottom-medium` | `var(--section-m)` | 64px | 32px |
| `.top-large` / `.bottom-large` | `var(--section-l)` | 96px | 56px |
| `.top-xl` / `.bottom-xl` | `var(--section-xl)` | 160px | 80px |
