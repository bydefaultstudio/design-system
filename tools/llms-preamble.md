# BrandOS Design System

> Complete design token, layout, component, and CSS reference for By Default Studio's BrandOS platform. Use this as your authoritative guide for generating on-brand HTML and CSS.

## Read This First

Before generating any code:

1. **Use the layout hierarchy** — every page section follows `section > .padding-global > .container-* > .block`. Skipping levels is a bug.
2. **Use semantic tokens, never primitives** — `var(--text-primary)`, not `var(--neutral-800)`; `var(--background-faded)`, not `var(--off-white)`.
3. **Use existing components and utilities first** — `.button`, `.card`, `.callout`, `.badge`, `.gap-*`, `.top-*`, `.bottom-*`, `.padding-*`, `.border-*`. Only write new CSS if the design system can't express the requirement.
4. **Light mode is the default.** Dark mode is opt-in via `data-theme="dark"` on a container — never component-level.
5. **Follow the standards** — HTML rules live in the Layout System and Component Conventions sections below. CSS rules live in the CSS Conventions section. JS rules live in the JavaScript Conventions section. Read them before writing code, not after.

## HTML Skeleton

Every page section uses this exact structure. Copy-paste, then fill in the block.

```html
<section class="top-large bottom-large">
  <div class="padding-global">
    <div class="container-medium">
      <div class="block gap-m">
        <h2>Heading</h2>
        <p>Body text</p>
      </div>
    </div>
  </div>
</section>
```

- `section` owns macro vertical spacing via `.top-*` / `.bottom-*`
- `.padding-global` owns horizontal padding — never put padding on the section or container
- `.container-*` owns width and centring — never put padding on it
- `.block` owns internal spacing via `gap-*` — never put margins on its children

## Semantic HTML

- `<button>` for actions, `<a href>` for navigation. Never the reverse, never `<div onclick>`.
- Icon-only buttons need `aria-label`.
- Icons must be wrapped: `<div class="svg-icn" data-icon="name"></div>` — never bare `<svg>`, `<span>`, or `<img>`. Brand icons only.
- Use the page template at `templates/page-template.html` as the starting point for new pages — it includes the required SEO meta tags.

## Theme Defaults

- **Default is light mode.** Never apply dark mode unless explicitly told to.
- Dark mode values (e.g. `#1a1a1a`, `#e8e6e3`) are overrides applied via `[data-theme="dark"]` — they are not defaults. Do not use them as primary values.
- Dark mode is enabled by setting `data-theme="dark"` on a container element (typically `<html>`, but it can be scoped to any wrapper). Tokens inherit through the cascade — never write component-level dark mode CSS.
- **If a screenshot shows a dark UI alongside a light-default design system, ask which theme is intended before generating any code.** Do not infer theme from visuals.

## Never Hardcode Values

The design system has two sets of colour values — light and dark. Hardcoding either set breaks theming.

```css
/* Never */
background: #1a1a1a;
color: #e8e6e3;

/* Always */
background: var(--background-primary);
color: var(--text-primary);
```

The same applies to spacing, typography, borders, and radii — every visual value must reference a token from the Design Tokens section below.

## Do Not

- Apply dark mode by default — light mode is the default unless explicitly requested
- Infer theme from a screenshot — if it looks dark, ask before generating code
- Hardcode hex, pixel, or raw font values that should use tokens
- Use primitive color tokens directly (e.g., `--green`, `--neutral-800`, `--off-white`)
- Use inline styles (the styleguide demo files are the only exception)
- Use external icon libraries (Font Awesome, Material Design, Heroicons, etc.) — only brand SVG icons
- Add margins inside blocks — blocks use `gap` for internal spacing
- Add spacing directly to containers or sections — section uses `.top-*` / `.bottom-*`, padding lives on `.padding-global`
- Use spacer divs
- Invent new class naming patterns — follow `.component-name` / `.component-name--modifier` / `.is-state`
- Skip layout-hierarchy levels — never put a `.block` directly inside a `<section>`
- Write component-level dark mode CSS — `[data-theme="dark"]` handles it via tokens

---
