---
title: "Markdown"
subtitle: "Styling guidelines for markdown content"
description: "Documentation for markdown styling and design system integration"
author: "Studio"
section: "Docs"
layer: "app"
subsection: "Code Standards"
order: 6
status: "published"
access: "team"
client: "internal"
---

This guide defines the consistent formatting standards for all documentation pages in the ByDefault project.

## Overview

All markdown files should follow these standardized patterns to ensure:

- **Consistent visual hierarchy** - Clear heading structure and spacing
- **Readable content** - Proper list formatting and code block styling
- **Maintainable structure** - Standardized dividers and organization
- **Professional appearance** - Clean, modern documentation styling

---

## Frontmatter

Every markdown file must start with YAML frontmatter between `var(---)` delimiters. The generator reads these fields to determine page output, navigation, access control, and rendering.

### Core Fields

| Field | Required | Default | Description |
|---|---|---|---|
| `title` | Yes | filename | Page heading and browser tab title |
| `subtitle` | No | — | Secondary heading below the title |
| `description` | No | — | Meta description for SEO and social sharing |
| `section` | No | uncategorized | Navigation group — determines output folder (`Brand Book`, `Design System`, `Docs`, `Tools`, `Projects`, `Website`) |
| `layer` | Yes | — | Architectural layer: `foundation`, `core`, `docs-site`, or `app`. Build aborts if missing or invalid. See §17 in `CLAUDE.md`. |
| `author` | No | "Studio" | Page author name. Renders inside book cover cards as "by {author}". |
| `subsection` | No | — | Sub-category within a section for nav grouping |
| `order` | No | 999 | Sort position within section (lower = first) |
| `status` | No | published | Set to `"draft"` to exclude from generation |
| `access` | No | team | Visibility: `"public"`, `"team"`, `"admin"`, `"client"`, `"admin+client"` |
| `client` | No | internal | Client scope: `"internal"`, `"all"`, or a specific client key |

### Action Button Fields

Any page can display a header button linking to an external resource (tool, Figma file, etc).

| Field | Required | Default | Description |
|---|---|---|---|
| `actionUrl` | No | — | URL for the header button |
| `actionLabel` | No | Open | Button text |
| `actionAccess` | No | — | Visibility control for the button on client pages |

### Enhancement Fields

| Field | Required | Default | Description |
|---|---|---|---|
| `dropcap` | No | — | Set to `"true"` to style the first paragraph with a drop cap |
| `scripts` | No | — | Comma-separated script names to inject (e.g. `"splide, notion-form"`) |

**Available scripts:** `gsap`, `scroll-trigger`, `split-text`, `scroll-smoother`, `draggable`, `scroll-to`, `bd-animations`, `bd-audio`, `bd-cursor`, `splide`, `splide-auto-scroll`, `splide-intersection`, `notion-form`

### Opt-out Flags

These flags suppress parts of the standard page layout. All default to enabled — set to `false` only when needed.

| Field | Default | Effect when `false` |
|---|---|---|
| `toc` | true | Suppresses the table of contents block |
| `sticky-bar` | true | Suppresses the sticky sub-bar (breadcrumb + section dropdown) |
| `pagination` | true | Suppresses the prev/next page nav at the bottom |

### Example

```markdown
---
title: "CPM Calculator"
subtitle: "Plan campaign impressions, fees, and payouts"
description: "Calculate campaign impressions, fees, payouts, and margins."
section: "Tools"
layer: "app"
author: "Studio"
order: 1
status: "published"
access: "admin"
client: "internal"
actionUrl: "./cpm-calculator.html"
actionLabel: "Open Tool"
actionAccess: "public"
---
```


---

## Headers

# Your Primary Headline, Big, Bold, and Unmissable

## Supporting Headline to Guide Your Content

### Section Headings to Keep Content Organised

#### Smaller Subheading for Detailed Content Organisation

##### Compelling Statement That Captures Attention Instantly

###### Clear Navigation Heading for Important Information

```markdown
# Your Primary Headline, Big, Bold, and Unmissable

## Supporting Headline to Guide Your Content

### Section Headings to Keep Content Organised

#### Smaller Subheading for Detailed Content Organisation

##### Compelling Statement That Captures Attention Instantly

###### Clear Navigation Heading for Important Information
```

