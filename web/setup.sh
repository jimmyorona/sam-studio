#!/usr/bin/env bash
# First-time setup for pptx-video-web
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing Node.js dependencies..."
npm install

mkdir -p uploads outputs

echo ""
echo "Setup complete. Run with: ./run.sh"
echo ""
echo "Python deps (if not already installed):"
echo "  pip install edge-tts python-pptx"
echo ""
echo "System tools required:"
echo "  sudo apt install libreoffice poppler-utils ffmpeg"
