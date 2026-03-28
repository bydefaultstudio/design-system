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

  const arrowLeft = `<div class="icn-svg page-nav-arrow" data-icon="chevron-left-large"><svg viewBox="0 0 24 24" fill="none"><path d="M15.225 22L5.225 12L15.225 2L17 3.775L10.1892 10.5858C9.40817 11.3668 9.40816 12.6332 10.1892 13.4142L17 20.225L15.225 22Z" fill="currentColor"/></svg></div>`;
  const arrowRight = `<div class="icn-svg page-nav-arrow" data-icon="chevron-right-large"><svg viewBox="0 0 24 24" fill="none"><path d="M8.775 22L7 20.225L13.8108 13.4142C14.5918 12.6332 14.5918 11.3668 13.8108 10.5858L7 3.775L8.775 2L18.775 12L8.775 22Z" fill="currentColor"/></svg></div>`;

  let html = '<nav class="page-nav" aria-label="Page navigation"><div class="page-nav-inner padding-global">';

  if (prev) {
    const sectionLabel = prev.section !== file.section ? `<span class="page-nav-section">${prev.section}</span>` : '';
    html += `<a href="${prev.htmlPath}" class="page-nav-link page-nav-prev" rel="prev">
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
    html += `<a href="${next.htmlPath}" class="page-nav-link page-nav-next" rel="next">
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
  var ICON_SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM1 13V11H4V13H1ZM20 13V11H23V13H20ZM3.51472 19.0711L5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711ZM16.9497 5.63604L19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604Z" fill="currentColor"/></svg>';
  var ICON_MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C12.3373 3 12.6713 3.01526 13.0014 3.04517C10.6237 4.52399 9 7.07627 9 10C9 14.4183 12.5817 18 17 18C17.9254 18 18.8091 17.8298 19.6253 17.5192C18.2725 19.6313 15.8032 21 13 21H12Z" fill="currentColor"/></svg>';

  // ── Build header HTML ──
  var headerLeft = '<div class="site-header-left">';

  if (hasSidebar) {
    // Hamburger for mobile sidebar
    headerLeft += '<button class="site-header-hamburger" aria-label="Open navigation" type="button">'
      + '<span class="hamburger-icon-open">' + ICON_HAMBURGER + '</span>'
      + '<span class="hamburger-icon-close">' + ICON_CLOSE + '</span>'
      + '</button>';
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

  var headerRight = '<div class="site-header-right">'
    + '<button class="dark-mode-toggle" aria-label="Toggle dark mode" type="button">'
    + '<span class="dark-mode-icon-light">' + ICON_SUN + '</span>'
    + '<span class="dark-mode-icon-dark">' + ICON_MOON + '</span>'
    + '</button>'
    + '<div class="auth-header-container"></div>'
    + '</div>';

  var headerHtml = '<header class="site-header">' + headerLeft + headerRight + '</header>';

  // ── Build sidebar HTML (if needed) ──
  var sidebarHtml = '';
  if (hasSidebar) {
    sidebarHtml = '<aside class="site-sidebar">'
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

      if (linkFile === currentFile || fullMatch) {
        link.classList.add('nav-link-active');
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
    document.documentElement.classList.add('dark-mode');
  }

  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      var isDark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem(DARK_KEY, isDark);
    });
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
      html += `<li><a href="${file.htmlPath}" class="nav-link"${linkAccessAttr}>${file.title}</a></li>`;
    }

    if (section === 'Design System') {
      html += `<li><a href="design-system/index.html" class="nav-link">Style Guide</a></li>`;
    }

    if (section === 'Brand Book') {
      html += `<li><a href="brand/index.html" class="nav-link">Visual Identity</a></li>`;
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
