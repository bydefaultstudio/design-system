# Studio CMS

Markdown-driven content for the studio site's L2 pages — articles (`studio/articles/*.html`) and case studies (`studio/work/*.html`). Generator lives in `studio/cms/generator/`; source markdown lives here under `articles/` and `work/`.

## 30-second workflow

1. Create a markdown file in `studio/cms/articles/` or `studio/cms/work/`. Filename becomes the URL slug.
2. Fill in the front-matter (see schema below).
3. Run the generator: `cd studio/cms/generator && npm run gen`.
4. Commit the generated HTML (`studio/articles/<slug>.html` or `studio/work/<slug>.html`) **and** `studio/assets/data/studio-content.json`.

That's it. The feed, sidebar work list, and next-read card all pick up the new page automatically from the manifest.

## Scripts

From `studio/cms/generator/`:

| Command | What it does |
|---|---|
| `npm run gen` | One-shot build. Parses all markdown, validates, renders HTML, writes manifest. Exits non-zero on validation errors. |
| `npm run watch` | Watches sources + templates. Rebuilds on save. |
| `npm run serve` | Serves the whole repo at `http://localhost:8080/` via python's http.server. |
| `npm run dev` | Runs `watch` and `serve` together. |

First-time setup: `cd studio/cms/generator && npm install` to install `marked` + `gray-matter`.

## What gets generated

| Source | Output |
|---|---|
| `studio/cms/articles/<slug>.md` | `studio/articles/<slug>.html` |
| `studio/cms/work/<slug>.md` | `studio/work/<slug>.html` |
| (all sources together) | `studio/assets/data/studio-content.json` — the manifest powering the feed, sidebar work list, and next-read |

Delete a `.md` file → the corresponding HTML stays until you delete it; the manifest stops referencing it on next rebuild. Rename the `.md` → old HTML is orphaned; inbound links break (document any external references before renaming).

## Front-matter schema

One field → many destinations. Authors write reader-facing copy (`title`, `synopsis`); SEO overrides are optional.

### Shared — both types

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | `"article"` \| `"case-study"` | yes | Discriminator. Must match folder. |
| `title` | string | yes | `<h1>`, `<title>`, OG/Twitter title, feed/sidebar/next-read titles, JSON-LD `headline`. |
| `synopsis` | string | yes | Feed card blurb, sidebar excerpt, fallback for SEO description. Reader-facing. ~120–180 chars. |
| `date` | ISO string | yes | `2026-04-10`. Drives sort (desc), displayed date, `data-feed-date`, JSON-LD `datePublished`. |
| `author` | string \| object | no | `{ name, avatar, url, bio }`. Falls back to `_config.defaultAuthor`. |
| `categories` | string[] | no | Topic tags, e.g. `["Systems", "Design ops"]`. |
| `hero` | string | no | Hero image path (relative to `studio/`). Also defaults `thumbnail` and `og-image`. |
| `thumbnail` | string | no | Feed + sidebar card image. Defaults to `hero`. If neither present, cards render without an image. |
| `thumbnail-alt` | string | no | `alt` text for the feed image. Defaults to `title`. |
| `thumbnail-ratio` | `"16:9"` \| `"4:5"` \| `"9:16"` \| `"1:1"` | no | Override the variant's default aspect ratio. See **Thumbnail rules** below. |
| `thumbnail-focus` | string | no | CSS `object-position` override, e.g. `"50% 30%"`. Use only when the source crops badly — better to re-crop the image. |
| `thumbnail-video` | string | no | Path/URL to an MP4. When present, the feed card becomes a hover-to-play video preview (desktop only). See **Video thumbnails** below. |
| `thumbnail-video-poster` | string | no | Poster frame for the video thumbnail. Falls back to `thumbnail` → `hero`. |
| `layout` | `"editorial"` \| `"cover"` | no | Card composition. `editorial` stacks image on top, text below. `cover` overlays text on a full-bleed image. Defaults to `"cover"`. |
| `featured` | boolean | no | Editorial promotion flag — separate from layout. Set `true` to mark the post for the home-page featured slot. Defaults to `false`. |
| `logo` | string | no | Case-studies only. References a `<symbol>` id in `studio/assets/images/svg-logos/_sprite.svg` (e.g. `verizon`, `mcdonalds`). Build hard-fails if the id isn't in the sprite. |
| `order` | number | no | Manual sort override (lower = earlier). Default: assigned from date-desc sort, writes to `data-order`. |
| `status` | `"published"` \| `"draft"` | no | Drafts are skipped from output + manifest. |

### Thumbnail rules

