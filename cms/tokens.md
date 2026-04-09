---
title: "Tokens"
subtitle: "Every visual decision in one place"
description: "Every design token in one place — colors, typography, spacing, borders, and component tokens."
section: "Design System"
subsection: ""
order: 1
status: "published"
access: "team"
client: "internal"
---

Design tokens are the single source of truth for every visual decision in the system. They capture color, typography, spacing, and border values as reusable variables so that design and code stay in sync. This page lists every token defined in `design-system.css` for quick reference.

Tokens are organised into two layers: **primitive tokens** (raw values) and **semantic tokens** (intent-based aliases that reference primitives). Always prefer semantic tokens in production code.

---

## Brand Tokens

### Font Families

The three typeface stacks used across the system.

| Token | Value | Description |
| --- | --- | --- |
| `--font-primary` | "Inclusive Sans", sans-serif | Body text and UI |
| `--font-secondary` | "RecifeText", Georgia, serif | Headings and display |
| `--font-tertiary` | "IBM Plex Mono", monospace | Code and monospace |

### Brand Colors

Core palette colors that define the brand identity.

| Token | Value | Description |
| --- | --- | --- |
| `--off-white` | #fff7f1 | Light brand color |
| `--warm-white` | #f5ebe3 | Warm light tone |
| `--warm-black` | #221f1c | Dark brand color |
| `--off-black` | #0f0e0e | Near-black |
| `--red-lighter` | #FFE8E3 | Lighter red (backgrounds) |
| `--red-light` | #FFD6CD | Light red |
| `--red` | #D92A27 | Accent red |
| `--red-dark` | #99333D | Dark red |
| `--blue-lighter` | #D5F3FF | Lighter blue (backgrounds) |
| `--blue-light` | #B1E6FC | Light blue |
| `--blue` | #1A54D6 | Accent blue |
| `--blue-dark` | #152F57 | Dark blue |
| `--yellow-lighter` | #FFF3B8 | Lighter yellow (backgrounds) |
| `--yellow-light` | #FFEA83 | Light yellow (replaces yellow-light) |
| `--yellow` | #FFB533 | Accent yellow (replaces yellow) |
| `--yellow-dark` | #7E5700 | Dark yellow |
| `--green-lighter` | #DBF7CC | Lighter green (backgrounds) |
| `--green-light` | #B6D6A5 | Light green |
| `--green` | #167255 | Accent green |
| `--green-dark` | #094C45 | Dark green |
| `--purple-lighter` | #F9E2FF | Lighter purple (backgrounds) |
| `--purple-light` | #F5CDFF | Light purple |
| `--purple` | #AA4FE3 | Accent purple |
| `--purple-dark` | #600E83 | Dark purple |
---

## Typography

### Font Sizes

The full type scale from 10px to 72px, defined in rem.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `--font-3xs` | 0.625rem | 10px |
| `--font-2xs` | 0.75rem | 12px |
| `--font-xs` | 0.875rem | 14px |
| `--font-s` | 1rem | 16px |
| `--font-m` | 1.125rem | 18px |
| `--font-l` | 1.25rem | 20px |
| `--font-xl` | 1.375rem | 22px |
| `--font-2xl` | 1.5rem | 24px |
| `--font-3xl` | 1.75rem | 28px |
| `--font-4xl` | 2rem | 32px |
| `--font-5xl` | 2.25rem | 36px |
| `--font-6xl` | 2.5rem | 40px |
| `--font-7xl` | 3rem | 48px |
| `--font-8xl` | 3.5rem | 56px |
| `--font-9xl` | 4rem | 64px |
| `--font-10xl` | 4.5rem | 72px |

### Semantic Font Sizes

Named aliases that map to the type scale for specific UI roles.

| Token | Value | Description |
| --- | --- | --- |
| `--text-body` | var(--font-m) | Global body text size |
| `--button-font-size` | var(--text-body) | Default button text |
| `--button-font-size-small` | var(--font-2xs) | Small button text |

### Line Heights

Vertical rhythm values from tight display text to loose body copy.

