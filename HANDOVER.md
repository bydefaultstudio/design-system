# Session Handover — Studio Barba rebuild (Phases 0–5 committed; Issue A + 3 review items open)

## Status (read first)

The clean Barba transition rebuild is implemented, the post-rebuild transition
bugs are fixed and user-verified, Phase 4 docs are rewritten, and Phase 5
expert review (barba+gsap+a11y) is done — its contained blockers are fixed.
All **committed, unpushed**. Authoritative plan:
`~/.claude/plans/is-there-still-a-wild-hickey.md` (architecture + amendments
A–J). Issue-B follow-up: `~/.claude/plans/please-read-the-handover-cosmic-cherny.md`.

**Commits (unpushed — nothing has been pushed):**
```
55acff6  studio: barba phase 4 docs + phase 5 review fixes                                       ← Phase 4 README + Phase 5 fixes (book/case-studies stage wrappers, dup id=main, inert leaving container, scale clearProps)
36df122  studio: finalise barba transition rebuild — stage-only transforms, fix exit occlusion  ← Phase 3 + Issue B + items 1&2 + item 5 + products stage wrapper (VERIFIED, committed)
93ace6e  studio: move page transforms onto the stage; pin only the leaving container             ← Phase 2
c740604  studio: add data-barba-stage wrapper inside every barba container                       ← Phase 1
ce4c3a5  studio: freeze parallax scrolltriggers on transition instead of fading them             ← Phase 0
```

## What was fixed in 36df122 (all user-verified live on localhost:2000)

- **Phase 3**: one `buildTransition` factory + `SCENARIOS` table
  (enter/exit/swap/advance/fade), serial page-header, reduced-motion guard,
  masking machinery deleted. (Was the previously-uncommitted working tree.)
- **Issue B (exit content-whip)**: deep-scrolled `exit` no longer whips
  above-scroll content. Fix = a **static viewport-STRIP clip-path** on the
  leaving stage in the `drop` branch — `inset(scrollOffset 0 bottomInset 0)`,
  `bottomInset = max(0, stageHeight − scrollOffset − innerHeight)`. Stage
  height + scroll offset captured pre-pin via `_pendingScrollOffset` /
  `_pendingStageHeight` (mirrors the `_pendingNextReadTop` discipline),
  threaded studioLeave → buildTransition opts → installShape ctx. Guarded
  `scrollOffset > 0`. `clipPath` added to the after-hook stage clearProps.
- **Items 1 & 2 (no overlay on enter / no home on exit)**: ROOT CAUSE was
  **not** the clip — it was an opaque `background` on the never-transformed
  `[data-barba="container"]` (the `body.is-animating [data-studio-role="leave"]`
  leave-pin rule). The container never moves; only the inner stage does, so
  the opaque container sat static over the overlay (enter) and home (exit).
  Fix (CSS only): removed `background` from the leave-pin rule; moved the page
  background onto `.page-wrapper` (inside the stage, rides the transform);
  `.main`/`.layout` stay as the opaque backstop. See memory
  `project_studio_container_never_bg`. The earlier amendment "keep background
  on the container" was itself the latent bug.
- **products.html**: added its missing `[data-barba-stage]` wrapper (it was
  the only page where `stageOf()` fell back to the container). Verified
  structurally identical to about.html; CSS already had both
  `> [data-barba-stage] > .page-wrapper` and the `> .page-wrapper` fallback.
- **Item 5**: `.case-study-slider` clicks now resolve to the standard `swap`
  (removed from the next-read detector), not the `advance` push.

## Selective-commit method used (repeat for future Barba commits)

studio-barba.js is entirely Barba work → staged whole. studio.css and
products.html are MIXED with the user's unrelated working-tree edits
(ticker rename/markup, `.next-read --space-6xl`, `.img-headline` radius,
`.article-lead` bg, products hero `data-bd-*` tweaks). Method:
`git diff <file> > /tmp/p; head -N` (or sed-select) the Barba/occlusion hunks
only → `git apply --cached`. The Barba CSS region is ≤ ~line 1042; all the
user's CSS feature edits are ≥ ~line 1203 (clean split). Verify
`git diff --cached` has zero ticker/next-read/img-headline/`color-mix(yellow|
green|blue)` before committing. Those user edits remain unstaged in the
working tree — leave them.

## Open / outstanding (in priority order)