The feed card shape and crop come from two coordinated settings: the **layout** (how the card composes image and text) and the **ratio** (the image's aspect). Each layout has a sensible default ratio — only set `thumbnail-ratio` when you need to override it.

| `layout` | Default ratio | Composition | Typical use |
|---|---|---|---|
| `cover` (default) | `4:5` | Full-bleed image with title + body overlaid on it | Visual-led posts, case studies, magazine-cover energy. Use `9:16` for portrait-first storytelling. |
| `editorial` | `16:9` | Image on top, title + body stacked below | Article-card feel, content-led posts. |

**Authoring rules of thumb:**

1. Always set `hero`. One image feeds both the page hero AND the card unless you want a different crop.
2. Set `thumbnail` only when the hero has baked-in copy, the wrong aspect, or is too heavy for a grid.
3. Always set `thumbnail-alt` when the image carries meaning the title doesn't. Skip it for purely decorative art.
4. `thumbnail-ratio` is an override, not a default. Don't set `"16:9"` on a standard post — it's already that.
5. `thumbnail-focus` is last resort. Re-crop the source image instead when you can.

### Video thumbnails

Set `thumbnail-video` to turn the feed card into a hover-to-play preview. Behaviour is handled by [thumb-hover.js](../assets/js/thumb-hover.js) — a tiny dedicated module, **not** `bd-video`. No controls, no sound.

- **Source:** 1–8s MP4 (H.264), muted, ideally <5MB.
- **Poster:** `thumbnail-video-poster` (falls back to `thumbnail` → `hero`). Always supply a poster so the paused state looks deliberate.
- **Ratio:** same as image thumbnails (`thumbnail-ratio` applies, cropped by `.post-thumbnail`).
- **Desktop only:** touch devices, viewports <992px, and users with `prefers-reduced-motion: reduce` see only the poster. The video never loads or plays for them.
- **Class used:** `.vdo-thumb` on the `<video>` element — distinct from the `.bd-video*` namespace.

### Shortcodes (video-related)

Three distinct tiers, pick the right one:

| Need | Markup | Class | JS |
|---|---|---|---|
| Full video player with controls, scrubber, mute, fullscreen | `{{video src="…" poster="…"}}` | `.bd-video` | [bd-video.js](../assets/js/bd-video.js) |
| Decorative autoplay loop (case-study body assets, section backgrounds) | `{{bg-video src="…" poster="…"}}` | `.bg-video` | none — pure HTML attributes |
| Hover preview on a feed card | front-matter `thumbnail-video` | `.vdo-thumb` | [thumb-hover.js](../assets/js/thumb-hover.js) |

`{{bg-video}}` takes an optional `loop="false"` attribute to disable looping.

### Video component roadmap

`bd-video` (the full player) has a priority-ordered list of future enhancements at the top of [bd-video.js](../assets/js/bd-video.js) — captions, loading/error states, visibility-based pause, etc. Check there before starting any video-related work.

### SEO overrides (shared, all optional)

Only set when search-facing copy needs to differ from reader-facing.

| Field | Falls back to | Drives |
|---|---|---|
| `seo-title` | `title` | `<title>` (+ site suffix), `og:title`, `twitter:title`. |
| `seo-description` | `synopsis` | `<meta description>`, `og:description`, `twitter:description`, `data-page-description`. Aim 150–160 chars. |
| `og-image` | `hero` → `_config.defaultOgImage` | `og:image`, `twitter:image`. Use 1200×630. |
| `canonical` | derived from `siteUrl` + URL | `<link rel="canonical">`, `og:url`. |
| `noindex` | `false` | Adds `<meta robots noindex,nofollow>` when `true`. |

### Article-only

| Field | Type | Required | Purpose |
|---|---|---|---|
| `read-time` | string | no | e.g. `"6 min read"`. Auto-estimated from wordcount (~200 wpm) if omitted. |

### Case-study-only

| Field | Type | Required | Purpose |
|---|---|---|---|
| `client` | string | yes | Header strip, feed eyebrow, sidebar meta. |
| `year` | number | no | Header strip, feed card. |
| `role` | string | no | Header strip ("Our role"). |
| `services` | string[] | no | e.g. `["Strategy", "Design", "Build"]`. Header strip + feed. Separate from `categories` — `services` = what we did; `categories` = topic tags. |
| `client-url` | string | no | Optional outbound link from the header strip. |

## Client logo registry

The `logo:` front-matter field on a case study references a `<symbol>` id in the logo sprite at `studio/assets/images/svg-logos/_sprite.svg`. The same sprite powers the **logo grid** on the home page, the **logo ticker** above testimonials, and **testimonial avatars** — so adding a logo here makes it available everywhere at once.

### Sprite ID rule

The sprite id is a **kebab-case slug derived from the brand's own word boundaries**:

- Lowercase, ASCII alphanumeric, hyphen-separated.
- Strip apostrophes (no replacement).
- Replace `&` with `and`.
- **Mirror how the brand spells itself.** Brands written as one word stay one word in the slug: `BlackDoctor` → `blackdoctor`, `Hypebeast` → `hypebeast`, `Copa90` → `copa90`. Brands written as multiple words split: `Country & Town House` → `country-and-town-house`, `The Sole Supplier` → `the-sole-supplier`.

### Current sprite ids

| Brand display | Sprite id | In feed grid? | Has avatar variant? |
|---|---|---|---|
| BET | `bet` | ✓ | — |
| BlackDoctor | `blackdoctor` | ✓ | — |
| Copa90 | `copa90` | ✓ | — |
| Country & Town House | `country-and-town-house` | — | ✓ (`country-and-town-house-avatar`) |
| Hypebeast | `hypebeast` | ✓ | — |
| Lift Labs | `lift-labs` | ✓ | — |
| McDonald's | `mcdonalds` | ✓ | — |
| Revolt | `revolt` | ✓ | — |
| The Sole Supplier | `the-sole-supplier` | ✓ | — |
| Verizon | `verizon` | ✓ | — |

### Adding a new logo

1. Drop a clean `<svg>` (paths must use `fill="currentColor"`, no hardcoded colors) at `studio/assets/images/svg-logos/<id>.svg` where `<id>` follows the rule above. Run it through `assets/js/svg-clean.js --current-color --strip-comments` first if it came from a brand asset pack.
2. (Optional) Add a circular-friendly avatar variant at `<id>-avatar.svg` if the wide wordmark won't fit a testimonial badge.
3. Register it in the `LOGOS` array in [studio/assets/js/studio-logos.js](../assets/js/studio-logos.js) — copy an existing entry and update `name` + `viewBox` (and `scale` if the mark needs ink-density correction). Add `avatar: { viewBox, scale? }` only if you supplied an avatar variant.
4. Run `npm run gen` to rebuild the sprite. The build hard-fails if any case-study `logo:` references a missing id.
5. (Optional) Add `<div class="logo-mark" data-bd-animate="slide-up" data-bd-scrub data-logo="<id>"></div>` to the home-page logo grid in [studio/index.html](../../index.html) if the brand should appear there as social proof.

If a case study sets `logo:` and the value isn't in the sprite, the build aborts with the full registry list and a "did you mean" hint derived from the case study's `client:` field.

## Shortcodes

Markdown body supports a small set of shortcodes. Unknown shortcodes emit a build warning and pass through as HTML comments.

| Shortcode | Syntax | Renders |
|---|---|---|
| `icon` | `{{icon:name}}` | `.svg-icn` wrapper with inlined SVG from `studio/assets/images/svg-icons/<name>.svg`. |
| `callout` | `{{callout type="insight"}}body markdown{{/callout}}` | `<aside class="callout" data-type="info">`. Types: `insight` (maps to `info`), `quote` (maps to `success`), `warning`, `danger`, `accent`. |
| `figure` | `{{figure src="path" caption="..." alt="..."}}` | `<figure><img><figcaption>`. |
| `video` | `{{video src="path" poster="path"}}` | `<section class="bd-video">` with `.bd-video-player` — autoplay/mute/scrubber work via [bd-video.js](../assets/js/bd-video.js). |
| `gallery` | `{{gallery}}![alt](a.jpg)![alt](b.jpg){{/gallery}}` | `<div class="gallery">` wrapping the N figures. |

## Asset conventions

- `studio/assets/images/articles/<slug>/` — per-article images (hero, body).
- `studio/assets/images/work/<slug>/` — per-case-study images.
- `studio/assets/images/og/` — shared OG / social-preview images (1200×630).
- `studio/assets/images/authors/` — author avatars (64×64 recommended).
- `studio/assets/videos/` — video files for `{{video}}` shortcode or hero video.

All paths in front-matter are **relative to `studio/`** — e.g. `hero: assets/images/articles/my-slug/hero.jpg`.

## Draft workflow

```yaml
status: draft
```

Draft pages:
- Are not written as HTML
- Are not included in the manifest (invisible to feed, sidebar, next-read)
- Still render under watch mode if you temporarily flip to `published`

## Editing gotchas

- **Renaming a slug** orphans the old HTML and breaks inbound links (feed + sidebar rebuild from manifest, but external links and social shares won't). Rename carefully.
- **Barba meta staleness:** OG / Twitter / canonical tags in the `<head>` are rendered once on first page load. They're correct for social-share crawlers (which hit pages directly), but don't update during client-side Barba navigation. The `<title>` and `<meta description>` *do* update via `data-page-title` / `data-page-description`.
- **The generator handles `data-order`** (assigned from date-desc sort). You can override it with explicit `order:` in front-matter.
- **Slug collisions** (two files producing the same output path) hard-fail the build.

## When NOT to use the generator

One-off pages (about, contact, home) stay as hand-authored HTML in `studio/`. This generator is L2-only — articles and case studies.

## Layer discipline

Per [CLAUDE.md §17](../../CLAUDE.md), studio/cms/ is part of the `app` layer. It does not touch `cms/generator/` (the design-system docs generator), does not ship with the design system, and has no dependency on foundation/core docs.
