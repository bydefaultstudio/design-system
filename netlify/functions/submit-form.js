/**
 * Submit Form — Netlify Function
 * Creates a new page in a Notion database from form submission data.
 *
 * POST /api/submit-form
 * Body: { formType: "new-campaign", data: { "Field Name": value, ... } }
 */

var config = require('./_notion-config');

var NOTION_API_VERSION = '2022-06-28';
var NOTION_BASE_URL = 'https://api.notion.com/v1';

//
//------- Type Formatters -------//
//

var TYPE_FORMATTERS = {
  title: function(value) {
    return { title: [{ text: { content: String(value) } }] };
  },
  rich_text: function(value) {
    return { rich_text: [{ text: { content: String(value) } }] };
  },
  number: function(value) {
    var num = parseFloat(value);
    if (isNaN(num)) return null;
    return { number: num };
  },
  select: function(value) {
    return { select: { name: String(value) } };
  },
  status: function(value) {
    return { status: { name: String(value) } };
  },
  multi_select: function(value) {
    var items = Array.isArray(value) ? value : [value];
    return { multi_select: items.map(function(v) { return { name: String(v) }; }) };
  },
  date: function(value) {
    return { date: { start: String(value) } };
  },
  checkbox: function(value) {
    return { checkbox: Boolean(value) };
  },
  url: function(value) {
    return { url: String(value) };
  },
  email: function(value) {
    return { email: String(value) };
  },
  phone_number: function(value) {
    return { phone_number: String(value) };
  }
};

//
//------- Schema Fetch -------//
//

async function fetchDatabaseSchema(databaseId, apiKey) {
  var response = await fetch(NOTION_BASE_URL + '/databases/' + databaseId, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Notion-Version': NOTION_API_VERSION
    }
  });

  if (!response.ok) {
    var errorText = await response.text();
    throw new Error('Notion API error ' + response.status + ': ' + errorText);
  }

  var database = await response.json();
  return database.properties || {};
}

//
//------- Value Check -------//
//

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

//
//------- Handler -------//
//

exports.handler = async function submitForm(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  var body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  var formType = body.formType;
  var data = body.data;

  if (!formType || !data) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing formType or data' })
    };
  }

  var formConfig = config.getFormConfig(formType);

  if (!formConfig.ok) {
    if (formConfig.reason === 'unknown') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unknown form type: ' + formType })
      };
    }
    if (formConfig.reason === 'missing-env') {
      console.error('submit-form: env var ' + formConfig.envKey + ' not set for formType ' + formType);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Form not configured: set ' + formConfig.envKey + ' in Netlify environment variables' })
      };
    }
  }

  var apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error('submit-form: NOTION_API_KEY not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    var schema = await fetchDatabaseSchema(formConfig.databaseId, apiKey);
    var properties = {};
    var errors = [];

    for (var fieldName in data) {
      var schemaProp = schema[fieldName];

      if (!schemaProp) {
        continue;
      }

      if (config.EXCLUDED_TYPES.indexOf(schemaProp.type) !== -1) {
        continue;
      }

      var value = data[fieldName];

      if (isEmpty(value)) {
        if (schemaProp.type === 'title') {
          errors.push(fieldName + ' is required');
        }
        continue;
      }

      var formatter = TYPE_FORMATTERS[schemaProp.type];

      if (!formatter) {
        continue;
      }

      var formatted = formatter(value);

      if (formatted !== null) {
        properties[fieldName] = formatted;
      }
    }

    for (var propName in schema) {
      if (schema[propName].type === 'title' && !properties[propName]) {
        var isInData = data.hasOwnProperty(propName);
        if (!isInData || isEmpty(data[propName])) {
          errors.push(propName + ' is required');
        }
      }
    }

    if (errors.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errors.join(', ') })
      };
    }

    // Feedback submissions always get Status set to "New"
    if (formType === 'feedback') {
      properties['Status'] = { status: { name: 'New' } };
    }

    var response = await fetch(NOTION_BASE_URL + '/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: formConfig.databaseId },
        properties: properties
      })
    });

    if (!response.ok) {
      var errorText = await response.text();
      console.error('submit-form: Notion API error', response.status, errorText);

      if (response.status >= 400 && response.status < 500) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid submission data. Please check your entries.' })
        };
      }

      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Submission failed. Please try again.' })
      };
    }

    var result = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, pageId: result.id })
    };

  } catch (err) {
    console.error('submit-form: Unexpected error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};
