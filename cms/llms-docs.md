---
title: "LLMs"
subtitle: "AI-readable design system reference"
description: "How to use the BrandOS design system with AI tools like Claude, Cursor, Copilot, and ChatGPT."
section: "Docs"
layer: "app"
subsection: "Dev"
order: 10
slug: "llms"
status: "published"
access: "team"
client: "internal"
dropcap: true
---

This design system follows the [llms.txt standard](https://llmstxt.org) — a proposed convention for providing structured information to large language models. Think of it like `robots.txt`, but for AI assistants instead of search engines.

We publish two reference files that give AI tools full context about every token, component, and pattern in BrandOS. When you share them with an AI, the code it generates will automatically follow our design system.

---

## Reference Files

| File | Size | Purpose |
| --- | --- | --- |
| [`llms.txt`](https://bydefault.design/llms.txt) | ~2 KB | Lightweight index with project summary and links to each section |
| [`llms-full.txt`](https://bydefault.design/llms-full.txt) | ~67 KB | Complete reference with all tokens, components, patterns, and rules |

Both files are **auto-generated** from the design system source files on every deploy, so they are always up-to-date.

- Use **`llms.txt`** for quick context — it provides a summary of the design system with links to each section.
- Use **`llms-full.txt`** for full code generation — it contains every token value, component pattern, and rule the AI needs.

---

## How to Use with AI Tools

### Claude Projects

Add the full reference URL to your project knowledge. Claude will use it as context when helping you build with BrandOS.

1. Open your Claude project settings
2. Under **Project knowledge**, add the URL:

```
https://bydefault.design/llms-full.txt
```

### Claude Code

Reference the file by path if it's in your project, or paste the URL at the start of your conversation:

```
@https://bydefault.design/llms-full.txt
```

Claude Code can also access the file directly if you have the BrandOS repo checked out.

### Cursor

Add the reference via **Cursor Settings > Features > Docs**:

1. Go to **Settings > Features > Docs**
2. Add a new doc with the URL: `https://bydefault.design/llms-full.txt`
3. Reference it in chat using `@Docs`

You can also paste the file content directly into a conversation.

### VS Code + Copilot

Download `llms-full.txt` to your project root, then reference it in Copilot Chat:

```
#file:llms-full.txt
```

Alternatively, open the file in a tab — Copilot will include open files as context.

### ChatGPT

Paste the URL at the start of your conversation and ask ChatGPT to use it as the design system reference:

```
https://bydefault.design/llms-full.txt
```

If the tool cannot fetch URLs directly, download the file and upload it as an attachment.

### Other AI Tools

Most AI tools accept context via URL, file upload, or pasted content. Check your tool's documentation for the best method. The `llms-full.txt` file is plain markdown — it works with any tool that accepts text input.

---

## What's Inside

The full reference contains everything an AI needs to generate on-brand code:

- **Design tokens** — every CSS custom property value (colors, typography, spacing, borders, radius, shadows)
- **Layout system** — the complete page hierarchy and structural rules
- **Component patterns** — HTML examples and usage rules for all components
- **Utility classes** — spacing, gap, padding, border, and layout modifiers
- **Icon system** — brand SVG icon guidelines and usage patterns
- **Dark mode tokens** — automatic theme switching via `data-theme="dark"`
- **Accessibility requirements** — keyboard navigation, ARIA labels, focus states
- **CSS conventions** — file organization, naming, and commenting rules

---

## How It's Generated

The reference files are built by `tools/generate-llms-txt.js`, which:

1. Reads the preamble with core rules and constraints
2. Combines documentation from all CMS markdown sources
3. Extracts live CSS token values directly from `design-system.css`
4. Strips visual demos and inline styles (documentation-only markup)
5. Outputs both `llms.txt` (index) and `llms-full.txt` (full reference)

The generator runs automatically on every Netlify deploy. To regenerate locally:

```bash
node tools/generate-llms-txt.js
```
