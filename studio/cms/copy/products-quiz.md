# Products page — Quiz copy + logic

Dedicated copy reference for the Products page interactive quiz. Every copy string is here, organised by location, with the underlying logic spelled out so copy rewrites preserve the function.

Implementation: [studio/assets/js/products.js](../../assets/js/products.js)
Markup: [studio/products.html](../../products.html) (Section 3 — `<section class="products-quiz">`)
Parent copy doc: [products.md](products.md)

---

## What the quiz does

A 4-step decision tool that recommends 1–3 of the studio's five interactive products (Shop, Personalise, Storytell, Inform, Map) based on the visitor's intent, project format, content readiness, and deployment context. The visitor ends on a result screen with:

1. **1–3 recommended product cards** — each with a thumbnail, name, and tagline. Ordered by score and a tie-break priority.
2. **A combined advice paragraph** — one sentence about how we'll handle their content (from Q3) + one sentence about where it'll live (from Q4). Joined with a single space.
3. **Two CTAs** — "Start a project" (links to `/contact.html`) and "Start over" (resets the quiz to idle).

The quiz is **additive** — Q1 (multi-select) and Q2 (single-select) both add to a per-product score. Q3 and Q4 don't affect product recommendations; they only shape the advice paragraph. Q2 and Q4 each include a "Not sure yet" filler that contributes nothing — present so the option grid lays out as a clean rectangle.

---

## Quiz states (UI flow)

| State | When | What's visible |
|---|---|---|
| **idle** | Initial render | Intro pane ("Can't decide? — Choose your experience!") + Start quiz button |
| **quiz** | After clicking Start quiz | One step pane at a time (steps 1→4), progress stages, Previous/Next nav |
| **result** | After clicking "See result" on step 4 | Recommendation cards + combined advice + Start a project / Start over CTAs |

---

## Idle state

| Slot | Copy |
|---|---|
| Eyebrow | Can't decide? |
| Heading (h2) | Choose your experience! |
| CTA button | Start quiz |

---

## Step 1 — Intent (multi-select)

**Goal:** Identify the *outcome* the visitor wants their experience to drive. This is the strongest signal — it maps directly to a product's reason for existing.

**Mechanic:** multi-select. Visitor can pick 1–4 options. Each selected option adds to one or more products' scores. The "Next" button stays disabled until at least one option is selected.

| Slot | Copy |
|---|---|
| Question | What action should this drive? |
| Sublabel | Pick all that apply |

### Options and their logic

| Option | Maps to (each +1) | Why |
|---|---|---|
| Buy something | **Shop** | Commercial intent. The only product built around product discovery → purchase. |
| Learn something new | **Storytell + Inform** | Information intent. Both products turn content into something digestible — Storytell for narrative, Inform for data. |
| Customise something | **Personalise** | Tailored-interaction intent. The only product built around per-visitor adaptation. |
| Explore a destination | **Map** | Place-based intent. The only product built around geography. |

---

## Step 2 — Project format (single-select)

**Goal:** Identify the *shape* of the project. Same underlying intent might be a campaign vs. a tool vs. a story — and that changes which products are most useful.

**Mechanic:** single-select. Each option (except "Not sure yet") adds to two or three products' scores — reflecting that most project formats benefit from product combinations.

| Slot | Copy |
|---|---|
| Question | What kind of project is this? |
| Sublabel | Pick one |

### Options and their logic

| Option | Maps to (each +1) | Why |
|---|---|---|
| Campaign or launch | **Shop + Personalise + Storytell** | Broad campaign work — needs a product story, a way to tailor it, and often a commerce hook. |
| Guide/Recommend tool | **Personalise + Shop + Map** | Recommendation experiences — personalisation logic plus shoppable destinations and/or place-based picks. |
| A short/long story | **Storytell + Inform** | Pure narrative work — long-scroll storytelling backed by facts. |
| A research/insight piece | **Inform + Storytell** | Same pair, inverted weight — data-led with narrative scaffolding. |
| Explore a location | **Map + Personalise** | Place-driven projects that adapt to the visitor (e.g. itinerary builders, store finders with picks). |
| Not sure yet | *(no contribution — filler so the grid is rectangular)* | The visitor can still proceed; their Q1 picks alone drive scoring. |

