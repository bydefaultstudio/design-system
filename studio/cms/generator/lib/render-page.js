/**
 * Compose a full HTML page from front-matter data + rendered body.
 * Uses the three templates in ../templates/: layout.html, article-inner.html,
 * case-study-inner.html.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const LAYOUT = fs.readFileSync(path.join(TEMPLATES_DIR, "layout.html"), "utf8");
const ARTICLE_INNER = fs.readFileSync(
  path.join(TEMPLATES_DIR, "article-inner.html"),
  "utf8"
);
const CASE_STUDY_INNER = fs.readFileSync(
  path.join(TEMPLATES_DIR, "case-study-inner.html"),
  "utf8"
);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[c];
  });
}

function formatDisplayDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function resolveAuthor(author, defaults) {
  if (!author) return defaults;
  if (typeof author === "string") return { name: author, avatar: defaults.avatar };
  return {
    name: author.name || defaults.name,
    avatar: author.avatar || defaults.avatar,
    url: author.url || null,
    bio: author.bio || null
  };
}

function resolveCanonical(entry, config) {
  if (entry.canonical) return entry.canonical;
  const base = config.siteUrl.replace(/\/$/, "");
  return `${base}/${entry.url}`;
}

function resolveOgImage(entry, config) {
  const raw = entry["og-image"] || entry.hero || config.defaultOgImage;
  if (!raw) return "";
  if (/^https?:\/\//.test(raw)) return raw;
  const base = config.siteUrl.replace(/\/$/, "");
  return `${base}/${raw.replace(/^\//, "")}`;
}

function buildJsonLd(entry, config, author) {
  if (entry.type === "article") {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: entry.title,
      description: entry.seoDescription,
      image: resolveOgImage(entry, config),
      datePublished: entry.date,
      author: { "@type": "Person", name: author.name },
      publisher: {
        "@type": "Organization",
        name: config.siteName,
        logo: {
          "@type": "ImageObject",
          url: `${config.siteUrl.replace(/\/$/, "")}/assets/images/favicon/favicon.svg`
        }
      },
      mainEntityOfPage: resolveCanonical(entry, config),
      articleSection: entry.categories || []
    });
  }
  // case-study
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entry.title,
    description: entry.seoDescription,
    image: resolveOgImage(entry, config),
    datePublished: entry.date,
    creator: { "@type": "Organization", name: config.siteName },
    sourceOrganization: entry.client
      ? { "@type": "Organization", name: entry.client }
      : undefined,
    about: entry.categories || [],
    keywords: (entry.services || []).join(", ")
  });
}

function buildCategoriesBlock(categories) {
  if (!categories || !categories.length) return "";
  const chips = categories
    .map((c) => `<span class="badge">${escapeHtml(c)}</span>`)
    .join(" ");
  return `\n                    <span class="article-meta-item article-meta-categories label">${chips}</span>`;
}

function buildCaseStudyCategoriesBlock(categories) {
  if (!categories || !categories.length) return "";
  const chips = categories
    .map((c) => `<span class="badge">${escapeHtml(c)}</span>`)
    .join(" ");
  return `\n                  <div class="post-categories">${chips}</div>`;
}

function buildServicesBlock(services) {
  if (!services || !services.length) return "";
  const items = services.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  return `\n                  <ul class="post-services">${items}</ul>`;
}

function buildCaseStudyServicesBlock(services) {
  if (!services || !services.length) return "";
  const tags = services
    .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
    .join("");
  return `\n            <div class="case-study-services">${tags}</div>`;
}

var CS_TOGGLE_ICONS = `<div class="svg-icn case-study-toggle-icon case-study-toggle-icon-add"><svg data-icon="add" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 15C11 13.8954 10.1046 13 9 13H4V11H9C10.1046 11 11 10.1046 11 9V4H13V9C13 10.1046 13.8954 11 15 11H20V13H15C13.8954 13 13 13.8954 13 15V20H11V15Z" fill="currentColor"/></svg></div><div class="svg-icn case-study-toggle-icon case-study-toggle-icon-close"><svg data-icon="close" width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg></div>`;

function buildInfoToggle(hasInfo) {
  if (!hasInfo) return "";
  return `\n          <button type="button" class="button case-study-toggle" data-case-study-toggle>\n            <span class="case-study-toggle-label">Project information</span>\n            ${CS_TOGGLE_ICONS}\n          </button>`;
}

function optionalMeta(label, value) {
  if (!value) return "";
  return `\n                    <span class="post-meta-item label"><span class="post-meta-label label">${label}:</span> ${escapeHtml(
    value
  )}</span>`;
}

/**
 * Render an article's inner container content.
 */
