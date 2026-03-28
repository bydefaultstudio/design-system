/**
 * Auth Configuration
 * Role hierarchy and settings for Netlify Identity authentication.
 *
 * Access levels (lowest to highest):
 *   public  — no login required
 *   client  — requires client role or higher
 *   team    — requires team role or higher (default)
 *   admin   — requires admin role only
 *
 * Page access is controlled via data-access attribute on <body>,
 * set either by the docs generator (from frontmatter) or manually
 * on standalone HTML pages.
 *
 * @version 2.0.0
 * @author By Default
 */

//------- Role Hierarchy -------//

var AUTH_CONFIG = {

  // Ordered from lowest to highest privilege
  roleHierarchy: ['public', 'client', 'team', 'admin'],

  // Pages without a data-access attribute default to this role
  defaultRole: 'team',

  // Standalone login page (relative to site root)
  loginPage: 'auth/login.html',

  // Page shown when access is denied
  accessDeniedPage: 'access-denied.html',

  // Client folder prefix — pages under these paths
  // are accessible only to the client whose app_metadata.clientFolder matches
  clientFolderPrefix: '/',

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
