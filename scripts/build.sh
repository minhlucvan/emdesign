#!/usr/bin/env bash
set -euo pipefail

# Build emdesign packages in dependency order.
# Run from repo root.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="npx tsc -p"

echo "═══ Building emdesign packages ═══"

# Layer 1: Foundational (no internal deps)
echo "--- Layer 1: Foundational ---"
$BUILD "$ROOT/packages/graph/tsconfig.json"
$BUILD "$ROOT/packages/dsr/tsconfig.json"
$BUILD "$ROOT/packages/visual-diff/tsconfig.json"

# Layer 2: Mid-tier
echo "--- Layer 2: Mid-tier ---"
$BUILD "$ROOT/packages/doctor/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/vision-critic/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-api/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-core/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-css/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-react/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-shadcn/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-tailwindcss/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/plugin-react-doctor/tsconfig.json" 2>/dev/null || true

# Layer 3: Backend + workspace
echo "--- Layer 3: Backend + workspace ---"
$BUILD "$ROOT/packages/backend/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/apps/workspace/tsconfig.json" 2>/dev/null || true

# Layer 4: Agent infra + testbed
echo "--- Layer 4: Agent infra + testbed ---"
$BUILD "$ROOT/packages/agent-worker/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/agent-manager/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/mcp-server/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/testbed/tsconfig.json" 2>/dev/null || true

# Layer 5: CLI + addon
echo "--- Layer 5: CLI + addon ---"
$BUILD "$ROOT/packages/cli/tsconfig.json" 2>/dev/null || true
$BUILD "$ROOT/packages/addon/tsconfig.json" 2>/dev/null || true

echo "══════ Build complete ══════"
