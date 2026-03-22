---
title: "CSS"
subtitle: "CSS coding standards, organization, and commenting guidelines"
description: "Guide defining how CSS should be structured, organized, and commented for maintainability."
section: "Code"
order: 3
---

## Overview

This guide ensures:

- Readable, modular, and maintainable CSS
- Clear organization with related styles grouped together
- Easy navigation and long-term maintenance
- Consistent commenting hierarchy
- Logical file structure

---

## Organisation Principles

### Group Related Styles Together

**Always keep related styles adjacent:**

- All font sizes together
- All spacing utilities together
- All color tokens of the same type together
- All modifiers for the same component together
- All hover/active states immediately after their base class

**Example - Typography Grouping:**
```css
/* -- Headings -- */
h1 {
  font-size: var(--font-3xl);
  line-height: var(--line-height-s);
  font-weight: var(--font-weight-bold);
}
h2 {
  font-size: var(--font-2xl);
  line-height: var(--line-height-s);
  font-weight: var(--font-weight-bold);
}
/* All headings grouped together */
```

**Example - Component Grouping:**
```css
/* -- Button -- */
.button, button {
  padding: var(--space-s) var(--space-m);
  background: var(--background-primary);
  border: var(--border-s) solid var(--border-primary);
}
.button:hover {
  background: var(--background-secondary);
}
.button.is-outline {
  background: transparent;
}
/* All button-related styles together */
```
---

## Token Organisation

Use CSS custom properties (variables) for reusable values. Organize tokens logically:

**Example - Token Grouping:**
```css
:root {
  /* -- Unit tokens -- */
  --unit-s: 0.5rem;    /* 8px */
  --unit-m: 1rem;      /* 16px */

  /* -- Spacing scale -- */
  --space-s: var(--unit-s);
  --space-m: var(--unit-m);

  /* -- Typography tokens -- */
  --font-size-base: 1rem;
  --font-weight-bold: 700;
}
```

**Principles:**
- Group tokens by purpose (units, spacing, typography, colors)
- Use subsections to organize within `:root`
- Reference tokens when possible (e.g., `--space-m: var(--unit-m)`)
- Keep related tokens adjacent

---

## Component Organization

When writing component styles, follow this order:

1. **Base class first**
2. **States immediately after base** (hover, active, focus)
3. **Modifiers grouped together** (is-*, has-*)
4. **Sub-components after modifiers**

**Example:**
```css
/* -- Card -- */
.card {
  padding: var(--space-m);
  background: var(--background-primary);
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.card.is-compact {
  padding: var(--space-s);
}
/* All card-related styles together */
```

---

## Property Ordering for Readability

Group related properties together within a selector:

**Suggested order:**
1. Layout (display, position, grid, flex)
2. Box model (width, height, margin, padding)
3. Visual (background, border, box-shadow)
4. Typography (font, line-height, text-align)
5. Other (opacity, cursor, transition)

**Example:**
```css
.button {
  /* Layout */
  display: inline-flex;
  
  /* Box model */
  padding: var(--space-m) var(--space-l);
  
  /* Visual */
  background: var(--background-primary);
  border: var(--border-s) solid var(--border-primary);
  
  /* Typography */
  font-size: var(--font-m);
  font-weight: var(--font-weight-semi-bold);
}
```
**Note**: The comments above are for demonstration only. In actual code, the visual grouping is what matters, not the comments.

---

## Commenting Hierarchy

Use **three levels only**. Do not invent new formats.

### 1. Major Sections

Used for top‑level structure of the file.

**Format**
```css
/* ------ Section Title ------ */
```

**Rules**
- Always uppercase
- One line only
- Blank line before and after
- Use to mark major divisions in your CSS

**Example**
```css
/* ------ BASE STYLES ------ */

body {
  /* ... */
}
```

---

### 2. Subsections

Used to group related concepts inside a section.

**Format**
```css
/* -- Subsection name -- */
```

**Rules**
- Title case
- One line
- Use only when grouping related rules
- Blank line before

**Example**
```css
/* -- Headings -- */
h1 {
  /* ... */
}
h2 {
  /* ... */
}
```

---

### 3. Inline / Feature Comments

Used to clarify values or mark important behaviour.

**Format**
```css
/* Short clarification */
```

**Rules**
- Keep factual and brief
- Prefer same-line comments
- Do not explain obvious CSS

**Example**
```css
--unit-xs: 0.25rem; /* 4px */
```

---

## Responsive Code Organization

### Adding Breakpoints

When adding responsive breakpoints, follow these guidelines:

1. **Choose breakpoints that match your design** - Common breakpoints include:
   - Mobile: `768px` (max-width)
   - Tablet: `1024px` (max-width)
   - Desktop: `1440px` (min-width)

2. **Keep breakpoints consistent** - Use the same breakpoints throughout your project

3. **Group responsive code together** - Place all media queries in a dedicated section at the end of your file

**Example:**
```css
/* ------ RESPONSIVE ------ */

/* Mobile */
@media (max-width: 768px) {
  :root {
    --font-size-base: 0.875rem;
  }
  .card {
    padding: var(--space-s);
  }
}
```

### Organization

When organizing responsive code:

1. **Override tokens in `:root`** - Don't override individual classes when possible
2. **Group by token type** - Fonts together, spacing together
3. **Use subsections** - Clearly mark what's being overridden
4. **Always at the end** - Responsive code should come last in the file
5. **Comment breakpoints** - Label each breakpoint clearly (Mobile, Tablet, Desktop)

**Example:**
```css
/* ------ RESPONSIVE ------ */

/* Mobile */
@media (max-width: 768px) {
  :root {
    /* -- Mobile font sizes -- */
    --font-size-base: 0.875rem;
  }
  .card {
    padding: var(--space-s);
  }
}
```

### Best Practices

- Override tokens when possible, not individual classes
- Scale down proportionally
- Keep mobile values grouped by type
- Use clear subsection comments

---

## Rules to Follow

### Organization

- ✅ Group related styles together
- ✅ Keep all font-related styles in one place
- ✅ Keep all spacing utilities together
- ✅ Keep all color tokens of the same type together
- ✅ Place responsive code at the end
- ✅ Keep related properties together within selectors

### Commenting

- ✅ Use three-level commenting hierarchy
- ✅ Do not mix comment styles
- ✅ Do not skip levels
- ✅ Do not add decorative separators
- ✅ Prefer fewer comments over more
- ✅ Comments should help *find* things, not explain theory

### Code Quality

- ✅ Use design system tokens, over hardcode values
- ✅ Use semantic tokens over primitive tokens when possible
- ✅ Keep related properties together (e.g., all typography properties)
- ✅ Place states immediately after base classes
- ✅ Group modifiers together

### What to Avoid

- ❌ Scattering related styles across the file
- ❌ Mixing font sizes with spacing utilities
- ❌ Placing responsive code in the middle of sections
- ❌ Hardcoding values that should use tokens
- ❌ Using primitive tokens directly in layouts when semantic tokens exist
- ❌ Separating component states and modifiers from their base class

---

## Quick Reference

| Task | Rule |
|------|------|
| Add new token | Group with related tokens (colors with colors, spacing with spacing) |
| Add new utility class | Group with other utilities of the same type |
| Add new component | Group all related styles together (base, states, modifiers, sub-components) |
| Add responsive override | Place at end of file, override tokens when possible |
| Add modifier to component | Place immediately after component base class |
| Add state to component | Place immediately after base class, before modifiers |
