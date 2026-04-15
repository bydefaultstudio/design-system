#!/usr/bin/env node
/**
 * Watcher for studio content. Re-runs the full generator on any .md change.
 * Uses fs.watch to avoid adding chokidar as a dependency.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const STUDIO_ROOT = path.resolve(__dirname, "..", "..");
const WATCH_DIRS = [
  path.join(STUDIO_ROOT, "cms", "articles"),
  path.join(STUDIO_ROOT, "cms", "work"),
  path.join(STUDIO_ROOT, "cms"), // _config.json + generator updates via templates
  path.join(__dirname, "templates")
];

const RERUN_EXTS = new Set([".md", ".json", ".html", ".js"]);
let debounce = null;
let running = false;

function runGenerator() {
  if (running) return;
  running = true;
  console.log("\n→ regenerating studio content...");
  const result = spawnSync("node", [path.join(__dirname, "generate-studio.js")], {
    stdio: "inherit"
  });
  running = false;
  if (result.status !== 0) {
    console.log("  (generator errored — fix the issue above and save again)\n");
  }
}

function schedule() {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(runGenerator, 120);
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    const ext = path.extname(filename);
    if (!RERUN_EXTS.has(ext)) return;
    console.log(`   • changed: ${path.join(dir, filename)}`);
    schedule();
  });
  console.log(`watching ${dir}`);
}

console.log("Studio content watcher. Ctrl+C to stop.\n");
WATCH_DIRS.forEach(watchDir);
runGenerator(); // initial build
