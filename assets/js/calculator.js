/**
 * Script Purpose: CPM & Spend Calculator
 * Calculates campaign impressions, fees, payouts, and margins based on monthly spend
 * Supports checkbox-driven feature toggles for optional fields
 * Features: currency toggle, URL state sync, save/load, copy URL, reset
 * Version: 2.0.0
 */

console.log("CPM Calculator v2.0.0");

//
//------- State -------//
//

var activeFlags = [];
var activeCurrency = 'GBP';

var DEFAULTS = {
  campaignCPM: 15,
  totalCampaignSpend: 300000,
  agencyFeeCPM: 1,
  adHostingFeeCPM: 1,
  publisherPayout: 70,
  partnerMarginPayout: 30,
  partnerName: '',
  currency: 'GBP'
};

var CURRENCY_CONFIG = {
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB', label: 'GBP (£)' },
  USD: { symbol: '$', code: 'USD', locale: 'en-US', label: 'USD ($)' }
};

var STORAGE_KEY = 'cpm-calculator-saves';

//
//------- Utility Functions -------//
//

// Read active flags from checkbox state
function getCheckboxFlags() {
  var flags = [];
  var codes = ['af', 'ah', 'pf'];

  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox && checkbox.checked) {
      flags.push(code);
    }
  });

  return flags;
}

// Toggle visibility of optional elements based on feature flags
function toggleOptionalElements(flags) {
  var optionalElements = document.querySelectorAll('[data-opt]');

  optionalElements.forEach(function(element) {
    var optValue = element.getAttribute('data-opt');
    if (flags.indexOf(optValue) !== -1) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  });
}

// Update fee input grid columns based on active toggles
function updateFeeGridLayout() {
  var fieldAf = document.getElementById('field-af');
  var fieldAh = document.getElementById('field-ah');
  if (!fieldAf || !fieldAh) return;

  var afActive = activeFlags.indexOf('af') !== -1;
  var ahActive = activeFlags.indexOf('ah') !== -1;

  // If only one fee is active, make it full width
  if (afActive && !ahActive) {
    fieldAf.classList.add('grid-full');
    fieldAh.classList.remove('grid-full');
  } else if (ahActive && !afActive) {
    fieldAh.classList.add('grid-full');
    fieldAf.classList.remove('grid-full');
  } else {
    fieldAf.classList.remove('grid-full');
    fieldAh.classList.remove('grid-full');
  }
}

// Handle checkbox change
function handleOptionChange() {
  activeFlags = getCheckboxFlags();
  toggleOptionalElements(activeFlags);
  updateFeeGridLayout();
  syncPublisherNetDefaults();
  recalculate();
  updateURLState();
}

// When partner share toggle changes, sync net percentage
function syncPublisherNetDefaults() {
  var pfActive = activeFlags.indexOf('pf') !== -1;
  var publisherInput = document.getElementById('publisher-payout');
  var netInput = document.getElementById('partner-margin-payout');

  if (pfActive) {
    syncPartnerFromPublisher();
  } else {
    if (publisherInput) publisherInput.value = DEFAULTS.publisherPayout;
    if (netInput) netInput.value = DEFAULTS.partnerMarginPayout;
  }
}

