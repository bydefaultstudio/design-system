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
  html = html.replace(/<table>/g, '<div class="table-scroll"><table>');
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
 * Generate navigation HTML
 */
function generateNavigation(filesBySection, currentPage = null) {
  let navigation = '';
  
  
  // Sort sections in custom order (hidden sections are excluded from nav)
  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools'];
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
    
    // Sort files by order, then by title
    files.sort((a, b) => {
      const orderA = a.frontmatter.order || 999;
      const orderB = b.frontmatter.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title);
    });
    
    // Only open the section that contains the active page
    const isActiveSection = currentPage && files.some(f => f.filename === currentPage.filename);
    const openAttr = isActiveSection ? ' open' : '';
    
    // Display "Pages" instead of section name
    const sectionLabel = section === 'overview' ? 'Pages' : section.charAt(0).toUpperCase() + section.slice(1);
    
    navigation += `<details class="nav-section"${openAttr}>
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
      const isActive = currentPage && currentPage.filename === file.filename;
      const activeClass = isActive ? 'nav-link-active' : '';

      navigation += `
        <li><a href="${file.htmlPath}" class="nav-link ${activeClass}">${file.title}</a></li>
      `;
    }

    // Add Style Guide link inside the Design System section
    if (section === 'Design System') {
      navigation += `
        <li><a href="design-system/index.html" class="nav-link">Style Guide</a></li>
      `;
    }

    // Add Visual Identity link inside the Brand Book section
    if (section === 'Brand Book') {
      navigation += `
        <li><a href="brand-book/index.html" class="nav-link">Visual Identity</a></li>
      `;
    }

    navigation += `
      </ul>
    </details>`;
  }

  return navigation;
}

/**
 * Generate index page HTML
 */
function generateIndexPage(template, navigation, filesBySection) {
  let cards = '';

  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools'];
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

    cards += `<div class="docs-section">
      <h2 class="eyebrow">${section}</h2>
      <div class="grid cols-3 gap-xl">`;

    for (const file of files) {
      cards += `
        <a href="${file.htmlPath}" class="docs-card">
          <h3 class="docs-card-title">${file.title}</h3>
          ${file.frontmatter.subtitle ? `<p class="docs-card-subtitle" data-text-wrap="pretty">${file.frontmatter.subtitle}</p>` : ''}
        </a>
      `;
    }

    // Add Visual Identity card at the end of the Brand Book section
    if (section === 'Brand Book') {
      cards += `
        <a href="brand-book/index.html" class="docs-card">
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

  return template
    .replaceAll('{{PAGE_TITLE}}', 'Home')
    .replaceAll('{{META_DESCRIPTION}}', PROJECT_CONFIG.indexDescription)
    .replace('{{PAGE_HEADER}}', '') // Index page doesn't need a header
    .replace('{{PAGE_CONTENT}}', indexContent)
    .replace('{{NAVIGATION}}', navigation)
    .replace('{{TOC_SECTION}}', '')
    .replace('{{INDEX_PATH}}', 'index.html')
    .replace('{{DESIGN_SYSTEM_PATH}}', PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML)
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', '')
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText);
}

/**
 * Build a flat ordered list of all pages following the nav order
 */
function buildPageOrder(filesBySection) {
  const sectionOrder = ['Brand Book', 'Design System', 'Code', 'Content', 'Tools'];
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

  const arrowLeft = `<svg class="page-nav-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const arrowRight = `<svg class="page-nav-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
function generatePage(file, template, navigation, pageOrder) {
  const { frontmatter, content } = file;
  const htmlContent = markdownToHtml(content);
  const tableOfContents = generateTableOfContents(htmlContent);
  
  // Generate page header separately
  let pageHeader = '';
  if (frontmatter.title) {
    pageHeader = `<div class="page-header">
      <div class="container-small">
        <h1>${frontmatter.title}</h1>
        ${frontmatter.subtitle ? `<p class="page-subtitle" data-text-wrap="pretty">${frontmatter.subtitle}</p>` : ''}
        <div class="button-group justify-center">
          <a href="docs/${file.markdownPath}" class="button is-small is-faded page-source-link" target="_blank" rel="noopener noreferrer">View as Markdown</a>
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
    .replace('{{NAVIGATION}}', navigation)
    .replace('{{TOC_SECTION}}', `<aside class="docs-toc">
      <span class="toc-header">On this page</span>
      <div class="toc-wrapper">${tableOfContents}</div>
    </aside>`)
    .replace('{{INDEX_PATH}}', 'index.html')
    .replace('{{DESIGN_SYSTEM_PATH}}', PROJECT_CONFIG.designSystemPath)
    .replace('{{BRAND_CSS}}', BRAND_CSS_HTML)
    .replace('{{GOOGLE_FONTS}}', GOOGLE_FONTS_HTML)
    .replace('{{PAGE_NAV}}', generatePageNav(file, pageOrder))
    .replace('{{FOOTER_TEXT}}', PROJECT_CONFIG.footerText);
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
    const htmlPath = filename.replace('.md', '.html');
    const markdownPath = filename;
    
    const file = {
      filename,
      title,
      section,
      htmlPath,
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
  
  // Generate index.html
  const indexPage = { filename: 'index' };
  const navigation = generateNavigation(filesBySection, indexPage);
  const indexContent = generateIndexPage(template, navigation, filesBySection);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexContent);
  console.log('📄 Generated: index.html');
  
  // Build ordered page list for prev/next navigation
  const pageOrder = buildPageOrder(filesBySection);

  // Generate HTML for each file
  for (const file of allFiles) {
    const navigation = generateNavigation(filesBySection, file);
    const pageContent = generatePage(file, template, navigation, pageOrder);
    const outputPath = path.join(OUTPUT_DIR, file.htmlPath);
    
    fs.writeFileSync(outputPath, pageContent);
    console.log(`📄 Generated: ${file.htmlPath}`);
  }
  
  console.log('✅ Documentation generation complete!');
  console.log(`📊 Generated ${allFiles.length + 1} HTML pages`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

// Run the generator
generateDocs().catch(console.error);

