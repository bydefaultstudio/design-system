# Claude Code Rules

You are a Senior Front-End Developer working inside this project's **Design System** (tokens + utility classes) and the **Studio** marketing site. Stack: HTML, CSS, JavaScript, TypeScript, React, Next.js.

- Follow requirements carefully; think step-by-step before writing code
- Write correct, best-practice, DRY, bug-free code — no TODOs or placeholders
- Prefer readability; avoid unnecessary abstractions
- Use semantic tokens over primitives; prefer existing utility classes over new CSS
- Only write new CSS if the design system can't express the requirement — and if so, add it to the right file based on the layer it belongs to (see §17 Layer Discipline): `assets/css/design-system.css` for foundation/core, `assets/css/docs-site.css` for docs-site, or a tool-specific CSS file for app layer
- Accessibility required: keyboard navigation, `aria-label`, focus states, `<button>` for actions, `<a>` for links
- If unsure, say so — never guess

---

## 1. Read Order (Mandatory)

Before generating or modifying code, treat the following files as authoritative:

1. `repo-map.md` — compact tree and symbol index of the entire repo; use it to locate files before opening them
2. `PROJECT_BRIEF.md` — project intent and constraints
3. `cms/platform-strategy.md` — what BrandOS is, who it serves, UX copy principles, and outcome signals
4. `cms/layout.md` — HTML layout hierarchy and structure
5. `cms/css-code-struture.md` — CSS organization and commenting
6. `cms/js-code-structure.md` — JavaScript patterns and structure
7. `cms/color.md` — color tokens and usage
8. `cms/typography.md` — typography tokens and usage
9. `cms/spacing.md` — spacing tokens and usage
10. `cms/border.md` — border strategy and composable classes
11. `cms/motion.md` — motion tokens (easings, durations, semantic page motion)
12. `cms/button.md` — button component usage
13. `cms/disclosure.md` — details/summary disclosure component
14. `cms/components.md` — master component spec (naming, tokens, accessibility, build rules)
15. `cms/documenting-components.md` — how to write component docs (section order, CSS reference, template)
16. `cms/seo-best-practices.md` — SEO meta tags and social sharing
17. `cms/folder-structure.md` — file organization rules
18. `cms/setup.md` — project setup and customization
18. `studio/README.md` — **read when working on files inside `studio/` or `cdn/studio/`**; studio layout, Barba transitions, feed system, page conventions

If any instruction conflicts with these documents, **the documents take precedence**.

Use Explore sub-agents to read multiple cms files in parallel before starting work.

---

## 2. Git & Commit Rules

### Push Policy
**Never push to remote without explicit user approval.** After committing, always ask the user before running `git push`. This applies to all branches, every time — no exceptions.

### Commit Message Style
- **Never mention AI, Claude, Co-Authored-By, or any AI tooling** — not in commit messages, PR descriptions, or any git metadata
- Write commit messages as if a human typed them — conversational, short, easy to read
- Lowercase, no period at the end
- Include enough context that someone reading the log understands *what* changed and *where* — don't be so terse that it's meaningless
- If the commit touches multiple areas, mention the key ones
- Use a body line when the "why" matters or the change is non-obvious — but keep it brief

**Good examples:**
```
fix nav not closing on mobile when clicking outside
add drop cap support to typography tokens and update docs
clean up unused color tokens from design-system.css
update docs generator config and rebuild html output
refactor auth flow — split token refresh into its own module
```

**Bad examples:**
```
fix bug                                                      ← no context, useless in git log
update files                                                 ← which files? why?
Fix: Resolved navigation closure issue on mobile viewports   ← too formal
Updated the navigation component to fix a bug where...       ← too wordy
feat(nav): fix mobile close behavior                         ← conventional commits overkill
```

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
- Do not hardcode duration or easing values in transitions or animations (use motion tokens — see `cms/motion.md`)
- Do not use external icon libraries (Material Design, Font Awesome, Heroicons, etc.) — only brand icons from `assets/images/svg-icons/` are permitted. Check the Icon Registry in `cms/iconography.md` for available icons. If none fits, request a new icon from the design team.
- Always use design system tokens for spacing, colors, typography, and motion

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
See `cms/color.md`, `cms/typography.md`, `cms/spacing.md`, `cms/motion.md` for complete token reference.

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
See `cms/iconography.md` for complete icon guidelines and the full icon registry.

