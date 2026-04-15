/**
 * Front-matter schema validation for studio content.
 * Pure functions — returns { valid, errors } without throwing.
 */

"use strict";

const REQUIRED_SHARED = ["type", "title", "synopsis", "date"];
const REQUIRED_CASE_STUDY = ["client"];
const VALID_TYPES = ["article", "case-study"];
const VALID_STATUSES = ["published", "draft"];

function validate(data, sourcePath) {
  const errors = [];

  REQUIRED_SHARED.forEach((key) => {
    if (!data[key] || String(data[key]).trim() === "") {
      errors.push(`${sourcePath}: missing required field \`${key}\``);
    }
  });

  if (data.type && !VALID_TYPES.includes(data.type)) {
    errors.push(
      `${sourcePath}: invalid \`type\` "${data.type}" — must be one of: ${VALID_TYPES.join(", ")}`
    );
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(
      `${sourcePath}: invalid \`status\` "${data.status}" — must be: ${VALID_STATUSES.join(" | ")}`
    );
  }

  if (data.type === "case-study") {
    REQUIRED_CASE_STUDY.forEach((key) => {
      if (!data[key] || String(data[key]).trim() === "") {
        errors.push(`${sourcePath}: case-study missing required field \`${key}\``);
      }
    });
  }

  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push(`${sourcePath}: \`date\` "${data.date}" is not a valid ISO date`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validate };
