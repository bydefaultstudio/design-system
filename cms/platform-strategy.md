---
title: "Platform Strategy"
subtitle: "What BrandOS is, who it serves, and how it should sound"
description: "Platform identity, audience definitions, UX copy principles, and outcome signals for By Default BrandOS."
section: "Docs"
order: 1
status: "published"
access: "team"
client: "internal"
dropcap: "true"
---

By Default BrandOS is an interactive brand infrastructure platform. It gives clients, partners, and the internal team a shared environment to build, access, and optimise the brand systems that power effective interactive advertising.

Where traditional brand portals are static — guidelines in a PDF, logos in a folder — BrandOS is operational. It holds design tokens, brand frameworks, advertising tools, and client-specific environments in one place, structured so that every project begins from the same high-quality foundation and every output is measurably on-brand.

**In one sentence:** BrandOS is where By Default's interactive advertising methodology becomes something clients can build with, not just look at.

---

## What It Is Not

BrandOS is not a design system documentation site. It is not a file library. It is not a static brand guidelines PDF. The design system lives inside it as infrastructure — not as its purpose.

If a decision can be made by reading a token, the platform is doing its job. If a decision requires a meeting, the platform is not yet doing its job.

---

## Audience

BrandOS serves three distinct audiences. Copy, navigation, and content decisions must specify which audience they serve before they are written.

**Team** — designers, developers, and strategists at By Default. They use the system as the foundation for every project. The system exists to make quality non-negotiable and delivery faster.

**Partners** — media owners, production houses, tech vendors, ad platforms. They access BrandOS to understand brand constraints and retrieve specifications before and during production. The system exists to eliminate briefing overhead.

**Clients** — brand and marketing leads at client organisations. They access BrandOS to understand their brand system, use the studio's tools, and — over time — build and govern their own Brand OS. The system exists to give them infrastructure, not just outputs.

---

## Platform Architecture

The repository is structured across several interconnected modules:

| Directory | Purpose |
|---|---|
| `design-system/` | Token-based design system — colours, typography, spacing, borders, components |
| `brand-book/` | Client brand identity — fonts, colours, logo, iconography |
| `brand/` | By Default studio brand reference |
| `client-template/` | Forkable environment for client-specific deployments |
| `docs/` | Documentation source — markdown files processed by the generator |
| `markdown/` | Content source files |
| `tools/` | Utility tools for studio use |
| `cpm-calculator/` | Interactive CPM calculation tool |
| `display-ad-preview/` | Ad format and creative preview tool |
| `svg-cleaner/` | SVG preparation utility |
| `auth/` | Authentication and access control |
| `themes/` | Theme definitions |
| `templates/` | Reusable page templates |
| `assets/` | Global assets — CSS, fonts, icons, images |

The design system CSS (`assets/css/design-system.css`) is the single source of truth for all tokens. Brand tokens are defined in the "Brand Tokens" section of `design-system.css` and each client theme can override them via `theme.css`.

---

## UX Copy

### Voice

BrandOS copy sits at the intersection of creative precision and strategic clarity. Every word should hold both.

- **Direct without blunt** — no filler, no throat-clearing. Every sentence earns its place.
- **Expert without exclusive** — assumes an intelligent reader, not a developer. Complex ideas expressed simply.
- **Warm without casual** — there is a relationship here. The platform should feel built for the specific person reading it.
- **Action-oriented** — the platform exists to enable doing, not reading. Copy should point toward the next move.

### Seven Principles

**1. Name what it is, not what it does.**
"Your brand system" is more powerful than "Click here to access your brand guidelines."

**2. Write for the moment, not the manual.**
UX copy is contextual. The user is in the middle of doing something. Help them with the next step — don't explain the platform.

**3. Use "your" deliberately.**
For clients: "your brand system," "your tokens," "your frameworks" builds ownership. For the team: "the system," "our methodology" reinforces shared standards.

**4. Avoid qualifier creep.**
Remove "simply," "easily," "just," "quickly." If it's simple, show it. If it's not simple, don't lie.

