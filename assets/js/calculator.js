/**
 * Script Purpose: CPM & Spend Calculator
 * Calculates campaign impressions, fees, payouts, and margins based on monthly spend
 * Supports checkbox-driven feature toggles for optional fields
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

// Handle checkbox change
function handleOptionChange() {
  activeFlags = getCheckboxFlags();
  toggleOptionalElements(activeFlags);
  syncPublisherNetDefaults();
  recalculate();
}

// When partner share toggle changes, sync net percentage
function syncPublisherNetDefaults() {
  var pfActive = activeFlags.indexOf('pf') !== -1;
  var publisherInput = document.getElementById('publisher-payout');
  var netInput = document.getElementById('partner-margin-payout');

  if (pfActive) {
    // Partner share active — sync net from current partner share value
    syncPartnerFromPublisher();
  } else {
    // Partner share off — reset to defaults
    if (publisherInput) publisherInput.value = 70;
    if (netInput) netInput.value = 30;
  }
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
  if (!nameInput || !header) return;

  var name = nameInput.value.trim();
  header.textContent = name || 'Partner';
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

  // Calculate fees first (deducted from total campaign spend)
  var agencyEarnings = inputs.featureFlags.indexOf('af') !== -1
    ? calculateAgencyEarnings(impressions, inputs.agencyFeeCPM)
    : 0;
  var adHostingCost = inputs.featureFlags.indexOf('ah') !== -1
    ? calculateAdHostingCost(impressions, inputs.adHostingFeeCPM)
    : 0;

  // Calculate net spend (after fees are deducted)
  var netSpend = monthSpend - agencyEarnings - adHostingCost;

  // Split net spend between partner share and net
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

  // Index 5: Partner share
  if (cells[5]) cells[5].textContent = formatCurrency(values.publisherPayout);

  // Index 6: Net
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
      '<td class="calculator-output-cell">£0.00</td>';
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
    'total-campaign-spend'
  ];

  globalInputs.forEach(function(inputId) {
    var input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', recalculate);
      input.addEventListener('change', recalculate);
    }
  });

  // Partner share and net inputs sync each other
  var publisherInput = document.getElementById('publisher-payout');
  if (publisherInput) {
    publisherInput.addEventListener('input', function() {
      syncPartnerFromPublisher();
      recalculate();
    });
    publisherInput.addEventListener('change', function() {
      syncPartnerFromPublisher();
      recalculate();
    });
  }

  var partnerInput = document.getElementById('partner-margin-payout');
  if (partnerInput) {
    partnerInput.addEventListener('input', function() {
      syncPublisherFromPartner();
      recalculate();
    });
    partnerInput.addEventListener('change', function() {
      syncPublisherFromPartner();
      recalculate();
    });
  }

  // Partner name updates table header
  var partnerNameInput = document.getElementById('partner-name');
  if (partnerNameInput) {
    partnerNameInput.addEventListener('input', updatePartnerShareHeader);
    partnerNameInput.addEventListener('change', updatePartnerShareHeader);
  }

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
  var codes = ['af', 'ah', 'pf'];
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
  // Create monthly table rows
  createMonthlyTableRows();

  // Toggle optional elements (none active by default)
  toggleOptionalElements(activeFlags);

  // Setup event listeners
  setupEventListeners();

  // Initial calculation
  recalculate();
});