// Format currency value
function formatCurrency(value) {
  var config = CURRENCY_CONFIG[activeCurrency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format number with commas
function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(Math.round(value));
}

// Calculate impressions from spend and CPM
function calculateImpressions(spend, cpm) {
  if (!cpm || cpm <= 0) return 0;
  return (spend / cpm) * 1000;
}

// Calculate agency earnings
function calculateAgencyEarnings(impressions, agencyFeeCPM) {
  if (!agencyFeeCPM || agencyFeeCPM <= 0) return 0;
  return (impressions / 1000) * agencyFeeCPM;
}

// Calculate ad hosting cost
function calculateAdHostingCost(impressions, adHostingFeeCPM) {
  if (!adHostingFeeCPM || adHostingFeeCPM <= 0) return 0;
  return (impressions / 1000) * adHostingFeeCPM;
}

// Calculate partner share (from net spend after fees)
function calculatePublisherPayout(netSpend, payoutPercentage) {
  if (!payoutPercentage || payoutPercentage <= 0) return 0;
  return netSpend * (payoutPercentage / 100);
}

// Calculate net (remainder after partner share)
function calculatePartnerMargin(netSpend, partnerMarginPercent) {
  if (!partnerMarginPercent || partnerMarginPercent <= 0) return 0;
  return netSpend * (partnerMarginPercent / 100);
}

// Update table header with partner name
function updatePartnerShareHeader() {
  var nameInput = document.getElementById('partner-name');
  var header = document.getElementById('partner-share-header');
  var resultLabel = document.getElementById('result-partner-label');
  if (!nameInput) return;

  var name = nameInput.value.trim();
  if (header) header.textContent = name || 'Partner';
  if (resultLabel) resultLabel.textContent = name || 'Partner';
}

// Sync net input from partner share
function syncPartnerFromPublisher() {
  var publisherInput = document.getElementById('publisher-payout');
  var partnerInput = document.getElementById('partner-margin-payout');
  if (!publisherInput || !partnerInput) return;

  var publisherValue = Math.min(100, Math.max(0, parseFloat(publisherInput.value) || 0));
  partnerInput.value = 100 - publisherValue;
}

// Sync partner share input from net
function syncPublisherFromPartner() {
  var partnerInput = document.getElementById('partner-margin-payout');
  var publisherInput = document.getElementById('publisher-payout');
  if (!publisherInput || !partnerInput) return;

  var partnerValue = Math.min(100, Math.max(0, parseFloat(partnerInput.value) || 0));
  publisherInput.value = 100 - partnerValue;
}

// Update all currency symbols in the UI
function updateCurrencySymbols() {
  var config = CURRENCY_CONFIG[activeCurrency];
  var symbols = document.querySelectorAll('.currency-symbol');
  symbols.forEach(function(el) {
    el.textContent = config.symbol;
  });
}

//
//------- Main Functions -------//
//

// Get all input values
function getInputValues() {
  return {
    campaignCPM: parseFloat(document.getElementById('campaign-cpm').value) || 0,
    agencyFeeCPM: activeFlags.indexOf('af') !== -1
      ? (parseFloat(document.getElementById('agency-fee-cpm').value) || 0)
      : 0,
    adHostingFeeCPM: activeFlags.indexOf('ah') !== -1
      ? (parseFloat(document.getElementById('ad-hosting-fee-cpm').value) || 0)
      : 0,
    publisherPayoutPercent: activeFlags.indexOf('pf') !== -1
      ? (parseFloat(document.getElementById('publisher-payout').value) || 0)
      : 0,
    partnerMarginPercent: activeFlags.indexOf('pf') !== -1
      ? (parseFloat(document.getElementById('partner-margin-payout').value) || 0)
      : 100,
    totalCampaignSpend: parseFloat(document.getElementById('total-campaign-spend').value) || 0,
    monthlySpends: getMonthlySpends(),
    featureFlags: activeFlags
  };
}

// Get monthly spend values from table
function getMonthlySpends() {
  var spends = [];
  var rows = document.querySelectorAll('#monthly-table-body tr');

  rows.forEach(function(row) {
    var input = row.querySelector('input[type="number"]');
    var value = parseFloat(input && input.value) || 0;
    spends.push(value);
  });

  return spends;
}

// Calculate all values for a single month
function calculateMonthValues(monthSpend, inputs) {
  var impressions = calculateImpressions(monthSpend, inputs.campaignCPM);

  var agencyEarnings = inputs.featureFlags.indexOf('af') !== -1
    ? calculateAgencyEarnings(impressions, inputs.agencyFeeCPM)
    : 0;
  var adHostingCost = inputs.featureFlags.indexOf('ah') !== -1
    ? calculateAdHostingCost(impressions, inputs.adHostingFeeCPM)
    : 0;

  var netSpend = monthSpend - agencyEarnings - adHostingCost;

  var publisherPayout = inputs.featureFlags.indexOf('pf') !== -1
    ? calculatePublisherPayout(netSpend, inputs.publisherPayoutPercent)
    : 0;
  var partnerMargin = calculatePartnerMargin(netSpend, inputs.partnerMarginPercent);

  return {
    spend: monthSpend,
    impressions: impressions,
    agencyEarnings: agencyEarnings,
    adHostingCost: adHostingCost,
    publisherPayout: publisherPayout,
    partnerMargin: partnerMargin
  };
}

// Update campaign overview results
function updateCampaignOverview(inputs) {
  var totalImpressions = calculateImpressions(inputs.totalCampaignSpend, inputs.campaignCPM);

  // Calculate total fees for the overview
  var totalAgencyEarnings = inputs.featureFlags.indexOf('af') !== -1
    ? calculateAgencyEarnings(totalImpressions, inputs.agencyFeeCPM)
    : 0;
  var totalAdHostingCost = inputs.featureFlags.indexOf('ah') !== -1
    ? calculateAdHostingCost(totalImpressions, inputs.adHostingFeeCPM)
    : 0;

  var totalNetSpend = inputs.totalCampaignSpend - totalAgencyEarnings - totalAdHostingCost;

  var totalPublisherPayout = inputs.featureFlags.indexOf('pf') !== -1
    ? calculatePublisherPayout(totalNetSpend, inputs.publisherPayoutPercent)
    : 0;
  var totalPartnerMargin = calculatePartnerMargin(totalNetSpend, inputs.partnerMarginPercent);

  // Update results display
  var impressionsEl = document.getElementById('result-impressions');
  var netEl = document.getElementById('result-net');
  var partnerEl = document.getElementById('result-partner');

  if (impressionsEl) impressionsEl.textContent = formatNumber(totalImpressions);
  if (netEl) netEl.textContent = formatCurrency(totalPartnerMargin);
  if (partnerEl) partnerEl.textContent = formatCurrency(totalPublisherPayout);

  updatePartnerShareHeader();
}

// Update monthly table row
function updateTableRow(row, monthIndex, monthName, values, inputs) {
  var cells = row.querySelectorAll('td');

  if (cells[2]) cells[2].textContent = formatNumber(values.impressions);
  if (cells[3]) cells[3].textContent = formatCurrency(values.agencyEarnings);
  if (cells[4]) cells[4].textContent = formatCurrency(values.adHostingCost);
  if (cells[5]) cells[5].textContent = formatCurrency(values.publisherPayout);
  if (cells[6]) cells[6].textContent = formatCurrency(values.partnerMargin);
}

// Update totals row
function updateTotalsRow(inputs) {
  var monthlySpends = inputs.monthlySpends;
  var totalSpend = 0;
  var totalImpressions = 0;
  var totalAgencyEarnings = 0;
  var totalAdHostingCost = 0;
  var totalPublisherPayout = 0;
  var totalPartnerMargin = 0;

  monthlySpends.forEach(function(spend) {
    var monthValues = calculateMonthValues(spend, inputs);
    totalSpend += monthValues.spend;
    totalImpressions += monthValues.impressions;

    if (inputs.featureFlags.indexOf('af') !== -1) {
      totalAgencyEarnings += monthValues.agencyEarnings;
    }
    if (inputs.featureFlags.indexOf('ah') !== -1) {
      totalAdHostingCost += monthValues.adHostingCost;
    }
    if (inputs.featureFlags.indexOf('pf') !== -1) {
      totalPublisherPayout += monthValues.publisherPayout;
    }
    totalPartnerMargin += monthValues.partnerMargin;
  });

  document.getElementById('total-spend').textContent = formatCurrency(totalSpend);
  document.getElementById('total-impressions').textContent = formatNumber(totalImpressions);

  if (inputs.featureFlags.indexOf('af') !== -1) {
    document.getElementById('total-agency-earnings').textContent = formatCurrency(totalAgencyEarnings);
  }
  if (inputs.featureFlags.indexOf('ah') !== -1) {
    document.getElementById('total-ad-hosting-cost').textContent = formatCurrency(totalAdHostingCost);
  }
  if (inputs.featureFlags.indexOf('pf') !== -1) {
    document.getElementById('total-publisher-payout').textContent = formatCurrency(totalPublisherPayout);
  }
  document.getElementById('total-partner-margin').textContent = formatCurrency(totalPartnerMargin);
}

// Create monthly table rows
function createMonthlyTableRows() {
  var monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var monthsAbbr = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  var config = CURRENCY_CONFIG[activeCurrency];
  var tbody = document.getElementById('monthly-table-body');
  tbody.innerHTML = '';

  monthsFull.forEach(function(monthName, index) {
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="month-full">' + monthName + '</span><span class="month-abbr">' + monthsAbbr[index] + '</span></td>' +
      '<td><input type="number" class="calculator-input calculator-input-inline" data-month-index="' + index + '" min="0" value="0" /></td>' +
      '<td class="calculator-output-cell">0</td>' +
      '<td data-opt="af" class="calculator-output-cell">' + config.symbol + '0.00</td>' +
      '<td data-opt="ah" class="calculator-output-cell">' + config.symbol + '0.00</td>' +
      '<td data-opt="pf" class="calculator-output-cell">' + config.symbol + '0.00</td>' +
      '<td class="calculator-output-cell">' + config.symbol + '0.00</td>';
    tbody.appendChild(row);
  });
}

// Recalculate all values
function recalculate() {
  var inputs = getInputValues();

  updateCampaignOverview(inputs);

  var rows = document.querySelectorAll('#monthly-table-body tr');
  var months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  rows.forEach(function(row, index) {
    var monthSpend = inputs.monthlySpends[index] || 0;
    var monthValues = calculateMonthValues(monthSpend, inputs);
    updateTableRow(row, index, months[index], monthValues, inputs);
  });

  updateTotalsRow(inputs);
}

//
//------- URL State Management -------//
//

// Build current state object
function getCurrentState() {
  var monthlySpends = getMonthlySpends();
  var state = {
    cpm: document.getElementById('campaign-cpm').value,
    spend: document.getElementById('total-campaign-spend').value,
    af: activeFlags.indexOf('af') !== -1 ? '1' : '0',
    ah: activeFlags.indexOf('ah') !== -1 ? '1' : '0',
    pf: activeFlags.indexOf('pf') !== -1 ? '1' : '0',
    afcpm: document.getElementById('agency-fee-cpm').value,
    ahcpm: document.getElementById('ad-hosting-fee-cpm').value,
    pname: document.getElementById('partner-name').value,
    pshare: document.getElementById('publisher-payout').value,
    cur: activeCurrency
  };

  // Only include non-zero monthly spends
  monthlySpends.forEach(function(spend, i) {
    if (spend > 0) {
      state['m' + i] = String(spend);
    }
  });

  return state;
}

// Update URL with current state
function updateURLState() {
  var state = getCurrentState();
  var params = new URLSearchParams();

  Object.keys(state).forEach(function(key) {
    var value = state[key];
    // Skip default values to keep URL clean
    if (key === 'cpm' && value === String(DEFAULTS.campaignCPM)) return;
    if (key === 'spend' && value === String(DEFAULTS.totalCampaignSpend)) return;
    if (key === 'af' && value === '0') return;
    if (key === 'ah' && value === '0') return;
    if (key === 'pf' && value === '0') return;
    if (key === 'afcpm' && value === String(DEFAULTS.agencyFeeCPM)) return;
    if (key === 'ahcpm' && value === String(DEFAULTS.adHostingFeeCPM)) return;
    if (key === 'pname' && value === '') return;
    if (key === 'pshare' && value === String(DEFAULTS.publisherPayout)) return;
    if (key === 'cur' && value === DEFAULTS.currency) return;

    params.set(key, value);
  });

  var newURL = window.location.pathname;
  var paramString = params.toString();
  if (paramString) {
    newURL += '?' + paramString;
  }

  history.replaceState(null, '', newURL);
}

// Hydrate form from URL params
function hydrateFromURL() {
  var params = new URLSearchParams(window.location.search);
  if (!params.toString()) return false;

  // Currency
  var cur = params.get('cur');
  if (cur && CURRENCY_CONFIG[cur]) {
    activeCurrency = cur;
  }

  // Toggle states
  var afCheckbox = document.getElementById('opt-af');
  var ahCheckbox = document.getElementById('opt-ah');
  var pfCheckbox = document.getElementById('opt-pf');

  if (params.get('af') === '1' && afCheckbox) afCheckbox.checked = true;
  if (params.get('ah') === '1' && ahCheckbox) ahCheckbox.checked = true;
  if (params.get('pf') === '1' && pfCheckbox) pfCheckbox.checked = true;

  // Input values
  setInputFromParam(params, 'cpm', 'campaign-cpm');
  setInputFromParam(params, 'spend', 'total-campaign-spend');
  setInputFromParam(params, 'afcpm', 'agency-fee-cpm');
  setInputFromParam(params, 'ahcpm', 'ad-hosting-fee-cpm');
  setInputFromParam(params, 'pshare', 'publisher-payout');

  // Partner name (text field)
  var pname = params.get('pname');
  if (pname !== null) {
    var nameInput = document.getElementById('partner-name');
    if (nameInput) nameInput.value = pname;
  }

  // Sync net from partner share
  var pshare = params.get('pshare');
  if (pshare !== null) {
    var netInput = document.getElementById('partner-margin-payout');
    if (netInput) {
      netInput.value = 100 - (parseFloat(pshare) || 0);
    }
  }

  return true;
}

// Helper: set input value from URL param
function setInputFromParam(params, paramKey, inputId) {
  var value = params.get(paramKey);
  if (value !== null) {
    var input = document.getElementById(inputId);
    if (input) input.value = value;
  }
}

// Hydrate monthly spends from URL after table is created
function hydrateMonthlyFromURL() {
  var params = new URLSearchParams(window.location.search);
  var rows = document.querySelectorAll('#monthly-table-body tr');

  rows.forEach(function(row, i) {
    var value = params.get('m' + i);
    if (value !== null) {
      var input = row.querySelector('input[type="number"]');
      if (input) input.value = value;
    }
  });
}

//
//------- Save / Load -------//
//

// Get saved configs from localStorage
function getSavedConfigs() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Save configs to localStorage
function setSavedConfigs(configs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error('[Calculator] Failed to save:', e);
  }
}

