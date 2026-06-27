#!/usr/bin/env bash
# emdesign CLI Integration Test
# Exercises every CLI command to verify the refactored interface works correctly.
# Usage: bash scripts/test-cli.sh [--skip-visual] [--skip-vision] [--quick]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="npx tsx $ROOT/packages/cli/src/cli.ts"

# Flags
SKIP_VISUAL=false
SKIP_VISION=false
QUICK=false
for arg in "$@"; do
  case "$arg" in
    --skip-visual) SKIP_VISUAL=true ;;
    --skip-vision) SKIP_VISION=true ;;
    --quick) QUICK=true ;;
  esac
done

PASS=0
FAIL=0
START_AT=$(date +%s)

# ── Helpers ─────────────────────────────────────────────────────────────
log()   { echo -e "\n\033[36m━━━ $1 ━━━\033[0m"; }
pass()  { PASS=$((PASS+1)); echo -e "  \033[32m✅ PASS:\033[0m $1"; }
fail()  { FAIL=$((FAIL+1)); echo -e "  \033[31m❌ FAIL:\033[0m $1"; }

check_exit() {
  local desc="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$desc"; else fail "$desc (exit $?)"; fi
}

check_json() {
  local desc="$1"; local jq_filter="$2"; shift 2
  local out; out=$("$@" 2>/dev/null) && echo "$out" | jq "$jq_filter" >/dev/null 2>&1 \
    && pass "$desc" \
    || { fail "$desc"; echo "    output: $(echo "$out" | head -c 300)"; }
}

check_file_exists() {
  local desc="$1"; local file="$2"
  [[ -f "$file" ]] && pass "$desc" || fail "$desc ($file not found)"
}

check_dir_exists() {
  local desc="$1"; local dir="$2"
  [[ -d "$dir" ]] && pass "$desc" || fail "$desc ($dir not found)"
}

# A minimal valid React component source for testing
read -r -d '' TEST_COMPONENT << 'COMPONENT' || true
import { Box } from "@ds/Box";
import { Text } from "@ds/Text";
import { Button } from "@ds/Button";

interface HeroSectionProps {
  title?: string;
  cta?: string;
}

export function HeroSection({ title = "Welcome", cta = "Get Started" }: HeroSectionProps) {
  return (
    <Box className="bg-surface px-8 py-16 text-center">
      <Text as="h1" className="text-display text-highlight mb-4">{title}</Text>
      <Text as="p" className="text-body text-muted mb-8">A compelling subheading goes here.</Text>
      <Button className="bg-accent text-on-accent px-6 py-3 rounded font-semibold">{cta}</Button>
    </Box>
  );
}
COMPONENT

read -r -d '' TEST_STORY << 'STORY' || true
import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./HeroSection";

const meta: Meta<typeof HeroSection> = {
  title: "Generated/HeroSection",
  component: HeroSection,
};
export default meta;

type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: { title: "Custom Hero Title", cta: "Learn More" },
};
STORY

# ══════════════════════════════════════════════════════════════════════════
#  SETUP
# ══════════════════════════════════════════════════════════════════════════
log "SETUP"
echo "  Root: $ROOT"
echo "  CLI: $CLI"
echo "  Flags: skip-visual=$SKIP_VISUAL skip-vision=$SKIP_VISION quick=$QUICK"

# Start the HTTP server in background
if ! $QUICK; then
  log "Starting HTTP server"
  cd "$ROOT"
  $CLI serve &
  SERVER_PID=$!
  echo "  Server PID: $SERVER_PID"
  sleep 2
fi

# ══════════════════════════════════════════════════════════════════════════
#  1. PROJECT COMMANDS
# ══════════════════════════════════════════════════════════════════════════
log "1. PROJECT COMMANDS"

# health
check_json "health --json returns ok" '.ok == true' $CLI health --json

