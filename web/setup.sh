#!/usr/bin/env bash
# First-time setup for SAM Slide Suite (web app)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing Node.js dependencies..."
npm install

mkdir -p uploads outputs

echo ""
echo "Setup complete. Run with: ./run.sh"
echo ""
echo "Python deps (Narrate/Produce + Review/Rewrite):"
echo "  pip install edge-tts python-pptx python-docx requests"
echo "  # optional offline TTS: pip install supertonic"
echo ""
echo "System tools required:"
echo "  sudo apt install libreoffice poppler-utils ffmpeg"
echo "  npm i -g @marp-team/marp-cli   # Markdown slide rendering only"
echo ""
echo "Local model backend:"
echo "  ollama serve   # then: ollama pull llama3.2:3b"