// Save current state
function saveCurrentState() {
  var name = prompt('Name this configuration:');
  if (!name || !name.trim()) return;

  var configs = getSavedConfigs();
  configs.push({
    name: name.trim(),
    timestamp: Date.now(),
    state: getCurrentState()
  });

  setSavedConfigs(configs);
  renderSavesList();
}

// Load a saved config
function loadSavedConfig(index) {
  var configs = getSavedConfigs();
  if (!configs[index]) return;

  var state = configs[index].state;

  // Set currency
  if (state.cur && CURRENCY_CONFIG[state.cur]) {
    activeCurrency = state.cur;
    updateCurrencySymbols();
    updateCurrencyToggle();
  }

  // Set toggles
  var afCheckbox = document.getElementById('opt-af');
  var ahCheckbox = document.getElementById('opt-ah');
  var pfCheckbox = document.getElementById('opt-pf');

  if (afCheckbox) afCheckbox.checked = state.af === '1';
  if (ahCheckbox) ahCheckbox.checked = state.ah === '1';
  if (pfCheckbox) pfCheckbox.checked = state.pf === '1';

  // Set inputs
  setValueById('campaign-cpm', state.cpm);
  setValueById('total-campaign-spend', state.spend);
  setValueById('agency-fee-cpm', state.afcpm);
  setValueById('ad-hosting-fee-cpm', state.ahcpm);
  setValueById('partner-name', state.pname || '');
  setValueById('publisher-payout', state.pshare);

  // Sync net
  var pshare = parseFloat(state.pshare) || DEFAULTS.publisherPayout;
  setValueById('partner-margin-payout', 100 - pshare);

  // Set monthly spends
  var rows = document.querySelectorAll('#monthly-table-body tr');
  rows.forEach(function(row, i) {
    var input = row.querySelector('input[type="number"]');
    if (input) {
      input.value = state['m' + i] || 0;
    }
  });

  // Update state and recalculate
  activeFlags = getCheckboxFlags();
  toggleOptionalElements(activeFlags);
  updateFeeGridLayout();
  recalculate();
  updateURLState();
}

