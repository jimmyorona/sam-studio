#!/usr/bin/env python3
"""Extract reviewable text from PPTX, PDF, DOCX, Markdown, or plain-text files.

Output is markdown on stdout, structured with per-slide / per-page headings so
reviewers can reference locations precisely.

Usage:
    python3 scripts/extract.py <input-file>

Dependencies (all system-level, already present on this machine):
    PPTX -> python-pptx
    PDF  -> pdftotext (poppler-utils)
    DOCX -> libreoffice --headless
"""

import subprocess
import sys
import tempfile
from pathlib import Path


def extract_pptx(path: Path) -> str:
    from pptx import Presentation

    prs = Presentation(str(path))
    out = []
    for i, slide in enumerate(prs.slides, 1):
        title = ""
        if slide.shapes.title is not None and slide.shapes.title.has_text_frame:
            title = slide.shapes.title.text_frame.text.strip()
        out.append(f"## Slide {i}" + (f": {title}" if title else ""))

        body = []
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            text = shape.text_frame.text.strip()
            if text and text != title:
                body.append(text)
        if body:
            out.append("\n\n".join(body))

        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                out.append(f"**Speaker notes:**\n{notes}")
    return "\n\n".join(out)


def extract_pdf(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(path), "-"],
        capture_output=True, text=True, check=True,
    )
    pages = result.stdout.split("\f")
    out = []
    for i, page in enumerate(pages, 1):
        page = page.strip()
        if page:
            out.append(f"## Page {i}\n\n{page}")
    return "\n\n".join(out)


def extract_docx(path: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["libreoffice", "--headless", "--convert-to", "txt:Text",
             "--outdir", tmp, str(path)],
            capture_output=True, check=True,
        )
        txt = Path(tmp) / (path.stem + ".txt")
        return txt.read_text(encoding="utf-8", errors="replace").strip()


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    if not path.exists():
        print(f"error: {path} not found", file=sys.stderr)
        return 1

    ext = path.suffix.lower()
    if ext == ".pptx":
        content = extract_pptx(path)
    elif ext == ".pdf":
        content = extract_pdf(path)
    elif ext in (".docx", ".doc", ".odt"):
        content = extract_docx(path)
    elif ext in (".md", ".markdown", ".txt"):
        content = path.read_text(encoding="utf-8", errors="replace")
    else:
        print(f"error: unsupported format {ext}", file=sys.stderr)
        return 1

    print(f"# Extracted content: {path.name}\n")
    print(content)
    return 0


if __name__ == "__main__":
    sys.exit(main())
