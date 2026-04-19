---
title: "Tokens"
subtitle: "Every visual decision in one place"
description: "Every design token in one place — colors, typography, spacing, borders, and component tokens."
author: "Studio"
section: "Design System"
layer: "foundation"
subsection: ""
order: 1
status: "published"
access: "team"
client: "internal"
---

Design tokens are the single source of truth for every visual decision in the system. They capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync. This page lists every token defined in `design-system.css` for quick reference.

Tokens are organised into two layers: **primitive tokens** (raw values) and **semantic tokens** (intent-based aliases that reference primitives). Always prefer semantic tokens in production code.

Every token, value, and hex on this page is a click-to-copy chip. The convention is intentionally explicit so the syntax in the markdown source matches what you copy:

- `` `var(--token-name)` `` → CSS variable, copies `var(--token-name)`
- `` `.class-name` `` → utility class, copies `.class-name`
- `` `#abc123` `` → hex colour, copies `#abc123` and renders a swatch

---

## Brand Tokens

### Font Families

The four typeface stacks used across the system.

| Token | Value | Description |
| --- | --- | --- |
| `var(--font-primary)` | `"Zalando Sans", system-ui, …` | Body text and UI |
| `var(--font-secondary)` | `"trust-3a", "Zalando Sans", …` | Headings and display |
| `var(--font-tertiary)` | `"Bugrino", sans-serif` | Brand display, eyebrows, buttons, badges |
| `var(--font-quaternary)` | `"IBM Plex Mono", monospace` | Code and monospace |

### Brand Colors

Core palette colors that define the brand identity.

| Token | Value | Description |
| --- | --- | --- |
| `var(--off-white)` | `#fff7f1` | Light brand color |
| `var(--warm-white)` | `#f5ebe3` | Warm light tone |
| `var(--warm-black)` | `#221f1c` | Dark brand color |
| `var(--off-black)` | `#0f0e0e` | Near-black |
| `var(--red-lighter)` | `#FFE8E3` | Lighter red (backgrounds) |
| `var(--red-light)` | `#FFD6CD` | Light red |
| `var(--red)` | `#D92A27` | Accent red |
| `var(--red-dark)` | `#99333D` | Dark red |
| `var(--blue-lighter)` | `#D5F3FF` | Lighter blue (backgrounds) |
| `var(--blue-light)` | `#B1E6FC` | Light blue |
| `var(--blue)` | `#1A54D6` | Accent blue |
| `var(--blue-dark)` | `#152F57` | Dark blue |
| `var(--yellow-lighter)` | `#FFF3B8` | Lighter yellow (backgrounds) |
| `var(--yellow-light)` | `#FFEA83` | Light yellow |
| `var(--yellow)` | `#FFB533` | Accent yellow |
| `var(--yellow-dark)` | `#7E5700` | Dark yellow |
| `var(--green-lighter)` | `#DBF7CC` | Lighter green (backgrounds) |
| `var(--green-light)` | `#B6D6A5` | Light green |
| `var(--green)` | `#167255` | Accent green |
| `var(--green-dark)` | `#094C45` | Dark green |
| `var(--purple-lighter)` | `#F9E2FF` | Lighter purple (backgrounds) |
| `var(--purple-light)` | `#F5CDFF` | Light purple |
| `var(--purple)` | `#AA4FE3` | Accent purple |
| `var(--purple-dark)` | `#600E83` | Dark purple |

---

## Typography

### Font Sizes

The full type scale from 10px to 72px, defined in rem.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `var(--font-3xs)` | `0.625rem` | `10px` |
| `var(--font-2xs)` | `0.75rem` | `12px` |
| `var(--font-xs)` | `0.875rem` | `14px` |
| `var(--font-s)` | `1rem` | `16px` |
| `var(--font-m)` | `1.125rem` | `18px` |
| `var(--font-l)` | `1.25rem` | `20px` |
| `var(--font-xl)` | `1.375rem` | `22px` |
| `var(--font-2xl)` | `1.5rem` | `24px` |
| `var(--font-3xl)` | `1.75rem` | `28px` |
| `var(--font-4xl)` | `2rem` | `32px` |
| `var(--font-5xl)` | `2.25rem` | `36px` |
| `var(--font-6xl)` | `2.5rem` | `40px` |
| `var(--font-7xl)` | `3rem` | `48px` |
| `var(--font-8xl)` | `3.5rem` | `56px` |
| `var(--font-9xl)` | `4rem` | `64px` |
| `var(--font-10xl)` | `4.5rem` | `72px` |

