/**
 * Contact Form Handler — Google Apps Script
 *
 * Receives contact form submissions via POST. Sends an HTML email via Gmail
 * (with plain-text fallback) and creates a Notion database entry with
 * structured blocks for message + session journey.
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

// -- Composed title (used as both email subject and Notion row title) --
// Stored chip values are capitalised ('A project', 'A product', 'A chat'); the
// subject reads them in sentence flow ('I'm interested in a project'), so we
// lowercase the leading letter for the inline form.

function composeTitle(data) {
  var typeLabel = data.type || 'A general enquiry';
  var typeLower = typeLabel.charAt(0).toLowerCase() + typeLabel.slice(1);
  var name = (data.name || '').trim();
  if (!name) {
    return "Website Form | I'm here about " + typeLower;
  }
  return 'Website Form | ' + name + ", I'm here about " + typeLower;
}

// -- Gmail --

function sendEmail(data) {
  var subject = composeTitle(data);
  var meta = data.meta || {};
  var typeLabel = data.type || 'Something else';
  var timestamp = formatTimestamp(new Date());
  var pages = Array.isArray(meta.pagesViewed) ? meta.pagesViewed : [];
  var pagesArrow = pages.length ? pages.join(' → ') : 'n/a';
  var device = deriveDevice(meta.viewport);
  var referrer = stripToDomain(meta.referrer) || 'direct';

  var htmlBody = [
    '<h1 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px;">New contact form submission</h1>',
    '<p>',
    '  <strong>' + escapeHtml(data.name) + '</strong><br>',
    '  <a href="mailto:' + escapeHtml(data.email) + '">' + escapeHtml(data.email) + '</a><br>',
    '  ' + escapeHtml(typeLabel) + ' · Submitted ' + escapeHtml(timestamp),
    '</p>',
    '<h2>Message</h2>',
    '<p>' + (data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '<em>No additional message.</em>') + '</p>',
    '<hr style="border:0;border-top:1px solid #ddd;margin:24px 0;">',
    '<h2>How they got here</h2>',
    '<ul>',
    '  <li><strong>Landing page:</strong> ' + escapeHtml(meta.landingPage || '/') + '</li>',
    '  <li><strong>Pages visited:</strong> ' + escapeHtml(pagesArrow) + '</li>',
    '  <li><strong>Time on site:</strong> ' + escapeHtml(formatDuration(meta.totalTimeOnSite)) + '</li>',
    '  <li><strong>Time on form:</strong> ' + escapeHtml(formatDuration(meta.timeOnForm)) + '</li>',
    '  <li><strong>Device:</strong> ' + escapeHtml(device) + '</li>',
    '</ul>',
    '<hr style="border:0;border-top:1px solid #ddd;margin:24px 0;">',
    '<h2>Attribution</h2>',
    '<ul>',
    '  <li><strong>Referrer:</strong> ' + escapeHtml(referrer) + '</li>',
    '  <li><strong>UTM source:</strong> ' + escapeHtml(meta.source || 'direct') + '</li>',
    '  <li><strong>UTM medium:</strong> ' + escapeHtml(meta.medium || '—') + '</li>',
    '  <li><strong>UTM campaign:</strong> ' + escapeHtml(meta.campaign || '—') + '</li>',
    '</ul>'
  ].join('\n');

  var plainBody = [
    'New contact form submission',
    '',
    (data.name || ''),
    (data.email || ''),
    typeLabel + ' · Submitted ' + timestamp,
    '',
    'Message',
    '',
    data.message || 'No additional message.',
    '',
    '---',
    '',
    'How they got here',
    '',
    '- Landing page: ' + (meta.landingPage || '/'),
    '- Pages visited: ' + pagesArrow,
    '- Time on site: ' + formatDuration(meta.totalTimeOnSite),
    '- Time on form: ' + formatDuration(meta.timeOnForm),
    '- Device: ' + device,
    '',
    '---',
    '',
    'Attribution',
    '',
    '- Referrer: ' + referrer,
    '- UTM source: ' + (meta.source || 'direct'),
    '- UTM medium: ' + (meta.medium || '—'),
    '- UTM campaign: ' + (meta.campaign || '—')
  ].join('\n');

  GmailApp.sendEmail(GMAIL_RECIPIENT, subject, plainBody, { htmlBody: htmlBody });
}

// -- Notion --

function createNotionEntry(data) {
  var meta = data.meta || {};
  var pagesViewed = Array.isArray(meta.pagesViewed) ? meta.pagesViewed : [];
  var device = deriveDevice(meta.viewport);
  var referrer = stripToDomain(meta.referrer) || 'direct';

  var bodyBlocks = [
    h2Block('Message'),
    paragraphBlock(data.message || 'No additional message.'),
    dividerBlock(),
    h2Block('How they got here'),
    bulletBlock('Landing page: ' + (meta.landingPage || '/')),
    bulletBlock('Time on site: ' + formatDuration(meta.totalTimeOnSite)),
    bulletBlock('Time on form: ' + formatDuration(meta.timeOnForm)),
    bulletBlock('Device: ' + device),
    pagesToggleBlock(pagesViewed),
    dividerBlock(),
    h2Block('Attribution'),
    bulletBlock('Referrer: ' + referrer),
    bulletBlock('UTM source: ' + (meta.source || 'direct')),
    bulletBlock('UTM medium: ' + (meta.medium || '—')),
    bulletBlock('UTM campaign: ' + (meta.campaign || '—'))
  ];

  var properties = {
    'Title':          { title: [{ text: { content: composeTitle(data) } }] },
    'Name':           { rich_text: [{ text: { content: data.name || '' } }] },
    'Email':          { email: data.email || null },
    'Type':           { select: data.type ? { name: data.type } : null },
    'Source':         { select: { name: (meta.source || 'direct') } },
    'Status':         { status: { name: 'New' } },
    'Submitted Date': { date: { start: new Date().toISOString() } }
  };

  var payload = {
    parent: { database_id: NOTION_DB_ID },
    properties: properties,
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

// -- Notion block helpers --

// Notion caps each rich_text element at 2000 chars; longer values 400.
// Truncate at 1900 to leave headroom for any wrapping.
var NOTION_TEXT_LIMIT = 1900;
function truncateForNotion(s) {
  var str = String(s == null ? '' : s);
  return str.length > NOTION_TEXT_LIMIT ? str.slice(0, NOTION_TEXT_LIMIT) + '…' : str;
}

function h2Block(text) {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: truncateForNotion(text) } }] }
  };
}

function paragraphBlock(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: truncateForNotion(text) } }] }
  };
}

function bulletBlock(text) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: truncateForNotion(text) } }] }
  };
}

function dividerBlock() {
  return { object: 'block', type: 'divider', divider: {} };
}

function pagesToggleBlock(pages) {
  var children = pages.length
    ? pages.map(function (p) { return bulletBlock(p); })
    : [bulletBlock('(no pages recorded)')];
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: [{ type: 'text', text: { content: 'Pages visited (' + pages.length + ')' } }],
      children: children
    }
  };
}

// -- Formatting helpers --

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function deriveDevice(viewport) {
  if (!viewport) return 'Unknown';
  var formatted = String(viewport).replace('x', ' × ');
  var width = parseInt(String(viewport).split('x')[0], 10);
  if (!width || isNaN(width)) return 'Unknown (' + formatted + ')';
  if (width < 768) return 'Mobile (' + formatted + ')';
  if (width < 1024) return 'Tablet (' + formatted + ')';
  return 'Desktop (' + formatted + ')';
}

function stripToDomain(url) {
  if (!url) return '';
  var match = String(url).match(/^https?:\/\/([^\/]+)/);
  if (!match) return String(url);
  return match[1].replace(/^www\./, '');
}

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '0s';
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  if (mins === 0) return secs + 's';
  return mins + 'm ' + secs + 's';
}

function formatTimestamp(date) {
  return Utilities.formatDate(date, 'GMT', 'dd MMM yyyy, HH:mm') + ' GMT';
}