**Critical rules:**
- **Brand icons only** — never use Material Design, Font Awesome, Heroicons, Feather, or any external icon library. Always check the Icon Registry section of `cms/iconography.md` first. If no brand icon exists for the need, flag it and request one from the design team — do not invent or substitute.
- Always wrap icons in `<div class="svg-icn" data-icon="name">` — never use bare `<svg>`, `<span>`, or `<img>`
- SVGs must use `width="100%" height="100%"` — the `.svg-icn` wrapper controls sizing
- SVGs must use `fill="none"` on the `<svg>` element; paths use `fill="currentColor"`
- Strip `xmlns` from inline SVGs
- Include `data-icon` with a descriptive kebab-case name
- Use the SVG Cleaner (`assets/js/svg-clean.js`) to prepare icons

### Components
See `cms/components.md` for the master component spec.

**Naming convention:**
- Components: `.component-name` base class
- Variation: `data-*` attributes (CUBE pattern) — `data-variant`, `data-size`, `data-color`, `data-icon-only`, `data-full-width`
- State classes: `.is-active`, `.is-open`, `.is-disabled`, `.is-hidden`, `.is-loading` — shared across components
- Role classes: `.close-btn`, `.nav-btn`, `.hero-cta` — compose with `.button` + data attributes

**The bare `<button>` element is a minimal reset only** — no background, border, or padding. Always add `class="button"` for styled buttons.

**Button quick reference:** variation via `data-*` attributes, state via `.is-*` classes. See `cms/button.md` for the full CUBE pattern, role classes, and composition rules.

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
- Table (`.table`) — `cms/table.md`
- Asset Card (`.asset-card`) — `cms/asset-card.md`
- Don't Card (`.card.dont-card`) — `cms/dont-card.md`
- Book Cover (`.book-cover`) — `cms/book-cover.md` — used on overview/index pages

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
- `studio/` — By Default agency website (self-contained marketing site, see §18)
- `cdn/studio/` — studio CDN assets (JS + CSS served to Webflow, see §18)

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
- [ ] Post-code review sub-agent run on changed files (see §14)

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

### Post-Code Review (Mandatory)
After every task that produces or modifies code, spawn a **sub-agent** to review the changes before reporting done. The review must focus on:
- **Edge cases** — missing null/undefined checks, empty arrays, unexpected input, race conditions
- **Error handling** — uncaught exceptions, silent failures, missing fallbacks at system boundaries
- **Browser/environment quirks** — CSS cross-browser issues, JS compatibility, responsive breakpoints
- **Logical bugs** — off-by-one errors, incorrect conditionals, state that can get out of sync

The sub-agent should read the actual changed files (not a summary) and report any issues found. Fix reported issues before marking the task complete. Skip only for trivial non-logic changes (typo fixes, comment updates, whitespace).

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

---

## 16. Platform Identity, UX Copy, Outcomes & Vision

See `cms/platform-strategy.md` for the full platform strategy document. The rules below are the enforceable subset — read the full doc for platform identity, audience definitions, copy examples, and outcome signals.

### Platform Identity

BrandOS is an interactive brand infrastructure platform — not a design system documentation site. This distinction governs every code, copy, and architecture decision.

**Three audiences — identify which one before starting any work:**

- **Team** — the system makes quality non-negotiable and delivery faster
- **Partners** — the system eliminates briefing overhead
- **Clients** — the system gives them infrastructure to build with, not outputs to receive

If a feature or copy does not clearly serve one of these audiences, pause and clarify.

### UX Copy Rules (Non-Negotiable)

1. **Name what it is, not what it does.** "Your brand system" — not "Click here to access your brand guidelines."
2. **Write for the moment.** Help with the next step — do not explain the platform.
3. **Use "your" deliberately.** Clients: "your brand system." Team: "the system," "our methodology."
4. **No qualifier creep.** Never use "simply," "easily," "just," or "quickly."
5. **Headlines are arguments, not labels.** "Every decision starts here" — not "Design Tokens."
6. **Active voice, present tense.** "Your brand tokens are live." — not "have been published."
7. **Errors are a trust moment.** Specific, honest, forward-pointing. Never blame the user.

**Copy must-dos:** intentional error states, descriptive empty states, intent-based nav labels, exact nouns in tool UIs, senior-practitioner tone in docs.

**Copy must-nots:** no platform-explaining copy, no isolated label changes, no filler words, no cross-audience copy reuse, no empty error states at ship.

### Outcome Signals

Before marking work complete, verify it moves toward these signals:

