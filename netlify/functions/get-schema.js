/**
 * Get Schema — Netlify Function
 * Reads a Notion database schema and returns filtered, sorted properties
 * for dynamic form rendering.
 *
 * GET /api/get-schema?formType=new-campaign
 */

var config = require('./_notion-config');

var NOTION_API_VERSION = '2022-06-28';
var NOTION_BASE_URL = 'https://api.notion.com/v1';

exports.handler = async function getSchema(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  var formType = event.queryStringParameters && event.queryStringParameters.formType;

  if (!formType) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing formType parameter' })
    };
  }

  var formConfig = config.getFormConfig(formType);

  if (!formConfig) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unknown form type' })
    };
  }

  var apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error('get-schema: NOTION_API_KEY not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    var response = await fetch(NOTION_BASE_URL + '/databases/' + formConfig.databaseId, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Notion-Version': NOTION_API_VERSION
      }
    });

    if (!response.ok) {
      var errorText = await response.text();
      console.error('get-schema: Notion API error', response.status, errorText);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to load form schema' })
      };
    }

    var database = await response.json();
    var properties = database.properties || {};
    var filtered = [];

    for (var name in properties) {
      var prop = properties[name];
      if (config.EXCLUDED_TYPES.indexOf(prop.type) !== -1) {
        continue;
      }

      var field = {
        name: name,
        type: prop.type,
        required: prop.type === 'title' || formConfig.required.indexOf(name) !== -1,
        options: null
      };

      if (prop.type === 'select' && prop.select && prop.select.options) {
        field.options = prop.select.options.map(function(opt) {
          return { name: opt.name, color: opt.color };
        });
      }

      if (prop.type === 'multi_select' && prop.multi_select && prop.multi_select.options) {
        field.options = prop.multi_select.options.map(function(opt) {
          return { name: opt.name, color: opt.color };
        });
      }

      if (prop.type === 'status' && prop.status && prop.status.options) {
        field.options = prop.status.options.map(function(opt) {
          return { name: opt.name, color: opt.color };
        });
      }

      filtered.push(field);
    }

    var order = formConfig.propertyOrder;
    filtered.sort(function(a, b) {
      var aIndex = order.indexOf(a.name);
      var bIndex = order.indexOf(b.name);
      var aInOrder = aIndex !== -1;
      var bInOrder = bIndex !== -1;

      if (aInOrder && bInOrder) return aIndex - bIndex;
      if (aInOrder) return -1;
      if (bInOrder) return 1;

      if (a.type === 'title') return -1;
      if (b.type === 'title') return 1;

      return a.name.localeCompare(b.name);
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: formType,
        title: database.title ? database.title.map(function(t) { return t.plain_text; }).join('') : formType,
        successMessage: formConfig.successMessage,
        properties: filtered
      })
    };

  } catch (err) {
    console.error('get-schema: Unexpected error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Something went wrong loading the form' })
    };
  }
};
