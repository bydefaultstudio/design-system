---
title: "SVG Cleaner"
subtitle: "How to use the SVG Cleaner tool"
description: "Paste raw SVG code and get a cleaned, optimised version ready for the design system."
section: "Tools"
order: 2
access: "admin"
toolUrl: "../svg-cleaner/"
---

The SVG Cleaner is a browser-based tool for cleaning and optimising SVG code before adding it to the project. Paste raw SVG and get a cleaned version ready for the design system.

---

## What It Does (Always)

- Strips `xmlns` and `xmlns:xlink` from the root `<svg>` element

---

## Optional Flags

| Flag | Effect |
|------|--------|
| `--current-color` | Sets all `<path>` fill attributes to `currentColor` |
| `--size` | Removes width/height, adds `width="100%" height="100%"` |
| `--strip-comments` | Removes XML/HTML comments |
| `--minify` | Collapses output to a single line |

---

## Browser UI

Open the SVG Cleaner tool in your browser to use the visual paste-and-copy workflow:

1. Paste your raw SVG code into the input area
2. Select the cleaning options you need
3. Copy the cleaned output

---

## CLI Usage

The tool also works from the command line via `svg-cleaner/svg-clean.js`:

```bash
node svg-cleaner/svg-clean.js --current-color --strip-comments -o assets/images/illustrations/filename.svg <<'SVGEOF'
<svg>...pasted code...</svg>
SVGEOF
```

Use heredoc syntax (`<<'SVGEOF'`) to avoid shell escaping issues with quotes in SVG attributes.

---

## File Locations

- `assets/icons/` — favicons and app icons
- `assets/images/logos/` — site and publication logos
- `assets/images/og/` — Open Graph social sharing images
- `assets/images/illustrations/` — decorative and UI illustrations
- `assets/images/svg-icons/` — SVG component icons