function renderArticleInner(entry, bodyHtml, author) {
  return ARTICLE_INNER.replace(/\{\{namespace\}\}/g, entry.slug)
    .replace(/\{\{title\}\}/g, escapeHtml(entry.title))
    .replace(/\{\{readTime\}\}/g, escapeHtml(entry.readTime))
    .replace(/\{\{displayDate\}\}/g, formatDisplayDate(entry.date))
    .replace(/\{\{categoriesBlock\}\}/g, buildCategoriesBlock(entry.categories))
    .replace(/\{\{authorAvatar\}\}/g, escapeHtml(author.avatar))
    .replace(/\{\{authorName\}\}/g, escapeHtml(author.name))
    .replace(
      /\{\{hero\}\}/g,
      escapeHtml(entry.hero || "https://bydefault.design/image/1920x1080")
    )
    .replace(/\{\{body\}\}/g, bodyHtml);
}

/**
 * Render a case study's inner container content.
 */
function renderCaseStudyInner(entry, visualsHtml, infoHtml) {
  var hasInfo = !!infoHtml;
  return CASE_STUDY_INNER.replace(/\{\{title\}\}/g, escapeHtml(entry.title))
    .replace(/\{\{client\}\}/g, escapeHtml(entry.client || ""))
    .replace(/\{\{synopsis\}\}/g, escapeHtml(entry.synopsis || ""))
    .replace(/\{\{servicesBlock\}\}/g, buildCaseStudyServicesBlock(entry.services))
    .replace(/\{\{infoToggle\}\}/g, buildInfoToggle(hasInfo))
    .replace(/\{\{visualsBody\}\}/g, visualsHtml)
    .replace(/\{\{infoBody\}\}/g, infoHtml || "");
}

/**
 * Compose a full HTML page.
 * @param {object} entry  — canonicalised entry (from build-manifest.js)
 * @param {string} bodyHtml — rendered markdown HTML (or visuals HTML for case studies)
 * @param {object} config — studio/cms/_config.json
 * @param {string} [infoHtml] — info panel HTML for case studies (optional)
 */
function renderPage(entry, bodyHtml, config, infoHtml) {
  const author = resolveAuthor(entry.author, config.defaultAuthor);
  const containerInner =
    entry.type === "article"
      ? renderArticleInner(entry, bodyHtml, author)
      : renderCaseStudyInner(entry, bodyHtml, infoHtml || "");

  const seoTitle = `${entry.seoTitle || entry.title} — ${config.siteName}`;
  const seoDescription = entry.seoDescription || entry.synopsis;
  const ogImage = resolveOgImage(entry, config);
  const canonical = resolveCanonical(entry, config);
  const jsonLd = buildJsonLd({ ...entry, seoDescription }, config, author);

  return LAYOUT.replace(/\{\{seoTitle\}\}/g, escapeHtml(seoTitle))
    .replace(/\{\{seoDescription\}\}/g, escapeHtml(seoDescription))
    .replace(/\{\{canonical\}\}/g, escapeHtml(canonical))
    .replace(/\{\{robots\}\}/g, entry.noindex ? "noindex, nofollow" : "index, follow")
    .replace(/\{\{ogType\}\}/g, entry.type === "article" ? "article" : "website")
    .replace(/\{\{ogImage\}\}/g, escapeHtml(ogImage))
    .replace(/\{\{ogImageAlt\}\}/g, escapeHtml(config.defaultOgImageAlt || config.siteName))
    .replace(/\{\{siteName\}\}/g, escapeHtml(config.siteName))
    .replace(/\{\{locale\}\}/g, escapeHtml(config.locale || "en_US"))
    .replace(/\{\{themeColor\}\}/g, escapeHtml(config.themeColor || "#000"))
    .replace(/\{\{jsonLd\}\}/g, jsonLd)
    .replace(/\{\{namespace\}\}/g, entry.slug)
    .replace(/\{\{order\}\}/g, String(entry.order))
    .replace(/\{\{containerInner\}\}/g, containerInner);
}

module.exports = { renderPage };
