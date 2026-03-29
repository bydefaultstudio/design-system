/**
 * Authentication Module
 * Handles login/logout via GoTrue (Netlify Identity API), role-based
 * page gating, element-level visibility, and per-client folder access.
 *
 * On localhost: runs in dev mode with simulated users and a role-switcher toolbar.
 * On production: uses GoTrue JS to authenticate against Netlify Identity.
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
    var highest = roles[0].toLowerCase();
    for (var i = 1; i < roles.length; i++) {
      var r = roles[i].toLowerCase();
      if (getRoleRank(r) > getRoleRank(highest)) {
        highest = r;
      }
    }
    return highest;
  }

  function getRequiredRole() {
    // Read from data-access attribute on <body> (set by generator or manually)
    var bodyAccess = document.body.getAttribute('data-access');
    if (bodyAccess && ROLE_HIERARCHY.indexOf(bodyAccess) !== -1) {
      return bodyAccess;
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
      'assets', 'brand', 'design-system', 'docs', 'templates',
      'cpm-calculator', 'svg-cleaner', 'display-ad-preview', 'src',
      'auth', 'code', 'content', 'admin', 'project'
    ];
    var firstSegment = pagePath.split('/')[0];
    if (pagePath.indexOf('/') !== -1 && knownFolders.indexOf(firstSegment) === -1) {
      return pagePath.indexOf(folderPrefix) === 0;
    }

    return true;
  }

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
      var requiredRole = link.getAttribute('data-access');
      if (requiredRole && !hasAccess(userRole, requiredRole)) {
        var li = link.closest('li');
        if (li) li.style.display = 'none';
      }
    });

    var docCards = document.querySelectorAll('.docs-card[data-access]');
    docCards.forEach(function (card) {
      var requiredRole = card.getAttribute('data-access');
      if (requiredRole && !hasAccess(userRole, requiredRole)) {
        card.style.display = 'none';
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

  function showSetPasswordForm(titleText, subtitleText) {
    var form = document.getElementById('login-form');
    var forgotBtn = document.getElementById('login-forgot-btn');
    var resetForm = document.getElementById('login-reset-form');
    var setPasswordForm = document.getElementById('login-set-password-form');
    var title = document.getElementById('login-title');
    var subtitle = document.getElementById('login-subtitle');

    if (form) form.style.display = 'none';
    if (forgotBtn) forgotBtn.style.display = 'none';
    if (resetForm) resetForm.style.display = 'none';
    if (setPasswordForm) setPasswordForm.style.display = 'flex';
    if (title) title.textContent = titleText || 'Set Your Password';
    if (subtitle) subtitle.textContent = subtitleText || 'Choose a secure password for your account.';

    var newPwInput = document.getElementById('set-password-new');
    if (newPwInput) newPwInput.focus();
  }

  function hideSetPasswordForm() {
    var form = document.getElementById('login-form');
    var forgotBtn = document.getElementById('login-forgot-btn');
    var setPasswordForm = document.getElementById('login-set-password-form');
    var title = document.getElementById('login-title');
    var subtitle = document.getElementById('login-subtitle');

    if (setPasswordForm) setPasswordForm.style.display = 'none';
    if (form) { form.style.display = 'block'; form.reset(); }
    if (forgotBtn) forgotBtn.style.display = 'block';
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

      submitAction(newPw)
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
          sessionStorage.setItem('auth-dev-role', devConfig.defaultRole || 'admin');
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
        redirectToLogin();
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
      showSetPasswordForm('Accept Invitation', 'Create a password to activate your account.');
      initSetPasswordFormHandler(function (password) {
        return gotrueAuth.acceptInvite(tokenInfo.token, password, true);
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

    var pagePath = getCurrentPagePath();
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
    showContent();
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

    var container = document.querySelector('.auth-header-container');
    if (!container) return;

    // Dropdown wrapper
    var dropdown = document.createElement('div');
    dropdown.id = 'auth-dev-toolbar';
    dropdown.className = 'header-dropdown';

    // Toggle
    var toggle = document.createElement('div');
    toggle.className = 'header-link';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-label', 'Dev mode');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<div class="icn-svg" data-icon="dev-mode">'
      + '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M6 17L1 12L6 7L7.4 8.4L4.87462 10.943C4.29375 11.528 4.29375 12.472 4.87462 13.057L7.4 15.6L6 17ZM10.45 20.3L8.55 19.7L13.55 3.7L15.45 4.3L10.45 20.3ZM18 17L16.6 15.6L19.1254 13.057C19.7062 12.472 19.7063 11.528 19.1254 10.943L16.6 8.4L18 7L23 12L18 17Z" fill="currentColor"/>'
      + '</svg></div>'
      + '<div class="icn-svg header-link-chevron" data-icon="chevron-down">'
      + '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M12 15.375L6 9.375L7.4 7.975L12 12.575L16.6 7.975L18 9.375L12 15.375Z" fill="currentColor"/>'
      + '</svg></div>';
    dropdown.appendChild(toggle);

    // Dropdown menu
    var menu = document.createElement('div');
    menu.className = 'header-dropdown-menu';

    var ICON_CHECK = '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M9.55 18L3.85 12.3L5.275 10.875L9.55 15.15L18.725 5.975L20.15 7.4L9.55 18Z" fill="currentColor"/>'
      + '</svg>';

    // Section label
    var label = document.createElement('div');
    label.className = 'header-dropdown-label';
    label.textContent = 'Switch Role';
    menu.appendChild(label);

    // Role links
    var requiredRole = getRequiredRole();
    var roles = ['logged-out', 'public', 'client', 'team', 'admin'];
    roles.forEach(function (role) {
      var item = document.createElement('div');
      item.className = 'header-link';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      var isActive = role === activeRole;

      // Check icon (visible or placeholder)
      var icon = document.createElement('div');
      icon.className = 'icn-svg';
      icon.setAttribute('data-icon', 'check');
      if (isActive) {
        icon.innerHTML = ICON_CHECK;
      } else {
        icon.style.visibility = 'hidden';
      }
      item.appendChild(icon);

      var text = document.createElement('span');
      text.textContent = role === 'logged-out' ? 'Logged Out' : role.charAt(0).toUpperCase() + role.slice(1);
      item.appendChild(text);

      item.addEventListener('click', function () {
        sessionStorage.setItem('auth-dev-role', role);
        window.location.reload();
      });
      menu.appendChild(item);
    });

    // Divider + page info
    var divider = document.createElement('div');
    divider.className = 'header-dropdown-divider';
    menu.appendChild(divider);

    var pageInfo = document.createElement('div');
    pageInfo.className = 'header-dropdown-label';
    pageInfo.textContent = 'Page requires: ' + requiredRole;
    pageInfo.style.textTransform = 'none';
    menu.appendChild(pageInfo);

    dropdown.appendChild(menu);

    // Toggle open/close
    toggle.addEventListener('click', function () {
      var wasOpen = dropdown.classList.contains('is-open');
      // Close all header dropdowns first
      var allDropdowns = document.querySelectorAll('.header-dropdown');
      for (var i = 0; i < allDropdowns.length; i++) {
        allDropdowns[i].classList.remove('is-open');
        var t = allDropdowns[i].querySelector('.header-link');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
      if (!wasOpen) {
        dropdown.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    container.appendChild(dropdown);
  }

  function initDevMode() {
    console.log('[Auth] Dev mode active (localhost detected)');
    document.body.classList.add('is-dev-mode');

    var devConfig = AUTH_CONFIG.devMode || {};
    var savedRole = sessionStorage.getItem('auth-dev-role');
    var activeRole = savedRole || devConfig.defaultRole || 'admin';

    initLoginForm();

    // On the login page in dev mode
    if (isLoginPage()) {
      // Handle hash tokens in dev mode (simulate)
      var tokenInfo = parseHashTokens();
      if (tokenInfo) {
        clearHash();
        if (tokenInfo.type === 'invite') {
          showSetPasswordForm('Accept Invitation', 'Create a password to activate your account.');
          initSetPasswordFormHandler(function () {
            return new Promise(function (resolve) {
              setTimeout(function () {
                sessionStorage.setItem('auth-dev-role', devConfig.defaultRole || 'admin');
                resolve();
              }, 500);
            });
          });
          renderDevToolbar(activeRole);
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
          renderDevToolbar(activeRole);
          return;
        }
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
      renderDevToolbar(activeRole);
      return;
    }

    // Logged-out state: redirect to login
    if (activeRole === 'logged-out') {
      var requiredRole = getRequiredRole();
      if (requiredRole !== 'public') {
        renderDevToolbar('logged-out');
        redirectToLogin();
        return;
      }
      renderAuthButton(null);
      showContent();
      renderDevToolbar('logged-out');
      return;
    }

    // Simulate a logged-in user
    var devUser = createDevUser(activeRole);
    var requiredRole = getRequiredRole();

    setRoleClass(activeRole);
    renderAuthButton(devUser);

    if (requiredRole !== 'public' && !hasAccess(activeRole, requiredRole)) {
      renderDevToolbar(activeRole);
      redirectAccessDenied();
      return;
    }

    var pagePath = getCurrentPagePath();
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