- **Team:** token questions → zero, every project starts from the system, doc generator always run
- **Partners:** briefing emails decrease, off-brand revisions decrease
- **Clients:** unprompted platform access, self-answered "is this on-brand?" queries
- **Platform health:** zero broken links, WCAG 2.1 AA, Lighthouse 90+, zero token/Webflow divergence, all docs reviewed within 90 days

### Platform Trajectory

**Now:** Internal source of truth + client brand environments
**Near:** Client portal with project views, brand governance, campaign tracking
**Future:** BrandOS as a deliverable — clients build their own Brand OS with By Default as system architect

Design decisions must not close off this trajectory. Prefer patterns that scale.

---

## 17. Layer Discipline

The codebase is split into **four layers**. Every CSS rule, every doc, and every component belongs to exactly one. This split exists so the design system can be lifted into other products (a React app, a marketing site, a client portal) without dragging the BrandOS docs site along with it.

Before adding or moving anything, ask: **which layer does this belong to?**

### The four layers

| Layer | What lives here | Files | Ships with system? |
|---|---|---|---|
| `foundation` | Tokens, layout primitives, utilities | `assets/css/design-system.css` (sections 1–10) + `cms/{color,typography,spacing,border,layout,layout-page,tokens,classes,components,iconography,what-is-a-design-system}.md` | ✅ Yes |
| `core` | Reusable components + brand identity docs | `assets/css/design-system.css` (sections 11+) + all component `cms/*.md` files + all `cms/brand-*.md` files | ✅ Yes |
| `docs-site` | Components, layout shell, and chrome that only power the BrandOS docs site itself | `assets/css/docs-site.css`, `cms/{asset-card,book-cover,dont-card,sticky-bar,copy-button}.md` | ❌ No |
| `app` | BrandOS-specific tools, integrations, project content, studio site | `assets/css/{markdown,tools,ad-preview,bd-cursor,world-clock,qr-code,image-placeholder,svg-cleaner}.css`, `studio/` (see §18), `cdn/studio/`, `cms/{calculator,svg-cleaner,display-ad-preview,image-placeholder,world-clock,llms}-docs.md`, all `cms/website-*.md`, all `cms/projects-*.md`, `cms/{setup,client-setup,platform-strategy,folder-structure,access-control,...}.md` | ❌ No |

### The seven rules

**Rule 1 — Every CSS rule belongs to one layer.**
Before adding CSS, decide which layer it's for and put it in the matching file. If you can't decide, it's probably not core — default to `docs-site.css`.

**Rule 2 — Layer 1 and 2 never reference Layer 3.**
`design-system.css` must not contain selectors that only make sense inside the docs site. Litmus test: *"If I dropped this file into a fresh React app, would this rule do something useful?"* If no → it belongs in `docs-site.css`.

**Rule 3 — Brand customization happens through tokens, not class overrides.**
A new product re-skins by editing brand tokens in `theme.css`. It does **not** override `.button` rules in another file. If something can only be customized by overriding a class, the token coverage is incomplete — fix the tokens, not the override.

**Rule 4 — Every component doc declares its layer.**
New `cms/*.md` files must have `layer:` in frontmatter. The doc generator validates this on every build and aborts if any file is missing or has an invalid value. Valid values: `foundation`, `core`, `docs-site`, `app`.

```yaml
---
title: "Button"
section: "Design System"
layer: "core"
---
```

**Rule 5 — `design-system/` index only lists `foundation` + `core` pages.**
Docs-site components like `asset-card.html`, `book-cover.html`, `dont-card.html` still get standalone pages, but they're filtered out of the Design System overview index by the generator. Enforced in [cms/generator/generate-docs.js](cms/generator/generate-docs.js) inside `generateSectionIndexPage`.

**Rule 6 — `llms.txt` and `llms-full.txt` only describe `foundation` + `core`.**
The LLM-facing reference describes what's portable. It never mentions `.asset-card`, `.book-cover`, the docs sidebar, the CPM calculator, or any other docs-site / app concern. Enforced via the explicit components list in [tools/generate-llms-txt.js](tools/generate-llms-txt.js).

**Rule 7 — When in doubt, simpler wins.**
If a "core" component is only ever used in one place inside the docs site, it's probably docs-site, not core. Three real consumers in three different products before something graduates from docs-site to core.

### Where to put new things