### Semantic Font Sizes

Named aliases that map to the type scale for specific UI roles.

| Token | Value | Description |
| --- | --- | --- |
| `var(--text-body)` | `var(--font-m)` | Global body text size |
| `var(--button-font-size)` | `var(--text-body)` | Default button text |
| `var(--button-font-size-small)` | `var(--font-2xs)` | Small button text |

### Line Heights

Vertical rhythm values from tight display text to loose body copy.

| Token | Value | Description |
| --- | --- | --- |
| `var(--line-height-xs)` | `0.7` | Tight display text |
| `var(--line-height-s)` | `1` | Compact headings |
| `var(--line-height-m)` | `1.2` | Default headings |
| `var(--line-height-l)` | `1.4` | Short paragraphs |
| `var(--line-height-xl)` | `1.6` | Body text |
| `var(--line-height-2xl)` | `1.8` | Loose body text |

### Font Weights

Available weight values from light to black.

| Token | Value | Description |
| --- | --- | --- |
| `var(--font-weight-light)` | `300` | Light |
| `var(--font-weight-regular)` | `400` | Regular |
| `var(--font-weight-medium)` | `500` | Medium |
| `var(--font-weight-semi-bold)` | `600` | Semi-bold |
| `var(--font-weight-bold)` | `700` | Bold |
| `var(--font-weight-extra-bold)` | `800` | Extra-bold |
| `var(--font-weight-black)` | `900` | Black |

### Letter Spacing

Tracking values for labels, eyebrows, and display text.

| Token | Value | Description |
| --- | --- | --- |
| `var(--letter-spacing-s)` | `0.03em` | Subtle tracking |
| `var(--letter-spacing-m)` | `0.06em` | Medium tracking |
| `var(--letter-spacing-l)` | `0.12em` | Wide tracking |
| `var(--letter-spacing-xl)` | `0.24em` | Extra-wide (eyebrows, labels) |

---

## Colors

### Neutral Scale

Warm grey ramp from lightest (50) to near-black (990).

| Token | Value |
| --- | --- |
| `var(--neutral-50)` | `#fff7f1` |
| `var(--neutral-100)` | `#e8e1dc` |
| `var(--neutral-150)` | `#ddd6d1` |
| `var(--neutral-200)` | `#d2cbc6` |
| `var(--neutral-300)` | `#bbb5b1` |
| `var(--neutral-400)` | `#a59f9b` |
| `var(--neutral-500)` | `#8e8986` |
| `var(--neutral-600)` | `#777371` |
| `var(--neutral-700)` | `#615d5b` |
| `var(--neutral-800)` | `#4a4846` |
| `var(--neutral-900)` | `#343230` |
| `var(--neutral-950)` | `#1d1c1b` |
| `var(--neutral-990)` | `#0f0e0e` |

### Black Alpha Scale

Semi-transparent black values for overlays, borders, and tints.

| Token | Value | Opacity |
| --- | --- | --- |
| `var(--black)` | `#000000` | 100% |
| `var(--black-alpha-3)` | `#00000008` | 3% |
| `var(--black-alpha-5)` | `#0000000d` | 5% |
| `var(--black-alpha-10)` | `#0000001a` | 10% |
| `var(--black-alpha-15)` | `#00000026` | 15% |
| `var(--black-alpha-20)` | `#00000033` | 20% |
| `var(--black-alpha-30)` | `#0000004d` | 30% |
| `var(--black-alpha-40)` | `#00000066` | 40% |
| `var(--black-alpha-50)` | `#00000080` | 50% |
| `var(--black-alpha-60)` | `#00000099` | 60% |
| `var(--black-alpha-70)` | `#000000b3` | 70% |
| `var(--black-alpha-80)` | `#000000cc` | 80% |
| `var(--black-alpha-90)` | `#000000e6` | 90% |
| `var(--black-alpha-95)` | `#000000f2` | 95% |