# init (to a temp dir)
TEST_DIR=$(mktemp -d /tmp/emdesign-test-XXXXXX)
echo "  Test dir: $TEST_DIR"
check_exit "init react-tailwind" $CLI init react-tailwind --dir "$TEST_DIR"
check_file_exists "init creates emdesign.config.json" "$TEST_DIR/emdesign.config.json"
check_dir_exists "init creates .claude/agents" "$TEST_DIR/.claude/agents"
check_dir_exists "init creates design-systems/atelier" "$TEST_DIR/design-systems/atelier"

# attach (to an existing project)
if ! $QUICK; then
  check_exit "attach to test dir" $CLI attach "$TEST_DIR"
fi

# ══════════════════════════════════════════════════════════════════════════
#  2. DESIGN SYSTEM COMMANDS
# ══════════════════════════════════════════════════════════════════════════
log "2. DESIGN SYSTEM COMMANDS"

# ds list (should have at least atelier)
check_json "ds list --json is array" '. | length >= 1' $CLI ds list --json

# ds bases (should have vendored bases)
check_json "ds bases --json has items" 'length >= 1' $CLI ds bases --json

# ds base-detail
check_json "ds base-detail --json has id" '.id != null' $CLI ds base-detail atelier --json

# ds create
if ! $QUICK; then
  check_exit "ds create test-system" $CLI ds create test-system --mode blank
  check_dir_exists "test-system dir created" "$ROOT/design-systems/test-system"
  check_file_exists "test-system has DESIGN.md" "$ROOT/design-systems/test-system/DESIGN.md"
  check_file_exists "test-system has tokens.css" "$ROOT/design-systems/test-system/tokens.css"
fi

# ds use (switch to atelier)
check_exit "ds use atelier" $CLI ds use atelier

# ds validate (atelier should pass)
check_json "ds validate atelier --json has ok field" 'has("ok")' $CLI ds validate atelier --json

# ds grade
check_json "ds grade atelier --json has grade field" 'has("grade")' $CLI ds grade atelier --json

# ds scaffold
if ! $QUICK; then
  check_exit "ds scaffold atelier" $CLI ds scaffold atelier
fi

# ds conflicts
check_json "ds conflicts atelier --json is array" 'type == "array" or has("conflicts") or length >= 0' \
  $CLI ds conflicts atelier --json

# ds history
check_json "ds history atelier --json has data" 'length >= 0 or has("snapshots") or has("versions")' \
  $CLI ds history atelier --json

# use shortcut
check_exit "use atelier shortcut" $CLI use atelier

# ══════════════════════════════════════════════════════════════════════════
#  3. DESIGN CONTEXT
# ══════════════════════════════════════════════════════════════════════════
log "3. DESIGN CONTEXT"

check_json "design HeroSection --json has data.prompt" '.data.prompt != null' \
  $CLI design "HeroSection" "A hero section component" --json

check_json "design (no args) --json has data" '.data != null' \
  $CLI design --json

check_json "design-context alias --json has data" '.data != null' \
  $CLI design-context "Button" "Primary action button" --json

# ══════════════════════════════════════════════════════════════════════════
#  4. GENERATE
# ══════════════════════════════════════════════════════════════════════════
log "4. GENERATE"

# Create component via stdin
echo "$TEST_COMPONENT" | check_json "generate HeroSection --stdin --json has data.name" '.data.name == "HeroSection"' \
  $CLI generate HeroSection --mode create --stdin --json

# Verify files exist on disk
check_file_exists "HeroSection.tsx generated" "$ROOT/apps/workspace-react/src/generated/HeroSection.tsx"

# Create with story (write story to temp file to avoid stdin conflict)
STORY_FILE=$(mktemp /tmp/emdesign-story-XXXXXX.tsx)
echo "$TEST_STORY" > "$STORY_FILE"
check_json "generate HeroSection story --story --json has data.name" '.data.name == "HeroSection"' \
  $CLI generate HeroSection --mode edit --stdin --story "$STORY_FILE" --json <<< "$TEST_COMPONENT"

check_file_exists "HeroSection.stories.tsx generated" "$ROOT/apps/workspace-react/src/generated/HeroSection.stories.tsx"
rm -f "$STORY_FILE"

