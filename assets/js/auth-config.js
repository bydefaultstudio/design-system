/**
 * Auth Configuration
 * Role-to-page mapping for Netlify Identity authentication.
 *
 * Access levels (lowest to highest):
 *   public  — no login required
 *   client  — requires client role or higher
 *   team    — requires team role or higher (default)
 *   admin   — requires admin role only
 *
 * @version 1.0.0
 * @author By Default
 */

//------- Role Hierarchy -------//

var AUTH_CONFIG = {

  // Ordered from lowest to highest privilege
  roleHierarchy: ['public', 'client', 'team', 'admin'],

  //------- Page Access Map -------//
  // Key: page path relative to site root
  // Value: minimum role required
  // Pages not listed here default to `defaultRole`

  pageRoles: {

    // Public pages (no login required)
    // 'some-page.html': 'public',

    // Client pages (tool UIs only, not doc pages)
    'cpm-calculator/index.html': 'client',
    'svg-cleaner/index.html': 'client',
    'display-ad-preview/index.html': 'client',

    // Admin pages
    'access-control.html': 'admin'

  },

  // Pages not listed above require this role
  defaultRole: 'team',

  // Client folder prefix — pages under these paths
  // are accessible only to the client whose app_metadata.clientFolder matches
  clientFolderPrefix: '/',

  // Page shown when access is denied
  accessDeniedPage: 'access-denied.html',

  //------- Dev Mode -------//
  // Activates automatically on localhost / 127.0.0.1.
  // Skips Netlify Identity and simulates a user with a switchable role.
  // A toolbar at the bottom lets you switch roles to preview all states.

  devMode: {
    // Starting role when dev mode activates (change to test different views)
    defaultRole: 'admin',
    // Simulated user email
    email: 'dev@bydefault.studio',
    // Simulated client folder (used when role is 'client')
    clientFolder: 'dianomi'
  }

};
