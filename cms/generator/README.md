# Documentation Generator

A minimal, customizable documentation website generator with your own design system.

## Features

- Reads markdown files from `cms/` folder
- Generates HTML files to the project root
- Uses your own design system (no external CSS frameworks)
- Minimal dependencies (Node.js + marked)
- Auto-watches for changes during development
- Table of contents generation
- Code block copy buttons
- Responsive design ready

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Your Documentation

Add markdown files to the `cms/` folder with frontmatter:

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

This creates all HTML files in the project root.

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
cms/
├── *.md                    # Source markdown files (you edit these)
├── docs.config.js          # Project-specific settings
│
└── generator/              # Generator tools
    ├── generate-docs.js    # Generator script (outputs to project root)
    ├── watch-docs.js       # File watcher
    ├── template.html       # HTML template
    ├── package.json        # Dependencies
    └── README.md

assets/                     # Site assets (at project root)
├── css/
│   ├── design-system.css   # Foundation + core: tokens, utilities, components
│   ├── docs-site.css       # Docs-site shell, components, page chrome, auth
│   └── markdown.css        # Markdown rendering styles
├── fonts/
├── icons/
├── images/
└── video/
```

## Customization

### Using Your Own Design System

1. **Design System CSS**: The template links to `assets/css/design-system.css` from generated pages (configured in `cms/docs.config.js`)
2. **Site CSS**: Update `assets/css/style.css` for site-specific styles
3. **Template**: Modify `template.html` to use your component classes

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

The generated site is static HTML. Deploy the project root to:

- **GitHub Pages**: Push to `gh-pages` branch
- **Netlify**: Deploy the project root
- **Vercel**: Deploy the project root
- **Any static hosting**: Upload the root contents

## Dependencies

- **Node.js** - Required for file operations
- **marked** - Markdown parser (can be replaced with custom parser)

## License

MIT
