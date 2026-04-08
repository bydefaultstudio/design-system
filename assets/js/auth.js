/**
 * Authentication Module
 * Handles login/logout via GoTrue (Netlify Identity API), role-based
 * page gating, element-level visibility, and per-client folder access.
 *
 * On localhost: runs in dev mode with simulated users (no real auth needed).
 * On production: uses GoTrue JS to authenticate against Netlify Identity.
 * Admin users get a role switcher dropdown to preview the site as any role.
 *
 * Auth gating: protected pages redirect to /auth/login.html instead of
 * showing an inline overlay. The login page handles all auth flows
 * (sign in, forgot password, set password via invite/recovery tokens).
 *
 * Requires: auth-config.js (loaded before this script)
 * Requires: gotrue-js UMD (loaded via CDN on production only)
 *
 * @version 3.0.0
 * @author By Default
 */

(function () {
  'use strict';

  console.log('[Auth] v3.0.0 loaded');

  //------- Constants -------//

  var ROLE_HIERARCHY = AUTH_CONFIG.roleHierarchy;
  var DEFAULT_ROLE = AUTH_CONFIG.defaultRole;
  var ACCESS_DENIED_PAGE = AUTH_CONFIG.accessDeniedPage;
  var LOGIN_PAGE = AUTH_CONFIG.loginPage || 'auth/login.html';

  //------- Dev Mode Detection -------//

  var IS_DEV = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  //------- GoTrue Instance -------//

  var gotrueAuth = null;

  function initGoTrue() {
    var GoTrueCtor = window.GoTrue || window.goTrue;
    if (IS_DEV || !GoTrueCtor) return;
    gotrueAuth = new GoTrueCtor({
      APIUrl: window.location.origin + '/.netlify/identity',
      setCookie: true
    });
  }

  //------- Utility Functions -------//

  function getCurrentPagePath() {
    var path = window.location.pathname.replace(/^\/+/, '');
    if (path === '') path = 'index.html';
    return path;
  }

  function getRoleRank(role) {
    var index = ROLE_HIERARCHY.indexOf(role);
    return index === -1 ? -1 : index;
  }

  function getEffectiveRole(roles) {
    if (!roles || !roles.length) return null;
    var highest = null;
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i].toLowerCase();
      if (getRoleRank(r) !== -1) {
        if (highest === null || getRoleRank(r) > getRoleRank(highest)) {
          highest = r;
        }
      }
    }
    // If no recognized hierarchy role found but non-hierarchy roles exist
    // (e.g. ["dianomi"]), treat the user as a client
    if (highest === null && roles.length > 0) {
      highest = 'client';
    }
    return highest;
  }

  /**
   * Derive clientFolder from the roles array.
   * Any role tag that is NOT in the hierarchy (e.g. "dianomi") is treated as
   * the client folder name. This lets admins set roles via the Netlify UI
   * (e.g. tags "client" + "dianomi") without needing the API to set app_metadata.
   */
  function getClientFolderFromRoles(roles) {
    if (!roles || !roles.length) return '';
    for (var i = 0; i < roles.length; i++) {
      var r = roles[i].toLowerCase();
      if (ROLE_HIERARCHY.indexOf(r) === -1) return r;
    }
    return '';
  }

  /**
   * Resolve clientFolder from metadata — uses explicit app_metadata.clientFolder
   * if set, otherwise derives it from the roles array.
   */
  function resolveClientFolder(metadata) {
    if (metadata.clientFolder) return metadata.clientFolder;
    return getClientFolderFromRoles(metadata.roles || []);
  }

  //------- Role Switching (Admin) -------//

  function getActiveRole() {
    var role = sessionStorage.getItem('active-role');
    if (!role || ROLE_HIERARCHY.indexOf(role) === -1) return null;
    return role;
  }

  function getActiveClient() {
    return sessionStorage.getItem('active-client') || '';
  }

  function buildRoleUser(realUser, role) {
    var user = {
      email: realUser.email,
      app_metadata: {
        roles: [role]
      },
      user_metadata: realUser.user_metadata || {}
    };
    if (role === 'client') {
      user.app_metadata.clientFolder = getActiveClient();
    }
    return user;
  }

  function getRequiredRole() {
    // Read from data-access attribute on <body> (set by generator or manually)
    // Supports standard roles ("team") and per-client syntax ("client:blank,dianomi")
    var bodyAccess = document.body.getAttribute('data-access');
    if (bodyAccess && (ROLE_HIERARCHY.indexOf(bodyAccess) !== -1 || bodyAccess.indexOf('client:') === 0)) {
      return bodyAccess;
    }
    return DEFAULT_ROLE;
  }

  function hasAccess(userRole, requiredRole) {
    return getRoleRank(userRole) >= getRoleRank(requiredRole);
  }

  /**
   * Extended access check supporting per-client syntax.
   *
   * Accepted formats:
   *   "team"                → standard hierarchy check
   *   "client:blank"        → client role required, clientFolder must be "blank"
   *   "client:blank,dianomi"→ client role required, clientFolder must match one listed
   *
   * Team and admin always pass (higher in hierarchy than client).
   */
  function hasAccessForValue(userRole, accessValue, user) {
    // Composite access: "admin+client:dianomi" → pass if user matches ANY part
    if (accessValue.indexOf('+') !== -1) {
      var parts = accessValue.split('+');
      for (var i = 0; i < parts.length; i++) {
        if (hasAccessForValue(userRole, parts[i], user)) return true;
      }
      return false;
    }

    // Standard hierarchy role (public, client, team, admin)
    if (ROLE_HIERARCHY.indexOf(accessValue) !== -1) {
      return hasAccess(userRole, accessValue);
    }

    // Per-client syntax: "client:folder1,folder2"
    if (accessValue.indexOf('client:') === 0) {
      // Team and admin always have access
      if (hasAccess(userRole, 'team')) return true;

      // Must be at least client role
      if (!hasAccess(userRole, 'client')) return false;

      // Check if user's clientFolder matches any listed folder
      var allowedFolders = accessValue.substring(7).split(',');
      var metadata = user ? (user.app_metadata || {}) : {};
      var clientFolder = resolveClientFolder(metadata);

      for (var i = 0; i < allowedFolders.length; i++) {
        if (allowedFolders[i].trim() === clientFolder) return true;
      }
      return false;
    }

    // Unknown format — deny
    return false;
  }

  // hasClientFolderAccess removed — access is now enforced entirely via
  // data-access attributes on each page (e.g. "client:dianomi").
  // The hasAccessForValue() check handles all role and client scoping.

  //------- URL & Redirect Helpers -------//

  function getLoginUrl(redirectPath) {
    var base = getBasePrefix();
    var url = base + LOGIN_PAGE;
    if (redirectPath) {
      url += '?redirect=' + encodeURIComponent(redirectPath);
    }
    return url;
  }

  function getBasePrefix() {
    // Determine path depth from site root for relative URLs
    var navEl = document.getElementById('site-nav');
    if (navEl && navEl.getAttribute('data-base')) {
      return navEl.getAttribute('data-base');
    }
    // Fallback: count path segments
    var path = window.location.pathname.replace(/^\/+/, '');
    var segments = path.split('/').length - 1;
    var prefix = '';
    for (var i = 0; i < segments; i++) {
      prefix += '../';
    }
    return prefix;
  }

  function redirectToLogin() {
    var currentPath = getCurrentPagePath();
    window.location.href = getLoginUrl(currentPath);
  }

  function getRedirectTarget() {
    var params = new URLSearchParams(window.location.search);
    var target = params.get('redirect');
    if (!target) return null;
    // Ensure absolute path so it resolves from root, not from /auth/
    if (target.charAt(0) !== '/') target = '/' + target;
    return target;
  }

  //------- Hash Token Parsing -------//

  function parseHashTokens() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return null;

    var params = {};
    hash.substring(1).split('&').forEach(function (part) {
      var pair = part.split('=');
      if (pair.length === 2) {
        params[pair[0]] = decodeURIComponent(pair[1]);
      }
    });

    if (params.invite_token) return { type: 'invite', token: params.invite_token };
    if (params.recovery_token) return { type: 'recovery', token: params.recovery_token };
    if (params.confirmation_token) return { type: 'confirmation', token: params.confirmation_token };
    if (params.access_token) return { type: 'access', token: params.access_token };
    return null;
  }

  function clearHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = '';
    }
  }

  //------- UI Functions -------//

  var contentShown = false;

  function showContent() {
    if (contentShown) return;
    contentShown = true;
    document.body.classList.remove('auth-loading');
    document.body.classList.add('auth-ready');
  }

  // Safety: always show content within 2 seconds, even if theme CSS fails to load
  setTimeout(showContent, 2000);

  function redirectAccessDenied() {
    var currentPage = getCurrentPagePath();
    if (currentPage === ACCESS_DENIED_PAGE) {
      showContent();
      return;
    }
    var base = getBasePrefix();
    window.location.href = base + ACCESS_DENIED_PAGE;
  }

  function setRoleClass(role) {
    ROLE_HIERARCHY.forEach(function (r) {
      document.body.classList.remove('auth-role-' + r);
    });
    if (role) {
      var rank = getRoleRank(role);
      ROLE_HIERARCHY.forEach(function (r) {
        if (getRoleRank(r) <= rank) {
          document.body.classList.add('auth-role-' + r);
        }
      });
    }
  }

  function filterNavLinks(userRole, user) {
    // Filter nav links by checking data-access on linked pages (if available)
    // For now, nav filtering relies on nav-link data attributes
    var navLinks = document.querySelectorAll('.nav-link[data-access]');
    navLinks.forEach(function (link) {
      var requiredAccess = link.getAttribute('data-access');
      if (requiredAccess && !hasAccessForValue(userRole, requiredAccess, user)) {
        var li = link.closest('li');
        if (li) li.style.display = 'none';
      }
    });

    var docCards = document.querySelectorAll('.card[data-access]');
    docCards.forEach(function (card) {
      var requiredAccess = card.getAttribute('data-access');
      if (requiredAccess && !hasAccessForValue(userRole, requiredAccess, user)) {
        card.style.display = 'none';
      }
    });

    var navSections = document.querySelectorAll('.nav-section');
    navSections.forEach(function (section) {
      // Check section-level access first
      var sectionAccess = section.getAttribute('data-access');
      if (sectionAccess && !hasAccessForValue(userRole, sectionAccess, user)) {
        section.style.display = 'none';
        return;
      }
      // Fallback: hide if all child links are hidden
      var visibleLinks = section.querySelectorAll('li');
      var allHidden = true;
      visibleLinks.forEach(function (li) {
        if (li.style.display !== 'none') allHidden = false;
      });
      if (allHidden) section.style.display = 'none';
    });

    var docSections = document.querySelectorAll('.docs-section');
    docSections.forEach(function (section) {
      // Check section-level access first
      var docSectionAccess = section.getAttribute('data-access');
      if (docSectionAccess && !hasAccessForValue(userRole, docSectionAccess, user)) {
        section.style.display = 'none';
        return;
      }
      // Fallback: hide if all child cards are hidden
      var visibleCards = section.querySelectorAll('.card');
      var allHidden = true;
      visibleCards.forEach(function (card) {
        if (card.style.display !== 'none') allHidden = false;
      });
      if (allHidden) section.style.display = 'none';
    });
  }

  //------- Login Page Forms -------//

  function isLoginPage() {
    var path = getCurrentPagePath();
    return path === LOGIN_PAGE || path === 'auth/login.html';
  }

  function showLoginOverlay() {
    // Legacy support: if a login overlay exists on the page, show it
    var overlay = document.getElementById('login-overlay');
    if (overlay) {
      overlay.classList.add('is-visible');
      var emailInput = document.getElementById('login-email');
      if (emailInput) emailInput.focus();
      return;
    }
    // Otherwise redirect to login page
    if (!isLoginPage()) {
      redirectToLogin();
    }
  }

  function hideLoginOverlay() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.remove('is-visible');
  }

  function showLoginError(message) {
    var errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearLoginError() {
    var errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function hideEl(el) { if (el) el.classList.add('is-hidden'); }
  function showEl(el) { if (el) el.classList.remove('is-hidden'); }

  function showSetPasswordForm(titleText, subtitleText, options) {
    var opts = options || {};
    var form = document.getElementById('login-form');
    var forgotBtn = document.getElementById('login-forgot-btn');
    var resetForm = document.getElementById('login-reset-form');
    var setPasswordForm = document.getElementById('login-set-password-form');
    var nameGroup = document.getElementById('set-password-name-group');
    var title = document.getElementById('login-title');
    var subtitle = document.getElementById('login-subtitle');

    hideEl(form);
    hideEl(forgotBtn);
    hideEl(resetForm);
    showEl(setPasswordForm);
    if (opts.showName) { showEl(nameGroup); } else { hideEl(nameGroup); }
    if (title) title.textContent = titleText || 'Set Your Password';
    if (subtitle) subtitle.textContent = subtitleText || 'Choose a secure password for your account.';

    if (opts.showName) {
      var nameInput = document.getElementById('set-password-name');
      if (nameInput) nameInput.focus();
    } else {
      var newPwInput = document.getElementById('set-password-new');
      if (newPwInput) newPwInput.focus();
    }
  }

  function hideSetPasswordForm() {
    var form = document.getElementById('login-form');
    var forgotBtn = document.getElementById('login-forgot-btn');
    var setPasswordForm = document.getElementById('login-set-password-form');
    var title = document.getElementById('login-title');
    var subtitle = document.getElementById('login-subtitle');

    hideEl(setPasswordForm);
    if (form) { showEl(form); form.reset(); }
    showEl(forgotBtn);
    if (title) title.textContent = 'Welcome to BrandOS';
    if (subtitle) subtitle.textContent = 'Sign in to access your dashboard';

    var newPw = document.getElementById('set-password-new');
    var confirmPw = document.getElementById('set-password-confirm');
    var errEl = document.getElementById('set-password-error');
    var successEl = document.getElementById('set-password-success');
    if (newPw) newPw.value = '';
    if (confirmPw) confirmPw.value = '';
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    if (successEl) { successEl.textContent = ''; successEl.style.display = 'none'; }
  }

  function initSetPasswordFormHandler(submitAction) {
    var submitBtn = document.getElementById('set-password-submit-btn');
    var backBtn = document.getElementById('set-password-back-btn');
    var errEl = document.getElementById('set-password-error');
    var successEl = document.getElementById('set-password-success');

    if (!submitBtn) return;

    // Clone and replace to remove previous event listeners
    var newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

    var newBackBtn = backBtn ? backBtn.cloneNode(true) : null;
    if (backBtn && newBackBtn) {
      backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    }

    newSubmitBtn.addEventListener('click', function () {
      var nameInput = document.getElementById('set-password-name');
      var nameGroup = document.getElementById('set-password-name-group');
      var nameVisible = nameGroup && !nameGroup.classList.contains('is-hidden');
      var name = nameVisible && nameInput ? nameInput.value.trim() : '';
      var newPw = document.getElementById('set-password-new').value;
      var confirmPw = document.getElementById('set-password-confirm').value;

      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      if (successEl) { successEl.textContent = ''; successEl.style.display = 'none'; }

      if (!newPw || !confirmPw) {
        if (errEl) { errEl.textContent = 'Please fill in both fields.'; errEl.style.display = 'block'; }
        return;
      }
      if (newPw.length < 8) {
        if (errEl) { errEl.textContent = 'Password must be at least 8 characters.'; errEl.style.display = 'block'; }
        return;
      }
      if (newPw !== confirmPw) {
        if (errEl) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; }
        return;
      }

      newSubmitBtn.disabled = true;
      newSubmitBtn.textContent = 'Setting password...';

      submitAction(newPw, name)
        .then(function () {
          if (successEl) {
            successEl.textContent = 'Password set! Redirecting...';
            successEl.style.display = 'block';
          }
          setTimeout(function () {
            var redirect = getRedirectTarget();
            window.location.href = redirect ? redirect : '/';
          }, 1500);
        })
        .catch(function (err) {
          var message = 'Could not set password. The link may have expired.';
          if (err && err.json && err.json.error_description) {
            message = err.json.error_description;
          }
          if (errEl) { errEl.textContent = message; errEl.style.display = 'block'; }
          newSubmitBtn.disabled = false;
          newSubmitBtn.textContent = 'Set password';
        });
    });

    if (newBackBtn) {
      newBackBtn.addEventListener('click', function () {
        hideSetPasswordForm();
      });
    }
  }

  function initLoginForm() {
    var form = document.getElementById('login-form');
    var forgotBtn = document.getElementById('login-forgot-btn');
    var resetForm = document.getElementById('login-reset-form');
    var resetBackBtn = document.getElementById('reset-back-btn');
    var resetSubmitBtn = document.getElementById('reset-submit-btn');

    if (!form) return;

    // Login form submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearLoginError();

      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;

      if (!email || !password) {
        showLoginError('Please enter your email and password.');
        return;
      }

      var submitBtn = form.querySelector('.login-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      if (IS_DEV) {
        setTimeout(function () {
          var devConfig = AUTH_CONFIG.devMode || {};
          sessionStorage.setItem('active-role', devConfig.defaultRole || 'admin');
          var redirect = getRedirectTarget();
          window.location.href = redirect ? redirect : '/';
        }, 500);
        return;
      }

      if (!gotrueAuth) {
        showLoginError('Authentication service not available.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log in';
        return;
      }

      gotrueAuth.login(email, password, true)
        .then(function () {
          var redirect = getRedirectTarget();
          window.location.href = redirect ? redirect : '/';
        })
        .catch(function (err) {
          var message = 'Invalid email or password.';
          if (err && err.json && err.json.error_description) {
            message = err.json.error_description;
          }
          showLoginError(message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Log in';
        });
    });

    // Forgot password toggle
    if (forgotBtn && resetForm) {
      forgotBtn.addEventListener('click', function () {
        hideEl(form);
        hideEl(forgotBtn);
        showEl(resetForm);
        var resetEmail = document.getElementById('reset-email');
        if (resetEmail) resetEmail.focus();
      });
    }

    // Back to login
    if (resetBackBtn) {
      resetBackBtn.addEventListener('click', function () {
        showEl(form);
        showEl(forgotBtn);
        hideEl(resetForm);
        var resetError = document.getElementById('reset-error');
        var resetSuccess = document.getElementById('reset-success');
        if (resetError) { resetError.textContent = ''; resetError.style.display = 'none'; }
        if (resetSuccess) { resetSuccess.textContent = ''; resetSuccess.style.display = 'none'; }
      });
    }

    // Password reset submit
    if (resetSubmitBtn) {
      resetSubmitBtn.addEventListener('click', function () {
        var resetEmail = document.getElementById('reset-email').value.trim();
        var resetError = document.getElementById('reset-error');
        var resetSuccess = document.getElementById('reset-success');

        if (!resetEmail) {
          if (resetError) { resetError.textContent = 'Please enter your email.'; resetError.style.display = 'block'; }
          return;
        }

        resetSubmitBtn.disabled = true;
        resetSubmitBtn.textContent = 'Sending...';

        if (IS_DEV) {
          setTimeout(function () {
            if (resetSuccess) { resetSuccess.textContent = 'Reset link sent! Check your email.'; resetSuccess.style.display = 'block'; }
            if (resetError) { resetError.style.display = 'none'; }
            resetSubmitBtn.disabled = false;
            resetSubmitBtn.textContent = 'Send reset link';
          }, 500);
          return;
        }

        if (!gotrueAuth) {
          if (resetError) { resetError.textContent = 'Authentication service not available.'; resetError.style.display = 'block'; }
          resetSubmitBtn.disabled = false;
          resetSubmitBtn.textContent = 'Send reset link';
          return;
        }

        gotrueAuth.requestPasswordRecovery(resetEmail)
          .then(function () {
            if (resetSuccess) { resetSuccess.textContent = 'Reset link sent! Check your email.'; resetSuccess.style.display = 'block'; }
            if (resetError) { resetError.style.display = 'none'; }
            resetSubmitBtn.disabled = false;
            resetSubmitBtn.textContent = 'Send reset link';
          })
          .catch(function () {
            if (resetError) { resetError.textContent = 'Could not send reset link. Please try again.'; resetError.style.display = 'block'; }
            resetSubmitBtn.disabled = false;
            resetSubmitBtn.textContent = 'Send reset link';
          });
      });
    }
  }

  //------- Auth Button in Sidebar -------//

  //------- Auth Header Dropdown -------//

  var ICON_USER = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M21 22H19V19C19 17.8954 18.1046 17 17 17H7C5.89543 17 5 17.8954 5 19V22H3V15H21V22Z" fill="currentColor"/>'
    + '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.5 2C15.5376 2 18 4.46243 18 7.5C18 10.5376 15.5376 13 12.5 13C9.46243 13 7 10.5376 7 7.5C7 4.46243 9.46243 2 12.5 2ZM12.5 4C10.567 4 9 5.567 9 7.5C9 9.433 10.567 11 12.5 11C14.433 11 16 9.433 16 7.5C16 5.567 14.433 4 12.5 4Z" fill="currentColor"/>'
    + '</svg>';

  var ICON_CHEVRON = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/>'
    + '</svg>';

  var ICON_LOGOUT = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M18 13H7.23922C6.34831 13 5.90214 14.0771 6.53211 14.7071L8.425 16.6L7.025 18.025L1 12L7 5.99999L8.425 7.42499L6.54652 9.29043C5.91317 9.91938 6.35857 11 7.25116 11H18V13Z" fill="currentColor"></path>'
    + '<path d="M10.0378 22V16H12.0378V18C12.0378 19.1046 12.9333 20 14.0378 20H18.0378C19.1424 20 20.0378 19.1046 20.0378 18V6C20.0378 4.89543 19.1424 4 18.0378 4H14.0378C12.9333 4 12.0378 4.89543 12.0378 6V8H10.0378V2H22.0378V22H10.0378Z" fill="currentColor"></path>'
    + '</svg>';

  /**
   * Render the combined account + role switcher dropdown.
   * @param {object|null} user — current user (null = logged out)
   * @param {string|null} activeRole — when set, shows role switcher sections (admin only)
   */
  function renderAuthHeaderDropdown(user, activeRole) {
    var container = document.querySelector('.auth-header-container');
    if (!container) return;

    container.innerHTML = '';

    if (user) {
      var metadata = user.app_metadata || {};
      var userMeta = user.user_metadata || {};
      var roles = metadata.roles || [];
      var displayRole = roles.length ? roles[0] : 'user';
      var fullName = userMeta.full_name || '';
      var email = user.email || '';
      var initial = fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();
      var isAdmin = activeRole !== null && activeRole !== undefined;

      // Resolve toggle label (current role or client name)
      var toggleLabel = displayRole.charAt(0).toUpperCase() + displayRole.slice(1);
      if (isAdmin) {
        var savedClient = getActiveClient();
        if (activeRole === 'client' && savedClient && typeof THEME_CONFIG !== 'undefined' && THEME_CONFIG.themes && THEME_CONFIG.themes[savedClient]) {
          toggleLabel = THEME_CONFIG.themes[savedClient].label;
        } else {
          toggleLabel = activeRole.charAt(0).toUpperCase() + activeRole.slice(1);
        }
      }

      // Dropdown wrapper
      var dropdown = document.createElement('div');
      dropdown.id = 'auth-header-dropdown';
      dropdown.className = 'dropdown';

      // Toggle — user icon + role label + chevron
      var toggle = document.createElement('div');
      toggle.className = 'dropdown-trigger';
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-label', 'Account menu');
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<div class="icn-svg" data-icon="user">' + ICON_USER + '</div>'
        + '<span>' + toggleLabel + '</span>'
        + '<div class="icn-svg dropdown-chevron" data-icon="chevron-down">' + ICON_CHEVRON + '</div>';
      dropdown.appendChild(toggle);

      // Dropdown menu
      var menu = document.createElement('div');
      menu.className = 'dropdown-menu is-right';

      // -- User info section --
      var roleLabel = document.createElement('div');
      roleLabel.className = 'dropdown-label';
      roleLabel.style.textTransform = 'capitalize';
      roleLabel.textContent = 'Role: ' + displayRole;
      menu.appendChild(roleLabel);

      var userInfo = document.createElement('div');
      userInfo.className = 'dropdown-item';
      userInfo.style.pointerEvents = 'none';
      if (fullName) {
        userInfo.innerHTML = '<span class="auth-user-avatar">' + initial + '</span>'
          + '<div><div>' + fullName + '</div>'
          + '<div style="font-size:var(--font-2xs);color:var(--text-faded);">' + email + '</div></div>';
      } else {
        userInfo.innerHTML = '<span class="auth-user-avatar">' + initial + '</span>'
          + '<span>' + email + '</span>';
      }
      menu.appendChild(userInfo);

      // -- Role switcher section (admin only) --
      if (isAdmin) {
        var navMount = document.getElementById('site-nav');
        var basePath = navMount ? (navMount.getAttribute('data-base') || '') : '';

        var ICON_CHECK = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
          + '<path d="M9.55 18L3.85 12.3L5.275 10.875L9.55 15.15L18.725 5.975L20.15 7.4L9.55 18Z" fill="currentColor"/>'
          + '</svg>';

        // Switch Role
        var roleDivider = document.createElement('div');
        roleDivider.className = 'dropdown-divider';
        menu.appendChild(roleDivider);

        var switchLabel = document.createElement('div');
        switchLabel.className = 'dropdown-label';
        switchLabel.textContent = 'Switch Role';
        menu.appendChild(switchLabel);

        function addRoleItem(displayName, isActive, clickFn) {
          var item = document.createElement('div');
          item.className = 'dropdown-item';
          item.setAttribute('role', 'button');
          item.setAttribute('tabindex', '0');

          var icon = document.createElement('div');
          icon.className = 'icn-svg';
          icon.setAttribute('data-icon', 'check');
          if (isActive) {
            icon.innerHTML = ICON_CHECK;
          } else {
            icon.style.display = 'none';
          }
          item.appendChild(icon);

          var text = document.createElement('span');
          text.textContent = displayName;
          item.appendChild(text);

          item.addEventListener('click', clickFn);
          menu.appendChild(item);
        }

        var systemRoles = ['admin', 'team', 'public'];
        systemRoles.forEach(function (role) {
          addRoleItem(role.charAt(0).toUpperCase() + role.slice(1), role === activeRole, function () {
            sessionStorage.setItem('active-role', role);
            sessionStorage.removeItem('active-client');
            if (role === 'public') {
              window.location.reload();
            } else {
              window.location.href = basePath + 'index.html';
            }
          });
        });

        // Switch Client
        if (typeof THEME_CONFIG !== 'undefined' && THEME_CONFIG.themes) {
          var themeKeys = Object.keys(THEME_CONFIG.themes);
          if (themeKeys.length > 0) {
            var clientDivider = document.createElement('div');
            clientDivider.className = 'dropdown-divider';
            menu.appendChild(clientDivider);

            var clientLabel = document.createElement('div');
            clientLabel.className = 'dropdown-label';
            clientLabel.textContent = 'Switch Client';
            menu.appendChild(clientLabel);

            themeKeys.forEach(function (key) {
              var theme = THEME_CONFIG.themes[key];
              var isActive = activeRole === 'client' && savedClient === key;
              addRoleItem(theme.label, isActive, function () {
                sessionStorage.setItem('active-role', 'client');
                sessionStorage.setItem('active-client', key);
                window.location.href = basePath + key + '/index.html';
              });
            });
          }
        }
      }

      // -- Account & Logout section --
      var accountDivider = document.createElement('div');
      accountDivider.className = 'dropdown-divider';
      menu.appendChild(accountDivider);

      var navMountForAccount = document.getElementById('site-nav');
      var basePathForAccount = navMountForAccount ? (navMountForAccount.getAttribute('data-base') || '') : '';
      var accountLink = document.createElement('a');
      accountLink.className = 'dropdown-item';
      accountLink.href = basePathForAccount + 'auth/account.html';
      accountLink.innerHTML = '<div class="icn-svg" data-icon="settings">'
        + '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        + '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10Z" fill="currentColor"/>'
        + '<path fill-rule="evenodd" clip-rule="evenodd" d="M15.1504 5.2002C15.3669 5.28349 15.5712 5.38341 15.7627 5.5C15.9543 5.61664 16.1419 5.74171 16.3252 5.875L19.2998 4.625L22.0498 9.375L19.4746 11.3252C19.4912 11.4417 19.5 11.5539 19.5 11.6621V12.3379C19.5 12.446 19.4834 12.5584 19.4502 12.6748L22.0254 14.625L19.2754 19.375L16.3252 18.125C16.1419 18.2583 15.95 18.3833 15.75 18.5C15.5501 18.6166 15.3502 18.7165 15.1504 18.7998L14.75 22H9.25L8.84961 18.7998C8.63308 18.7165 8.42886 18.6166 8.2373 18.5C8.04568 18.3834 7.8581 18.2583 7.6748 18.125L4.7002 19.375L1.9502 14.625L4.52539 12.6748C4.50876 12.5583 4.50002 12.4461 4.5 12.3379V11.6621C4.50002 11.5539 4.50876 11.4417 4.52539 11.3252L1.9502 9.375L4.7002 4.625L7.6748 5.875C7.85814 5.74167 8.05 5.61667 8.25 5.5C8.44987 5.38341 8.64974 5.28349 8.84961 5.2002L9.25 2H14.75L15.1504 5.2002ZM10.6748 6.65039C10.1582 6.78372 9.67891 6.97901 9.2373 7.2373C8.79577 7.49556 8.39197 7.80828 8.02539 8.1748L5.5498 7.15039L4.5752 8.84961L6.72461 10.4502C6.64133 10.7001 6.58313 10.9503 6.5498 11.2002C6.51649 11.4501 6.5 11.7167 6.5 12C6.5 12.2667 6.51647 12.5254 6.5498 12.7754C6.58315 13.0253 6.64132 13.2755 6.72461 13.5254L4.5752 15.1504L5.5498 16.8496L8.02539 15.7998C8.39202 16.1831 8.79569 16.5044 9.2373 16.7627C9.67891 17.021 10.1582 17.2163 10.6748 17.3496L11 20H12.9746L13.3252 17.3496C13.8417 17.2163 14.3211 17.021 14.7627 16.7627C15.2042 16.5044 15.608 16.1917 15.9746 15.8252L18.4502 16.8496L19.4248 15.1504L17.2754 13.5254C17.3587 13.2921 17.4169 13.0454 17.4502 12.7871C17.4835 12.5289 17.5 12.2665 17.5 12C17.5 11.7335 17.4835 11.4711 17.4502 11.2129C17.4169 10.9546 17.3587 10.7079 17.2754 10.4746L19.4248 8.84961L18.4502 7.15039L15.9746 8.2002C15.608 7.81692 15.2043 7.49561 14.7627 7.2373C14.3211 6.97903 13.8417 6.78372 13.3252 6.65039L13 4H11.0254L10.6748 6.65039Z" fill="currentColor"/>'
        + '</svg></div>'
        + '<span>Account</span>';
      menu.appendChild(accountLink);

      var logoutItem = document.createElement('div');
      logoutItem.className = 'dropdown-item';
      logoutItem.setAttribute('role', 'button');
      logoutItem.setAttribute('tabindex', '0');
      logoutItem.innerHTML = '<div class="icn-svg" data-icon="logout">' + ICON_LOGOUT + '</div>'
        + '<span>Log out</span>';
      logoutItem.addEventListener('click', function () {
        sessionStorage.removeItem('active-role');
        sessionStorage.removeItem('active-client');
        if (IS_DEV) {
          sessionStorage.setItem('active-role', 'logged-out');
          window.location.reload();
        } else {
          handleLogout();
        }
      });
      menu.appendChild(logoutItem);

      dropdown.appendChild(menu);

      // Toggle open/close handled by dropdown.js

      container.appendChild(dropdown);

    } else {
      // Logged out: show login link on protected pages only
      var requiredRole = getRequiredRole();
      if (requiredRole !== 'public') {
        var loginLink = document.createElement('a');
        loginLink.className = 'header-link';
        loginLink.href = LOGIN_PAGE;
        loginLink.innerHTML = '<div class="icn-svg" data-icon="user">' + ICON_USER + '</div>'
          + '<span>Log in</span>';
        container.appendChild(loginLink);
      }
    }
  }

  //------- Auth Handlers -------//

  function handleLogout() {
    if (gotrueAuth) {
      var user = gotrueAuth.currentUser();
      if (user) {
        user.logout()
          .then(function () {
            window.location.href = '/';
          })
          .catch(function () {
            window.location.href = '/';
          });
        return;
      }
    }
    window.location.href = '/';
  }

  //------- Hash Token Handler -------//

  function handleHashTokens() {
    var tokenInfo = parseHashTokens();
    if (!tokenInfo) return false;

    clearHash();

    // If we're not on the login page, redirect there with the token
    if (!isLoginPage()) {
      var base = getBasePrefix();
      window.location.href = base + LOGIN_PAGE + '#' + tokenInfo.type + '_token=' + encodeURIComponent(tokenInfo.token);
      return true;
    }

    if (!gotrueAuth) {
      console.warn('[Auth] Token in URL but GoTrue not available');
      showLoginError('Authentication service not available. Please try again later.');
      return true;
    }

    // Invite token — accept invitation and set password
    if (tokenInfo.type === 'invite') {
      showSetPasswordForm('Accept Invitation', 'Create a password to activate your account.', { showName: true });
      initSetPasswordFormHandler(function (password, name) {
        return gotrueAuth.acceptInvite(tokenInfo.token, password, true)
          .then(function (user) {
            if (name) return user.update({ data: { full_name: name } });
            return user;
          });
      });
      return true;
    }

    // Recovery token — reset password
    if (tokenInfo.type === 'recovery') {
      showSetPasswordForm('Reset Password', 'Enter your new password below.');
      initSetPasswordFormHandler(function (password) {
        return gotrueAuth.recover(tokenInfo.token, true).then(function (user) {
          return user.update({ password: password });
        });
      });
      return true;
    }

    // Confirmation token — confirm email
    if (tokenInfo.type === 'confirmation') {
      gotrueAuth.confirm(tokenInfo.token)
        .then(function () {
          var successEl = document.getElementById('login-success');
          if (successEl) {
            successEl.textContent = 'Email confirmed! You can now log in.';
            successEl.style.display = 'block';
          }
        })
        .catch(function () {
          showLoginError('Email confirmation failed. The link may have expired.');
        });
      return true;
    }

    // Access token (OAuth callback) — GoTrue handles automatically, just reload
    if (tokenInfo.type === 'access') {
      var redirect = getRedirectTarget();
      window.location.href = redirect ? redirect : '/';
      return true;
    }

    return false;
  }

  //------- Main Auth Check -------//

  function checkAuth() {
    var requiredRole = getRequiredRole();

    // Public pages: show content once theme is ready (or immediately if no theme)
    if (requiredRole === 'public') {
      if (isAccountPage()) {
        if (gotrueAuth) {
          var accountUser = gotrueAuth.currentUser();
          if (!accountUser) { redirectToLogin(); return; }
        } else {
          redirectToLogin();
          return;
        }
      }
      setRoleClass('public');
      var hasThemeCache = false;
      try { hasThemeCache = !!localStorage.getItem('bdd-client-theme'); } catch (e) {}
      if (gotrueAuth) {
        var user = gotrueAuth.currentUser();
        if (user) {
          var metadata = user.app_metadata || {};
          var userRole = getEffectiveRole(metadata.roles || []);
          var realRole = userRole;
          if (userRole === 'admin') {
            var switchedRole = getActiveRole();
            if (switchedRole) {
              user = buildRoleUser(user, switchedRole);
              userRole = switchedRole;
            }
          }
          setRoleClass(userRole);
          renderAuthHeaderDropdown(user, realRole === 'admin' ? userRole : null);
          initAccountPage(user);
          filterNavLinks(userRole, user);
          if (typeof initThemeForUser === 'function') {
            initThemeForUser(user, function () { showContent(); });
          } else {
            showContent();
          }
        } else {
          renderAuthHeaderDropdown(null);
          showContent();
        }
      } else {
        renderAuthHeaderDropdown(null);
        showContent();
      }
      return;
    }

    // Protected page: check for current user
    if (!gotrueAuth) {
      console.warn('[Auth] GoTrue not available — redirecting to login');
      redirectToLogin();
      return;
    }

    var user = gotrueAuth.currentUser();
    if (!user) {
      redirectToLogin();
      return;
    }

    var metadata = user.app_metadata || {};
    var userRole = getEffectiveRole(metadata.roles || []);
    if (!userRole) {
      renderAuthHeaderDropdown(user);
      redirectAccessDenied();
      return;
    }

    var realRole = userRole;
    if (userRole === 'admin') {
      var switchedRole = getActiveRole();
      if (switchedRole) {
        user = buildRoleUser(user, switchedRole);
        userRole = switchedRole;
      }
    }

    var adminActiveRole = realRole === 'admin' ? userRole : null;

    if (!hasAccessForValue(userRole, requiredRole, user)) {
      renderAuthHeaderDropdown(user, adminActiveRole);
      setRoleClass(userRole);
      redirectAccessDenied();
      return;
    }

    // Access granted
    setRoleClass(userRole);
    renderAuthHeaderDropdown(user, adminActiveRole);
    filterNavLinks(userRole, user);
    initAccountPage(user);
    if (typeof initThemeForUser === 'function') {
      initThemeForUser(user, function () { showContent(); });
    } else {
      showContent();
    }
  }

  //------- Login Page Auth Check -------//

  function checkLoginPageAuth() {
    // If user is already logged in and lands on login page, redirect away
    if (!gotrueAuth) return;

    var user = gotrueAuth.currentUser();
    if (user) {
      var redirect = getRedirectTarget();
      window.location.href = redirect ? redirect : '/';
    }
  }

  //------- Account Page -------//

  function isAccountPage() {
    return document.body.getAttribute('data-page') === 'account';
  }

  function initAccountPage(user) {
    if (!isAccountPage()) return;

    var userMeta = user.user_metadata || {};
    var metadata = user.app_metadata || {};
    var roles = metadata.roles || [];
    var displayRole = roles.length ? roles[0] : 'user';

    // Populate read-only fields
    var emailEl = document.getElementById('account-email');
    var roleEl = document.getElementById('account-role');
    if (emailEl) emailEl.value = user.email || '';
    if (roleEl) roleEl.value = displayRole;

    // Populate name
    var nameEl = document.getElementById('account-name');
    if (nameEl) nameEl.value = userMeta.full_name || '';

    // Profile save
    var profileSaveBtn = document.getElementById('account-profile-save');
    var profileErr = document.getElementById('account-profile-error');
    var profileSuccess = document.getElementById('account-profile-success');

    if (profileSaveBtn) {
      profileSaveBtn.addEventListener('click', function () {
        var name = nameEl ? nameEl.value.trim() : '';
        if (profileErr) { profileErr.textContent = ''; profileErr.style.display = 'none'; }
        if (profileSuccess) { profileSuccess.textContent = ''; profileSuccess.style.display = 'none'; }

        profileSaveBtn.disabled = true;
        profileSaveBtn.textContent = 'Saving...';

        var saveAction;
        if (IS_DEV) {
          saveAction = new Promise(function (resolve) {
            setTimeout(function () {
              if (name) sessionStorage.setItem('auth-dev-name', name);
              resolve();
            }, 500);
          });
        } else {
          saveAction = user.update({ data: { full_name: name } });
        }

        saveAction
          .then(function () {
            if (profileSuccess) {
              profileSuccess.textContent = 'Name updated.';
              profileSuccess.style.display = 'block';
            }
            profileSaveBtn.disabled = false;
            profileSaveBtn.textContent = 'Save name';
          })
          .catch(function () {
            if (profileErr) {
              profileErr.textContent = 'Could not update name. Please try again.';
              profileErr.style.display = 'block';
            }
            profileSaveBtn.disabled = false;
            profileSaveBtn.textContent = 'Save name';
          });
      });
    }

    // Password save
    var passwordSaveBtn = document.getElementById('account-password-save');
    var passwordErr = document.getElementById('account-password-error');
    var passwordSuccess = document.getElementById('account-password-success');
    var newPwEl = document.getElementById('account-new-password');
    var confirmPwEl = document.getElementById('account-confirm-password');

    if (passwordSaveBtn) {
      passwordSaveBtn.addEventListener('click', function () {
        var newPw = newPwEl ? newPwEl.value : '';
        var confirmPw = confirmPwEl ? confirmPwEl.value : '';

        if (passwordErr) { passwordErr.textContent = ''; passwordErr.style.display = 'none'; }
        if (passwordSuccess) { passwordSuccess.textContent = ''; passwordSuccess.style.display = 'none'; }

        if (!newPw || !confirmPw) {
          if (passwordErr) { passwordErr.textContent = 'Please fill in both fields.'; passwordErr.style.display = 'block'; }
          return;
        }
        if (newPw.length < 8) {
          if (passwordErr) { passwordErr.textContent = 'Password must be at least 8 characters.'; passwordErr.style.display = 'block'; }
          return;
        }
        if (newPw !== confirmPw) {
          if (passwordErr) { passwordErr.textContent = 'Passwords do not match.'; passwordErr.style.display = 'block'; }
          return;
        }

        passwordSaveBtn.disabled = true;
        passwordSaveBtn.textContent = 'Updating...';

        var saveAction;
        if (IS_DEV) {
          saveAction = new Promise(function (resolve) {
            setTimeout(resolve, 500);
          });
        } else {
          saveAction = user.update({ password: newPw });
        }

        saveAction
          .then(function () {
            if (passwordSuccess) {
              passwordSuccess.textContent = 'Password updated.';
              passwordSuccess.style.display = 'block';
            }
            if (newPwEl) newPwEl.value = '';
            if (confirmPwEl) confirmPwEl.value = '';
            passwordSaveBtn.disabled = false;
            passwordSaveBtn.textContent = 'Update password';
          })
          .catch(function () {
            if (passwordErr) {
              passwordErr.textContent = 'Could not update password. Please try again.';
              passwordErr.style.display = 'block';
            }
            passwordSaveBtn.disabled = false;
            passwordSaveBtn.textContent = 'Update password';
          });
      });
    }
  }

  //------- Dev Mode -------//

  function createDevUser(role) {
    var devConfig = AUTH_CONFIG.devMode || {};
    var email = devConfig.email || 'dev@localhost';
    var devName = sessionStorage.getItem('auth-dev-name') || 'Dev User';
    var user = {
      email: email,
      app_metadata: {
        roles: [role]
      },
      user_metadata: {
        full_name: devName
      }
    };
    if (role === 'client') {
      var savedClientFolder = getActiveClient();
      user.app_metadata.clientFolder = savedClientFolder || devConfig.clientFolder || '';
    }
    return user;
  }

  function initDevMode() {
    console.log('[Auth] Dev mode active (localhost detected)');

    var devConfig = AUTH_CONFIG.devMode || {};
    var savedRole = sessionStorage.getItem('active-role');
    var activeRole = savedRole || devConfig.defaultRole || 'admin';

    initLoginForm();

    // Dev user for header dropdown on login/token pages
    var loginDevUser = createDevUser(activeRole);

    // On the login page in dev mode
    if (isLoginPage()) {
      // Handle hash tokens in dev mode (simulate)
      var tokenInfo = parseHashTokens();
      if (tokenInfo) {
        clearHash();
        if (tokenInfo.type === 'invite') {
          showSetPasswordForm('Accept Invitation', 'Create a password to activate your account.', { showName: true });
          initSetPasswordFormHandler(function (password, name) {
            return new Promise(function (resolve) {
              setTimeout(function () {
                if (name) sessionStorage.setItem('auth-dev-name', name);
                sessionStorage.setItem('active-role', devConfig.defaultRole || 'admin');
                resolve();
              }, 500);
            });
          });
          renderAuthHeaderDropdown(loginDevUser, activeRole);
          return;
        }
        if (tokenInfo.type === 'recovery') {
          showSetPasswordForm('Reset Password', 'Enter your new password below.');
          initSetPasswordFormHandler(function () {
            return new Promise(function (resolve) {
              setTimeout(function () {
                resolve();
              }, 500);
            });
          });
          renderAuthHeaderDropdown(loginDevUser, activeRole);
          return;
        }
        if (tokenInfo.type === 'confirmation') {
          var successEl = document.getElementById('login-success');
          if (successEl) {
            successEl.textContent = 'Email confirmed! You can now log in.';
            successEl.style.display = 'block';
          }
          showContent();
          renderAuthHeaderDropdown(loginDevUser, activeRole);
          return;
        }
      }

      // Handle #forgot hash (dev shortcut)
      if (window.location.hash === '#forgot') {
        clearHash();
        var form = document.getElementById('login-form');
        var forgotBtn = document.getElementById('login-forgot-btn');
        var resetForm = document.getElementById('login-reset-form');
        var title = document.getElementById('login-title');
        var subtitle = document.getElementById('login-subtitle');
        hideEl(form);
        hideEl(forgotBtn);
        showEl(resetForm);
        if (title) title.textContent = 'Forgot Password';
        if (subtitle) subtitle.textContent = 'Enter your email to receive a reset link.';
        showContent();
        renderAuthHeaderDropdown(loginDevUser, activeRole);
        return;
      }

      // If logged in, redirect away from login page
      if (activeRole !== 'logged-out') {
        var redirect = getRedirectTarget();
        if (redirect) {
          window.location.href = redirect;
          return;
        }
      }
      showContent();
      renderAuthHeaderDropdown(loginDevUser, activeRole);
      return;
    }

    // Logged-out state: redirect to login
    if (activeRole === 'logged-out') {
      var requiredRole = getRequiredRole();
      if (requiredRole !== 'public' || isAccountPage()) {
        renderAuthHeaderDropdown(null);
        redirectToLogin();
        return;
      }
      renderAuthHeaderDropdown(null);
      showContent();
      return;
    }

    // Simulate a logged-in user
    var devUser = createDevUser(activeRole);
    var requiredRole = getRequiredRole();

    setRoleClass(activeRole);

    if (requiredRole !== 'public' && !hasAccessForValue(activeRole, requiredRole, devUser)) {
      renderAuthHeaderDropdown(devUser, activeRole);
      redirectAccessDenied();
      return;
    }

    renderAuthHeaderDropdown(devUser, activeRole);
    filterNavLinks(activeRole, devUser);
    initAccountPage(devUser);
    if (typeof initThemeForUser === 'function') {
      initThemeForUser(devUser, function () { showContent(); });
    } else {
      showContent();
    }
  }

  //------- Initialise -------//

  function initAuth() {
    if (IS_DEV) {
      initDevMode();
      return;
    }

    initLoginForm();

    // GoTrue loads async via ESM import — may already be available or not yet
    function runWithGoTrue() {
      initGoTrue();

      // Handle Netlify Identity hash tokens (invite, recovery, confirmation, OAuth)
      var handledToken = handleHashTokens();
      if (handledToken) return;

      // On login page: check if already logged in
      if (isLoginPage()) {
        checkLoginPageAuth();
        showContent();
        return;
      }

      checkAuth();
    }

    // Wait for GoTrue to load via the Promise-based loader in <head>
    var hasRun = false;
    function runOnce() {
      if (hasRun) return;
      hasRun = true;
      runWithGoTrue();
    }

    if (window._gotrueReady) {
      window._gotrueReady.then(runOnce).catch(function () { runOnce(); });
      // Fallback: if import hangs (CDN blocked, slow network), proceed after 5s
      setTimeout(function () {
        if (!hasRun) {
          console.warn('[Auth] GoTrue load timeout — proceeding without auth');
          runOnce();
        }
      }, 5000);
    } else {
      // No loader present (dev mode or missing script) — run immediately
      runOnce();
    }
  }

  //------- Boot -------//

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
