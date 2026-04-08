#!/usr/bin/env node

/**
 * Script Purpose: CLI tool for cleaning and optimising SVG files
 * Author: By Default Studio
 * Created: 2026-03-22
 * Version: 1.3.0
 * Last Updated: 2026-04-07
 */

const fs = require('fs');
const path = require('path');

console.error('svg-clean v1.3.0');

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
    logo: false,
    logoName: null,
    size: null,
    standalone: false,
    stripComments: false,
    stripMetadata: false,
    precision: null,
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
      case '--logo':
        options.logo = true;
        break;
      case '--logo-name':
        options.logoName = args[++i];
        break;
      case '--size':
        options.size = true;
        break;
      case '--keep-size':
        options.size = false;
        break;
      case '--standalone':
        options.standalone = true;
        break;
      case '--strip-comments':
        options.stripComments = true;
        break;
      case '--strip-metadata':
        options.stripMetadata = true;
        break;
      case '--precision':
        options.precision = parseInt(args[++i], 10);
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

  // Resolve --size default based on context:
  // - --standalone (file for <img> use): keep original dimensions
  // - inline (default): apply width="100%" height="100%"
  // Explicit --size or --keep-size always wins over the default
  if (options.size === null) {
    options.size = !options.standalone;
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

Modes:
  Default (inline)   Strips xmlns, applies width="100%" height="100%"
                     Ready to paste directly into HTML
  --standalone       Re-adds xmlns, keeps original dimensions
                     For .svg files used via <img src="...">

Options:
  --current-color    Set all shape fills to currentColor (for theme support)
  --size             Force width="100%" height="100%" (default for inline mode)
  --keep-size        Keep original width/height (default for --standalone mode)
  --icon             Wrap output in <div class="icn-svg">
  --icon-name NAME   Add data-icon attribute to the wrapper (use with --icon)
  --logo             Wrap in <div class="svg-logo-NAME"> with aspect-ratio
  --logo-name NAME   Set the logo name (e.g. svg-logo-brand)
  --standalone       Re-add xmlns and XML declaration for standalone .svg files
  --strip-comments   Remove XML/HTML comments
  --strip-metadata   Remove data-* attributes and editor class names
  --precision N      Round decimal values to N decimal places
  --minify           Collapse whitespace and optimise path data
  -o, --output PATH  Write result to file instead of stdout
  -h, --help         Show this help message

Examples:
  # Inline SVG (strips xmlns, 100% sizing, currentColor)
  cat logo.svg | node svg-clean.js --current-color

  # Standalone .svg file (keeps colors and dimensions, adds xmlns)
  cat logo.svg | node svg-clean.js --standalone -o assets/images/logos/logo.svg

  # Icon for inline use
  cat icon.svg | node svg-clean.js --current-color --icon --icon-name "arrow-right"
`);
}

// Strip XML/HTML Comments
function stripComments(svg) {
  return svg.replace(/<!--[\s\S]*?-->/g, '');
}

// Strip Editor Metadata (data-* attributes, Illustrator class names)
function stripMetadata(svg) {
  let result = svg;
  // Remove data-name, data-id, and other editor data attributes
  result = result.replace(/\s+data-name="[^"]*"/g, '');
  result = result.replace(/\s+data-id="[^"]*"/g, '');
  // Remove Illustrator-style class attributes (cls-1, cls1, st0, etc.)
  result = result.replace(/\s+class="(?:cls|st)-?\d+"/g, '');
  return result;
}

// Round Decimal Values to N Places
function roundDecimals(svg, precision) {
  return svg.replace(/(\d+\.\d+)/g, (_match, num) => {
    return parseFloat(parseFloat(num).toFixed(precision)).toString();
  });
}

// Optimise Path Data (remove unnecessary spaces and commas)
function optimisePathData(svg) {
  return svg.replace(/\s+d="([^"]*)"/g, (_match, pathData) => {
    let optimised = pathData;
    // Replace commas with spaces (commas are optional separators)
    optimised = optimised.replace(/,/g, ' ');
    // Collapse multiple spaces
    optimised = optimised.replace(/\s{2,}/g, ' ');
    // Remove space after command letters
    optimised = optimised.replace(/([A-Za-z])\s+/g, '$1');
    // Remove space before negative numbers (the minus acts as separator)
    optimised = optimised.replace(/\s+(-)/g, '$1');
    return ` d="${optimised.trim()}"`;
  });
}

// Minify SVG to Single Line
function minifySVG(svg) {
  let result = svg;
  // Optimise path data first (before collapsing all whitespace)
  result = optimisePathData(result);
  result = result
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  return result;
}

// Sanitise Name (replace spaces and special characters with hyphens)
function sanitiseName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

//
//------- Main Functions -------//
//

// Process SVG Code
function processSVG(svgCode, options = {}) {
  let processedCode = svgCode;

  // Strip wrapping <div> elements (e.g. pasted from HTML with icn-svg or svg-logo wrappers)
  const svgMatch = processedCode.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    processedCode = svgMatch[0];
  }

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

  // Extract original width/height before modifying (needed for --logo aspect-ratio)
  let originalWidth = null;
  let originalHeight = null;

  if (options.logo) {
    const widthMatch = processedCode.match(/<svg[^>]*?\s+width="([^"]*?)"/i);
    const heightMatch = processedCode.match(/<svg[^>]*?\s+height="([^"]*?)"/i);
    if (widthMatch) originalWidth = widthMatch[1];
    if (heightMatch) originalHeight = heightMatch[1];
  }

  // Tidy root <svg> attributes based on flags
  // --logo and --icon apply size 100% automatically (SVG fills the wrapper)
  const applySize = options.size || options.logo || options.icon;

  processedCode = processedCode.replace(
    /<svg([^>]*?)>/,
    (_match, attributes) => {
      let newAttributes = attributes;

      if (applySize) {
        newAttributes = newAttributes
          .replace(/\s+width="[^"]*"/gi, '')
          .replace(/\s+height="[^"]*"/gi, '');
        newAttributes += ' width="100%" height="100%"';
      }

      // Re-add xmlns for standalone SVG files
      if (options.standalone) {
        newAttributes += ' xmlns="http://www.w3.org/2000/svg"';
      }

      return `<svg${newAttributes}>`;
    }
  );

  // Process all shape elements — set fill to currentColor (if enabled)
  // Covers: path, rect, circle, ellipse, polygon, polyline, line
  const applyCurrentColor = options.currentColor;

  if (applyCurrentColor) {
    processedCode = processedCode.replace(
      /<(path|rect|circle|ellipse|polygon|polyline|line)([^>]*?)(\/?)\s*>/g,
      (_match, tag, attributes, selfClose) => {
        if (attributes.includes('fill=')) {
          attributes = attributes.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        } else {
          attributes += ' fill="currentColor"';
        }

        if (attributes.includes('style=')) {
          attributes = attributes.replace(
            /style="([^"]*?)"/g,
            (_styleMatch, styleContent) => {
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

        return `<${tag}${attributes}${selfClose}>`;
      }
    );
  }

  // Strip comments if requested
  if (options.stripComments) {
    processedCode = stripComments(processedCode);
  }

  // Strip editor metadata if requested
  if (options.stripMetadata) {
    processedCode = stripMetadata(processedCode);
  }

  // Round decimals if requested
  if (options.precision !== null && options.precision !== undefined) {
    processedCode = roundDecimals(processedCode, options.precision);
  }

  // Minify if requested
  if (options.minify) {
    processedCode = minifySVG(processedCode);
  }

  let result = processedCode.trim();

  // Prepend XML declaration for standalone SVG files
  if (options.standalone) {
    result = '<?xml version="1.0" encoding="UTF-8"?>\n' + result;
  }

  // Wrap in logo block if requested (mutually exclusive with icon)
  if (options.logo) {
    const logoName = sanitiseName(options.logoName || 'default');
    const aspectStyle = (originalWidth && originalHeight)
      ? ` style="aspect-ratio: ${originalWidth} / ${originalHeight}"`
      : '';
    result = `<div class="svg-logo-${logoName}"${aspectStyle}>\n  ${result}\n</div>`;
  }

  // Wrap in icon block if requested
  if (options.icon && !options.logo) {
    const dataAttr = options.iconName ? ` data-icon="${sanitiseName(options.iconName)}"` : '';
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
