/**
 * Theme Configuration
 * Registry of available client themes and tools for dynamic loading.
 *
 * Each theme entry maps a clientFolder name (from Netlify Identity app_metadata)
 * to its theme CSS path, Google Fonts URL, sidebar pages, and granted tools.
 *
 * Each tool entry defines the tool UI metadata and access level.
 *
 * To add a new client theme:
 *   1. Copy blank/ folder → your-client/
 *   2. Customise token values in theme.css
 *   3. Add an entry below with the clientFolder key
 *   4. See admin/client-setup.html for the full guide
 *
 * @version 2.0.0
 * @author By Default
 */

var THEME_CONFIG = {

  // Global tool registry — maps tool folder to metadata
  // access: controls data-access on the tool UI page (public/client/team/admin)
  tools: {
    'cpm-calculator':     { title: 'CPM Calculator',     subtitle: 'CPM & Spend Calculator',        access: 'public' },
    'svg-cleaner':        { title: 'SVG Cleaner',        subtitle: 'SVG cleaning and optimisation', access: 'team' },
    'display-ad-preview': { title: 'Display Ad Preview', subtitle: 'Celtra ad preview sandbox',     access: 'client' }
  },

  // Map of clientFolder → theme definition
  themes: {

    'blank': {
      label: 'Blank',
      description: 'Brand guidelines and tools for Blank.',
      css: 'blank/theme.css',
      fonts: null,
      pages: [
        { title: 'Home', href: 'blank/index.html' },
        { title: 'Brand Book', href: 'blank/brand-book.html', section: 'Brand' }
      ],
      tools: ['cpm-calculator', 'display-ad-preview']
    },

    'dianomi': {
      label: 'Dianomi',
      description: 'Brand guidelines and tools for Dianomi.',
      css: 'dianomi/theme.css',
      fonts: null,
      pages: [
        { title: 'Home', href: 'dianomi/index.html' },
        { title: 'Brand Book', href: 'dianomi/brand-book.html', section: 'Brand' }
      ],
      tools: ['cpm-calculator', 'display-ad-preview']
    }

  }

};
