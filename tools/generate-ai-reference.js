#!/usr/bin/env node

/**
 * generate-ai-reference.js
 * Builds a single portable AI-readable design system reference file
 * from the existing CSS tokens and CMS markdown documentation.
 *
 * Usage: node tools/generate-ai-reference.js
 * Output: ai-reference.md (project root)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CMS_DIR = path.join(ROOT, 'cms');
const CSS_FILE = path.join(ROOT, 'assets', 'css', 'design-system.css');
const PREAMBLE_FILE = path.join(__dirname, 'ai-reference-preamble.md');
const OUTPUT_FILE = path.join(ROOT, 'ai-reference.md');

// ─── Helpers ──────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

function stripDemoPreviews(md) {
  // Remove <div class="demo-preview ..."> ... </div> blocks
  // These are visual demos in the docs site, not patterns to copy
  return md.replace(/<div\s+class="demo-preview[^"]*"[\s\S]*?<\/div>\s*(?:<\/div>)?\s*/gi, '');
}

function stripEmptyDemoWrappers(md) {
  // Remove any remaining demo wrappers that might be nested differently
  return md.replace(/<div\s+class="demo-[^"]*"[^>]*>[\s\S]*?<\/div>\s*/gi, '');
}

function stripInlineStyles(md) {
  // Remove style="..." attributes from demo HTML (these are only for styleguide rendering)
  return md.replace(/\s*style="[^"]*"/gi, '');
}

function cleanMarkdown(md) {
  let cleaned = stripFrontmatter(md);
  cleaned = stripDemoPreviews(cleaned);
  cleaned = stripEmptyDemoWrappers(cleaned);
  // Don't strip inline styles from code blocks — only from raw HTML in the markdown
  // This regex targets style attrs outside of backtick code fences
  cleaned = cleaned.replace(/(?<!`[^`]*)style="[^"]*"(?![^`]*`)/gi, '');
  // Collapse 3+ blank lines into 2
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

  // Extract :root blocks with their preceding comments
  const rootPattern = /\/\*\s*[-─]+\s*([\d]+[a-z]?\.\s*[^*]+?)[-─]*\s*\*\/\s*(?:\/\*[\s\S]*?\*\/\s*)?:root\s*\{([^}]*)\}/g;
  let match;
  while ((match = rootPattern.exec(css)) !== null) {
    const sectionName = match[1].trim();
    const block = match[2];
    sections[sectionName] = parseTokenBlock(block);
  }

  // Extract dark mode tokens
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

    // Capture inline section comments
    const commentMatch = trimmed.match(/^\/\*\s*[-–—]*\s*(.*?)\s*[-–—]*\s*\*\/$/);
    if (commentMatch) {
      currentComment = commentMatch[1].trim();
      continue;
    }

    // Capture token declarations
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

// ─── Assembly ─────────────────────────────────────────────

function buildReference() {
  console.log('Generating AI reference...');

  const parts = [];

  // 1. Preamble
  parts.push(readFile(PREAMBLE_FILE));

  // 2. Layout System
  parts.push('## Layout System\n');
  parts.push(readCmsFile('layout.md'));
  parts.push('\n\n---\n');

  // 3. Design Tokens (from CSS)
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
  parts.push('\n\n---\n');

  // 11. CSS Conventions
  parts.push('\n## CSS Conventions\n');
  parts.push(readCmsFile('css-code-struture.md'));
  parts.push('\n');

  // Final assembly
  let output = parts.join('');

  // Final cleanup: collapse excessive blank lines
  output = output.replace(/\n{4,}/g, '\n\n\n');

  return output;
}

// ─── Main ─────────────────────────────────────────────────

function main() {
  const output = buildReference();
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

  const sizeKb = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
  const wordCount = output.split(/\s+/).length;
  const lineCount = output.split('\n').length;

  console.log(`  Output: ai-reference.md`);
  console.log(`  Size: ${sizeKb} KB | ${wordCount} words | ${lineCount} lines`);
  console.log('Done.');
}

main();
