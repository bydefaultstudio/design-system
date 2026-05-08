---
title: "Setup"
subtitle: "Getting started with this template"
description: "Guide to customizing this project template for your new project."
author: "Studio"
section: "Docs"
layer: "app"
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
- `var(--off-white)`, `var(--warm-black)`, etc. — Your palette colours
- `var(--green)`, `var(--red)`, `var(--blue)`, etc. — Your accent colours
- `var(--font-primary)`, `var(--font-secondary)`, `var(--font-tertiary)`, `var(--font-quaternary)` — Your fonts

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
- `var(--font-primary)` — Your primary font family
- `var(--font-secondary)` — Your secondary font family (if used)
- `var(--font-tertiary)` — Your tertiary brand display font (if used)
- `var(--font-quaternary)` — Your monospace font (if used)

**Also update:**
- `@font-face` declarations in `assets/css/design-system.css` if swapping self-hosted fonts
- Adobe Typekit link in `cms/generator/template.html` and `templates/page-template.html` if changing the secondary font
- `googleFontsUrl` in `cms/docs.config.js` if the project uses Google Fonts for client themes

---

## Logo

Replace the logo files in `assets/images/logos/bydefault/`. There are six variants — three marks (primary, primary-centered, avatar) each with a black and a white version. See [Logo](/brand/logo.html) for the full file reference.

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

## Local Development (Netlify Functions)

Forms (`feedback`, `new-campaign`, `new-proposal`, `access-support`) post to `/api/submit-form`, which is rewritten in `netlify.toml` to a Netlify Function that writes to Notion. To exercise that path locally, run **Netlify Dev** instead of a static server — it runs the Functions in `netlify/functions/` and proxies them through `/api/*`.

VSCode Live Server (port 5501) is static-only, so any POST to `/api/*` returns 405. Use port 8888 (Netlify Dev) for any form testing.

### One-time setup

1. `npm install` — installs `netlify-cli` (~200 MB; first install takes 30–90 s).
2. `npx netlify login` — browser flow.
3. `npx netlify link` — choose the existing `bydefault.design` site. This is what lets `netlify dev` pull production env vars into your local session.
4. `npx netlify env:list` — confirm the five keys: `NOTION_API_KEY`, `NOTION_DATABASE_ID_NEW_CAMPAIGN`, `NOTION_DATABASE_ID_NEW_PROPOSAL`, `NOTION_DATABASE_ID_FEEDBACK`, `NOTION_DATABASE_ID_ACCESS_SUPPORT`. See `.env.example` for the canonical list.

### Each session

```bash
npm run dev
```

Opens `http://localhost:8888` with Functions live. Netlify Dev loads the **Local development (Netlify CLI)** context for env vars, so `NOTION_API_KEY` and the four `NOTION_DATABASE_ID_*` keys must be populated in that context on the Netlify dashboard. Submitting any form writes a real row to the production Notion database — there is no separate dev database, so test submissions are visible to the team.

---

## Quick Checklist

- [ ] Update brand colors in `assets/css/design-system.css` (Brand Tokens section)
- [ ] Update font families in `assets/css/design-system.css` (Brand Tokens section)
- [ ] Replace logos in `assets/images/logos/bydefault/`
- [ ] Fill in `PROJECT_BRIEF.md`
- [ ] Update font loading (Typekit link in templates, `@font-face` in design-system.css)
- [ ] Set up client theme (if applicable) — see [Client Theming](#client-theming)
- [ ] Review and customize documentation
- [ ] Run `npm run dev` to test forms locally on http://localhost:8888

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
docs-site.css               →  Uses semantic tokens (gets themed values)
themes/client.css           →  Overrides tokens + component styles (must load last)
```

### Stylesheet load order

Theme CSS **must always load after** all other stylesheets (`design-system.css`, `docs-site.css`). This ensures theme overrides win via the CSS cascade — no `!important` needed.

```html
<!-- 1. Design System Framework -->
<link rel="stylesheet" href="../assets/css/design-system.css" />
<!-- 2. Adobe Typekit + font preloads -->
...
<!-- 3. Docs-site styles (layout, nav, page chrome, components, auth) -->
<link rel="stylesheet" href="../assets/css/docs-site.css">
<!-- 4. Client Theme Override (must load last to override base styles) -->
<link rel="stylesheet" href="theme.css">
```

When overriding component styles (not just tokens), match the specificity of the base selector. For example, `docs-site.css` uses `.svg-logo.nav-logo` — so the theme should use `.svg-logo.nav-logo`, not just `.nav-logo`.

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
| **Typography** | `var(--font-primary)`, `var(--font-secondary)`, `var(--font-tertiary)`, `var(--font-quaternary)` | Client fonts (add `@font-face` too) |
| **Neutral scale** | `var(--neutral-50)` through `var(--neutral-990)` | Generic grey ramp (uncommented by default) |
| **Text** | `var(--text-primary)`, `var(--text-secondary)`, `var(--text-accent)`, `var(--text-link)`, `var(--text-inverted)` | Core text colours |
| **Backgrounds** | `var(--background-primary)`, `var(--background-secondary)` | Surface colours |
| **Borders** | `var(--border-primary)`, `var(--border-secondary)` | Border colours |
| **Buttons** | `var(--button-primary)`, `var(--button-text)` | Button colours |
| **Accent** | `var(--status-info)`, `var(--input-focus)`, `var(--checkbox-selected)` | Accent colour used across UI |

Tokens like `var(--text-faded)`, `var(--background-faded)`, and `var(--border-faded)` use alpha transparency and generally work across any theme without overriding. Callout tokens derive from status colours via `color-mix()` and update automatically.

### Dark mode

The theme template includes a commented-out `[data-theme="dark"]` block. Uncomment and customise it to theme dark mode. Also duplicate the values inside the `@media (prefers-color-scheme: dark)` fallback for users without JavaScript.

### Admin theme preview

Admins see a **Theme Preview** section in the header dropdown menu. Selecting a theme loads it immediately and persists across page navigation (via `sessionStorage`). Selecting "By Default" unloads the theme. The preview resets when the browser tab is closed.

### Architecture

| File | Purpose |
|------|---------|
| `assets/js/theme-config.js` | Registry of available themes (clientFolder → CSS path + optional font URL) |
| `assets/js/theme-loader.js` | Loads/unloads theme CSS and fonts dynamically |
| `assets/js/auth.js` | Calls `initThemeForUser()` after auth resolves |
| `themes/theme-template.css` | Starter template for new client themes |

---

## Next Steps

1. Start building your project in the `src/` directory
2. Use the templates in `templates/` folder for new components
3. Follow the coding standards in the documentation
4. Keep documentation updated as you build