**5. Headlines are arguments, not labels.**
"Design Tokens" is a label. "Every decision starts here" is an argument. The platform makes its case.

**6. Active voice, present tense.**
"Your brand tokens are live." Not "Brand tokens have been published."

**7. Error copy is a trust moment.**
Be specific about what happened. Be honest about what to do. Never blame the user.

### Tone by Context

| Context | Tone |
|---|---|
| Onboarding / first visit | Welcoming, orienting, calm confidence |
| Navigation and wayfinding | Precise, minimal, purposeful |
| Tool interfaces | Functional, clear, brief |
| Documentation | Instructive, direct, never condescending |
| Empty states | Encouraging, specific about next action |
| Errors | Honest, non-alarming, immediately actionable |
| Success / confirmation | Acknowledging, forward-looking — not celebratory |
| Partner-facing | Professional, efficient, trust-building |
| Client-facing | Empowering, confident, ownership-framing |

### Copy by Scenario

**Navigation labels** — labels should express intent, not describe content.

| Generic | BrandOS |
|---|---|
| Design System | The System |
| Brand Book | Brand Identity |
| Documentation | How It Works |
| Setup | Get Started |
| Client Template | Your Environment |

**Empty states** — tell the user what will be here and how to make it appear. Never "Nothing here" or "No items found."
> "No frameworks yet. Add your first framework to start building your brand OS."

**Tool interfaces** — use the exact noun the user would use with a colleague. No instructional preamble.
> "CPM (cost per mille)" — not "Input your CPM value below"

**Error states** — specific, honest, forward-pointing.
> "You don't have access to this environment. Contact [name] to request access." — not "Access denied."

**Documentation** — treat the reader as a senior practitioner. No "simply," no "just." Structure every section: what it is → when to use it → how to use it → what not to do.

---

## Copy Update Process

When updating UX copy, follow this sequence:

1. **Identify the scenario** — which audience, which moment, what are they trying to do?
2. **Write three versions** — different frames, not minor word swaps
3. **Test against the seven principles** — remove qualifiers, check active voice, confirm it makes an argument
4. **Check audience fit** — correct technical level, correct use of "your" vs "the"
5. **Edit the Markdown source** — never edit generated HTML directly
6. **Run the doc generator** after any `cms/*.md` change: `cd cms/generator && npm run docgen`
7. **Review in context** — read the copy in the browser, in the actual interface
8. **Document the change** in `PROJECT_PROGRESS.md` — what changed, why, and the date

**Do not:**
- Update navigation labels without checking section headers and body copy for consistency
- Add warmth through filler words — write tighter instead
- Write copy that explains the platform — if extensive explanation is needed, the UX needs fixing
- Let error states ship without intentional copy

---

## Outcome Signals

These are the signals that indicate BrandOS is working.

**Team signals**
- Token and spec questions trend toward zero — the system answers them
- Every project starts from the system, not from a blank file
- New patterns are added to the system, not invented per-project and abandoned
- The doc generator runs after every docs change

**Partner signals**
- Briefing clarification emails decrease per engagement
- Off-brand partner outputs requiring revision decrease
- Partners describe By Default as "straightforward to work with"

**Client signals**
- Clients access their brand environment without prompting
- "Is this on-brand?" queries decrease — clients answer this themselves using the system
- Clients reference BrandOS frameworks in their own brand decisions
- Retention rate is higher for accounts with active platform access

**Platform health signals**
- No broken links in the generated docs site
- All pages pass WCAG 2.1 AA on an ongoing basis
- Lighthouse 90+ maintained — not just at launch
- Docs reviewed within 90 days — stale documentation is worse than none
- Token sync between Webflow variables and BrandOS tokens: always zero divergence

---

## Related Docs

- `cms/color.md` — colour token reference
- `cms/typography.md` — typography token reference
- `cms/spacing.md` — spacing token reference
- `cms/layout.md` — page layout hierarchy
- `cms/button.md` — button component usage
- `cms/seo-best-practices.md` — SEO meta requirements
- `PROJECT_BRIEF.md` — project intent and constraints
- `PROJECT_PROGRESS.md` — change log and task tracker
