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
  --prod|prod|--rpod|rpod)
    if [[ ! -d dist ]]; then
      echo "Production/Rpod build (dist/) not found. Building first..."
      npm run build
    fi
    echo "Starting production server on port 3001..."
    echo "For external access via port forward, forward port 3001:"
    echo "  e.g., ssh -L 3001:localhost:3001 user@host"
    NODE_ENV=production npm run server
    ;;
  *)
    echo "Starting dev server..."
    echo "  UI  → http://localhost:5174"
    echo "  API → http://localhost:3001"
    npm run dev
    ;;
esac