1. **Issue A — still open, deferred by user.** On `enter` (home→page), the
   entering page's `[data-bd-animate]`/`[data-text-animate]` content is
   FOUC-hidden (`.js [data-bd-animate]{opacity:0}`) until `bdAnimationsInit`
   runs in the after-hook rAF, so the page rises visually empty. Handover's
   original premise was WRONG (both experts): `bdAnimateElementsIn` targets
   `[data-bd-enter]`, NOT `[data-bd-animate]`; only `bdAnimationsInit` reveals
   the FOUC set and it's the invariant-forbidden call under a live transform.
   Viable fix shapes (NOT yet chosen): (a) CSS escape-hatch keyed on the
   already-set `body.is-animating [data-studio-role="enter"]` setting the FOUC
   set to opacity:1 for the rise; (b) a self-contained `studio-barba.js`
   reveal — never via `bdAnimationsInit`/`ctx`/ScrollTrigger. Both share a
   minor post-settle re-reveal residual (only removable in the off-limits
   bd-animations.js). User asked to revisit later.
2. **a11y #2 + #4 — DONE (191cfb5).** Persistent visually-hidden
   `.route-status` (`role=status aria-live=polite aria-atomic`) added as a
   sibling of `.page-overlay` (outside the Barba wrapper) across all hand-
   authored sources + the L2 generator template; L2 regenerated. `afterEnter`
   writes `data-page-eyebrow` (or `document.title` fallback) into it after
   `updateMetaFromContainer`. `.page-overlay` is now `aria-hidden="true"`.
   `.route-status` CSS mirrors `.cycle-word-sr`. Not yet user-verified with a
   real screen reader (worth a live SR pass alongside the reduced-motion sweep).
3. **gsap risk #4 (non-blocking, behavioural)** — the parallax-freeze loop
   (~studio-barba.js:752) filters on `[data-bd-parallax]` only; scrub-group
   ScrollTriggers (`data-bd-scrub-group`) on a scrolled leaving page are NOT
   frozen and snap to scroll-0 (the CSS opacity-mask that used to hide this
   was deleted in Phase 3). Consider widening the predicate to all scrub
   triggers inside `leavingEl`. Team-decision flagged by gsap-expert.
4. **Reduced motion + SR** — never tested live (carry-forward). Guard is
   code-correct per a11y-expert; wants a manual sweep of all scenarios with
   `prefers-reduced-motion`, plus a real screen-reader pass on the new
   `.route-status` announcement.
5. **Push** — only on explicit user approval (CLAUDE.md §2). Ask once.

**Phase 5 verdicts:** gsap = GO (2 nits, one applied: `scale` in clearProps;
risk #3 above open). barba = was NO-GO on missing stage wrappers — FIXED in
55acff6 (book.html + case-studies.html), now GO. a11y = NO-GO on 3 blockers:
#1 dup id=main FIXED (55acff6), #3 inert leaving container FIXED (55acff6),
#2 route announcement + #4 overlay aria-hidden FIXED (191cfb5). All a11y
blockers cleared (pending live SR verification).

## Locked architecture (one paragraph)

`[data-barba="container"]` is **never** transformed / never `position:absolute`
/ **never opaque-backgrounded**. One inner `[data-barba-stage]` is the only
transformed node; the page background lives on `.page-wrapper` inside it so it
rides the transform. Leaving container pinned `position:fixed` scoped to
`[data-studio-role="leave"]` (atomic before-hook). Taxonomy: enter / exit /
swap / advance / fade via one `buildTransition` factory + `SCENARIOS` table.
`exit` strip-clips the leaving stage (paint-only, drop-only). Reduced motion:
one duration:0 guard in the factory.

## Don't repeat / dead-ends

- `bd-animations.js` OFF-LIMITS to edit (memory). `bdAnimateElementsIn` ≠
  `[data-bd-animate]` (it's `[data-bd-enter]`) — the Issue-A premise trap.
- clip-path on the **container** = containing-block trap. Issue-B clip is on
  the **stage**, drop-only, static (never tweened).
- Opaque background on the container/leave-pin = occludes overlay+home (the
  items 1&2 bug). Background belongs on `.page-wrapper`.
- Runtime/behavioural bugs here recur and get misattributed (clip-path was
  blamed for items 1&2; it was the container bg). Always reproduce live +
  parallel barba/gsap experts before editing (`feedback_validate_repeat_fixes`,
  `feedback_structural_wrapper_audit`).
- Dev server: `npm run serve:studio` → port 2000, served as root. User runs
  it in their own terminal (background runner reaps it).

## Memory touched / relevant

`project_studio_container_never_bg` (new), `project_studio_barba_gsap_rebuild`,
`feedback_sticky_transform_gotcha`, `feedback_structural_wrapper_audit`,
`feedback_validate_repeat_fixes`, `feedback_bd_animations_lightweight`,
`feedback_commit_between_phases`, `feedback_push_during_multistep`,
`project_barba_scroll_debug`.
