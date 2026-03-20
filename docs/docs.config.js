/**
 * Docs Configuration
 * Project-specific settings for the documentation site.
 * This file stays in place when the docs/generator/ folder is upgraded.
 */
module.exports = {

  // Path to the design system framework CSS, relative from docs/site/
  designSystemPath: '../../design-system/design-system.css',

  // Path to the brand book CSS, relative from docs/site/
  // Set to null if using the framework defaults only
  brandCssPath: '../../brand-book/brand-book.css',

  // Google Fonts URL — set to null to disable
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',

  // Footer text
  footerText: '© 2026 By Default BrandOS',

  // Index page description (shown on the docs homepage)
  indexDescription: 'Complete documentation for By Default BrandOS — the design and brand systems hub.',

};
