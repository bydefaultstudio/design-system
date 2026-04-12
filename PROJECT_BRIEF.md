# By Default BrandOS

---

## 1. Project Summary

**In one sentence:**
A design and brand systems hub that serves as the internal single source of truth for By Default's brand identity and design tokens.

---

## 2. Problem & Opportunity

**Problem**
Brand and design assets are scattered across tools and documents, making it difficult for the internal team to maintain consistency across projects.

**Opportunity**
A centralized, multi-page hub can unify brand guidelines, design tokens, and system documentation — ensuring every project starts from the same foundation.

---

## 3. Goals

**Primary goals**
- Centralize all brand assets and design tokens in one place
- Speed up design-to-dev handoff with a living reference
- Enforce consistency across all By Default projects

**Secondary goals**
- Serve as onboarding material for new team members
- Provide a demonstrable showcase of the design system in action

---

## 4. Non-Goals (Out of Scope)

- No e-commerce or payment functionality
- No external-facing user accounts or authentication

---

## 5. Audience

**Primary audience**
Internal team — designers, developers, and stakeholders at By Default

---

## 6. Success Criteria

How will we know this worked?

- Team members use the hub as the go-to reference for brand and design decisions
- Reduced inconsistencies across projects
- Faster onboarding for new team members

---

## 7. Constraints & Requirements

**Timeline**
1–2 weeks from kickoff to initial launch

**Platforms**
Fully responsive (desktop, tablet, mobile)

**Technical constraints**
Built with the existing design system and static HTML/CSS/JS

**Accessibility**
WCAG 2.1 AA compliance

**Performance**
Lighthouse score 90+

---

## 8. Design & Build Notes

**Design system**
Use the shared design system with brand tokens defined in `assets/css/design-system.css`

**Content**
Content will be created during the build

**Brand identity**
Work in progress — brand tokens (fonts, colors) are partially defined and will be refined during the build

**Known risks**
None known at this time

---

## 9. Open Questions

- Final brand tokens (fonts, colors) to be confirmed during build

---

## 10. Component Roadmap

### Completed

- Foundation token system (colours, spacing, typography, radius)
- Dark mode system (`data-theme` + `prefers-color-scheme` fallback)
- Layout primitives (grid, blocks, sections, containers)
- Border utilities (composable architecture)
- Button component (`.button` with modifiers)
- Form elements (inputs, select, textarea, checkbox, radio, toggle, segmented control)
- Callout component (`.callout` with status variants)
- Disclosure component (native `details`/`summary`)
- Badge component (`.badge` with status variants)
- Card component (`.card` with flush and interactive variants)
- Breadcrumb component (`.breadcrumb`)
- Tabs component (`.tabs` / `.tab` with JS)
- Progress bar component (`.progress-bar` with status variants)
- Tooltip component (`data-tooltip` CSS-only)
- Toast component (`.toast` with JS)
- Code / Pre / Kbd styling
- Mark / Abbr / Figure styling
- Scrollbar styling
- Text selection styling

### Next Priorities

- Modal / Dialog component (native `<dialog>` element with JS open/close)
- Dropdown menu component
- Navigation components (top nav, sidebar nav — currently docs-specific in docs-site.css)
- Data table enhancements (sortable, selectable rows)
- Skeleton loading state
- Avatar / initials component
- Layout templates (documented full-page layouts using the grid and block system)

### Long-term Architectural Goals

- Migrate docs generator to support component status tracking
- Add a component playground page (live editable demos)
- Token export pipeline (generate tokens as JSON for use in other tools / native apps)
- Consider shadcn/ui migration path when React projects begin — document token mapping
