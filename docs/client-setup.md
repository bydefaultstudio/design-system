---
title: "Client Setup"
subtitle: "Setting up a new client environment"
description: "Complete guide to creating client folders, themes, logos, and user accounts."
section: "Admin"
order: 2
access: "admin"
---

This guide covers how to set up a new client environment from scratch. When a client user logs in, the system automatically loads their theme, swaps the logo, updates the home link, and filters the sidebar navigation.

---

## What Clients See

When a client logs in, the following elements personalise automatically:

| Element | Default (team/admin) | Client |
|---------|---------------------|--------|
| **Logo** | By Default | Client logo from `assets/images/logos/` |
| **Home link** | `index.html` | `client-name/index.html` |
| **Theme** | By Default brand | Client `theme.css` |
| **Fonts** | Inclusive Sans + RecifeText | Per `theme-config.js` |
| **Sidebar** | Full navigation | Auto-filtered by page access |

All of this is driven by the user's `clientFolder` value in Netlify Identity.

---

## Quick Checklist

1. Copy the `blank/` folder to `your-client/`
2. Add client logos to `assets/images/logos/`
3. Customise `your-client/theme.css`
4. Register the theme in `assets/js/theme-config.js`
5. Create a Netlify Identity user with the client role
6. Test in dev mode

Each step is explained in detail below.

---

## Step 1: Create the Client Folder

Copy the `blank/` folder and rename it to the client name. Use lowercase, hyphenated names.

```
cp -r blank/ your-client/
```

The folder contains three files:

```
your-client/
  index.html      — Client homepage (brand guidelines landing page)
  brand-book.html — Full component showcase (typography, buttons, forms, etc.)
  theme.css       — Design system token overrides
```

**After copying**, find and replace `[Client Name]` in both HTML files with the actual client name:
- Page titles (`<title>`)
- Eyebrow text
- Heading text
- Footer text

---

## Step 2: Add Client Logos

Logo files live in `assets/images/logos/` with a fixed naming convention:

```
assets/images/logos/your-client.svg        — Full header logo (desktop)
assets/images/logos/your-client-small.svg  — Compact variant (mobile, future use)
```

The filename must match the client folder name exactly.

### Logo requirements

- **Format:** SVG
- **Sizing:** The container is 50px tall (desktop) / 45px tall (mobile). Width scales automatically. A wide aspect ratio (roughly 2:1) works best.
- **Colour:** Use fixed colours or `currentColor` if you want the logo to adapt to the theme's text colour and dark mode.
- **Cleanup:** Run logos through the SVG Cleaner before adding them:

```bash
node svg-cleaner/svg-clean.js --strip-comments --size -o assets/images/logos/your-client.svg <<'SVGEOF'
<svg>...paste logo SVG here...</svg>
SVGEOF
```

### How it works

When a client logs in, `theme-loader.js` replaces the By Default inline SVG with an `<img>` tag pointing to the client's logo file. When an admin previews a theme, the logo swaps too. When the theme is unloaded, the original By Default logo is restored.

---

## Step 3: Customise the Theme

Open `your-client/theme.css` and update the token values to match the client's brand.

### What to override

The theme file groups tokens by concern. Only uncomment and change what differs from the default:

| Category | Tokens | Purpose |
|----------|--------|---------|
| **Typography** | `--font-primary`, `--font-secondary`, `--font-tertiary` | Client fonts (add `@font-face` if using local fonts) |
| **Neutral scale** | `--neutral-50` through `--neutral-990` | Grey ramp (uncommented by default with pure greys) |
| **Text** | `--text-primary`, `--text-secondary`, `--text-accent`, `--text-link`, `--text-inverted` | Core text colours |
| **Backgrounds** | `--background-primary`, `--background-secondary` | Surface colours |
| **Borders** | `--border-primary`, `--border-secondary` | Border colours |
| **Buttons** | `--button-primary`, `--button-text`, `--button-secondary`, `--button-secondary-text` | Button colours |
| **Accent** | `--status-info`, `--input-focus`, `--checkbox-selected` | Accent colour used across UI |

### Tokens you usually don't need to override

- `--text-faded`, `--background-faded`, `--border-faded` — use alpha transparency, work across any theme
- `--callout-*` — derived from status colours via `color-mix()`, update automatically
- `--selection-*` — selection highlight, inherits from primary tokens

### Dark mode

The theme template includes a commented-out `[data-theme="dark"]` block. Uncomment and customise it to theme dark mode. Also duplicate the values inside the `@media (prefers-color-scheme: dark)` fallback for users without JavaScript.

### How it works

The theme CSS file is loaded dynamically by `theme-loader.js` after the design system CSS. It overrides CSS custom properties, and the entire site updates automatically. The theme file is never hardcoded in the HTML — it is injected as a `<link>` tag by JavaScript based on the user's identity.

