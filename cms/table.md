---
title: "Table"
subtitle: "Composable table styling"
description: "Guide to using the table component with base styles and modifier classes."
section: "Design System"
subsection: ""
order: 12
slug: "table"
status: "published"
access: "team"
client: "internal"
---

Tables use a **composable architecture** with a base class and optional modifiers. The base style is minimalistic — clean borders, no background fills — and modifiers layer on additional behaviour.

## Structure

Every table needs two elements:

1. A **scroll wrapper** (`.table-scroll`) for horizontal overflow on small screens
2. The **table element** with the `.table` base class

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alpha</td>
          <td>Primary</td>
          <td>Active</td>
        </tr>
        <tr>
          <td>Beta</td>
          <td>Secondary</td>
          <td>Pending</td>
        </tr>
        <tr>
          <td>Gamma</td>
          <td>Tertiary</td>
          <td>Inactive</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

```html
<div class="table-scroll">
  <table class="table">
    <thead>
      <tr>
        <th>Column</th>
        <th>Column</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
        <td>Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Base Class

The `.table` class provides the default minimalistic style:

| Property | Value |
| --- | --- |
| Border collapse | `collapse` |
| Width | `fit-content` (max 100%) |
| Font size | `var(--font-s)` |
| Font variant | `tabular-nums` |
| Header background | Transparent |
| Header border | `var(--border-s) solid var(--border-secondary)` |
| Body row border | `var(--border-s) solid var(--border-faded)` |
| Cell padding | `var(--space-m) var(--space-l)` |

---

## Modifiers

Modifiers are added alongside `.table` on the `<table>` element. They can be combined freely.

| Class | Effect |
| --- | --- |
| `.table-full` | Sets width to 100% |
| `.table-hover` | Adds hover highlight on body rows |
| `.table-header-filled` | Adds background colour to header cells |

### Full Width

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table table-full">
      <thead>
        <tr><th>Name</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Designer</td></tr>
        <tr><td>Bob</td><td>Developer</td></tr>
      </tbody>
    </table>
  </div>
</div>

```html
<table class="table table-full">
```

### Hoverable Rows

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table table-full table-hover">
      <thead>
        <tr><th>Name</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Designer</td></tr>
        <tr><td>Bob</td><td>Developer</td></tr>
        <tr><td>Carol</td><td>Manager</td></tr>
      </tbody>
    </table>
  </div>
</div>

```html
<table class="table table-hover">
```

### Filled Header

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table table-full table-header-filled">
      <thead>
        <tr><th>Name</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>Designer</td></tr>
        <tr><td>Bob</td><td>Developer</td></tr>
      </tbody>
    </table>
  </div>
</div>

```html
<table class="table table-header-filled">
```

---

## Footer

The `<tfoot>` element is styled automatically when inside a `.table`:

- Top border: `var(--border-m) solid var(--border-primary)`
- Header cells: bold weight
- Data cells: semi-bold weight

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table table-full">
      <thead>
        <tr><th>Item</th><th>Price</th></tr>
      </thead>
      <tbody>
        <tr><td>Widget</td><td>£50</td></tr>
        <tr><td>Gadget</td><td>£75</td></tr>
      </tbody>
      <tfoot>
        <tr><th>Total</th><td>£125</td></tr>
      </tfoot>
    </table>
  </div>
</div>

```html
<table class="table table-full">
  <thead>
    <tr><th>Item</th><th>Price</th></tr>
  </thead>
  <tbody>
    <tr><td>Widget</td><td>£50</td></tr>
  </tbody>
  <tfoot>
    <tr><th>Total</th><td>£50</td></tr>
  </tfoot>
</table>
```

---

## Combining Modifiers

Modifiers compose naturally. A full-featured table with hover, filled header, and footer:

<div class="demo-preview is-joined">
  <div class="table-scroll">
    <table class="table table-full table-hover table-header-filled">
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      </thead>
      <tbody>
        <tr><td>Widget</td><td>2</td><td>£100</td></tr>
        <tr><td>Gadget</td><td>1</td><td>£75</td></tr>
        <tr><td>Doohickey</td><td>3</td><td>£60</td></tr>
      </tbody>
      <tfoot>
        <tr><th>Total</th><td>6</td><td>£235</td></tr>
      </tfoot>
    </table>
  </div>
</div>

```html
<div class="table-scroll">
  <table class="table table-full table-hover table-header-filled">
    <thead>...</thead>
    <tbody>...</tbody>
    <tfoot>...</tfoot>
  </table>
</div>
```

---

## Responsive Behaviour

Tables are mobile-friendly by default:

- **Horizontal scroll** — `.table-scroll` allows swiping when the table is wider than the viewport
- **Scroll hint** — a subtle fade appears on the right edge when the table overflows, indicating more content. It disappears once the user scrolls to the end
- **Condensed padding** — at `768px` and below, cell padding and font size reduce automatically to fit more content on screen

No extra classes or markup are needed — this behaviour is built into `.table-scroll` and `.table`.

---

## Markdown Tables

Tables generated from markdown (via the doc generator) automatically receive the `.table` class inside a `.table-scroll` wrapper. No manual class application is needed for documentation pages.

---

## Do Not

- Do not apply spacing or margins to `.table` directly — use the scroll wrapper or parent block for spacing
- Do not create combined classes like `.table-hover-filled` — compose existing modifiers instead
- Do not hardcode border or colour values — use the design system tokens
