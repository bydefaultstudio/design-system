#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DOCS_DIR = path.join(__dirname, '..');  // ../ (docs/)
const OUTPUT_DIR = path.join(__dirname, '..', 'site');  // ../site/

console.log('👀 Watching for changes in documentation files...');
console.log('📁 Watching directory:', DOCS_DIR);
console.log('📁 Output directory:', OUTPUT_DIR);
console.log('🔄 Auto-regenerating HTML when files change...\n');

function regenerateDocs() {
  console.log('🔄 File changed, regenerating documentation...');
  exec('node generate-docs.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error regenerating docs:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    console.log('✅ Documentation regenerated successfully');
    console.log('🌐 Visit http://localhost:8080 to view changes\n');
  });
}

// Watch for changes to markdown files
fs.watch(DOCS_DIR, { recursive: false }, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    console.log(`📝 ${eventType}: ${filename}`);
    regenerateDocs();
  }
});

// Watch for changes to template
fs.watchFile(path.join(__dirname, 'template.html'), (curr, prev) => {
  console.log('🔧 Template updated, regenerating...');
  regenerateDocs();
});

// Watch for changes to generator script
fs.watchFile(path.join(__dirname, 'generate-docs.js'), (curr, prev) => {
  console.log('🔧 Generator script updated, reloading...');
  regenerateDocs();
});

// Watch for changes to assets
const assetsDir = path.join(__dirname, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.watch(assetsDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`🎨 ${eventType}: assets/${filename}`);
      regenerateDocs();
    }
  });
}

console.log('✅ File watcher started successfully!');
console.log('💡 Tip: Keep this running while editing documentation');
console.log('🛑 Press Ctrl+C to stop watching\n');

process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  process.exit(0);
});