### White Alpha Scale

Semi-transparent white values for highlights and light overlays.

| Token | Value | Opacity |
| --- | --- | --- |
| `var(--white)` | `#ffffff` | 100% |
| `var(--white-alpha-5)` | `#ffffff0d` | 5% |
| `var(--white-alpha-10)` | `#ffffff1a` | 10% |
| `var(--white-alpha-15)` | `#ffffff26` | 15% |
| `var(--white-alpha-20)` | `#ffffff33` | 20% |
| `var(--white-alpha-30)` | `#ffffff4d` | 30% |
| `var(--white-alpha-40)` | `#ffffff66` | 40% |
| `var(--white-alpha-50)` | `#ffffff80` | 50% |
| `var(--white-alpha-60)` | `#ffffff99` | 60% |
| `var(--white-alpha-70)` | `#ffffffb3` | 70% |
| `var(--white-alpha-80)` | `#ffffffcc` | 80% |
| `var(--white-alpha-90)` | `#ffffffe6` | 90% |
| `var(--white-alpha-95)` | `#fffffff2` | 95% |

### Color-Mix Alpha Scale

Transparency values used with `color-mix()` to create translucent variants of any color.

| Token | Value |
| --- | --- |
| `var(--alpha-5)` | `transparent 5%` |
| `var(--alpha-10)` | `transparent 10%` |
| `var(--alpha-15)` | `transparent 15%` |
| `var(--alpha-20)` | `transparent 20%` |
| `var(--alpha-25)` | `transparent 25%` |
| `var(--alpha-30)` | `transparent 30%` |
| `var(--alpha-35)` | `transparent 35%` |
| `var(--alpha-40)` | `transparent 40%` |
| `var(--alpha-45)` | `transparent 45%` |
| `var(--alpha-50)` | `transparent 50%` |
| `var(--alpha-55)` | `transparent 55%` |
| `var(--alpha-60)` | `transparent 60%` |
| `var(--alpha-65)` | `transparent 65%` |
| `var(--alpha-70)` | `transparent 70%` |
| `var(--alpha-75)` | `transparent 75%` |
| `var(--alpha-80)` | `transparent 80%` |
| `var(--alpha-85)` | `transparent 85%` |
| `var(--alpha-90)` | `transparent 90%` |
| `var(--alpha-95)` | `transparent 95%` |

### Text Colors

Semantic tokens that control text color by intent, not by value.

| Token | Value | Description |
| --- | --- | --- |
| `var(--text-primary)` | `var(--warm-black)` | Primary body text |
| `var(--text-secondary)` | `var(--neutral-800)` | Secondary/supporting text |
| `var(--text-plain)` | `var(--black)` | Pure black text |
| `var(--text-faded)` | `var(--black-alpha-50)` | De-emphasised text |
| `var(--text-accent)` | `var(--green)` | Accent/highlight text |
| `var(--text-link)` | `var(--green)` | Link text |
| `var(--text-inverted)` | `var(--off-white)` | Text on dark backgrounds |
| `var(--text-sidebar)` | `var(--text-primary)` | Sidebar navigation text |
| `var(--text-top-nav)` | `var(--text-primary)` | Top nav text |

### Background Colors

Semantic tokens for surface fills, from primary to overlays.

