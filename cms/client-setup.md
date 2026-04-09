---
title: "Client Setup"
subtitle: "Setting up a new client environment"
description: "Complete guide to creating client folders, themes, logos, and user accounts."
section: "Docs"
subsection: "Site Management"
order: 2
status: "published"
access: "admin"
client: "internal"
---

This guide covers how to set up a new client environment from scratch. When a client user logs in, the system automatically loads their theme, swaps the logo, updates the home link, and filters the sidebar navigation.

---

## What Clients See

When a client logs in, the following elements personalise automatically:

| Element | Default (team/admin) | Client |
|---------|---------------------|--------|
| **Logo** | By Default | Client logo from `client-name/assets/` |
| **Home link** | `index.html` | `client-name/index.html` |
| **Theme** | By Default brand | Client `theme.css` |
| **Fonts** | Inclusive Sans + RecifeText | Per `theme-config.js` |
| **Sidebar** | Full navigation | Auto-filtered by page access |

All of this is driven by the user's `clientFolder` value in Netlify Identity.

---

## Quick Checklist

1. Copy `cms/clients/client-template/` to `cms/clients/your-client/`
2. Update `cms/clients/your-client/_defaults.md` with `access: "client:your-client"`
3. Add client logos to `cms/clients/your-client/assets/` (`logo.svg`, `logo-small.svg`)
4. Customise `cms/clients/your-client/assets/theme.css`
5. Register the theme in `assets/js/theme-config.js`
6. Grant tool access: add `your-client` to `toolAccess` in relevant `cms/*.md` files
7. Create a Netlify Identity user with the client role
8. Run `npm run docgen` and test in dev mode

Each step is explained in detail below.

---

## Step 1: Create the Client Folder

Copy the `cms/clients/client-template/` folder and rename it to the client name. Use lowercase, hyphenated names.

```
cp -r cms/clients/client-template/ cms/clients/your-client/
```

The source folder contains:

```
cms/clients/your-client/
  _defaults.md    — Access control defaults
  assets/
    theme.css     — Design system token overrides
    logo.svg      — Client header logo (desktop)
    logo-small.svg — Compact logo variant (mobile)
  welcome.md      — Welcome page (optional)
```

On build, the generator copies the `assets/` folder to the output directory and generates HTML pages alongside it.

You also need to copy the static `brand-book.html` from the output template:

```
cp client-template/brand-book.html your-client/brand-book.html
```

**After copying**, find and replace `[Client Name]` in `brand-book.html` with the actual client name. Update `data-access="client:client-template"` to `data-access="client:your-client"` on the `<body>` tag.

### Set up access defaults

Update `cms/clients/your-client/_defaults.md`:

```yaml
---
access: "client:your-client"
---
```

This ensures all pages generated for this client are scoped to their access level.

---

## Step 2: Add Client Logos

Logo files live in the client source folder with fixed names:

```
cms/clients/your-client/assets/logo.svg        — Full header logo (desktop)
cms/clients/your-client/assets/logo-small.svg   — Compact variant (mobile, future use)
```

The generator copies these to `your-client/assets/` on build.

### Logo requirements

- **Format:** SVG
- **Sizing:** The container is 50px tall (desktop) / 45px tall (mobile). Width scales automatically. A wide aspect ratio (roughly 2:1) works best.
- **Colour:** Use fixed colours or `currentColor` if you want the logo to adapt to the theme's text colour and dark mode.
- **Cleanup:** Run logos through the SVG Cleaner before adding them:

```bash
node assets/js/svg-clean.js --strip-comments --size -o cms/clients/your-client/assets/logo.svg <<'SVGEOF'
<svg>...paste logo SVG here...</svg>
SVGEOF
```

### How it works

When a client logs in, `theme-loader.js` fetches the logo from `your-client/assets/logo.svg` and injects it into the header. When an admin previews a theme, the logo swaps too. When the theme is unloaded, the original By Default logo is restored.

---

## Step 3: Customise the Theme

