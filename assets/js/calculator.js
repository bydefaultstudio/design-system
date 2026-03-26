/**
 * Script Purpose: CPM & Spend Calculator
 * Calculates campaign impressions, fees, payouts, and margins based on monthly spend
 * Supports URL-driven and checkbox-driven feature toggles for optional fields
 * Version: 1.1.0
 */

console.log("CPM Calculator v1.1.0");

//
//------- State -------//
//

var activeFlags = [];

//
//------- Utility Functions -------//
//

// Parse URL query parameters for feature flags
function getFeatureFlagsFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var featuresParam = params.get('f');
  if (!featuresParam) return [];

  var flags = featuresParam.split(',').map(function(f) { return f.trim().toLowerCase(); });
  var validFlags = ['pf', 'af', 'ah', 'pm'];
  return flags.filter(function(flag) { return validFlags.indexOf(flag) !== -1; });
}

// Read active flags from checkbox state
function getCheckboxFlags() {
  var flags = [];
  var codes = ['af', 'ah', 'pf', 'pm'];

  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox && checkbox.checked) {
      flags.push(code);
    }
  });

  return flags;
}

// Update URL to reflect current flags without page reload
function updateUrlFromFlags(flags) {
  var url = new URL(window.location);
  if (flags.length > 0) {
    url.searchParams.set('f', flags.join(','));
  } else {
    url.searchParams.delete('f');
  }
  window.history.replaceState({}, '', url);
}

// Set checkbox states to match flags
function syncCheckboxesToFlags(flags) {
  var codes = ['af', 'ah', 'pf', 'pm'];

  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox) {
      checkbox.checked = flags.indexOf(code) !== -1;
    }
  });

  // Auto-open details if any flags are active
  var details = document.getElementById('calculator-options');
  if (details && flags.length > 0) {
    details.open = true;
  }
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

// Handle checkbox change
function handleOptionChange() {
  activeFlags = getCheckboxFlags();
  toggleOptionalElements(activeFlags);
  recalculate();
}

// Format currency value
function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
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

// Calculate publisher payout (from net spend after fees)
function calculatePublisherPayout(netSpend, payoutPercentage) {
  if (!payoutPercentage || payoutPercentage <= 0) return 0;
  return netSpend * (payoutPercentage / 100);
}

// Calculate partner margin (30% of net spend after fees)
function calculatePartnerMargin(netSpend) {
  return netSpend * 0.30;
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

  // Calculate fees first (deducted from total campaign spend)
  var agencyEarnings = inputs.featureFlags.indexOf('af') !== -1
    ? calculateAgencyEarnings(impressions, inputs.agencyFeeCPM)
    : 0;
  var adHostingCost = inputs.featureFlags.indexOf('ah') !== -1
    ? calculateAdHostingCost(impressions, inputs.adHostingFeeCPM)
    : 0;

  // Calculate net spend (after fees are deducted)
  var netSpend = monthSpend - agencyEarnings - adHostingCost;

  // Split net spend: 70% publisher, 30% partner margin
  var publisherPayout = inputs.featureFlags.indexOf('pf') !== -1
    ? calculatePublisherPayout(netSpend, inputs.publisherPayoutPercent)
    : 0;
  var partnerMargin = inputs.featureFlags.indexOf('pm') !== -1
    ? calculatePartnerMargin(netSpend)
    : 0;

  return {
    spend: monthSpend,
    impressions: impressions,
    agencyEarnings: agencyEarnings,
    adHostingCost: adHostingCost,
    publisherPayout: publisherPayout,
    partnerMargin: partnerMargin
  };
}

// Update campaign overview section
function updateCampaignOverview(inputs) {
  var totalImpressions = calculateImpressions(inputs.totalCampaignSpend, inputs.campaignCPM);
  var impressionsInput = document.getElementById('calculated-impressions');
  impressionsInput.value = formatNumber(totalImpressions);
}

// Update monthly table row
function updateTableRow(row, monthIndex, monthName, values, inputs) {
  var cells = row.querySelectorAll('td');

  // Index 2: Impressions (calculated)
  cells[2].textContent = formatNumber(values.impressions);

  // Index 3: Agency earnings
  if (cells[3]) cells[3].textContent = formatCurrency(values.agencyEarnings);

  // Index 4: Ad hosting cost
  if (cells[4]) cells[4].textContent = formatCurrency(values.adHostingCost);

  // Index 5: Publisher payout
  if (cells[5]) cells[5].textContent = formatCurrency(values.publisherPayout);

  // Index 6: Partner margin
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
    if (inputs.featureFlags.indexOf('pm') !== -1) {
      totalPartnerMargin += monthValues.partnerMargin;
    }
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
  if (inputs.featureFlags.indexOf('pm') !== -1) {
    document.getElementById('total-partner-margin').textContent = formatCurrency(totalPartnerMargin);
  }
}

// Create monthly table rows
function createMonthlyTableRows() {
  var months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var tbody = document.getElementById('monthly-table-body');
  tbody.innerHTML = '';

  months.forEach(function(monthName, index) {
    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + monthName + '</td>' +
      '<td><input type="number" class="calculator-input calculator-input-inline" data-month-index="' + index + '" min="0" value="0" /></td>' +
      '<td class="calculator-output-cell">0</td>' +
      '<td data-opt="af" class="calculator-output-cell">£0.00</td>' +
      '<td data-opt="ah" class="calculator-output-cell">£0.00</td>' +
      '<td data-opt="pf" class="calculator-output-cell">£0.00</td>' +
      '<td data-opt="pm" class="calculator-output-cell">£0.00</td>';
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
//------- Event Listeners -------//
//

// Setup event listeners for all inputs
function setupEventListeners() {
  // Global input listeners
  var globalInputs = [
    'campaign-cpm',
    'agency-fee-cpm',
    'ad-hosting-fee-cpm',
    'publisher-payout',
    'total-campaign-spend'
  ];

  globalInputs.forEach(function(inputId) {
    var input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', recalculate);
      input.addEventListener('change', recalculate);
    }
  });

  // Monthly spend input listeners (delegated)
  var tableBody = document.getElementById('monthly-table-body');
  if (tableBody) {
    tableBody.addEventListener('input', function(e) {
      if (e.target.classList.contains('calculator-input-inline')) {
        recalculate();
      }
    });
    tableBody.addEventListener('change', function(e) {
      if (e.target.classList.contains('calculator-input-inline')) {
        recalculate();
      }
    });
  }

  // Option checkbox listeners
  var codes = ['af', 'ah', 'pf', 'pm'];
  codes.forEach(function(code) {
    var checkbox = document.getElementById('opt-' + code);
    if (checkbox) {
      checkbox.addEventListener('change', handleOptionChange);
    }
  });
}

//
//------- Initialize -------//
//

document.addEventListener("DOMContentLoaded", function() {
  // Parse flags from URL
  activeFlags = getFeatureFlagsFromUrl();

  // Sync checkboxes to match URL flags
  syncCheckboxesToFlags(activeFlags);

  // Create monthly table rows
  createMonthlyTableRows();

  // Toggle optional elements
  toggleOptionalElements(activeFlags);

  // Setup event listeners
  setupEventListeners();

  // Initial calculation
  recalculate();
});
