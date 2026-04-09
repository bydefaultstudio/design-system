/**
 * Notion Form
 * Dynamically renders forms from Notion database schemas.
 * Supports multiple form instances per page via .notion-form[data-form].
 * Author: By Default Studio
 * Created: 2026-04-08
 * Version: 2.0.0
 * Last Updated: 2026-04-09
 */

console.log("Notion Form v2.0.0");

(function() {
  'use strict';

  var SKELETON_COUNT = 6;
  var API_BASE = '/api';

  //
  //------- Utility Functions -------//
  //

  function toFieldId(name, formIndex) {
    return 'field-' + formIndex + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  //
  //------- Skeleton Loading -------//
  //

  function renderSkeleton(container) {
    var html = '';
    for (var i = 0; i < SKELETON_COUNT; i++) {
      html += '<div class="form-group">';
      html += '<div class="skeleton-line skeleton-label"></div>';
      html += '<div class="skeleton-line skeleton-input"></div>';
      html += '</div>';
    }
    container.innerHTML = html;
  }

  //
  //------- Schema Fetch -------//
  //

  async function fetchSchema(formType) {
    var response = await fetch(API_BASE + '/get-schema?formType=' + encodeURIComponent(formType));

    if (!response.ok) {
      var error = await response.json().catch(function() { return {}; });
      throw new Error(error.error || 'Failed to load form');
    }

    return response.json();
  }

  //
  //------- Field Builders -------//
  //

  function buildTextInput(property, inputType, formIndex) {
    var id = toFieldId(property.name, formIndex);
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = property.name + (property.required ? ' *' : '');

    var input = document.createElement('input');
    input.type = inputType || 'text';
    input.id = id;
    input.name = property.name;
    if (property.required) input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  function buildNumberInput(property, formIndex) {
    var id = toFieldId(property.name, formIndex);
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = property.name + (property.required ? ' *' : '');

    var input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.name = property.name;
    if (property.required) input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  function buildDateInput(property, formIndex) {
    var id = toFieldId(property.name, formIndex);
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = property.name + (property.required ? ' *' : '');

    var input = document.createElement('input');
    input.type = 'date';
    input.id = id;
    input.name = property.name;
    if (property.required) input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    return group;
  }

  function buildSelect(property, formIndex) {
    var id = toFieldId(property.name, formIndex);
    var group = document.createElement('div');
    group.className = 'form-group';

    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = property.name + (property.required ? ' *' : '');

    var select = document.createElement('select');
    select.id = id;
    select.name = property.name;
    if (property.required) select.required = true;

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select...';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    if (property.options) {
      property.options.forEach(function(opt) {
        var option = document.createElement('option');
        option.value = opt.name;
        option.textContent = opt.name;
        select.appendChild(option);
      });
    }

    group.appendChild(label);
    group.appendChild(select);
    return group;
  }

  function buildMultiSelect(property, formIndex) {
    var group = document.createElement('div');
    group.className = 'form-group';

    var fieldset = document.createElement('fieldset');
    fieldset.dataset.name = property.name;
    fieldset.dataset.type = 'multi_select';

    var legend = document.createElement('legend');
    legend.textContent = property.name + (property.required ? ' *' : '');
    fieldset.appendChild(legend);

    if (property.options) {
      property.options.forEach(function(opt, index) {
        var id = toFieldId(property.name, formIndex) + '-' + index;
        var check = document.createElement('div');
        check.className = 'form-check';

        var input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.name = property.name;
        input.value = opt.name;

        var label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = opt.name;

        check.appendChild(input);
        check.appendChild(label);
        fieldset.appendChild(check);
      });
    }

    group.appendChild(fieldset);
    return group;
  }

  function buildCheckbox(property, formIndex) {
    var id = toFieldId(property.name, formIndex);
    var group = document.createElement('div');
    group.className = 'form-group';

    var check = document.createElement('div');
    check.className = 'form-check';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.name = property.name;

    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = property.name;

    check.appendChild(input);
    check.appendChild(label);
    group.appendChild(check);
    return group;
  }

  function buildField(property, formIndex) {
    switch (property.type) {
      case 'title':
        return buildTextInput(property, 'text', formIndex);
      case 'rich_text':
        return buildTextInput(property, 'text', formIndex);
      case 'number':
        return buildNumberInput(property, formIndex);
      case 'email':
        return buildTextInput(property, 'email', formIndex);
      case 'phone_number':
        return buildTextInput(property, 'tel', formIndex);
      case 'url':
        return buildTextInput(property, 'url', formIndex);
      case 'select':
      case 'status':
        return buildSelect(property, formIndex);
      case 'multi_select':
        return buildMultiSelect(property, formIndex);
      case 'date':
        return buildDateInput(property, formIndex);
      case 'checkbox':
        return buildCheckbox(property, formIndex);
      default:
        return buildTextInput(property, 'text', formIndex);
    }
  }

  //
  //------- Form Rendering -------//
  //

  function renderForm(container, schema, formIndex) {
    container.innerHTML = '';

    var form = document.createElement('form');
    form.className = 'notion-form-element';
    form.noValidate = true;

    schema.properties.forEach(function(property) {
      var field = buildField(property, formIndex);
      form.appendChild(field);
    });

    var submitGroup = document.createElement('div');
    submitGroup.className = 'form-group';

    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'button';
    submitBtn.textContent = 'Submit';

    submitGroup.appendChild(submitBtn);
    form.appendChild(submitGroup);

    container.appendChild(form);

    setupSubmitHandler(form, schema, container);
  }

  //
  //------- Form Data Collection -------//
  //

  function collectFormData(form, schema) {
    var data = {};

    schema.properties.forEach(function(property) {
      var name = property.name;

      if (property.type === 'multi_select') {
        var checked = form.querySelectorAll('input[name="' + CSS.escape(name) + '"]:checked');
        var values = [];
        checked.forEach(function(input) {
          values.push(input.value);
        });
        if (values.length > 0) {
          data[name] = values;
        }
        return;
      }

      if (property.type === 'checkbox') {
        var checkbox = form.querySelector('input[name="' + CSS.escape(name) + '"]');
        if (checkbox) {
          data[name] = checkbox.checked;
        }
        return;
      }

      var input = form.querySelector('[name="' + CSS.escape(name) + '"]');
      if (input && input.value.trim() !== '') {
        data[name] = input.value.trim();
      }
    });

    return data;
  }

  //
  //------- Validation -------//
  //

  function validateForm(form, schema) {
    var errors = [];

    form.querySelectorAll('.is-error').forEach(function(el) {
      el.classList.remove('is-error');
    });
    form.querySelectorAll('.form-error').forEach(function(el) {
      el.remove();
    });

    schema.properties.forEach(function(property) {
      if (!property.required) return;

      var name = property.name;

      if (property.type === 'multi_select') {
        var checked = form.querySelectorAll('input[name="' + CSS.escape(name) + '"]:checked');
        if (checked.length === 0) {
          errors.push(name);
          var fieldset = form.querySelector('fieldset[data-name="' + CSS.escape(name) + '"]');
          if (fieldset) {
            fieldset.classList.add('is-error');
            addFieldError(fieldset, name + ' is required');
          }
        }
        return;
      }

      var input = form.querySelector('[name="' + CSS.escape(name) + '"]');
      if (!input) return;

      var value = input.value;
      if (property.type === 'checkbox') return;

      if (!value || value.trim() === '') {
        errors.push(name);
        input.classList.add('is-error');
        addFieldError(input, name + ' is required');
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
  //------- Form Submission -------//
  //

  async function submitFormData(formType, data) {
    var response = await fetch(API_BASE + '/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType: formType, data: data })
    });

    if (!response.ok) {
      var error = await response.json().catch(function() { return {}; });
      throw new Error(error.error || 'Submission failed');
    }

    return response.json();
  }

  function setupSubmitHandler(form, schema, container) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      var errors = validateForm(form, schema);
      if (errors.length > 0) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please fill in all required fields.', 'danger');
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        var formType = container.dataset.form;
        var data = collectFormData(form, schema);
        await submitFormData(formType, data);

        if (typeof window.showToast === 'function') {
          window.showToast(schema.successMessage || 'Submitted successfully.', 'success');
        }

        renderSuccess(container, schema.successMessage, formType);
      } catch (err) {
        console.error('Notion Form: Submit error', err);
        if (typeof window.showToast === 'function') {
          window.showToast(err.message || 'Something went wrong. Please try again.', 'danger');
        }
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  //
  //------- Success & Error States -------//
  //

  function renderSuccess(container, message, formType) {
    container.innerHTML = '';

    var success = document.createElement('div');
    success.className = 'notion-form-success';

    var text = document.createElement('p');
    text.textContent = message || 'Your submission has been received.';

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'button';
    resetBtn.textContent = 'Submit another';
    resetBtn.addEventListener('click', function() {
      initForm(container, formType, 0);
    });

    success.appendChild(text);
    success.appendChild(resetBtn);
    container.appendChild(success);
  }

  function renderError(container, message) {
    container.innerHTML = '';

    var error = document.createElement('div');
    error.className = 'notion-form-error';

    var text = document.createElement('p');
    text.textContent = message || 'Could not load form. Please refresh the page.';

    error.appendChild(text);
    container.appendChild(error);
  }

  //
  //------- Initialize -------//
  //

  async function initForm(container, formType, formIndex) {
    renderSkeleton(container);

    try {
      var schema = await fetchSchema(formType);
      renderForm(container, schema, formIndex);
    } catch (err) {
      console.error('Notion Form: Schema fetch error', err);
      renderError(container, err.message);
    }
  }

  function init() {
    var containers = document.querySelectorAll('.notion-form[data-form]');

    containers.forEach(function(container, index) {
      var formType = container.dataset.form;

      // Skip feedback — handled by feedback.js
      if (formType === 'feedback') return;

      if (!formType) {
        console.error('Notion Form: Missing data-form attribute');
        return;
      }

      initForm(container, formType, index);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    init();
  });

})();
