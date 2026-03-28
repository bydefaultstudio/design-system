---
title: "Upgrading the Docs Engine"
subtitle: "How to update the doc site across projects"
description: "Guide to upgrading the documentation engine without affecting project content."
section: "Project"
order: 5
access: "team"
---

The doc site is split into two parts: **content** (your markdown files) and the **engine** (the generator that turns them into HTML). They are kept separate so you can upgrade the engine — better mobile nav, new sidebar, restyled layout — without ever touching your content.

---

## What Stays Per-Project (Never Touch These)

| File/Folder | What it controls |
| --- | --- |
| `docs/*.md` | All documentation content |
| `docs/docs.config.js` | Design system path, brand book path, fonts, footer text, index description |
| `assets/images/` and `assets/icons/` | Logo (`logo.svg`) and favicons |

---

## What Gets Replaced on Upgrade

Everything inside `docs/generator/` is the engine. Replace this folder to upgrade.

Check `docs/generator/VERSION` to see which version a project is running.

---

## How to Upgrade a Project

1. Open the **Project Template** — this is always where engine improvements happen first
2. Copy the `docs/generator/` folder from the template
3. Paste it into the target project, replacing the existing `docs/generator/` folder
4. Open a terminal in the target project and run:

```bash
cd docs/generator
npm install
npm run docgen
```

5. Done — your markdown files, config, and images are untouched

---

## Customising a Project's Doc Site

Edit `docs/docs.config.js` in the project:

```js
module.exports = {
  // Path to design system CSS, relative from project root
  designSystemPath: '../../design-system/design-system.css',

  // Path to brand book CSS, relative from project root
  // Set to null to use framework defaults only
  brandCssPath: '../../brand-book/brand-book.css',

  // Google Fonts URL — set to null to disable
  googleFontsUrl: 'https://fonts.googleapis.com/...',

  // Footer copyright text
  footerText: '© 2025 Your Studio Name',

  // Description shown on the docs homepage
  indexDescription: 'Documentation for Project Name.',
};
```

Replace the logo by swapping `assets/images/logo.svg`.
Replace favicons by swapping `assets/icons/favicon.svg` and `assets/icons/favicon.ico`.

---

## Design System CSS Convention

The design system CSS lives at `design-system/design-system.css`. The brand book lives at `brand-book/brand-book.css`. Both paths are referenced in `docs/docs.config.js` and used by every generated doc page.

**If the path is wrong or the file is missing**, every doc page will show a friendly amber banner at the top:

> Design system CSS not found. Check the path in `docs/docs.config.js` → `designSystemPath`, then re-run `npm run docgen`.

To fix it:
1. Confirm where your design system CSS lives
2. Update `designSystemPath` in `docs/docs.config.js`
3. Run `npm run docgen`

The banner disappears as soon as the CSS loads correctly.

---

## Doc Generator Commands

Run these from inside `docs/generator/`:

```bash
npm run docgen     # Generate HTML from markdown
npm run serve      # View locally in browser
npm run docwatch   # Auto-regenerate on markdown changes
npm run docfull    # Generate + serve + watch (all at once)
```

---

## When to Update the Template First

Always improve the engine in the **Project Template**, not in a live project. That way the improvement is available to all future projects and can be copied across to existing ones cleanly.