- **A new design token** → `design-system.css` Brand Tokens or System Tokens section, `layer: foundation`
- **A new reusable component** (e.g. accordion, carousel) → `design-system.css` + `cms/<name>.md` with `layer: core`
- **A new docs-site UI element** (e.g. version picker, doc breadcrumb variant) → `docs-site.css` + `cms/<name>.md` with `layer: docs-site`
- **A new BrandOS tool** (e.g. brand audit checker) → its own `assets/css/<name>.css` + `cms/<name>-docs.md` with `layer: app`
- **A new brand identity doc** (e.g. illustration guidelines) → `cms/brand-<name>.md` with `layer: core`
- **A new studio page or component** → `studio/assets/css/studio.css` + hand-authored HTML from `studio/templates/page-template.html` (see §18)

### What this enables

Once layers are in place, packaging the design system as a standalone deliverable is a filter operation:
- Copy `design-system.css` (no docs-site classes left in it)
- Copy `cms/*.md` where `layer in {foundation, core}` (includes brand-*.md as the customization template)
- Copy `theme.css` template
- Skip `docs-site.css`, all `app`-layer CSS and docs

This is the foundation for BrandOS as a deliverable — clients spinning up their own systems on top of ours.

---

## 18. Studio Mode

The `studio/` directory contains the By Default agency marketing site — a self-contained project that shares design system tokens from the parent but has its own layout, CSS, JS, and page conventions. CDN-served assets live in `cdn/studio/`.

### When studio mode activates

Studio mode applies when working on any file inside:
- `studio/` — HTML pages, CSS, JS, templates, images
- `cdn/studio/` — CDN-served scripts and styles for the Webflow-hosted version

When studio mode is active, follow the rules in this section. Everything else in CLAUDE.md still applies unless explicitly overridden below.

### Authoritative reference

**`studio/README.md`** is the single source of truth for studio work. Read it before making any studio changes. It covers layout, Barba transitions, feed system, page hierarchy, and deployment.

### Shared asset sync (pre-commit hook)

`design-system.css` and `accordion.js` are shared between root and studio. A **bi-directional git pre-commit hook** (`.git/hooks/pre-commit`) keeps them in sync:

- Stage `studio/assets/css/design-system.css` → hook copies to `assets/css/` and stages it
- Stage `assets/css/design-system.css` → hook copies to `studio/assets/css/` and stages it
- If both are staged, **studio wins**

The studio copy is the primary working file. **Do not manually copy `design-system.css` between root and studio.** Just edit whichever copy you need — the hook handles sync at commit time. The same applies to `assets/js/accordion.js` ↔ `studio/assets/js/accordion.js`.

### CSS rules

- **All studio CSS goes in `studio/assets/css/studio.css`** — never in `design-system.css` or `docs-site.css`
- Additional studio CSS: `studio/assets/css/bd-video.css` (video component)
- CDN styles: `cdn/studio/css/hero.css`
- CSS load order: `design-system.css` (shared, read-only) → `studio.css` (studio-local, cascade wins)
- Studio uses design system tokens (colors, typography, spacing, motion) but has its own layout grid — do not use the BrandOS layout hierarchy (`page-wrapper → page-content → section → ...`)

### Layout

Studio uses a CSS Grid with sticky sidebar + Barba container on desktop, plus a slim mobile-only bar above main on mobile (hamburger trigger for the drawer). Not the BrandOS `page-wrapper` hierarchy. Key variables:

- `--sidebar-width`, `--sidebar-collapsed-width`, `--mobile-bar-height`, `--mobile-drawer-width`

Inside the Barba container, the standard inner hierarchy still applies: `section → padding-global → container → block`.

### JavaScript rules

- Studio JS lives in `studio/assets/js/` — four files: `studio.js`, `studio-barba.js`, `studio-contact.js`, `bd-video.js`
- CDN scripts in `cdn/studio/js/` (hero, homepage, blog, case study, stacking shapes, etc.)
- Same JS conventions as BrandOS: named functions, one init per module, no globals, log version at top — per `cms/js-code-structure.md`

### HTML and page conventions

- **L0 + L1 pages (home, about, contact) are hand-authored HTML** based on `studio/templates/page-template.html`.
- **L2 pages (articles + case studies) are generated from markdown** by `studio/cms/generator/` — see `studio/cms/README.md`. Sources live in `studio/cms/articles/*.md` and `studio/cms/work/*.md`; outputs are written to `studio/articles/*.html` and `studio/work/*.html`, plus a single manifest at `studio/assets/data/studio-content.json` that drives the homepage feed, sidebar work list, and next-read card.
- Every page's Barba container must declare: `data-barba-namespace`, `data-level`, `data-order`, `data-page-title`, `data-page-description`. For L2 pages, the generator fills these from front-matter.
- Page hierarchy: L0 (home), L1 (destinations: work, about, contact), L2 (feed items: case studies, articles)
- Sidebar nav is inlined per L0/L1 page — update it in every page when adding or removing links. L2 pages share a templated sidebar from `studio/cms/generator/templates/layout.html`, so one edit rebuilds all of them.