Open `cms/clients/your-client/assets/theme.css` and update the token values to match the client's brand.

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
- `--status-*-bg` — background tints derived from lighter accent primitives, used by callouts and badges
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
  css: 'your-client/assets/theme.css',
  fonts: 'https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap',
  pages: [
    { title: 'Home', href: 'your-client/index.html' },
    { title: 'Brand Book', href: 'your-client/brand-book.html' }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| **key** | Yes | Must match the `clientFolder` value in Netlify Identity |
| **label** | Yes | Display name shown in the admin theme switcher |
| **css** | Yes | Path to the theme CSS file in the output (relative to site root) |
| **fonts** | No | Google Fonts URL. Set to `null` if using local fonts or the default fonts |
| **pages** | Yes | Manually-defined pages (index, brand-book). Generated pages are added by docgen |

**Note:** Tool access is NOT configured here. It is controlled via `toolAccess` in `cms/*.md` frontmatter. See the Access Control docs for details.

### Google Fonts

If the client uses Google Fonts, the URL goes in the `fonts` field. The theme loader injects the font `<link>` tag dynamically — you do not need to add it to any HTML file.

If using local fonts instead, define them with `@font-face` in the theme CSS file and set `fonts: null` in the config.

---

## Step 5: Create the Netlify Identity User

In the Netlify Identity dashboard, create a new user and add their client name as a **role tag** (e.g. `your-client`). The system automatically recognises non-hierarchy role tags as client folder names.

You can also add `client` as a second tag for clarity, but it's not required — a single tag like `your-client` is sufficient.

| Tag | Required? | Purpose |
|-----|-----------|---------|
| `your-client` | Yes | Maps to the client folder name, theme config key, and logo filename |
| `client` | Optional | Explicitly sets the access level (auto-inferred if omitted) |

The client name tag is the single identifier that ties everything together:
- Theme CSS: `your-client/assets/theme.css`
- Logo: `your-client/assets/logo.svg`
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

## Creating from Template — Full Walkthrough

Here is the complete workflow for adding a new client called "acme":

```bash
# 1. Copy the client source template
cp -r cms/clients/client-template/ cms/clients/acme/

# 2. Clean and add logos
node assets/js/svg-clean.js --strip-comments --size \
  -o cms/clients/acme/assets/logo.svg <<'SVGEOF'
<svg>...paste full logo...</svg>
SVGEOF

node assets/js/svg-clean.js --strip-comments --size \
  -o cms/clients/acme/assets/logo-small.svg <<'SVGEOF'
<svg>...paste small logo...</svg>
SVGEOF
```

Then manually:

3. Copy and edit `acme/brand-book.html` — replace `[Client Name]` with "Acme" and update `data-access` to `client:acme`
4. Edit `cms/clients/acme/assets/theme.css` — uncomment and set brand colours and fonts
5. Update `cms/clients/acme/_defaults.md`:
   ```yaml
   ---
   access: "client:acme"
   ---
   ```
6. Edit `cms/clients/acme/welcome.md` if needed
7. Add to `assets/js/theme-config.js`:
   ```js
   'acme': {
     label: 'Acme',
     css: 'acme/assets/theme.css',
     fonts: 'https://fonts.googleapis.com/css2?family=...',
     pages: [
       { title: 'Home', href: 'acme/index.html' },
       { title: 'Brand Book', href: 'acme/brand-book.html' }
     ]
   }
   ```
8. Grant tool access — edit the tool markdown files to include `acme`:
   - `cms/calculator-docs.md` → add `acme` to `toolAccess` if needed
   - `cms/display-ad-preview-docs.md` → change `toolAccess: "client:dianomi,client-template"` to `toolAccess: "client:dianomi,client-template,acme"`
   - Update the matching `data-access` on `tools/display-ad-preview.html`
9. Run `cd cms/generator && npm run docgen`
10. In Netlify Identity, create a user with:
    ```json
    { "roles": ["client"], "clientFolder": "acme" }
    ```
11. Test in dev mode

---

## Architecture Reference

| File | Purpose |
|------|---------|
| `assets/js/theme-config.js` | Registry of available themes (maps `clientFolder` to CSS, fonts, label, pages) |
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
  → Swaps logo to clientFolder/assets/logo.svg
  → Loads clientFolder/assets/theme.css (if registered in theme-config.js)
  → Injects Google Fonts link (if specified in theme-config.js)
  → Auth filters sidebar navigation by access level
  → Page renders with full client branding
```
