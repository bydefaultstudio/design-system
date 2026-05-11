# Homepage | By Default

## Positioning

By Default is a creative technology studio that builds the digital experiences brands and publishers need to be remembered. The homepage proves this with the showreel, stats, products, and case studies. The About page explains who you are and how you think. Same studio, two lenses.

The homepage answers three questions fast: what do you build, why does it work, and who is it for. Everything else is proof.

| Section | Job |
| --- | --- |
| Hero | Show the work. Let the reel do the talking. Establish visual credibility in the first 3 seconds. |
| Intro | Say what you do, who you do it for, and what makes it different. One clear sentence. |
| Why Interactive | Frame the problem. Give the reader a reason to care about interactive over static. |
| Case Studies | Prove the claim. Real clients, real outcomes. |
| What We Build | Show the product range. Let the reader self-select by use case. |
| Clients | Build trust. Logos, testimonials, specificity about who you work with. |
| Feed | Keep the site alive. Signal momentum. |
| Closing CTA | Convert. One clear next step. |

---

## Page metadata

| Field | Copy |
| --- | --- |
| Title | By Default \| Creative Technology Studio |
| Meta description | We build the digital experiences that turn audiences into participants. By Default is a creative technology studio working with brands and publishers worldwide. |
| OG title | By Default \| Creative Technology Studio |
| OG description | We build the digital experiences that turn audiences into participants. A creative technology studio working with brands and publishers worldwide. |
| OG image alt | By Default |
| Twitter title | By Default \| Creative Technology Studio |
| Twitter description | (matches meta description) |

---

## Section 01 | Hero (video reel)

Full-bleed showreel video with interactive cue cards.

- Cursor label on hover: **Play Reel**
- Video aria-label: **By Default showreel**

### Video cue cards (overlay tooltips during the reel)

| Range | Title | Excerpt | Link |
| --- | --- | --- | --- |
| 0:00–0:10 | Verizon HBCU | Culture-first AR that turned sponsorship into sold-out events across three cities | /work/transforming-presence-into-cultural-belonging.html |
| 0:11–0:19 | BlackDoctor | A trust-first rebrand for the platform reaching 26M people every month | /work/black-doctor.html |
| 0:23–0:28 | McDonald's Game | A gamified card game that turned a promo into culture. 3.3M impressions. | /work/turning-value-into-everyday-play.html |
| 0:29–0:31 | Starry | Making a new brand impossible to ignore in a saturated category | /work/starry.html |
| 0:32–0:40 | Interactive Display Ads | The ads people actually want to interact with | /work/interactive-display-ads.html |
| 0:44–0:50 | Mastercard | Location data turned into a discovery tool people wanted to explore | /work/mastercards-interactive-map.html |
| 0:51–0:55 | McDonald's Threadsetters | Crew uniforms turned into a cultural fashion moment | /work/mcdonalds-threadsetters.html |

---

## Section 02 | Intro

Centred block. Headline includes a cycling word. Followed by subline, button group, and client logo ticker.

`Headline (h1)`

Turn your audience into *[cycling word]*

`Cycling word options (animation: bounce-drop)`

participants *(default / SR-only fallback)*, explorers, advocates, customers, fans

`Subline`

We're a creative technology studio that builds the digital experiences brands and publishers need to earn attention, hold it, and turn it into something that lasts.

`CTAs`

**Book a call** → /contact.html

**See our work** → /work.html

`Logo ticker`

Logos injected by `studio-logos.js`. `data-exclude="country-and-town-house"` removes that logo from the home roster.

---

## Section 03 | Why interactive?

`Section header`

Why interactive?

`Headline (h2, two-tone)`

- Primary: **Attention is shrinking.**
- Faded: **Memory is rare.**

`Stat 1`

| Field | Copy |
| --- | --- |
| Figure | 1.7s |
| Label | The mobile scroll window |
| Copy | The time someone gives a piece of content before deciding to engage or scroll past. That's your entire window to earn it. |
| Source | SQ Magazine, social media attention span statistics |

`Stat 2`

| Field | Copy |
| --- | --- |
| Figure | 70% |
| Label | Forgotten in 24 hours |
| Copy | New information lost within a day. Attention without participation has a cost, and this is it. |
| Source | Ebbinghaus forgetting curve (referenced in *Why Interactive v2*) |

`Stat 3`