### Barba page transitions

Three scenarios driven by page level:
- **open** (L0 → higher): new page slides up over home
- **close** (higher → L0): current page slides down to reveal home
- **swap** (non-home ↔ non-home): conveyor transition

Transition mapping lives in `TRANSITION_MAP` at the top of `studio-barba.js`. Reduced motion is handled automatically.

### What's shared with BrandOS (still applies in studio mode)

- Design system tokens: semantic colors, typography, spacing, motion — always semantic, never primitive
- Git and commit rules (§2)
- Accessibility requirements (keyboard nav, aria, focus states)
- Core principles (§12): Simplicity First, No Laziness, Minimal Impact, Demand Elegance
- Brand icons only rule (§3, §4 Iconography)
- SVG processing workflow (§15)
- JS code structure conventions (`cms/js-code-structure.md`)

### Local development

Studio's dev server always runs on **port 2000**:

```bash
npm run serve:studio
# → http://localhost:2000/
```

This serves `studio/` as the root — no `/studio` prefix in the URL. Port 2000 is a permanent convention; do not change it.

### What does NOT apply in studio mode

- BrandOS layout hierarchy (`page-wrapper → page-content → section → ...`) — studio has its own grid
- Doc generator (`cms/generator/`) — studio has its own L2 generator at `studio/cms/generator/`; the docs-site one is never involved
- Page template at root (`templates/page-template.html`) — use `studio/templates/page-template.html` for L0/L1, or the generator for L2
- UX copy rules from §16 — studio is a marketing site with its own voice
- Component specs from §4 (`.button`, `.card`, etc.) — studio may define its own components (`.post`, `.post-title`, etc.)
- `docs-site.css` — studio does not load or depend on it

---

## 19. Subagents

Project subagents live in `.claude/agents/`. They are research-only — they return reviews and plans, the main agent applies edits.

### Auto-delegate (mandatory)

You MUST delegate to these agents whenever the matching trigger applies — in plan mode and during execution. Do not skip them because the change feels small; consistency is the point. When triggers overlap (common: GSAP timeline inside a Barba hook on a Splide carousel), invoke the relevant agents **in parallel** — single message, multiple Agent calls.

- **`gsap-expert`** — fires when:
  - editing or reviewing any file that imports `gsap`, `ScrollTrigger`, `SplitText`, `Flip`, `ScrollSmoother`, `Draggable`, or `MotionPathPlugin`
  - writing a new animation timeline or modifying an existing one
  - the user mentions: animation, timeline, scroll-trigger, split-text, ease, duration, stagger, scrub, pin, snap
  - debugging stutter, jank, orphan ScrollTriggers, or post-Barba animation issues
  - choosing motion durations or easings (must reference `cms/motion.md`)

- **`barba-expert`** — fires when:
  - editing `assets/js/barba-init.js`, `studio/assets/js/studio-barba.js`, or any file with Barba hooks
  - the user mentions: page transition, Barba, hook, scenario, namespace, prefetch, route, scroll restoration
  - debugging scroll jumps after navigation, double-init, or transition flashes
  - adding or changing transitions between L0 / L1 / L2 pages

- **`splide-expert`** — fires when:
  - editing or reviewing any file that imports `@splidejs/splide` or references `splide__` classes
  - touching `studio-testimonials.js`, `studio-logos.js`, `studio-case-study.js`, or any new carousel
  - the user mentions: carousel, slider, slide, pagination, autoplay, loop, sync, splide
  - debugging clone math, autoplay leaks across Barba transitions, or breakpoint behavior

- **`a11y-expert`** — fires when:
  - adding or modifying interactive components (buttons, dialogs, dropdowns, tabs, accordions, carousels, forms)
  - adding ARIA attributes, focus handlers, or keyboard listeners
  - introducing GSAP animation that runs without an explicit `prefers-reduced-motion` guard
  - the user mentions: accessibility, a11y, screen reader, keyboard, focus, ARIA, contrast, WCAG
  - touching focus management across Barba transitions

### Explicit invocation only

- **`outsider-challenger`** — never auto-fire. Only invoke when the user explicitly says "challenge this", "outsider review", "is this over-engineered", or `@outsider-challenger`. Reads source only; ignores `CLAUDE.md` and `cms/` docs by design.
