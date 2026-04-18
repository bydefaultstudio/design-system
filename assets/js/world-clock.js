/**
 * World Clock — Tool Page Controller
 * Handles city search, config UI, preview iframe, and embed URL/iframe generation.
 * Version: 1.0.0
 */

(function () {
  'use strict';

  var VERSION = '1.0.0';
  console.log('[WorldClock Tool] v' + VERSION);

  /* ---- IANA Timezone Database ---- */

  var TIMEZONE_LIST = [
    { city: 'London', tz: 'Europe/London' },
    { city: 'Paris', tz: 'Europe/Paris' },
    { city: 'Berlin', tz: 'Europe/Berlin' },
    { city: 'Madrid', tz: 'Europe/Madrid' },
    { city: 'Rome', tz: 'Europe/Rome' },
    { city: 'Amsterdam', tz: 'Europe/Amsterdam' },
    { city: 'Brussels', tz: 'Europe/Brussels' },
    { city: 'Vienna', tz: 'Europe/Vienna' },
    { city: 'Zurich', tz: 'Europe/Zurich' },
    { city: 'Stockholm', tz: 'Europe/Stockholm' },
    { city: 'Oslo', tz: 'Europe/Oslo' },
    { city: 'Copenhagen', tz: 'Europe/Copenhagen' },
    { city: 'Helsinki', tz: 'Europe/Helsinki' },
    { city: 'Warsaw', tz: 'Europe/Warsaw' },
    { city: 'Prague', tz: 'Europe/Prague' },
    { city: 'Budapest', tz: 'Europe/Budapest' },
    { city: 'Bucharest', tz: 'Europe/Bucharest' },
    { city: 'Athens', tz: 'Europe/Athens' },
    { city: 'Istanbul', tz: 'Europe/Istanbul' },
    { city: 'Moscow', tz: 'Europe/Moscow' },
    { city: 'Dublin', tz: 'Europe/Dublin' },
    { city: 'Lisbon', tz: 'Europe/Lisbon' },
    { city: 'Edinburgh', tz: 'Europe/London' },
    { city: 'New York', tz: 'America/New_York' },
    { city: 'Chicago', tz: 'America/Chicago' },
    { city: 'Denver', tz: 'America/Denver' },
    { city: 'Los Angeles', tz: 'America/Los_Angeles' },
    { city: 'San Francisco', tz: 'America/Los_Angeles' },
    { city: 'Seattle', tz: 'America/Los_Angeles' },
    { city: 'Phoenix', tz: 'America/Phoenix' },
    { city: 'Toronto', tz: 'America/Toronto' },
    { city: 'Vancouver', tz: 'America/Vancouver' },
    { city: 'Montreal', tz: 'America/Toronto' },
    { city: 'Mexico City', tz: 'America/Mexico_City' },
    { city: 'Bogota', tz: 'America/Bogota' },
    { city: 'Lima', tz: 'America/Lima' },
    { city: 'Santiago', tz: 'America/Santiago' },
    { city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
    { city: 'Sao Paulo', tz: 'America/Sao_Paulo' },
    { city: 'Anchorage', tz: 'America/Anchorage' },
    { city: 'Honolulu', tz: 'Pacific/Honolulu' },
    { city: 'Tokyo', tz: 'Asia/Tokyo' },
    { city: 'Shanghai', tz: 'Asia/Shanghai' },
    { city: 'Beijing', tz: 'Asia/Shanghai' },
    { city: 'Hong Kong', tz: 'Asia/Hong_Kong' },
    { city: 'Singapore', tz: 'Asia/Singapore' },
    { city: 'Seoul', tz: 'Asia/Seoul' },
    { city: 'Taipei', tz: 'Asia/Taipei' },
    { city: 'Bangkok', tz: 'Asia/Bangkok' },
    { city: 'Jakarta', tz: 'Asia/Jakarta' },
    { city: 'Manila', tz: 'Asia/Manila' },
    { city: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur' },
    { city: 'Ho Chi Minh', tz: 'Asia/Ho_Chi_Minh' },
    { city: 'Dubai', tz: 'Asia/Dubai' },
    { city: 'Abu Dhabi', tz: 'Asia/Dubai' },
    { city: 'Riyadh', tz: 'Asia/Riyadh' },
    { city: 'Doha', tz: 'Asia/Qatar' },
    { city: 'Mumbai', tz: 'Asia/Kolkata' },
    { city: 'Delhi', tz: 'Asia/Kolkata' },
    { city: 'Bangalore', tz: 'Asia/Kolkata' },
    { city: 'Kolkata', tz: 'Asia/Kolkata' },
    { city: 'Karachi', tz: 'Asia/Karachi' },
    { city: 'Dhaka', tz: 'Asia/Dhaka' },
    { city: 'Colombo', tz: 'Asia/Colombo' },
    { city: 'Kathmandu', tz: 'Asia/Kathmandu' },
    { city: 'Tehran', tz: 'Asia/Tehran' },
    { city: 'Tel Aviv', tz: 'Asia/Jerusalem' },
    { city: 'Yangon', tz: 'Asia/Yangon' },
    { city: 'Sydney', tz: 'Australia/Sydney' },
    { city: 'Melbourne', tz: 'Australia/Melbourne' },
    { city: 'Brisbane', tz: 'Australia/Brisbane' },
    { city: 'Perth', tz: 'Australia/Perth' },
    { city: 'Adelaide', tz: 'Australia/Adelaide' },
    { city: 'Auckland', tz: 'Pacific/Auckland' },
    { city: 'Fiji', tz: 'Pacific/Fiji' },
    { city: 'Cairo', tz: 'Africa/Cairo' },
    { city: 'Lagos', tz: 'Africa/Lagos' },
    { city: 'Nairobi', tz: 'Africa/Nairobi' },
    { city: 'Johannesburg', tz: 'Africa/Johannesburg' },
    { city: 'Cape Town', tz: 'Africa/Johannesburg' },
    { city: 'Casablanca', tz: 'Africa/Casablanca' },
    { city: 'Accra', tz: 'Africa/Accra' },
    { city: 'Addis Ababa', tz: 'Africa/Addis_Ababa' },
    { city: 'Reykjavik', tz: 'Atlantic/Reykjavik' }
  ];

  /* ---- Preset Groups ---- */

  var PRESETS = [
    { label: 'UK + US East', cities: ['Europe/London', 'America/New_York'] },
    { label: 'US Coasts', cities: ['America/New_York', 'America/Los_Angeles'] },
    { label: 'Europe', cities: ['Europe/London', 'Europe/Paris', 'Europe/Berlin'] },
    { label: 'Global', cities: ['Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'] },
    { label: 'Asia Pacific', cities: ['Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Australia/Sydney'] }
  ];

  /* ---- State ---- */

  var selectedCities = ['Europe/London', 'America/New_York', 'Asia/Tokyo'];
  var highlightIndex = -1;
  var filteredResults = [];
  var debounceTimer = null;

  /* ---- DOM References ---- */

  var searchInput;
  var searchResults;
  var tagContainer;
  var presetContainer;
  var previewFrame;
  var previewIframe;
  var urlOutput;
  var iframeOutput;
  var scriptOutput;
  var optShowCity;
  var optShowTz;
  var optShowSeconds;
  var themeToggleLight;
  var themeToggleDark;

  /* ---- City Search ---- */

  function getTimezoneOffset(tz) {
    try {
      var formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'short'
      });
      var parts = formatter.formatToParts(new Date());
      var tzPart = parts.find(function (p) { return p.type === 'timeZoneName'; });
      return tzPart ? tzPart.value : '';
    } catch (e) {
      return '';
    }
  }

  function filterCities(query) {
    var q = query.toLowerCase().trim();
    if (!q) return [];

    return TIMEZONE_LIST.filter(function (item) {
      var alreadySelected = selectedCities.indexOf(item.tz) !== -1;
      if (alreadySelected) return false;
      return item.city.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);
  }

  function renderSearchResults(results) {
    filteredResults = results;
    highlightIndex = -1;
    searchResults.innerHTML = '';

    if (results.length === 0) {
      searchResults.classList.remove('is-open');
      return;
    }

    results.forEach(function (item, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'clock-search-result';
      btn.setAttribute('data-index', i);

      var nameSpan = document.createElement('span');
      nameSpan.textContent = item.city;

      var tzSpan = document.createElement('span');
      tzSpan.className = 'clock-search-result-tz';
      tzSpan.textContent = getTimezoneOffset(item.tz);

      btn.appendChild(nameSpan);
      btn.appendChild(tzSpan);

      btn.addEventListener('click', function () {
        handleAddCity(item.tz);
      });

      searchResults.appendChild(btn);
    });

    searchResults.classList.add('is-open');
  }

  function handleSearchInput() {
    var query = searchInput.value;
    var results = filterCities(query);
    renderSearchResults(results);
  }

  function handleSearchKeydown(e) {
    var items = searchResults.querySelectorAll('.clock-search-result');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && filteredResults[highlightIndex]) {
        handleAddCity(filteredResults[highlightIndex].tz);
      }
    } else if (e.key === 'Escape') {
      searchResults.classList.remove('is-open');
      searchInput.blur();
    }
  }

  function updateHighlight(items) {
    items.forEach(function (item, i) {
      item.classList.toggle('is-highlighted', i === highlightIndex);
    });
    if (items[highlightIndex]) {
      items[highlightIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  /* ---- City Management ---- */

  function handleAddCity(tz) {
    if (selectedCities.indexOf(tz) !== -1) return;
    selectedCities.push(tz);
    searchInput.value = '';
    searchResults.classList.remove('is-open');
    renderTags();
    scheduleUpdate();
    searchInput.focus();
  }

  function handleRemoveCity(tz) {
    selectedCities = selectedCities.filter(function (c) { return c !== tz; });
    renderTags();
    scheduleUpdate();
  }

  function getCityLabel(tz) {
    var match = TIMEZONE_LIST.find(function (item) { return item.tz === tz; });
    if (match) return match.city;
    var parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  }

  function renderTags() {
    tagContainer.innerHTML = '';

    selectedCities.forEach(function (tz) {
      var tag = document.createElement('span');
      tag.className = 'tag';

      var label = document.createElement('span');
      label.textContent = getCityLabel(tz);
      tag.appendChild(label);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tag-remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + getCityLabel(tz));
      removeBtn.innerHTML = '<div class="svg-icn" data-icon="close"><svg viewBox="0 0 24 24" fill="none" width="100%" height="100%" aria-hidden="true"><path d="M12 10.5858L16.2929 6.29289L17.7071 7.70711L13.4142 12L17.7071 16.2929L16.2929 17.7071L12 13.4142L7.70711 17.7071L6.29289 16.2929L10.5858 12L6.29289 7.70711L7.70711 6.29289L12 10.5858Z" fill="currentColor"/></svg></div>';
      removeBtn.addEventListener('click', function () {
        handleRemoveCity(tz);
      });
      tag.appendChild(removeBtn);

      tagContainer.appendChild(tag);
    });
  }

  /* ---- Presets ---- */

  function renderPresets() {
    PRESETS.forEach(function (preset) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button';
      btn.setAttribute('data-size', 'small');
      btn.setAttribute('data-variant', 'outline-faded');
      btn.textContent = preset.label;
      btn.addEventListener('click', function () {
        selectedCities = preset.cities.slice();
        renderTags();
        scheduleUpdate();
      });
      presetContainer.appendChild(btn);
    });
  }

  /* ---- Options ---- */

  function getTheme() {
    if (themeToggleDark && themeToggleDark.checked) return 'dark';
    return 'light';
  }

  function getOptions() {
    return {
      cities: selectedCities,
      showCity: optShowCity ? optShowCity.checked : true,
      showTz: optShowTz ? optShowTz.checked : true,
      showSeconds: optShowSeconds ? optShowSeconds.checked : false,
      theme: getTheme()
    };
  }

  /* ---- Preview & Output ---- */

  function buildEmbedUrl(opts) {
    /* Derive embed URL from current directory so it works whether the host
       page is served as /tools/world-clock.html (local) or /tools/world-clock
       (Netlify pretty URLs). */
    var dir = window.location.pathname.replace(/[^/]*$/, '');
    var base = window.location.origin + dir + 'world-clock-embed.html';
    var params = [];

    if (opts.cities.length > 0) {
      params.push('cities=' + encodeURIComponent(opts.cities.join(',')));
    }
    if (!opts.showCity) params.push('showCity=false');
    if (!opts.showTz) params.push('showTz=false');
    if (opts.showSeconds) params.push('showSeconds=true');
    if (opts.theme === 'dark') params.push('theme=dark');

    return base + (params.length ? '?' + params.join('&') : '');
  }

  function buildIframeSnippet(url) {
    return '<iframe src="' + url + '" width="100%" height="140" frameborder="0" style="border:none;"></iframe>';
  }

  function buildScriptSnippet(url) {
    return '<div id="bd-clock"></div>\n'
      + '<script>\n'
      + '(function(){\n'
      + '  var f=document.createElement("iframe");\n'
      + '  f.src="' + url + '";\n'
      + '  f.width="100%"; f.height="140";\n'
      + '  f.frameBorder="0"; f.style.border="none";\n'
      + '  document.getElementById("bd-clock").appendChild(f);\n'
      + '})();\n'
      + '<\/script>';
  }

  function updatePreviewAndOutput() {
    var opts = getOptions();
    var url = buildEmbedUrl(opts);

    /* Update iframe preview */
    if (previewIframe) {
      previewIframe.src = url;
    }

    /* Update preview frame background for dark mode */
    if (previewFrame) {
      previewFrame.classList.toggle('is-dark', opts.theme === 'dark');
    }

    /* Update output fields */
    if (urlOutput) urlOutput.value = url;
    if (iframeOutput) iframeOutput.value = buildIframeSnippet(url);
    if (scriptOutput) scriptOutput.value = buildScriptSnippet(url);
  }

  function scheduleUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreviewAndOutput, 300);
  }

  /* ---- Reset ---- */

  function handleReset() {
    selectedCities = ['Europe/London', 'America/New_York', 'Asia/Tokyo'];
    if (optShowCity) optShowCity.checked = true;
    if (optShowTz) optShowTz.checked = true;
    if (optShowSeconds) optShowSeconds.checked = false;
    if (themeToggleLight) themeToggleLight.checked = true;
    renderTags();
    scheduleUpdate();
  }

  /* ---- Close search on outside click ---- */

  function handleDocumentClick(e) {
    if (searchInput && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('is-open');
    }
  }

  /* ---- Initialization ---- */

  function init() {
    /* Bind DOM */
    searchInput = document.getElementById('city-search');
    searchResults = document.getElementById('city-search-results');
    tagContainer = document.getElementById('city-tags');
    presetContainer = document.getElementById('city-presets');
    previewFrame = document.querySelector('.clock-preview-frame');
    previewIframe = document.getElementById('clock-preview');
    urlOutput = document.getElementById('embed-url-output');
    iframeOutput = document.getElementById('iframe-output');
    scriptOutput = document.getElementById('script-output');
    optShowCity = document.getElementById('opt-show-city');
    optShowTz = document.getElementById('opt-show-tz');
    optShowSeconds = document.getElementById('opt-show-seconds');
    themeToggleLight = document.getElementById('theme-light');
    themeToggleDark = document.getElementById('theme-dark');

    /* Search */
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
      searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    /* Options */
    [optShowCity, optShowTz, optShowSeconds, themeToggleLight, themeToggleDark].forEach(function (el) {
      if (el) el.addEventListener('change', scheduleUpdate);
    });

    /* Reset button */
    var resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', handleReset);

    /* Outside click */
    document.addEventListener('click', handleDocumentClick);

    /* Presets */
    if (presetContainer) renderPresets();

    /* Initial render */
    renderTags();
    updatePreviewAndOutput();

    console.log('[WorldClock Tool] Initialized');
  }

  document.addEventListener('DOMContentLoaded', init);

})();
