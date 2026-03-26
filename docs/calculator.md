---
title: "CPM Calculator"
subtitle: "How to use the CPM & Spend Calculator"
description: "Complete guide to using the calculator, URL feature toggles, and calculation formulas."
section: "Tools"
order: 1
toolUrl: "cpm-calculator/index.html"
---

The CPM & Spend Calculator is a web-based tool for media planners and sales teams to calculate campaign impressions, fees, payouts, and margins based on monthly spend.

---

## How It Works

The calculator has three main sections:

### 1. Global Settings

These inputs affect all calculations below:

- **Campaign CPM (£)** - The cost per thousand impressions (always visible)
- **By Default fee (CPM, £)** - Optional By Default fee per thousand impressions
- **Ad hosting fee (CPM, £)** - Optional ad hosting cost per thousand impressions
- **Publisher payout (%)** - Optional percentage of spend paid to publisher

### 2. Campaign Overview

Quick sanity-check section showing:
- **Total campaign spend (£)** - Total budget for the campaign
- **Calculated impressions** - Total impressions based on spend and CPM (read-only)

### 3. Monthly Breakdown Table

The primary output showing:
- One row per month (January through December)
- **Campaign (£)** - Editable monthly spend
- **Impressions** - Calculated impressions for that month
- Optional columns (shown/hidden via URL):
  - **By Default** - By Default earnings for the month
  - **Ad hosting** - Ad hosting costs for the month
  - **Publisher** - Publisher payout for the month
  - **Partner Margin** - Partner margin for the month
- **Totals row** - Sum of all months

---

## URL Feature Toggles

The calculator supports URL-driven feature toggles to show/hide optional fields and columns. Use the `f` query parameter with feature codes.

### Feature Codes

| Code | Feature | Shows |
|------|---------|-------|
| `pf` | Publisher payout | Publisher payout (%) input + Publisher column + totals |
| `af` | By Default fee | By Default fee (CPM, £) input + By Default column + totals |
| `ah` | Ad hosting fee | Ad hosting fee (CPM, £) input + Ad hosting column + totals |
| `pm` | Partner margin | Partner Margin column + totals |

### URL Examples

Copy these URLs to share different views:

#### Default View (Core Calculator Only)
```
index.html
```
Shows only Campaign CPM, Total spend, Impressions, and monthly Campaign spend.

#### Publisher Payout Only
```
index.html?f=pf
```
Adds Publisher payout (%) input and Publisher column.

#### By Default Fee Only
```
index.html?f=af
```
Adds By Default fee (CPM, £) input and By Default column.

#### Ad Hosting Fee Only
```
index.html?f=ah
```
Adds Ad hosting fee (CPM, £) input and Ad hosting column.

#### Partner Margin Only
```
index.html?f=pm
```
Adds Partner Margin column (no input field required).

#### Multiple Features

**Publisher + By Default:**
```
index.html?f=pf,af
```

**By Default + Ad Hosting:**
```
index.html?f=af,ah
```

**Publisher + By Default + Ad Hosting:**
```
index.html?f=pf,af,ah
```

**All Features:**
```
index.html?f=pf,af,ah,pm
```

**Publisher + Partner Margin:**
```
index.html?f=pf,pm
```

**By Default + Ad Hosting + Partner Margin:**
```
index.html?f=af,ah,pm
```

### URL Format Rules

- Feature codes are comma-separated (no spaces)
- Order doesn't matter: `?f=af,pf` is the same as `?f=pf,af`
- Unknown codes are ignored
- Each feature shows its related input (if applicable) and table columns

---

## Calculations

All calculations update instantly when inputs change. Impressions are always calculated, never manually entered.

### Core Calculations

**Impressions**
```
(Campaign spend ÷ Campaign CPM) × 1,000
```

**By Default Earnings** (when `af` is enabled)
```
(Impressions ÷ 1,000) × By Default fee CPM
```

**Ad Hosting Cost** (when `ah` is enabled)
```
(Impressions ÷ 1,000) × Ad hosting fee CPM
```

**Net Spend** (calculated internally)
```
Campaign spend − By Default earnings − Ad hosting cost
```

**Publisher Payout** (when `pf` is enabled)
```
Net spend × (Publisher payout % ÷ 100)
```

**Partner Margin** (when `pm` is enabled)
```
Net spend × 30%
```

### Monthly Totals

The totals row sums all monthly values:
- Total campaign spend = Sum of all monthly spends
- Total impressions = Sum of all monthly impressions
- Optional totals only include values when their feature is enabled

---

## Usage Tips

1. **Start with Campaign CPM** - Set your base CPM rate first (default: £15)
2. **Enter Monthly Spend** - Type spend values directly in the table cells
3. **Use URL Toggles** - Share different views with different audiences:
   - Media planners: Default view or with `?f=pf`
   - Publishers: `?f=pf` to show payout
   - Partners: `?f=pf,af,ah,pm` to show all breakdowns
4. **Instant Updates** - All calculations update automatically as you type
5. **Notion Embedding** - The calculator works when embedded in Notion pages

---

## Technical Notes

- Plain JavaScript only (no external dependencies)
- All calculations are deterministic and visible
- Feature toggles use `data-opt` attributes on HTML elements
- Hidden features don't affect visible totals
- Works in all modern browsers

---

## Default Values

- Campaign CPM: £15
- By Default fee CPM: £1 (when enabled)
- Ad hosting fee CPM: £1 (when enabled)
- Publisher payout: 70% (when enabled)
- Total campaign spend: £300,000

