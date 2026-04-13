/**
 * Contact Form Handler — Google Apps Script
 *
 * Receives contact form submissions via POST, sends a formatted email
 * via Gmail, then creates a Notion database entry.
 *
 * Deploy as: Web app → Execute as: Me → Who has access: Anyone
 *
 * Required script properties (Project Settings → Script Properties):
 *   GMAIL_RECIPIENT  — email address or group (e.g. hello@bydefault.studio)
 *   NOTION_API_KEY   — Notion integration token (secret_xxx)
 *   NOTION_DB_ID     — Notion database ID (340c3cbcb28e80d19e85f14d7dfd127e)
 */

var PROPS = PropertiesService.getScriptProperties();
var GMAIL_RECIPIENT = PROPS.getProperty('GMAIL_RECIPIENT');
var NOTION_API_KEY  = PROPS.getProperty('NOTION_API_KEY');
var NOTION_DB_ID    = PROPS.getProperty('NOTION_DB_ID');

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    sendEmail(data);
    createNotionEntry(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// -- Gmail --

function sendEmail(data) {
  var services = data.services || 'General';
  var budget = data.budget || 'Budget TBC';
  var subject = 'New enquiry — ' + services + ' · ' + budget;

  var meta = data.meta || {};
  var body = [
    'Name:     ' + (data.name || ''),
    'Email:    ' + (data.email || ''),
    'Services: ' + services,
    'Budget:   ' + budget,
    'Source:   ' + (meta.source || 'direct'),
    '',
    '---',
    '',
    data.message || 'No additional message.',
    '',
    '---',
    '',
    'Session context:',
    '  Referrer:     ' + (meta.referrer || 'direct'),
    '  Landing page: ' + (meta.landingPage || '/'),
    '  Pages viewed: ' + (meta.pagesViewed ? meta.pagesViewed.join(', ') : 'n/a'),
    '  Time on form: ' + (meta.timeOnForm || 0) + 's',
    '  Viewport:     ' + (meta.viewport || 'unknown'),
    '  UTM source:   ' + (meta.source || 'direct'),
    '  UTM medium:   ' + (meta.medium || ''),
    '  UTM campaign: ' + (meta.campaign || '')
  ].join('\n');

  GmailApp.sendEmail(GMAIL_RECIPIENT, subject, body);
}

// -- Notion --

function createNotionEntry(data) {
  var meta = data.meta || {};

  // Build page body with message + session metadata
  var bodyBlocks = [];

  // Message paragraph
  bodyBlocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: data.message || '' } }]
    }
  });

  // Divider
  bodyBlocks.push({ object: 'block', type: 'divider', divider: {} });

  // Session metadata as a callout
  var metaLines = [
    'Referrer: ' + (meta.referrer || 'direct'),
    'Landing page: ' + (meta.landingPage || '/'),
    'Pages viewed: ' + (meta.pagesViewed ? meta.pagesViewed.join(' → ') : 'n/a'),
    'Time on form: ' + (meta.timeOnForm || 0) + 's',
    'Viewport: ' + (meta.viewport || 'unknown'),
    'UTM: ' + (meta.source || 'direct') + (meta.medium ? ' / ' + meta.medium : '') + (meta.campaign ? ' / ' + meta.campaign : '')
  ].join('\n');

  bodyBlocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: 'emoji', emoji: '📊' },
      rich_text: [{ type: 'text', text: { content: metaLines } }]
    }
  });

  var payload = {
    parent: { database_id: NOTION_DB_ID },
    properties: {
      'Name':           { title: [{ text: { content: data.name || '' } }] },
      'Email':          { email: data.email || null },
      'Services':       { multi_select: toMultiSelect(data.services) },
      'Budget':         { select: data.budget ? { name: data.budget } : null },
      'Source':         { select: { name: (meta.source || 'direct') } },
      'Message':        { rich_text: [{ text: { content: data.message || '' } }] },
      'Status':         { status: { name: 'New' } },
      'Submitted Date': { date: { start: new Date().toISOString() } }
    },
    children: bodyBlocks
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + NOTION_API_KEY,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch('https://api.notion.com/v1/pages', options);
  var code = response.getResponseCode();

  if (code < 200 || code >= 300) {
    console.error('Notion API error (' + code + '):', response.getContentText());
  }
}

function toMultiSelect(value) {
  if (!value) return [];
  return value.split(',').map(function (s) {
    return { name: s.trim() };
  });
}
