---
title: "Display Ad Preview"
subtitle: "How to use the Display Ad Preview tool"
description: "Generate Celtra ad preview sandbox URLs with device simulation and publisher context."
section: "Project"
order: 12
access: "team"
toolUrl: "../display-ad-preview/index.html"
---

The Display Ad Preview tool generates Celtra sandbox preview URLs through a visual interface. Instead of manually constructing URLs with query parameters, select a device type, size, position, and preview mode from the sidebar controls.

---

## How It Works

### 1. Enter a Creative ID

Paste the 8-character hex Creative ID (e.g. `81e89b8a`) from Celtra into the input field. The tool immediately generates a preview URL and loads it in the iframe.

### 2. Choose a Device Type

| Device  | Behaviour |
|---------|-----------|
| **Phone** | Constrained iframe width matching real device viewports (320–428px) |
| **Tablet** | Constrained iframe width for tablet viewports (600–800px) |
| **Desktop** | Full-width iframe with simulated webpage frame |

### 3. Select Device Size

**Phone sizes:**

| Label | Width | Comparable Devices |
|-------|-------|--------------------|
| XS | 320px | iPhone 5 |
| S | 375px | iPhone 13 Mini, Galaxy S21 |
| M | 390px | iPhone 14, Galaxy S21 Plus |
| L | 428px | iPhone 14 Plus, Galaxy S21 Ultra |

**Tablet sizes:**

| Label | Width | Comparable Devices |
|-------|-------|--------------------|
| S | 600px | 7" Galaxy Tab 7 |
| M | 768px | 9" iPad, Nexus 7 |
| L | 800px | 10" Galaxy Tab 10 |

### 4. Configure Preview Options

| Option | Values | Description |
|--------|--------|-------------|
| **Preview Mode** | Inline, Sticky Top, Sticky Bottom, Fullscreen | Controls how the creative is positioned on the simulated page |
| **Fold Position** | Above the fold, Below the fold | Where the creative appears relative to the fold |
| **Creative Position** | Top, Sidebar Left, Sidebar Right | Desktop only — controls creative placement on the page |

### 5. Publisher Overlay

Select a publisher from the dropdown to overlay a simulated navigation bar on the preview. This helps visualise how the ad creative appears within a publisher's site context.

---

## URL Sharing

The tool's URL updates with hash parameters as you change settings. Copy and share the full URL to let others open the same preview configuration.

Example: `index.html#id=81e89b8a&device=Phone&phoneSize=390&fold=below`

---

## Mobile Behaviour

On mobile devices, the tool redirects directly to Celtra's native preview URL instead of showing the sidebar UI. The shareable hash URL still works — opening it on desktop shows the full tool interface.

---

## Generated URL Format

The tool generates Celtra sandbox URLs in this format:

```
https://preview-sandbox.celtra.com/preview/{creativeID}/frame?{params}
```

Use the **Copy URL** button to copy the generated URL, or **Open** to launch the preview in a new tab.
