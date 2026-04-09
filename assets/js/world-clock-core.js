/**
 * World Clock Core — shared rendering logic
 * Used by both the tool page (via iframe preview) and the standalone embed page.
 * Version: 1.0.0
 */

var WorldClockCore = (function () {
  'use strict';

  var VERSION = '1.0.0';
  var intervalId = null;
  var rootEl = null;
  var currentOptions = null;

  console.log('[WorldClockCore] v' + VERSION);

  /* ---- Utility Functions ---- */

  function getCityName(timezone) {
    var parts = timezone.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  }

  function getTimezoneAbbr(date, timezone) {
    try {
      var formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      var parts = formatter.formatToParts(date);
      var tzPart = parts.find(function (p) { return p.type === 'timeZoneName'; });
      return tzPart ? tzPart.value : '';
    } catch (e) {
      return '';
    }
  }

  function formatTime(date, timezone, showSeconds) {
    try {
      var opts = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      if (showSeconds) { opts.second = '2-digit'; }
      return new Intl.DateTimeFormat('en-GB', opts).format(date);
    } catch (e) {
      return showSeconds ? '--:--:--' : '--:--';
    }
  }

  /* ---- DOM Creation ---- */

  function createClockColumn(timezone, options) {
    var now = new Date();
    var column = document.createElement('div');
    column.className = 'clock-column';
    column.setAttribute('data-timezone', timezone);

    var timeEl = document.createElement('time');
    timeEl.className = 'clock-time';
    timeEl.setAttribute('datetime', now.toISOString());
    timeEl.textContent = formatTime(now, timezone, options.showSeconds);
    column.appendChild(timeEl);

    if (options.showCity !== false) {
      var cityEl = document.createElement('div');
      cityEl.className = 'clock-city';
      cityEl.textContent = getCityName(timezone);
      column.appendChild(cityEl);
    }

    if (options.showTimezone !== false) {
      var tzEl = document.createElement('div');
      tzEl.className = 'clock-timezone';
      tzEl.textContent = getTimezoneAbbr(now, timezone);
      column.appendChild(tzEl);
    }

    return column;
  }

  /* ---- Update Loop ---- */

  function updateClockTimes() {
    if (!rootEl || !currentOptions) return;
    var now = new Date();
    var columns = rootEl.querySelectorAll('.clock-column');

    columns.forEach(function (col) {
      var tz = col.getAttribute('data-timezone');
      var timeEl = col.querySelector('.clock-time');
      if (timeEl && tz) {
        timeEl.textContent = formatTime(now, tz, currentOptions.showSeconds);
        timeEl.setAttribute('datetime', now.toISOString());
      }
      var tzEl = col.querySelector('.clock-timezone');
      if (tzEl && tz) {
        tzEl.textContent = getTimezoneAbbr(now, tz);
      }
    });
  }

  /* ---- Public API ---- */

  function init(el, options) {
    rootEl = el;
    currentOptions = options || {};

    var cities = currentOptions.cities || ['Europe/London'];
    var defaultInterval = currentOptions.showSeconds ? 1000 : 60000;
    var interval = currentOptions.interval || defaultInterval;

    /* Build DOM */
    var container = document.createElement('div');
    container.className = 'clock-container';

    var row = document.createElement('div');
    row.className = 'clock-row';

    cities.forEach(function (tz) {
      try {
        /* Validate timezone by attempting to format */
        new Intl.DateTimeFormat('en', { timeZone: tz });
        row.appendChild(createClockColumn(tz, currentOptions));
      } catch (e) {
        console.warn('[WorldClockCore] Invalid timezone, skipping:', tz);
      }
    });

    container.appendChild(row);
    rootEl.innerHTML = '';
    rootEl.appendChild(container);

    /* Start update loop */
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(updateClockTimes, interval);

    console.log('[WorldClockCore] Initialized with', cities.length, 'cities');
  }

  function destroy() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (rootEl) {
      rootEl.innerHTML = '';
      rootEl = null;
    }
    currentOptions = null;
  }

  function update(options) {
    if (!rootEl) return;
    destroy();
    var el = rootEl || document.getElementById('clock-root');
    init(el, options);
  }

  return {
    init: init,
    destroy: destroy,
    update: update
  };

})();
