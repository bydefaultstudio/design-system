---
title: "Color"
subtitle: "Color tokens and semantic colors"
description: "Complete reference for all color tokens including primitive colors and semantic color mappings."
section: "Design System"
order: 2
access: "team"
---

Color tokens are the foundation of the design system's color system. They define the shared, reusable color values that power both design and code. By standardising these decisions in one place, tokens keep the experience consistent, reduce duplication, and make global updates safe and fast.

## Primitive Colors

Primitive colors are the raw color values used as building blocks for all other color tokens. They can be used directly in layouts or components, but it's **preferred to use semantic tokens** instead.

### Brand Colors

Brand tokens are project-level overrides and may change per project. **You can rename the token names** to anything relating to your brand (e.g., `--primary`, `--off-white`, `--charcoal`, `--hero-blue`, etc.). This personalizes the system and makes it more intuitive for your team.

| Token | Value | Description |
| --- | --- | --- |
| `--warm-black` | #brand-hex1 | Dark brand color |
| `--off-white` | #brand-hex2 | Light brand color |
| `--green` | #brand-hex3 | Accent brand color |

**Usage:**

```css
:root {
  /* You can use default names or rename tokens to match your brand */
  --warm-black: #1a1a1a; /* Replace with your brand color */
  
  /* Or use custom names that make sense for your project */
  --charcoal: #1a1a1a;
  --off-white: #f5f5f5;
  --hero-blue: #0066cc;
}

.div {
  color: var(--warm-black);
  /* Or use your custom token name */
  /* color: var(--charcoal); */
}
```

### Black

Black tokens provide true black and black with varying opacity levels for overlays, shadows, and faded text.

| Token | Value | Description |
| --- | --- | --- |
| `--black` | #000000 | True black |
| `--black-alpha-5` | #0000000D | 5% opacity |
| `--black-alpha-10` | #0000001A | 10% opacity |
| `--black-alpha-15` | #00000026 | 15% opacity |
| `--black-alpha-20` | #00000033 | 20% opacity |
| `--black-alpha-30` | #0000004D | 30% opacity |
| `--black-alpha-40` | #00000066 | 40% opacity |
| `--black-alpha-50` | #00000080 | 50% opacity |
| `--black-alpha-60` | #00000099 | 60% opacity |
| `--black-alpha-70` | #000000B3 | 70% opacity |
| `--black-alpha-80` | #000000CC | 80% opacity |
| `--black-alpha-90` | #000000E6 | 90% opacity |
| `--black-alpha-95` | #000000F2 | 95% opacity |

**Usage:**

```css
.shadow {
  box-shadow: 0 4px 6px var(--black-alpha-30);
}
```

### White

White tokens provide true white and white with varying opacity levels for overlays and backgrounds.

| Token | Value | Description |
| --- | --- | --- |
| `--white` | #FFFFFF | True white |
| `--white-alpha-5` | #FFFFFF0D | 5% opacity |
| `--white-alpha-10` | #FFFFFF1A | 10% opacity |
| `--white-alpha-15` | #FFFFFF26 | 15% opacity |
| `--white-alpha-20` | #FFFFFF33 | 20% opacity |
| `--white-alpha-30` | #FFFFFF4D | 30% opacity |
| `--white-alpha-40` | #FFFFFF66 | 40% opacity |
| `--white-alpha-50` | #FFFFFF80 | 50% opacity |
| `--white-alpha-60` | #FFFFFF99 | 60% opacity |
| `--white-alpha-70` | #FFFFFFB3 | 70% opacity |
| `--white-alpha-80` | #FFFFFFCC | 80% opacity |
| `--white-alpha-90` | #FFFFFFE6 | 90% opacity |
| `--white-alpha-95` | #FFFFFFF2 | 95% opacity |

**Usage:**

```css
.highlight {
  background-color: var(--white-alpha-30);
}
```

### Neutral Colors

Neutral colors provide a grayscale palette from light to dark for backgrounds, borders, and text.

| Token | Value |
| --- | --- |
| `--neutral-50` | #FFF7F1 |
| `--neutral-100` | #E3E0DE |
| `--neutral-150` | #DDD6D1 |
| `--neutral-200` | #CECCCA |
| `--neutral-300` | #BAB8B6 |
| `--neutral-400` | #A5A4A2 |
| `--neutral-500` | #918F8E |
| `--neutral-600` | #7D7B7B |
| `--neutral-700` | #686767 |
| `--neutral-800` | #545353 |
| `--neutral-900` | #3F3F3F |
| `--neutral-950` | #1D1C1B |
| `--neutral-990` | #0F0E0E |

**Usage:**

```css
.text {
  color: var(--neutral-800);
}
```

---

## Semantic Colors

