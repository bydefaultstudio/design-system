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
    'cpm-calculator':     { title: 'CPM Calculator',     subtitle: 'Plan campaign impressions, fees, and payouts' },
    'svg-cleaner':        { title: 'SVG Cleaner',        subtitle: 'Prepare SVGs for the design system' },
    'display-ad-preview': { title: 'Display Ad Preview', subtitle: 'Preview ad creatives across IAB formats and devices' }
  },

  // Map of clientFolder → theme definition
  themes: {

    'client-template': {
      label: 'Client Template',
      description: 'Your brand identity, guidelines, and tools — in one place.',
      css: 'client-template/assets/theme.css',
      fonts: null,
      pages: [
        { title: 'Home', href: 'client-template/index.html' },
        { title: 'Overview', href: 'client-template/docs/index.html', section: 'Docs' },
        { title: 'Overview', href: 'client-template/tools/index.html', section: 'Tools' },
        { title: 'CPM Calculator', href: 'tools/cpm-calculator.html', section: 'Tools' },
        { title: 'Display Ad Preview', href: 'tools/display-ad-preview.html', section: 'Tools' },
        { title: 'Image Placeholder', href: 'tools/image-placeholder.html', section: 'Tools' },
        { title: 'World Clock', href: 'tools/world-clock.html', section: 'Tools' },
        { title: 'Welcome', href: 'client-template/docs/welcome.html', subtitle: 'Your brand system starts here', section: 'Docs' },
        { title: 'Brand Book', href: 'client-template/brand-book.html', subtitle: 'Logo, colour, typography, and interface elements styled with your brand tokens' }
      ]
    },

    'dianomi': {
      label: 'Dianomi',
      description: 'Rich media brand system, tools, and campaign workflows for Dianomi.',
      css: 'dianomi/assets/theme.css',
      fonts: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      pages: [
        { title: 'Home', href: 'dianomi/index.html' },
        { title: 'Overview', href: 'dianomi/docs/index.html', section: 'Docs' },
        { title: 'Overview', href: 'dianomi/tools/index.html', section: 'Tools' },
        { title: 'CPM Calculator', href: 'tools/cpm-calculator.html', section: 'Tools' },
        { title: 'Display Ad Preview', href: 'tools/display-ad-preview.html', section: 'Tools' },
        { title: 'Image Placeholder', href: 'tools/image-placeholder.html', section: 'Tools' },
        { title: 'World Clock', href: 'tools/world-clock.html', section: 'Tools' },
        { title: 'Start Here', href: 'dianomi/docs/welcome.html', subtitle: 'Welcome to Dianomi Interactive', section: 'Docs' },
        { title: 'How To Sell Rich Media', href: 'dianomi/docs/how-to-sell-rich-media.html', subtitle: 'A guide for positioning rich media confidently', section: 'Docs' },
        { title: 'Rich Media Formats & Ad Specs', href: 'dianomi/docs/rich-media-formats.html', subtitle: 'Available formats and creative types', section: 'Docs' },
        { title: 'Rich Media Asset Guidelines', href: 'dianomi/docs/asset-guidelines.html', subtitle: 'Creative asset requirements by format', section: 'Docs' },
        { title: 'The Process', href: 'dianomi/docs/the-process.html', subtitle: 'Campaign workflow from brief to launch', section: 'Docs' },
        { title: 'Working with By Default', href: 'dianomi/docs/working-with-by-default.html', subtitle: 'Why By Default as a rich media partner', section: 'Docs' },
        { title: 'Format Links', href: 'dianomi/docs/format-links.html', subtitle: 'Preview links for all rich media formats', section: 'Docs' },
        { title: 'Publishers & Industries', href: 'dianomi/docs/publishers-industries.html', subtitle: 'Network publishers and industry verticals', section: 'Docs' },
        { title: 'New Campaign Form', href: 'dianomi/docs/new-campaign-form.html', subtitle: 'Submit a new campaign request', section: 'Docs' },
        { title: 'New Proposal Form', href: 'dianomi/docs/new-proposal-form.html', subtitle: 'Submit a new proposal request', section: 'Docs' },
        { title: 'Brand Book', href: 'dianomi/brand-book.html', subtitle: 'Logo, colour, typography, and interface elements styled with your brand tokens' }
      ]
    }

  }

};