// Delete a saved config
function deleteSavedConfig(index, event) {
  event.stopPropagation();
  var configs = getSavedConfigs();
  configs.splice(index, 1);
  setSavedConfigs(configs);
  renderSavesList();
}

// Render saved configs list in dropdown
function renderSavesList() {
  var container = document.getElementById('saves-list');
  var section = document.getElementById('saves-section');
  if (!container) return;

  var configs = getSavedConfigs();

  if (configs.length === 0) {
    container.innerHTML = '';
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = '';

  var html = '';
  configs.forEach(function(config, index) {
    html += '<div class="calculator-save-item" data-save-index="' + index + '">' +
      '<span>' + escapeHTML(config.name) + '</span>' +
      '<button class="calculator-save-delete" type="button" data-delete-index="' + index + '" aria-label="Delete ' + escapeHTML(config.name) + '">' +
        '<div class="icn-svg" data-icon="close">' +
          '<svg viewBox="0 0 24 24" fill="none" width="100%" height="100%" aria-hidden="true">' +
            '<path d="M6.4 19L5 17.6L9.18579 13.4142C9.96684 12.6332 9.96684 11.3668 9.18579 10.5858L5 6.4L6.4 5L10.5858 9.18579C11.3668 9.96684 12.6332 9.96684 13.4142 9.18579L17.6 5L19 6.4L14.8142 10.5858C14.0332 11.3668 14.0332 12.6332 14.8142 13.4142L19 17.6L17.6 19L13.4142 14.8142C12.6332 14.0332 11.3668 14.0332 10.5858 14.8142L6.4 19Z" fill="currentColor"/>' +
          '</svg>' +
        '</div>' +
      '</button>' +
    '</div>';
  });

  container.innerHTML = html;
}

// Helper: set value by element ID
function setValueById(id, value) {
  var el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.value = value;
  }
}

