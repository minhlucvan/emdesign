#!/usr/bin/env bash
# sync-from-template.sh — Re-baseline an example from the canonical engine templates.
#
# Usage:  ./sync-from-template.sh <example-name>
#         ./sync-from-template.sh --all
#
# What it does:
#   1. Overwrites .claude/agents/, .claude/commands/mds/, .claude/skills/, .claude/workflows/
#      from the canonical template at apps/workspace/templates/claude/
#   2. Overwrites boilerplate files (postcss.config.js, .storybook/main.ts, .storybook/preview.tsx,
#      src/index.css) from the canonical example template
#      at apps/workspace/templates/example/ (NOT src/active-design-system.css — that's a runtime file)
#   3. Warns if design-systems/atelier/ differs from the canonical copy
#   4. Does NOT touch: src/generated/, src/components/, __screenshots__/, package.json,
#      emdesign.config.json, tailwind.config.js (these are example-specific)
#
# After syncing, verify with: git diff --stat

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
CLAUDE_TEMPLATE="$ROOT/apps/workspace/templates/claude"
EXAMPLE_TEMPLATE="$ROOT/apps/workspace/templates/example"
CANONICAL_ATELIER="$ROOT/design-systems/atelier"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

sync_example() {
  local name="$1"
  local dir="$HERE/$name"

  if [ ! -d "$dir" ]; then
    echo -e "${RED}Error: example '$name' not found at $dir${NC}" >&2
    return 1
  fi

  echo -e "${GREEN}=== Syncing example: $name${NC}"

  # --- .claude/ files — always overwrite from canonical template ---
  for sub in agents commands/mds skills workflows; do
    local src="$CLAUDE_TEMPLATE/$sub"
    local dst="$dir/.claude/$sub"
    if [ -d "$src" ]; then
      mkdir -p "$dst"
      echo "  .claude/$sub/  ← template"
      rsync -a --delete "$src/" "$dst/"
    fi
  done

  # --- .claude/commands/mds/system/update.md — only exists in newer template ---
  local mds_dst="$dir/.claude/commands/mds"
  mkdir -p "$mds_dst/system"
  for f in "$CLAUDE_TEMPLATE"/commands/mds/system/*; do
    if [ -f "$f" ]; then
      cp "$f" "$mds_dst/system/"
    fi
  done

  # --- Boilerplate files from example template (only if they haven't been customized) ---
  # NOTE: src/active-design-system.css is intentionally NOT synced — it's a runtime file
  # rewritten by `emdesign use <id>` to point at the active design system.
  local boilerplate_files=(
    "postcss.config.js"
    ".storybook/main.ts"
    ".storybook/preview.tsx"
    "src/index.css"
  )

  for rel in "${boilerplate_files[@]}"; do
    local src="$EXAMPLE_TEMPLATE/$rel"
    local dst="$dir/$rel"
    if [ -f "$src" ]; then
      mkdir -p "$(dirname "$dst")"
      if [ ! -f "$dst" ]; then
        cp "$src" "$dst"
        echo -e "  $rel  ${YELLOW}+ created (missing)${NC}"
      else
        # Check if it differs from template
        if ! cmp -s "$src" "$dst"; then
          echo -e "  $rel  ${YELLOW}⚠ differs from template — copy anyway? (yes)${NC}"
          cp "$src" "$dst"
          echo -e "  $rel  ← template (overwritten)"
        else
          echo "  $rel  ✓ up to date"
        fi
      fi
    fi
  done

  # --- Check atelier design system sync status ---
  if [ -d "$dir/design-systems/atelier" ]; then
    echo ""
    local atelier_diff
    atelier_diff=$(diff -rq "$CANONICAL_ATELIER" "$dir/design-systems/atelier" 2>/dev/null | grep -v 'graph.json' | grep -v 'node_modules' | head -20 || true)
    if [ -n "$atelier_diff" ]; then
      echo -e "  ${YELLOW}⚠ design-systems/atelier/ differs from canonical:${NC}"
      echo "$atelier_diff" | sed 's/^/    /'
      echo -e "  ${YELLOW}  Run the following to sync:${NC}"
      echo "    rsync -a --delete \"$CANONICAL_ATELIER/\" \"$dir/design-systems/atelier/\" --exclude graph.json"
    else
      echo -e "  design-systems/atelier/  ${GREEN}✓ matches canonical${NC}"
    fi
  fi

  # --- Remove stale build artifacts ---
  if [ -d "$dir/storybook-static" ]; then
    echo -e "  ${YELLOW}🧹 removing storybook-static/ (build artifact)${NC}"
    rm -rf "$dir/storybook-static"
  fi
  if [ -d "$dir/node_modules/.cache" ]; then
    echo -e "  ${YELLOW}🧹 removing node_modules/.cache/${NC}"
    rm -rf "$dir/node_modules/.cache"
  fi
  if [ -d "$dir/test-results" ]; then
    echo -e "  ${YELLOW}🧹 removing test-results/ (test artifact)${NC}"
    rm -rf "$dir/test-results"
  fi

  echo -e "${GREEN}✓ $name synced${NC}"
  echo ""
}

# --- Main ---
if [ $# -eq 0 ]; then
  echo "Usage: $0 <example-name> | --all"
  echo ""
  echo "Examples:"
  for d in "$HERE"/*/; do
    basename "$d"
  done
  exit 1
fi

if [ "$1" = "--all" ]; then
  for d in "$HERE"/*/; do
    name=$(basename "$d")
    # Skip hidden dirs and the sync script itself
    [[ "$name" == .* || "$name" == node_modules || "$name" == _* || "$name" == sync-from-template.sh ]] && continue
    sync_example "$name"
  done
else
  sync_example "$1"
fi