Semantic colors map primitive tokens to **meaning and intent**, giving context and purpose to how colors are used. This makes it easier to implement consistent styling across components and ensures colors are used appropriately throughout the interface.

### Text Colors

| **Name** | Value | Description |
| --- | --- | --- |
| `--text-primary` | ↳`--warm-black` | Primary text color |
| `--text-secondary` | ↳`--text-secondary-brand` | Secondary text color |
| `--text-plain` | ↳`--black` | True black text |
| `--text-faded` | ↳`--black-alpha-50` | Faded text |
| `--text-accent` | ↳`--green` | Accent text |
| `--text-link` | ↳`--green` | Link text color |
| `--text-sidebar` | ↳`--text-primary` | Sidebar text color |
| `--text-site-header` | ↳`--text-primary` | Site header text color |

**Usage:**

```css
h1 {
  color: var(--text-primary);
}
```

### Background Colors

| **Name** | **Value** | **Description** |
| --- | --- | --- |
| `--background-primary` | ↳`--off-white` | Default background |
| `--background-secondary` | ↳`--warm-white` | Secondary background |
| `--background-plain` | ↳`--white` | True white background |
| `--background-faded` | ↳`--black-alpha-5` | Faded background overlay |
| `--background-sidebar` | ↳`--background-primary` | Sidebar background |
| `--background-site-header` | ↳`--background-primary` | Site header background |

**Usage:**

```css
.card {
  background-color: var(--background-plain);
}
```

### Border Colors

| **Name** | **Value** | **Description** |
| --- | --- | --- |
| `--border-primary` | ↳`--border-primary-brand` | Default border|
| `--border-secondary` | ↳`--border-secondary-brand` | Second border |
| `--border-faded` | ↳`--black-alpha-15` | Faded border |

**Usage:**

```css
.card {
  border-color: var(--border-primary);
}
```

---

## Dark Mode

The design system uses a `data-theme` attribute to switch between light and dark modes. Light mode is the default (defined in `:root`). Dark mode activates when `data-theme="dark"` is set on any element.

### How It Works

- **`:root`** — light mode tokens (always present, the default)
- **`[data-theme="dark"]`** — overrides semantic tokens with dark-appropriate values
- **`@media (prefers-color-scheme: dark)`** — no-JS fallback for users with dark OS preference

The toggle button in the site header sets `data-theme="dark"` on `<html>` and persists the choice in `localStorage`.

### Page-Level Usage

The toggle handles this automatically. When dark mode is active:

```html
<html data-theme="dark">
```

When light mode is active, the attribute is removed and `:root` defaults apply.

### Scoped Usage

You can apply dark mode to any element, not just the page:

```html
<!-- Dark card on a light page -->
<div data-theme="dark" class="card">
  <p>This section uses dark mode tokens</p>
</div>
```

All semantic tokens inside that element will resolve to their dark values via CSS custom property inheritance.

### Dark Mode Token Overrides

Every semantic token has a dark mode override. The key mappings:

| Token | Light Value | Dark Value |
| --- | --- | --- |
| `--text-primary` | `var(--warm-black)` | `#e8e6e3` |
| `--text-secondary` | `var(--neutral-800)` | `#a8a5a2` |
| `--text-plain` | `var(--black)` | `#f0eeeb` |
| `--text-faded` | `var(--black-alpha-50)` | `rgba(255,255,255,0.45)` |
| `--text-accent` | `var(--green)` | `#5bb89a` |
| `--text-link` | `var(--green)` | `#5bb89a` |
| `--text-inverted` | `var(--off-white)` | `#1a1a1a` |
| `--text-sidebar` | `var(--text-primary)` | `var(--text-primary)` |
| `--text-site-header` | `var(--text-primary)` | `var(--text-primary)` |
| `--background-primary` | `var(--off-white)` | `#1a1a1a` |
| `--background-secondary` | `var(--warm-white)` | `#222222` |
| `--background-plain` | `var(--white)` | `#2a2a2a` |
| `--background-faded` | `var(--black-alpha-5)` | `rgba(255,255,255,0.06)` |
| `--background-sidebar` | `var(--background-primary)` | `var(--background-primary)` |
| `--background-site-header` | `var(--background-primary)` | `var(--background-primary)` |
| `--border-primary` | `var(--text-primary)` | `#e8e6e3` |
| `--border-secondary` | `var(--neutral-300)` | `#3a3a3a` |
| `--border-faded` | `var(--black-alpha-15)` | `rgba(255,255,255,0.12)` |

Button, status, and form tokens also have dark overrides. See `assets/css/design-system.css` section 2b for the complete list.

### Customizing Dark Mode Colors

Edit the `[data-theme="dark"]` block in `assets/css/design-system.css`. When changing a value, also update the `@media (prefers-color-scheme: dark)` fallback block (section 2c) to keep them in sync.

