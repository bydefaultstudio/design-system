#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { marked } = require('marked');

// Configuration
const DOCS_DIR = path.join(__dirname, '..');  // ../ (cms/)
const OUTPUT_DIR = path.join(__dirname, '..', '..');  // ../../ (project root)
const TEMPLATE_FILE = path.join(__dirname, 'template.html');

// Load project config (cms/docs.config.js) with fallback defaults
const configPath = path.join(DOCS_DIR, 'docs.config.js');
const userConfig = fs.existsSync(configPath) ? require(configPath) : {};
const PROJECT_CONFIG = {
  designSystemPath: userConfig.designSystemPath || 'assets/css/design-system.css',
  brandCssPath: userConfig.brandCssPath || null,
  googleFontsUrl: userConfig.googleFontsUrl !== undefined ? userConfig.googleFontsUrl : null,
  footerText: userConfig.footerText || '',
  indexDescription: userConfig.indexDescription || 'Complete documentation for your project.',
};

// Build Brand CSS HTML snippet
const BRAND_CSS_HTML = PROJECT_CONFIG.brandCssPath
  ? `<link rel="stylesheet" href="${PROJECT_CONFIG.brandCssPath}">`
  : '';

// Build Google Fonts HTML snippet
const GOOGLE_FONTS_HTML = PROJECT_CONFIG.googleFontsUrl
  ? `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${PROJECT_CONFIG.googleFontsUrl}" rel="stylesheet">`
  : '';

//------- Icon Map -------//

const ICONS_DIR = path.join(OUTPUT_DIR, 'assets', 'images', 'svg-icons');
let ICON_MAP = {};

/**
 * Scan assets/images/svg-icons/ and build icon-name → normalised SVG string map.
 * Called once at the start of generateDocs().
 */
function buildIconMap() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));
  const map = {};
  const seen = {};

  for (const file of files) {
    const key = file.replace(/\.svg$/i, '').toLowerCase().replace(/\s+/g, '-');

    // Handle duplicates — prefer capitalised filename, warn on collision
    if (seen[key]) {
      console.warn(`⚠️  Duplicate icon key "${key}" — "${file}" collides with "${seen[key]}". Keeping first.`);
      continue;
    }
    seen[key] = file;

    let svg = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8')
      .replace(/\n\s*/g, '') // collapse to single line
      .trim();

    // Normalise: replace fixed width/height with 100%
    svg = svg.replace(/(<svg[^>]*)\s+width=["']\d+["']/i, '$1 width="100%"');
    svg = svg.replace(/(<svg[^>]*)\s+height=["']\d+["']/i, '$1 height="100%"');

    // Add aria-hidden if not present
    if (!svg.includes('aria-hidden')) {
      svg = svg.replace(/<svg/, '<svg aria-hidden="true"');
    }

    map[key] = { svg: svg, file: file };
  }

  ICON_MAP = map;
  console.log(`🎨 Icon map built: ${Object.keys(map).length} icons`);
}

/**
 * Return icon wrapped in the standard .icn-svg container.
 * @param {string} name - kebab-case icon key
 * @returns {string} HTML string
 */
function getIcon(name) {
  const entry = ICON_MAP[name];
  if (!entry) {
    console.warn(`⚠️  Unknown icon: "${name}"`);
    return `<!-- unknown icon: ${name} -->`;
  }
  return `<div class="icn-svg" data-icon="${name}" data-file="${entry.file}">${entry.svg}</div>`;
}

/**
 * Return raw SVG string (no wrapper). For contexts that build their own wrapper,
 * such as nav.js where icons have additional classes.
 * @param {string} name - kebab-case icon key
 * @returns {string} SVG string
 */
function getRawIcon(name) {
  const entry = ICON_MAP[name];
  if (!entry) {
    console.warn(`⚠️  Unknown icon (raw): "${name}"`);
    return `<!-- unknown icon: ${name} -->`;
  }
  return entry.svg;
}

/**
 * Render a .book-cover anchor with the standard header/content/footer layout.
 *
 *   header  → full-screen icon (top right)
 *   content → card-title + optional card-description
 *   footer  → author (left) + add icon (right placeholder for future meta)
 *
 * @param {object} opts
 * @param {string} opts.href      - link target
 * @param {string} opts.title     - card title (required)
 * @param {string} [opts.subtitle] - card description (optional)
 * @param {string} [opts.author]  - footer author label (defaults to "Studio")
 * @param {string} [opts.access]  - data-access value (omitted if falsy)
 * @returns {string} HTML string
 */
function renderBookCover(opts) {
  const author = opts.author || 'Studio';
  const accessAttr = opts.access ? ` data-access="${opts.access}"` : '';
  const description = opts.subtitle
    ? `<p class="book-cover-description" data-text-wrap="pretty">${opts.subtitle}</p>`
    : '';
  return `<a href="${opts.href}" class="book-cover"${accessAttr}>
        <header class="book-cover-header">${getIcon('full-screen')}</header>
        <div class="book-cover-content">
          <h3 class="book-cover-title">${opts.title}</h3>
          ${description}
        </div>
        <footer class="book-cover-footer">
          <span class="book-cover-author"><em>by</em> ${author}</span>
          ${getIcon('add')}
        </footer>
      </a>`;
}

//------- Section-to-Folder Mapping -------//

const SECTION_FOLDERS = {
  'Brand Book': 'brand',
  'Design System': 'design-system',
  'Website': 'website',
  'Docs': 'docs',
  'Tools': 'tools',
  'Projects': 'projects'
};

// Special filename overrides for files that don't follow the prefix-strip pattern
const FILENAME_OVERRIDES = {
  'calculator-docs.md': { folder: 'tools', name: 'cpm-calculator-docs.html' },
  'svg-cleaner-docs.md': { folder: 'tools', name: 'svg-cleaner-docs.html' },
  'display-ad-preview-docs.md': { folder: 'tools', name: 'display-ad-preview-docs.html' },
  'css-code-struture.md': { folder: 'docs', name: 'css.html' },
  'js-code-structure.md': { folder: 'docs', name: 'javascript.html' },

  'markdown-style.md': { folder: 'docs', name: 'markdown-style.html' },
  'seo-best-practices.md': { folder: 'docs', name: 'seo-best-practices.html' },
  'access-control.md': { folder: 'docs', name: 'access-control.html' },
  'client-setup.md': { folder: 'docs', name: 'client-setup.html' },
  'setup.md': { folder: 'docs', name: 'setup.html' },
  'folder-structure.md': { folder: 'docs', name: 'folder-structure.html' },
  'upgrading-docs.md': { folder: 'docs', name: 'upgrading-docs.html' },
  'login-scenarios.md': { folder: 'docs', name: 'login-scenarios.html' },
  'llms-docs.md': { folder: 'docs', name: 'llms.html' },
};

/**
 * Derive output folder and filename for a markdown file
 */
function deriveOutputPath(filename, section) {
  // Check for explicit override
  if (FILENAME_OVERRIDES[filename]) {
    const override = FILENAME_OVERRIDES[filename];
    return { folder: override.folder, htmlName: override.name };
  }

  // Get section folder
  const folder = SECTION_FOLDERS[section];
  if (!folder) {
    // Fallback: use filename as-is at root (shouldn't happen for mapped sections)
    return { folder: '', htmlName: filename.replace('.md', '.html') };
  }

  // Strip section prefix from filename
  // e.g. "brand-values.md" with folder "brand" → strip "brand-" → "values.html"
  let baseName = filename.replace('.md', '');
  const prefixes = [folder + '-', section.toLowerCase().replace(/\s+/g, '-') + '-'];
  for (const prefix of prefixes) {
    if (baseName.startsWith(prefix)) {
      baseName = baseName.substring(prefix.length);
      break;
    }
  }

  return { folder, htmlName: baseName + '.html' };
}

/**
 * Load folder defaults from _defaults.md in a given directory.
 * Returns parsed frontmatter object, or empty object if no _defaults.md exists.
 */
const _defaultsCache = {};
function loadDefaults(dirPath) {
  if (_defaultsCache[dirPath] !== undefined) return _defaultsCache[dirPath];
  const defaultsFile = path.join(dirPath, '_defaults.md');
  if (fs.existsSync(defaultsFile)) {
    const raw = fs.readFileSync(defaultsFile, 'utf8');
    const { frontmatter } = parseFrontmatter(raw);
    _defaultsCache[dirPath] = frontmatter;
    return frontmatter;
  }
  _defaultsCache[dirPath] = {};
  return {};
}

/**
 * Derive the data-access attribute value from access + client frontmatter fields.
 *
 * Rules:
 *   access "public" / "team" / "admin"  → passthrough
 *   access "client"        + client "all"        → "client"
 *   access "client"        + client "<name>"      → "client:<name>"
 *   access "admin+client"  + client "all"        → "admin+client"
 *   access "admin+client"  + client "<name>"      → "admin+client:<name>"
 *   fallback                                      → "team"
 */
function deriveDataAccess(frontmatter) {
  const access = frontmatter.access || 'team';
  const client = frontmatter.client || 'internal';

  if (access === 'client' || access === 'admin+client') {
    let clientPart;
    if (client === 'all') {
      clientPart = 'client';
    } else if (client && client !== 'internal') {
      clientPart = 'client:' + client;
    } else {
      return 'team'; // access: "client" with no valid client → fallback
    }
    return access === 'admin+client' ? 'admin+' + clientPart : clientPart;
  }

  return access;
}

/**
 * Parse a comma-separated string into a trimmed array.
 * Returns the provided fallback if the value is falsy.
 */
function parseList(value, fallback) {
  if (!value) return fallback || [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Get subsection ordering for a given section.
 * Looks for a section-specific key first (e.g. "design-system-subsection-order"),
 * then falls back to the generic "subsection-order" key.
 */
function getSubsectionOrder(defaults, section) {
  const slug = section.toLowerCase().replace(/\s+/g, '-');
  const key = `${slug}-subsection-order`;
  if (defaults[key]) return parseList(defaults[key], []);
  return parseList(defaults['subsection-order'], []);
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: content.trim() };
  }

  const frontmatterText = match[1];
  const markdownContent = match[2];

  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: markdownContent.trim() };
}

/**
 * Sitewide pre-pass: chipify any inline <code> matching one of the three
 * explicit conventions, anywhere in the document (paragraphs, lists, tables, etc.).
 *
 *   `.class-name`        → class chip,  copies `.class-name`
 *   `var(--token-name)`  → token chip,  copies `var(--token-name)`
 *   `#abc123`            → hex chip,    copies `#abc123` + colour swatch
 *
 * Anything else in <code> is left alone. Block code (<pre><code class="language-...">)
 * has a `class` attribute on the <code>, so the bare-tag regex below skips it.
 */
function chipifyExplicitPatterns(html) {
  return html.replace(/<code>([^<]+)<\/code>/g, (match, content) => {
    // Class: .foo-bar, .is-active, .cols-3
    if (/^\.[a-z][\w-]*$/i.test(content)) {
      return buildClassButton(content);
    }
    // Token: var(--foo-bar)
    if (/^var\(--[a-z0-9_-]+\)$/i.test(content)) {
      return buildTokenButton(content);
    }
    // Hex: #abc, #abcd, #abcdef, #abcdef12
    if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(content)) {
      return buildHexButton(content);
    }
    return match;
  });
}

function buildClassButton(className) {
  return `<button type="button" class="token-copy is-class" data-copy="${escapeAttr(className)}" aria-label="Copy ${escapeAttr(className)}"><code>${className}</code></button>`;
}

function buildTokenButton(varExpression) {
  return `<button type="button" class="token-copy is-token" data-copy="${escapeAttr(varExpression)}" aria-label="Copy ${escapeAttr(varExpression)}"><code>${varExpression}</code></button>`;
}

/**
 * Turn token-table cells into clickable copy buttons (legacy heuristic pass).
 *
 * Runs after chipifyExplicitPatterns and acts as a fallback for older docs that
 * still use bare `--token` syntax, unwrapped hex values, or font-stack literals
 * inside table cells. Cells already chipified by the explicit-pattern pass are
 * skipped to avoid double-wrapping.
 *
 * Skips the description column (last column when its <th> matches description|notes|usage).
 */
function injectTokenCopyButtons(tableInner) {
  // Identify the description column index from the header row, if any.
  let descriptionIndex = -1;
  const theadMatch = tableInner.match(/<thead>([\s\S]*?)<\/thead>/);
  if (theadMatch) {
    const headers = [...theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => m[1]);
    descriptionIndex = headers.findIndex(h => /description|notes|usage/i.test(h.replace(/<[^>]*>/g, '')));
  }

  // Walk every <tr> and rebuild its <td> cells.
  return tableInner.replace(/<tr>([\s\S]*?)<\/tr>/g, (rowMatch, rowInner) => {
    // Leave header rows alone.
    if (/<th[\s>]/.test(rowInner)) return rowMatch;

    let cellIndex = -1;
    const newInner = rowInner.replace(/<td>([\s\S]*?)<\/td>/g, (_, cell) => {
      cellIndex++;
      if (cellIndex === descriptionIndex) return `<td>${cell}</td>`;
      return `<td>${transformTokenCell(cell)}</td>`;
    });
    return `<tr>${newInner}</tr>`;
  });
}

/**
 * Transform a single token-table cell into a copy button.
 *
 * The new explicit-pattern pre-pass (chipifyExplicitPatterns) handles the
 * common cases: `.class`, `var(--token)`, and `#hex`. This legacy fallback
 * exists only for two narrow backward-compat cases on un-migrated docs:
 *
 *   1. <code>--bare-token</code>  → wraps in var() and chipifies
 *   2. bare #hex (no backticks)   → chipifies with swatch
 *
 * Everything else is left alone. Earlier versions had a "literal copy of any
 * single <code>" case plus a looksLikeValue heuristic that misfired badly
 * (e.g. chipifying "Centre items" because "items" contains "em"). Both removed.
 */
function transformTokenCell(cell) {
  const raw = cell.trim();
  if (!raw) return cell;

  // Already chipified by the sitewide explicit-pattern pre-pass — leave it alone.
  if (raw.includes('class="token-copy')) return cell;

  // Backward-compat 1: <code>--bare-token</code> → copies var(--bare-token)
  const codeVarMatch = raw.match(/^<code>(--[a-z0-9-]+)<\/code>$/i);
  if (codeVarMatch) {
    return buildVarButton(codeVarMatch[1]);
  }

  // Backward-compat 2: bare hex code with no backticks
  const hexMatch = raw.match(/^(#[0-9a-fA-F]{6,8}|#[0-9a-fA-F]{3,4})$/);
  if (hexMatch) {
    return buildHexButton(hexMatch[1]);
  }

  // Backward-compat 3: mixed cells containing one or more <code>--bare-token</code>
  // entries — chipify just the bare tokens, leave any other <code> untouched.
  if (/<code>--[a-z0-9-]+<\/code>/i.test(raw)) {
    return raw.replace(/<code>(--[a-z0-9-]+)<\/code>/gi, (_, inner) => buildVarButton(inner));
  }

  return cell;
}

function buildVarButton(varName) {
  const copyValue = `var(${varName})`;
  return `<button type="button" class="token-copy is-token" data-copy="${escapeAttr(copyValue)}" aria-label="Copy ${escapeAttr(copyValue)}"><code>${varName}</code></button>`;
}

function buildHexButton(hex) {
  return `<button type="button" class="token-copy has-swatch" data-copy="${hex}" aria-label="Copy ${hex}"><code>${hex}</code><span class="token-swatch" style="background:${hex};" aria-hidden="true"></span></button>`;
}

/**
 * Escape a string for safe inclusion in an HTML attribute value.
 */
function escapeAttr(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Convert markdown to HTML using marked
 */
function markdownToHtml(markdown) {
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: 'language-', // Prefix for language classes (for Highlight.js)
  });

  let html = marked(markdown);

  // Add IDs to headings for anchor links
  html = html.replace(/<h([1-6])>([^<]+)<\/h[1-6]>/g, (match, level, text) => {
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    return `<h${level} id="${id}">${text}</h${level}>`;
  });

  // Add target="_blank" and rel="noopener noreferrer" to external links
  html = html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (match, before, href, after) => {
    // Check if link is external (starts with http:// or https://)
    if (href.startsWith('http://') || href.startsWith('https://')) {
      let newMatch = match;

      // Add target="_blank" if it doesn't exist
      if (!newMatch.includes('target=')) {
        newMatch = newMatch.replace(/>$/, ' target="_blank">');
      }

      // Add or update rel attribute
      if (newMatch.includes('rel=')) {
        newMatch = newMatch.replace(/rel=["']([^"']*)["']/i, (m, rel) => {
          // Check if noopener noreferrer already exists in rel
          if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
            return `rel="${rel} noopener noreferrer"`;
          }
          return m;
        });
      } else {
        // Add new rel attribute
        newMatch = newMatch.replace(/>$/, ' rel="noopener noreferrer">');
      }

      return newMatch;
    }
    return match;
  });

  // Sitewide pre-pass: chipify any inline <code> matching .class / var(--token) / #hex.
  // Works anywhere in the document — paragraphs, lists, tables, callouts.
  html = chipifyExplicitPatterns(html);

  // Wrap bare tables (markdown-generated) in a scroll container — skip demo tables that already have classes
  html = html.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-scroll"><table class="table">$1</table></div>');

  // Turn token-table cells into copy buttons.
  // Skips the "Description" column (last column when its header text matches description|notes|usage).
  // Each non-description cell whose content is a recognisable token, value, or hex
  // is replaced with a <button class="token-copy"> that copies the right thing on click.
  html = html.replace(/<table class="table">([\s\S]*?)<\/table>/g, (_, tableInner) => {
    return `<table class="table">${injectTokenCopyButtons(tableInner)}</table>`;
  });

  // Add copy buttons to code blocks
  html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attributes, code) => {
    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);

    return `
      <div class="code-block-wrapper">
        <button class="button is-xsmall copy-btn is-icon-only" data-clipboard-target="#${codeId}" data-tooltip="Copy" type="button" aria-label="Copy code"><span class="copy-btn-default">${getIcon('copy')}</span><span class="copy-btn-copied">${getIcon('check')}</span></button>
        <pre><code id="${codeId}"${attributes}>${code}</code></pre>
      </div>
    `;
  });

  // Expand icon shorthand: {{icon:name}} (skip matches inside <code> or <pre> blocks)
  html = html.replace(/(<code[^>]*>[\s\S]*?<\/code>)|(<pre[^>]*>[\s\S]*?<\/pre>)|\{\{icon:([a-z0-9-]+)\}\}/g,
    (match, code, pre, name) => {
      if (code || pre) return match; // preserve code blocks as-is
      return getIcon(name);
    });

  return html;
}

