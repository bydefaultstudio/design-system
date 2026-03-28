/**
 * Authentication Module
 * Handles login/logout via GoTrue (Netlify Identity API), role-based
 * page gating, element-level visibility, and per-client folder access.
 *
 * On localhost: runs in dev mode with simulated users and a role-switcher toolbar.
 * On production: uses GoTrue JS to authenticate against Netlify Identity.
 *
 * Requires: auth-config.js (loaded before this script)
 * Requires: gotrue-js UMD (loaded via CDN on production only)
 *
 * @version 2.0.0
 * @author By Default
 */

(function () {
  'use strict';

  console.log('[Auth] v2.0.0 loaded');

  //------- Constants -------//

  var ROLE_HIERARCHY = AUTH_CONFIG.roleHierarchy;
  var PAGE_ROLES = AUTH_CONFIG.pageRoles;
  var DEFAULT_ROLE = AUTH_CONFIG.defaultRole;
  var ACCESS_DENIED_PAGE = AUTH_CONFIG.accessDeniedPage;

  //------- Dev Mode Detection -------//

  var IS_DEV = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  //------- GoTrue Instance -------//

  var gotrueAuth = null;

  function initGoTrue() {
    if (IS_DEV || !window.goTrue) return;
    gotrueAuth = new window.goTrue({
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
    var highest = roles[0];
    for (var i = 1; i < roles.length; i++) {
      if (getRoleRank(roles[i]) > getRoleRank(highest)) {
        highest = roles[i];
      }
    }
    return highest;
  }

  function getRequiredRole(pagePath) {
    if (PAGE_ROLES.hasOwnProperty(pagePath)) {
      return PAGE_ROLES[pagePath];
    }
    return DEFAULT_ROLE;
  }

  function hasAccess(userRole, requiredRole) {
    return getRoleRank(userRole) >= getRoleRank(requiredRole);
  }

  function hasClientFolderAccess(user, pagePath) {
    var metadata = user.app_metadata || {};
    var userRole = getEffectiveRole(metadata.roles || []);

    if (userRole === 'team' || userRole === 'admin') return true;

    var clientFolder = metadata.clientFolder;
    if (!clientFolder) return true;

    var folderPrefix = clientFolder + '/';
    if (pagePath.indexOf(folderPrefix) === 0) return true;

    var knownFolders = [
      'assets', 'brand-book', 'design-system', 'docs', 'templates',
      'cpm-calculator', 'svg-cleaner', 'display-ad-preview', 'src'
    ];
    var firstSegment = pagePath.split('/')[0];
    if (pagePath.indexOf('/') !== -1 && knownFolders.indexOf(firstSegment) === -1) {
      return pagePath.indexOf(folderPrefix) === 0;
    }

    return true;
  }

  //------- UI Functions -------//

  function showContent() {
    document.body.classList.remove('auth-loading');
    document.body.classList.add('auth-ready');
  }

  function redirectAccessDenied() {
    var currentPage = getCurrentPagePath();
    if (currentPage === ACCESS_DENIED_PAGE) {
      showContent();
      return;
    }
    window.location.href = ACCESS_DENIED_PAGE;
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
    var navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPath = href.replace(/^\.?\/?/, '');
      var requiredRole = getRequiredRole(linkPath);

      if (!hasAccess(userRole, requiredRole)) {
        link.closest('li').style.display = 'none';
        return;
      }
      if (userRole === 'client' && user) {
        if (!hasClientFolderAccess(user, linkPath)) {
          link.closest('li').style.display = 'none';
          return;
        }
      }
    });

    var docCards = document.querySelectorAll('.docs-card');
    docCards.forEach(function (card) {
      var href = card.getAttribute('href');
      if (!href) return;
      var linkPath = href.replace(/^\.?\/?/, '');
      var requiredRole = getRequiredRole(linkPath);

      if (!hasAccess(userRole, requiredRole)) {
        card.style.display = 'none';
        return;
      }
      if (userRole === 'client' && user) {
        if (!hasClientFolderAccess(user, linkPath)) {
          card.style.display = 'none';
        }
      }
    });

    var navSections = document.querySelectorAll('.nav-section');
    navSections.forEach(function (section) {
      var visibleLinks = section.querySelectorAll('li');
      var allHidden = true;
      visibleLinks.forEach(function (li) {
        if (li.style.display !== 'none') allHidden = false;
      });
      if (allHidden) section.style.display = 'none';
    });

    var docSections = document.querySelectorAll('.docs-section');
    docSections.forEach(function (section) {
      var visibleCards = section.querySelectorAll('.docs-card');
      var allHidden = true;
      visibleCards.forEach(function (card) {
        if (card.style.display !== 'none') allHidden = false;
      });
      if (allHidden) section.style.display = 'none';
    });
  }

  //------- Login Overlay -------//

  function showLoginOverlay() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) {
      overlay.classList.add('is-visible');
      var emailInput = document.getElementById('login-email');
      if (emailInput) emailInput.focus();
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
        // Dev mode: simulate login
        setTimeout(function () {
          var devConfig = AUTH_CONFIG.devMode || {};
          sessionStorage.setItem('auth-dev-role', devConfig.defaultRole || 'admin');
          window.location.reload();
        }, 500);
        return;
      }

      // Production: use GoTrue
      if (!gotrueAuth) {
        showLoginError('Authentication service not available.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log in';
        return;
      }

      gotrueAuth.login(email, password, true)
        .then(function (user) {
          hideLoginOverlay();
          window.location.reload();
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
        form.style.display = 'none';
        forgotBtn.style.display = 'none';
        resetForm.style.display = 'block';
        var resetEmail = document.getElementById('reset-email');
        if (resetEmail) resetEmail.focus();
      });
    }

    // Back to login
    if (resetBackBtn) {
      resetBackBtn.addEventListener('click', function () {
        form.style.display = 'block';
        forgotBtn.style.display = 'block';
        resetForm.style.display = 'none';
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

  function renderAuthButton(user) {
    var container = document.querySelector('.auth-button-container');
    if (!container) return;

    if (user) {
      var metadata = user.app_metadata || {};
      var roles = metadata.roles || [];
      var displayRole = roles.length ? roles[0] : 'user';
      var email = user.email || '';
      var initial = email.charAt(0).toUpperCase();

      container.innerHTML =
        '<div class="auth-user-info">' +
          '<div class="auth-user-details">' +
            '<span class="auth-user-avatar">' + initial + '</span>' +
            '<span class="auth-user-role">' + displayRole + '</span>' +
          '</div>' +
          '<button class="button is-faded is-small auth-logout-btn" type="button"><div class="icn-svg"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"><path d="M18 13H7.23922C6.34831 13 5.90214 14.0771 6.53211 14.7071L8.425 16.6L7.025 18.025L1 12L7 5.99999L8.425 7.42499L6.54652 9.29043C5.91317 9.91938 6.35857 11 7.25116 11H18V13Z" fill="currentColor"></path><path d="M10.0378 22V16H12.0378V18C12.0378 19.1046 12.9333 20 14.0378 20H18.0378C19.1424 20 20.0378 19.1046 20.0378 18V6C20.0378 4.89543 19.1424 4 18.0378 4H14.0378C12.9333 4 12.0378 4.89543 12.0378 6V8H10.0378V2H22.0378V22H10.0378Z" fill="currentColor"></path></svg></div> Log out</button>' +
        '</div>';

      var logoutBtn = container.querySelector('.auth-logout-btn');
      logoutBtn.addEventListener('click', function () {
        if (IS_DEV) {
          sessionStorage.setItem('auth-dev-role', 'logged-out');
          window.location.reload();
        } else {
          handleLogout();
        }
      });
    } else {
      container.innerHTML =
        '<button class="button is-faded is-small auth-login-btn" type="button">' +
          '<span>Log in</span>' +
        '</button>';

      var loginBtn = container.querySelector('.auth-login-btn');
      loginBtn.addEventListener('click', function () {
        if (IS_DEV) {
          showLoginOverlay();
        } else {
          showLoginOverlay();
        }
      });
    }
  }

  //------- Auth Handlers -------//

  function handleLogout() {
    if (gotrueAuth) {
      var user = gotrueAuth.currentUser();
      if (user) {
        user.logout()
          .then(function () {
            window.location.href = 'index.html';
          })
          .catch(function () {
            window.location.href = 'index.html';
          });
        return;
      }
    }
    window.location.href = 'index.html';
  }

  //------- Main Auth Check -------//

  function checkAuth() {
    var pagePath = getCurrentPagePath();
    var requiredRole = getRequiredRole(pagePath);

    // Public pages: show content immediately
    if (requiredRole === 'public') {
      setRoleClass('public');
      showContent();
      if (gotrueAuth) {
        var user = gotrueAuth.currentUser();
        if (user) {
          var metadata = user.app_metadata || {};
          var userRole = getEffectiveRole(metadata.roles || []);
          setRoleClass(userRole);
          renderAuthButton(user);
          filterNavLinks(userRole, user);
        } else {
          renderAuthButton(null);
        }
      } else {
        renderAuthButton(null);
      }
      return;
    }

    // Protected page: check for current user
    if (!gotrueAuth) {
      console.warn('[Auth] GoTrue not available');
      showContent();
      return;
    }

    var user = gotrueAuth.currentUser();

    if (!user) {
      renderAuthButton(null);
      showLoginOverlay();
      return;
    }

    var metadata = user.app_metadata || {};
    var userRole = getEffectiveRole(metadata.roles || []);

    if (!userRole) {
      renderAuthButton(user);
      redirectAccessDenied();
      return;
    }

    if (!hasAccess(userRole, requiredRole)) {
      renderAuthButton(user);
      setRoleClass(userRole);
      redirectAccessDenied();
      return;
    }

    if (!hasClientFolderAccess(user, pagePath)) {
      renderAuthButton(user);
      setRoleClass(userRole);
      redirectAccessDenied();
      return;
    }

    // Access granted
    setRoleClass(userRole);
    renderAuthButton(user);
    filterNavLinks(userRole, user);
    hideLoginOverlay();
    showContent();
  }

  //------- Dev Mode -------//

  function createDevUser(role) {
    var devConfig = AUTH_CONFIG.devMode || {};
    var email = devConfig.email || 'dev@localhost';
    var user = {
      email: email,
      app_metadata: {
        roles: [role]
      }
    };
    if (role === 'client' && devConfig.clientFolder) {
      user.app_metadata.clientFolder = devConfig.clientFolder;
    }
    return user;
  }

  function renderDevToolbar(activeRole) {
    var existing = document.getElementById('auth-dev-toolbar');
    if (existing) existing.remove();

    var toolbar = document.createElement('div');
    toolbar.id = 'auth-dev-toolbar';
    toolbar.className = 'auth-dev-toolbar';

    var label = document.createElement('span');
    label.className = 'auth-dev-toolbar-label';
    label.textContent = 'Dev Mode';
    toolbar.appendChild(label);

    var roles = ['logged-out', 'public', 'client', 'team', 'admin'];
    roles.forEach(function (role) {
      var btn = document.createElement('button');
      btn.textContent = role === 'logged-out' ? 'Logged Out' : role.charAt(0).toUpperCase() + role.slice(1);
      btn.className = role === activeRole ? 'button is-small is-dev-active' : 'button is-small is-outline is-faded';
      btn.type = 'button';
      btn.addEventListener('click', function () {
        sessionStorage.setItem('auth-dev-role', role);
        window.location.reload();
      });
      toolbar.appendChild(btn);
    });

    var pagePath = getCurrentPagePath();
    var requiredRole = getRequiredRole(pagePath);
    var pageInfo = document.createElement('span');
    pageInfo.className = 'auth-dev-toolbar-page-info';
    pageInfo.textContent = 'Page requires: ' + requiredRole;
    toolbar.appendChild(pageInfo);

    document.body.appendChild(toolbar);
    document.body.classList.add('has-dev-toolbar');
  }

  function initDevMode() {
    console.log('[Auth] Dev mode active (localhost detected)');

    var devConfig = AUTH_CONFIG.devMode || {};
    var savedRole = sessionStorage.getItem('auth-dev-role');
    var activeRole = savedRole || devConfig.defaultRole || 'admin';

    initLoginForm();

    // Logged-out state: show login overlay
    if (activeRole === 'logged-out') {
      renderAuthButton(null);
      renderDevToolbar('logged-out');
      showLoginOverlay();
      return;
    }

    // Simulate a logged-in user
    var devUser = createDevUser(activeRole);
    var pagePath = getCurrentPagePath();
    var requiredRole = getRequiredRole(pagePath);

    setRoleClass(activeRole);
    renderAuthButton(devUser);

    if (requiredRole !== 'public' && !hasAccess(activeRole, requiredRole)) {
      renderDevToolbar(activeRole);
      redirectAccessDenied();
      return;
    }

    if (!hasClientFolderAccess(devUser, pagePath)) {
      renderDevToolbar(activeRole);
      redirectAccessDenied();
      return;
    }

    filterNavLinks(activeRole, devUser);
    showContent();
    renderDevToolbar(activeRole);
  }

  //------- Initialise -------//

  function initAuth() {
    if (IS_DEV) {
      initDevMode();
      return;
    }

    initGoTrue();
    initLoginForm();
    checkAuth();
  }

  //------- Boot -------//

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
