/**
 * feedback.js — Page feedback widget
 * Handles "Was this page helpful?" interaction and modal dialog.
 *
 * @version 1.0.0
 * @author By Default
 */
(function () {
  'use strict';

  console.log('feedback.js loaded');

  //------- Configuration -------//

  var SUBTITLE_YES = 'Great to hear! Any additional feedback?';
  var SUBTITLE_NO = 'Sorry about that. What could be improved?';
  var SUCCESS_MESSAGE = 'Thanks for your feedback!';

  //------- Utilities -------//

  function getPageIdentifier() {
    return window.location.pathname;
  }

  //------- Submission -------//

  function submitFeedback(form) {
    var formData = new FormData(form);
    var encoded = new URLSearchParams(formData).toString();

    console.log('[Feedback] Submitting:', Object.fromEntries(formData));

    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encoded
    }).then(function (response) {
      if (!response.ok) {
        console.error('[Feedback] Submit failed:', response.status);
      }
      return response;
    }).catch(function (err) {
      console.error('[Feedback] Submit error:', err);
    });
  }

  //------- Main Logic -------//

  function initFeedback() {
    var section = document.querySelector('.page-feedback');
    var dialog = document.querySelector('.feedback-modal');
    if (!section || !dialog) return;

    var yesBtn = section.querySelector('[data-feedback="yes"]');
    var noBtn = section.querySelector('[data-feedback="no"]');
    var subtitle = dialog.querySelector('.feedback-modal-subtitle');
    var sentimentInput = dialog.querySelector('input[name="sentiment"]');
    var pageInput = dialog.querySelector('input[name="page"]');
    var form = dialog.querySelector('.feedback-form');
    var closeBtn = dialog.querySelector('.feedback-modal-close');
    var textarea = dialog.querySelector('.feedback-textarea');
    var prompt = section.querySelector('.page-feedback-prompt');

    function openModal(sentiment) {
      sentimentInput.value = sentiment;
      pageInput.value = getPageIdentifier();
      subtitle.textContent = sentiment === 'yes' ? SUBTITLE_YES : SUBTITLE_NO;
      textarea.value = '';
      dialog.showModal();
    }

    function showSuccess() {
      prompt.textContent = SUCCESS_MESSAGE;
      section.classList.add('is-submitted');
    }

    //------- Event Listeners -------//

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

      submitFeedback(form).then(function () {
        dialog.close();
        showSuccess();
      });
    });

    console.log('[Feedback] Initialized');
  }

  //------- Init -------//

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
  } else {
    initFeedback();
  }
})();
