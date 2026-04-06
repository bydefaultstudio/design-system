/**
 * Theme Configuration
 * Registry of available client themes for dynamic loading.
 *
 * Each theme entry maps a clientFolder name (from Netlify Identity app_metadata)
 * to its theme CSS path, Google Fonts URL, and sidebar pages.
 *
 * Tool access is managed via frontmatter in cms/*.md files (toolAccess field),
 * NOT in this config. See cms/access-control.md for details.
 *
 * To add a new client theme:
 *   1. Copy client-template/ folder → your-client/
 *   2. Customise token values in theme.css
 *   3. Add an entry below with the clientFolder key
 *   4. Create cms/clients/your-client/_defaults.md with access: "client:your-client"
 *   5. See docs/client-setup.html for the full guide
 *
 * @version 3.0.0
 * @author By Default
 */

var THEME_CONFIG = {

  // Global tool registry — metadata only (access controlled via cms/*.md frontmatter)
  tools: {
    'cpm-calculator':     { title: 'CPM Calculator',     subtitle: 'CPM & Spend Calculator' },
    'svg-cleaner':        { title: 'SVG Cleaner',        subtitle: 'SVG cleaning and optimisation' },
    'display-ad-preview': { title: 'Display Ad Preview', subtitle: 'Celtra ad preview sandbox' }
  },

  // Map of clientFolder → theme definition
  themes: {

    'client-template': {
      label: 'Client Template',
      description: 'Brand guidelines and tools for Client Template.',
      css: 'client-template/theme.css',
      fonts: null,
      pages: [
        { title: 'Home', href: 'client-template/index.html' },
        { title: 'Brand Book', href: 'client-template/brand-book.html', subtitle: 'Visual identity, logo, palette, and typography' },
        { title: 'Overview', href: 'client-template/docs/index.html', section: 'Docs' },
        { title: 'Overview', href: 'client-template/tools/index.html', section: 'Tools' },
        { title: 'CPM Calculator', href: 'tools/cpm-calculator.html', section: 'Tools' },
        { title: 'Display Ad Preview', href: 'tools/display-ad-preview.html', section: 'Tools' },
        { title: 'Image Placeholder', href: 'tools/image-placeholder.html', section: 'Tools' },
        { title: 'Welcome', href: 'client-template/docs/welcome.html', subtitle: 'How to use this site', section: 'Docs' }
      ]
    },

    'dianomi': {
      label: 'Dianomi',
      description: 'Brand guidelines and tools for Dianomi.',
      css: 'dianomi/theme.css',
      fonts: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      pages: [
        { title: 'Home', href: 'dianomi/index.html' },
        { title: 'Brand Book', href: 'dianomi/brand-book.html', subtitle: 'Visual identity, logo, palette, and typography' },
        { title: 'Overview', href: 'dianomi/docs/index.html', section: 'Docs' },
        { title: 'Overview', href: 'dianomi/tools/index.html', section: 'Tools' },
        { title: 'CPM Calculator', href: 'tools/cpm-calculator.html', section: 'Tools' },
        { title: 'Display Ad Preview', href: 'tools/display-ad-preview.html', section: 'Tools' },
        { title: 'Image Placeholder', href: 'tools/image-placeholder.html', section: 'Tools' },
        { title: 'Welcome', href: 'dianomi/docs/welcome.html', subtitle: 'How to use this site', section: 'Docs' }
      ]
    }

  }

};
