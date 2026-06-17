#!/usr/bin/env bash
# ============================================================================
# Convenience wrapper for pptx_to_video.py
# Converts a PPTX to an AI-narrated MP4 using local Ollama.
#
# Usage:
#   ./scripts/make_video.sh <input.pptx> [output.mp4]
#
# If output is omitted, writes to outputs/<basename>.mp4
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PYTHON_CMD="${PYTHON_CMD:-python3}"
INPUT_FILE="${1:-}"

if [[ -z "$INPUT_FILE" ]]; then
    echo "Usage: $(basename "$0") <input.pptx> [output.mp4]"
    exit 1
fi

# Resolve input path relative to project root if not absolute
if [[ ! "$INPUT_FILE" =~ ^/ ]]; then
    INPUT_FILE="$PROJECT_ROOT/$INPUT_FILE"
fi

if [[ ! -f "$INPUT_FILE" ]]; then
    echo "ERROR: Input file not found: $INPUT_FILE" >&2
    exit 1
fi

BASENAME="$(basename "$INPUT_FILE" .pptx)"

if [[ -n "${2:-}" ]]; then
    OUTPUT_FILE="$2"
    if [[ ! "$OUTPUT_FILE" =~ ^/ ]]; then
        OUTPUT_FILE="$PROJECT_ROOT/$OUTPUT_FILE"
    fi
else
    OUTPUT_FILE="$PROJECT_ROOT/outputs/${BASENAME}.mp4"
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

TTS_PROVIDER="${TTS_PROVIDER:-edge}"

echo "============================================================"
echo "  PPTX to Video"
echo "  Input   : $INPUT_FILE"
echo "  Output  : $OUTPUT_FILE"
echo "  TTS     : $TTS_PROVIDER"
echo "============================================================"

# Build ElevenLabs args from environment variables when provider is elevenlabs
ELEVENLABS_ARGS=()
if [[ "$TTS_PROVIDER" == "elevenlabs" ]]; then
    ELEVENLABS_ARGS+=(--tts-provider elevenlabs)
    [[ -n "${ELEVENLABS_API_KEY:-}"    ]] && ELEVENLABS_ARGS+=(--elevenlabs-api-key    "$ELEVENLABS_API_KEY")
    [[ -n "${ELEVENLABS_VOICE_ID:-}"   ]] && ELEVENLABS_ARGS+=(--elevenlabs-voice-id   "$ELEVENLABS_VOICE_ID")
    [[ -n "${ELEVENLABS_MODEL:-}"      ]] && ELEVENLABS_ARGS+=(--elevenlabs-model       "$ELEVENLABS_MODEL")
    [[ -n "${ELEVENLABS_STABILITY:-}"  ]] && ELEVENLABS_ARGS+=(--elevenlabs-stability   "$ELEVENLABS_STABILITY")
    [[ -n "${ELEVENLABS_SIMILARITY:-}" ]] && ELEVENLABS_ARGS+=(--elevenlabs-similarity  "$ELEVENLABS_SIMILARITY")
    [[ -n "${ELEVENLABS_STYLE:-}"      ]] && ELEVENLABS_ARGS+=(--elevenlabs-style       "$ELEVENLABS_STYLE")
    [[ -n "${ELEVENLABS_SPEED:-}"      ]] && ELEVENLABS_ARGS+=(--elevenlabs-speed       "$ELEVENLABS_SPEED")
fi

$PYTHON_CMD "$SCRIPT_DIR/pptx_to_video.py" \
    --input "$INPUT_FILE" \
    --output "$OUTPUT_FILE" \
    "${ELEVENLABS_ARGS[@]}" \
    "${@:3}"

echo "============================================================"
echo "  Complete!"
echo "  Video saved to: $OUTPUT_FILE"
echo "============================================================"