// Helper: escape HTML
function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

//
//------- Dropdown -------//
//

// Dropdown open/close now handled by dropdown.js

//
//------- Currency -------//
//

function setCurrency(currency) {
  if (!CURRENCY_CONFIG[currency] || activeCurrency === currency) return;

  activeCurrency = currency;
  updateCurrencySymbols();
  updateCurrencyToggle();

  // Rebuild table to update default currency symbols
  var monthlySpends = getMonthlySpends();
  createMonthlyTableRows();

  // Restore monthly spends
  var rows = document.querySelectorAll('#monthly-table-body tr');
  rows.forEach(function(row, i) {
    var input = row.querySelector('input[type="number"]');
    if (input && monthlySpends[i]) {
      input.value = monthlySpends[i];
    }
  });

  toggleOptionalElements(activeFlags);
  recalculate();
  updateURLState();
}

// Sync toggle checkbox and label highlights with activeCurrency
function updateCurrencyToggle() {
  var toggle = document.getElementById('currency-toggle');
  var gbpLabel = document.getElementById('currency-label-gbp');
  var usdLabel = document.getElementById('currency-label-usd');

  if (toggle) toggle.checked = activeCurrency === 'USD';
  if (gbpLabel) gbpLabel.classList.toggle('is-active', activeCurrency === 'GBP');
  if (usdLabel) usdLabel.classList.toggle('is-active', activeCurrency === 'USD');
}

