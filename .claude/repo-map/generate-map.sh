#!/usr/bin/env bash
# generate-map.sh — emits repo-map.md to stdout
# Usage: bash generate-map.sh > repo-map.md
set -euo pipefail

EXCLUDES='node_modules|\.git|dist|build|\.next|\.cache|coverage|\.DS_Store|package-lock\.json|yarn\.lock|pnpm-lock\.yaml'

echo "# Repo Map"
echo ""
echo "_Generated: $(date -u +"%Y-%m-%d %H:%M UTC")_"
echo ""
echo "## Tree"
echo '```'
# Tree view, 4 levels deep, excluding noise
if command -v tree >/dev/null 2>&1; then
  tree -L 4 -I "${EXCLUDES//\\/}" --noreport
else
  find . -maxdepth 4 -type f | grep -Ev "$EXCLUDES" | sort
fi
echo '```'
echo ""
echo "## Symbol Index"
echo ""

# Walk source files and extract exports / top-level symbols
find . -type f \
  \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \
     -o -name "*.css" -o -name "*.scss" -o -name "*.md" -o -name "*.html" \
     -o -name "*.py" -o -name "*.json" \) \
  | grep -Ev "$EXCLUDES" \
  | sort \
  | while read -r file; do
      echo "### \`${file#./}\`"
      case "$file" in
        *.js|*.jsx|*.ts|*.tsx)
          grep -nE '^(export |export default |function |class |const [A-Z])' "$file" \
            | sed 's/^/- /' | head -30 || echo "- (no exports found)"
          ;;
        *.css|*.scss)
          # CSS custom properties + class selectors
          grep -nE '^\s*(--[a-z-]+:|\.[a-z][a-z0-9_-]*\s*\{)' "$file" \
            | sed 's/^/- /' | head -30 || echo "- (no tokens/classes found)"
          ;;
        *.py)
          grep -nE '^(def |class )' "$file" | sed 's/^/- /' | head -30 || true
          ;;
        *.md|*.html)
          # First H1/title for purpose
          head -5 "$file" | grep -E '^#|<title>' | sed 's/^/- /' || echo "- (doc)"
          ;;
        *.json)
          echo "- (config)"
          ;;
      esac
      echo ""
    done

echo "## Entry Points"
[ -f package.json ] && echo "- \`package.json\` present"
[ -f tsconfig.json ] && echo "- \`tsconfig.json\` present"
[ -f netlify.toml ] && echo "- \`netlify.toml\` present"
[ -f ai-reference.md ] && echo "- \`ai-reference.md\` — design system reference"