---

## Step 4: Register the Theme

Add an entry to `assets/js/theme-config.js`:

```js
'your-client': {
  label: 'Your Client',
  css: 'your-client/theme.css',
  fonts: 'https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap'
}
```

| Field | Required | Description |
|-------|----------|-------------|
| **key** | Yes | Must match the `clientFolder` value in Netlify Identity |
| **label** | Yes | Display name shown in the admin theme switcher |
| **css** | Yes | Path to the theme CSS file (relative to site root) |
| **fonts** | No | Google Fonts URL. Set to `null` if using local fonts or the default fonts |

### Google Fonts

If the client uses Google Fonts, the URL goes in the `fonts` field. The theme loader injects the font `<link>` tag dynamically — you do not need to add it to any HTML file.

If using local fonts instead, define them with `@font-face` in the theme CSS file and set `fonts: null` in the config.

---

## Step 5: Create the Netlify Identity User

In the Netlify Identity dashboard, create a new user and set their `app_metadata`:

```json
{
  "roles": ["client"],
  "clientFolder": "your-client"
}
```

| Field | Value | Purpose |
|-------|-------|---------|
| `roles` | `["client"]` | Grants client-level access (can view `client` and `public` pages) |
| `clientFolder` | `"your-client"` | Maps to the client folder name, theme config key, and logo filename |

The `clientFolder` value is the single identifier that ties everything together:
- Theme CSS: `your-client/theme.css`
- Logo: `assets/images/logos/your-client.svg`
- Home link: `your-client/index.html`
- Page access: restricted to `your-client/` folder + shared tool pages

---

## Step 6: Test in Dev Mode

On localhost, the dev toolbar lets you switch roles without logging in.

### Test as client

1. Open `assets/js/auth-config.js`
2. Set `devMode.clientFolder` to your client name:
   ```js
   devMode: {
     defaultRole: 'client',
     email: 'dev@bydefault.studio',
     clientFolder: 'your-client'
   }
   ```
3. Open any page on localhost
4. Switch to the **client** role in the dev toolbar
5. Verify: logo swaps, home link updates, theme loads, sidebar filters

### Test as admin with theme preview

1. Set `devMode.defaultRole` back to `'admin'`
2. Open any page on localhost
3. Click the user icon in the header → open the dropdown
4. Under **Theme Preview**, select your client's theme
5. Verify: theme loads, logo swaps, persists across page navigation
6. Select **By Default** to unload the theme

---

## Creating from Blank — Full Walkthrough

Here is the complete workflow for adding a new client called "acme":

```bash
# 1. Copy the blank template
cp -r blank/ acme/

# 2. Clean and add logos
node svg-cleaner/svg-clean.js --strip-comments --size \
  -o assets/images/logos/acme.svg <<'SVGEOF'
<svg>...paste full logo...</svg>
SVGEOF

node svg-cleaner/svg-clean.js --strip-comments --size \
  -o assets/images/logos/acme-small.svg <<'SVGEOF'
<svg>...paste small logo...</svg>
SVGEOF
```

Then manually:

3. Edit `acme/index.html` and `acme/brand-book.html` — replace `[Client Name]` with "Acme"
4. Edit `acme/theme.css` — uncomment and set brand colours and fonts
5. Add to `assets/js/theme-config.js`:
   ```js
   'acme': {
     label: 'Acme',
     css: 'acme/theme.css',
     fonts: 'https://fonts.googleapis.com/css2?family=...'
   }
   ```
6. In Netlify Identity, create a user with:
   ```json
   { "roles": ["client"], "clientFolder": "acme" }
   ```
7. Test in dev mode

---

## Architecture Reference

| File | Purpose |
|------|---------|
| `assets/js/theme-config.js` | Registry of available themes (maps `clientFolder` to CSS, fonts, label) |
| `assets/js/theme-loader.js` | Loads/unloads theme CSS, fonts, logo, and home link dynamically |
| `assets/js/auth.js` | Calls `initThemeForUser()` after auth resolves |
| `assets/js/auth-config.js` | Role hierarchy, dev mode settings (including `clientFolder` for testing) |
| `themes/theme-template.css` | Standalone theme template (for themes not inside a client folder) |
| `blank/` | Blank client folder template (copy to create new clients) |

### Data flow

```
User logs in
  → auth.js resolves role + clientFolder from app_metadata
  → auth.js calls initThemeForUser(user)
  → theme-loader.js reads clientFolder
  → Sets home link to clientFolder/index.html
  → Swaps logo to assets/images/logos/clientFolder.svg
  → Loads clientFolder/theme.css (if registered in theme-config.js)
  → Injects Google Fonts link (if specified in theme-config.js)
  → Auth filters sidebar navigation by access level
  → Page renders with full client branding
```