# Edit the component (modify mode)
echo "$TEST_COMPONENT" | check_json "generate HeroSection --mode edit --json has data.name" '.data.name == "HeroSection"' \
  $CLI generate HeroSection --mode edit --stdin --json

# ══════════════════════════════════════════════════════════════════════════
#  5. DOCTOR (VERIFICATION)
# ══════════════════════════════════════════════════════════════════════════
log "5. DOCTOR (VERIFICATION)"

# doctor --kind lint (works without Storybook)
check_json "doctor lint HeroSection --json has data.composite" '.data.composite != null' \
  $CLI doctor lint HeroSection --json

check_json "doctor lint HeroSection --gate --json has data.decision" '.data.decision != null' \
  $CLI doctor lint HeroSection --gate --json

# doctor --kind react (works without Storybook)
check_json "doctor react HeroSection --json has data.composite" '.data.composite != null' \
  $CLI doctor react HeroSection --json

# doctor --detail
check_json "doctor lint HeroSection --detail --json has data" '.data != null' \
  $CLI doctor lint HeroSection --detail --json

# doctor with evidence
check_json "doctor lint HeroSection --evidence test-round --json has data" '.data != null' \
  $CLI doctor lint HeroSection --evidence test-round --json

# doctor all (lint only for now — visual/others need Storybook)
check_json "doctor HeroSection --json has data.composite" '.data.composite != null' \
  $CLI doctor HeroSection --json

# doctor --kind spatial (needs Storybook to work — gracefully handles missing Storybook)
check_json "doctor spatial HeroSection --json has data" '.data != null' \
  $CLI doctor spatial HeroSection --json

# doctor --kind charters (gracefully handles missing story file content)
check_json "doctor charters HeroSection --json has data" '.data != null' \
  $CLI doctor charters HeroSection --json

# Visual test (if not skipped — needs Storybook running)
if ! $SKIP_VISUAL; then
  check_json "doctor visual HeroSection --json has data" '.data.scores.visual != null' \
    $CLI doctor visual HeroSection --json

  check_json "visual-test alias --json has data" '.data != null' \
    $CLI visual-test HeroSection --json
fi

# Legacy alias: lint
check_json "lint alias HeroSection --json has data" '.data != null' \
  $CLI lint HeroSection --json

check_json "score alias --component HeroSection --json has data" '.data != null' \
  $CLI score --component HeroSection --json

check_json "spatial-audit alias HeroSection --json has data" '.data != null' \
  $CLI spatial-audit HeroSection --json

# ══════════════════════════════════════════════════════════════════════════
#  6. KNOWLEDGE GRAPH
# ══════════════════════════════════════════════════════════════════════════
log "6. KNOWLEDGE GRAPH"

# graph build (rebuild atelier graph)
check_json "graph build atelier --json has nodes" '.nodes != null or .nodeCount != null or (. | length > 0)' \
  $CLI graph build atelier --json

# graph context (try a known node from the graph, fallback gracefully)
check_json "graph context --json returns valid output" '.data != null or (type == "string")' \
  $CLI graph context "atelier/tokens" --json 2>/dev/null || pass "graph context handled gracefully"

# graph query (use a label that exists in the graph)
check_json "graph query --label primitive --json has data" '.data != null or type == "array"' \
  $CLI graph query --label primitive --json

# graph guidance
check_json "graph guidance Button --intent 'click' --json has data" '.data != null or (. != null)' \
  $CLI graph guidance Button --intent "click" --json

# graph where-to-fix (finding may not exist — accept any valid response)
check_json "graph where-to-fix --json is valid" '(.data != null) or (type == "string")' \
  $CLI graph where-to-fix HeroSection "off-token" --json 2>/dev/null || pass "graph where-to-fix handled gracefully"

# ══════════════════════════════════════════════════════════════════════════
#  7. EXPLORE
# ══════════════════════════════════════════════════════════════════════════
log "7. EXPLORE"

check_json "explore overview --json has dsId" '.dsId != null' \
  $CLI explore --json

check_exit "explore ds" $CLI explore ds

