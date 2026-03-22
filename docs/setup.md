---
title: "Setup"
subtitle: "Getting started with this template"
description: "Guide to customizing this project template for your new project."
section: "Project"
order: 1
---

This template provides a solid foundation for new projects. Follow these steps to customize it for your project.

---

## Brand Colors

Update brand colors in `brand-book/brand-book.css`.

The brand book defines raw brand tokens using the `--brand-` prefix. The design system reads these via `var(--brand-*, fallback)` — if no brand book is loaded, sensible defaults apply.

**What to change:**
- `--brand-color-accent` — Your primary brand accent colour
- `--brand-color-dark` — Your dark brand colour
- `--brand-color-light` — Your light brand colour

**Example:**
```css
/* brand-book/brand-book.css */
:root {
  --brand-color-accent: #0066cc;
  --brand-color-dark: #1a1a1a;
  --brand-color-light: #f5f5f5;
}
```

**Note:** The design system maps these into semantic tokens automatically. You do not need to touch `design-system/design-system.css` for brand colours.

---

## Fonts

Update font families in `brand-book/brand-book.css`.

**What to change:**
- `--brand-font-primary` — Your primary font family
- `--brand-font-secondary` — Your secondary font family (if used)
- `--brand-font-tertiary` — Your monospace font (if used)

**Also update:**
- Google Fonts link in `docs/docs.config.js` (if using Google Fonts)
- Google Fonts link in `design-system/index.html` (if using Google Fonts)
- Google Fonts link in `brand-book/index.html` (if using Google Fonts)

---

## Logo

Replace the logo image:
- `assets/images/logo.svg` - Documentation site logo

---

## Project Brief

Fill in `PROJECT_BRIEF.md` with your project details:
- Replace all bracketed placeholders `[like this]` with actual content
- Define project goals, audience, and constraints

---

## Meta Tags & SEO

Update SEO meta tags in `docs/generator/template.html`:
- Update `<title>` template if needed
- Add Open Graph tags for social sharing
- Update favicon references if using custom favicons

---

## Documentation

The documentation is ready to use, but you may want to:
- Review and customize documentation content in `docs/` folder
- Update the index page description in `docs/generator/generate-docs.js`
- Add or remove documentation pages as needed

---

## Quick Checklist

- [ ] Update brand colors in `brand-book/brand-book.css`
- [ ] Update font families in `brand-book/brand-book.css`
- [ ] Replace logo in `assets/images/logo.svg`
- [ ] Fill in `PROJECT_BRIEF.md`
- [ ] Update Google Fonts links (if applicable)
- [ ] Review and customize documentation

---

## Next Steps

1. Start building your project in the `src/` directory
2. Use the templates in `templates/` folder for new components
3. Follow the coding standards in the documentation
4. Keep documentation updated as you build

