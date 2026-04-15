---
name: repo-map
description: Use this skill at the start of any task that touches a codebase containing a repo-map.md file. Read repo-map.md FIRST to locate relevant files and symbols, then open only the specific files needed. This avoids speculative grepping and reduces token usage on multi-file codebases. Trigger whenever the user asks to find, edit, refactor, or understand code in a repo that has been mapped.
---

# Repo Map

## Purpose
A compact, token-efficient index of the codebase. Lets Claude jump straight to the right files instead of exploring blindly.

## How to use
1. **Always read `repo-map.md` first** before opening any source files.
2. Use the tree to understand structure; use the symbol index to find where a function, class, component, or token lives.
3. Only open the specific files the map points you to.
4. If `repo-map.md` is missing or stale (older than the files it references), tell the user to re-run `generate-map.sh`.

## Regenerating the map
Run from the repo root:
```bash
bash .claude/repo-map/generate-map.sh > repo-map.md
```
Re-run after meaningful structural changes (new modules, renamed exports, new components).

## What the map contains
- **Tree**: directory structure, excluding `node_modules`, `dist`, `.git`, build artifacts, lockfiles
- **Symbol index**: per file, a one-line purpose + exported symbols (functions, classes, components, CSS custom properties for design-system repos)
- **Entry points**: package.json `main`/`exports`, key config files

## What it does NOT contain
Full file contents. The map is a pointer, not a replacement for reading files.