| Token | Value | Description |
| --- | --- | --- |
| `--line-height-xs` | 0.7 | Tight display text |
| `--line-height-s` | 1 | Compact headings |
| `--line-height-m` | 1.3 | Default headings |
| `--line-height-l` | 1.4 | Short paragraphs |
| `--line-height-xl` | 1.6 | Body text |
| `--line-height-2xl` | 1.8 | Loose body text |

### Font Weights

Available weight values from light to black.

| Token | Value | Description |
| --- | --- | --- |
| `--font-weight-light` | 300 | Light |
| `--font-weight-regular` | 400 | Regular |
| `--font-weight-medium` | 500 | Medium |
| `--font-weight-semi-bold` | 600 | Semi-bold |
| `--font-weight-bold` | 700 | Bold |
| `--font-weight-extra-bold` | 800 | Extra-bold |
| `--font-weight-black` | 900 | Black |

### Letter Spacing

Tracking values for labels, eyebrows, and display text.

| Token | Value | Description |
| --- | --- | --- |
| `--letter-spacing-s` | 0.03em | Subtle tracking |
| `--letter-spacing-m` | 0.06em | Medium tracking |
| `--letter-spacing-l` | 0.12em | Wide tracking |
| `--letter-spacing-xl` | 0.24em | Extra-wide (eyebrows, labels) |

---

## Colors

### Neutral Scale

Warm grey ramp from lightest (50) to near-black (990).

| Token | Value |
| --- | --- |
| `--neutral-50` | #fff7f1 |
| `--neutral-100` | #e8e1dc |
| `--neutral-150` | #ddd6d1 |
| `--neutral-200` | #d2cbc6 |
| `--neutral-300` | #bbb5b1 |
| `--neutral-400` | #a59f9b |
| `--neutral-500` | #8e8986 |
| `--neutral-600` | #777371 |
| `--neutral-700` | #615d5b |
| `--neutral-800` | #4a4846 |
| `--neutral-900` | #343230 |
| `--neutral-950` | #1d1c1b |
| `--neutral-990` | #0f0e0e |

### Black Alpha Scale

Semi-transparent black values for overlays, borders, and tints.

| Token | Value | Opacity |
| --- | --- | --- |
| `--black` | #000000 | 100% |
| `--black-alpha-3` | #00000008 | 3% |
| `--black-alpha-5` | #0000000d | 5% |
| `--black-alpha-10` | #0000001a | 10% |
| `--black-alpha-15` | #00000026 | 15% |
| `--black-alpha-20` | #00000033 | 20% |
| `--black-alpha-30` | #0000004d | 30% |
| `--black-alpha-40` | #00000066 | 40% |
| `--black-alpha-50` | #00000080 | 50% |
| `--black-alpha-60` | #00000099 | 60% |
| `--black-alpha-70` | #000000b3 | 70% |
| `--black-alpha-80` | #000000cc | 80% |
| `--black-alpha-90` | #000000e6 | 90% |
| `--black-alpha-95` | #000000f2 | 95% |

### White Alpha Scale

Semi-transparent white values for highlights and light overlays.

| Token | Value | Opacity |
| --- | --- | --- |
| `--white` | #ffffff | 100% |
| `--white-alpha-5` | #ffffff0d | 5% |
| `--white-alpha-10` | #ffffff1a | 10% |
| `--white-alpha-15` | #ffffff26 | 15% |
| `--white-alpha-20` | #ffffff33 | 20% |
| `--white-alpha-30` | #ffffff4d | 30% |
| `--white-alpha-40` | #ffffff66 | 40% |
| `--white-alpha-50` | #ffffff80 | 50% |
| `--white-alpha-60` | #ffffff99 | 60% |
| `--white-alpha-70` | #ffffffb3 | 70% |
| `--white-alpha-80` | #ffffffcc | 80% |
| `--white-alpha-90` | #ffffffe6 | 90% |
| `--white-alpha-95` | #fffffff2 | 95% |

### Color-Mix Alpha Scale

Transparency values used with `color-mix()` to create translucent variants of any color.