---

## Emphasis

This paragraph demonstrates how body text will look across your layout. **Bold text** adds emphasis, while *italics* offer a subtle highlight. You can also use ~~strikethrough~~ to show edits. Combined emphasis with **asterisks and _underscores_** for clarity.

```markdown
This paragraph demonstrates how body text will look across your layout. **Bold text** adds emphasis, while *italics* offer a subtle highlight. You can also use ~~strikethrough~~ to show edits. Combined emphasis with **asterisks and _underscores_** for clarity.
```

---

## Lists

Typography principles for effective design:

1. **Readability** - Use clear, legible typefaces
2. **Hierarchy** - Establish visual order with size and weight
   * Larger sizes for headings
   * Medium sizes for subheadings
   * Standard sizes for body text
1. **Spacing** - Create breathing room between elements
   1. Letter spacing for clarity
   2. Line height for readability
   3. Paragraph spacing for flow
4. **Consistency** - Maintain uniform styling throughout

   You can have properly indented paragraphs within list items. This extended paragraph serves to demonstrate how substantial blocks of text will behave across your layout, giving you a realistic sense of how readers will experience longer-form content.

   To have a line break without a paragraph, you will need to use two trailing spaces.  
   This maintains readability while keeping content compact.  
   (This is particularly useful for documentation where precision matters.)

* Unordered lists can use asterisks
- Or minuses
+ Or pluses

```markdown
Typography principles for effective design:

1. **Readability** - Use clear, legible typefaces
2. **Hierarchy** - Establish visual order with size and weight
   * Larger sizes for headings
   * Medium sizes for subheadings
   * Standard sizes for body text
1. **Spacing** - Create breathing room between elements
   1. Letter spacing for clarity
   2. Line height for readability
   3. Paragraph spacing for flow
4. **Consistency** - Maintain uniform styling throughout

   You can have properly indented paragraphs within list items. This extended paragraph serves to demonstrate how substantial blocks of text will behave across your layout, giving you a realistic sense of how readers will experience longer-form content.

   To have a line break without a paragraph, you will need to use two trailing spaces.  
   This maintains readability while keeping content compact.  
   (This is particularly useful for documentation where precision matters.)

* Unordered lists can use asterisks
- Or minuses
+ Or pluses
```

### Nested Lists

1. Type with Purpose
   1. Design with Intent
      1. Making Letters Matter
         1. Typography That Tells Your Story
2. From Serif to Sans

```markdown
1. Type with Purpose
   1. Design with Intent
      1. Making Letters Matter
         1. Typography That Tells Your Story
2. From Serif to Sans
```

* Fonts That Speak Volumes
  * Modern Design Principles
    * Visual Hierarchy
      * Content Organization
* Strategic Typography

```markdown
* Fonts That Speak Volumes
  * Modern Design Principles
    * Visual Hierarchy
      * Content Organization
* Strategic Typography
```

### Task Lists

- [ ] Review heading hierarchy
- [x] Document font scales
- [ ] Update spacing guidelines
  - [x] Define line heights
  - [ ] Create usage examples

```markdown
- [ ] Review heading hierarchy
- [x] Document font scales
- [ ] Update spacing guidelines
  - [x] Define line heights
  - [ ] Create usage examples
```

---

## Links

For further information, check out [this link](overview.html), which will take you to another page.

