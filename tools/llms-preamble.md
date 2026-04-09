# BrandOS Design System

> Complete design token, layout, component, and CSS reference for By Default Studio's BrandOS platform. Use this as your authoritative guide for generating on-brand HTML and CSS.

## How to Use This Document

1. **Always use semantic tokens** (e.g., `var(--text-primary)`, `var(--background-faded)`), never primitive tokens directly (e.g., `--neutral-800`, `--green`).
2. **Follow the layout hierarchy**: `section > .padding-global > .container-* > .block` — never skip levels.
3. **Use existing components** (`.button`, `.card`, `.callout`, `.badge`, etc.) before creating custom markup.
4. **Use existing utility classes** (`.gap-*`, `.top-*`, `.bottom-*`, `.padding-*`, `.border-*`) instead of writing new CSS.
5. **Accessibility is required**: semantic HTML, keyboard navigation, `aria-label` where needed, focus states, `<button>` for actions, `<a>` for links.
6. **Dark mode is token-based**: set `data-theme="dark"` on `<html>` — never write component-level dark mode CSS; tokens handle it automatically.

## Do Not

- Use inline styles
- Use primitive color tokens directly (e.g., `--green`, `--neutral-800`)
- Use external icon libraries (Font Awesome, Material Design, Heroicons, etc.) — only brand SVG icons
- Add margins inside blocks — blocks use `gap` for internal spacing
- Add spacing directly to containers — sections control macro spacing
- Use spacer divs
- Invent new class naming patterns — follow `.component-name` / `.component-name--modifier` / `.is-state`
- Hardcode values that should use tokens (colors, spacing, typography, borders)

---
