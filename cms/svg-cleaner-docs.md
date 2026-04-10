---
title: "SVG Cleaner"
subtitle: "Prepare SVGs for the design system"
description: "Paste raw SVG code and get a cleaned, optimised version ready for the design system."
section: "Tools"
subsection: ""
order: 2
status: "published"
access: "admin"
client: "internal"
actionUrl: "./svg-cleaner.html"
actionLabel: "Open Tool"
actionAccess: "team"
---

Paste raw SVG code and get a cleaned, optimised version ready for the design system. Strips namespaces, normalises fills, sets responsive sizing, and minifies output.

---

## What It Does (Always)

- Strips `xmlns` and `xmlns:xlink` from the root `<svg>` element

---

## Modes

The cleaner has three mutually exclusive modes. Each locks the relevant options automatically.

### Logo

Wraps the SVG in a `<div class="svg-logo-[name]">` container with an `aspect-ratio` derived from the original dimensions. The SVG is set to `width="100%" height="100%"` to fill the wrapper.

Locks on: **Size 100%**, **currentColor**, **Strip Comments**

```html
<div class="svg-logo-brand" style="aspect-ratio: 200 / 50">
  <svg viewBox="0 0 200 50" width="100%" height="100%">
    <path d="M10 10h80v30H10z" fill="currentColor"/>
  </svg>
</div>
```

### Icon

Wraps the SVG in a `<div class="icn-svg" data-icon="[name]">` container. See the [Iconography docs](../design-system/iconography/) for full icon guidelines.

Locks on: **Size 100%**, **currentColor**, **Strip Comments**

```html
<div class="icn-svg" data-icon="arrow-right">
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path d="M5 12h14M12 5l7 7-7 7" fill="currentColor"/>
  </svg>
</div>
```

### Image File

Exports the SVG as a downloadable `.svg` file with `xmlns` and XML declaration re-added. Use this when the SVG will be loaded via `<img>` tags or CSS `background-image`.

Locks off: **Icon**, **Logo**, **currentColor**, **Size 100%**

---

## Optional Flags

| Flag | Effect |
|------|--------|
| `var(--current-color)` | Sets all `<path>` fill attributes to `currentColor` |
| `var(--size)` | Removes width/height, adds `width="100%" height="100%"` |
| `var(--standalone)` | Re-adds `xmlns` and XML declaration for standalone `.svg` files |
| `var(--strip-comments)` | Removes XML/HTML comments |
| `var(--strip-metadata)` | Removes `data-*` attributes and editor class names |
| `--precision N` | Rounds decimal values to N decimal places |
| `var(--minify)` | Collapses whitespace and optimises path data |
| `var(--logo)` | Wraps in `<div class="svg-logo-NAME">` with aspect-ratio |
| `--logo-name NAME` | Sets the logo class name |
| `var(--icon)` | Wraps in `<div class="icn-svg">` |
| `--icon-name NAME` | Sets the `data-icon` attribute |

---

## Browser UI

Open the SVG Cleaner tool in your browser to use the visual paste-and-copy workflow:

1. Paste your raw SVG code into the input area
2. Select a mode (Logo, Icon, or Image file) or configure options manually
3. Click **Clean SVG** (or **Save Image** in Image file mode) to process
4. Copy the cleaned output or download the file

---

## CLI Usage

The tool also works from the command line via `assets/js/svg-clean.js`:

```bash
# Icon
node assets/js/svg-clean.js --icon --icon-name arrow-right --current-color --strip-comments <<'SVGEOF'
<svg>...pasted code...</svg>
SVGEOF

# Logo
node assets/js/svg-clean.js --logo --logo-name brand --current-color --strip-comments <<'SVGEOF'
<svg>...pasted code...</svg>
SVGEOF

# Image file
node assets/js/svg-clean.js --standalone --strip-comments -o assets/images/logos/logo.svg <<'SVGEOF'
<svg>...pasted code...</svg>
SVGEOF
```

Use heredoc syntax (`<<'SVGEOF'`) to avoid shell escaping issues with quotes in SVG attributes.

---

## File Locations

| Location | Use for |
|---|---|
| `assets/icons/` | Favicons and app icons |
| `assets/images/logos/` | Site and publication logos |
| `assets/images/og/` | Open Graph social sharing images |
| `assets/images/illustrations/` | Decorative and UI illustrations |
| `assets/images/svg-icons/` | SVG component icons |
