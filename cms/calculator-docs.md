---
title: "CPM Calculator"
subtitle: "Plan campaign impressions, fees, and payouts"
description: "Calculate campaign impressions, fees, payouts, and margins from monthly spend — with multi-partner support and currency switching."
author: "Studio"
section: "Tools"
layer: "app"
subsection: ""
order: 1
status: "published"
access: "admin"
client: "internal"
actionUrl: "./cpm-calculator.html"
actionLabel: "Open Tool"
actionAccess: "public"
---

Calculate campaign impressions, fees, payouts, and margins from monthly spend. Built for media planners and sales teams, with multi-partner support, creative and hosting fee toggles, and currency switching.

---

## How It Works

The calculator has three main sections:

### 1. Global Settings

Toggle buttons control which optional features are visible. All toggles are off by default.

| Toggle | Shows |
|--------|-------|
| **By Default Fee** | By Default Fee (CPM, £) input + By Default column |
| **Ad Hosting Fee** | Ad Hosting Fee (CPM, £) input + Ad Hosting column |
| **Add Partner** | Partner Name, Partner Share (%), and Net (%) inputs + Partner column |

When **Add Partner** is enabled:
- **Partner Name** — free-text input that updates the "Partner" column header in the table (e.g. entering "Dianomi" changes the header to "Dianomi")
- **Partner Share (%)** and **Net (%)** are linked — they always sum to 100%. Changing one auto-updates the other

### 2. Campaign Overview

- **Campaign CPM (£)** — cost per thousand impressions (default: £15)
- **Total campaign spend (£)** — total budget for the campaign (default: £300,000)
- **Calculated impressions** — total impressions based on spend and CPM (read-only)

### 3. Monthly Breakdown Table

The primary output:
- One row per month (January through December)
- **Campaign (£)** — editable monthly spend
- **Impressions** — calculated impressions for that month
- **Net** — always visible, shows the net amount after all deductions and partner share

Optional columns (shown/hidden via toggle buttons):
- **By Default** — By Default earnings for the month
- **Ad Hosting** — Ad hosting costs for the month
- **Partner** — partner share amount for the month

The **Totals** row sums all monthly values.

---

## Calculations

All calculations update instantly when inputs change. Impressions are always calculated, never manually entered.

### Core Calculations

**Impressions**
```
(Campaign spend ÷ Campaign CPM) × 1,000
```

**By Default Earnings** (when enabled)
```
(Impressions ÷ 1,000) × By Default Fee CPM
```

**Ad Hosting Cost** (when enabled)
```
(Impressions ÷ 1,000) × Ad Hosting Fee CPM
```

**Net Spend** (calculated internally)
```
Campaign spend − By Default earnings − Ad hosting cost
```

### Partner Split (when Add Partner is enabled)

Partner Share and Net are complementary percentages of net spend:

**Partner Share**
```
Net spend × (Partner Share % ÷ 100)
```

**Net**
```
Net spend × (Net % ÷ 100)
```

Where `Partner Share % + Net % = 100%` always.

When Add Partner is **not** enabled, the Net column shows 100% of net spend.

---

## Usage Tips

1. **Start with Campaign CPM** — set your base CPM rate first
2. **Enter monthly spend** — type spend values directly in the table cells
3. **Toggle optional features** — click the toggle buttons in Global Settings to show/hide fields
4. **Name the partner** — use the Partner Name field to label the Partner column for your audience
5. **Instant updates** — all calculations update automatically as you type

---

## Default Values

| Input | Default |
|-------|---------|
| Campaign CPM | £15 |
| By Default Fee CPM | £1 (when enabled) |
| Ad Hosting Fee CPM | £1 (when enabled) |
| Partner Share | 70% (when enabled) |
| Net | 30% (when enabled) |
| Total campaign spend | £300,000 |

---

## Technical Notes

- Plain JavaScript only (no external dependencies)
- All calculations are deterministic and visible
- Feature toggles use `data-opt` attributes on HTML elements
- Hidden features don't affect visible totals
- Works in all modern browsers
