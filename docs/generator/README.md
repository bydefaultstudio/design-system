# Documentation Generator

A minimal, customizable documentation website generator with your own design system.

## Features

- ✅ Reads markdown files from `docs/` folder
- ✅ Generates HTML files to `docs/site/` folder
- ✅ Uses your own design system (no external CSS frameworks)
- ✅ Minimal dependencies (Node.js + marked)
- ✅ Auto-watches for changes during development
- ✅ Table of contents generation
- ✅ Code block copy buttons
- ✅ Responsive design ready

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Your Documentation

Add markdown files to the `docs/` folder with frontmatter:

```markdown
---
title: "Getting Started"
subtitle: "Quick guide to get started"
description: "Learn how to set up the project"
section: "overview"
order: 1
---

# Getting Started

Your content here...
```

### 3. Generate the Site

```bash
npm run docgen
```

This creates all HTML files in `docs/site/`.

### 4. View Locally

```bash
npm run serve
```

Visit `http://localhost:8080` to view your documentation.

## Development

### Watch Mode

Automatically regenerates when you edit markdown files:

```bash
npm run docwatch
```

### Full Development Mode

Generate, serve, and watch all at once:

```bash
npm run docfull
```

## Project Structure

```
docs/
├── *.md                    # Source markdown files (you edit these)
├── site/                   # Generated HTML files (auto-generated)
│   ├── index.html
│   ├── *.html
│   └── assets/             # Copied assets
│       └── docs.css
│
└── generator/              # Generator tools
    ├── assets/             # Source assets (copied to docs/site/assets/)
    │   └── docs.css
    ├── generate-docs.js    # Generator script
    ├── watch-docs.js       # File watcher
    ├── template.html       # HTML template
    ├── package.json        # Dependencies
    └── README.md
```

## Customization

### Using Your Own Design System

1. **Design System CSS**: The template links to `../../design-system/design-system.css` from generated pages (configured in `docs/docs.config.js`)
2. **Docs CSS**: Update `assets/docs.css` for docs-specific styles
3. **Template**: Modify `template.html` to use your component classes
4. **Add Assets**: Place images, fonts, etc. in `assets/` folder

### Frontmatter Fields

Every markdown file should start with frontmatter:

```yaml
---
title: "Page Title"          # Required: Page title
subtitle: "Brief description" # Optional: Subtitle shown below title
description: "SEO description" # Optional: Meta description
section: "category"          # Required: Groups pages in navigation
order: 1                     # Optional: Sort order within section
---
```

### Sections

Pages are organized by `section` in the navigation:
- `overview` - Getting started, introduction
- `features` - Feature documentation
- `deployment` - Deployment guides
- `api` - API reference

Add more sections as needed in `generate-docs.js`.

## Deployment

The generated site is static HTML. Deploy the `docs/site/` folder to:

- **GitHub Pages**: Push `docs/site/` to `gh-pages` branch
- **Netlify**: Deploy `docs/site/` folder
- **Vercel**: Deploy `docs/site/` folder
- **Any static hosting**: Upload `docs/site/` contents

## Dependencies

- **Node.js** - Required for file operations
- **marked** - Markdown parser (can be replaced with custom parser)

## License

MIT