/**
 * Generate table of contents from HTML content
 */
function generateTableOfContents(html) {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>.*?<\/h[1-6]>/g;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[0].replace(/<[^>]*>/g, '').trim();

    // Only include H1 and H2 headings in TOC
    if (level <= 2) {
      headings.push({ level, id, text });
    }
  }

  if (headings.length === 0) {
    return '<div class="toc-empty">No headings found</div>';
  }

  let toc = '<nav class="toc"><ul class="toc-list">';

  headings.forEach((heading) => {
    const { level, id, text } = heading;
    toc += `<li class="toc-item toc-level-${level}"><a href="#${id}" class="toc-link">${text}</a></li>`;
  });

  toc += '</ul></nav>';
  return toc;
}

/**
 * Generate index page HTML
 */
function generateIndexPage(template, filesBySection) {
  // Simplified index: one card per section in a 2-column grid
  const sectionCards = [
    { title: 'Brand Book', href: 'brand/', subtitle: 'Brand identity, values, positioning, and visual guidelines' },
    { title: 'Design System', href: 'design-system/', subtitle: 'Tokens, components, and styling patterns' },
    { title: 'Tools', href: 'tools/', subtitle: 'Utilities for ad operations, SVG processing, and more', access: 'team' },
    { title: 'Documentation', href: 'docs/', subtitle: 'Technical docs for layout, CSS, JavaScript, and project setup' },
  ];

  let cards = `<div class="docs-section">
      <div class="grid cols-2 gap-xl">`;

  for (const card of sectionCards) {
    cards += `
        ${renderBookCover(card)}`;
  }

  cards += `
      </div>
    </div>`;

  const indexContent = `
    <div class="docs-hero">
      <h1 class="docs-hero-title">By Default Brand OS</h1>
      <p class="docs-hero-description" data-text-wrap="balance">${PROJECT_CONFIG.indexDescription}</p>
    </div>
    ${cards}
  `;

  const access = deriveDataAccess(loadDefaults(DOCS_DIR));

  return template
    .replaceAll('{{PAGE_TITLE}}', 'Home')
    .replaceAll('{{META_DESCRIPTION}}', PROJECT_CONFIG.indexDescription)
    .replace('{{PAGE_HEADER}}', '') // Index page doesn't need a header
    .replace('{{PAGE_STICKY_BAR}}', '')
    .replace('{{PAGE_CONTENT}}', indexContent)
    .replace('{{TOC_SECTION}}', '')
    .replace('{{DESIGN_SYSTEM_PATH}}', PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML)
    .replace('{{CLIENT_THEME_CSS}}', '')
    .replace('{{CLIENT_THEME_ATTR}}', '')
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', '')
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText)
    .replace('{{PAGE_ACCESS}}', access)
    .replaceAll('{{NAV_BASE}}', '');
}

/**
 * Generate a section overview page with card grid
 */
