# repo-map skill

A token-efficient codebase index for Claude.

## Install (any repo)
1. Copy this folder to `.claude/repo-map/` in your repo root.
2. Make the script executable: `chmod +x .claude/repo-map/generate-map.sh`
3. Generate the map: `bash .claude/repo-map/generate-map.sh > repo-map.md`
4. Commit `repo-map.md` to the repo root.

## Use with Claude.ai Projects
Upload `repo-map.md` to your Project's knowledge base. Re-upload after meaningful changes.

## Use with Claude Code
Reference `repo-map.md` from your `CLAUDE.md` so it loads automatically.

## Tuning for the design-system repo
For `bydefaultstudio/design-system`, the CSS branch of the script will pick up your token custom properties (`--color-*`, `--space-*`, etc.) and BrandOS class selectors. Pair it with `ai-reference.md` — the map says *where*, ai-reference says *why*.

## When to regenerate
- New files, renames, or moved modules
- New exports or components
- Token additions in the design system
Skip regeneration for content-only edits.
