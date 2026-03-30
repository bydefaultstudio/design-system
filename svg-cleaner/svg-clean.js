#!/usr/bin/env node

/**
 * Script Purpose: CLI tool for cleaning and optimising SVG files
 * Author: By Default Studio
 * Created: 2026-03-22
 * Version: 1.0.0
 * Last Updated: 2026-03-22
 */

const fs = require('fs');
const path = require('path');

console.error('svg-clean v1.0.0');

//
//------- Utility Functions -------//
//

// Parse CLI Arguments
function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    currentColor: false,
    icon: false,
    iconName: null,
    size: false,
    stripComments: false,
    minify: false,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--current-color':
        options.currentColor = true;
        break;
      case '--icon':
        options.icon = true;
        break;
      case '--icon-name':
        options.iconName = args[++i];
        break;
      case '--size':
        options.size = true;
        break;
      case '--strip-comments':
        options.stripComments = true;
        break;
      case '--minify':
        options.minify = true;
        break;
      case '-o':
      case '--output':
        options.output = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown flag: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

// Read All Data From stdin
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

// Print Help Text
function printHelp() {
  console.log(`
Usage: echo '<svg>...</svg>' | node svg-clean.js [OPTIONS]

Options:
  --current-color    Set all path fills to currentColor
  --icon             Wrap output in <div class="icn-svg">
  --icon-name NAME   Add data-icon attribute to the wrapper (use with --icon)
  --size             Remove width/height, add width="100%" height="100%"
  --strip-comments   Remove XML/HTML comments
  --minify           Collapse whitespace to single-line output
  -o, --output PATH  Write result to file instead of stdout
  -h, --help         Show this help message

Examples:
  echo '<svg>...</svg>' | node svg-clean.js
  echo '<svg>...</svg>' | node svg-clean.js --size -o assets/images/logos/logo.svg
  cat icon.svg | node svg-clean.js --strip-comments --minify
`);
}

// Strip XML/HTML Comments
function stripComments(svg) {
  return svg.replace(/<!--[\s\S]*?-->/g, '');
}

// Minify SVG to Single Line
function minifySVG(svg) {
  return svg
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

//
//------- Main Functions -------//
//

// Process SVG Code
function processSVG(svgCode, options = {}) {
  let processedCode = svgCode;

  // Remove xmlns attributes from root svg tag
  // Run twice to handle both xmlns and xmlns:xlink
  processedCode = processedCode.replace(
    /<svg([^>]*?)\s+xmlns(?::xlink)?="[^"]*"([^>]*?)>/g,
    '<svg$1$2>'
  );
  processedCode = processedCode.replace(
    /<svg([^>]*?)\s+xmlns(?::xlink)?="[^"]*"([^>]*?)>/g,
    '<svg$1$2>'
  );

  // Tidy root <svg> attributes based on flags
  processedCode = processedCode.replace(
    /<svg([^>]*?)>/,
    (match, attributes) => {
      let newAttributes = attributes;

      if (options.size) {
        newAttributes = newAttributes
          .replace(/\s+width="[^"]*"/gi, '')
          .replace(/\s+height="[^"]*"/gi, '');
        newAttributes += ' width="100%" height="100%"';
      }

      return `<svg${newAttributes}>`;
    }
  );

  // Process all <path> elements — set fill to currentColor (if enabled)
  if (options.currentColor) {
    processedCode = processedCode.replace(
      /<path([^>]*?)>/g,
      (match, attributes) => {
        if (attributes.includes('fill=')) {
          attributes = attributes.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        } else {
          attributes += ' fill="currentColor"';
        }

        if (attributes.includes('style=')) {
          attributes = attributes.replace(
            /style="([^"]*?)"/g,
            (styleMatch, styleContent) => {
              const newStyleContent = styleContent.replace(
                /fill\s*:\s*[^;]+/g,
                'fill: currentColor'
              );

              if (!styleContent.includes('fill:')) {
                return `style="${styleContent}; fill: currentColor"`;
              }

              return `style="${newStyleContent}"`;
            }
          );
        }

        return `<path${attributes}>`;
      }
    );
  }

  // Strip comments if requested
  if (options.stripComments) {
    processedCode = stripComments(processedCode);
  }

  // Minify if requested
  if (options.minify) {
    processedCode = minifySVG(processedCode);
  }

  let result = processedCode.trim();

  // Wrap in icon block if requested
  if (options.icon) {
    const dataAttr = options.iconName ? ` data-icon="${options.iconName}"` : '';
    result = `<div class="icn-svg"${dataAttr}>\n  ${result}\n</div>`;
  }

  return result;
}

//
//------- Initialize -------//
//

// Run CLI
async function run() {
  const options = parseArgs(process.argv);
  const input = await readStdin();

  if (!input.trim()) {
    console.error('Error: No SVG input received. Pipe SVG content via stdin.');
    process.exit(1);
  }

  const result = processSVG(input, options);

  if (options.output) {
    const outputPath = path.resolve(process.cwd(), options.output);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result);
    console.error(`Saved: ${options.output}`);
  } else {
    process.stdout.write(result);
  }
}

run().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