//
//------- Reset -------//
//

function resetCalculator() {
  // Uncheck all toggles
  var codes = ['af', 'ah', 'pf'];
  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox) checkbox.checked = false;
  });

  // Reset inputs to defaults
  setValueById('campaign-cpm', DEFAULTS.campaignCPM);
  setValueById('total-campaign-spend', DEFAULTS.totalCampaignSpend);
  setValueById('agency-fee-cpm', DEFAULTS.agencyFeeCPM);
  setValueById('ad-hosting-fee-cpm', DEFAULTS.adHostingFeeCPM);
  setValueById('publisher-payout', DEFAULTS.publisherPayout);
  setValueById('partner-margin-payout', DEFAULTS.partnerMarginPayout);
  setValueById('partner-name', DEFAULTS.partnerName);

  // Reset currency
  activeCurrency = DEFAULTS.currency;
  updateCurrencySymbols();
  updateCurrencyToggle();

  // Reset monthly table
  var monthlySpends = getMonthlySpends();
  createMonthlyTableRows();

  // Update state
  activeFlags = [];
  toggleOptionalElements(activeFlags);
  updateFeeGridLayout();
  recalculate();

  // Clear URL params
  history.replaceState(null, '', window.location.pathname);
}

//
//------- Event Listeners -------//
//