---

## Step 3 — Content readiness (single-select)

**Goal:** Surface the visitor's *asset position* so we can preview how we'd start working. Doesn't affect product recommendations — only changes one sentence in the result paragraph.

**Mechanic:** single-select. Each option maps 1:1 to one of three advice sentences.

| Slot | Copy |
|---|---|
| Question | What content do you have to start with? |
| Sublabel | Pick one |

### Options and their advice sentences

| Option | Advice sentence shown in result |
|---|---|
| Campaign assets | **We can work with what you already have.** |
| New assets needed | **We can create assets from scratch.** |
| A mix of both | **We'll work with what you have and fill the gaps.** |

> Source: `Q3_ADVICE` in [products.js:117-121](../../assets/js/products.js#L117-L121).

---

## Step 4 — Deployment context (single-select)

**Goal:** Identify *where* the experience will live. Doesn't affect product recommendations — only adds a sentence to the result paragraph ("This lives as {phrase}.").

**Mechanic:** single-select. Each option (except "Not sure yet") maps to a deployment phrase that gets stitched into the template sentence.

| Slot | Copy |
|---|---|
| Question | Where will the audience encounter this? |
| Sublabel | Pick one |

### Options and their deployment phrases

Template: **This lives as {phrase}.**

| Option | Phrase | Resulting sentence |
|---|---|---|
| A venue or store | an in-venue activation | This lives as an in-venue activation. |
| Inside an app or platform | embedded into your platform | This lives as embedded into your platform. |
| On its own dedicated site | a standalone microsite | This lives as a standalone microsite. |
| Not sure yet | *(no phrase)* | *(no sentence rendered)* |

> Source: `Q4_DEPLOYMENTS` in [products.js:123-128](../../assets/js/products.js#L123-L128).

---

## Step navigation (footer buttons)

| State | Left button | Right button |
|---|---|---|
| Step 1 | Previous *(disabled — no prior step)* | Next *(disabled until at least one option selected)* |
| Steps 2–3 | Previous | Next *(disabled until an option selected)* |
| Step 4 | Previous | **See result** *(disabled until an option selected)* |

---

## Result state

This is the payoff screen. Three things appear, top to bottom:

### 1. Lead-in

`Our recommendations`

### 2. 1–3 product cards

Rendered in priority order after scoring. Each card has:

- **Thumbnail** — placeholder image (currently a 1080×1080 generic placeholder from `bydefault.design/image/1080x1080`; per-product thumbnails are a future task)
- **Product name** (e.g. "Personalise") — from `PRODUCT_NAMES` in [products.js:85-91](../../assets/js/products.js#L85-L91)
- **Tagline** — one short sentence per product, from `PRODUCT_TAGLINES` in [products.js:93-99](../../assets/js/products.js#L93-L99)

#### Product names + taglines (as rendered in result cards)

| Product | Name | Tagline |
|---|---|---|
| SHOP | Shop | Product discovery, made immersive. |
| PERSONALISE | Personalise | A unique experience for every visitor. |
| STORYTELL | Storytell | Made for stories worth finishing. |
| INFORM | Inform | Make data fun to experience. |
| MAP | Map | Tell stories through destinations. |

> **Drift note (worth flagging if rewriting):** the result-card tagline for **Personalise** is `"A unique experience for every visitor."`, but Section 2's walkthrough card tagline is `"A tailored experience for every visitor."` Same product, two different taglines. Same drift on **Inform**: the result-card tagline is `"Make data fun to experience."` vs Section 2's `"Make complex data fun to experience."` Pick one and align both.

### 3. Combined advice paragraph

A single sentence composed of:

- **Q3 advice sentence** (from the table above), followed by
- **Q4 deployment sentence** (from the table above, if not "unsure"),

joined with a single space. If Q4 is "unsure", only the Q3 sentence is rendered.

Examples:

- Q3 = `mix`, Q4 = `site`: *"We'll work with what you have and fill the gaps. This lives as a standalone microsite."*
- Q3 = `existing`, Q4 = `unsure`: *"We can work with what you already have."*
- Q3 = `new`, Q4 = `venue`: *"We can create assets from scratch. This lives as an in-venue activation."*

### 4. Action buttons

| Button | Behaviour |
|---|---|
| **Start a project** | Anchors to `/contact.html` |
| **Start over** | Resets the quiz to idle state (clears all selections, returns to intro pane) |

---

## Scoring model — exact algorithm

1. **Initialise** all five products with score 0:
   `{ SHOP: 0, PERSONALISE: 0, STORYTELL: 0, INFORM: 0, MAP: 0 }`
2. **Apply Q1 contributions.** For each option the visitor selected, add the points from the Q1 map to each product listed for that option.
3. **Apply Q2 contributions.** Add the points from the Q2 map for whichever single option the visitor picked. (If Q2 = "Not sure yet", nothing is added.)
4. **Filter** to products with score > 0.
5. **Sort** by score descending, breaking ties by `PRODUCT_PRIORITY` order:
   `SHOP > PERSONALISE > STORYTELL > INFORM > MAP`.
6. **Cap** at the top 3.

The result is a 1–3 item list of product keys, rendered as cards in that order.

> Source: `computeProductRecommendations` in [products.js:133-153](../../assets/js/products.js#L133-L153).

### Why the priority order matters

When two products tie on score, the one earlier in `PRODUCT_PRIORITY` wins. This is a deliberate ranking signal — Shop is the most commercially urgent product, Map the most niche. Tie-breaks are common because most Q1/Q2 contributions are +1, so ties are the rule, not the exception.

Practical consequence: **a visitor who picks every Q1 option (all 4) will see Shop + Personalise + Storytell, not the full five.** Map and Inform get dropped because the cap is 3 and the priority order excludes them last.

---

## Worked examples

### Example 1 — Pure commerce launch

| Step | Answer |
|---|---|
| Q1 | Buy something |
| Q2 | Campaign or launch |
| Q3 | Campaign assets |
| Q4 | On its own dedicated site |

Scoring math:

- Q1 `buy` → SHOP +1
- Q2 `campaign` → SHOP +1, PERSONALISE +1, STORYTELL +1
- **Totals:** SHOP 2, PERSONALISE 1, STORYTELL 1
- Sorted (score desc, tie-break by priority): **SHOP, PERSONALISE, STORYTELL**
- Cards rendered: 3
- Advice paragraph: *"We can work with what you already have. This lives as a standalone microsite."*

### Example 2 — Editorial + research piece

| Step | Answer |
|---|---|
| Q1 | Learn something new (selected) |
| Q2 | A short/long story |
| Q3 | A mix of both |
| Q4 | Inside an app or platform |

Scoring math:

- Q1 `learn` → STORYTELL +1, INFORM +1
- Q2 `story` → STORYTELL +1, INFORM +1
- **Totals:** STORYTELL 2, INFORM 2
- Sorted (score desc, tie-break by priority — STORYTELL index 2 < INFORM index 3): **STORYTELL, INFORM**
- Cards rendered: 2
- Advice paragraph: *"We'll work with what you have and fill the gaps. This lives as embedded into your platform."*

### Example 3 — Visitor picks everything in Q1 + "Not sure yet" in Q2

| Step | Answer |
|---|---|
| Q1 | Buy something, Learn something new, Customise something, Explore a destination |
| Q2 | Not sure yet |
| Q3 | New assets needed |
| Q4 | Not sure yet |

Scoring math:

- Q1 `buy` → SHOP +1
- Q1 `learn` → STORYTELL +1, INFORM +1
- Q1 `customise` → PERSONALISE +1
- Q1 `explore` → MAP +1
- Q2 `unsure` → no contribution
- **Totals:** SHOP 1, PERSONALISE 1, STORYTELL 1, INFORM 1, MAP 1 (five-way tie)
- Sorted (all tied, tie-break by priority): SHOP, PERSONALISE, STORYTELL, INFORM, MAP
- Cap at 3: **SHOP, PERSONALISE, STORYTELL**
- Cards rendered: 3 (Inform and Map dropped — see priority note above)
- Advice paragraph: *"We can create assets from scratch."* (Q4 unsure → no deployment sentence)

### Example 4 — Location-led travel guide

| Step | Answer |
|---|---|
| Q1 | Customise something, Explore a destination |
| Q2 | Explore a location |
| Q3 | New assets needed |
| Q4 | On its own dedicated site |

Scoring math:

- Q1 `customise` → PERSONALISE +1
- Q1 `explore` → MAP +1
- Q2 `location` → MAP +1, PERSONALISE +1
- **Totals:** PERSONALISE 2, MAP 2
- Sorted (tie-break by priority — PERSONALISE index 1 < MAP index 4): **PERSONALISE, MAP**
- Cards rendered: 2
- Advice paragraph: *"We can create assets from scratch. This lives as a standalone microsite."*

---

## Full scoring matrix at a glance

How many points each answer combination contributes to each product:

### Q1 (multi-select, additive)

| Q1 answer | SHOP | PERSONALISE | STORYTELL | INFORM | MAP |
|---|:---:|:---:|:---:|:---:|:---:|
| Buy something | **1** | – | – | – | – |
| Learn something new | – | – | **1** | **1** | – |
| Customise something | – | **1** | – | – | – |
| Explore a destination | – | – | – | – | **1** |

### Q2 (single-select)

| Q2 answer | SHOP | PERSONALISE | STORYTELL | INFORM | MAP |
|---|:---:|:---:|:---:|:---:|:---:|
| Campaign or launch | **1** | **1** | **1** | – | – |
| Guide/Recommend tool | **1** | **1** | – | – | **1** |
| A short/long story | – | – | **1** | **1** | – |
| A research/insight piece | – | – | **1** | **1** | – |
| Explore a location | – | **1** | – | – | **1** |
| Not sure yet | – | – | – | – | – |

---

## Copy rewriting checklist (what to keep functional)

When rewriting any of this copy, keep these things in mind so the quiz still works:

1. **Q2 and Q4 each need a "Not sure yet" filler option** (or equivalent) so the option grids lay out as clean rectangles. Whatever wording you choose, it must map internally to `data-answer="unsure"` and contribute nothing to scoring.
2. **Q3 advice sentences should stand alone as complete sentences** — they're paired with a separate Q4 sentence in the same paragraph, joined by a single space. They must read naturally before *and* after the Q4 sentence.
3. **Q4 phrases must complete the sentence "This lives as ___."** — they're inserted as fragments, not sentences. Match the indefinite-article grammar ("an in-venue activation", "a standalone microsite") so the template reads naturally.
4. **Product taglines have two versions today** — one for Section 2 walkthrough cards (in `products.html`), one for result cards (in `products.js`). Fix the drift in either direction, but pick one source of truth.
5. **The 5 product names** (Shop, Personalise, Storytell, Inform, Map) appear in many places. If you rename any, also update `PRODUCT_NAMES`, `PRODUCT_PRIORITY` (uppercase keys), the `data-product` attributes on the walkthrough sections, and the Section 2 H2 / number labels.
6. **The "Start a project" and "Start over" result buttons** are functional UI — preserve those affordances. The "Start a project" link target (`/contact.html`) is the only result CTA going to contact; the walkthrough card CTAs go to `/book.html`.
