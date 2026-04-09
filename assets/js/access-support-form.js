/**
 * access-support-form.js — Access & Support request form
 * Fixed-field form that submits to Notion via /api/submit-form.
 * Reads ?from= query parameter to capture page context.
 *
 * @version 1.0.0
 * @author By Default
 */
(function () {
  'use strict';

  console.log('access-support-form.js v1.0.0 loaded');

  //
  //------- Configuration -------//
  //

  var API_BASE = '/api';
  var FORM_TYPE = 'access-support';
  var SUCCESS_MESSAGE = 'Thanks \u2014 we\u2019ll review your request and be in touch shortly.';
  var ERROR_MESSAGE = 'Something went wrong. Please email us directly at support@bydefault.studio';

  var REQUEST_TYPE_OPTIONS = [
    'Access Request',
    'Permission Issue',
    'Account Problem',
    'General Support',
    'Other'
  ];

  //
  //------- Utilities -------//
  //

  function getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function getFromParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get('from') || window.location.href;
  }

  //
  //------- Form Builder -------//
  //

  function renderForm(container) {
    container.innerHTML = '';

    var form = document.createElement('form');
    form.className = 'access-support-form-element';
    form.noValidate = true;

    // Name field
    var nameGroup = createTextInput('name', 'Your name', 'text', true);
    form.appendChild(nameGroup);

    // Email field
    var emailGroup = createTextInput('email', 'Your email address', 'email', true);
    form.appendChild(emailGroup);

    // Request Type select
    var selectGroup = createSelect('request-type', 'What do you need help with?', REQUEST_TYPE_OPTIONS, true);
    form.appendChild(selectGroup);

    // Message textarea
    var messageGroup = createTextarea('message', 'Tell us what\u2019s happening', 'The more detail you give us, the faster we can help.', true);
    form.appendChild(messageGroup);

    // Submit button
    var submitGroup = document.createElement('div');
    submitGroup.className = 'form-group';
    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'button';
    submitBtn.textContent = 'Send request';
    submitGroup.appendChild(submitBtn);
    form.appendChild(submitGroup);

    container.appendChild(form);

    setupSubmitHandler(form, container);
  }

  function createTextInput(id, labelText, inputType, required) {
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', 'support-' + id);
    label.textContent = labelText + (required ? ' *' : '');

    var input = document.createElement('input');
    input.type = inputType;
    input.id = 'support-' + id;
    input.name = id;
    if (required) input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  function createSelect(id, labelText, options, required) {
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', 'support-' + id);
    label.textContent = labelText + (required ? ' *' : '');

    var select = document.createElement('select');
    select.id = 'support-' + id;
    select.name = id;
    if (required) select.required = true;

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select...';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    options.forEach(function (opt) {
      var option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    group.appendChild(label);
    group.appendChild(select);
    return group;
  }

  function createTextarea(id, labelText, hintText, required) {
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', 'support-' + id);
    label.textContent = labelText + (required ? ' *' : '');

    var textarea = document.createElement('textarea');
    textarea.id = 'support-' + id;
    textarea.name = id;
    textarea.rows = 5;
    if (required) textarea.required = true;

    group.appendChild(label);
    group.appendChild(textarea);

    if (hintText) {
      var hint = document.createElement('p');
      hint.className = 'form-hint';
      hint.textContent = hintText;
      group.appendChild(hint);
    }

    return group;
  }

  //
  //------- Validation -------//
  //

  function validateForm(form) {
    var errors = [];

    // Clear previous errors
    form.querySelectorAll('.is-error').forEach(function (el) {
      el.classList.remove('is-error');
    });
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.remove();
    });

    var fields = [
      { name: 'name', label: 'Your name' },
      { name: 'email', label: 'Your email address' },
      { name: 'request-type', label: 'Request type' },
      { name: 'message', label: 'Message' }
    ];

    fields.forEach(function (field) {
      var input = form.querySelector('[name="' + field.name + '"]');
      if (!input) return;

      var value = input.value ? input.value.trim() : '';
      if (!value) {
        errors.push(field.label);
        input.classList.add('is-error');
        addFieldError(input, field.label + ' is required');
      }
    });

    return errors;
  }

  function addFieldError(element, message) {
    var error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    element.parentNode.appendChild(error);
  }

  //
  //------- Submission -------//
  //

  function submitForm(formData) {
    var data = {
      'Name': formData.name,
      'Email': formData.email,
      'Request Type': formData.requestType,
      'Message': formData.message,
      'Page or Section': getFromParam(),
      'Submitted Date': getTodayISO()
    };

    return fetch(API_BASE + '/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType: FORM_TYPE, data: data })
    }).then(function (response) {
      if (!response.ok) {
        return response.json().catch(function () { return {}; }).then(function (err) {
          throw new Error(err.error || ERROR_MESSAGE);
        });
      }
      return response.json();
    });
  }

  //
  //------- Submit Handler -------//
  //

  function setupSubmitHandler(form, container) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errors = validateForm(form);
      if (errors.length > 0) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var formData = {
        name: form.querySelector('[name="name"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        requestType: form.querySelector('[name="request-type"]').value,
        message: form.querySelector('[name="message"]').value.trim()
      };

      submitForm(formData).then(function () {
        renderSuccess(container);
      }).catch(function (err) {
        console.error('[Access Support] Submit error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Show inline error
        var existing = form.querySelector('.access-support-error');
        if (existing) existing.remove();

        var errorEl = document.createElement('div');
        errorEl.className = 'access-support-error';
        errorEl.innerHTML = ERROR_MESSAGE;
        form.appendChild(errorEl);
      });
    });
  }

  //
  //------- Success State -------//
  //

  function renderSuccess(container) {
    container.innerHTML = '';

    var success = document.createElement('div');
    success.className = 'access-support-success';

    var text = document.createElement('p');
    text.textContent = SUCCESS_MESSAGE;

    success.appendChild(text);
    container.appendChild(success);
  }

  //
  //------- Initialize -------//
  //

  function init() {
    var container = document.querySelector('.access-support-form');
    if (!container) return;

    renderForm(container);
    console.log('[Access Support] Initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
