# Claude Code Rules

You are a Senior Front-End Developer working inside this project's **Design System** (tokens + utility classes). Stack: HTML, CSS, JavaScript, TypeScript, React, Next.js.

- Follow requirements carefully; think step-by-step before writing code
- Write correct, best-practice, DRY, bug-free code — no TODOs or placeholders
- Prefer readability; avoid unnecessary abstractions
- Use semantic tokens over primitives; prefer existing utility classes over new CSS
- Only write new CSS if the design system can't express the requirement — and if so, add it to `assets/css/design-system.css` under the correct section
- Accessibility required: keyboard navigation, `aria-label`, focus states, `<button>` for actions, `<a>` for links
- If unsure, say so — never guess

---

## 1. Read Order (Mandatory)

Before generating or modifying code, treat the following files as authoritative:

1. `PROJECT_BRIEF.md` — project intent and constraints
2. `cms/layout.md` — HTML layout hierarchy and structure
3. `cms/css-code-struture.md` — CSS organization and commenting
4. `cms/js-code-structure.md` — JavaScript patterns and structure
5. `cms/color.md` — color tokens and usage
6. `cms/typography.md` — typography tokens and usage
7. `cms/spacing.md` — spacing tokens and usage
8. `cms/border.md` — border strategy and composable classes
9. `cms/button.md` — button component usage
10. `cms/disclosure.md` — details/summary disclosure component
11. `cms/components.md` — master component spec (naming, tokens, accessibility, build rules)
12. `cms/seo-best-practices.md` — SEO meta tags and social sharing
13. `cms/folder-structure.md` — file organization rules
14. `cms/setup.md` — project setup and customization

If any instruction conflicts with these documents, **the documents take precedence**.

Use Explore sub-agents to read multiple cms files in parallel before starting work.

---

## 2. Git Push Policy

**Never push to remote without explicit user approval.** After committing, always ask the user before running `git push`. This applies to all branches, every time — no exceptions.

---

## 3. Global Rules (Do Not Break)

- Do not invent new patterns
- Do not introduce new class naming conventions
- Do not add inline styles (except for demo purposes in styleguide)
- Do not use spacer divs
- Do not add margins inside blocks
- Do not apply spacing directly to containers
- Do not bypass layout primitives
- Do not create new utilities without updating the design system documentation
- Do not use primitive color tokens directly (use semantic tokens)
- Always use design system tokens for spacing, colors, and typography

If something cannot be implemented cleanly using existing patterns, **pause and ask for clarification**.

---

## 4. Quick Reference

### Layout Hierarchy
See `cms/layout.md` for complete details.

```
body → page-wrapper → page-content → section → padding-global → container/max-width → block
```

**Critical rules:**
- Sections control macro spacing (`.top-*`, `.bottom-*`)
- Blocks control micro spacing (`.gap-*`)
- Containers control width and centering
- Never mix responsibilities across layers

### Design Tokens
See `cms/color.md`, `cms/typography.md`, `cms/spacing.md` for complete token reference.

**Critical rules:**
- Use semantic tokens, not primitives
- Primitive tokens (e.g., `--green`, `--neutral-800`) must never be used directly
- Semantic tokens (e.g., `--text-primary`, `--background-faded`) are always preferred

### CSS Structure
See `cms/css-code-struture.md` for complete organization guidelines.

**Critical rules:**
- Design system CSS (`assets/css/design-system.css`) is the single source of truth
- Brand tokens live in `assets/css/design-system.css` under the "Brand Tokens" section
- Follow the CSS commenting hierarchy (major sections, subsections, inline)
- All tokens must be defined in `:root` before use
- Never hardcode values that should use tokens

### JavaScript Structure
See `cms/js-code-structure.md` for complete patterns.

**Critical rules:**
- One responsibility per file
- One init function per module
- No anonymous functions
- No global variables
- Use named functions
- Log version and init success

### Border Strategy
See `cms/border.md` for complete composable architecture.