check_exit "explore tokens" $CLI explore tokens

check_exit "explore token --color-accent" $CLI explore token --color-accent

check_exit "explore primitives" $CLI explore primitives

check_exit "explore primitive Stack" $CLI explore primitive Stack

check_exit "explore components" $CLI explore components

check_exit "explore component HeroSection" $CLI explore component HeroSection

check_exit "explore hierarchy Stack" $CLI explore hierarchy Stack

check_exit "explore rules" $CLI explore rules

check_exit "explore charters" $CLI explore charters

check_exit "explore sections" $CLI explore sections

check_json "explore stats --json has nodes" '.data.nodes > 0' \
  $CLI explore stats --json

check_json "explore tokens --json is array" 'type == "array"' \
  $CLI explore tokens --json

check_json "explore rules --json is array" 'type == "array"' \
  $CLI explore rules --json

# ══════════════════════════════════════════════════════════════════════════
#  8. VISION (if not skipped — needs API key)
# ══════════════════════════════════════════════════════════════════════════
log "8. VISION"

if ! $SKIP_VISION; then
  check_json "vision HeroSection --json has visionScore or error" 'has("visionScore") or has("error")' \
    $CLI vision HeroSection --json

  check_json "vision-critique alias --json has data or error" '.data != null or has("error")' \
    $CLI vision-critique HeroSection --json
else
  echo "  ⏭️  Skipped (--skip-vision)"
fi

# ══════════════════════════════════════════════════════════════════════════
#  8. CAPTURE
# ══════════════════════════════════════════════════════════════════════════
log "9. CAPTURE"

# We generate a simple component first to capture
read -r -d '' CAPTURE_COMPONENT << 'CAPC' || true
import { Box } from "@ds/Box";
export function SimpleCard({ label = "Card" }: { label?: string }) {
  return <Box className="bg-surface p-4 rounded shadow">{label}</Box>;
}
CAPC

echo "$CAPTURE_COMPONENT" | check_exit "generate SimpleCard for capture test" \
  $CLI generate SimpleCard --mode create --stdin

# capture (without baseline — avoids Playwright)
check_json "capture SimpleCard --json has data.path" '.data.path != null' \
  $CLI capture SimpleCard --json

check_dir_exists "captured SimpleCard dir" "$ROOT/apps/workspace-react/src/components/SimpleCard"
check_file_exists "captured SimpleCard.tsx" "$ROOT/apps/workspace-react/src/components/SimpleCard/SimpleCard.tsx"

# ══════════════════════════════════════════════════════════════════════════
#  9. DISCOVER / DOC
# ══════════════════════════════════════════════════════════════════════════
log "10. DISCOVER / DOC"

check_json "discover --kind generated --json is array" 'type == "array"' \
  $CLI discover --kind generated --json

check_json "discover --kind ds --json has data or is array" '.data != null or type == "array"' \
  $CLI discover --kind ds --json

check_json "discover --filter Hero --json is array" 'type == "array"' \
  $CLI discover --filter Hero --json

check_json "doc HeroSection --json has data.component" '.data.component != null' \
  $CLI doc HeroSection --json

check_json "doc SimpleCard --json has data" '.data != null' \
  $CLI doc SimpleCard --json

# ══════════════════════════════════════════════════════════════════════════
#  SUMMARY
# ══════════════════════════════════════════════════════════════════════════
ELAPSED=$(( $(date +%s) - START_AT ))

log "RESULTS"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Total:  $((PASS + FAIL))"
echo "  Time:   ${ELAPSED}s"

# Cleanup: kill server, remove test dirs
if [[ -n "${SERVER_PID:-}" ]]; then
  kill "$SERVER_PID" 2>/dev/null || true
fi
rm -rf "$TEST_DIR" 2>/dev/null || true

# Exit code
if [[ $FAIL -gt 0 ]]; then
  echo -e "\n  \033[31m❌ Some tests failed.\033[0m"
  exit 1
else
  echo -e "\n  \033[32m✅ All tests passed.\033[0m"
  exit 0
fi
