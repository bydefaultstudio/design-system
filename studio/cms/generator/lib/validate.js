/**
 * Front-matter schema validation for studio content.
 * Pure functions — returns { valid, errors } without throwing.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const REQUIRED_SHARED = ["type", "title", "synopsis", "date"];
const REQUIRED_CASE_STUDY = ["client"];
const VALID_TYPES = ["article", "case-study"];
const VALID_STATUSES = ["published", "draft"];
const VALID_LAYOUTS = ["editorial", "cover"];

// Logo sprite is built by studio/cms/generator/build-logo-sprite.js into
// studio/assets/images/svg-logos/_sprite.svg. Read it once at module load
// and extract every <symbol id="..."> so we can validate front-matter
// `logo:` values against the canonical client list.
const LOGO_SPRITE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "assets",
  "images",
  "svg-logos",
  "_sprite.svg"
);

function loadLogoIds() {
  if (!fs.existsSync(LOGO_SPRITE_PATH)) {
    throw new Error(
      `logo sprite missing at ${LOGO_SPRITE_PATH} — run \`npm run build:logos\` (or \`npm run gen\`) to build it`
    );
  }
  const sprite = fs.readFileSync(LOGO_SPRITE_PATH, "utf8");
  const ids = [];
  const re = /<symbol\s+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(sprite)) !== null) {
    // Skip avatar variants — front-matter references the base client id.
    if (!m[1].endsWith("-avatar")) ids.push(m[1]);
  }
  if (ids.length === 0) {
    throw new Error(
      `logo sprite at ${LOGO_SPRITE_PATH} contains no <symbol> entries — sprite may be malformed`
    );
  }
  return ids;
}

// Lazy-loaded so requiring this module doesn't crash when the sprite
// hasn't been built yet (e.g. fresh checkout, watch mode without prior gen).
// First validate() call materialises the list.
let _validLogoIds = null;
function getValidLogoIds() {
  if (_validLogoIds === null) {
    _validLogoIds = loadLogoIds();
  }
  return _validLogoIds;
}

// Mechanical slug for the validator's "did you mean" hint. Lowercase, strip
// apostrophes, collapse non-alphanumeric runs to single hyphens. Note: this
// produces the right id for multi-word clients with spaces ("Lift Labs" →
// "lift-labs"), but not for single-word brands the brand spells as one word
// ("BlackDoctor" → already one word, slug is correct as "blackdoctor"). For
// long client names like "Comcast NBCUniversal LIFT Labs" the slug won't
// match the sprite's short brand mark — that's why the full registry is
// always shown alongside the suggestion.
function slugifyClient(name) {
  return String(name)
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  if (data.featured !== undefined && typeof data.featured !== "boolean") {
    errors.push(`${sourcePath}: \`featured\` must be a boolean (true or false)`);
  }

  if (data.layout !== undefined && !VALID_LAYOUTS.includes(data.layout)) {
    errors.push(
      `${sourcePath}: invalid \`layout\` "${data.layout}" — must be one of: ${VALID_LAYOUTS.join(", ")}`
    );
  }

  if (data.logo !== undefined) {
    if (typeof data.logo !== "string") {
      errors.push(`${sourcePath}: \`logo\` must be a string client id`);
    } else {
      const validLogoIds = getValidLogoIds();
      if (!validLogoIds.includes(data.logo)) {
        const suggested = data.client ? slugifyClient(data.client) : null;
        const hint =
          suggested && validLogoIds.includes(suggested)
            ? ` Did you mean \`${suggested}\` (derived from client "${data.client}")?`
            : "";
        errors.push(
          `${sourcePath}: \`logo: ${data.logo}\` not found in logo sprite.${hint} Valid ids: ${validLogoIds.join(", ")}`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validate };
