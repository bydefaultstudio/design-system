#!/usr/bin/env node
/**
 * One-shot migration: rewrite bare `--token-name` references in markdown
 * docs to the explicit `var(--token-name)` chip syntax.
 *
 * Run from cms/generator:  node migrate-token-syntax.js [file1.md ...]
 *
 * Rules:
 *   1. Only touches inline-code spans (single backticks). Triple-backtick
 *      fenced blocks are preserved untouched.
 *   2. Only wraps bare CSS variables: `--foo` → `var(--foo)`. Already-wrapped
 *      tokens are left alone (the regex requires the leading `--`).
 *   3. Skips frontmatter (--- ... ---) at the top of each file.
 *
 * Designed to be safe to re-run — second runs are no-ops because the only
 * thing that matches is `--xxx` in inline code, and after the first run
 * those have become `var(--xxx)` which the regex no longer matches.
 */

const fs = require('fs');
const path = require('path');

const CMS_DIR = path.resolve(__dirname, '..');

// Default file list — all design system docs the user wants migrated.
const DEFAULT_FILES = [
  'typography.md',
  'spacing.md',
  'border.md',
  'layout.md',
  'form.md',
  'components.md',
  'callout.md',
  'dropdown.md',
  'disclosure.md',
  'sticky-bar.md',
  'layout-page.md',
  'dialog.md',
  'button.md',
  'tabs.md',
  'toast.md',
  'tooltip.md',
  'slider.md',
  'rating.md',
  'progress.md',
  'divider.md',
  'breadcrumb.md',
  'copy-button.md',
  'radio-group.md',
  'number-input.md',
  'asset-card.md',
  'tag.md',
  'badge.md',
  'card.md',
  'drop-cap.md',
  'code.md',
  'mark.md',
  'image.md',
  'table.md',
  'color.md',
];

/**
 * Split a markdown string into segments tagged as 'code' (fenced) or 'prose'.
 * Fenced segments are preserved verbatim; prose segments are open to rewriting.
 */
function splitByFencedCode(markdown) {
  const segments = [];
  const fenceRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match;
  while ((match = fenceRegex.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'prose', text: markdown.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < markdown.length) {
    segments.push({ type: 'prose', text: markdown.slice(lastIndex) });
  }
  return segments;
}

/**
 * Wrap bare `--token-name` inline-code spans in var(). Only matches inside
 * single backticks; multi-token cells are handled because the regex matches
 * each occurrence independently.
 */
function wrapBareTokens(prose) {
  return prose.replace(/`(--[a-z0-9_-]+)`/gi, '`var($1)`');
}

/**
 * Walk markdown tables and prefix backticked identifiers in "Class" columns
 * with a leading dot if they don't already have one. Lets `gap-m` in a Class
 * column become `.gap-m` so the new chipify pre-pass picks it up.
 *
 * Recognises a column as a class column when its header text is one of:
 *   Class, Classes, Utility, Utilities, Modifier, Modifiers
 *
 * Skips identifiers that are already prefixed (.foo), are bare CSS variables
 * (--foo, var(--foo)), are pseudo-classes (:hover), or contain spaces / dots /
 * other punctuation that indicates they're not a single class.
 */
function prefixClassColumnIdentifiers(markdown) {
  const lines = markdown.split('\n');
  let inTable = false;
  let classColumnIndices = [];
  let pendingHeader = false;
  const result = [];

  const isTableRow = line => /^\s*\|.*\|\s*$/.test(line);
  const isSeparatorRow = line => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line);
  const splitCells = line => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTable) {
      // Looking for a header row followed by a separator row
      if (isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
        const headers = splitCells(line);
        classColumnIndices = headers
          .map((h, idx) => ({ h: h.replace(/`/g, '').toLowerCase().trim(), idx }))
          .filter(({ h }) => /^(class(es)?|utility|utilities|modifiers?)$/.test(h))
          .map(({ idx }) => idx);
        if (classColumnIndices.length > 0) {
          inTable = true;
          pendingHeader = true;
        }
      }
      result.push(line);
      continue;
    }

    // Inside a table with at least one Class column
    if (pendingHeader && isSeparatorRow(line)) {
      pendingHeader = false;
      result.push(line);
      continue;
    }

    if (!isTableRow(line)) {
      // Table ended
      inTable = false;
      classColumnIndices = [];
      result.push(line);
      continue;
    }

    // Body row of a table with class columns — rewrite cells in classColumnIndices
    const cells = splitCells(line);
    let changed = false;
    for (const colIdx of classColumnIndices) {
      if (colIdx >= cells.length) continue;
      const cell = cells[colIdx];
      const newCell = cell.replace(/`([a-z][a-z0-9_-]*)`/gi, (match, ident) => {
        // Skip already prefixed (.foo), CSS vars (--foo / var(...)), pseudos (:hover)
        if (ident.startsWith('.') || ident.startsWith('-') || ident.includes(':')) return match;
        return '`.' + ident + '`';
      });
      if (newCell !== cell) {
        cells[colIdx] = newCell;
        changed = true;
      }
    }
    if (changed) {
      result.push('| ' + cells.join(' | ') + ' |');
    } else {
      result.push(line);
    }
  }
  return result.join('\n');
}

function migrateFile(absPath) {
  if (!fs.existsSync(absPath)) {
    console.warn(`  skip (missing): ${path.relative(CMS_DIR, absPath)}`);
    return { changed: false, count: 0 };
  }
  const original = fs.readFileSync(absPath, 'utf8');
  const segments = splitByFencedCode(original);
  let totalReplacements = 0;
  const rewritten = segments
    .map(seg => {
      if (seg.type === 'code') return seg.text;
      const before = seg.text;
      // Two passes: wrap bare tokens, then prefix class-column identifiers.
      const afterTokens = wrapBareTokens(before);
      const after = prefixClassColumnIdentifiers(afterTokens);
      // Count replacements by counting how many `var(--` showed up that weren't there before.
      const beforeVar = (before.match(/`var\(--/g) || []).length;
      const afterVar = (after.match(/`var\(--/g) || []).length;
      // Count newly-prefixed class chips (very rough — counts dot-prefixed backticks introduced).
      const beforeDot = (before.match(/`\.[a-z]/g) || []).length;
      const afterDot = (after.match(/`\.[a-z]/g) || []).length;
      totalReplacements += (afterVar - beforeVar) + (afterDot - beforeDot);
      return after;
    })
    .join('');
  if (rewritten === original) {
    return { changed: false, count: 0 };
  }
  fs.writeFileSync(absPath, rewritten);
  return { changed: true, count: totalReplacements };
}

function main() {
  const argv = process.argv.slice(2);
  const files = argv.length > 0 ? argv : DEFAULT_FILES;
  let totalChanged = 0;
  let totalReplacements = 0;
  console.log(`Migrating ${files.length} file(s)…\n`);
  for (const file of files) {
    const abs = path.isAbsolute(file) ? file : path.join(CMS_DIR, file);
    const { changed, count } = migrateFile(abs);
    const rel = path.relative(CMS_DIR, abs);
    if (changed) {
      totalChanged++;
      totalReplacements += count;
      console.log(`  ✓ ${rel}  (${count} token${count === 1 ? '' : 's'} wrapped)`);
    } else {
      console.log(`  – ${rel}  (no changes)`);
    }
  }
  console.log(`\nDone. ${totalReplacements} tokens wrapped across ${totalChanged} file(s).`);
}

main();