function setupEventListeners() {
  // Global input listeners — recalculate and update URL
  var globalInputs = [
    'campaign-cpm',
    'agency-fee-cpm',
    'ad-hosting-fee-cpm',
    'total-campaign-spend'
  ];

  globalInputs.forEach(function(inputId) {
    var input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', function() {
        recalculate();
        updateURLState();
      });
      input.addEventListener('change', function() {
        recalculate();
        updateURLState();
      });
    }
  });

  // Partner share and net inputs sync each other
  var publisherInput = document.getElementById('publisher-payout');
  if (publisherInput) {
    publisherInput.addEventListener('input', function() {
      syncPartnerFromPublisher();
      recalculate();
      updateURLState();
    });
    publisherInput.addEventListener('change', function() {
      syncPartnerFromPublisher();
      recalculate();
      updateURLState();
    });
  }

  var partnerInput = document.getElementById('partner-margin-payout');
  if (partnerInput) {
    partnerInput.addEventListener('input', function() {
      syncPublisherFromPartner();
      recalculate();
      updateURLState();
    });
    partnerInput.addEventListener('change', function() {
      syncPublisherFromPartner();
      recalculate();
      updateURLState();
    });
  }

  // Partner name updates header and URL
  var partnerNameInput = document.getElementById('partner-name');
  if (partnerNameInput) {
    partnerNameInput.addEventListener('input', function() {
      updatePartnerShareHeader();
      updateURLState();
    });
    partnerNameInput.addEventListener('change', function() {
      updatePartnerShareHeader();
      updateURLState();
    });
  }

  // Monthly spend input listeners (delegated)
  var tableBody = document.getElementById('monthly-table-body');
  if (tableBody) {
    tableBody.addEventListener('input', function(e) {
      if (e.target.classList.contains('calculator-input-inline')) {
        recalculate();
        updateURLState();
      }
    });
    tableBody.addEventListener('change', function(e) {
      if (e.target.classList.contains('calculator-input-inline')) {
        recalculate();
        updateURLState();
      }
    });
  }

  // Option checkbox listeners
  var codes = ['af', 'ah', 'pf'];
  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox) {
      checkbox.addEventListener('change', handleOptionChange);
    }
  });

  // Dropdown trigger now handled by dropdown.js

  // Currency toggle
  var currencyToggle = document.getElementById('currency-toggle');
  if (currencyToggle) {
    currencyToggle.addEventListener('change', function() {
      setCurrency(currencyToggle.checked ? 'USD' : 'GBP');
    });
  }

  var btnSave = document.getElementById('btn-save');
  if (btnSave) btnSave.addEventListener('click', saveCurrentState);

  var btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', resetCalculator);

  // Saves list — delegated click handlers
  var savesList = document.getElementById('saves-list');
  if (savesList) {
    savesList.addEventListener('click', function(e) {
      // Check for delete button
      var deleteBtn = e.target.closest('.calculator-save-delete');
      if (deleteBtn) {
        var deleteIndex = parseInt(deleteBtn.getAttribute('data-delete-index'), 10);
        deleteSavedConfig(deleteIndex, e);
        return;
      }

      // Check for save item
      var saveItem = e.target.closest('.calculator-save-item');
      if (saveItem) {
        var loadIndex = parseInt(saveItem.getAttribute('data-save-index'), 10);
        loadSavedConfig(loadIndex);
      }
    });
  }

  // Close dropdown on outside click — now handled by dropdown.js
}

//
//------- Initialize -------//
//

document.addEventListener("DOMContentLoaded", function() {
  // Hydrate from URL params (before table creation for currency)
  var hasURLState = hydrateFromURL();

  // Update currency UI
  updateCurrencySymbols();
  updateCurrencyToggle();

  // Create monthly table rows
  createMonthlyTableRows();

  // Hydrate monthly spends from URL (after table exists)
  if (hasURLState) {
    hydrateMonthlyFromURL();
  }

  // Read toggle state and update UI
  activeFlags = getCheckboxFlags();
  toggleOptionalElements(activeFlags);
  updateFeeGridLayout();

  // Render saved configs
  renderSavesList();

  // Setup event listeners
  setupEventListeners();


  // Initial calculation
  recalculate();
});