function generateSectionIndexPage(section, template, files, filesBySection) {
  const sectionFolder = SECTION_FOLDERS[section];
  if (!sectionFolder) return null;

  // Layer Discipline (CLAUDE.md §17): the Design System index lists only
  // foundation + core layer pages. Docs-site components like asset-card,
  // book-cover, dont-card etc. still get standalone pages but are hidden
  // from the index so the design system surface stays portable.
  if (section === 'Design System') {
    files = files.filter(f => {
      const layer = f.frontmatter.layer;
      return layer === 'foundation' || layer === 'core';
    });
  }

  // Sort files by order
  const sorted = [...files].sort((a, b) => {
    const orderA = a.frontmatter.order || 999;
    const orderB = b.frontmatter.order || 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });

  let cards = '';

  // Generic subsection grouping (works for all sections)
  const defaults = loadDefaults(DOCS_DIR);
  const subsectionOrder = getSubsectionOrder(defaults, section);
  const ungrouped = sorted.filter(f => !f.frontmatter.subsection);
  const grouped = {};
  for (const file of sorted) {
    const sub = file.frontmatter.subsection;
    if (sub) {
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(file);
    }
  }

  // Ungrouped files first
  if (ungrouped.length > 0) {
    cards += `<div class="docs-section"><div class="grid cols-2 gap-xl">`;
    for (const file of ungrouped) {
      let cardHref = file.htmlName;
      let cardAccess = deriveDataAccess(file.frontmatter);
      const cardActionUrl = file.frontmatter.actionUrl || file.frontmatter.toolUrl;
      if (cardActionUrl) {
        cardHref = cardActionUrl;
        cardAccess = file.frontmatter.actionAccess || file.frontmatter.toolAccess || cardAccess;
      }
      cards += renderBookCover({
        href: cardHref,
        title: file.title,
        subtitle: file.frontmatter.subtitle,
        author: file.frontmatter.author,
        access: cardAccess,
      });
    }

    cards += `</div></div>`;
  }

  // Subsections in configured order
  const subs = Object.keys(grouped).sort((a, b) => {
    const idxA = subsectionOrder.indexOf(a);
    const idxB = subsectionOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const sub of subs) {
    cards += `<div class="docs-section"><h2 class="eyebrow">${sub}</h2><div class="grid cols-2 gap-xl">`;
    for (const file of grouped[sub]) {
      cards += renderBookCover({
        href: file.htmlName,
        title: file.title,
        subtitle: file.frontmatter.subtitle,
        author: file.frontmatter.author,
        access: deriveDataAccess(file.frontmatter),
      });
    }
    cards += `</div></div>`;
  }

  // Docs-only: add Tools documentation as a subsection
  if (section === 'Docs' && filesBySection && filesBySection['Tools']) {
    const toolFiles = [...filesBySection['Tools']].sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });
    cards += `<div class="docs-section"><h2 class="eyebrow">Tools</h2><div class="grid cols-2 gap-xl">`;
    for (const file of toolFiles) {
      cards += renderBookCover({
        href: `../${file.htmlPath}`,
        title: file.title,
        subtitle: file.frontmatter.subtitle,
        author: file.frontmatter.author,
        access: deriveDataAccess(file.frontmatter),
      });
    }
    cards += `</div></div>`;
  }

  // Design System section: use custom template with embedded style guide
  if (section === 'Design System') {
    var customTemplatePath = path.join(__dirname, 'design-system-index.html');
    if (fs.existsSync(customTemplatePath)) {
      var customHtml = fs.readFileSync(customTemplatePath, 'utf8');
      return customHtml.replace('{{SECTION_CARDS}}', cards);
    }
  }

  const pageContent = `<div class="docs-hero"><h1 class="docs-hero-title">${section}</h1></div>${cards}`;
  const navBase = '../';

  return template
    .replaceAll('{{PAGE_TITLE}}', `${section} — Overview`)
    .replaceAll('{{META_DESCRIPTION}}', `Overview of all ${section} pages.`)
    .replace('{{PAGE_HEADER}}', '')
    .replace('{{PAGE_STICKY_BAR}}', '')
    .replace('{{PAGE_CONTENT}}', pageContent)
    .replace('{{TOC_SECTION}}', '')
    .replace('{{DESIGN_SYSTEM_PATH}}', navBase + PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML ? BRAND_CSS_HTML.replace(/href="(?!http)/g, `href="${navBase}`) : '')
    .replace('{{CLIENT_THEME_CSS}}', '')
    .replace('{{CLIENT_THEME_ATTR}}', '')
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', '')
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText)
    .replace('{{PAGE_ACCESS}}', deriveDataAccess(loadDefaults(DOCS_DIR)))
    .replaceAll('{{NAV_BASE}}', navBase);
}

/**
 * Build a flat ordered list of all pages following the nav order
 */
function buildPageOrder(filesBySection) {
  const defaults = loadDefaults(DOCS_DIR);
  const sectionOrder = parseList(defaults['section-order'], ['Brand Book', 'Design System', 'Tools', 'Docs']);
  const hiddenSections = [];
  const sortedSections = Object.keys(filesBySection)
    .filter(s => !hiddenSections.includes(s))
    .sort((a, b) => {
    const indexA = sectionOrder.indexOf(a);
    const indexB = sectionOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  const sortByOrder = (a, b) => {
    const orderA = a.frontmatter.order || 999;
    const orderB = b.frontmatter.order || 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  };

  const ordered = [];
  for (const section of sortedSections) {
    const files = [...filesBySection[section]];
    const subsectionOrder = getSubsectionOrder(defaults, section);

    // Ungrouped files first (no subsection), matching nav sidebar order
    const ungrouped = files.filter(f => !f.frontmatter.subsection).sort(sortByOrder);
    ordered.push(...ungrouped);

    // Then subsection groups in configured order
    const grouped = {};
    for (const file of files) {
      const sub = file.frontmatter.subsection;
      if (sub) {
        if (!grouped[sub]) grouped[sub] = [];
        grouped[sub].push(file);
      }
    }
    const subsections = Object.keys(grouped).sort((a, b) => {
      const idxA = subsectionOrder.indexOf(a);
      const idxB = subsectionOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    for (const sub of subsections) {
      ordered.push(...grouped[sub].sort(sortByOrder));
    }
  }
  return ordered;
}

/**
 * Generate prev/next navigation HTML for a page
 */
function generatePageNav(file, pageOrder) {
  const index = pageOrder.findIndex(p => p.filename === file.filename);
  if (index === -1) return '';

  const prev = index > 0 ? pageOrder[index - 1] : null;
  const next = index < pageOrder.length - 1 ? pageOrder[index + 1] : null;

  if (!prev && !next) return '';

  // Compute relative href from current file's folder to target file
  function relativeHref(target) {
    const fromFolder = file.htmlFolder || '';
    const toFolder = target.htmlFolder || '';
    if (fromFolder === toFolder) return target.htmlName;
    if (fromFolder && !toFolder) return '../' + target.htmlName;
    if (!fromFolder && toFolder) return target.htmlPath;
    return '../' + target.htmlPath;
  }

  const arrowLeft = `<div class="icn-svg page-nav-arrow" data-icon="chevron-left-large">${getRawIcon('chevron-left-large')}</div>`;
  const arrowRight = `<div class="icn-svg page-nav-arrow" data-icon="chevron-right-large">${getRawIcon('chevron-right-large')}</div>`;

  let html = '<nav class="page-nav" aria-label="Page navigation"><div class="page-nav-inner padding-global">';

  if (prev) {
    const sectionLabel = prev.section !== file.section ? `<span class="page-nav-section">${prev.section}</span>` : '';
    html += `<a href="${relativeHref(prev)}" class="page-nav-link page-nav-prev" rel="prev">
      ${arrowLeft}
      <span class="page-nav-text">
        <span class="page-nav-label">Previous</span>
        ${sectionLabel}
        <h3 class="page-nav-title">${prev.title}</h3>
      </span>
    </a>`;
  } else {
    html += '<span class="page-nav-link page-nav-placeholder"></span>';
  }

  if (next) {
    const sectionLabel = next.section !== file.section ? `<span class="page-nav-section">${next.section}</span>` : '';
    html += `<a href="${relativeHref(next)}" class="page-nav-link page-nav-next" rel="next">
      <span class="page-nav-text">
        <span class="page-nav-label">Next</span>
        ${sectionLabel}
        <h3 class="page-nav-title">${next.title}</h3>
      </span>
      ${arrowRight}
    </a>`;
  } else {
    html += '<span class="page-nav-link page-nav-placeholder"></span>';
  }

  html += '</div></nav>';
  return html;
}

/**
 * Build footer text from project config (shared by internal and client docs).
 */
function buildFooterHtml() {
  return PROJECT_CONFIG.footerText || '© 2026 By Default';
}

/**
 * Build script tags for a page based on section and frontmatter.
 * - Website section pages get global GSAP + bd-* scripts automatically.
 * - Any page can request additional scripts via the "scripts" frontmatter field.
 *   e.g. scripts: "splide, scroll-smoother"
 */
function buildPageScripts(section, frontmatter) {
  const base = '../';

  // Script registry — maps keywords to script tag paths (load order matters)
  const SCRIPT_REGISTRY = {
    // GSAP core + standard plugins (global for Website)
    'gsap':             `${base}assets/js/vendor/gsap/gsap.min.js`,
    'scroll-trigger':   `${base}assets/js/vendor/gsap/ScrollTrigger.min.js`,
    'split-text':       `${base}assets/js/vendor/gsap/SplitText.min.js`,
    // GSAP optional plugins (per-page)
    'scroll-smoother':  `${base}assets/js/vendor/gsap/ScrollSmoother.min.js`,
    'draggable':        `${base}assets/js/vendor/gsap/Draggable.min.js`,
    'scroll-to':        `${base}assets/js/vendor/gsap/ScrollToPlugin.min.js`,
    // In-house tools (global for Website)
    'bd-animations':    `${base}assets/js/bd/bd-animations.js`,
    'bd-audio':         `${base}assets/js/bd/bd-audio.js`,
    'bd-cursor':        `${base}assets/js/bd/bd-cursor.js`,
    // Third-party (per-page)
    'splide':           'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js',
    'splide-auto-scroll': 'https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js',
    'splide-intersection': 'https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-intersection@0.2.0/dist/js/splide-extension-intersection.min.js',
    // Notion dynamic forms
    'notion-form':        `${base}assets/js/notion-form.js`,
  };

  // Global scripts for Website section pages (order matters)
  const WEBSITE_GLOBALS = [
    'gsap', 'scroll-trigger', 'split-text',
    'bd-animations', 'bd-audio', 'bd-cursor'
  ];

  const scripts = [];

  // Add global scripts for Website section
  if (section === 'Website') {
    for (const key of WEBSITE_GLOBALS) {
      scripts.push(SCRIPT_REGISTRY[key]);
    }
  }

  // Add per-page scripts from frontmatter (e.g. scripts: "splide, scroll-smoother")
  if (frontmatter.scripts) {
    const requested = frontmatter.scripts.split(',').map(s => s.trim().toLowerCase());
    for (const key of requested) {
      if (SCRIPT_REGISTRY[key] && !scripts.includes(SCRIPT_REGISTRY[key])) {
        scripts.push(SCRIPT_REGISTRY[key]);
      }
    }
  }

  if (scripts.length === 0) return '';

  const parts = [];

  // Add CSS for Website section (bd-cursor needs its stylesheet)
  if (section === 'Website') {
    parts.push(`    <link rel="stylesheet" href="${base}assets/css/bd-cursor.css">`);
  }

  // Add script tags
  parts.push(...scripts.map(src => `    <script src="${src}"></script>`));

  return parts.join('\n');
}

/**
 * Generate page HTML
 */
function generatePage(file, template, pageOrder) {
  const { frontmatter, content } = file;
  let htmlContent = markdownToHtml(content);

  // Apply drop cap to first paragraph if enabled in frontmatter
  if (frontmatter.dropcap === 'true') {
    htmlContent = htmlContent.replace(/<p>/, '<p class="drop-cap">');
  }

  const tableOfContents = generateTableOfContents(htmlContent);
  const access = deriveDataAccess(frontmatter);

  // Generate full-width page header (lives outside the content grid)
  let pageHeader = '';
  const actionUrl = frontmatter.actionUrl || frontmatter.toolUrl;
  const actionLabel = frontmatter.actionLabel || frontmatter.toolLabel || 'Open';
  const actionLinkHtml = actionUrl
    ? `<div class="button-group justify-center">
        <a href="${actionUrl}" class="button is-small page-action-link">${actionLabel}</a>
      </div>`
    : '';
  if (frontmatter.title) {
    pageHeader = `<div class="page-header">
      <div class="container-small">
        <h1>${frontmatter.title}</h1>
        ${frontmatter.subtitle ? `<p class="page-subtitle" data-text-wrap="pretty">${frontmatter.subtitle}</p>` : ''}
        ${actionLinkHtml}
      </div>
    </div>`;
  }

  // Generate sticky sub-header bar (breadcrumb + markdown dropdown)
  let pageSubbar = '';
  if (frontmatter.title && file.htmlFolder) {
    const sectionLabel = file.section || file.htmlFolder.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    pageSubbar = `<div class="sticky-bar sticky-bar-page">
      <div class="sticky-bar-container">
        <div class="sticky-bar-content">
          <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">
            <a href="../${file.htmlFolder}/index.html">${sectionLabel}</a>
            <span class="breadcrumb-separator">/</span>
            <span>${frontmatter.title}</span>
          </nav>
        </div>
        <div class="sticky-bar-actions">
          <div class="dropdown">
            <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Markdown source options">
              ${getIcon('more-horizontal')}
            </button>
            <div class="dropdown-menu is-right">
              <button type="button" class="dropdown-item js-copy-url" aria-label="Copy page link to clipboard">
                ${getIcon('link')}
                <span>Copy link</span>
              </button>
              <div data-auth-role="team">
                <div class="dropdown-divider"></div>
                <a href="../cms/${file.markdownPath}" class="dropdown-item js-md-download" download>
                  ${getIcon('download')}
                  <span>Download .md file</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="../cms/${file.markdownPath}" class="dropdown-item js-md-open" target="_blank" rel="noopener noreferrer">
                  ${getIcon('open-full')}
                  <span>Open .md in new tab</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // Build page scripts based on section and frontmatter
  const pageScripts = buildPageScripts(file.section, frontmatter);

  return template
    .replaceAll('{{PAGE_TITLE}}', frontmatter.title || 'Untitled')
    .replaceAll('{{META_DESCRIPTION}}', frontmatter.description || '')
    .replace('{{PAGE_HEADER}}', pageHeader)
    .replace('{{PAGE_STICKY_BAR}}', pageSubbar)
    .replace('{{PAGE_CONTENT}}', htmlContent)
    .replace('{{TOC_SECTION}}', `<aside class="docs-toc">
      <span class="toc-header">On this page</span>
      <div class="toc-wrapper">${tableOfContents}</div>
    </aside>`)
    .replace('{{DESIGN_SYSTEM_PATH}}', '../' + PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML ? `<link rel="stylesheet" href="../${PROJECT_CONFIG.brandCssPath}">` : '')
    .replace('{{CLIENT_THEME_CSS}}', '')
    .replace('{{CLIENT_THEME_ATTR}}', '')
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', generatePageNav(file, pageOrder))
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText)
    .replace('{{PAGE_ACCESS}}', access)
    .replace('{{PAGE_SCRIPTS}}', pageScripts)
    .replaceAll('{{NAV_BASE}}', '../');
}

/**
 * Generate nav.js — a synchronous script that injects the site header + sidebar
 * into any page via a #site-nav mount point.
 *
 * Mount point attributes:
 *   data-base=""     → root pages (assets/...)
 *   data-base="../"  → subdirectory pages (../assets/...)
 *   data-sidebar="false" → header only, no sidebar
 */