| Token | Value | Description |
| --- | --- | --- |
| `var(--background-primary)` | `var(--off-white)` | Main page background |
| `var(--background-secondary)` | `var(--warm-white)` | Secondary/alternate background |
| `var(--background-plain)` | `var(--white)` | Clean white background |
| `var(--background-faded)` | `var(--black-alpha-5)` | Subtle tinted background |
| `var(--background-darker)` | `var(--black-alpha-10)` | Darker tinted background |
| `var(--background-lighter)` | `var(--white-alpha-10)` | Lighter overlay background |
| `var(--background-modal)` | `rgba(0, 0, 0, 0.75)` | Modal backdrop |
| `var(--background-sidebar)` | `var(--background-primary)` | Sidebar background |
| `var(--background-top-nav)` | `var(--background-primary)` | Top nav background |

### Border Colors

Semantic tokens for border color by visual weight.

| Token | Value | Description |
| --- | --- | --- |
| `var(--border-primary)` | `var(--text-primary)` | Strong/prominent borders |
| `var(--border-secondary)` | `var(--neutral-300)` | Medium borders |
| `var(--border-faded)` | `var(--black-alpha-15)` | Subtle/light borders |

### Selection Colors

Text and background colors applied to user-selected content.

| Token | Value | Description |
| --- | --- | --- |
| `var(--selection-text)` | `var(--background-primary)` | Text color when selected |
| `var(--selection-background)` | `var(--text-primary)` | Highlight color when selected |

---

## Component Tokens

### Button

Fill and text colors for primary, secondary, and ghost button variants.

| Token | Value | Description |
| --- | --- | --- |
| `var(--button-primary)` | `var(--text-primary)` | Primary button background |
| `var(--button-text)` | `var(--off-white)` | Primary button text |
| `var(--button-secondary)` | `var(--black)` | Secondary button background |
| `var(--button-secondary-text)` | `var(--off-white)` | Secondary button text |
| `var(--button-faded)` | `var(--black-alpha-15)` | Faded/ghost button background |

### Status

Semantic colors for informational, success, warning, danger, and accent states.

| Token | Value | Description |
| --- | --- | --- |
| `var(--status-info)` | `var(--blue)` | Informational |
| `var(--status-info-bg)` | `var(--blue-lighter)` | Info background |
| `var(--status-success)` | `var(--green)` | Success |
| `var(--status-success-bg)` | `var(--green-lighter)` | Success background |
| `var(--status-warning)` | `var(--yellow-darker)` | Warning |
| `var(--status-warning-bg)` | `var(--yellow-lighter)` | Warning background |
| `var(--status-danger)` | `var(--red)` | Danger/error |
| `var(--status-danger-bg)` | `var(--red-lighter)` | Danger background |
| `var(--status-accent)` | `var(--purple)` | Accent/highlight |
| `var(--status-accent-bg)` | `var(--purple-lighter)` | Accent background |

### Form

Colors for inputs, checkboxes, and toggle switches across all states.

| Token | Value | Description |
| --- | --- | --- |
| `var(--input-border)` | `var(--border-secondary)` | Input border |
| `var(--input-background)` | `var(--black-alpha-5)` | Input background |
| `var(--input-text)` | `var(--text-plain)` | Input text |
| `var(--input-placeholder)` | `var(--text-faded)` | Placeholder text |
| `var(--input-focus)` | `var(--green)` | Focus ring color |
| `var(--input-disabled-bg)` | `var(--background-faded)` | Disabled input background |
| `var(--input-disabled-text)` | `var(--text-faded)` | Disabled input text |
| `var(--checkbox-background)` | `var(--neutral-100)` | Checkbox background |
| `var(--checkbox-selected)` | `var(--text-primary)` | Checkbox selected fill |
| `var(--checkbox-border)` | `var(--border-faded)` | Checkbox border |
| `var(--checkbox-checkmark)` | `var(--off-white)` | Checkmark color |
| `var(--toggle-track)` | `var(--black-alpha-3)` | Toggle track background |
| `var(--toggle-knob)` | `var(--neutral-500)` | Toggle knob |
| `var(--toggle-selected)` | `var(--text-primary)` | Toggle selected track |
| `var(--toggle-knob-selected)` | `var(--off-white)` | Toggle selected knob |

### Card