| Field | Copy |
| --- | --- |
| Figure | 54% |
| Label | Feel overwhelmed by content |
| Copy | Your audience isn't tuning you out. They're protecting themselves from the volume. Interactive earns its way in. |
| Source | *Why Interactive v2* — general consumer-content research (verify exact citation) |

---

## Section 04 | Case studies (dynamic)

`Section header`

Case studies

End icon: → /work (a11y label **See all work**, cursor label **View all**)

Cards rendered from `studio-content.json` where `featured: true`. Three slots, populated by `studio-home.js` from the case-study card template. Section currently hidden via inline `display:none` until first featured entries land.

Per card: client label, headline (animated word-by-word), stat (optional — arrow-up icon, value, caption), hero video thumbnail (16:9) with client logo overlay. Card links to the case study page.

---

## Section 05 | What we build

`Section header`

What we build

End icon: → /products.html (a11y label **See all products**)

`Headline (h2)`

Interactive products built for the moments that matter.

`Lead paragraph`

Purpose-built formats that work on their own or stack together depending on the brief. We handle the creative, the build, and the performance reporting, so you always know what landed and what to do next.

### 01. Shop

| Field | Copy |
| --- | --- |
| Subline | Product discovery, made immersive. |
| Description | Your products deserve more than a grid. Shop is a scroll-driven experience that lets people fall for a piece before they ever hit "add to bag." |
| CTA label | Drive revenue |
| Link | /products.html#shop |

### 02. Personalise

| Field | Copy |
| --- | --- |
| Subline | A different experience for every visitor. |
| Description | Experiences that adapt in real time to each visitor's interests, guiding them through your products, places, or stories based on what they actually care about. |
| CTA label | Match intent |
| Link | /products.html#personalise |

### 03. Storytell

| Field | Copy |
| --- | --- |
| Subline | Made for stories worth finishing. |
| Description | Deep-scroll experiences that turn brand stories, annual reports, and announcements into something your audience will actually reach the end of. Built for the people who won't sit through a press release. |
| CTA label | Hold attention |
| Link | /products.html#storytell |

### 04. Inform

| Field | Copy |
| --- | --- |
| Subline | Make data worth exploring. |
| Description | Information that performs. Inform turns research, insights, and complex data into an experience your audience wants to spend time with instead of skim past. |
| CTA label | Build authority |
| Link | /products.html#inform |

### 05. Map

| Field | Copy |
| --- | --- |
| Subline | Tell stories through real places. |
| Description | Take your audience on a journey through actual locations. Zoom in, explore, discover. The story unfolds where it happens. |
| CTA label | Inspire exploration |
| Link | /products.html#map |

---

## Section 06 | Clients

`Section header`

Clients

`Headline (h2)`

For **brand** and **publisher** teams investing in **interactive**

*(Bold spans render in `--text-primary`; surrounding text is `text-faded`.)*

`Lead paragraph`

From legacy media to category challengers, we work with the teams ready to build something their audience will actually remember.

`Testimonial slider`

Slides injected by `studio-testimonials.js`. Controls: progress bar, pause toggle, prev/next arrows.

---

## Section 07 | Feed (dynamic)

`Section header`

Feed

`Feed filter buttons (segmented control)`

- **All** (default, active)
- **Case studies** (`data-filter="case-study"`)
- **Articles** (`data-filter="article"`)

Feed items injected by `studio-feed.js` from `studio-content.json`. Scale transition between filtered views.

---

## Section 08 | Closing CTA

`Section header`

Let's talk

`Headline (h2)`

Ready to build something worth remembering?

`Paragraph`

Whether it's a brand, an experience, or a campaign, the best work starts with a conversation. Tell us what you're building toward and we'll show you what's possible.

`Button`

Book a discovery call → /contact.html

---

## Footer

Dark theme block. Three-column grid: Explore / Brand / Get in touch.

`Explore column`

- Home → /
- Work → /work.html
- News → /news.html

`Brand column`

Logo + tagline: A *different* standard

`Get in touch column`

- newbiz@bydefault.studio (mailto)
- LinkedIn → https://www.linkedin.com/company/bydefaultstudio/ *(opens in new tab)*

`Footer bottom`

- © 2025 ByDefault
- Terms of Use → /terms.html
- Privacy Notice → /privacy.html
- Cookie Preferences *(button — opens cookie controls)*
- Accessibility → /accessibility.html
