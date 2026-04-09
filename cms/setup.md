---
title: "Setup"
subtitle: "Getting started with this template"
description: "Guide to customizing this project template for your new project."
section: "Docs"
subsection: "Dev"
order: 1
status: "published"
access: "admin"
client: "internal"
---

This template provides a solid foundation for new projects. Follow these steps to customize it for your project.

---

## Brand Colors

Update brand colors in `assets/css/design-system.css` under the **Brand Tokens** section at the top.

**What to change:**
- `--off-white`, `--warm-black`, etc. — Your palette colours
- `--green`, `--red`, `--blue`, etc. — Your accent colours
- `--font-primary`, `--font-secondary`, `--font-tertiary` — Your fonts

**Example:**
```css
/* assets/css/design-system.css — Brand Tokens section */
:root {
  --off-white: #fff7f1;
  --warm-black: #221f1c;
  --green: #167255;
}
```

---

## Fonts

Update font families in `assets/css/design-system.css` under the **Brand Tokens** section.

**What to change:**
- `--font-primary` — Your primary font family
- `--font-secondary` — Your secondary font family (if used)
- `--font-tertiary` — Your monospace font (if used)

**Also update:**
- Google Fonts link in `cms/docs.config.js` (if using Google Fonts)
- Google Fonts link in `design-system/index.html` (if using Google Fonts)
- Google Fonts link in `brand-book/index.html` (if using Google Fonts)

---

## Logo

Replace the logo image:
- `assets/images/logos/logo.svg` - Documentation site logo

---

## Project Brief

Fill in `PROJECT_BRIEF.md` with your project details:
- Replace all bracketed placeholders `[like this]` with actual content
- Define project goals, audience, and constraints

---

## Meta Tags & SEO

Update SEO meta tags in `cms/generator/template.html`:
- Update `<title>` template if needed
- Add Open Graph tags for social sharing
- Update favicon references if using custom favicons

---

## Documentation

The documentation is ready to use, but you may want to:
- Review and customize documentation content in `cms/` folder
- Update the index page description in `cms/generator/generate-docs.js`
- Add or remove documentation pages as needed

---

## Quick Checklist

- [ ] Update brand colors in `assets/css/design-system.css` (Brand Tokens section)
- [ ] Update font families in `assets/css/design-system.css` (Brand Tokens section)
- [ ] Replace logo in `assets/images/logos/logo.svg`
- [ ] Fill in `PROJECT_BRIEF.md`
- [ ] Update Google Fonts links (if applicable)
- [ ] Set up client theme (if applicable) — see [Client Theming](#client-theming)
- [ ] Review and customize documentation

---

## Client Theming

For client projects, use a **theme file** to override design system tokens without touching the design system CSS. Themes load dynamically based on the logged-in user's role and identity.

### How it works

The theme system uses the auth module to determine which theme to load:

- **Team members** see the By Default brand (no theme)
- **Client users** see their client-branded theme automatically (matched via `clientFolder` in Netlify Identity `app_metadata`)
- **Admins** see By Default by default, with a theme switcher in the header dropdown to preview any client theme

```
assets/css/design-system.css →  Brand primitives + semantic tokens
style.css                   →  Uses semantic tokens (gets themed values)
themes/client.css           →  Overrides tokens + component styles (must load last)
```

### Stylesheet load order

Theme CSS **must always load after** all other stylesheets (`design-system.css`, `style.css`). This ensures theme overrides win via the CSS cascade — no `!important` needed.

```html
<!-- 1. Design System Framework -->
<link rel="stylesheet" href="../assets/css/design-system.css" />
<!-- 2. Google Fonts -->
...
<!-- 3. Site styles (includes markdown content rendering) -->
<link rel="stylesheet" href="../assets/css/style.css">
<!-- 4. Client Theme Override (must load last to override base styles) -->
<link rel="stylesheet" href="theme.css">
```

When overriding component styles (not just tokens), match the specificity of the base selector. For example, `style.css` uses `.svg-logo.nav-logo` — so the theme should use `.svg-logo.nav-logo`, not just `.nav-logo`.

### Creating a theme

1. Copy `themes/theme-template.css` → `themes/client-name.css`
2. Uncomment and update the tokens you need to change
3. Register the theme in `assets/js/theme-config.js`:

```js
'client-name': {
  label: 'Client Name',
  css: 'themes/client-name.css',
  fonts: 'https://fonts.googleapis.com/css2?family=YourFont&display=swap'
}
```

4. In Netlify Identity, set the client user's `app_metadata`:

```json
{
  "roles": ["client"],
  "clientFolder": "client-name"
}
```

The `clientFolder` value must match the key in `theme-config.js`.

### What to override

The template groups tokens by concern. Only uncomment what differs from the default:

| Category | Tokens | Purpose |
|----------|--------|---------|
| **Typography** | `--font-primary`, `--font-secondary`, `--font-tertiary` | Client fonts (add `@font-face` too) |
| **Neutral scale** | `--neutral-50` through `--neutral-990` | Generic grey ramp (uncommented by default) |
| **Text** | `--text-primary`, `--text-secondary`, `--text-accent`, `--text-link`, `--text-inverted` | Core text colours |
| **Backgrounds** | `--background-primary`, `--background-secondary` | Surface colours |
| **Borders** | `--border-primary`, `--border-secondary` | Border colours |
| **Buttons** | `--button-primary`, `--button-text` | Button colours |
| **Accent** | `--status-info`, `--input-focus`, `--checkbox-selected` | Accent colour used across UI |

Tokens like `--text-faded`, `--background-faded`, and `--border-faded` use alpha transparency and generally work across any theme without overriding. Callout tokens derive from status colours via `color-mix()` and update automatically.

### Dark mode

The theme template includes a commented-out `[data-theme="dark"]` block. Uncomment and customise it to theme dark mode. Also duplicate the values inside the `@media (prefers-color-scheme: dark)` fallback for users without JavaScript.

### Admin theme preview

Admins see a **Theme Preview** section in the header dropdown menu. Selecting a theme loads it immediately and persists across page navigation (via `sessionStorage`). Selecting "By Default" unloads the theme. The preview resets when the browser tab is closed.

### Architecture

| File | Purpose |
|------|---------|
| `assets/js/theme-config.js` | Registry of available themes (clientFolder → CSS path + Google Fonts URL) |
| `assets/js/theme-loader.js` | Loads/unloads theme CSS and fonts dynamically |
| `assets/js/auth.js` | Calls `initThemeForUser()` after auth resolves |
| `themes/theme-template.css` | Starter template for new client themes |

---

## Next Steps

1. Start building your project in the `src/` directory
2. Use the templates in `templates/` folder for new components
3. Follow the coding standards in the documentation
4. Keep documentation updated as you build

