---
title: "Documenting Components"
subtitle: "How to write component documentation for humans and AI"
description: "Standard structure and rules for writing component markdown files that serve both human developers and AI tools."
author: "Studio"
section: "Docs"
layer: "app"
subsection: "Code Standards"
order: 4
status: "published"
access: "team"
client: "internal"
---

## Purpose

Component docs serve two audiences:

1. **Humans** — designers and developers who need to know how to USE the component: what variants exist, what HTML to write, what combinations work, accessibility rules
2. **AI tools** — reading `llms-full.txt` and need to know how the component is BUILT: what CSS properties it uses, what tokens it references, what selectors exist

The docs lead with human usage and end with CSS implementation. This standard defines the section order, what goes in each, and when sections are required.

---

## Section order

Every component markdown file follows this structure:

```
---
frontmatter
---

# Component Name                           REQUIRED

## Anatomy                                 IF has data-* axes

## Basic usage                             REQUIRED

## [Variants / Features]                   IF has variants

## [Composition / Grouping]                IF has group pattern

## [Semantic guidance]                     IF element choice matters

## JavaScript                              IF requires JS

## Accessibility                           REQUIRED

## Usage rules                             REQUIRED

## CSS reference                           REQUIRED
```

---

## What goes in each section

### Intro (no heading — paragraph after `# Component Name`)

One paragraph: what the component is, when to use it, what base class is required.

- Always mention the base class: "The `.badge` class is required."
- If the component has no custom class (bare HTML elements like `code`, `mark`), say so.
- If the component uses `data-*` attributes, name them here.

### Anatomy

Required for components with more than one axis of variation. Include a table:

| Axis | Mechanism | Example |
|---|---|---|
| Colour | `data-color` | `data-color="success"` |
| Type | `data-type` | `data-type="info"` |

Below the table, one sentence stating whether the component uses component tokens or references system tokens directly.

Omit for simple components with no variation axes (breadcrumb, code, table, mark).

### Basic usage

One demo preview + one HTML code block showing the simplest valid instance. If the component requires a wrapper (`<nav>` for breadcrumb, `.table-scroll` for tables), show it here.

### Variants / Features

One `##` section per axis of variation or distinct feature. Each section: short description, demo preview, HTML code block.

For components with many variants of the same axis (e.g. all 5 colour options), group them under one heading with sub-examples.

Name sections after what they control: "Variants", "Sizes", "Colour", "Types", "Icon-only", "Full width", "Dismissible tag", etc.

For complex components, show composition examples — how axes combine: "Sizes compose with variants."

### Composition / Grouping

Only when the component has a dedicated container pattern (`.button-group`, `.tag-group`). Demo + HTML for the group wrapper.

### Semantic guidance

Only when element choice matters. Example: "Buttons vs links" in button docs — explaining when to use `<button>` vs `<a class="button">`.

### JavaScript

Only when the component requires JS. State which script file to include and describe the JS API if one exists.

### Accessibility

Required for all. Bullet list using imperative language:

- "Must include `aria-label`" — not "Consider adding"
- Focus behaviour, screen reader considerations, keyboard requirements

### Usage rules

Required for all. Do/Don't format, 3-5 items per list. Focus on decisions, not mechanics.

### CSS reference

Required for all. This is the AI-targeted section. Start with: *"This section documents how the component is built. For usage, see the sections above."*

Content depends on whether the component has its own tokens.

---

## CSS reference: two tiers

### Components WITH component tokens

Components that define `--component-*` custom properties (button, dropdown, dialog, form, tabs, progress, tooltip, toggle, rating):

```markdown
### Tokens

| Token | Default | What it controls |
|---|---|---|
| `--button-color` | `var(--text-primary)` | Identity colour — feeds bg, border, variant text |

### Selectors

| Selector | Purpose |
|---|---|
| `.button` | Base component |
| `.button[data-variant="outline"]` | Outline variant |

### Key rules

Hover (filled): `opacity: 0.9`.
Colour cascade: `data-color` sets `--button-color`, all variants read from it.
```

### Components WITHOUT component tokens

Components that reference system tokens directly (badge, tag, callout, toast, card, breadcrumb, code, mark, table):

```markdown
### Styling

| Property | Value |
|---|---|
| Background | `var(--background-darker)` |
| Font size | `var(--font-2xs)` |
| Padding | `var(--space-2xs) var(--space-s)` |

### Selectors

| Selector | Purpose |
|---|---|
| `.badge` | Base component |
| `.badge[data-color="success"]` | Success colour variant |
```

---

## Complexity tiers

| Section | Complex | Medium | Simple |
|---|---|---|---|
| Intro | Required | Required | Required |
| Anatomy | Required | If has data-* | Omit |
| Basic usage | Required | Required | Required |
| Variants | Required (multiple) | As needed | If modifiers exist |
| Composition | If applicable | If applicable | Omit |
| Semantic guidance | Required | If applicable | Omit |
| JavaScript | If has JS | If has JS | Omit |
| Accessibility | Required | Required | Required |
| Usage rules | Required | Required | Required |
| CSS reference | Full (tokens + selectors + key rules) | Styling + selectors | Styling table |

**Complex:** button, dropdown, dialog, form
**Medium:** badge, tag, callout, toast, tabs, tooltip, progress, disclosure
**Simple:** card, breadcrumb, table, code, mark

---

## Frontmatter requirements

Every component doc must include:

```yaml
---
title: "Component Name"
subtitle: "Short description"
description: "One-sentence description for meta tags"
author: "Studio"
section: "Design System"
layer: "core"           # or "foundation", "docs-site", "app"
subsection: "Category"  # e.g. "Feedback", "Data Entry", "Navigation"
order: 1
status: "published"
access: "team"
client: "internal"
---
```

The `layer` field determines whether the component appears in the portable design system (`foundation`, `core`) or is specific to BrandOS (`docs-site`, `app`).

---

## Heading consistency

Use these exact heading names:

- `## Accessibility` — not "Accessibility notes"
- `## Usage rules` — not "Do / Don't" or "Rules"
- `## CSS reference` — not "Tokens", "Styling", or "How it's built"
- `## Basic usage` — not "Usage" or "Getting started"
