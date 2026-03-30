/**
 * Theme Loader
 * Dynamically loads client theme CSS and Google Fonts based on user identity.
 *
 * Called by auth.js after the auth check resolves.
 * Reads theme definitions from THEME_CONFIG (theme-config.js).
 *
 * @version 1.0.0
 * @author By Default
 */

(function () {
  'use strict';

  var THEME_CSS_ID = 'client-theme-css';
  var THEME_FONTS_ID = 'client-theme-fonts';
  var STORAGE_KEY = 'admin-theme-preview';

  //------- Path Resolution -------//

  function getBasePath() {
    var navMount = document.getElementById('site-nav');
    return navMount ? (navMount.getAttribute('data-base') || '') : '';
  }

  //------- Theme Loading -------//

  function loadTheme(themeKey) {
    if (typeof THEME_CONFIG === 'undefined' || !THEME_CONFIG.themes) return;

    var theme = THEME_CONFIG.themes[themeKey];
    if (!theme) {
      console.warn('[Theme] No theme found for key:', themeKey);
      return;
    }

    // Skip if this theme is already loaded
    var currentTheme = document.documentElement.getAttribute('data-client-theme');
    if (currentTheme === themeKey) return;

    // Remove any existing theme first
    unloadTheme();

    var basePath = getBasePath();

    // Inject theme CSS
    var link = document.createElement('link');
    link.id = THEME_CSS_ID;
    link.rel = 'stylesheet';
    link.href = basePath + theme.css;
    document.head.appendChild(link);

    // Inject Google Fonts if specified
    if (theme.fonts) {
      var preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      preconnect1.id = THEME_FONTS_ID + '-preconnect';
      document.head.appendChild(preconnect1);

      var preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      preconnect2.id = THEME_FONTS_ID + '-preconnect2';
      document.head.appendChild(preconnect2);

      var fontsLink = document.createElement('link');
      fontsLink.id = THEME_FONTS_ID;
      fontsLink.rel = 'stylesheet';
      fontsLink.href = theme.fonts;
      document.head.appendChild(fontsLink);
    }

    // Mark the active theme on <html>, update home link and logo
    document.documentElement.setAttribute('data-client-theme', themeKey);
    setHomeLink(themeKey);
    setLogo(themeKey);
    console.log('[Theme] Loaded:', theme.label);
  }

  function unloadTheme() {
    var ids = [THEME_CSS_ID, THEME_FONTS_ID, THEME_FONTS_ID + '-preconnect', THEME_FONTS_ID + '-preconnect2'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.parentNode.removeChild(el);
    });
    document.documentElement.removeAttribute('data-client-theme');
    setHomeLink(null);
    setLogo(null);
  }

  function getAvailableThemes() {
    if (typeof THEME_CONFIG === 'undefined' || !THEME_CONFIG.themes) return {};
    return THEME_CONFIG.themes;
  }

  //------- Logo -------//

  var originalLogoHTML = null;

  function setLogo(clientFolder) {
    var container = document.querySelector('.svg-logo.nav-logo');
    if (!container) return;

    // Save original logo on first call (for restoring later)
    if (!originalLogoHTML) originalLogoHTML = container.innerHTML;

    if (!clientFolder) {
      container.innerHTML = originalLogoHTML;
      return;
    }

    var basePath = getBasePath();
    var logoPath = basePath + 'assets/images/logos/' + clientFolder + '.svg';
    container.innerHTML = '<img src="' + logoPath + '" alt="Logo">';
  }

  //------- Home Link -------//

  function setHomeLink(clientFolder) {
    var basePath = getBasePath();
    var href = clientFolder
      ? basePath + clientFolder + '/index.html'
      : basePath + 'index.html';

    var logoLink = document.querySelector('.site-header-logo-link');
    if (logoLink) logoLink.href = href;

    var homeLinks = document.querySelectorAll('[data-home-link]');
    homeLinks.forEach(function (link) { link.href = href; });
  }

  //------- Sidebar Nav Sections -------//

  var clientNavInjected = false;

  // Toggle icon SVG (matches the nav.js pattern)
  var TOGGLE_ICON = '<span class="nav-toggle-icon">'
    + '<svg width="6" height="6" viewBox="0 0 6 6" fill="none">'
    + '<path d="M3.58943 3L1.28943 0.7L1.98943 0L4.98943 3L1.98943 6L1.28943 5.3L3.58943 3Z" fill="currentColor"/>'
    + '</svg></span>';

  /**
   * Group pages by their section key, preserving order of first appearance.
   * Pages without a section key go into the '' (empty) group.
   */
  function groupPagesBySection(pages) {
    var groups = {};
    var order = [];
    pages.forEach(function (page) {
      var section = page.section || '';
      if (!groups[section]) {
        groups[section] = [];
        order.push(section);
      }
      groups[section].push(page);
    });
    return { groups: groups, order: order };
  }

  /**
   * Build a nav link <li> element.
   */
  function buildNavLink(href, title) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = href;
    a.className = 'nav-link';
    a.innerHTML = '<span>' + title + '</span>';

    // Match against the resolved absolute path (handles ../ prefixes)
    var currentPath = window.location.pathname;
    var resolved = a.href; // browser resolves to absolute URL
    var resolvedPath = new URL(resolved, window.location.href).pathname;
    if (currentPath === resolvedPath) {
      a.classList.add('nav-link-active');
      a.setAttribute('aria-current', 'page');
    }

    li.appendChild(a);
    return li;
  }

  /**
   * Build a collapsible <details> nav section with links.
   * @param {string} label — section heading
   * @param {HTMLElement[]} linkItems — array of <li> elements
   * @param {string} clientKey — data-client-nav attribute value
   */
  function buildNavSection(label, linkItems, clientKey) {
    var details = document.createElement('details');
    details.className = 'nav-section';
    if (clientKey) details.setAttribute('data-client-nav', clientKey);

    var summary = document.createElement('summary');
    summary.className = 'nav-section-toggle';
    summary.innerHTML = '<span>' + label + '</span>' + TOGGLE_ICON;
    details.appendChild(summary);

    var ul = document.createElement('ul');
    ul.className = 'nav-list';

    var hasActive = false;
    linkItems.forEach(function (li) {
      if (li.querySelector('.nav-link-active')) hasActive = true;
      ul.appendChild(li);
    });

    if (hasActive) details.setAttribute('open', '');

    details.appendChild(ul);
    return details;
  }

  /**
   * Build tool link items for a client's granted tools.
   */
  function buildToolLinks(toolKeys, basePath) {
    var globalTools = (typeof THEME_CONFIG !== 'undefined' && THEME_CONFIG.tools) ? THEME_CONFIG.tools : {};
    var links = [];
    (toolKeys || []).forEach(function (toolKey) {
      var tool = globalTools[toolKey];
      if (!tool) return;
      links.push(buildNavLink(basePath + toolKey + '/index.html', tool.title));
    });
    return links;
  }

  /**
   * Inject grouped nav sections for a single client into the sidebar.
   * @param {Element} container — sidebar content element
   * @param {object} theme — theme config entry
   * @param {string} clientKey — client folder key
   * @param {string} basePath — base URL prefix
   * @param {string} fallbackLabel — label for pages without a section key
   */
  function injectClientSections(container, theme, clientKey, basePath, fallbackLabel) {
    var pages = theme.pages || [];
    var grouped = groupPagesBySection(pages);

    grouped.order.forEach(function (sectionName) {
      var sectionPages = grouped.groups[sectionName];
      var linkItems = sectionPages.map(function (page) {
        return buildNavLink(basePath + page.href, page.title);
      });

      var label = sectionName || fallbackLabel;
      container.appendChild(buildNavSection(label, linkItems, clientKey));
    });

    // Tools section (auto-generated from tools array)
    var toolLinks = buildToolLinks(theme.tools, basePath);
    if (toolLinks.length > 0) {
      container.appendChild(buildNavSection('Tools', toolLinks, clientKey));
    }
  }

  /**
   * Inject all client nav sections with dividers (for admin/team users).
   */
  function injectClientNavSections() {
    if (clientNavInjected) return;
    if (typeof THEME_CONFIG === 'undefined' || !THEME_CONFIG.themes) return;

    var sidebarContent = document.querySelector('.site-sidebar-content');
    if (!sidebarContent) return;

    var basePath = getBasePath();
    var themeKeys = Object.keys(THEME_CONFIG.themes);
    if (themeKeys.length === 0) return;

    themeKeys.forEach(function (key) {
      var theme = THEME_CONFIG.themes[key];

      // Divider line
      var divider = document.createElement('div');
      divider.className = 'nav-divider';
      sidebarContent.appendChild(divider);

      // Client name label
      var label = document.createElement('div');
      label.className = 'nav-client-label';
      label.textContent = theme.label;
      sidebarContent.appendChild(label);

      // Inject grouped sections (pages without section key use client label)
      injectClientSections(sidebarContent, theme, key, basePath, theme.label);
    });

    clientNavInjected = true;
  }

  /**
   * Inject a single client's nav sections (for client users).
   * No brand name heading, no divider — just their sections.
   */
  function injectSingleClientNavSection(clientFolder) {
    if (typeof THEME_CONFIG === 'undefined' || !THEME_CONFIG.themes) return;
    var theme = THEME_CONFIG.themes[clientFolder];
    if (!theme) return;

    var sidebarContent = document.querySelector('.site-sidebar-content');
    if (!sidebarContent) return;

    var basePath = getBasePath();

    // Inject grouped sections (pages without section key use generic label)
    injectClientSections(sidebarContent, theme, clientFolder, basePath, 'Pages');
  }

  //------- Auth Integration -------//

  function initThemeForUser(user) {
    if (!user) return;

    var metadata = user.app_metadata || {};
    var roles = metadata.roles || [];
    var effectiveRole = roles.length ? roles[0].toLowerCase() : null;

    // Find the highest role (matches getEffectiveRole logic in auth.js)
    if (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.roleHierarchy) {
      var hierarchy = AUTH_CONFIG.roleHierarchy;
      var highest = effectiveRole;
      for (var i = 1; i < roles.length; i++) {
        var r = roles[i].toLowerCase();
        if (hierarchy.indexOf(r) > hierarchy.indexOf(highest)) {
          highest = r;
        }
      }
      effectiveRole = highest;
    }

    // Client users: load their theme, set home link, logo, and inject their nav section
    if (effectiveRole === 'client') {
      var clientFolder = metadata.clientFolder;
      if (clientFolder) {
        setHomeLink(clientFolder);
        setLogo(clientFolder);
        injectSingleClientNavSection(clientFolder);
        if (THEME_CONFIG && THEME_CONFIG.themes[clientFolder]) {
          loadTheme(clientFolder);
        }
        return;
      }
    }

    // Admin users: inject client nav sections + check for persisted theme preview
    if (effectiveRole === 'admin') {
      injectClientNavSections();
      var savedTheme = sessionStorage.getItem(STORAGE_KEY);
      if (savedTheme && THEME_CONFIG && THEME_CONFIG.themes[savedTheme]) {
        loadTheme(savedTheme);
      }
      return;
    }

    // Team users: inject client nav sections, no theme
    if (effectiveRole === 'team') {
      injectClientNavSections();
    }
  }

  //------- Public API -------//

  window.loadTheme = loadTheme;
  window.unloadTheme = unloadTheme;
  window.getAvailableThemes = getAvailableThemes;
  window.initThemeForUser = initThemeForUser;

  console.log('[Theme] v1.0.0 ready');
})();
