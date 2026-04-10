/**
 * feedback.js — Page feedback widget
 * Handles "Was this page helpful?" interaction and modal dialog.
 * Submits feedback to Notion via /api/submit-form.
 *
 * @version 2.0.0
 * @author By Default
 */
(function () {
  'use strict';

  console.log('feedback.js v2.0.0 loaded');

  //
  //------- Configuration -------//
  //

  var API_BASE = '/api';
  var FORM_TYPE = 'feedback';
  var SUBTITLE_YES = 'Great to hear! Any additional feedback?';
  var SUBTITLE_NO = 'Sorry about that. What could be improved?';

  //
  //------- Utilities -------//
  //

  function getPageUrl() {
    return window.location.href;
  }

  function getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  //
  //------- Submission -------//
  //

  function submitFeedback(feedbackText) {
    var data = {
      'Feedback': feedbackText,
      'Page': getPageUrl(),
      'Submitted Date': getTodayISO()
    };

    return fetch(API_BASE + '/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType: FORM_TYPE, data: data })
    }).then(function (response) {
      if (!response.ok) {
        return response.json().catch(function () { return {}; }).then(function (err) {
          throw new Error(err.error || 'Submission failed');
        });
      }
      return response.json();
    });
  }

  //
  //------- Main Logic -------//
  //

  function initFeedback() {
    var section = document.querySelector('.page-feedback');
    var dialog = document.querySelector('.feedback-modal');
    if (!section || !dialog) return;

    var yesBtn = section.querySelector('[data-feedback="yes"]');
    var noBtn = section.querySelector('[data-feedback="no"]');
    var subtitle = dialog.querySelector('.feedback-modal-subtitle');
    var form = dialog.querySelector('.feedback-form');
    var closeBtn = dialog.querySelector('.feedback-modal-close');
    var textarea = dialog.querySelector('.feedback-textarea');
    var submitBtn = form.querySelector('button[type="submit"]');

    var currentSentiment = '';

    function openModal(sentiment) {
      currentSentiment = sentiment;
      subtitle.textContent = sentiment === 'yes' ? SUBTITLE_YES : SUBTITLE_NO;
      textarea.value = '';
      dialog.showModal();
    }

    function showSuccess() {
      section.classList.add('is-submitted');
    }

    //
    //------- Event Listeners -------//
    //

    yesBtn.addEventListener('click', function () {
      openModal('yes');
    });

    noBtn.addEventListener('click', function () {
      openModal('no');
    });

    closeBtn.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        dialog.close();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var feedbackText = textarea.value.trim();
      if (!feedbackText) {
        feedbackText = currentSentiment === 'yes' ? 'Helpful' : 'Not helpful';
      }

      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      submitFeedback(feedbackText).then(function () {
        dialog.close();
        showSuccess();
      }).catch(function (err) {
        console.error('[Feedback] Submit error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        var existing = form.querySelector('.feedback-error');
        if (existing) existing.remove();

        var errorMsg = document.createElement('div');
        errorMsg.className = 'feedback-error';
        errorMsg.textContent = err.message || 'Something went wrong. Please try again.';
        form.appendChild(errorMsg);
      });
    });

    console.log('[Feedback] Initialized');
  }

  //
  //------- Init -------//
  //

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
  } else {
    initFeedback();
  }
})();
