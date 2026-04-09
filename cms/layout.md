---
title: "HTML Layout"
subtitle: "Page layout and structure primitives"
description: "How to structure pages using sections, containers, blocks, and grids."
section: "Docs"
subsection: "Code Standards"
order: 3
status: "published"
access: "team"
client: "internal"
---

This system provides a **predictable layout structure** that keeps spacing, alignment, and width consistent across all pages.

---

## Page Structure

All pages follow the same hierarchy:

```
body
└─ page-wrapper
└─ page-content
└─ section
└─ padding-global
└─ container / max-width
└─ block
```

### Why this matters
- Clear separation of concerns
- Consistent spacing and widths
- Easy to scan and reason about layouts

```html
<section>
  <div class="padding-global">
    <div class="container-medium">
      <div class="block">
        <!-- Content -->
      </div>
    </div>
  </div>
</section>
```

---

## Sections

Sections group **major content areas** and control **vertical spacing**.

### When to use

* Every major page section
* Any time you need vertical rhythm between content groups

### Rules

* Sections own vertical spacing
* Use `.top-*` and `.bottom-*` classes
* Do not apply margins inside sections

```html
<section class="top-large bottom-large">
  <div class="padding-global">
    <!-- Content -->
  </div>
</section>
```

---

## Padding Global

`.padding-global` provides **consistent horizontal padding**.

### When to use

* Inside every section
* Whenever content needs safe spacing from screen edges

```html
<div class="padding-global">
  <div class="container-medium">
    <!-- Content -->
  </div>
</div>
```

Padding comes from `.padding-global`, **never from containers**.

---

## Containers

Containers constrain width and centre content in the viewport.

### When to use

* Most page content
* Any readable text or structured layout

### Key rules

* Containers centre content
* Containers do **not** add padding
* Use one container per section (in most cases)

```html
<div class="container-medium">
  <div class="block">
    <h2>Heading</h2>
    <p>Content</p>
  </div>
</div>
```

### Variants

<div class="demo-preview is-joined">
  <div style="background: var(--background-faded); padding: var(--space-m) 0;">
    <div class="container-small" style="background: var(--text-accent); color: var(--off-white); padding: var(--space-s); text-align: center;  font-size: var(--font-xs);">.container-small</div>
  </div>
  <div style="background: var(--background-faded); padding: var(--space-m) 0;">
    <div class="container-medium" style="background: var(--text-accent); color: var(--off-white); padding: var(--space-s); text-align: center;  font-size: var(--font-xs);">.container-medium</div>
  </div>
  <div style="background: var(--background-faded); padding: var(--space-m) 0;">
    <div class="container-large" style="background: var(--text-accent); color: var(--off-white); padding: var(--space-s); text-align: center;  font-size: var(--font-xs);">.container-large</div>
  </div>
</div>

| Class              | Use                    |
| ------------------ | ---------------------- |
| `container-small`  | Narrow layouts         |
| `container-medium` | Default readable width |
| `container-large`  | Wider layouts          |

---

## Max-Width

Max-width utilities apply **width limits only**.

### When to use

* Special cases
* Content that should not be centred
* Breaking out of container behaviour

| Class              | Use               |
| ------------------ | ----------------- |
| `max-width-small`  | Narrow constraint |
| `max-width-medium` | Default readable  |
| `max-width-large`  | Wide constraint   |
| `max-width-full`   | No constraint     |

**Rule of thumb**

* Centre content → use a container
* Only limit width → use max-width (exception, not default)

---

## Blocks

Blocks group **related content** and manage internal spacing.

### When to use

* Heading + text
* Text + buttons
* Image + caption
* Any content that belongs together

### Default behaviour

* Vertical flex layout
* Uses `gap` for spacing
* No margins on children

```html
<div class="block">
  <h2>Heading</h2>
  <p>Body text</p>
</div>
```

### Gap modifiers

<div class="demo-preview is-joined">
  <div class="block row gap-m" style="flex-wrap: wrap; align-items: flex-start;">
  <div class="block gap-xs" style="border: var(--border-s) solid var(--border-faded); padding: var(--space-m);  min-width: 8rem;">
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">.gap-xs</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
  </div>
  <div class="block gap-s" style="border: var(--border-s) solid var(--border-faded); padding: var(--space-m);  min-width: 8rem;">
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">.gap-s</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
  </div>
  <div class="block gap-m" style="border: var(--border-s) solid var(--border-faded); padding: var(--space-m);  min-width: 8rem;">
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">.gap-m</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
  </div>
  <div class="block gap-l" style="border: var(--border-s) solid var(--border-faded); padding: var(--space-m);  min-width: 8rem;">
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">.gap-l</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
  </div>
  <div class="block gap-xl" style="border: var(--border-s) solid var(--border-faded); padding: var(--space-m);  min-width: 8rem;">
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">.gap-xl</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
    <div style="background: var(--background-faded); padding: var(--space-xs);  font-size: var(--font-xs); text-align: center;">Item</div>
  </div>
  </div>
</div>

| Class    | Effect      |
| -------- | ----------- |
| `gap-xs` | Very tight  |
| `gap-s`  | Small       |
| `gap-m`  | Default     |
| `gap-l`  | Large       |
| `gap-xl` | Extra large |

```html
<div class="block gap-l">
  <h2>Heading</h2>
  <p>More space between elements</p>
</div>
```

---

## Block Layout Modifiers

Blocks can change layout or alignment.

| Class          | Effect              |
| -------------- | ------------------- |
| `row`          | Horizontal layout   |
| `row-reverse`  | Reversed horizontal |
| `align-start`  | Align items start   |
| `align-center` | Centre items        |
| `align-end`    | Align items end     |

```html
<div class="block row gap-m align-center">
  <p>Text</p>
  <button>Action</button>
</div>
```

---

## Grid

Grids create **column-based layouts**.
They are not spacing utilities.

### Base grid

* Two equal columns
* Default gap applied

<div class="demo-preview is-joined">
  <div class="grid">
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">Column 1</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">Column 2</div>
  </div>
</div>

```html
<div class="grid">
  <div>Item</div>
  <div>Item</div>
</div>
```

### Column modifiers

<div class="demo-preview is-joined">
  <div class="grid cols-3" style="margin-bottom: var(--space-m);">
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">1</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">2</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">3</div>
  </div>
  <div class="grid cols-4">
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">1</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">2</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">3</div>
    <div style="background: var(--background-faded); padding: var(--space-m);  text-align: center; font-size: var(--font-xs);">4</div>
  </div>
</div>

| Class       | Columns       |
| ----------- | ------------- |
| `cols-3`    | Three columns |
| `cols-4`    | Four columns  |

```html
<div class="grid cols-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Item width

| Class         | Effect                |
| ------------- | --------------------- |
| `fit-content` | Item sizes to content |

```html
<div class="grid">
  <div>Flexible column</div>
  <div class="fit-content">Fixed</div>
</div>
```

### Rules

* Use grids for layout, not spacing
* Use `gap-*` to adjust spacing
* Combine column + gap modifiers as needed
