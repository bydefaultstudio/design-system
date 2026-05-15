# Products page — copy

All copy strings on `/products.html`, ordered top to bottom. Strings sourced from JavaScript (quiz scoring + result text) are flagged.

---

## Page metadata

| Field | Copy | Limit |
| --- | --- | --- |
| Title | Products — By Default | 50–60 chars (currently 21 — too short) |
| Meta description | Five interactive products built to turn content into memorable experiences that drive engagement. | 150–160 chars (currently 98 — short) |
| OG title | Products — By Default | — |
| OG description | (same as meta description) | — |
| OG image alt | By Default — Products | — |
| Twitter description | (same as meta description) | — |

---

## Page header (persistent top bar — L1+ pages)

`Eyebrow`

Products

`Close button`

ESC (a11y label: **Close**) → /index.html

---

## Section 01 — Intro

`Headline`

(h1): Turn content into memorable experiences that drive engagement.

`Subline`

Each product is built for a different job. Pick one, mix several — every interaction is captured, every campaign comes with a report.

---

## Section 02 — Walkthrough (sticky-scroll image swap)

`Section eyebrow`

The products

### 01 / 05 — Shop

`Heading`

(h2): Shop

`Tagline`

Product discovery, made immersive.

`Description`

Your products deserve more than a grid. SHOP is a scroll that lets people fall for a piece before they ever click 'add to bag'.

`Use cases (lead-in: "This is great for:")`

- Lookbooks
- Gift guides
- Product launches
- Editorial campaigns
- Drop announcements

`CTA`

**Book a call** → /book.html

---

### 02 / 05 — Personalise

`Heading`

(h2): Personalise

`Tagline`

A tailored experience for every visitor.

`Description`

Experiences that adapt in real time to each visitor's interests — guiding them through your products, places, or stories.

`Use cases`

- Style finders
- Travel quizzes
- Product matchers
- "What's right for me" tools
- Curated picks

`CTA`

**Book a call** → /book.html

---

### 03 / 05 — Storytell

`Heading`

(h2): Storytell

`Tagline`

Made for stories worth finishing.

`Description`

Deep-scroll experiences that turn brand stories, reports, and announcements into something worth finishing — for audiences that won't sit through a press release.

`Use cases`

- Brand manifestos
- Annual reports
- Founder stories
- Sustainability reports
- Big announcements

`CTA`

**Book a call** → /book.html

---

### 04 / 05 — Inform

`Heading`

(h2): Inform

`Tagline`

Make complex data fun to experience.

`Description`

Information that performs. INFORM turns dry research into an experience your audience wants to spend time with.

`Use cases`

- Industry surveys
- White papers
- Insight reports
- Audience research
- Trend studies

`CTA`

**Book a call** → /book.html

---

### 05 / 05 — Map

`Heading`

(h2): Map

`Tagline`

Tell stories through destinations.

`Description`

Take your audience on a journey through real places — zoom in, explore, discover. The story unfolds where it actually happens.

`Use cases`

- Store locators
- Travel guides
- Event maps
- Regional showcases
- Tour itineraries

`CTA`

**Book a call** → /book.html

---

## Section 03 — Quiz (interactive, four steps)

### Idle state

`Eyebrow`

Can't decide?

`Heading`

(h2): Choose your experience!

`CTA`

**Start quiz**

---

### Step 1 — multi-select

`Question`

What action should this drive?

`Sublabel`

Pick all that apply

`Options`

- Buy something
- Learn something new
- Customise something
- Explore a destination

---

### Step 2 — single-select

`Question`

What kind of project is this?

`Sublabel`

Pick one

`Options`

- Campaign or launch
- Guide/Recommend tool
- A short/long story
- A research/insight piece
- Explore a location
- Not sure yet

---

### Step 3 — single-select

`Question`

What content do you have to start with?

`Sublabel`

Pick one

`Options`

- Campaign assets
- New assets needed
- A mix of both

`Result advice mapped to this answer (sourced from products.js — Q3_ADVICE)`

- Campaign assets: **We can work with what you already have.**
- New assets needed: **We can create assets from scratch.**
- A mix of both: **We'll work with what you have and fill the gaps.**

---

### Step 4 — single-select

`Question`

Where will the audience encounter this?

`Sublabel`

Pick one

`Options`

- A venue or store
- Inside an app or platform
- On its own dedicated site
- Not sure yet

`Result advice mapped to this answer (sourced from products.js — Q4_DEPLOYMENTS)`

Sentence template: **This lives as {phrase}.** — phrase comes from the chosen deployment:

- A venue or store: **This lives as an in-venue activation.**
- Inside an app or platform: **This lives as embedded into your platform.**
- On its own dedicated site: **This lives as a standalone microsite.**
- Not sure yet: (no sentence rendered)

---

### Step navigation buttons (footer)

- Previous step: **Previous**
- Next step (steps 1–3): **Next**
- Last step (step 4): **See result**

---

### Result state

`Lead-in`

Our recommendations

`Body`

1–3 product cards rendered in priority order: SHOP → PERSONALISE → STORYTELL → INFORM → MAP. Each card shows the product name and tagline from Section 02 (sourced from products.js — `PRODUCT_NAMES` + `PRODUCT_TAGLINES`).

`Result advice (combined)`

One paragraph: the Step 3 content advice + the Step 4 deployment sentence, joined with a space.

`CTAs`

- **Start a project** → /contact.html
- **Start over** (resets the quiz)

---

## Section 04 — Deployment

`Section eyebrow`

Where it goes live

`Headline`

(h2): Where your experience lives.

`Tile 1 — Standalone`

Title: **Standalone**
Body: Its own URL, built, hosted, and ready to launch as a campaign destination.

`Tile 2 — Embedded`

Title: **Embedded**
Body: Slotted into your existing site or app — right where your audience already is.

`Tile 3 — In-venue`

Title: **In-venue**
Body: Activated at events with QR signage and second-screen experiences — ready to bring physical audiences in.

---

## Section 05 — Reporting

`Section eyebrow`

Reporting

`Headline`

(h2): Every interaction, captured and reported.

`Subline`

Real audience behaviour, real numbers, real takeaways — yours after every campaign.

---

## Section 06 — CTA (closing)

`Section eyebrow`

Let's talk

`Heading`

(h2): We'd love to partner with you and your team.

`Body`

This paragraph demonstrates how body text will look across your layout. Bold text adds emphasis, while italics offer a subtle highlight.

`CTA`

**Book a call** → /book.html

---

## Footer

`Explore column`

- Home → /
- Work → /case-studies.html
- News → /news.html

`Brand tagline`

A *different* standard

`Get in touch column`

- newbiz@bydefault.studio (mailto)
- LinkedIn → linkedin.com/company/bydefaultstudio

`Copyright`

© 2025 ByDefault

`Legal`

- Terms of Use → /terms.html
- Privacy Notice → /privacy.html
- Cookie Preferences (button — opens cookie modal)
- Accessibility → /accessibility.html