Visit [ByDefault Studio](https://bydefault.studio "ByDefault Design System") for comprehensive guidelines.

Or leave it empty and use the [link text itself]

Some text to show that the reference links can follow later.

[tokens]: https://bydefault.studio/design-system#tokens
[typography]: https://bydefault.studio/design-system#typography
[1]: https://bydefault.studio
[link text itself]: https://bydefault.studio/contact

```markdown
For further information, check out [this link](overview.html), which will take you to another page.

Visit [ByDefault Studio](https://bydefault.studio "ByDefault Design System") for comprehensive guidelines.


Or leave it empty and use the [link text itself]

Some text to show that the reference links can follow later.

[tokens]: https://bydefault.studio/design-system#tokens
[typography]: https://bydefault.studio/design-system#typography
[1]: https://bydefault.studio
[link text itself]: https://bydefault.studio/contact
```

---

## Images

Here's the ByDefault favicon (hover to see the title text):

Inline-style: ![ByDefault Favicon](../assets/icons/favicon.svg "ByDefault Studio Favicon")

Reference-style:
![ByDefault Logo][logo]

[logo]: ../assets/icons/favicon.svg "ByDefault Studio Logo"

```markdown
Here's the ByDefault favicon (hover to see the title text):

Inline-style: ![ByDefault Favicon](../assets/icons/favicon.svg "ByDefault Studio Favicon")

Reference-style:
![ByDefault Logo][logo]

[logo]: ../assets/icons/favicon.svg "ByDefault Studio Logo"
```

---

## HTML in Markdown

Since the documentation generator allows HTML, you can use HTML directly in markdown files to add styling classes and create custom layouts.

### Image with Classes

You can use HTML `<img>` tags to add design system classes:

<img src="assets/images/og-default.jpg" alt="Example image" class="border border-secondary padding-m max-width-full">

```markdown
<img src="assets/images/og-default.jpg" alt="Example image" class="border border-secondary padding-m max-width-full">
```

### HTML Blocks

You can create custom blocks with design system classes:

<div class="block gap-l border border-secondary padding-l">
  <h3>Custom Block Example</h3>
  <p>This is a custom HTML block with a heading, text, and button. You can use any design system classes to style it.</p>
  <button class="button">Action Button</button>
</div>

```markdown
<div class="block gap-l border border-secondary padding-l">
  <h3>Custom Block Example</h3>
  <p>This is a custom HTML block with a heading, text, and button. You can use any design system classes to style it.</p>
  <button class="button">Action Button</button>
</div>
```

**Note:** HTML in markdown gives you full control over styling. Use design system classes (`block`, `gap-*`, `border`, `padding-*`, `button`, etc.) to maintain consistency with the rest of the documentation.

---

## Code and Syntax Highlighting

The ByDefault design system uses `CSS custom properties` for all design tokens. Inline `code` has `back-ticks around` it for clarity.

```css
:root {
  /* Typography tokens */
  --font-primary: "Arial", sans-serif;
  --font-s: 16px;
  --line-height-l: 1.4;
  
  /* Color tokens */
  --text-plain: var(--black);
  --text-link: var(--green);
  --background-plain: var(--white);
}
```

```javascript
// Design system token usage
const designTokens = {
  spacing: {
    xs: 'var(--space-xs)',
    s: 'var(--space-s)',
    m: 'var(--space-m)'
  },
  colors: {
    primary: 'var(--text-primary)',
    accent: 'var(--text-link)'
  }
};
```

```
No language indicated, so no syntax highlighting.
Use this for plain text examples or design notes.
```

Markdown code (shown as indented code block):

    The ByDefault design system uses `CSS custom properties` for all design tokens. Inline `code` has `back-ticks around` it for clarity.

    ```css
    :root {
      /* Typography tokens */
      --font-primary: "Arial", sans-serif;
      --font-s: 16px;
      --line-height-l: 1.4;
      
      /* Color tokens */
      --text-plain: var(--black);
      --text-link: var(--green);
      --background-plain: var(--white);
    }
    ```

    ```javascript
    // Design system token usage
    const designTokens = {
      spacing: {
        xs: 'var(--space-xs)',
        s: 'var(--space-s)',
        m: 'var(--space-m)'
      },
      colors: {
        primary: 'var(--text-primary)',
        accent: 'var(--text-link)'
      }
    };
    ```

    ```
    No language indicated, so no syntax highlighting.
    Use this for plain text examples or design notes.
    ```

---

## Tables

Design system spacing tokens:

| Token | Value | Pixels | Usage |
| ----- |:-----:| -----: | ----- |
| `var(--space-xs)` | 0.25rem | 4px | Tight spacing |
| `var(--space-s)` | 0.5rem | 8px | Small gaps |
| `var(--space-m)` | 0.75rem | 12px | Medium spacing |
| `var(--space-l)` | 1rem | 16px | Standard spacing |
| `var(--space-xl)` | 1.5rem | 24px | Large spacing |

Typography scale tokens:

| Token | Size | Line Height | Use Case |
| --- | --- | --- | --- |
| `var(--font-xs)` | 14px | 1.4 | Small text |
| `var(--font-s)` | 16px | 1.4 | Body text |
| `var(--font-m)` | 18px | 1.4 | Default |
| `var(--font-l)` | 20px | 1.4 | Subheadings |
| `var(--font-xl)` | 22px | 1.2 | Headings |

```markdown
Design system spacing tokens:

| Token | Value | Pixels | Usage |
| ----- |:-----:| -----: | ----- |
| `--space-xs` | 0.25rem | 4px | Tight spacing |
| `--space-s` | 0.5rem | 8px | Small gaps |
| `--space-m` | 0.75rem | 12px | Medium spacing |
| `--space-l` | 1rem | 16px | Standard spacing |
| `--space-xl` | 1.5rem | 24px | Large spacing |

Typography scale tokens:

| Token | Size | Line Height | Use Case |
| --- | --- | --- | --- |
| `--font-xs` | 14px | 1.4 | Small text |
| `--font-s` | 16px | 1.4 | Body text |
| `--font-m` | 18px | 1.4 | Default |
| `--font-l` | 20px | 1.4 | Subheadings |
| `--font-xl` | 22px | 1.2 | Headings |
```

---

## Blockquotes

> Words matter, but how those words are presented matters just as much. Typography transforms content from mundane to magical, from ordinary to extraordinary.

> Typography is more than style; it's about communication. The right type makes content readable, relatable, and engaging, drawing readers into the heart of the message.

> The details are not the details. They make the design. — Charles Eames

```markdown
> Words matter, but how those words are presented matters just as much. Typography transforms content from mundane to magical, from ordinary to extraordinary.

> Typography is more than style; it's about communication. The right type makes content readable, relatable, and engaging, drawing readers into the heart of the message.

> The details are not the details. They make the design. — Charles Eames
```

### Nested Blockquotes

> Typography is the craft of endowing human language with a durable visual form.
>
> > Good design is as little design as possible. — Dieter Rams
>
> Every letter, every space, serves a purpose in creating cohesive digital experiences.

```markdown
> Typography is the craft of endowing human language with a durable visual form.
>
> > Good design is as little design as possible. — Dieter Rams
>
> Every letter, every space, serves a purpose in creating cohesive digital experiences.
```

### Blockquotes with Other Elements

> ## Typography Principles
>
> 1.   **Readability** - Use clear, legible typefaces
> 2.   **Hierarchy** - Establish visual order with size and weight
>
> Here's how to apply spacing:
>
>     padding: var(--space-l);
>     margin: var(--space-xl);

```markdown
> ## Typography Principles
>
> 1.   **Readability** - Use clear, legible typefaces
> 2.   **Hierarchy** - Establish visual order with size and weight
>
> Here's how to apply spacing:
>
>     padding: var(--space-l);
>     margin: var(--space-xl);
```

---

## Horizontal Rule

Section break

---

Typography section

***

Design tokens section

___

Content organization section

```markdown
Section break

---

Typography section

***

Design tokens section

___

Content organization section
```

---

## Line Breaks

This paragraph demonstrates how body text will look across your layout. **Bold text** adds emphasis, while *italics* offer a subtle highlight.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.

This line is also a separate paragraph, but...
This line is only separated by a single newline, so it's a separate line in the *same paragraph*.

```markdown
This paragraph demonstrates how body text will look across your layout. **Bold text** adds emphasis, while *italics* offer a subtle highlight.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.

This line is also a separate paragraph, but...
This line is only separated by a single newline, so it's a separate line in the *same paragraph*.
```

---

## Automatic Links

Visit our website: <https://bydefault.studio>

Contact us: <hello@bydefault.studio>

```markdown
Visit our website: <https://bydefault.studio>

Contact us: <hello@bydefault.studio>
```

---

## Best Practices

### Content Guidelines

- **Be concise** - Get to the point quickly
- **Use examples** - Show, don't just tell
- **Be consistent** - Follow established patterns
- **Test thoroughly** - Verify all code examples work

### Formatting Guidelines

- **Consistent spacing** - Use blank lines appropriately
- **Proper hierarchy** - Use headings logically
- **Clean code blocks** - Always include language tags
- **Readable lists** - Use proper indentation

### Maintenance

- **Regular reviews** - Check for consistency
- **Update examples** - Keep code current
- **Test changes** - Verify formatting works
- **Follow standards** - Use this guide as reference
