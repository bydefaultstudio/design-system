#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration
const DOCS_DIR = path.join(__dirname, '..');  // ../ (docs/)
const OUTPUT_DIR = path.join(__dirname, '..', '..');  // ../../ (project root)
const TEMPLATE_FILE = path.join(__dirname, 'template.html');

// Load project config (docs/docs.config.js) with fallback defaults
const configPath = path.join(DOCS_DIR, 'docs.config.js');
const userConfig = fs.existsSync(configPath) ? require(configPath) : {};
const PROJECT_CONFIG = {
  designSystemPath: userConfig.designSystemPath || 'design-system/design-system.css',
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

//------- Section-to-Folder Mapping -------//

const SECTION_FOLDERS = {
  'Brand Book': 'brand',
  'Design System': 'design-system',
  'Code': 'code',
  'Content': 'content',
  'Tools': null,   // tool docs use special per-file mapping
  'Admin': 'admin',
  'Project': 'project'
};

// Special filename overrides for files that don't follow the prefix-strip pattern
const FILENAME_OVERRIDES = {
  'calculator-docs.md': { folder: 'cpm-calculator', name: 'about.html' },
  'svg-cleaner-docs.md': { folder: 'svg-cleaner', name: 'about.html' },
  'display-ad-preview-docs.md': { folder: 'display-ad-preview', name: 'about.html' },
  'css-code-struture.md': { folder: 'code', name: 'css.html' },
  'js-code-structure.md': { folder: 'code', name: 'javascript.html' },
  'design-system-overview.md': { folder: 'design-system', name: 'overview.html' },
  'markdown-style.md': { folder: 'design-system', name: 'markdown-style.html' },
  'seo-best-practices.md': { folder: 'content', name: 'seo-best-practices.html' },
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

  // Wrap tables in a scroll container for horizontal scrolling on mobile
  html = html.replace(/<table>/g, '<div class="table-scroll"><table class="table">');
  html = html.replace(/<\/table>/g, '</table></div>');

  // Add copy buttons to code blocks
  html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attributes, code) => {
    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);

    return `
      <div class="code-block-wrapper">
        <button class="button is-xsmall copy-code-btn" data-clipboard-target="#${codeId}" type="button" aria-label="Copy code"><div class="icn-svg"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M8 14C8 15.1046 8.89543 16 10 16H18C19.1046 16 20 15.1046 20 14V6C20 4.89543 19.1046 4 18 4H10C8.89543 4 8 4.89543 8 6V14ZM6 18V2H22V18H6ZM2 22V6H4V20H18V22H2Z" fill="currentColor"/></svg></div> <span class="copy-text">Copy</span></button>
        <pre><code id="${codeId}"${attributes}>${code}</code></pre>
      </div>
    `;
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
  let cards = '';

  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools', 'Admin'];
  const hiddenSections = ['Project'];
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

  for (const section of sortedSections) {
    const files = filesBySection[section];

    files.sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    const accessAttr = section === 'Admin' ? ' data-access="admin"' : '';

    cards += `<div class="docs-section"${accessAttr}>
      <h2 class="eyebrow">${section}</h2>
      <div class="grid cols-3 gap-xl">`;

    for (const file of files) {
      const cardAccess = file.frontmatter.access || 'team';
      const cardAccessAttr = cardAccess !== 'team' ? ` data-access="${cardAccess}"` : '';
      cards += `
        <a href="${file.htmlPath}" class="docs-card"${cardAccessAttr}>
          <h3 class="docs-card-title">${file.title}</h3>
          ${file.frontmatter.subtitle ? `<p class="docs-card-subtitle" data-text-wrap="pretty">${file.frontmatter.subtitle}</p>` : ''}
        </a>
      `;
    }

    // Add Visual Identity card at the end of the Brand Book section
    if (section === 'Brand Book') {
      cards += `
        <a href="brand/index.html" class="docs-card">
          <h3 class="docs-card-title">Visual Identity</h3>
          <p class="docs-card-subtitle" data-text-wrap="pretty">Visual brand identity — logo, palette, typography, and icons</p>
        </a>
      `;
    }

    // Add Style Guide card at the end of the Design System section
    if (section === 'Design System') {
      cards += `
        <a href="design-system/index.html" class="docs-card">
          <h3 class="docs-card-title">Style Guide</h3>
          <p class="docs-card-subtitle" data-text-wrap="pretty">Live preview of all design system tokens and components</p>
        </a>
      `;
    }

    cards += `
      </div>
    </div>`;
  }

  const indexContent = `
    <div class="docs-hero">
      <h1 class="docs-hero-title">By Default Brand OS</h1>
      <p class="docs-hero-description" data-text-wrap="balance">${PROJECT_CONFIG.indexDescription}</p>
    </div>
    ${cards}
  `;

  const access = 'team'; // index page requires team

  return template
    .replaceAll('{{PAGE_TITLE}}', 'Home')
    .replaceAll('{{META_DESCRIPTION}}', PROJECT_CONFIG.indexDescription)
    .replace('{{PAGE_HEADER}}', '') // Index page doesn't need a header
    .replace('{{PAGE_CONTENT}}', indexContent)
    .replace('{{TOC_SECTION}}', '')
    .replace('{{DESIGN_SYSTEM_PATH}}', PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML)
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', '')
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText)
    .replace('{{PAGE_ACCESS}}', access)
    .replaceAll('{{NAV_BASE}}', '');
}