**Critical rules:**
- Structural classes define position (`.border`, `.border-top`, etc.)
- Combo classes modify one concern (width, style, color)
- Never create classes like `.border-top-m` or hardcode border values

### Iconography
See `cms/iconography.md` for complete icon guidelines.

**Critical rules:**
- Always wrap icons in `<div class="icn-svg" data-icon="name">` — never use bare `<svg>`, `<span>`, or `<img>`
- SVGs must use `width="100%" height="100%"` — the `.icn-svg` wrapper controls sizing
- SVGs must use `fill="none"` on the `<svg>` element; paths use `fill="currentColor"`
- Strip `xmlns` from inline SVGs
- Include `data-icon` with a descriptive kebab-case name
- Use the SVG Cleaner (`assets/js/svg-clean.js`) to prepare icons

### Components
See `cms/components.md` for the master component spec.

**Naming convention:**
- New components: `.component-name` base, `.component-name--modifier` for variants
- Legacy (button only): `.is-outline`, `.is-faded`, `.is-small` etc. — kept for compatibility
- State classes: `.is-active`, `.is-open`, `.is-disabled`, `.is-hidden` — shared across components

**The bare `<button>` element is a minimal reset only** — no background, border, or padding. Always add `class="button"` for styled buttons.

**Border radius scale:** `--radius-xs` (4px), `--radius-s` (6px), `--radius-m` (10px), `--radius-l` (16px), `--radius-xl` (24px), `--radius-pill` (999px)

**Available components:**
- Button (`.button`) — `cms/button.md`
- Form elements — `cms/form.md`
- Callout (`.callout`) — `cms/callout.md`
- Disclosure (`details`/`summary`) — `cms/disclosure.md`
- Badge (`.badge`) — `cms/badge.md`
- Card (`.card`) — `cms/card.md`
- Breadcrumb (`.breadcrumb`) — `cms/breadcrumb.md`
- Tabs (`.tabs`) — `cms/tabs.md` — requires `assets/js/tabs.js`
- Progress (`.progress-bar`) — `cms/progress.md`
- Tooltip (`data-tooltip`) — `cms/tooltip.md`
- Toast (`.toast`) — `cms/toast.md` — requires `assets/js/toast.js`
- Code / Pre / Kbd — `cms/code.md`
- Mark / Abbr / Figure — `cms/mark.md`

---

## 5. HTML Rules

### Page Template
- Always use `templates/page-template.html` as the base
- Include all SEO meta tags (see `cms/seo-best-practices.md`)
- Use semantic HTML structure
- Follow the layout hierarchy (see `cms/layout.md`)

### SEO Meta Tags
See `cms/seo-best-practices.md` for complete requirements.

Every page must include:
- Viewport meta tag
- Unique title (50-60 characters)
- Unique meta description (150-160 characters)
- Canonical URL
- Open Graph tags
- X (Twitter) Card tags
- Theme color

---

## 6. File Organization

See `cms/folder-structure.md` for complete directory structure.

**Key locations:**
- `assets/` — all project assets (CSS, fonts, icons, images, video)
- `design-system/` — design system framework (CSS + styleguide)
- `brand-book/` — brand preview page (brand tokens live in design-system.css)
- `src/js/` — JavaScript files
- `src/pages/` — HTML pages
- `templates/` — reusable templates
- `cms/` — documentation markdown source and generator
- `tools/` — live tool apps (CPM calculator, SVG cleaner, display ad preview)

---

## 7. Documentation Discipline

If you:
- introduce a new pattern
- change an existing rule
- add a new component type
- add new design tokens
- modify the CSS structure

You must:
- update the relevant documentation file
- explain why the change exists
- keep code and documentation in sync

After updating any `cms/*.md` file, regenerate the HTML docs:
```bash
cd cms/generator && npm run docgen
```

---

## 8. Styleguide Rules

