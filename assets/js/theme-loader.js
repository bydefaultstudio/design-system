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
  var CACHE_KEY = 'bdd-client-theme';
  var CACHE_VERSION_KEY = 'bdd-client-theme-version';
  var CACHE_VERSION = '20260407';

  // Invalidate theme cache if deploy version changed
  try {
    if (localStorage.getItem(CACHE_VERSION_KEY) !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
  } catch (e) {}

  //------- Utility -------//

  /**
   * Derive clientFolder from the roles array.
   * Any role tag not in the hierarchy (e.g. "dianomi") is the client folder name.
   */
  function getClientFolderFromRoles(roles) {
    if (!roles || !roles.length) return '';
    var hierarchy = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.roleHierarchy)
      ? AUTH_CONFIG.roleHierarchy
      : ['public', 'client', 'team', 'admin'];
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i].toLowerCase();
      if (hierarchy.indexOf(r) === -1) return r;
    }
    return '';
  }

  //------- Path Resolution -------//

  function getBasePath() {
    var navMount = document.getElementById('site-nav');
    return navMount ? (navMount.getAttribute('data-base') || '') : '';
  }

  //------- Theme Loading -------//

  function loadTheme(themeKey, onReady) {
    if (typeof THEME_CONFIG === 'undefined' || !THEME_CONFIG.themes) {
      if (onReady) onReady();
      return;
    }

    var theme = THEME_CONFIG.themes[themeKey];
    if (!theme) {
      console.warn('[Theme] No theme found for key:', themeKey);
      if (onReady) onReady();
      return;
    }

    // Skip if this theme is already loaded
    var currentTheme = document.documentElement.getAttribute('data-client-theme');
    if (currentTheme === themeKey) {
      // Theme already active (e.g. early-loaded from cache) — check if CSS finished loading
      var existingLink = document.getElementById(THEME_CSS_ID);
      if (existingLink && onReady) {
        if (existingLink.sheet) { onReady(); }
        else {
          existingLink.addEventListener('load', onReady);
          existingLink.addEventListener('error', onReady);
        }
      } else if (onReady) {
        onReady();
      }
      return;
    }

    // Remove any existing theme first (but preserve cache — we'll update it below)
    unloadTheme(true);

    var basePath = getBasePath();

    // Inject theme CSS
    var link = document.createElement('link');
    link.id = THEME_CSS_ID;
    link.rel = 'stylesheet';
    link.href = basePath + theme.css;
    if (onReady) {
      link.addEventListener('load', onReady);
      link.addEventListener('error', onReady);
    }
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

    // Cache theme for early-load on next page visit
    try {
      var cacheValue = themeKey + '|' + theme.css + '|' + (theme.fonts || '');
      localStorage.setItem(CACHE_KEY, cacheValue);
    } catch (e) {}

    console.log('[Theme] Loaded:', theme.label);
  }

  function unloadTheme(preserveCache) {
    var ids = [THEME_CSS_ID, THEME_FONTS_ID, THEME_FONTS_ID + '-preconnect', THEME_FONTS_ID + '-preconnect2'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.parentNode.removeChild(el);
    });
    document.documentElement.removeAttribute('data-client-theme');
    setHomeLink(null);
    setLogo(null);

    // Clear cached theme unless we're about to load a new one
    if (!preserveCache) {
      try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
    }
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
    var logoPath = basePath + clientFolder + '/assets/logo.svg';
    fetch(logoPath)
      .then(function(response) { return response.text(); })
      .then(function(svgText) {
        container.innerHTML = svgText;
      });
  }

  //------- Home Link -------//

  function setHomeLink(clientFolder) {
    var basePath = getBasePath();
    var href = clientFolder
      ? basePath + clientFolder + '/index.html'
      : basePath + 'index.html';

    var logoLink = document.querySelector('.top-nav-logo-link');
    if (logoLink) logoLink.href = href;

    var homeLinks = document.querySelectorAll('[data-home-link]');
    homeLinks.forEach(function (link) { link.href = href; });
  }

  //------- Sidebar Nav Sections -------//

  // Toggle icon SVG (matches the nav.js pattern)
  var TOGGLE_ICON = '<span class="nav-toggle-icon">'
    + '<svg width="6" height="6" viewBox="0 0 6 6" fill="none">'
    + '<path d="M3.58943 3L1.28943 0.7L1.98943 0L4.98943 3L1.98943 6L1.28943 5.3L3.58943 3Z" fill="currentColor"/>'
    + '</svg></span>';

  // Nav icon SVGs (matches nav.js icon pattern)
  var ICON_HOME = '<div class="icn-svg" data-icon="home"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 17C6 18.1046 6.89543 19 8 19H16C17.1046 19 18 18.1046 18 17V10L13.2 6.4C12.4889 5.86667 11.5111 5.86667 10.8 6.4L6 10V17ZM4 21V9L12 3L20 9V21H4Z" fill="currentColor"/></svg></div>';
  var ICON_BRAND_BOOK = '<div class="icn-svg" data-icon="brand-book"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g clip-path="url(#clip0_14540_880)"><path d="M18 6.99953V5.18605L7.45312 6.99953H18ZM3 18.4644L5.30273 19.9995H21V8.99953H5.7998L3 7.83351V18.4644ZM6.91211 5.06203L12 4.188V2.97121L6.91211 5.06203ZM23 6.99953V21.9995H4.69727L1 19.5347V5.32961L14 -0.0121918V3.84425L20 2.813V6.99953H23Z" fill="currentColor"/></g><defs><clipPath id="clip0_14540_880"><rect width="100%" height="100%" fill="white"/></clipPath></defs></svg></div>';
  var ICON_DOCS = '<div class="icn-svg" data-icon="docs"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 21V3H22V21H2ZM4 17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17ZM6 17H15V15H6V17ZM6 13H18V11H6V13ZM6 9H18V7H6V9Z" fill="currentColor"/></svg></div>';
  var ICON_TOOLS = '<div class="icn-svg" data-icon="tools"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.9013 18.1151L16.0763 11.9151H12.0763L12.8013 6.2401L8.17632 12.9151H11.6513L10.9013 18.1151ZM8.35132 21.9151L9.35132 14.9151H4.35132L13.3513 1.9151H15.3513L14.3513 9.9151H20.3513L10.3513 21.9151H8.35132Z" fill="currentColor"/></svg></div>';

  // Icon maps for client sidebar
  var SECTION_ICONS = { 'Docs': ICON_DOCS, 'Tools': ICON_TOOLS };
  var LINK_ICONS = { 'Home': ICON_HOME, 'Brand Book': ICON_BRAND_BOOK };

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
   * Normalize a pathname for comparison: treat /path/ and /path/index.html as equal.
   */
  function normalizePath(p) {
    return p.replace(/\/index\.html$/, '/').replace(/\/$/, '');
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

    // Match against the resolved absolute path (handles ../ prefixes and index.html variants)
    var currentNorm = normalizePath(window.location.pathname);
    var resolvedPath = new URL(a.href, window.location.href).pathname;
    var resolvedNorm = normalizePath(resolvedPath);
    if (currentNorm === resolvedNorm) {
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
  function buildNavSection(label, linkItems, clientKey, iconHref) {
    var details = document.createElement('details');
    details.className = 'nav-section';
    if (clientKey) details.setAttribute('data-client-nav', clientKey);

    var summary = document.createElement('summary');
    summary.className = 'nav-section-toggle';
    var rawIcon = SECTION_ICONS[label] || '';

    // Wrap icon in a link if an overview href is provided
    var iconHtml = '';
    if (rawIcon && iconHref) {
      iconHtml = '<a href="' + iconHref + '" class="nav-section-icon">' + rawIcon + '</a>';
    } else {
      iconHtml = rawIcon;
    }

    summary.innerHTML = iconHtml + '<span>' + label + '</span>' + TOGGLE_ICON;
    details.appendChild(summary);

    // Stop propagation on icon link to prevent details toggle
    var iconLink = summary.querySelector('.nav-section-icon');
    if (iconLink) {
      iconLink.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

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
   * Inject grouped nav sections for a single client into the sidebar.
   * @param {Element} container — sidebar content element
   * @param {object} theme — theme config entry
   * @param {string} clientKey — client folder key
   * @param {string} basePath — base URL prefix
   * @param {string} fallbackLabel — label for pages without a section key
   */
  function injectClientSections(container, theme, clientKey, basePath) {
    // All pages including Tools — tool access is now managed via pages array
    var pages = theme.pages || [];
    var grouped = groupPagesBySection(pages);

    grouped.order.forEach(function (sectionName) {
      var sectionPages = grouped.groups[sectionName];

      // Pages without a section key render as top-level icon links
      if (!sectionName) {
        sectionPages.forEach(function (page) {
          var a = document.createElement('a');
          a.href = basePath + page.href;
          a.className = 'nav-link' + (page.title === 'Home' ? ' nav-home' : '');
          var iconHtml = LINK_ICONS[page.title] || '';
          a.innerHTML = iconHtml + '<span>' + page.title + '</span>';

          // Active link detection (normalize index.html / trailing slash)
          var currentNorm = normalizePath(window.location.pathname);
          var resolvedNorm = normalizePath(new URL(a.href, window.location.href).pathname);
          if (currentNorm === resolvedNorm) {
            a.classList.add('nav-link-active');
            a.setAttribute('aria-current', 'page');
          }

          container.appendChild(a);
        });
      } else {
        // Find overview page href for this section
        var overviewPage = sectionPages.find(function (p) { return p.title === 'Overview'; });
        var iconHref = overviewPage ? basePath + overviewPage.href : '';

        // Sort so Overview is always first
        var sortedPages = sectionPages.slice().sort(function (a, b) {
          if (a.title === 'Overview') return -1;
          if (b.title === 'Overview') return 1;
          return 0;
        });
        var linkItems = sortedPages.map(function (page) {
          return buildNavLink(basePath + page.href, page.title);
        });
        container.appendChild(buildNavSection(sectionName, linkItems, clientKey, iconHref));
      }
    });

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

    // Clear the team sidebar — client sees only their own nav
    sidebarContent.innerHTML = '';

    var basePath = getBasePath();

    injectClientSections(sidebarContent, theme, clientFolder, basePath);
  }

  //------- Auth Integration -------//

  function initThemeForUser(user, onReady) {
    if (!user) {
      unloadTheme();
      if (onReady) onReady();
      return;
    }

    var metadata = user.app_metadata || {};
    var roles = metadata.roles || [];
    var hierarchy = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.roleHierarchy)
      ? AUTH_CONFIG.roleHierarchy
      : ['public', 'client', 'team', 'admin'];

    // Find the highest recognized hierarchy role (matches getEffectiveRole in auth.js)
    var effectiveRole = null;
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i].toLowerCase();
      if (hierarchy.indexOf(r) !== -1) {
        if (effectiveRole === null || hierarchy.indexOf(r) > hierarchy.indexOf(effectiveRole)) {
          effectiveRole = r;
        }
      }
    }
    // Non-hierarchy roles only (e.g. ["dianomi"]) → treat as client
    if (effectiveRole === null && roles.length > 0) {
      effectiveRole = 'client';
    }

    // Client users: load their theme, set home link, logo, and inject their nav section
    if (effectiveRole === 'client') {
      var clientFolder = metadata.clientFolder || getClientFolderFromRoles(roles);
      if (clientFolder) {
        setHomeLink(clientFolder);
        setLogo(clientFolder);
        injectSingleClientNavSection(clientFolder);
        if (THEME_CONFIG && THEME_CONFIG.themes[clientFolder]) {
          loadTheme(clientFolder, onReady);
          return;
        }
      }
      if (onReady) onReady();
      return;
    }

    // Admin users: check for persisted theme preview
    if (effectiveRole === 'admin') {
      var savedTheme = sessionStorage.getItem(STORAGE_KEY);
      if (savedTheme && THEME_CONFIG && THEME_CONFIG.themes[savedTheme]) {
        loadTheme(savedTheme, onReady);
        return;
      }
      // No preview theme — clear any cached/early-loaded theme
      unloadTheme();
      if (onReady) onReady();
      return;
    }

    // Team users: no theme, no client nav
    if (effectiveRole === 'team') {
      unloadTheme();
    }

    if (onReady) onReady();
  }

  //------- Public API -------//

  window.loadTheme = loadTheme;
  window.unloadTheme = unloadTheme;
  window.getAvailableThemes = getAvailableThemes;
  window.initThemeForUser = initThemeForUser;

  console.log('[Theme] v1.0.0 ready');
})();