/**
 * Build a flat ordered list of all pages following the nav order
 */
function buildPageOrder(filesBySection) {
  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools', 'Admin'];
  const hiddenSections = ['Project'];
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

  const ordered = [];
  for (const section of sortedSections) {
    const files = [...filesBySection[section]].sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });
    for (const file of files) {
      ordered.push(file);
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

  const arrowLeft = `<div class="icn-svg page-nav-arrow" data-icon="chevron-left-large"><svg viewBox="0 0 24 24" fill="none"><path d="M15.225 22L5.225 12L15.225 2L17 3.775L10.1892 10.5858C9.40817 11.3668 9.40816 12.6332 10.1892 13.4142L17 20.225L15.225 22Z" fill="currentColor"/></svg></div>`;
  const arrowRight = `<div class="icn-svg page-nav-arrow" data-icon="chevron-right-large"><svg viewBox="0 0 24 24" fill="none"><path d="M8.775 22L7 20.225L13.8108 13.4142C14.5918 12.6332 14.5918 11.3668 13.8108 10.5858L7 3.775L8.775 2L18.775 12L8.775 22Z" fill="currentColor"/></svg></div>`;

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
 * Generate page HTML
 */
function generatePage(file, template, pageOrder) {
  const { frontmatter, content } = file;
  const htmlContent = markdownToHtml(content);
  const tableOfContents = generateTableOfContents(htmlContent);
  const access = frontmatter.access || 'team';

  // Generate page header separately
  let pageHeader = '';
  if (frontmatter.title) {
    pageHeader = `<div class="page-header">
      <div class="container-small">
        <h1>${frontmatter.title}</h1>
        ${frontmatter.subtitle ? `<p class="page-subtitle" data-text-wrap="pretty">${frontmatter.subtitle}</p>` : ''}
        <div class="button-group justify-center">
          <a href="../docs/${file.markdownPath}" class="button is-small is-faded page-source-link" target="_blank" rel="noopener noreferrer">View as Markdown</a>
          ${frontmatter.toolUrl ? `<a href="${frontmatter.toolUrl}" class="button is-small page-source-link">${frontmatter.toolLabel || 'Open Tool'}</a>` : ''}
        </div>
      </div>
    </div>`;
  }

  return template
    .replaceAll('{{PAGE_TITLE}}', frontmatter.title || 'Untitled')
    .replaceAll('{{META_DESCRIPTION}}', frontmatter.description || '')
    .replace('{{PAGE_HEADER}}', pageHeader)
    .replace('{{PAGE_CONTENT}}', htmlContent)
    .replace('{{TOC_SECTION}}', `<aside class="docs-toc">
      <span class="toc-header">On this page</span>
      <div class="toc-wrapper">${tableOfContents}</div>
    </aside>`)
    .replace('{{DESIGN_SYSTEM_PATH}}', '../' + PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML ? `<link rel="stylesheet" href="../${PROJECT_CONFIG.brandCssPath}">` : '')
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', generatePageNav(file, pageOrder))
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText)
    .replace('{{PAGE_ACCESS}}', access)
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
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

  const script = `/**
 * nav.js — Auto-generated by docs/generator/generate-docs.js
 * Injects site header + sidebar into any page with a #site-nav mount point.
 * DO NOT EDIT MANUALLY — re-run: cd docs/generator && npm run docgen
 */
(function initSiteNav() {
  'use strict';

  var mount = document.getElementById('site-nav');
  if (!mount) return;

  var base = mount.getAttribute('data-base') || '';
  var hasSidebar = mount.getAttribute('data-sidebar') !== 'false';

  // ── Shared SVG icons ──
  var ICON_HAMBURGER = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 18V16H21V18H3ZM3 13V11H21V13H3ZM3 8V6H21V8H3Z" fill="currentColor"/></svg>';
  var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/></svg>';
  var ICON_COLLAPSE = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.6 12L9.6 8L11 9.4L9.81421 10.5858C9.03316 11.3668 9.03316 12.6332 9.81421 13.4142L11 14.6L9.6 16L5.6 12Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22 22H2V2H22V22ZM4 18C4 19.1046 4.89543 20 6 20H12C13.1046 20 14 19.1046 14 18V6C14 4.89543 13.1046 4 12 4H6C4.89543 4 4 4.89543 4 6V18ZM16 18C16 19.1046 16.8954 20 18 20C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4C16.8954 4 16 4.89543 16 6V18Z" fill="currentColor"/></svg>';
  var ICON_EXPAND = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12.4 12L8.4 16L7 14.6L8.18579 13.4142C8.96684 12.6332 8.96684 11.3668 8.18579 10.5858L7 9.4L8.4 8L12.4 12Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22 22H2V2H22V22ZM4 18C4 19.1046 4.89543 20 6 20H12C13.1046 20 14 19.1046 14 18V6C14 4.89543 13.1046 4 12 4H6C4.89543 4 4 4.89543 4 6V18ZM16 18C16 19.1046 16.8954 20 18 20C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4C16.8954 4 16 4.89543 16 6V18Z" fill="currentColor"/></svg>';
  var ICON_BACK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 18V15C18 13.8954 17.1046 13 16 13H10.2392C9.34831 13 8.90214 14.0771 9.53211 14.7071L11.425 16.6L10.025 18.025L4 12L10 6L11.425 7.425L9.54652 9.29043C8.91317 9.91938 9.35857 11 10.2512 11H20V18H18Z" fill="currentColor"/></svg>';
  var ICON_SUN = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM1 13V11H4V13H1ZM20 13V11H23V13H20ZM3.51472 19.0711L5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711ZM16.9497 5.63604L19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604Z" fill="currentColor"/></svg>';
  var ICON_MOON = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15.1625 17.6625C16.7208 16.1042 17.5 14.2167 17.5 12C17.5 9.78333 16.7208 7.89583 15.1625 6.3375C13.9817 5.15672 12.1597 4.35602 10.402 4.10029C9.60391 3.98418 9.20482 4.89906 9.63374 5.58204C10.0596 6.26022 10.4192 6.97871 10.7125 7.7375C11.2375 9.09583 11.5 10.5167 11.5 12C11.5 13.4833 11.2375 14.9042 10.7125 16.2625C10.4462 16.9516 10.1252 17.6074 9.74945 18.23C9.31198 18.955 9.78479 19.9392 10.6206 19.8035C12.371 19.5193 14.0025 18.8225 15.1625 17.6625ZM9.5 22C8.61667 22 7.75417 21.8875 6.9125 21.6625C6.07083 21.4375 5.26667 21.1 4.5 20.65C6.05 19.75 7.27083 18.5333 8.1625 17C9.05417 15.4667 9.5 13.8 9.5 12C9.5 10.2 9.05417 8.53333 8.1625 7C7.27083 5.46667 6.05 4.25 4.5 3.35C5.26667 2.9 6.07083 2.5625 6.9125 2.3375C7.75417 2.1125 8.61667 2 9.5 2C10.8833 2 12.1833 2.2625 13.4 2.7875C14.6167 3.3125 15.675 4.025 16.575 4.925C17.475 5.825 18.1875 6.88333 18.7125 8.1C19.2375 9.31667 19.5 10.6167 19.5 12C19.5 13.3833 19.2375 14.6833 18.7125 15.9C18.1875 17.1167 17.475 18.175 16.575 19.075C15.675 19.975 14.6167 20.6875 13.4 21.2125C12.1833 21.7375 10.8833 22 9.5 22Z" fill="currentColor"/></svg>';

  // ── Build header HTML ──
  var headerLeft = '<div class="site-header-left">';

  if (hasSidebar) {
    // Hamburger for mobile sidebar
    headerLeft += '<div class="header-link site-header-hamburger" role="button" tabindex="0" aria-label="Open navigation">'
      + '<div class="icn-svg hamburger-icon-open">' + ICON_HAMBURGER + '</div>'
      + '<div class="icn-svg hamburger-icon-close">' + ICON_CLOSE + '</div>'
      + '</div>';
  } else {
    // Back link for no-sidebar pages
    headerLeft += '<a href="' + base + 'index.html" class="site-header-back">' + ICON_BACK + ' Docs</a>';
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

  var ICON_CHEVRON_DOWN = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/></svg>';

  var headerRight = '<div class="site-header-right">'
    + '<div class="header-dropdown demo-dropdown testing">'
    + '<div class="header-link" role="button" tabindex="0" aria-expanded="false">'
    + '<div class="icn-svg" data-icon="add"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 15C11 13.8954 10.1046 13 9 13H4V11H9C10.1046 11 11 10.1046 11 9V4H13V9C13 10.1046 13.8954 11 15 11H20V13H15C13.8954 13 13 13.8954 13 15V20H11V15Z" fill="currentColor"/></svg></div>'
    + '<span>Demo</span>'
    + '<div class="icn-svg header-link-chevron" data-icon="chevron-down">' + ICON_CHEVRON_DOWN + '</div>'
    + '</div>'
    + '<div class="header-dropdown-menu">'
    + '<div class="header-dropdown-label">Actions</div>'
    + '<a href="#" class="header-link"><div class="icn-svg" data-icon="add"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 15C11 13.8954 10.1046 13 9 13H4V11H9C10.1046 11 11 10.1046 11 9V4H13V9C13 10.1046 13.8954 11 15 11H20V13H15C13.8954 13 13 13.8954 13 15V20H11V15Z" fill="currentColor"/></svg></div><span>New Page</span></a>'
    + '<a href="#" class="header-link"><div class="icn-svg" data-icon="settings"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.875 22H10.125L9.65 18.8C9.18333 18.6333 8.74167 18.4167 8.325 18.15C7.90833 17.8833 7.51667 17.5833 7.15 17.25L4.125 18.575L2.25 15.425L4.85 13.375C4.81667 13.1583 4.79583 12.9458 4.7875 12.7375C4.77917 12.5292 4.775 12.2667 4.775 11.95C4.775 11.65 4.77917 11.3958 4.7875 11.1875C4.79583 10.9792 4.81667 10.7667 4.85 10.55L2.25 8.575L4.125 5.425L7.15 6.725C7.51667 6.39167 7.90833 6.09583 8.325 5.8375C8.74167 5.57917 9.18333 5.36667 9.65 5.2L10.125 2H13.875L14.35 5.2C14.8167 5.36667 15.2583 5.58333 15.675 5.85C16.0917 6.11667 16.4833 6.41667 16.85 6.75L19.875 5.425L21.75 8.575L19.15 10.575C19.1833 10.7917 19.2042 11.0042 19.2125 11.2125C19.2208 11.4208 19.225 11.6667 19.225 11.95C19.225 12.2333 19.2167 12.4833 19.2 12.7C19.1833 12.9167 19.1583 13.1333 19.125 13.35L21.75 15.425L19.875 18.575L16.85 17.25C16.4833 17.5833 16.0917 17.8833 15.675 18.15C15.2583 18.4167 14.8167 18.6333 14.35 18.8L13.875 22ZM12 15.5C12.9667 15.5 13.7917 15.1583 14.475 14.475C15.1583 13.7917 15.5 12.9667 15.5 12C15.5 11.0333 15.1583 10.2083 14.475 9.525C13.7917 8.84167 12.9667 8.5 12 8.5C11.0333 8.5 10.2083 8.84167 9.525 9.525C8.84167 10.2083 8.5 11.0333 8.5 12C8.5 12.9667 8.84167 13.7917 9.525 14.475C10.2083 15.1583 11.0333 15.5 12 15.5Z" fill="currentColor"/></svg></div><span>Settings</span></a>'
    + '<div class="header-dropdown-divider"></div>'
    + '<div class="header-dropdown-label">Resources</div>'
    + '<a href="#" class="header-link">Documentation</a>'
    + '<a href="#" class="header-link">Help Centre</a>'
    + '</div>'
    + '</div>'
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
      + \`${esc(navSectionsHtml)}\`
      + '</div>'
      + '<div class="auth-button-container"></div>'
      + '</aside>'
      + '<div class="site-sidebar-backdrop"></div>';
  }

  // ── Inject into page ──
  mount.innerHTML = headerHtml + sidebarHtml;

  // Fix relative paths in sidebar nav links
  if (base && hasSidebar) {
    var links = mount.querySelectorAll('.site-sidebar .nav-link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#')) {
        links[i].setAttribute('href', base + href);
      }
    }
  }

  // ── Active link detection ──
  if (hasSidebar) {
    var currentPath = window.location.pathname;
    var navLinks = mount.querySelectorAll('.nav-link');

    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      var linkHref = link.getAttribute('href') || '';

      // Normalize: compare just the filename portion
      var linkFile = linkHref.split('/').pop();
      var currentFile = currentPath.split('/').pop() || 'index.html';

      // Also check full path match for subdirectory pages
      var fullMatch = currentPath.endsWith(linkHref) || currentPath.endsWith('/' + linkHref);

      // Skip filename-only match for index.html (ambiguous across directories)
      var filenameMatch = linkFile === currentFile && linkFile !== 'index.html';

      if (filenameMatch || fullMatch) {
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

    // Restore saved state
    if (localStorage.getItem(SIDEBAR_KEY) === 'true') {
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

  // ── Header dropdown toggles ──
  var headerDropdowns = mount.querySelectorAll('.header-dropdown');
  for (var d = 0; d < headerDropdowns.length; d++) {
    (function(dd) {
      var ddToggle = dd.querySelector('.header-link');
      if (!ddToggle) return;

      ddToggle.addEventListener('click', function() {
        var wasOpen = dd.classList.contains('is-open');
        // Close all header dropdowns first
        for (var k = 0; k < headerDropdowns.length; k++) {
          headerDropdowns[k].classList.remove('is-open');
          var t = headerDropdowns[k].querySelector('.header-link');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
        if (!wasOpen) {
          dd.classList.add('is-open');
          ddToggle.setAttribute('aria-expanded', 'true');
        }
      });

      document.addEventListener('click', function(e) {
        if (!dd.contains(e.target)) {
          dd.classList.remove('is-open');
          ddToggle.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dd.classList.contains('is-open')) {
          dd.classList.remove('is-open');
          ddToggle.setAttribute('aria-expanded', 'false');
          ddToggle.focus();
        }
      });
    })(headerDropdowns[d]);
  }

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

  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools', 'Admin'];
  const hiddenSections = ['Project'];
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

  for (const section of sortedSections) {
    const files = [...filesBySection[section]];

    files.sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });

    const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
    const accessAttr = section === 'Admin' ? ' data-access="admin"' : '';

    html += `<details class="nav-section"${accessAttr}>
      <summary class="nav-section-toggle">
        <span>${sectionLabel}</span>
        <span class="nav-toggle-icon">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
            <path d="M3.58943 3L1.28943 0.7L1.98943 0L4.98943 3L1.98943 6L1.28943 5.3L3.58943 3Z" fill="currentColor"/>
          </svg>
        </span>
      </summary>
      <ul class="nav-list">`;

    for (const file of files) {
      const linkAccess = file.frontmatter.access || 'team';
      const linkAccessAttr = linkAccess !== 'team' ? ` data-access="${linkAccess}"` : '';
      html += `<li><a href="${file.htmlPath}" class="nav-link"${linkAccessAttr}><span>${file.title}</span></a></li>`;
    }

    if (section === 'Design System') {
      html += `<li><a href="../design-system/index.html" class="nav-link"><span>Style Guide</span></a></li>`;
    }

    if (section === 'Brand Book') {
      html += `<li><a href="../brand/index.html" class="nav-link"><span>Visual Identity</span></a></li>`;
    }

    html += `</ul></details>`;
  }

  return html;
}

/**
 * Main generation function
 */
async function generateDocs() {
  console.log('🚀 Starting documentation generation...');

  // Load template
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  console.log('✅ Template loaded');

  // Find all markdown files (exclude generator folder and README files)
  const markdownFiles = fs.readdirSync(DOCS_DIR)
    .filter(file => {
      const filePath = path.join(DOCS_DIR, file);
      // Skip directories and non-markdown files
      if (!fs.statSync(filePath).isFile() || !file.endsWith('.md')) {
        return false;
      }
      // Skip README files
      if (file.startsWith('README')) {
        return false;
      }
      return true;
    });

  console.log(`📁 Found ${markdownFiles.length} markdown files`);

  // Parse files and organize by section
  const filesBySection = {};
  const allFiles = [];

  for (const filename of markdownFiles) {
    const filePath = path.join(DOCS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, content: markdownContent } = parseFrontmatter(content);

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

  // Generate index.html (at project root)
  const indexContent = generateIndexPage(template, filesBySection);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexContent);
  console.log('📄 Generated: index.html');

  // Build ordered page list for prev/next navigation
  const pageOrder = buildPageOrder(filesBySection);

  // Generate HTML for each file in its subfolder
  for (const file of allFiles) {
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

  // Generate nav.js
  const navJs = generateNavJs(filesBySection);
  const navJsPath = path.join(OUTPUT_DIR, 'assets', 'js', 'nav.js');
  fs.writeFileSync(navJsPath, navJs);
  console.log('📄 Generated: assets/js/nav.js');

  console.log('✅ Documentation generation complete!');
  console.log(`📊 Generated ${allFiles.length + 1} HTML pages + nav.js`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

// Run the generator
generateDocs().catch(console.error);
