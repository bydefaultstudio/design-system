# Session Handover — `.page-header` component + sticky-jump fix pending

## Next up — implement the sticky-jump fix (plan ready, NOT applied)

User reported a visual "jump" of `.page-header` during article (and case-study) transitions. **Diagnosis confirmed:** Barba's `push-up` and `conveyor-up` transitions in [studio/assets/js/studio-barba.js:282-326](studio/assets/js/studio-barba.js#L282) apply `transform: translateY(...)` to the Barba container. Per CSS spec, an ancestor with `transform` creates a containing block for `position: sticky` AND `position: fixed` descendants — so `.page-header[data-sticky]` detaches from the viewport mid-transition, rides along with the transformed container, then snaps back. That snap is the jump.

**Switching `sticky` → `fixed` does not help** (same containing-block constraint). Real fix is to fade during transitions — same pattern that the old `.close-btn-wrap` used (`body.is-animating { opacity: 0 }`) before the close button got folded into `.page-header`.

**Plan file:** `/Users/erlenmasson/.claude/plans/i-think-i-want-cosmic-trinket.md`

**Three CSS additions to [studio/assets/css/studio.css](studio/assets/css/studio.css):**
1. Add `transition: opacity var(--duration-xs) var(--ease-out)` to `.page-header[data-sticky]` (~line 820)
2. Same on `.section-header` (~line 776) — has the same latent issue
3. New rule near the existing is-animating block (~line 2050):
   ```css
   body.is-animating .page-header[data-sticky],
   body.is-animating .section-header {
     opacity: 0;
     pointer-events: none;
   }
   ```

No JS, no markup, no Barba changes.

---

## What was done this session

### 1. `--studio-bar-height` token + `nav-wrapper` → `sidebar-header` rename

- New token `--studio-bar-height: 4rem` in [studio/assets/css/studio.css](studio/assets/css/studio.css) `:root`.
- Applied as `min-height` to three bars: top of sidebar, bottom of sidebar (`.sidebar-footer`), and main content header (`.section-header`).
- Renamed `.nav-wrapper` → `.sidebar-header` for symmetry with `.sidebar-footer`. Touched 4 CSS occurrences + 20 HTML files.

### 2. New `.page-header` component (top-of-page bar with close button)

Replaces both the misuse of `.section-header` at page-top AND the floating `.close-btn-wrap` overlay.

**Markup pattern** (lives inside `.page-wrapper`, before any `<section>`):
```html
<div class="page-header" data-sticky>
  <div class="page-header-inner">
    <div class="page-header-start">
      <p class="eyebrow-header">{Title}</p>
    </div>
    <div class="page-header-end">
      <span class="close-btn-label">ESC</span>
      <a id="studio-close-btn" class="button close-btn"
         data-variant="transparent" data-icon-only data-size="small"
         aria-label="Close" href="index.html">{X icon}</a>
    </div>
  </div>
</div>
```

**Default behaviour:** not sticky. `data-sticky` (attribute presence) opts in to `position: sticky; top: 0; z-index: 100`.

**Pages with `.page-header`:**
- L1 hand-authored (5): services, about, contact, 404, styleguide (sticky)
- L2 generated (12): 9 work pages, 3 articles — all sticky
- Templates (3): page-template, case-study-inner, article-inner

**L0 (index.html)** does not use `.page-header` — home is headerless.

### 3. `.page-header-inner` split (separate full-bleed surface from inset content)

`.page-header` now owns: background, sticky behaviour. `.page-header-inner` owns: flex layout, `min-height: var(--studio-bar-height)`. User has been iterating on padding / border placement — current state has horizontal padding on the outer (`padding: 0 var(--studio-gap)`) and the border-bottom on the inner (so border is inset, not full-bleed).

### 4. Close button uses `data-variant="transparent"`

`.close-btn` simplified to one rule: `.close-btn { --button-color: var(--text-primary); }`. Variant handles bg, border, text-color, hover. Twelve lines of custom CSS removed.

### 5. Sidebar nav links spread evenly

`.nav` got `justify-content: space-between` + `gap: var(--space-s)`. `.nav-link` lost `flex: 1`. Links are content-sized, hugging left/right edges of the sidebar header.

### 6. `--headline-size` token now `clamp(var(--font-6xl), 5vw, var(--font-9xl))`

Was `1rem + 5vw` preferred. `.hero-title` and `.services-headline` migrated from raw `5vw` to `var(--headline-size)`.

### 7. `data-grid` is now universal (not scoped to `.section-content`)

User removed `.section-content` prefix from all 28 grid rules in studio.css. `[data-grid]` works on any element. Empty `.section-content { }` rule remains as dead code at [studio/assets/css/studio.css:857-858](studio/assets/css/studio.css#L857) — could be deleted.

User considered renaming to `data-bd-grid` for namespacing but decided against it — collision risk is functionally zero today.

### 8. Removed `data-inset="all"` from `.case-study-wrapper`

Across 1 generator template + 9 L2 work outputs. Wrapper is now edge-to-edge of `.main`.

### 9. Case study eyebrow text: "Work" → "Case Study"

Across 1 generator template + 9 L2 work outputs.

---

## Outstanding flags / future tasks

- **`.about-wrapper` has `overflow: hidden`** ([studio/assets/css/studio.css:1048](studio/assets/css/studio.css#L1048)) which breaks `position: sticky` on its descendants — known issue, deferred per user. Hero thumbnail already has its own clipping; the wrapper rule is redundant. Fix: remove the `overflow: hidden`.
- **services.html `.page-wrapper` lacks `data-inset="all"`** while every other L1 page has it. Visual inconsistency — flagged but not addressed.
- **L2 generator not run after template updates.** Generator templates ([studio/cms/generator/templates/case-study-inner.html](studio/cms/generator/templates/case-study-inner.html), [article-inner.html](studio/cms/generator/templates/article-inner.html)) are in sync with the existing 12 L2 outputs that were hand-updated. If markdown sources change, run `npm run gen` from `studio/cms/generator/`.
- **Empty `.section-content { }` rule** — dead code, deletable any time.
- **`.about-headline` and `.case-study-title`** — could migrate to `var(--headline-size)` for consistency with `.hero-title` / `.services-headline`. Out of scope this session.

---

## Verification commands

```bash
cd "$STUDIO_ROOT"

# Counts that should hold after the sticky-jump fix is applied:
grep -rl 'class="page-header"' studio/ | wc -l        # 20 (5 L1 + 12 L2 + 3 templates)
grep -rl 'class="page-header-inner"' studio/ | wc -l  # 20 (1:1 with page-header)
grep -rl 'id="studio-close-btn"' studio/ | wc -l      # 20
grep -rln 'close-btn-wrap' studio/ cdn/               # zero
grep -rln 'nav-wrapper' studio/ cdn/                  # zero

# Local dev:
npm run serve:studio   # → http://localhost:2000/
```
