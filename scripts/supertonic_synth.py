#!/usr/bin/env python3
"""Standalone Supertonic synthesis helper for the Web UI's review-mode path.

The one-shot CLI (`pptx_to_video.py --tts-provider supertonic`) handles
Supertonic natively. Review mode, however, synthesizes audio in Node after the
narrations have been edited in the browser — and Supertonic is a Python package.
This helper bridges that gap: it loads the model once and writes one WAV file per
narration into a work directory, reusing the exact synthesis path the CLI uses.

Usage:
    python3 supertonic_synth.py \
        --workdir /path/to/work \
        --narrations /path/to/narrations.json \
        --voice M1 --lang en --steps 8 --speed 1.0

`narrations.json` is a JSON array of strings. Output files are named
`slide_001.wav`, `slide_002.wav`, ... in `--workdir`.
"""
import argparse
import json
import sys
from pathlib import Path

# Reuse the CLI's synthesis function so both paths stay in lockstep.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from pptx_to_video import generate_all_audios_supertonic  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Supertonic synthesis helper")
    parser.add_argument("--workdir", required=True)
    parser.add_argument("--narrations", required=True,
                        help="Path to a JSON file containing an array of narration strings")
    parser.add_argument("--voice", default="M1")
    parser.add_argument("--lang", default="en")
    parser.add_argument("--steps", type=int, default=8)
    parser.add_argument("--speed", type=float, default=1.0)
    args = parser.parse_args()

    narrations = json.loads(Path(args.narrations).read_text(encoding="utf-8"))
    if not isinstance(narrations, list) or not narrations:
        print("ERROR: narrations file must contain a non-empty JSON array", file=sys.stderr)
        return 1

    work_dir = Path(args.workdir)
    work_dir.mkdir(parents=True, exist_ok=True)

    generate_all_audios_supertonic(
        narrations, work_dir,
        voice=args.voice,
        lang=args.lang,
        steps=args.steps,
        speed=args.speed,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
