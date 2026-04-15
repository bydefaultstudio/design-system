#!/usr/bin/env node
/**
 * Studio content generator — entry point.
 *
 * Reads markdown from studio/cms/articles/ and studio/cms/work/,
 * writes HTML to studio/articles/ and studio/work/, and emits a single
 * runtime manifest at studio/assets/data/studio-content.json.
 *
 * Usage:   npm run gen
 *          node generate-studio.js
 *
 * Deps:    gray-matter, marked  (installed in ./package.json)
 */

"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const { validate } = require("./lib/validate");
const { render: renderMarkdown, loadIcons } = require("./lib/render-markdown");
const { renderPage } = require("./lib/render-page");
const { writeManifest } = require("./lib/build-manifest");

// ---- Paths ----
const STUDIO_ROOT = path.resolve(__dirname, "..", "..");            // studio/
const REPO_ROOT = path.resolve(STUDIO_ROOT, "..");                   // repo root
const CMS_DIR = path.join(STUDIO_ROOT, "cms");                       // studio/cms
const CONFIG_PATH = path.join(CMS_DIR, "_config.json");
const ICONS_DIR = path.join(STUDIO_ROOT, "assets", "images", "svg-icons");
const MANIFEST_PATH = path.join(STUDIO_ROOT, "assets", "data", "studio-content.json");

// ---- Helpers ----
function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function collectSources(config) {
  const sources = [];
  const dirs = [
    { type: "article", dir: path.join(CMS_DIR, "articles"), outDir: config.articlesDir },
    { type: "case-study", dir: path.join(CMS_DIR, "work"), outDir: config.workDir }
  ];
  for (const { type, dir, outDir } of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
    for (const f of files) {
      sources.push({
        type,
        file: f,
        slug: path.basename(f, ".md"),
        sourcePath: path.join(dir, f),
        relSource: path.relative(REPO_ROOT, path.join(dir, f)),
        outDir
      });
    }
  }
  return sources;
}

function estimateReadTime(body) {
  const words = body.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function normaliseDate(raw) {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  const d = new Date(raw);
  return d.toISOString().slice(0, 10);
}

// ---- Main ----
function main() {
  console.log("Studio content generator v0.1.0\n");

  const config = readConfig();
  const icons = loadIcons(ICONS_DIR);
  const sources = collectSources(config);

  if (!sources.length) {
    console.log("No markdown sources found in studio/cms/articles or studio/cms/work.");
    return;
  }

  // -- Phase 1: parse + validate all files
  const parsed = [];
  const allErrors = [];
  const generatedAt = new Date();

  for (const src of sources) {
    const raw = fs.readFileSync(src.sourcePath, "utf8");
    const { data, content } = matter(raw);

    // Ensure declared type matches folder
    if (!data.type) data.type = src.type;
    if (data.type !== src.type) {
      allErrors.push(
        `${src.relSource}: declared type "${data.type}" doesn't match folder (${src.type})`
      );
      continue;
    }

    // Skip drafts
    if (data.status === "draft") {
      console.log(`  ⊘ draft skipped: ${src.relSource}`);
      continue;
    }

    const result = validate(data, src.relSource);
    if (!result.valid) {
      allErrors.push(...result.errors);
      continue;
    }

    const entry = { ...data };
    entry.type = src.type;
    entry.slug = src.slug;
    entry.sourcePath = src.sourcePath;
    entry.relSource = src.relSource;
    entry.url = `${src.outDir}/${src.slug}.html`;
    entry.outputPath = path.join(STUDIO_ROOT, src.outDir, `${src.slug}.html`);
    entry.date = normaliseDate(entry.date);
    entry.body = content;
    if (entry.type === "article" && !entry["read-time"]) {
      entry.readTime = estimateReadTime(content);
    } else if (entry["read-time"]) {
      entry.readTime = entry["read-time"];
    }
    entry.seoTitle = entry["seo-title"];
    entry.seoDescription = entry["seo-description"];
    entry.feedVariant = entry["feed-variant"];

    parsed.push(entry);
  }

  // Detect slug collisions
  const seen = new Map();
  for (const e of parsed) {
    if (seen.has(e.url)) {
      allErrors.push(
        `${e.relSource}: slug collision — ${seen.get(e.url)} and ${e.relSource} both output to ${e.url}`
      );
    }
    seen.set(e.url, e.relSource);
  }

  if (allErrors.length) {
    console.error("\n❌ Build failed:\n");
    allErrors.forEach((err) => console.error(`   • ${err}`));
    process.exit(1);
  }

  // -- Phase 2: assign order
  // Split by type, sort by explicit `order` ASC (nulls last) then by date DESC,
  // then assign a stable numeric order (0, 1, 2, ...) per type.
  function assignOrder(entries) {
    entries.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : Infinity;
      const bo = typeof b.order === "number" ? b.order : Infinity;
      if (ao !== bo) return ao - bo;
      return b.date.localeCompare(a.date); // date desc
    });
    entries.forEach((e, i) => (e.order = i));
  }
  assignOrder(parsed.filter((e) => e.type === "article"));
  assignOrder(parsed.filter((e) => e.type === "case-study"));

  // -- Phase 3: render + write each page
  const ctx = { icons };
  for (const entry of parsed) {
    const bodyHtml = renderMarkdown(entry.body, ctx);
    const pageHtml = renderPage(entry, bodyHtml, config);
    fs.mkdirSync(path.dirname(entry.outputPath), { recursive: true });
    fs.writeFileSync(entry.outputPath, pageHtml);
    console.log(`  ✓ ${entry.relSource}  →  ${path.relative(REPO_ROOT, entry.outputPath)}`);
  }

  // -- Phase 4: manifest
  const { articles, caseStudies } = writeManifest(MANIFEST_PATH, parsed, generatedAt);
  console.log(`\n  ✓ manifest  →  ${path.relative(REPO_ROOT, MANIFEST_PATH)}`);

  console.log(
    `\n✅ Done. ${articles.length} article(s), ${caseStudies.length} case stud${
      caseStudies.length === 1 ? "y" : "ies"
    }.`
  );
}

main();
