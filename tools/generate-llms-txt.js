#!/usr/bin/env node

/**
 * generate-llms-txt.js
 * Builds two AI-readable design system reference files following the llms.txt standard:
 *   - llms.txt      — lightweight index with project summary and section links
 *   - llms-full.txt — complete reference with all tokens, components, and rules
 *
 * Usage: node tools/generate-llms-txt.js
 * Output: llms.txt + llms-full.txt (project root)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CMS_DIR = path.join(ROOT, 'cms');
const CSS_FILE = path.join(ROOT, 'assets', 'css', 'design-system.css');
const PREAMBLE_FILE = path.join(__dirname, 'llms-preamble.md');
const VERSION_FILE = path.join(ROOT, 'VERSION');
const OUTPUT_INDEX = path.join(ROOT, 'llms.txt');
const OUTPUT_FULL = path.join(ROOT, 'llms-full.txt');

const BASE_URL = 'https://bydefault.design';
const VERSION = fs.readFileSync(VERSION_FILE, 'utf8').trim();

// ─── Helpers ──────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

function stripDemoPreviews(md) {
  return md.replace(/<div\s+class="demo-preview[^"]*"[\s\S]*?<\/div>\s*(?:<\/div>)?\s*/gi, '');
}

function stripEmptyDemoWrappers(md) {
  return md.replace(/<div\s+class="demo-[^"]*"[^>]*>[\s\S]*?<\/div>\s*/gi, '');
}

function stripColorLists(md) {
  return md.replace(/<div\s+class="color-list[^"]*"[^>]*>[\s\S]*?<\/div>\s*/gi, '');
}