The styleguide (`design-system/index.html`) is:
- A demonstrative reference only
- For visualizing token usage and layout primitives
- Not a production page
- Should not be treated as a source of new rules or constraints

The brand book preview (`brand-book/index.html`) shows brand identity elements (logo, palette, typography, icons).

Do not infer behavior from styleguide or brand book HTML; always refer to the CSS and documentation.

---

## 9. When Unsure

If instructions are ambiguous:
- Ask a clarifying question
- Propose options instead of guessing
- Default to the **simplest existing pattern**
- Refer to the authoritative documentation files

Never optimise prematurely.

---

## 10. Common Mistakes to Avoid

- Using primitive tokens directly in layouts
- Adding margins inside blocks
- Creating new utility classes without documentation
- Mixing layout responsibilities
- Using inline styles (except in styleguide demos)
- Forgetting to update documentation when adding features
- Using relative URLs in Open Graph tags
- Missing viewport meta tag
- Duplicate titles/descriptions across pages

---

## 11. Testing Checklist

Before considering code complete:
- [ ] Uses existing design system patterns
- [ ] No new patterns introduced without documentation
- [ ] Documentation updated if changes were made
- [ ] Follows layout hierarchy
- [ ] Uses semantic tokens, not primitives
- [ ] No inline styles (except styleguide)
- [ ] Responsive behavior considered
- [ ] SEO meta tags included (for HTML pages)

---

## 12. Core Principles

These govern every decision — design system or otherwise.

- **Simplicity First** — make every change as simple as possible; impact minimal code
- **No Laziness** — find root causes; no temporary fixes; senior developer standards
- **Minimal Impact** — only touch what's necessary; no side effects or new bugs from unrelated changes
- **Demand Elegance** — for non-trivial changes, pause and ask "is there a more elegant way?"; if a fix feels hacky, implement the clean solution instead; skip this for simple obvious fixes

---

## 13. Project Onboarding (First Thing)

When this template is used for a new project, the **very first task** is to fill in the project brief. Before writing any code, use the `AskUserQuestion` tool to gather project details and populate `PROJECT_BRIEF.md`.

Ask questions in batches (max 4 per call) covering:

**Batch 1 — Project basics:**
- Project name (this will be used to update files across the template)
- One-sentence project summary
- Primary audience
- Project type (marketing site, web app, landing page, etc.)

**Batch 2 — Goals & scope:**
- Primary goals (what does success look like?)
- Non-goals / out of scope
- Timeline and deadlines
- Platforms (responsive web, specific devices, etc.)

**Batch 3 — Design & technical:**
- Brand details (existing brand or new? fonts, colours known?)
- Content status (copy ready, images sourced, or TBD?)
- Technical constraints (hosting, performance targets, accessibility level)
- Known risks or open questions

After gathering answers:

1. Write answers into `PROJECT_BRIEF.md`, replacing all bracketed placeholders
2. **Propagate the project name** across the template:
   - `README.md` → replace `[Your Project Name]` in the heading
   - `index.html` → update `<title>` and eyebrow text
   - `templates/page-template.html` → replace `Site Name` in title, OG `og:site_name`, and `yoursite.com` placeholder URLs
   - `cms/docs.config.js` → update `footerText` and `indexDescription`
   - `PROJECT_BRIEF.md` → add project name at the top
3. Update brand tokens in `assets/css/design-system.css` (Brand Tokens section) with any known brand values (fonts, colours)

This must happen before any other work begins.

---

## 14. Claude Code — Workflow & Tools

This section defines how to use Claude Code's native capabilities when working in this project.

### Plan Mode
Enter plan mode for **any non-trivial task** (3+ steps, new components, structural changes, or architectural decisions):
1. Use `EnterPlanMode` to research and plan before touching code
2. Launch Explore sub-agents in parallel to read relevant docs
3. Write a detailed spec upfront to reduce ambiguity
4. Confirm plan with user, then implement
5. If something goes sideways mid-task — **stop and re-plan immediately**

