/**
 * Notion Form Config
 * Shared configuration for Notion-powered dynamic forms.
 * Maps form types to database IDs, defines excluded property types,
 * and provides per-form settings.
 */

var EXCLUDED_TYPES = [
  'formula',
  'rollup',
  'created_time',
  'created_by',
  'last_edited_time',
  'last_edited_by',
  'relation',
  'files',
  'people',
  'unique_id',
  'verification',
  'button'
];

var FORMS = {
  'new-campaign': {
    envKey: 'NOTION_DATABASE_ID_NEW_CAMPAIGN',
    successMessage: 'Your campaign brief has been submitted.',
    propertyOrder: [],
    required: []
  },
  'new-proposal': {
    envKey: 'NOTION_DATABASE_ID_NEW_PROPOSAL',
    successMessage: 'Your proposal request has been submitted.',
    propertyOrder: [],
    required: []
  },
  'feedback': {
    envKey: 'NOTION_DATABASE_ID_FEEDBACK',
    successMessage: 'Thanks for your feedback.',
    propertyOrder: [],
    required: []
  },
  'access-support': {
    envKey: 'NOTION_DATABASE_ID_ACCESS_SUPPORT',
    successMessage: 'Thanks — we\'ll review your request and be in touch shortly.',
    propertyOrder: [],
    required: []
  }
};

/**
 * Resolve a form type to its full config.
 * Returns one of:
 *   { ok: false, reason: 'unknown' }      — form type not in registry
 *   { ok: false, reason: 'missing-env', envKey } — env var for db id not set
 *   { ok: true, databaseId, ...config }   — fully resolved
 */
function getFormConfig(formType) {
  var config = FORMS[formType];
  if (!config) {
    return { ok: false, reason: 'unknown' };
  }
  var databaseId = process.env[config.envKey];
  if (!databaseId) {
    return { ok: false, reason: 'missing-env', envKey: config.envKey };
  }
  return {
    ok: true,
    databaseId: databaseId,
    successMessage: config.successMessage,
    propertyOrder: config.propertyOrder,
    required: config.required
  };
}

module.exports = {
  EXCLUDED_TYPES: EXCLUDED_TYPES,
  FORMS: FORMS,
  getFormConfig: getFormConfig
};
