---
title: "World Clock"
subtitle: "See every timezone your team works across"
description: "Configure a multi-timezone clock and embed it in Notion, dashboards, or any HTML page. Search cities, pick presets, and generate embed URLs or iframe snippets."
section: "Tools"
layer: "app"
subsection: ""
order: 5
status: "published"
access: "public"
client: "all"
actionUrl: "world-clock.html"
actionLabel: "Open Tool"
actionAccess: "public"
---

Track time across every city your team operates in. Configure the clock here, then embed it in Notion, dashboards, internal tools, or any HTML page.

---

## How It Works

1. **Search and add cities** using the search bar — type a city name and click to add
2. **Use presets** for common timezone groups (UK + US East, Global, etc.)
3. **Toggle display options** — show/hide city names, timezone abbreviations, or seconds
4. **Pick a theme** — light or dark to match your Notion page background
5. **Copy the embed URL** for Notion's `/embed` command, or copy the **iframe snippet** for any HTML page

The live preview updates in real-time as you configure.

---

## Embedding in Notion

1. Open the World Clock tool and configure your cities
2. Click **Copy URL** to copy the embed URL
3. In Notion, type `/embed` and paste the URL
4. Resize the embed block to fit your layout

---

## Embedding via Iframe

1. Configure your clock and click **Copy** next to the iframe snippet
2. Paste the snippet into any HTML page:

```html
<iframe src="https://bydefault.design/tools/world-clock-embed.html?cities=Europe/London,America/New_York,Asia/Tokyo" width="100%" height="140" frameborder="0" style="border:none;"></iframe>
```

---

## URL Parameters

The embed page accepts these URL parameters:

| Parameter | Default | Description |
|---|---|---|
| `cities` | `Europe/London,America/New_York,Asia/Tokyo` | Comma-separated IANA timezone identifiers |
| `showCity` | `true` | Set to `false` to hide city names |
| `showTz` | `true` | Set to `false` to hide timezone abbreviations |
| `showSeconds` | `false` | Set to `true` to show seconds |
| `interval` | `60` | Update interval in seconds |
| `theme` | `light` | `light` or `dark` — matches Notion's background |

---

## Supported Cities

The search includes 80+ major cities across all continents. Cities map to IANA timezone identifiers (e.g. `Europe/London`, `America/New_York`, `Asia/Tokyo`). You can also use any valid IANA timezone identifier directly in the URL.

---

## Files

| File | Purpose |
|---|---|
| `tools/world-clock.html` | Tool configuration page |
| `tools/world-clock-embed.html` | Standalone embed widget |
| `assets/js/world-clock-core.js` | Shared clock rendering logic |
| `assets/js/world-clock.js` | Tool page controller |
| `assets/css/world-clock.css` | Tool page styles |
