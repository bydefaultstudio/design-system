#!/usr/bin/env node

/**
 * bump-version.js
 * Auto-increments the patch number in VERSION on each Netlify deploy.
 * 1.3.1 → 1.3.2 → 1.3.3 ...
 *
 * To bump minor or major, edit VERSION manually before pushing.
 */

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '..', 'VERSION');
const current = fs.readFileSync(versionFile, 'utf8').trim();
const parts = current.split('.');

if (parts.length === 3) {
  parts[2] = String(Number(parts[2]) + 1);
} else if (parts.length === 2) {
  parts.push('1');
} else {
  console.error('Unexpected VERSION format:', current);
  process.exit(1);
}

const next = parts.join('.');
fs.writeFileSync(versionFile, next + '\n', 'utf8');
console.log(`[bump-version] ${current} → ${next}`);