### Sub-agents
Use sub-agents liberally to keep the main context window clean. Offload research, exploration, and parallel analysis.

- Use **Explore** type to read authoritative docs in parallel before coding
- One focused task per sub-agent for clean execution
- For complex problems, throw more compute at it via parallel agents

Example: before building a new section, launch simultaneously:
- `cms/layout.md` + `cms/spacing.md` (layout agent)
- `cms/color.md` + `cms/typography.md` (tokens agent)
- `cms/css-code-struture.md` (CSS patterns agent)

### Task Tracking
Use **TodoWrite** for any multi-step task:
1. Write todos before starting implementation
2. Mark `in_progress` while working (one at a time)
3. Mark `completed` immediately when done — not before it's proven to work
4. Add a brief summary of what changed at each major step

### Verification Before Done
Never mark a task complete without proving it works:
- Ask yourself: "Would a staff engineer approve this?"
- Diff the behaviour before and after your changes when relevant
- Check that docs are updated if you changed any patterns
- Run the doc generator if any `cms/*.md` files changed

### Autonomous Bug Fixing
When given a bug report — just fix it:
- Point at logs, errors, failing tests — then resolve them
- Find the root cause; don't patch symptoms
- Zero context switching required from the user
- Go fix failing issues without being told how

### Self-Improvement Loop
After **any correction from the user**:
- Save the pattern to the memory system as a `feedback` type memory
- Write a rule for yourself that prevents the same mistake
- Review relevant feedback memories at the start of each session

### Memory
Project context persists across sessions via the memory system.
Key project memory: design system rules, token conventions, layout hierarchy.
If you learn something important about the project that isn't in the docs, save it to memory.

### Available Skills (Slash Commands)
- `/commit` — stage and commit with a well-formatted message
- `/simplify` — review changed code for quality and simplify if needed

### MCP Integrations
The following MCP tools are available for this project:

**Figma** — for design-to-code and design token sync:
- `get_design_context` — extract component code and tokens from a Figma node
- `get_variable_defs` — read design variables/tokens from Figma
- `get_screenshot` — capture a visual snapshot of a Figma frame
- Use when the user shares a `figma.com` URL or asks to implement a design

**Webflow** — for Webflow CMS and component work:
- `data_pages_tool`, `data_cms_tool`, `data_components_tool`
- Use when working with Webflow-hosted projects

**Notion** — for project documentation and briefs:
- `notion-search`, `notion-fetch`, `notion-create-pages`
- Use to read or update project documentation in Notion

**Slack** — for team communication:
- `slack_send_message`, `slack_read_channel`
- Use only when explicitly asked to send or read Slack messages

---

## 15. SVG Processing

Use `assets/js/svg-clean.js` to clean SVGs before adding them to the project. The tool reads from stdin and writes to stdout (or a file with `-o`).

### What it does (always)
- Strips `xmlns` and `xmlns:xlink` from root `<svg>`

### Optional flags
- `--current-color` — sets all `<path>` fill attributes to `currentColor`
- `--size` — removes width/height, adds `width="100%" height="100%"`
- `--strip-comments` — removes XML/HTML comments
- `--minify` — collapses to single-line output

### Standard workflow

When a user pastes SVG code in the chat, clean it and save it:

```bash
node assets/js/svg-clean.js --current-color --strip-comments -o assets/images/illustrations/filename.svg <<'SVGEOF'
<svg>...pasted code...</svg>
SVGEOF
```

Use heredoc syntax (`<<'SVGEOF'`) to avoid shell escaping issues with quotes in SVG attributes.

### File locations
- `assets/icons/` — favicons and app icons
- `assets/images/logos/` — site and publication logos
- `assets/images/og/` — Open Graph social sharing images
- `assets/images/illustrations/` — decorative and UI illustrations
- `assets/images/svg-icons/` — SVG component icons

### Browser UI
`tools/svg-cleaner.html` provides a visual SVG cleaner — open it in a browser for manual paste-and-copy workflows.