| Token | Value |
| --- | --- |
| `--alpha-5` | transparent 5% |
| `--alpha-10` | transparent 10% |
| `--alpha-15` | transparent 15% |
| `--alpha-20` | transparent 20% |
| `--alpha-25` | transparent 25% |
| `--alpha-30` | transparent 30% |
| `--alpha-35` | transparent 35% |
| `--alpha-40` | transparent 40% |
| `--alpha-45` | transparent 45% |
| `--alpha-50` | transparent 50% |
| `--alpha-55` | transparent 55% |
| `--alpha-60` | transparent 60% |
| `--alpha-65` | transparent 65% |
| `--alpha-70` | transparent 70% |
| `--alpha-75` | transparent 75% |
| `--alpha-80` | transparent 80% |
| `--alpha-85` | transparent 85% |
| `--alpha-90` | transparent 90% |
| `--alpha-95` | transparent 95% |

### Text Colors

Semantic tokens that control text color by intent, not by value.

| Token | Value | Description |
| --- | --- | --- |
| `--text-primary` | var(--warm-black) | Primary body text |
| `--text-secondary` | var(--neutral-800) | Secondary/supporting text |
| `--text-plain` | var(--black) | Pure black text |
| `--text-faded` | var(--black-alpha-50) | De-emphasised text |
| `--text-accent` | var(--green) | Accent/highlight text |
| `--text-link` | var(--green) | Link text |
| `--text-inverted` | var(--off-white) | Text on dark backgrounds |
| `--text-sidebar` | var(--text-primary) | Sidebar navigation text |
| `--text-site-header` | var(--text-primary) | Site header text |

### Background Colors

Semantic tokens for surface fills, from primary to overlays.

| Token | Value | Description |
| --- | --- | --- |
| `--background-primary` | var(--off-white) | Main page background |
| `--background-secondary` | var(--warm-white) | Secondary/alternate background |
| `--background-plain` | var(--white) | Clean white background |
| `--background-faded` | var(--black-alpha-5) | Subtle tinted background |
| `--background-darker` | var(--black-alpha-10) | Darker tinted background |
| `--background-lighter` | var(--white-alpha-10) | Lighter overlay background |
| `--background-modal` | rgba(0, 0, 0, 0.75) | Modal backdrop |
| `--background-sidebar` | var(--background-primary) | Sidebar background |
| `--background-site-header` | var(--background-primary) | Site header background |

### Border Colors

Semantic tokens for border color by visual weight.

| Token | Value | Description |
| --- | --- | --- |
| `--border-primary` | var(--text-primary) | Strong/prominent borders |
| `--border-secondary` | var(--neutral-300) | Medium borders |
| `--border-faded` | var(--black-alpha-15) | Subtle/light borders |

### Selection Colors

Text and background colors applied to user-selected content.

| Token | Value | Description |
| --- | --- | --- |
| `--selection-text` | var(--background-primary) | Text color when selected |
| `--selection-background` | var(--text-primary) | Highlight color when selected |

---

## Component Tokens

### Button

Fill and text colors for primary, secondary, and ghost button variants.

| Token | Value | Description |
| --- | --- | --- |
| `--button-primary` | var(--text-primary) | Primary button background |
| `--button-text` | var(--off-white) | Primary button text |
| `--button-secondary` | var(--black) | Secondary button background |
| `--button-secondary-text` | var(--off-white) | Secondary button text |
| `--button-faded` | var(--black-alpha-15) | Faded/ghost button background |

### Status

Semantic colors for informational, success, warning, danger, and accent states.

| Token | Value | Description |
| --- | --- | --- |
| `--status-info` | var(--blue) | Informational |
| `--status-info-bg` | var(--blue-lighter) | Info background |
| `--status-success` | var(--green) | Success |
| `--status-success-bg` | var(--green-lighter) | Success background |
| `--status-warning` | var(--yellow-darker) | Warning |
| `--status-warning-bg` | var(--yellow-lighter) | Warning background |
| `--status-danger` | var(--red) | Danger/error |
| `--status-danger-bg` | var(--red-lighter) | Danger background |
| `--status-accent` | var(--purple) | Accent/highlight |
| `--status-accent-bg` | var(--purple-lighter) | Accent background |