Surface, border, and hover colors for the card component.

| Token | Value | Description |
| --- | --- | --- |
| `var(--card-background)` | `var(--background-primary)` | Card background |
| `var(--card-border)` | `var(--border-faded)` | Card border |
| `var(--card-border-hover)` | `var(--border-primary)` | Card border on hover |

### Tooltip

Background and text colors for tooltip popups.

| Token | Value | Description |
| --- | --- | --- |
| `var(--tooltip-background)` | `var(--warm-black)` | Tooltip background |
| `var(--tooltip-text)` | `var(--off-white)` | Tooltip text |

### Toast

Background and text colors for toast notifications.

| Token | Value | Description |
| --- | --- | --- |
| `var(--toast-background)` | `var(--warm-black)` | Toast background |
| `var(--toast-text)` | `var(--off-white)` | Toast text |

### Tabs

Active, inactive, and indicator colors for the tab component.

| Token | Value | Description |
| --- | --- | --- |
| `var(--tab-active-color)` | `var(--text-primary)` | Active tab text |
| `var(--tab-inactive-color)` | `var(--text-faded)` | Inactive tab text |
| `var(--tab-indicator-color)` | `var(--text-primary)` | Tab underline indicator |

### Progress

Track and fill colors for the progress bar.

| Token | Value | Description |
| --- | --- | --- |
| `var(--progress-track)` | `var(--background-darker)` | Track background |
| `var(--progress-fill)` | `var(--text-primary)` | Fill/bar color |

### Divider

Line color for horizontal dividers.

| Token | Value | Description |
| --- | --- | --- |
| `var(--divider-color)` | `var(--border-faded)` | Divider line color |

### Dropdown

Surface, border, and hover colors for dropdown menus.

| Token | Value | Description |
| --- | --- | --- |
| `var(--dropdown-background)` | `var(--background-primary)` | Dropdown background |
| `var(--dropdown-border)` | `var(--border-faded)` | Dropdown border |
| `var(--dropdown-item-hover)` | `var(--background-faded)` | Hovered item background |

### Tag

Background and border colors for inline tags.

| Token | Value | Description |
| --- | --- | --- |
| `var(--tag-background)` | `var(--background-darker)` | Tag background |
| `var(--tag-border)` | `var(--border-faded)` | Tag border |

### Dialog

Surface, border, shadow, and backdrop colors for modal dialogs.

| Token | Value | Description |
| --- | --- | --- |
| `var(--dialog-background)` | `var(--background-primary)` | Dialog background |
| `var(--dialog-max-width)` | `560px` | Dialog maximum width |
| `var(--dialog-shadow)` | `0 8px 32px var(--black-alpha-20)` | Dialog drop shadow |
| `var(--dialog-backdrop)` | `rgba(0, 0, 0, 0.6)` | Dialog backdrop overlay |

### Slider

Track, fill, and thumb colors for range sliders.

| Token | Value | Description |
| --- | --- | --- |
| `var(--slider-track-background)` | `var(--background-darker)` | Slider track |
| `var(--slider-fill)` | `var(--text-primary)` | Slider filled portion |
| `var(--slider-thumb-background)` | `var(--text-primary)` | Thumb fill |
| `var(--slider-thumb-border)` | `var(--background-primary)` | Thumb border |

### Rating

Star colors and sizing for the rating component.

| Token | Value | Description |
| --- | --- | --- |
| `var(--rating-color)` | `var(--yellow)` | Filled star color |
| `var(--rating-color-empty)` | `var(--background-faded)` | Empty star color |
| `var(--rating-size)` | `1.5rem` | Star size |

---

## Spacing

### Unit Scale