function generateNavJs(filesBySection) {
  // Build navigation HTML (no active page — active detection is done at runtime)
  const navSectionsHtml = buildNavSectionsHtml(filesBySection);

  // Escape backticks and backslashes for embedding in a JS template literal
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/'/g, "\\'");

  const script = `/**
 * nav.js — Auto-generated by cms/generator/generate-docs.js
 * Injects site header + sidebar into any page with a #site-nav mount point.
 * DO NOT EDIT MANUALLY — re-run: cd cms/generator && npm run docgen
 */
(function initSiteNav() {
  'use strict';

  var mount = document.getElementById('site-nav');
  if (!mount) return;

  var base = mount.getAttribute('data-base') || '';
  var hasSidebar = mount.getAttribute('data-sidebar') !== 'false';

  // ── Shared SVG icons (loaded from assets/images/svg-icons/) ──
  var ICON_HAMBURGER = '${esc(getRawIcon('menu'))}';
  var ICON_CLOSE = '${esc(getRawIcon('close'))}';
  var ICON_COLLAPSE = '${esc(getRawIcon('sidebar-open'))}';
  var ICON_EXPAND = '${esc(getRawIcon('sidebar-close'))}';
  var ICON_BACK = '${esc(getRawIcon('back-arrow'))}';
  var ICON_HOME = '${esc(getRawIcon('home'))}';
  var ICON_SUN = '${esc(getRawIcon('sun-1'))}';
  var ICON_MOON = '${esc(getRawIcon('moon'))}';
  var ICON_MAIL = '${esc(getRawIcon('mail'))}';

  // ── Build header HTML ──
  var headerLeft = '<div class="site-header-left">';

  if (hasSidebar) {
    // Hamburger for mobile sidebar
    headerLeft += '<div class="header-link site-header-hamburger" role="button" tabindex="0" aria-label="Open navigation">'
      + '<div class="icn-svg hamburger-icon-open">' + ICON_HAMBURGER + '</div>'
      + '<div class="icn-svg hamburger-icon-close">' + ICON_CLOSE + '</div>'
      + '</div>';
  }

  headerLeft += '<a href="' + base + 'index.html" class="site-header-logo-link">'
    + '<div class="svg-logo nav-logo" data-icon="logo"><svg width="100%" height="100%" viewBox="0 0 1050 505" fill="none" aria-hidden="true">'
    + '<path d="M88.578 500C28.971 500 0 462.371 0 412.421C0 362.471 28.971 326 88.578 326H113.542L114.874 324.668V268.332L116.206 267H170.152L171.484 268.332V498.668L170.152 500H88.578ZM88.578 444.056C104.562 444.056 118.548 432.734 118.548 412.754C118.548 392.774 104.562 381.452 88.578 381.452C72.594 381.452 58.608 392.774 58.608 412.754C58.608 432.734 72.594 444.056 88.578 444.056Z" fill="currentColor"/>'
    + '<path d="M270.184 504.995C218.236 504.995 185.602 466.7 185.602 412.754C185.602 358.808 216.238 320.513 268.186 320.513C313.474 320.513 348.106 348.152 348.106 405.095V429.071L346.774 430.403H257.863C250.537 430.403 245.875 434.399 245.875 441.725C245.875 451.382 253.867 459.041 268.852 459.041C280.174 459.041 286.834 454.712 288.166 448.385L289.498 447.053H343.444L344.776 448.385C341.113 483.35 309.811 504.995 270.184 504.995ZM279.175 397.769C286.501 397.769 290.497 393.107 290.497 385.781C290.497 375.125 281.506 367.133 268.519 367.133C255.532 367.133 246.541 375.125 246.541 385.781C246.541 393.107 250.537 397.769 257.863 397.769H279.175Z" fill="currentColor"/>'
    + '<path d="M383.323 500L381.991 498.668V390.11C381.991 379.454 375.997 373.46 365.341 373.46H352.021L350.689 372.128V327.332L352.021 326H380.659L381.991 324.668L382.018 268.332L383.35 267H473.593L474.925 268.332L474.898 304.862L473.566 306.194H455.251C443.929 306.194 438.601 312.014 438.601 323.336V324.668L439.933 326H473.566L474.898 327.332V372.128L473.566 373.46H455.251C444.595 373.46 438.601 379.454 438.601 390.11V498.668L437.269 500H383.323Z" fill="currentColor"/>'
    + '<path d="M562.413 500C502.806 500 473.835 463.196 473.835 413.246C473.835 363.296 502.806 326 562.413 326H647.661L648.993 327.332V498.668L647.661 500H562.413ZM562.413 444.056C578.397 444.056 592.383 432.734 592.383 412.754C592.383 392.774 578.397 381.452 562.413 381.452C546.429 381.452 532.443 392.774 532.443 412.754C532.443 432.734 546.429 444.056 562.413 444.056Z" fill="currentColor"/>'
    + '<path d="M833.179 326L834.511 327.332V498.668L833.179 500H675.337L674.005 498.668V327.332L675.337 326H729.283L730.615 327.332V424.076C730.615 439.061 738.94 447.386 753.925 447.386H754.591C769.576 447.386 777.901 439.061 777.901 424.076V327.332L779.233 326H833.179Z" fill="currentColor"/>'
    + '<path d="M860.837 500L859.505 498.668V268.332L860.837 267H914.783L916.115 268.332V430.736C916.115 441.392 922.109 447.386 932.765 447.386H933.764L935.096 448.718V498.668L933.764 500H860.837Z" fill="currentColor"/>'
    + '<path d="M959.348 500L958.016 498.668V390.602C958.016 379.946 952.021 373.952 941.365 373.952H928.046L926.714 372.62V327.332L928.046 326H956.684L958.016 324.668V278.222L959.348 276.89H1013.29L1014.63 278.222V324.668L1015.96 326H1048.67L1050 327.332V372.62L1048.67 373.952H1030.35C1019.7 373.952 1014.63 379.946 1014.63 390.602V434.732C1014.63 445.388 1019.7 450.05 1030.35 450.05H1048.67L1050 451.382V498.668L1048.67 500H959.348Z" fill="currentColor"/>'
    + '<path d="M17.332 233L16 231.668V1.332L17.332 0L71.2578 0L72.5898 1.332V57.668L73.9218 59H99.2298C158.837 59 187.808 95.963 187.808 145.913C187.808 195.863 158.837 233 99.2298 233H17.332ZM99.2298 177.056C115.214 177.056 129.2 165.734 129.2 145.754C129.2 125.774 115.214 114.452 99.2298 114.452C83.2458 114.452 69.2598 125.774 69.2598 145.754C69.2598 165.734 83.2458 177.056 99.2298 177.056Z" fill="currentColor"/>'
    + '<path d="M193.84 306L192.508 304.668V268.332L193.84 267H235.132C247.453 267 252.448 261.305 254.446 252.314L255.445 248.318C257.776 238.328 252.115 233 242.125 233H232.468L231.136 231.668L182.518 60.332L183.85 59H241.126L263.437 157.901C265.102 164.894 268.765 168.557 274.759 168.557C280.753 168.557 284.416 164.894 286.081 157.901L308.392 59H365.668L367 60.332L297.096 304.668L295.764 306H193.84Z" fill="currentColor"/>'
    + '</svg></div>'
    + '</a></div>';

  var ICON_CHEVRON_DOWN = '${esc(getRawIcon('chevron-down'))}';

  var headerRight = '<div class="site-header-right">'
    + '<a href="' + base + 'support.html" class="header-link header-contact-link" aria-label="Contact">'
    + '<div class="icn-svg" data-icon="mail">' + ICON_MAIL + '</div>'
    + '<span class="header-link-label">Contact</span>'
    + '</a>'
    + '<div class="auth-header-container"></div>'
    + '<div class="header-link dark-mode-toggle" role="button" tabindex="0" aria-label="Toggle dark mode">'
    + '<div class="icn-svg dark-mode-icon-light">' + ICON_SUN + '</div>'
    + '<div class="icn-svg dark-mode-icon-dark">' + ICON_MOON + '</div>'
    + '</div>'
    + '</div>';

  var headerHtml = '<header class="site-header">' + headerLeft + headerRight + '</header>';

  // ── Build sidebar HTML (if needed) ──
  var sidebarHtml = '';
  if (hasSidebar) {
    sidebarHtml = '<aside class="site-sidebar" role="navigation" aria-label="Site navigation">'
      + '<div class="site-sidebar-header">'
      + '<button class="site-sidebar-toggle" aria-label="Collapse sidebar" type="button">'
      + '<div class="icn-svg sidebar-icon-open">' + ICON_COLLAPSE + '</div>'
      + '<div class="icn-svg sidebar-icon-close">' + ICON_EXPAND + '</div>'
      + '</button>'
      + '</div>'
      + '<div class="site-sidebar-content">'
      + '<a href="' + base + 'index.html" class="nav-link nav-home" data-access="team">'
      + '<div class="icn-svg" data-icon="home">' + ICON_HOME + '</div>'
      + '<span>Home</span>'
      + '</a>'
      + \`${esc(navSectionsHtml)}\`
      + '</div>'
      + ''
      + '</aside>'
      + '<div class="site-sidebar-backdrop"></div>';
  }

  // ── Inject into page ──
  mount.innerHTML = headerHtml + sidebarHtml;

  // Fix relative paths in sidebar nav links
  if (base && hasSidebar) {
    var links = mount.querySelectorAll('.site-sidebar .nav-link, .site-sidebar .nav-section-icon');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#')) {
        links[i].setAttribute('href', base + href);
      }
    }
  }

  // ── Active link detection ──
  if (hasSidebar) {
    var navLinks = mount.querySelectorAll('.nav-link');

    // Normalize: treat /path/ and /path/index.html as equal
    function normPath(p) {
      return p.replace(/\\/index\\.html$/, '/').replace(/\\/$/, '');
    }
    var currentNorm = normPath(window.location.pathname);

    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];

      // Resolve the link href to an absolute path (handles ../ prefixes correctly)
      var resolvedPath = new URL(link.href, window.location.href).pathname;
      var resolvedNorm = normPath(resolvedPath);

      if (currentNorm === resolvedNorm) {
        link.classList.add('nav-link-active');
        link.setAttribute('aria-current', 'page');
        // Open parent details section
        var parentDetails = link.closest('.nav-section');
        if (parentDetails) {
          parentDetails.setAttribute('open', '');
        }
      }
    }
  }

  // ── Body class management ──
  if (!hasSidebar) {
    document.body.classList.add('no-sidebar');
  }

  // ── Sidebar collapse toggle (desktop) ──
  var SIDEBAR_KEY = 'docs-sidebar-collapsed';

  if (hasSidebar) {
    var sidebarToggle = mount.querySelector('.site-sidebar-toggle');

    // Restore saved state (respect page-level default when no user preference saved)
    var savedCollapsed = localStorage.getItem(SIDEBAR_KEY);
    var defaultCollapsed = mount.getAttribute('data-sidebar-default') === 'collapsed';
    if (savedCollapsed === 'true' || (savedCollapsed === null && defaultCollapsed)) {
      document.body.classList.add('sidebar-collapsed');
      if (sidebarToggle) sidebarToggle.setAttribute('aria-label', 'Expand sidebar');
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function() {
        var isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem(SIDEBAR_KEY, isCollapsed);
        this.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      });
    }
  }

  // ── Section icon links: stop propagation to prevent details toggle ──
  if (hasSidebar) {
    var iconLinks = mount.querySelectorAll('.nav-section-icon');
    for (var s = 0; s < iconLinks.length; s++) {
      iconLinks[s].addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }

  // ── Mobile hamburger toggle ──
  if (hasSidebar) {
    var hamburger = mount.querySelector('.site-header-hamburger');
    var backdrop = mount.querySelector('.site-sidebar-backdrop');

    function closeMobileNav() {
      document.body.classList.remove('mobile-nav-open');
      if (hamburger) hamburger.setAttribute('aria-label', 'Open navigation');
    }

    function openMobileNav() {
      document.body.classList.add('mobile-nav-open');
      if (hamburger) hamburger.setAttribute('aria-label', 'Close navigation');
    }

    if (hamburger) {
      hamburger.addEventListener('click', function() {
        if (document.body.classList.contains('mobile-nav-open')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileNav);
    }
  }

  // ── Dark mode toggle ──
  var DARK_KEY = 'dark-mode';
  var darkToggle = mount.querySelector('.dark-mode-toggle');

  // Apply saved preference or system default
  var savedDark = localStorage.getItem(DARK_KEY);
  if (savedDark === 'true' || (savedDark === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (darkToggle) {
    darkToggle.addEventListener('click', function toggleDarkMode() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      localStorage.setItem(DARK_KEY, !isDark);
    });
  }

  // Header dropdown toggles handled by dropdown.js

  // Signal that nav is ready
  document.body.classList.add('nav-ready');
})();
`;

  return script;
}

/**
 * Build nav sections HTML string for embedding in nav.js
 */