### Form

Colors for inputs, checkboxes, and toggle switches across all states.

| Token | Value | Description |
| --- | --- | --- |
| `--input-border` | var(--border-secondary) | Input border |
| `--input-background` | var(--black-alpha-5) | Input background |
| `--input-text` | var(--text-plain) | Input text |
| `--input-placeholder` | var(--text-faded) | Placeholder text |
| `--input-focus` | var(--green) | Focus ring color |
| `--input-disabled-bg` | var(--background-faded) | Disabled input background |
| `--input-disabled-text` | var(--text-faded) | Disabled input text |
| `--checkbox-background` | var(--neutral-100) | Checkbox background |
| `--checkbox-selected` | var(--text-primary) | Checkbox selected fill |
| `--checkbox-border` | var(--border-faded) | Checkbox border |
| `--checkbox-checkmark` | var(--off-white) | Checkmark color |
| `--toggle-track` | var(--black-alpha-3) | Toggle track background |
| `--toggle-knob` | var(--neutral-500) | Toggle knob |
| `--toggle-selected` | var(--text-primary) | Toggle selected track |
| `--toggle-knob-selected` | var(--off-white) | Toggle selected knob |

### Card

Surface, border, and hover colors for the card component.

| Token | Value | Description |
| --- | --- | --- |
| `--card-background` | var(--background-primary) | Card background |
| `--card-border` | var(--border-faded) | Card border |
| `--card-border-hover` | var(--border-primary) | Card border on hover |

### Tooltip

Background and text colors for tooltip popups.

| Token | Value | Description |
| --- | --- | --- |
| `--tooltip-background` | var(--warm-black) | Tooltip background |
| `--tooltip-text` | var(--off-white) | Tooltip text |

### Toast

Background and text colors for toast notifications.

| Token | Value | Description |
| --- | --- | --- |
| `--toast-background` | var(--warm-black) | Toast background |
| `--toast-text` | var(--off-white) | Toast text |

### Tabs

Active, inactive, and indicator colors for the tab component.

| Token | Value | Description |
| --- | --- | --- |
| `--tab-active-color` | var(--text-primary) | Active tab text |
| `--tab-inactive-color` | var(--text-faded) | Inactive tab text |
| `--tab-indicator-color` | var(--text-primary) | Tab underline indicator |

### Progress

Track and fill colors for the progress bar.

| Token | Value | Description |
| --- | --- | --- |
| `--progress-track` | var(--background-darker) | Track background |
| `--progress-fill` | var(--text-primary) | Fill/bar color |

### Divider

Line color for horizontal dividers.

| Token | Value | Description |
| --- | --- | --- |
| `--divider-color` | var(--border-faded) | Divider line color |

### Dropdown

Surface, border, and hover colors for dropdown menus.

| Token | Value | Description |
| --- | --- | --- |
| `--dropdown-background` | var(--background-primary) | Dropdown background |
| `--dropdown-border` | var(--border-faded) | Dropdown border |
| `--dropdown-item-hover` | var(--background-faded) | Hovered item background |

### Tag

Background and border colors for inline tags.

| Token | Value | Description |
| --- | --- | --- |
| `--tag-background` | var(--background-darker) | Tag background |
| `--tag-border` | var(--border-faded) | Tag border |

### Dialog

Surface, border, shadow, and backdrop colors for modal dialogs.

| Token | Value | Description |
| --- | --- | --- |
| `--dialog-background` | var(--background-primary) | Dialog background |
| `--dialog-max-width` | 560px | Dialog maximum width |
| `--dialog-shadow` | 0 8px 32px var(--black-alpha-20) | Dialog drop shadow |
| `--dialog-backdrop` | rgba(0, 0, 0, 0.6) | Dialog backdrop overlay |

### Slider

Track, fill, and thumb colors for range sliders.

| Token | Value | Description |
| --- | --- | --- |
| `--slider-track-background` | var(--background-darker) | Slider track |
| `--slider-fill` | var(--text-primary) | Slider filled portion |
| `--slider-thumb-background` | var(--text-primary) | Thumb fill |
| `--slider-thumb-border` | var(--background-primary) | Thumb border |

