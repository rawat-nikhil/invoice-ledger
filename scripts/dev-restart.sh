#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Stopping stale dev servers..."

# Kill Next.js dev processes for this project
pkill -f "${ROOT}/node_modules/.bin/next dev" 2>/dev/null || true

# Kill API dev processes for this project
pkill -f "${ROOT}/apps/api.*tsx watch" 2>/dev/null || true

# Free ports used by web (3000) and API (4000)
for port in 3000 4000; do
  pids="$(lsof -ti ":${port}" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Killing process(es) on port ${port}: ${pids}"
    kill -9 ${pids} 2>/dev/null || true
  fi
done

# Remove Next.js dev lock
rm -f "${ROOT}/apps/web/.next/dev/lock"

echo "Starting dev servers..."
exec npm run dev
