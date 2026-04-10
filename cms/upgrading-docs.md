---
title: "Upgrading the Docs Engine"
subtitle: "How to update the doc site across projects"
description: "Guide to upgrading the documentation engine without affecting project content."
author: "Studio"
section: "Docs"
layer: "app"
subsection: "Dev"
order: 3
status: "published"
access: "admin"
client: "internal"
---

The doc site is split into two parts: **content** (your markdown files) and the **engine** (the generator that turns them into HTML). They are kept separate so you can upgrade the engine — better mobile nav, new sidebar, restyled layout — without ever touching your content.

---

## What Stays Per-Project (Never Touch These)

| File/Folder | What it controls |
| --- | --- |
| `cms/*.md` | All documentation content |
| `cms/docs.config.js` | Design system path, fonts, footer text, index description |
| `assets/images/logos/` and `assets/icons/` | Logo (`logo.svg`) and favicons |

---

## What Gets Replaced on Upgrade

Everything inside `cms/generator/` is the engine. Replace this folder to upgrade.

Check `cms/generator/VERSION` to see which version a project is running.

---

## How to Upgrade a Project

1. Open the **Project Template** — this is always where engine improvements happen first
2. Copy the `cms/generator/` folder from the template
3. Paste it into the target project, replacing the existing `cms/generator/` folder
4. Open a terminal in the target project and run:

```bash
cd cms/generator
npm install
npm run docgen
```

5. Done — your markdown files, config, and images are untouched

---

## Customising a Project's Doc Site

Edit `cms/docs.config.js` in the project:

```js
module.exports = {
  // Path to design system CSS, relative from project root
  designSystemPath: '../../assets/css/design-system.css',

  // Brand tokens are now defined directly in design-system.css
  brandCssPath: null,

  // Google Fonts URL — set to null to disable
  googleFontsUrl: 'https://fonts.googleapis.com/...',

  // Footer copyright text
  footerText: '© 2025 Your Studio Name',

  // Description shown on the docs homepage
  indexDescription: 'Documentation for Project Name.',
};
```

Replace the logo by swapping the files in `assets/images/logos/bydefault/` (six variants: primary, primary-white, primary-centered, primary-centered-white, avatar, avatar-white).
Replace favicons by swapping `assets/icons/favicon.svg` and `assets/icons/favicon.ico`.

---

## Design System CSS Convention

The design system CSS lives at `assets/css/design-system.css` and includes brand tokens directly. Its path is referenced in `cms/docs.config.js` and used by every generated doc page.

**If the path is wrong or the file is missing**, every doc page will show a friendly amber banner at the top:

> Design system CSS not found. Check the path in `cms/docs.config.js` → `designSystemPath`, then re-run `npm run docgen`.

To fix it:
1. Confirm where your design system CSS lives
2. Update `designSystemPath` in `cms/docs.config.js`
3. Run `npm run docgen`

The banner disappears as soon as the CSS loads correctly.

---

## Doc Generator Commands

Run these from inside `cms/generator/`:

```bash
npm run docgen     # Generate HTML from markdown
npm run serve      # View locally in browser
npm run docwatch   # Auto-regenerate on markdown changes
npm run docfull    # Generate + serve + watch (all at once)
```

---

## When to Update the Template First

Always improve the engine in the **Project Template**, not in a live project. That way the improvement is available to all future projects and can be copied across to existing ones cleanly.