function cleanMarkdown(md) {
  let cleaned = stripFrontmatter(md);
  cleaned = stripDemoPreviews(cleaned);
  cleaned = stripEmptyDemoWrappers(cleaned);
  cleaned = stripColorLists(cleaned);
  cleaned = cleaned.replace(/style="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function readCmsFile(filename) {
  const filePath = path.join(CMS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filename} not found, skipping`);
    return '';
  }
  return cleanMarkdown(readFile(filePath));
}

// ─── CSS Token Extraction ─────────────────────────────────

function extractCssTokens(css) {
  const sections = {};

  const rootPattern = /\/\*\s*[-─]+\s*([\d]+[a-z]?\.\s*[^*]+?)[-─]*\s*\*\/\s*(?:\/\*[\s\S]*?\*\/\s*)?:root\s*\{([^}]*)\}/g;
  let match;
  while ((match = rootPattern.exec(css)) !== null) {
    const sectionName = match[1].trim();
    const block = match[2];
    sections[sectionName] = parseTokenBlock(block);
  }

  const darkPattern = /\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/;
  const darkMatch = css.match(darkPattern);
  if (darkMatch) {
    sections['DARK MODE OVERRIDES'] = parseTokenBlock(darkMatch[1]);
  }

  return sections;
}

function parseTokenBlock(block) {
  const tokens = [];
  let currentComment = '';

  const lines = block.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    const commentMatch = trimmed.match(/^\/\*\s*[-–—]*\s*(.*?)\s*[-–—]*\s*\*\/$/);
    if (commentMatch) {
      currentComment = commentMatch[1].trim();
      continue;
    }

    const tokenMatch = trimmed.match(/^(--[\w-]+)\s*:\s*(.+?)\s*;(?:\s*\/\*\s*(.*?)\s*\*\/)?$/);
    if (tokenMatch) {
      tokens.push({
        name: tokenMatch[1],
        value: tokenMatch[2],
        comment: tokenMatch[3] || '',
        section: currentComment,
      });
    }
  }

  return tokens;
}

function formatTokenSection(name, tokens) {
  if (!tokens || tokens.length === 0) return '';

  let output = `### ${name}\n\n`;
  let lastSection = '';

  output += '| Token | Value | Note |\n';
  output += '| --- | --- | --- |\n';

  for (const t of tokens) {
    if (t.section && t.section !== lastSection) {
      output += `| **${t.section}** | | |\n`;
      lastSection = t.section;
    }
    const note = t.comment || '';
    output += `| \`${t.name}\` | \`${t.value}\` | ${note} |\n`;
  }

  output += '\n';
  return output;
}

// ─── Index (llms.txt) ────────────────────────────────────

function buildIndex(components) {
  const full = `${BASE_URL}/llms-full.txt`;

  const lines = [
    '# By Default Design System',
    '',
    `> Version ${VERSION} — Complete design token, layout, component, and CSS reference for By Default Studio\'s design system. Use this as your authoritative guide for generating on-brand HTML and CSS.`,
    '',
    'Always use semantic tokens over primitives. Follow the layout hierarchy: section > .padding-global > container > block. Accessibility required on all components.',
    '',
    '## Docs',
    '',
    `- [Full Reference](${full}): Complete design system — all tokens, components, patterns, and rules`,
    `- [LLM Documentation](${BASE_URL}/docs/llms.html): How to use these files with AI tools`,
    '',
    '## Foundations',
    '',
    `- [Layout System](${full}#layout-system): HTML page structure hierarchy`,
    `- [Design Tokens](${full}#design-tokens): All CSS custom properties — color, typography, spacing, border`,
    `- [Color Usage](${full}#color-usage): Semantic color tokens and usage rules`,
    `- [Typography](${full}#typography): Font families, sizes, weights, and line heights`,
    `- [Spacing](${full}#spacing): Spacing scale tokens and utility classes`,
    `- [Border System](${full}#border-system): Composable border classes`,
    '',
    '## Components',
    '',
    `- [Component Conventions](${full}#component-conventions): Naming, tokens, accessibility, and build rules`,
  ];

  for (const [label] of components) {
    const anchor = label.toLowerCase().replace(/ \/ /g, '--').replace(/ /g, '-');
    lines.push(`- [${label}](${full}#${anchor}): ${label} component`);
  }

  lines.push('');
  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Icon System](${full}#icon-system): Brand SVG icons only — no external libraries`);
  lines.push(`- [CSS Conventions](${full}#css-conventions): File organization and naming rules`);
  lines.push('');

  return lines.join('\n');
}

// ─── Full Reference (llms-full.txt) ──────────────────────

function buildReference() {
  console.log('  Building full reference...');

  const parts = [];

  // 1. Preamble (with version injected)
  parts.push(readFile(PREAMBLE_FILE).replace('{{VERSION}}', VERSION));

  // 2. Layout System
  parts.push('## Layout System\n');
  parts.push(readCmsFile('layout.md'));
  parts.push('\n\n---\n');

  // 3. Code Standards (CSS + JS) — placed early so AI tools see conventions before writing tokens or components
  parts.push('\n## CSS Conventions\n');
  parts.push(readCmsFile('css-code-struture.md'));
  parts.push('\n\n---\n');

  parts.push('\n## JavaScript Conventions\n');
  parts.push(readCmsFile('js-code-structure.md'));
  parts.push('\n\n---\n');

  // 4. Design Tokens (from CSS)
  console.log('  Extracting CSS tokens...');
  const css = readFile(CSS_FILE);
  const tokenSections = extractCssTokens(css);

  parts.push('\n## Design Tokens\n\n');
  parts.push('These are the actual CSS custom property values from `design-system.css`. Always use semantic tokens (not primitives) in production code.\n\n');

  for (const [name, tokens] of Object.entries(tokenSections)) {
    parts.push(formatTokenSection(name, tokens));
  }
  parts.push('\n---\n');

  // 4. Color Usage Rules
  parts.push('\n## Color Usage\n');
  parts.push(readCmsFile('color.md'));
  parts.push('\n\n---\n');

  // 5. Typography
  parts.push('\n## Typography\n');
  parts.push(readCmsFile('typography.md'));
  parts.push('\n\n---\n');

  // 6. Spacing
  parts.push('\n## Spacing\n');
  parts.push(readCmsFile('spacing.md'));
  parts.push('\n\n---\n');

  // 7. Border System
  parts.push('\n## Border System\n');
  parts.push(readCmsFile('border.md'));
  parts.push('\n\n---\n');

  // 8. Component Spec (master)
  parts.push('\n## Component Conventions\n');
  parts.push(readCmsFile('components.md'));
  parts.push('\n\n---\n');

  // 9. Individual Components
  // Layer Discipline (CLAUDE.md §17): only foundation + core layer components
  // are listed here. Docs-site components (asset-card, book-cover, dont-card,
  // sticky-bar, copy-button) are intentionally excluded so the LLM reference
  // describes only what's portable to other products built on this system.
  const components = [
    ['Button', 'button.md'],
    ['Card', 'card.md'],
    ['Callout', 'callout.md'],
    ['Form Elements', 'form.md'],
    ['Badge', 'badge.md'],
    ['Tabs', 'tabs.md'],
    ['Toast', 'toast.md'],
    ['Tooltip', 'tooltip.md'],
    ['Disclosure', 'disclosure.md'],
    ['Breadcrumb', 'breadcrumb.md'],
    ['Progress Bar', 'progress.md'],
    ['Dialog', 'dialog.md'],
    ['Dropdown', 'dropdown.md'],
    ['Tag', 'tag.md'],
    ['Code / Pre / Kbd', 'code.md'],
    ['Mark / Abbr / Figure', 'mark.md'],
    ['Table', 'table.md'],
  ];

  parts.push('\n## Components\n\n');

  for (const [label, file] of components) {
    const content = readCmsFile(file);
    if (content) {
      parts.push(`### ${label}\n\n`);
      parts.push(content);
      parts.push('\n\n');
    }
  }
  parts.push('---\n');

  // 10. Icon System
  parts.push('\n## Icon System\n');
  parts.push(readCmsFile('iconography.md'));
  parts.push('\n');

  // Final assembly
  let output = parts.join('');
  output = output.replace(/\n{4,}/g, '\n\n\n');

  return { output, components };
}

// ─── Main ─────────────────────────────────────────────────

function logFileStats(label, content) {
  const sizeKb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  const wordCount = content.split(/\s+/).length;
  const lineCount = content.split('\n').length;
  console.log(`  ${label}: ${sizeKb} KB | ${wordCount} words | ${lineCount} lines`);
}

function main() {
  console.log('Generating llms.txt files...');

  const { output: fullContent, components } = buildReference();
  const indexContent = buildIndex(components);

  fs.writeFileSync(OUTPUT_FULL, fullContent, 'utf8');
  fs.writeFileSync(OUTPUT_INDEX, indexContent, 'utf8');

  logFileStats('llms-full.txt', fullContent);
  logFileStats('llms.txt', indexContent);
  console.log('Done.');
}

main();
