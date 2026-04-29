/**
 * Build the studio-content.json manifest from canonicalised entries.
 * Shape matches the runtime consumers in studio.js:
 *   - initFeed() reads articles + caseStudies (sorted by date desc)
 *   - initSidebarSlot() reads caseStudies
 *   - initNextRead() reads articles by url
 */

"use strict";

const fs = require("fs");
const path = require("path");

function toManifestRecord(entry) {
  const record = {
    slug: entry.slug,
    url: entry.url,
    type: entry.type,
    title: entry.title,
    synopsis: entry.synopsis,
    seoTitle: entry.seoTitle || entry.title,
    seoDescription: entry.seoDescription || entry.synopsis,
    date: entry.date,
    order: entry.order,
    thumbnail: entry.thumbnail || entry.hero || null,
    thumbnailAlt: entry["thumbnail-alt"] || null,
    thumbnailRatio: entry["thumbnail-ratio"] || null,
    thumbnailFocus: entry["thumbnail-focus"] || null,
    thumbnailVideo: entry["thumbnail-video"] || null,
    thumbnailVideoPoster:
      entry["thumbnail-video-poster"]
      || entry.thumbnail
      || entry.hero
      || null,
    hero: entry.hero || null,
    categories: entry.categories || [],
    author: entry.author || null,
    layout: entry.layout || "cover",
    featured: Boolean(entry.featured)
  };
  if (entry.type === "article") {
    record.readTime = entry.readTime;
  }
  if (entry.type === "case-study") {
    record.client = entry.client;
    record.year = entry.year || null;
    record.role = entry.role || null;
    record.services = entry.services || [];
    record.clientUrl = entry["client-url"] || null;
    record.logo = entry.logo || null;
  }
  return record;
}

function writeManifest(outPath, entries, generatedAt) {
  const articles = entries
    .filter((e) => e.type === "article")
    .sort((a, b) => a.order - b.order)
    .map(toManifestRecord);
  const caseStudies = entries
    .filter((e) => e.type === "case-study")
    .sort((a, b) => a.order - b.order)
    .map(toManifestRecord);

  const manifest = {
    generatedAt: generatedAt.toISOString(),
    articles,
    caseStudies
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  return { articles, caseStudies };
}

module.exports = { writeManifest };