function buildNavSectionsHtml(filesBySection) {
  let html = '';

  // Section icons — loaded from assets/images/svg-icons/
  const sectionIconMap = {
    'Brand Book': { icon: getRawIcon('brand-book'), name: 'brand' },
    'Design System': { icon: getRawIcon('design-system'), name: 'design-system' },
    'Website': { icon: getRawIcon('browser'), name: 'website' },
    'Docs': { icon: getRawIcon('docs'), name: 'docs' },
    'Tools': { icon: getRawIcon('tools'), name: 'tools' },
    'Projects': { icon: getRawIcon('folder'), name: 'projects' },
  };

  // Read ordering from _defaults.md (configurable per directory)
  const defaults = loadDefaults(DOCS_DIR);
  const sectionOrder = parseList(defaults['section-order'], ['Brand Book', 'Design System', 'Tools', 'Docs']);
  const sortedSections = Object.keys(filesBySection)
    .sort((a, b) => {
      const indexA = sectionOrder.indexOf(a);
      const indexB = sectionOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

  for (const section of sortedSections) {
    const files = [...filesBySection[section]];
    const subsectionOrder = getSubsectionOrder(defaults, section);

    files.sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);

    const sectionIcon = sectionIconMap[section];
    const sectionFolder = SECTION_FOLDERS[section];
    const sectionIndexHref = sectionFolder ? sectionFolder + '/index.html' : '';
    const iconHtml = sectionIcon
      ? `<a href="${sectionIndexHref}" class="nav-section-icon"><div class="icn-svg" data-icon="${sectionIcon.name}">${sectionIcon.icon}</div></a>`
      : '';

    html += `<details class="nav-section">
      <summary class="nav-section-toggle">
        ${iconHtml}<span>${sectionLabel}</span>
        <span class="nav-toggle-icon">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M3.58943 3L1.28943 0.7L1.98943 0L4.98943 3L1.98943 6L1.28943 5.3L3.58943 3Z" fill="currentColor"/>
          </svg>
        </span>
      </summary>
      <ul class="nav-list">`;

    // Overview link (first item in every section)
    html += `<li><a href="${sectionIndexHref}" class="nav-link" data-access="team"><span>Overview</span></a></li>`;

    // Group files by subsection
    const ungrouped = files.filter(f => !f.frontmatter.subsection);
    const grouped = {};
    for (const file of files) {
      const sub = file.frontmatter.subsection;
      if (sub) {
        if (!grouped[sub]) grouped[sub] = [];
        grouped[sub].push(file);
      }
    }

    // Render ungrouped files first
    for (const file of ungrouped) {
      // For Tools section: link to actual tool app, use actionAccess for visibility
      let linkHref = file.htmlPath;
      let linkAccess = deriveDataAccess(file.frontmatter);
      const navActionUrl = file.frontmatter.actionUrl || file.frontmatter.toolUrl;
      if (section === 'Tools' && navActionUrl) {
        linkHref = navActionUrl.replace(/^\.\.\//, '');
        linkAccess = file.frontmatter.actionAccess || file.frontmatter.toolAccess || 'client';
      }
      html += `<li><a href="${linkHref}" class="nav-link" data-access="${linkAccess}"><span>${file.title}</span></a></li>`;
    }

    // Render subsections in order
    const subsections = Object.keys(grouped).sort((a, b) => {
      const idxA = subsectionOrder.indexOf(a);
      const idxB = subsectionOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    for (const sub of subsections) {
      html += `<li class="nav-label">${sub}</li>`;
      for (const file of grouped[sub]) {
        const linkAccess = deriveDataAccess(file.frontmatter);
        html += `<li><a href="${file.htmlPath}" class="nav-link" data-access="${linkAccess}"><span>${file.title}</span></a></li>`;
      }
    }

    // Add Tools documentation links as a subsection of Docs
    if (section === 'Docs' && filesBySection['Tools']) {
      const toolFiles = [...filesBySection['Tools']].sort((a, b) => {
        const orderA = a.frontmatter.order || 999;
        const orderB = b.frontmatter.order || 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
      html += `<li class="nav-label">Tools</li>`;
      for (const file of toolFiles) {
        const linkAccess = deriveDataAccess(file.frontmatter);
        html += `<li><a href="${file.htmlPath}" class="nav-link" data-access="${linkAccess}"><span>${file.title}</span></a></li>`;
      }
    }

    html += `</ul></details>`;
  }

  return html;
}

/**
 * Recursively copy a directory and all its contents.
 */
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src);
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy client assets from cms/clients/{clientKey}/assets/ to {OUTPUT_DIR}/{clientKey}/assets/.
 * Recursively copies all subdirectories (logos/, fonts/, etc.).
 * Runs before page generation so CSS, logos, and fonts are available.
 */
function copyClientAssets(clientKey) {
  const srcDir = path.join(DOCS_DIR, 'clients', clientKey, 'assets');
  if (!fs.existsSync(srcDir)) return;
  copyDirRecursive(srcDir, path.join(OUTPUT_DIR, clientKey, 'assets'));
}

/**
 * Generate client doc pages from markdown files in cms/clients/{clientFolder}/
 *
 * Frontmatter fields:
 *   title    — page title (required)
 *   section  — sidebar section label (optional, pages without one become top-level)
 *   order    — sort order within section (optional, default 99)
 *
 * Output: {clientFolder}/{sectionSlug}/{filename}.html
 * Returns: map of clientKey → array of { title, href, section? } for theme-config update
 */
function generateClientDocs(template) {
  const clientsDir = path.join(DOCS_DIR, 'clients');
  if (!fs.existsSync(clientsDir)) return {};

  // Load theme-config to know which clients exist
  const themeConfigPath = path.join(OUTPUT_DIR, 'assets', 'js', 'theme-config.js');
  if (!fs.existsSync(themeConfigPath)) return {};
  const configCode = fs.readFileSync(themeConfigPath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(configCode, sandbox);
  const themeConfig = sandbox.THEME_CONFIG;
  if (!themeConfig || !themeConfig.themes) return {};

  const generatedPages = {};

  const clientDirs = fs.readdirSync(clientsDir).filter(dir => {
    return fs.statSync(path.join(clientsDir, dir)).isDirectory() && themeConfig.themes[dir];
  });

  for (const clientKey of clientDirs) {
    // Copy client assets (theme CSS, logos) to output
    copyClientAssets(clientKey);

    const clientDocsPath = path.join(clientsDir, clientKey);
    const mdFiles = fs.readdirSync(clientDocsPath)
      .filter(f => f.endsWith('.md') && !f.startsWith('README') && !f.startsWith('_'));

    if (mdFiles.length === 0) continue;

    const theme = themeConfig.themes[clientKey];
    const pages = [];
    const clientFiles = [];

    // Load folder defaults for this client directory
    const clientDefaults = loadDefaults(clientDocsPath);

    for (const filename of mdFiles) {
      const filePath = path.join(clientDocsPath, filename);
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = parseFrontmatter(raw);
      // Merge folder defaults — page frontmatter wins
      const frontmatter = { ...clientDefaults, ...parsed.frontmatter };
      const content = parsed.content;

      // Skip draft pages
      if (frontmatter.status === 'draft') {
        console.log(`⏭️  Skipped (draft): ${clientKey}/${filename}`);
        continue;
      }

      const title = frontmatter.title || filename.replace('.md', '');
      const htmlName = filename.replace('.md', '.html');
      let htmlContent = markdownToHtml(content);

      // Apply drop cap to first paragraph if enabled in frontmatter
      if (frontmatter.dropcap === 'true') {
        htmlContent = htmlContent.replace(/<p>/, '<p class="drop-cap">');
      }

      const tableOfContents = generateTableOfContents(htmlContent);
      const order = parseInt(frontmatter.order, 10) || 99;

      // Derive section subfolder for nested client output
      const sectionSlug = frontmatter.section ? frontmatter.section.toLowerCase().replace(/\s+/g, '-') : '';
      const navBase = sectionSlug ? '../../' : '../';

      // Full-width page header (lives outside the content grid)
      let pageHeader = '';
      const clientActionUrl = frontmatter.actionUrl || frontmatter.toolUrl;
      const clientActionLabel = frontmatter.actionLabel || frontmatter.toolLabel || 'Open';
      const clientActionHtml = clientActionUrl
        ? `<div class="button-group justify-center">
            <a href="${clientActionUrl}" class="button is-small page-action-link">${clientActionLabel}</a>
          </div>`
        : '';
      if (title) {
        pageHeader = `<div class="page-header">
          <div class="container-small">
            <h1>${title}</h1>
            ${frontmatter.subtitle ? `<p class="page-subtitle" data-text-wrap="pretty">${frontmatter.subtitle}</p>` : ''}
            ${clientActionHtml}
          </div>
        </div>`;
      }

      // Build sticky sub-header bar (breadcrumb + markdown dropdown)
      let pageSubbar = '';
      if (title && frontmatter.section) {
        const sectionLabel = frontmatter.section;
        const overviewHref = 'index.html';
        const mdPath = `${navBase}cms/clients/${clientKey}/${filename}`;
        pageSubbar = `<div class="sticky-bar sticky-bar-page">
          <div class="sticky-bar-container">
            <div class="sticky-bar-content">
              <nav class="sticky-bar-breadcrumbs" aria-label="Breadcrumb">
                <a href="${overviewHref}">${sectionLabel}</a>
                <span class="breadcrumb-separator">/</span>
                <span>${title}</span>
              </nav>
            </div>
            <div class="sticky-bar-actions">
              <div class="dropdown">
                <button class="dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Markdown source options">
                  ${getIcon('more-horizontal')}
                </button>
                <div class="dropdown-menu is-right">
                  <button type="button" class="dropdown-item js-copy-url" aria-label="Copy page link to clipboard">
                    ${getIcon('link')}
                    <span>Copy link</span>
                  </button>
                  <div data-auth-role="team">
                    <div class="dropdown-divider"></div>
                    <a href="${mdPath}" class="dropdown-item js-md-download" download>
                      ${getIcon('download')}
                      <span>Download .md file</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="${mdPath}" class="dropdown-item js-md-open" target="_blank" rel="noopener noreferrer">
                      ${getIcon('open-full')}
                      <span>Open .md in new tab</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      }

      // Build client-specific template
      const brandCss = PROJECT_CONFIG.brandCssPath
        ? `<link rel="stylesheet" href="${navBase}${PROJECT_CONFIG.brandCssPath}">`
        : '';
      const clientThemeCss = `<!-- Client Theme Override (must load last to override base styles) -->\n    <link rel="stylesheet" href="${sectionSlug ? '../' : ''}assets/theme.css">`;
      const googleFonts = theme.fonts
        ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${theme.fonts}" rel="stylesheet">`
        : GOOGLE_FONTS_HTML;

      let html = template
        .replaceAll('{{PAGE_TITLE}}', `${theme.label} — ${title}`)
        .replaceAll('{{META_DESCRIPTION}}', frontmatter.description || '')
        .replace('{{PAGE_HEADER}}', pageHeader)
        .replace('{{PAGE_STICKY_BAR}}', pageSubbar)
        .replace('{{PAGE_CONTENT}}', htmlContent)
        .replace('{{TOC_SECTION}}', tableOfContents
          ? `<aside class="docs-toc"><span class="toc-header">On this page</span><div class="toc-wrapper">${tableOfContents}</div></aside>`
          : '')
        .replace('{{DESIGN_SYSTEM_PATH}}', navBase + PROJECT_CONFIG.designSystemPath)
        .replace('{{BRAND_CSS}}', brandCss)
        .replace('{{CLIENT_THEME_CSS}}', clientThemeCss)
        .replace('{{CLIENT_THEME_ATTR}}', `data-client-theme="${clientKey}"`)
        .replace('{{GOOGLE_FONTS}}', googleFonts)
        .replace('{{PAGE_SCRIPTS}}', buildPageScripts(frontmatter.section || '', frontmatter))
        .replace('{{FOOTER_TEXT}}', buildFooterHtml())
        .replace('{{PAGE_ACCESS}}', deriveDataAccess(frontmatter))
        .replaceAll('{{NAV_BASE}}', navBase);

      // Derive output path
      const dir = sectionSlug
        ? path.join(OUTPUT_DIR, clientKey, sectionSlug)
        : path.join(OUTPUT_DIR, clientKey);
      const outputRelPath = sectionSlug ? `${clientKey}/${sectionSlug}/${htmlName}` : `${clientKey}/${htmlName}`;
      const htmlFolder = sectionSlug ? `${clientKey}/${sectionSlug}` : clientKey;

      // Collect for two-pass rendering (nav needs full page order)
      clientFiles.push({
        filename,
        title,
        section: frontmatter.section || '',
        htmlFolder,
        htmlName,
        htmlPath: outputRelPath,
        subtitle: frontmatter.subtitle || '',
        order,
        html,
        dir
      });
    }

    // Sort by order for prev/next navigation
    clientFiles.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });

    // Pass 2: Inject prev/next nav and write files
    for (const file of clientFiles) {
      const pageNav = generatePageNav(file, clientFiles);
      const finalHtml = file.html.replace('{{PAGE_NAV}}', pageNav);

      fs.mkdirSync(file.dir, { recursive: true });
      fs.writeFileSync(path.join(file.dir, file.htmlName), finalHtml);
      console.log(`📄 Generated: ${file.htmlPath}`);

      pages.push({
        title: file.title,
        subtitle: file.subtitle,
        href: file.htmlPath,
        section: file.section || null,
        order: file.order
      });
    }

    // Sort pages for theme-config
    pages.sort((a, b) => a.order - b.order);
    generatedPages[clientKey] = pages.map(({ title, subtitle, href, section }) => {
      const entry = { title, href };
      if (subtitle) entry.subtitle = subtitle;
      if (section) entry.section = section;
      return entry;
    });
  }

  return generatedPages;
}

/**
 * Update theme-config.js pages arrays with generated client doc pages.
 * Preserves manually-defined pages (index.html) and merges generated ones.
 */
function updateThemeConfigPages(generatedPages) {
  if (Object.keys(generatedPages).length === 0) return;

  const themeConfigPath = path.join(OUTPUT_DIR, 'assets', 'js', 'theme-config.js');
  let configSource = fs.readFileSync(themeConfigPath, 'utf8');

  for (const [clientKey, newPages] of Object.entries(generatedPages)) {
    // Find the pages array for this client in the source
    // Match: pages: [ ... ] within the client block
    const clientPattern = new RegExp(
      `('${clientKey}':\\s*\\{[\\s\\S]*?)(pages:\\s*\\[)([\\s\\S]*?)(\\])(\\s*\\n\\s*\\})`,
    );
    const match = configSource.match(clientPattern);
    if (!match) {
      console.warn(`⚠️  Could not find pages array for client '${clientKey}' in theme-config.js`);
      continue;
    }

    // Keep manually-defined pages (like index.html) from the existing array.
    // Any stale entry pointing into <client>/docs/ that isn't in newPages
    // (and isn't the docs/index overview) gets dropped — prevents leftover
    // entries from renamed/deleted markdown files lingering in theme-config.
    const existingPagesStr = match[3];
    const manualPages = [];
    const pageRegex = /\{[^}]*href:\s*'([^']+)'[^}]*\}/g;
    const docsPrefix = `${clientKey}/docs/`;
    const docsIndexHref = `${docsPrefix}index.html`;
    let pageMatch;
    while ((pageMatch = pageRegex.exec(existingPagesStr)) !== null) {
      const href = pageMatch[1];
      const isGenerated = newPages.some(p => p.href === href);
      if (isGenerated) continue; // re-added below from newPages
      const isStaleDocsEntry = href.startsWith(docsPrefix) && href !== docsIndexHref;
      if (isStaleDocsEntry) continue; // drop stale generated-doc references
      manualPages.push(pageMatch[0]);
    }

    // Build new pages entries
    const generatedEntries = newPages.map(p => {
      let entry = `{ title: '${p.title}', href: '${p.href}'`;
      if (p.subtitle) entry += `, subtitle: '${p.subtitle.replace(/'/g, "\\'")}'`;
      if (p.section) entry += `, section: '${p.section}'`;
      entry += ' }';
      return entry;
    });

    const allEntries = [...manualPages, ...generatedEntries];
    const newPagesArray = 'pages: [\n        ' + allEntries.join(',\n        ') + '\n      ]';

    configSource = configSource.replace(
      match[1] + match[2] + match[3] + match[4] + match[5],
      match[1] + newPagesArray + match[5]
    );
  }

  fs.writeFileSync(themeConfigPath, configSource);
  console.log('📄 Updated: assets/js/theme-config.js');
}

/**
 * Build tool registry from markdown frontmatter (single source of truth).
 * Returns an object keyed by tool slug with { title, subtitle, toolAccess, actionUrl }.
 */
function buildToolRegistryFromFrontmatter() {
  const toolFiles = fs.readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('README'));
  const tools = {};
  for (const filename of toolFiles) {
    const raw = fs.readFileSync(path.join(DOCS_DIR, filename), 'utf8');
    const { frontmatter } = parseFrontmatter(raw);
    const toolActionUrl = frontmatter.actionUrl || frontmatter.toolUrl;
    if (frontmatter.section === 'Tools' && toolActionUrl) {
      // Derive tool slug from actionUrl (e.g. "./cpm-calculator.html" → "cpm-calculator")
      const slug = path.basename(toolActionUrl, '.html');
      tools[slug] = {
        title: frontmatter.title || slug,
        subtitle: frontmatter.subtitle || '',
        toolAccess: frontmatter.actionAccess || frontmatter.toolAccess || 'client',
        actionUrl: toolActionUrl
      };
    }
  }
  return tools;
}

/**
 * Check if a client has access to a tool based on its toolAccess frontmatter value.
 */
function clientHasToolAccess(toolAccess, clientKey) {
  if (!toolAccess) return false;
  // "public" or "client" (any client) → grant
  if (toolAccess === 'public' || toolAccess === 'client') return true;
  // "team" or "admin" → clients don't get access
  if (toolAccess === 'team' || toolAccess === 'admin') return false;
  // "client:dianomi,acme" → check if clientKey is in the list
  if (toolAccess.startsWith('client:')) {
    const allowed = toolAccess.substring(7).split(',').map(s => s.trim());
    return allowed.includes(clientKey);
  }
  return false;
}

/**
 * Generate section overview pages for each client (docs-overview, tools-overview).
 * Also updates theme-config.js pages arrays with the overview entries.
 */
function generateClientSectionOverviews(template) {
  const themeConfigPath = path.join(OUTPUT_DIR, 'assets', 'js', 'theme-config.js');
  if (!fs.existsSync(themeConfigPath)) return;

  const configCode = fs.readFileSync(themeConfigPath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(configCode, sandbox);
  const themeConfig = sandbox.THEME_CONFIG;
  if (!themeConfig || !themeConfig.themes) return;

  const toolRegistry = buildToolRegistryFromFrontmatter();

  for (const [clientKey, theme] of Object.entries(themeConfig.themes)) {
    const clientLabel = theme.label || clientKey;
    const navBase = '../';
    const brandCss = PROJECT_CONFIG.brandCssPath
      ? `<link rel="stylesheet" href="${navBase}${PROJECT_CONFIG.brandCssPath}">`
      : '';
    const clientThemeCss = `<!-- Client Theme Override (must load last to override base styles) -->\n    <link rel="stylesheet" href="assets/theme.css">`;
    const googleFonts = theme.fonts
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${theme.fonts}" rel="stylesheet">`
      : GOOGLE_FONTS_HTML;

    const dir = path.join(OUTPUT_DIR, clientKey);
    fs.mkdirSync(dir, { recursive: true });

    // Helper to build a client overview page
    function buildOverviewPage(title, cardsHtml, overrideNavBase) {
      const base = overrideNavBase || navBase;
      const content = `<div class="docs-hero"><h1 class="docs-hero-title">${title}</h1></div>${cardsHtml}`;
      return template
        .replace(/\{\{PAGE_TITLE\}\}/g, `${clientLabel} — ${title}`)
        .replace(/\{\{META_DESCRIPTION\}\}/g, `${title} overview for ${clientLabel}.`)
        .replace(/\{\{NAV_BASE\}\}/g, base)
        .replace(/\{\{PAGE_ACCESS\}\}/g, deriveDataAccess(loadDefaults(path.join(DOCS_DIR, 'clients', clientKey))))
        .replace('{{PAGE_HEADER}}', '')
        .replace('{{PAGE_STICKY_BAR}}', '')
        .replace('{{PAGE_CONTENT}}', content)
        .replace('{{TOC_SECTION}}', '')
        .replace('{{PAGE_NAV}}', '')
        .replace('{{FOOTER_TEXT}}', buildFooterHtml())
        .replace('{{DESIGN_SYSTEM_PATH}}', base + PROJECT_CONFIG.designSystemPath)
        .replace('{{BRAND_CSS}}', PROJECT_CONFIG.brandCssPath ? `<link rel="stylesheet" href="${base}${PROJECT_CONFIG.brandCssPath}">` : '')
        .replace('{{CLIENT_THEME_CSS}}', `<!-- Client Theme Override (must load last to override base styles) -->\n    <link rel="stylesheet" href="${base === '../../' ? '../' : ''}assets/theme.css">`)
        .replace('{{CLIENT_THEME_ATTR}}', `data-client-theme="${clientKey}"`)
        .replace('{{GOOGLE_FONTS}}', googleFonts);
    }

    // Docs overview — cards for all pages in the Docs section
    const docsPages = (theme.pages || []).filter(p => p.section === 'Docs' && p.title !== 'Overview');
    if (docsPages.length > 0) {
      let cards = '<div class="docs-section"><div class="grid cols-2 gap-xl">';
      for (const page of docsPages) {
        // Extract just the filename — overview and pages are in the same directory
        const href = page.href.split('/').pop();
        cards += renderBookCover({
          href,
          title: page.title,
          subtitle: page.subtitle,
          author: page.author,
        });
      }
      cards += '</div></div>';
      const docsDir = path.join(dir, 'docs');
      fs.mkdirSync(docsDir, { recursive: true });
      fs.writeFileSync(path.join(docsDir, 'index.html'), buildOverviewPage('Docs', cards, '../../'));
      console.log(`📄 Generated: ${clientKey}/docs/index.html`);
    }

    // Tools overview — cards for tools this client has access to (from frontmatter)
    const clientToolKeys = Object.keys(toolRegistry).filter(slug => clientHasToolAccess(toolRegistry[slug].toolAccess, clientKey));
    if (clientToolKeys.length > 0) {
      let cards = '<div class="docs-section"><div class="grid cols-2 gap-xl">';
      for (const toolKey of clientToolKeys) {
        const tool = toolRegistry[toolKey];
        cards += renderBookCover({
          href: `../../tools/${toolKey}.html`,
          title: tool.title,
          subtitle: tool.subtitle,
          author: tool.author,
        });
      }
      cards += '</div></div>';
      const toolsDir = path.join(dir, 'tools');
      fs.mkdirSync(toolsDir, { recursive: true });
      fs.writeFileSync(path.join(toolsDir, 'index.html'), buildOverviewPage('Tools', cards, '../../'));
      console.log(`📄 Generated: ${clientKey}/tools/index.html`);
    }
  }

  // Update theme-config.js with overview page entries
  let configSource = fs.readFileSync(themeConfigPath, 'utf8');
  for (const [clientKey, theme] of Object.entries(themeConfig.themes)) {
    const docsPages = (theme.pages || []).filter(p => p.section === 'Docs');
    const hasDocsOverview = docsPages.length > 0;
    const clientToolKeys = Object.keys(toolRegistry).filter(slug => clientHasToolAccess(toolRegistry[slug].toolAccess, clientKey));
    const hasToolsOverview = clientToolKeys.length > 0;

    // Check if overview entries already exist
    const alreadyHasDocsOverview = (theme.pages || []).some(p => p.href.includes('/docs/index.html') || p.href.endsWith('docs-overview.html'));
    const alreadyHasToolsOverview = (theme.pages || []).some(p => p.href.includes('/tools/index.html') || p.href.endsWith('tools-overview.html'));

    const newEntries = [];
    if (hasDocsOverview && !alreadyHasDocsOverview) {
      newEntries.push(`{ title: 'Overview', href: '${clientKey}/docs/index.html', section: 'Docs' }`);
    }
    if (hasToolsOverview && !alreadyHasToolsOverview) {
      newEntries.push(`{ title: 'Overview', href: '${clientKey}/tools/index.html', section: 'Tools' }`);
    }
    // Add individual tool pages to the pages array (for sidebar nav)
    for (const slug of clientToolKeys) {
      const tool = toolRegistry[slug];
      const alreadyHasTool = (theme.pages || []).some(p => p.href.includes(`tools/${slug}`));
      if (!alreadyHasTool) {
        newEntries.push(`{ title: '${tool.title}', href: 'tools/${slug}.html', section: 'Tools' }`);
      }
    }

    if (newEntries.length > 0) {
      // Insert overview entries before the first Docs/Tools page
      const pagesPattern = new RegExp(
        `('${clientKey}':\\s*\\{[\\s\\S]*?pages:\\s*\\[)([\\s\\S]*?)(\\]\\s*\\n\\s*\\})`
      );
      const match = configSource.match(pagesPattern);
      if (match) {
        const newPagesStr = match[2].trimEnd() + ',\n        ' + newEntries.join(',\n        ');
        configSource = configSource.replace(
          match[1] + match[2] + match[3],
          match[1] + newPagesStr + '\n      ' + match[3]
        );
      }
    }
  }
  fs.writeFileSync(themeConfigPath, configSource);
}

/**
 * Generate brand-book.html for each client.
 *
 * Scans cms/clients/{clientKey}/assets/logos/ for .svg files and builds a
 * logo gallery page with light + dark previews, copy-SVG and download buttons.
 * An optional cms/clients/{clientKey}/brand-book.md provides custom intro
 * content and frontmatter overrides (title, subtitle, description, access).
 */
function generateBrandBook(template) {
  const clientsDir = path.join(DOCS_DIR, 'clients');
  if (!fs.existsSync(clientsDir)) return;

  const themeConfigPath = path.join(OUTPUT_DIR, 'assets', 'js', 'theme-config.js');
  if (!fs.existsSync(themeConfigPath)) return;
  const configCode = fs.readFileSync(themeConfigPath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(configCode, sandbox);
  const themeConfig = sandbox.THEME_CONFIG;
  if (!themeConfig || !themeConfig.themes) return;

  const clientDirs = fs.readdirSync(clientsDir).filter(dir => {
    return fs.statSync(path.join(clientsDir, dir)).isDirectory() && themeConfig.themes[dir];
  });

  for (const clientKey of clientDirs) {
    const theme = themeConfig.themes[clientKey];
    const clientLabel = theme.label || clientKey;

    // Scan for logo SVG files
    const logosDir = path.join(clientsDir, clientKey, 'assets', 'logos');
    if (!fs.existsSync(logosDir)) {
      console.log(`⚠️  No logos/ folder for client '${clientKey}', skipping brand book`);
      continue;
    }

    const svgFiles = fs.readdirSync(logosDir).filter(f => f.endsWith('.svg'));
    if (svgFiles.length === 0) {
      console.log(`⚠️  No SVG files in logos/ for client '${clientKey}', skipping brand book`);
      continue;
    }

    // Load optional brand-book.md for intro content and frontmatter
    const brandBookMdPath = path.join(clientsDir, clientKey, 'brand-book.md');
    let frontmatter = {};
    let introHtml = '';

    if (fs.existsSync(brandBookMdPath)) {
      const raw = fs.readFileSync(brandBookMdPath, 'utf8');
      const parsed = parseFrontmatter(raw);
      // Merge folder defaults — brand-book frontmatter wins
      const clientDefaults = loadDefaults(path.join(clientsDir, clientKey));
      frontmatter = { ...clientDefaults, ...parsed.frontmatter };
      if (parsed.content) {
        introHtml = markdownToHtml(parsed.content);
      }
    } else {
      // Fall back to folder defaults only
      frontmatter = loadDefaults(path.join(clientsDir, clientKey));
    }

    const pageTitle = frontmatter.title || 'Brand Book';
    const pageSubtitle = frontmatter.subtitle || 'Logo, colour, typography, and interface elements styled with your brand tokens';
    const pageDescription = frontmatter.description || `${clientLabel} brand book.`;

    // Build the full-width page header (slots into PAGE_HEADER, outside the content grid)
    const brandBookPageHeader = `<div class="page-header">
      <div class="container-small">
        <p class="eyebrow">${clientLabel}</p>
        <h1>${pageTitle}</h1>
        <p class="page-subtitle" data-text-wrap="pretty">${pageSubtitle}</p>
      </div>
    </div>`;

    // Build page content
    let contentHtml = '';

    // Custom intro from brand-book.md
    if (introHtml) {
      contentHtml += `<div class="block gap-l">${introHtml}</div>`;
    }

    // ─────────────────────────────────────────────────────────
    // PART 1 — PRIMITIVES
    // The raw building blocks: logos, colours, fonts.
    // Compact, scannable, copy-friendly. No editorial content.
    // ─────────────────────────────────────────────────────────

    // ─── LOGOS ───────────────────────────────────────────────
    // Logos follow the convention: logo_brand-{type}-{light|dark}.svg
    // Group by type, sort by canonical order, render light + dark side by side.
    const logoTypeOrder = ['primary', 'wordmark', 'avatar', 'horizontal'];
    const logoTypeTitles = {
      'primary': 'Primary Logo',
      'wordmark': 'Wordmark',
      'avatar': 'Avatar Logo',
      'horizontal': 'Horizontal Logo',
    };

    // Parse files: extract base type + variant
    // e.g. "logo_brand-wordmark-light.svg" → { type: 'wordmark', variant: 'light', file: '...' }
    const logoEntries = svgFiles
      .map(f => {
        const m = f.match(/^logo_brand-(.+?)-(light|dark)\.svg$/i);
        if (!m) return null;
        return { type: m[1], variant: m[2], file: f };
      })
      .filter(Boolean);

    // Group by type
    const logoGroups = {};
    for (const entry of logoEntries) {
      if (!logoGroups[entry.type]) logoGroups[entry.type] = {};
      logoGroups[entry.type][entry.variant] = entry.file;
    }

    // Sort group keys by canonical order
    const sortedGroupKeys = Object.keys(logoGroups).sort((a, b) => {
      const aIdx = logoTypeOrder.indexOf(a);
      const bIdx = logoTypeOrder.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });

    // Render the logos section only if we have at least one matching file
    if (sortedGroupKeys.length > 0) {
      contentHtml += `<section class="brand-book-section block gap-2xl">
        <h2>Logos</h2>`;

      for (const typeKey of sortedGroupKeys) {
        const group = logoGroups[typeKey];
        const title = logoTypeTitles[typeKey] || (typeKey.charAt(0).toUpperCase() + typeKey.slice(1) + ' Logo');

        contentHtml += `<div class="block gap-m">
          <h3 style="margin: 0;">${title}</h3>
          <div class="grid cols-2 gap-l">`;

        // Render light then dark variants if they exist
        for (const variant of ['light', 'dark']) {
          const file = group[variant];
          if (!file) continue;

          let svgContent = fs.readFileSync(path.join(logosDir, file), 'utf8')
            .replace(/\n\s*/g, '')
            .trim();

          // Escape for data-copy attribute
          const svgEscapedAttr = svgContent
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          const previewClass = variant === 'dark' ? 'asset-card-preview--dark' : 'asset-card-preview--light';
          const downloadHref = `assets/logos/${file}`;
          const variantLabel = variant.charAt(0).toUpperCase() + variant.slice(1);

          contentHtml += `<div class="asset-card">
            <div class="asset-card-preview ${previewClass}">
              <div class="svg-logo" data-icon="${typeKey}-${variant}" style="max-width: 240px; max-height: 120px;">${svgContent}</div>
            </div>
            <div class="asset-card-footer">
              <p class="asset-card-title">${variantLabel}</p>
              <div class="asset-card-actions">
                <button class="button is-small copy-btn is-icon-only" type="button" data-copy="${svgEscapedAttr}" data-tooltip="Copy SVG" aria-label="Copy SVG">
                  <span class="copy-btn-default">${getIcon('copy')}</span>
                  <span class="copy-btn-copied">${getIcon('check')}</span>
                </button>
                <a class="button is-small" href="${downloadHref}" download="${file}" data-tooltip="Download" aria-label="Download SVG">
                  ${getIcon('download')}
                </a>
              </div>
            </div>
          </div>`;
        }

        contentHtml += `</div>
        </div>`;
      }

      contentHtml += `</section>`;
    }

    // ─── COLOURS ─────────────────────────────────────────────
    // Read brand primitives from this client's theme.css.
    // If none defined, fall back to the project semantic palette tokens.
    const themeCssPath = path.join(clientsDir, clientKey, 'assets', 'theme.css');
    let brandColorTokens = [];
    if (fs.existsSync(themeCssPath)) {
      const themeCssRaw = fs.readFileSync(themeCssPath, 'utf8');
      const brandTokenRegex = /^\s*(--brand-[a-z0-9-]+)\s*:\s*([^;]+);/gm;
      let m;
      while ((m = brandTokenRegex.exec(themeCssRaw)) !== null) {
        brandColorTokens.push({ token: m[1] });
      }
    }

    // Fallback: use semantic tokens if no brand primitives are defined
    if (brandColorTokens.length === 0) {
      brandColorTokens = [
        { token: '--background-primary' },
        { token: '--background-secondary' },
        { token: '--text-primary' },
        { token: '--text-secondary' },
        { token: '--button-primary' },
        { token: '--button-secondary' },
        { token: '--text-accent' },
        { token: '--border-secondary' },
      ];
    }

    // Split into two columns
    const half = Math.ceil(brandColorTokens.length / 2);
    const colorColLeft = brandColorTokens.slice(0, half);
    const colorColRight = brandColorTokens.slice(half);

    // Click the row → copies the var(--token) reference. Hover reveals the
    // ::after copy icon defined in style.css. Check icon swap on .is-copied.
    const renderColorRow = (c) => `<button class="color-row copy-btn" type="button" style="background-color: var(${c.token});" data-copy="var(${c.token})" aria-label="Copy var(${c.token})">
      <span class="color-row-name">var(${c.token})</span>
    </button>`;

    contentHtml += `<section class="brand-book-section block gap-l">
      <h2>Colours</h2>
      <div class="grid cols-2 gap-l">
        <div class="color-list border border-faded">${colorColLeft.map(renderColorRow).join('')}</div>
        <div class="color-list border border-faded">${colorColRight.map(renderColorRow).join('')}</div>
      </div>
    </section>`;

    // ─── BACKGROUNDS ─────────────────────────────────────────
    // Solid colour background tokens — useful for hero blocks, callouts,
    // ad units, marketing surfaces. Each maps to a brand primitive (or
    // falls back to the design system default).
    const backgroundTokens = [
      { token: '--background-accent' },
      { token: '--background-black'  },
      { token: '--background-white'  },
      { token: '--background-blue'   },
      { token: '--background-red'    },
      { token: '--background-green'  },
    ];

    const bgHalf = Math.ceil(backgroundTokens.length / 2);
    const bgColLeft = backgroundTokens.slice(0, bgHalf);
    const bgColRight = backgroundTokens.slice(bgHalf);

    contentHtml += `<section class="brand-book-section block gap-l">
      <h2>Backgrounds</h2>
      <div class="grid cols-2 gap-l">
        <div class="color-list border border-faded">${bgColLeft.map(renderColorRow).join('')}</div>
        <div class="color-list border border-faded">${bgColRight.map(renderColorRow).join('')}</div>
      </div>
    </section>`;

    // ─── FONTS ───────────────────────────────────────────────
    // Show every distinct brand font as a specimen card.
    // Dedupe by family value — if --font-primary and --font-secondary share the
    // same value, only one card is rendered.
    const fontTokenSpecs = [
      { token: '--font-primary',    fallback: 'Primary' },
      { token: '--font-secondary',  fallback: 'Secondary' },
      { token: '--font-tertiary',   fallback: 'Tertiary' },
      { token: '--font-quaternary', fallback: 'Quaternary' },
    ];

    let fontTokens = [];
    if (fs.existsSync(themeCssPath)) {
      const themeCssRaw = fs.readFileSync(themeCssPath, 'utf8');
      // Build a map of token → first family name from theme.css
      const themeFontMap = {};
      const fontTokenRegex = /^\s*(--font-(?:primary|secondary|tertiary|quaternary))\s*:\s*([^;]+);/gm;
      let m;
      while ((m = fontTokenRegex.exec(themeCssRaw)) !== null) {
        if (themeFontMap[m[1]]) continue; // first definition wins
        themeFontMap[m[1]] = m[2].split(',')[0].trim().replace(/^["']|["']$/g, '');
      }

      // Walk in canonical order, dedupe by family value
      const seenFamilies = new Set();
      for (const spec of fontTokenSpecs) {
        const family = themeFontMap[spec.token];
        if (!family || seenFamilies.has(family)) continue;
        seenFamilies.add(family);
        fontTokens.push({ token: spec.token, family });
      }
    }
    if (fontTokens.length === 0) {
      fontTokens = [
        { token: '--font-primary',   family: 'Primary' },
        { token: '--font-secondary', family: 'Secondary' },
        { token: '--font-tertiary',  family: 'Tertiary' },
      ];
    }

    contentHtml += `<section class="brand-book-section block gap-l">
      <h2>Fonts</h2>
      <div class="grid cols-${Math.min(fontTokens.length, 3)} gap-l">`;
    for (const f of fontTokens) {
      contentHtml += `<div class="asset-card">
        <div class="asset-card-preview asset-card-preview--light" style="text-align: center;">
          <div style="font-family: var(${f.token});">
            <p style="font-size: var(--font-9xl); margin: 0; line-height: 1;">Aa</p>
            <p style="font-size: var(--font-s); margin: var(--space-l) 0 0; line-height: 1.5;">ABCDEFGHIJKLM<br>abcdefghijklm<br>0123456789</p>
          </div>
        </div>
        <div class="asset-card-footer">
          <p class="asset-card-title">${f.family}</p>
        </div>
      </div>`;
    }
    contentHtml += `</div>
    </section>`;

    // ─────────────────────────────────────────────────────────
    // PART 2 — IN USE
    // The brand applied across real scenarios — an article, a callout,
    // a card grid, and a contact form. Each scenario stitches multiple
    // elements together so the brand can be seen in context.
    // ─────────────────────────────────────────────────────────

    // ─── SCENARIO 1: Article ─────────────────────────────────
    // Demonstrates: H1, H2, H3, eyebrow, lead paragraph, body, inline styling,
    // internal + external links, unordered + ordered lists, blockquote, small print.
    // Sits on the page, not in a bordered box.
    contentHtml += `<section class="brand-book-section block gap-l">
      <article class="block gap-l">
        <header class="block gap-m">
          <p class="eyebrow" style="margin: 0;">Field notes</p>
          <h1 style="margin: 0;">Your Primary Headline, Big, Bold, and Unmissable</h1>
          <p class="text-size-xlarge" style="margin: 0;">This lead paragraph demonstrates how introductory body text will look across your layout — used to set the tone for the body that follows and draw the reader in.</p>
        </header>

        <p>This paragraph demonstrates how body text will look across your layout. <strong>Bold text</strong> adds emphasis, while <em>italics</em> offer a subtle highlight. You can also use <s>strikethrough</s> to show edits, or <code>inline code</code> for technical terms. For further information, check out <a href="#">this internal link</a>, or visit our <a href="https://example.com" target="_blank" rel="noopener noreferrer">external site</a>.</p>

        <h2>Type with Purpose, Design with Intent</h2>

        <p>This extended paragraph serves to demonstrate how substantial blocks of body text will behave across your layout, giving you a realistic sense of how readers will experience longer-form content. <strong>Strategic use of bold text</strong> helps break up visual monotony, while <em>italicised phrases introduce subtle emphasis</em>. As you work through multiple lines, you'll notice how spacing, line height, and text density all contribute to overall readability.</p>

        <h3>What good typography does</h3>

        <ul>
          <li>Establishes a clear visual hierarchy</li>
          <li>Improves readability over long passages</li>
          <li>Carries the brand voice consistently
            <ul>
              <li>Across digital and print</li>
              <li>Across light and dark surfaces</li>
            </ul>
          </li>
          <li>Communicates without shouting</li>
        </ul>

        <h3>How we use it</h3>

        <ol>
          <li>Discovery and brief</li>
          <li>Strategy and positioning</li>
          <li>Design and prototyping
            <ol>
              <li>Visual exploration</li>
              <li>Refinement</li>
            </ol>
          </li>
          <li>Build and handover</li>
        </ol>

        <blockquote><p>Words matter, but how those words are presented matters just as much. Typography transforms content from mundane to magical, from ordinary to extraordinary.</p></blockquote>

        <p class="text-size-small">Terms and conditions apply. Prices are subject to change without notice. See site for complete details.</p>
      </article>
    </section>`;

    // ─── SCENARIO 2: Card grid ───────────────────────────────
    // Demonstrates: book-cover, card-title, card-description, grid layout.
    contentHtml += `<section class="brand-book-section block gap-l">
      <h2>Three things worth your time</h2>
      <div class="grid cols-3 gap-l">
        ${renderBookCover({ href: '#', title: 'Catchy article title example', subtitle: 'A short preview of the article content, crafted to grab attention and spark curiosity. Just enough to tempt the reader to click.' })}
        ${renderBookCover({ href: '#', title: 'Bold title for a blog post', subtitle: 'A few compelling lines that hint at the story within. Use this space to draw the reader in with tone, intrigue, or a bold statement.' })}
        ${renderBookCover({ href: '#', title: 'Short and scroll-stopping', subtitle: 'Bold insights, fresh thinking, and a reason to scroll. This placeholder shows how a post excerpt will look in your feed layout.' })}
      </div>
    </section>`;

    // ─── SCENARIO 3: Contact form ────────────────────────────
    // One of each form element: text input, textarea, radio, toggle, button.
    contentHtml += `<section class="brand-book-section block gap-l">
      <h2>Get in touch</h2>
      <div class="block gap-l">
        <div class="block gap-xs">
          <label for="bb-name"><strong>Name</strong></label>
          <input type="text" id="bb-name" placeholder="Your name">
        </div>
        <div class="block gap-xs">
          <label for="bb-message"><strong>Message</strong></label>
          <textarea id="bb-message" rows="4" placeholder="Tell us a little about your project..."></textarea>
        </div>
        <div class="form-check">
          <input type="radio" id="bb-radio" name="bb-radio" checked>
          <label for="bb-radio">Subscribe me to updates</label>
        </div>
        <div class="form-toggle">
          <input type="checkbox" id="bb-toggle" checked>
          <label for="bb-toggle">Email notifications</label>
        </div>
        <div class="button-group">
          <button class="button" type="button">Send message</button>
        </div>
      </div>
    </section>`;

    // Build page from template (same pattern as generateClientIndexPages)
    const navBase = '../';
    const brandCss = PROJECT_CONFIG.brandCssPath
      ? `<link rel="stylesheet" href="${navBase}${PROJECT_CONFIG.brandCssPath}">`
      : '';
    const clientThemeCss = `<!-- Client Theme Override (must load last to override base styles) -->\n    <link rel="stylesheet" href="assets/theme.css">`;
    const googleFonts = theme.fonts
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${theme.fonts}" rel="stylesheet">`
      : GOOGLE_FONTS_HTML;

    // Brand book uses the standard .copy-btn pattern (handled by copy-button.js)
    // and native <a download> for downloads — no inline script needed.

    let html = template
      .replace(/\{\{PAGE_TITLE\}\}/g, `${clientLabel} — ${pageTitle}`)
      .replace(/\{\{META_DESCRIPTION\}\}/g, pageDescription)
      .replace(/\{\{NAV_BASE\}\}/g, navBase)
      .replace(/\{\{PAGE_ACCESS\}\}/g, deriveDataAccess(frontmatter))
      .replace('{{PAGE_HEADER}}', brandBookPageHeader)
      .replace('{{PAGE_STICKY_BAR}}', '')
      .replace('{{PAGE_CONTENT}}', contentHtml)
      .replace('{{TOC_SECTION}}', '')
      .replace('{{PAGE_NAV}}', '')
      .replace('{{FOOTER_TEXT}}', buildFooterHtml())
      .replace('{{DESIGN_SYSTEM_PATH}}', navBase + PROJECT_CONFIG.designSystemPath)
      .replace('{{BRAND_CSS}}', brandCss)
      .replace('{{CLIENT_THEME_CSS}}', clientThemeCss)
      .replace('{{CLIENT_THEME_ATTR}}', `data-client-theme="${clientKey}"`)
      .replace('{{GOOGLE_FONTS}}', googleFonts)
      .replace('{{PAGE_SCRIPTS}}', '');

    // Write to client folder
    const dir = path.join(OUTPUT_DIR, clientKey);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'brand-book.html'), html);
    console.log(`📄 Generated: ${clientKey}/brand-book.html`);
  }
}

function generateClientIndexPages(template) {
  const themeConfigPath = path.join(OUTPUT_DIR, 'assets', 'js', 'theme-config.js');
  if (!fs.existsSync(themeConfigPath)) {
    console.log('⚠️  theme-config.js not found, skipping client index generation');
    return;
  }

  // Parse theme-config.js (uses var assignment, not module.exports)
  const configCode = fs.readFileSync(themeConfigPath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(configCode, sandbox);
  const themeConfig = sandbox.THEME_CONFIG;

  if (!themeConfig || !themeConfig.themes) {
    console.log('⚠️  No themes found in theme-config.js');
    return;
  }

  const toolRegistry = buildToolRegistryFromFrontmatter();

  for (const [clientKey, theme] of Object.entries(themeConfig.themes)) {
    let contentHtml = '';

    // Hero section
    const clientLabel = theme.label || clientKey;
    const clientDesc = theme.description || `Brand guidelines and tools for ${clientLabel}.`;
    contentHtml += `<div class="docs-hero">
      <h1 class="docs-hero-title">${clientLabel}</h1>
      <p class="docs-hero-description" data-text-wrap="balance">${clientDesc}</p>
    </div>`;

    // Client pages grouped by section (exclude index.html and Tools pages — tools handled separately)
    const clientPages = (theme.pages || []).filter(p => !p.href.endsWith('/index.html') && p.section !== 'Tools');
    const sectionGroups = {};
    const sectionOrder = [];
    for (const page of clientPages) {
      const section = page.section || clientLabel;
      if (!sectionGroups[section]) {
        sectionGroups[section] = [];
        sectionOrder.push(section);
      }
      sectionGroups[section].push(page);
    }

    for (const section of sectionOrder) {
      // Sort so Overview is always first
      sectionGroups[section].sort((a, b) => {
        if (a.title === 'Overview') return -1;
        if (b.title === 'Overview') return 1;
        return 0;
      });

      contentHtml += `<div class="docs-section">
      <h2 class="eyebrow">${section}</h2>
      <div class="grid cols-2 gap-xl">`;
      for (const page of sectionGroups[section]) {
        const href = page.href.startsWith(clientKey + '/')
          ? page.href.replace(clientKey + '/', '')
          : page.href;
        contentHtml += renderBookCover({
          href,
          title: page.title,
          subtitle: page.subtitle,
          author: page.author,
        });
      }
      contentHtml += `</div></div>`;
    }

    // Tools section — derived from frontmatter toolAccess
    const clientToolKeys = Object.keys(toolRegistry).filter(slug => clientHasToolAccess(toolRegistry[slug].toolAccess, clientKey));
    if (clientToolKeys.length > 0) {
      contentHtml += `<div class="docs-section">
      <h2 class="eyebrow">Tools</h2>
      <div class="grid cols-2 gap-xl">`;
      // Tools overview card first
      const toolsOverviewPage = (theme.pages || []).find(p => p.section === 'Tools' && p.title === 'Overview');
      if (toolsOverviewPage) {
        const overviewHref = toolsOverviewPage.href.startsWith(clientKey + '/') ? toolsOverviewPage.href.replace(clientKey + '/', '') : toolsOverviewPage.href;
        contentHtml += renderBookCover({
          href: overviewHref,
          title: 'Overview',
          subtitle: 'All available tools and utilities',
        });
      }
      for (const toolKey of clientToolKeys) {
        const tool = toolRegistry[toolKey];
        contentHtml += renderBookCover({
          href: `../tools/${toolKey}.html`,
          title: tool.title,
          subtitle: tool.subtitle,
          author: tool.author,
        });
      }
      contentHtml += `</div></div>`;
    }

    // Build page from template
    const navBase = '../';
    const dsPath = navBase + PROJECT_CONFIG.designSystemPath;
    const brandCss = PROJECT_CONFIG.brandCssPath
      ? `<link rel="stylesheet" href="${navBase}${PROJECT_CONFIG.brandCssPath}">`
      : '';
    const clientThemeCss = `<!-- Client Theme Override (must load last to override base styles) -->\n    <link rel="stylesheet" href="assets/theme.css">`;
    const googleFonts = theme.fonts
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="${theme.fonts}" rel="stylesheet">`
      : GOOGLE_FONTS_HTML;

    let html = template
      .replace(/\{\{PAGE_TITLE\}\}/g, `${clientLabel} — Brand Guidelines`)
      .replace(/\{\{META_DESCRIPTION\}\}/g, clientDesc)
      .replace(/\{\{NAV_BASE\}\}/g, navBase)
      .replace(/\{\{PAGE_ACCESS\}\}/g, deriveDataAccess(loadDefaults(path.join(DOCS_DIR, 'clients', clientKey))))
      .replace('{{PAGE_HEADER}}', '')
      .replace('{{PAGE_STICKY_BAR}}', '')
      .replace('{{PAGE_CONTENT}}', contentHtml)
      .replace('{{TOC_SECTION}}', '')
      .replace('{{PAGE_NAV}}', '')
      .replace('{{FOOTER_TEXT}}', buildFooterHtml())
      .replace(`<link rel="stylesheet" href="${dsPath}" id="design-system-css"`, `<link rel="stylesheet" href="${navBase}${PROJECT_CONFIG.designSystemPath}" id="design-system-css"`)
      .replace('{{BRAND_CSS}}', brandCss)
      .replace('{{CLIENT_THEME_CSS}}', clientThemeCss)
      .replace('{{CLIENT_THEME_ATTR}}', `data-client-theme="${clientKey}"`)
      .replace('{{GOOGLE_FONTS}}', googleFonts);

    // Replace design system path placeholder
    html = html.replace('{{DESIGN_SYSTEM_PATH}}', navBase + PROJECT_CONFIG.designSystemPath);

    // Write to client folder
    const dir = path.join(OUTPUT_DIR, clientKey);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log(`📄 Generated: ${clientKey}/index.html`);
  }
}

/**
 * Parse CLI arguments for single-file generation.
 * Accepts filenames with or without .md extension, e.g.:
 *   node generate-docs.js color
 *   node generate-docs.js color.md typography spacing
 *
 * Returns null for full build, or a Set of normalised .md filenames.
 */
function parseCliFilter() {
  const args = process.argv.slice(2);
  if (args.length === 0) return null;

  const filter = new Set();
  for (const arg of args) {
    const name = arg.endsWith('.md') ? arg : arg + '.md';
    // Verify file exists
    const filePath = path.join(DOCS_DIR, name);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: cms/${name}`);
      process.exit(1);
    }
    filter.add(name);
  }
  return filter;
}

/**
 * Main generation function
 */
async function generateDocs() {
  const filter = parseCliFilter();
  const isSingleFile = filter !== null;

  if (isSingleFile) {
    console.log(`🎯 Generating: ${[...filter].join(', ')}`);
  } else {
    console.log('🚀 Starting full documentation generation...');
  }

  // Build icon map from SVG files
  buildIconMap();

  // Load template
  let template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

  // Pre-process template icon placeholders
  template = template.replace(/\{\{icon:([a-z0-9-]+)\}\}/g, (match, name) => getIcon(name));

  console.log('✅ Template loaded');

  // Find all markdown files (exclude generator folder and README files)
  // We always parse ALL files to build navigation, even for single-file mode
  const markdownFiles = fs.readdirSync(DOCS_DIR)
    .filter(file => {
      const filePath = path.join(DOCS_DIR, file);
      // Skip directories and non-markdown files
      if (!fs.statSync(filePath).isFile() || !file.endsWith('.md')) {
        return false;
      }
      // Skip README and _defaults files
      if (file.startsWith('README') || file.startsWith('_')) {
        return false;
      }
      return true;
    });

  console.log(`📁 Found ${markdownFiles.length} markdown files`);

  // Parse files and organize by section
  const filesBySection = {};
  const allFiles = [];

  // Load folder defaults for the cms/ directory
  const cmsDefaults = loadDefaults(DOCS_DIR);

  // Layer validation (see CLAUDE.md §17 — Layer Discipline)
  // Every published cms/*.md file must declare which layer it belongs to.
  // This drives docs-site index filtering and llms.txt scope.
  const VALID_LAYERS = new Set(['foundation', 'core', 'docs-site', 'app']);
  const layerErrors = [];

  for (const filename of markdownFiles) {
    const filePath = path.join(DOCS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(content);
    // Merge folder defaults — page frontmatter wins
    const frontmatter = { ...cmsDefaults, ...parsed.frontmatter };
    const markdownContent = parsed.content;

    // Skip draft pages
    if (frontmatter.status === 'draft') {
      console.log(`⏭️  Skipped (draft): ${filename}`);
      continue;
    }

    // Validate layer (required, see CLAUDE.md §17)
    if (!frontmatter.layer) {
      layerErrors.push(`  ${filename} — missing 'layer:' field`);
    } else if (!VALID_LAYERS.has(frontmatter.layer)) {
      layerErrors.push(`  ${filename} — invalid layer "${frontmatter.layer}" (must be one of: foundation, core, docs-site, app)`);
    }

    const title = frontmatter.title || filename.replace('.md', '');
    const section = frontmatter.section || 'uncategorized';

    // Derive output folder and filename
    const { folder, htmlName } = deriveOutputPath(filename, section);
    const htmlPath = folder ? folder + '/' + htmlName : htmlName;
    const markdownPath = filename;

    const file = {
      filename,
      title,
      section,
      htmlPath,
      htmlFolder: folder,
      htmlName,
      markdownPath,
      frontmatter,
      content: markdownContent
    };

    if (!filesBySection[section]) {
      filesBySection[section] = [];
    }
    filesBySection[section].push(file);
    allFiles.push(file);
  }

  console.log(`📂 Found sections: ${Object.keys(filesBySection).join(', ')}`);

  // Fail the build if any file is missing a valid layer (see CLAUDE.md §17)
  if (layerErrors.length > 0) {
    console.error('\n❌ Layer Discipline violation — every cms/*.md file must declare a valid layer:');
    console.error(layerErrors.join('\n'));
    console.error('\nValid layers: foundation, core, docs-site, app');
    console.error('See CLAUDE.md §17 (Layer Discipline) for details.\n');
    process.exit(1);
  }

  // Build ordered page list for prev/next navigation
  const pageOrder = buildPageOrder(filesBySection);

  // Determine which files to write
  const filesToWrite = isSingleFile
    ? allFiles.filter(f => filter.has(f.filename))
    : allFiles;

  // Generate index and section pages only during full build
  if (!isSingleFile) {
    const indexContent = generateIndexPage(template, filesBySection);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexContent);
    console.log('📄 Generated: index.html');
  }

  // Generate HTML for target files
  for (const file of filesToWrite) {
    const pageContent = generatePage(file, template, pageOrder);

    // Ensure output directory exists
    if (file.htmlFolder) {
      const dir = path.join(OUTPUT_DIR, file.htmlFolder);
      fs.mkdirSync(dir, { recursive: true });
    }

    const outputPath = path.join(OUTPUT_DIR, file.htmlPath);
    fs.writeFileSync(outputPath, pageContent);
    console.log(`📄 Generated: ${file.htmlPath}`);
  }

  // Section index pages — only during full build
  if (!isSingleFile) {
    for (const section of Object.keys(filesBySection)) {
      const sectionFolder = SECTION_FOLDERS[section];
      if (!sectionFolder) continue;
      const sectionIndexHtml = generateSectionIndexPage(section, template, filesBySection[section], filesBySection);
      if (sectionIndexHtml) {
        const dir = path.join(OUTPUT_DIR, sectionFolder);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), sectionIndexHtml);
        console.log(`📄 Generated: ${sectionFolder}/index.html`);
      }
    }
  }

  // Always regenerate nav.js (sidebar needs to stay current)
  const navJs = generateNavJs(filesBySection);
  const navJsPath = path.join(OUTPUT_DIR, 'assets', 'js', 'nav.js');
  fs.writeFileSync(navJsPath, navJs);
  console.log('📄 Generated: assets/js/nav.js');

  // Client docs — only during full build
  if (!isSingleFile) {
    const generatedClientPages = generateClientDocs(template);
    updateThemeConfigPages(generatedClientPages);
    generateBrandBook(template);
    generateClientSectionOverviews(template);
    generateClientIndexPages(template);
  }

  if (isSingleFile) {
    console.log(`✅ Done — regenerated ${filesToWrite.length} page(s) + nav.js`);
  } else {
    console.log('✅ Documentation generation complete!');
    console.log(`📊 Generated ${allFiles.length + 1} HTML pages + nav.js`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  }
}

// Run the generator
generateDocs().catch(console.error);
