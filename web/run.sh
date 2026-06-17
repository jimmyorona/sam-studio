#!/usr/bin/env bash
# Start pptx-video-web (Vue dev UI + Express API server)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found — running setup first..."
  ./setup.sh
fi

case "${1:-}" in
  --build)
    npm run build
    ;;
  --prod)
    NODE_ENV=production npm run server
    ;;
  *)
    echo "Starting dev server..."
    echo "  UI  → http://localhost:5174"
    echo "  API → http://localhost:3001"
    npm run dev
    ;;
esac
