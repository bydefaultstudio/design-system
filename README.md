# By Default BrandOS

This project uses a structured design system and layout architecture for building consistent, maintainable front-end experiences.

## Overview

This project includes:

- A complete **design system** with tokens, utility classes, and components
- A **brand book** for per-project visual identity (fonts, colours, logo)
- Clear **layout and spacing rules** for consistent page structure
- Documented **best practices** for CSS, JavaScript, and HTML

## Getting Started

1. Review `PROJECT_BRIEF.md` for project goals and requirements
2. Follow the [Setup guide](project/setup.html) to customize brand colors, fonts, and logo
3. Explore the [Documentation](index.html) for design system details
4. Check the [Design System Styleguide](design-system/index.html) to see available patterns
5. Check the [Brand Book](brand/index.html) to see the current brand identity
6. Start building pages inside `/src`

## Documentation

Complete documentation is available in the [Documentation hub](index.html), including:

- **Design System** — Color, typography, spacing, borders, components
- **Code Structure** — CSS and JavaScript organization patterns
- **HTML Layout** — Page structure and layout primitives
- **Content** — Markdown style and SEO best practices
- **Project** — Setup, folder structure, and project overview

## Notion Form System

The platform includes a dynamic form system that renders forms from Notion database schemas and submits data back to Notion via Netlify Functions.

### Architecture

- **Netlify Functions** (`netlify/functions/`) handle all Notion API communication server-side
- **`get-schema.js`** — reads a Notion database schema and returns field definitions
- **`submit-form.js`** — creates a new page in the appropriate Notion database
- **`_notion-config.js`** — shared config mapping form types to database IDs
- **`assets/js/notion-form.js`** — client-side dynamic form renderer
- **`assets/js/feedback.js`** — floating feedback widget

### Adding or removing fields

Edit the Notion database directly — add, rename, remove, or reorder properties. The form updates automatically on next page load. No code changes needed.

### Adding a new form

1. Add a new environment variable in Netlify: `NOTION_DATABASE_ID_YOUR_FORM`
2. Add the form type to `netlify/functions/_notion-config.js`:
   ```js
   'your-form': {
     envKey: 'NOTION_DATABASE_ID_YOUR_FORM',
     successMessage: 'Your form has been submitted.',
     propertyOrder: [],
     required: []
   }
   ```
3. Create a page with the embed: `<div class="notion-form" data-form="your-form"></div>`
4. Include `notion-form.js` on the page (or add `scripts: "notion-form"` to the markdown frontmatter)

### Rotating the Notion API key

1. Generate a new internal integration token in Notion
2. Update `NOTION_API_KEY` in the Netlify dashboard (Site settings > Environment variables)
3. Redeploy the site (or trigger a new deploy)

### Local development

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Link to the Netlify site (first time only)
netlify link

# Start local dev server with function emulation
netlify dev
```

Environment variables are pulled from the Netlify dashboard automatically when using `netlify dev`.

---

**ByDefault Studio** — [bydefault.studio](https://bydefault.studio)