The base spacing ramp from 0 to 160px, used as building blocks for all spacing.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `var(--none)` | `0` | `0px` |
| `var(--2xs)` | `0.125rem` | `2px` |
| `var(--xs)` | `0.25rem` | `4px` |
| `var(--s)` | `0.5rem` | `8px` |
| `var(--m)` | `0.75rem` | `12px` |
| `var(--l)` | `1rem` | `16px` |
| `var(--xl)` | `1.5rem` | `24px` |
| `var(--2xl)` | `2rem` | `32px` |
| `var(--3xl)` | `2.5rem` | `40px` |
| `var(--4xl)` | `3rem` | `48px` |
| `var(--5xl)` | `3.5rem` | `56px` |
| `var(--6xl)` | `4rem` | `64px` |
| `var(--7xl)` | `4.5rem` | `72px` |
| `var(--8xl)` | `5rem` | `80px` |
| `var(--9xl)` | `5.5rem` | `88px` |
| `var(--10xl)` | `6rem` | `96px` |
| `var(--11xl)` | `6.5rem` | `104px` |
| `var(--12xl)` | `7rem` | `112px` |
| `var(--13xl)` | `7.5rem` | `120px` |
| `var(--14xl)` | `10rem` | `160px` |

### Space Tokens

Semantic spacing aliases that reference the unit scale — use these in layouts and components.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `var(--space-none)` | `var(--none)` | `0px` |
| `var(--space-2xs)` | `var(--2xs)` | `2px` |
| `var(--space-xs)` | `var(--xs)` | `4px` |
| `var(--space-s)` | `var(--s)` | `8px` |
| `var(--space-m)` | `var(--m)` | `12px` |
| `var(--space-l)` | `var(--l)` | `16px` |
| `var(--space-xl)` | `var(--xl)` | `24px` |
| `var(--space-2xl)` | `var(--2xl)` | `32px` |
| `var(--space-3xl)` | `var(--3xl)` | `40px` |
| `var(--space-4xl)` | `var(--4xl)` | `48px` |
| `var(--space-5xl)` | `var(--5xl)` | `56px` |
| `var(--space-6xl)` | `var(--6xl)` | `64px` |
| `var(--space-7xl)` | `var(--7xl)` | `72px` |
| `var(--space-8xl)` | `var(--8xl)` | `80px` |
| `var(--space-9xl)` | `var(--9xl)` | `88px` |
| `var(--space-10xl)` | `var(--10xl)` | `96px` |
| `var(--space-11xl)` | `var(--11xl)` | `104px` |
| `var(--space-12xl)` | `var(--12xl)` | `112px` |
| `var(--space-13xl)` | `var(--13xl)` | `120px` |
| `var(--space-14xl)` | `var(--14xl)` | `160px` |

### Section Spacing

Vertical rhythm tokens for macro-level section padding.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `var(--section-xs)` | `var(--space-xl)` | `24px` |
| `var(--section-s)` | `var(--space-2xl)` | `32px` |
| `var(--section-m)` | `var(--space-6xl)` | `64px` |
| `var(--section-l)` | `var(--space-10xl)` | `96px` |
| `var(--section-xl)` | `var(--space-14xl)` | `160px` |

---

## Borders

### Border Widths

Available thickness values for the composable border system.

| Token | Value | Description |
| --- | --- | --- |
| `var(--border-s)` | `1.5px` | Default/thin border |
| `var(--border-m)` | `2px` | Medium border |
| `var(--border-l)` | `4px` | Thick/accent border |

### Border Composition

Default values applied when using structural border classes like `.border` or `.border-top`.

| Token | Value | Description |
| --- | --- | --- |
| `var(--border-width)` | `var(--border-s)` | Default border width |
| `var(--border-style)` | `solid` | Default border style |
| `var(--border-color)` | `var(--border-primary)` | Default border color |

### Border Radius

Rounding scale from subtle corners to fully rounded pills.

| Token | Value | Description |
| --- | --- | --- |
| `var(--radius-xs)` | `4px` | Subtle rounding |
| `var(--radius-s)` | `6px` | Small rounding |
| `var(--radius-m)` | `10px` | Medium rounding |
| `var(--radius-l)` | `16px` | Large rounding |
| `var(--radius-xl)` | `24px` | Extra-large rounding |
| `var(--radius-pill)` | `999px` | Fully rounded / pill shape |