### Rating

Star colors and sizing for the rating component.

| Token | Value | Description |
| --- | --- | --- |
| `--rating-color` | var(--yellow) | Filled star color |
| `--rating-color-empty` | var(--background-faded) | Empty star color |
| `--rating-size` | 1.5rem | Star size |

---

## Spacing

### Unit Scale

The base spacing ramp from 0 to 160px, used as building blocks for all spacing.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `--none` | 0 | 0px |
| `--2xs` | 0.125rem | 2px |
| `--xs` | 0.25rem | 4px |
| `--s` | 0.5rem | 8px |
| `--m` | 0.75rem | 12px |
| `--l` | 1rem | 16px |
| `--xl` | 1.5rem | 24px |
| `--2xl` | 2rem | 32px |
| `--3xl` | 2.5rem | 40px |
| `--4xl` | 3rem | 48px |
| `--5xl` | 3.5rem | 56px |
| `--6xl` | 4rem | 64px |
| `--7xl` | 4.5rem | 72px |
| `--8xl` | 5rem | 80px |
| `--9xl` | 5.5rem | 88px |
| `--10xl` | 6rem | 96px |
| `--11xl` | 6.5rem | 104px |
| `--12xl` | 7rem | 112px |
| `--13xl` | 7.5rem | 120px |
| `--14xl` | 10rem | 160px |

### Space Tokens

Semantic spacing aliases that reference the unit scale — use these in layouts and components.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `--space-none` | var(--none) | 0px |
| `--space-2xs` | var(--2xs) | 2px |
| `--space-xs` | var(--xs) | 4px |
| `--space-s` | var(--s) | 8px |
| `--space-m` | var(--m) | 12px |
| `--space-l` | var(--l) | 16px |
| `--space-xl` | var(--xl) | 24px |
| `--space-2xl` | var(--2xl) | 32px |
| `--space-3xl` | var(--3xl) | 40px |
| `--space-4xl` | var(--4xl) | 48px |
| `--space-5xl` | var(--5xl) | 56px |
| `--space-6xl` | var(--6xl) | 64px |
| `--space-7xl` | var(--7xl) | 72px |
| `--space-8xl` | var(--8xl) | 80px |
| `--space-9xl` | var(--9xl) | 88px |
| `--space-10xl` | var(--10xl) | 96px |
| `--space-11xl` | var(--11xl) | 104px |
| `--space-12xl` | var(--12xl) | 112px |
| `--space-13xl` | var(--13xl) | 120px |
| `--space-14xl` | var(--14xl) | 160px |

### Section Spacing

Vertical rhythm tokens for macro-level section padding.

| Token | Value | px Equivalent |
| --- | --- | --- |
| `--section-xs` | var(--space-xl) | 24px |
| `--section-s` | var(--space-2xl) | 32px |
| `--section-m` | var(--space-6xl) | 64px |
| `--section-l` | var(--space-10xl) | 96px |
| `--section-xl` | var(--space-14xl) | 160px |

---

## Borders

### Border Widths

Available thickness values for the composable border system.

| Token | Value | Description |
| --- | --- | --- |
| `--border-s` | 1.5px | Default/thin border |
| `--border-m` | 2px | Medium border |
| `--border-l` | 4px | Thick/accent border |

### Border Composition

Default values applied when using structural border classes like `.border` or `.border-top`.

| Token | Value | Description |
| --- | --- | --- |
| `--border-width` | var(--border-s) | Default border width |
| `--border-style` | solid | Default border style |
| `--border-color` | var(--border-primary) | Default border color |

### Border Radius

Rounding scale from subtle corners to fully rounded pills.

| Token | Value | Description |
| --- | --- | --- |
| `--radius-xs` | 4px | Subtle rounding |
| `--radius-s` | 6px | Small rounding |
| `--radius-m` | 10px | Medium rounding |
| `--radius-l` | 16px | Large rounding |
| `--radius-xl` | 24px | Extra-large rounding |
| `--radius-pill` | 999px | Fully rounded / pill shape |
