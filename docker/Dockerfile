# syntax=docker/dockerfile:1
#
# SAM Slide Suite — single-image container.
#
# Build context is the REPO ROOT (the image needs ../scripts, ../personas and
# ../web). Build from the repo root with:
#
#   docker build -f docker/Dockerfile -t sam-studio:latest .
#
# The container runs the Express server (web/server/index.js) on :3001, serving
# the prebuilt Vue bundle from web/dist and spawning the Python helpers for
# review / rewrite / narrate / produce. Ollama is BUNDLED in this image, with the
# llama3.1:8b model baked in at build time: the entrypoint starts `ollama serve`
# alongside the Node server, and the app talks to it over localhost. Override
# OLLAMA_URL to use an external Ollama instead.
#
# llama3.1:8b (~4.9 GB, 128K context) comfortably runs all four modes' prompts
# while keeping the image far smaller than a 20B model; pick another with
# --build-arg OLLAMA_MODEL=… . The build needs network access to pull from
# ollama.com.
# ---------------------------------------------------------------------------

# ---- Stage 1: build the Vue/Vite frontend bundle --------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app/web

# Install all deps (incl. vite/vue dev deps) using the lockfile for repeatability.
COPY web/package.json web/package-lock.json ./
RUN npm ci

# Copy sources and produce web/dist (node_modules is excluded via .dockerignore).
COPY web/ ./
RUN npx vite build


# ---- Stage 2: runtime -----------------------------------------------------
FROM node:20-bookworm-slim AS runtime
ENV DEBIAN_FRONTEND=noninteractive

# System tools the Python bridges shell out to:
#   libreoffice  → PPTX/DOCX conversion (extract.py, pptx_to_video.py)
#   poppler-utils→ pdftoppm (PDF → PNG)
#   ffmpeg       → audio/video assembly
#   chromium     → Marp Markdown → slide images (narrate/produce on .md)
#   fonts        → legible rendered slides
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-venv python3-pip \
      libreoffice-impress libreoffice-writer \
      poppler-utils ffmpeg chromium \
      fonts-liberation fonts-dejavu-core fonts-noto-core \
      ca-certificates curl zstd \
    && rm -rf /var/lib/apt/lists/*

# Python deps live in an isolated venv that is first on PATH, so the server's
# `python3` / `edge-tts` spawns resolve to it (avoids PEP 668 / system Python).
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN pip install --no-cache-dir \
      edge-tts \
      python-pptx \
      python-docx \
      requests

# Marp CLI for Markdown slide rendering; reuse the system chromium (no download).
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROME_PATH=/usr/bin/chromium
RUN npm install -g @marp-team/marp-cli

# Bundle Ollama (the local model backend) into the image. Uses the official
# linux-amd64 release tarball (zstd-compressed) -> /usr/bin/ollama
# (+ /usr/lib/ollama for GPU libs). For arm64 hosts swap in ollama-linux-arm64.tar.zst.
#
# Set --build-arg OLLAMA_ROCM=true to also overlay the AMD ROCm libraries, for
# running the bundled Ollama on an AMD GPU (pass --device /dev/kfd --device
# /dev/dri at runtime). This noticeably enlarges the image; leave false for the
# default CPU / NVIDIA image.
ARG OLLAMA_ROCM=false
RUN curl -fsSL https://ollama.com/download/ollama-linux-amd64.tar.zst -o /tmp/ollama.tar.zst \
    && tar -C /usr --zstd -xf /tmp/ollama.tar.zst \
    && rm /tmp/ollama.tar.zst \
    && if [ "$OLLAMA_ROCM" = "true" ]; then \
         curl -fsSL https://ollama.com/download/ollama-linux-amd64-rocm.tar.zst -o /tmp/ollama-rocm.tar.zst \
         && tar -C /usr --zstd -xf /tmp/ollama-rocm.tar.zst \
         && rm /tmp/ollama-rocm.tar.zst; \
       fi

# Bake the default model into the image. Models are stored at a fixed path (not a
# user home) so the build-time pull and the runtime `node` user agree on the
# location. A named volume mounted here at runtime is initialized FROM this layer,
# so the baked model survives; a bind mount would shadow it.
ENV OLLAMA_MODELS=/opt/ollama/models
ARG OLLAMA_MODEL=llama3.1:8b
RUN mkdir -p "$OLLAMA_MODELS" \
    && (ollama serve & echo $! > /tmp/ollama.pid) \
    && for i in $(seq 1 60); do \
         curl -fsS http://localhost:11434/api/tags >/dev/null 2>&1 && break; \
         [ "$i" = 60 ] && { echo "ollama did not start"; exit 1; }; \
         sleep 1; \
       done \
    && ollama pull "$OLLAMA_MODEL" \
    && ollama list \
    && kill "$(cat /tmp/ollama.pid)" \
    && rm -f /tmp/ollama.pid

WORKDIR /app

# Server runtime deps only (express/multer/cors/marked/dompurify/elevenlabs).
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci --omit=dev && npm cache clean --force

# App code + shared libraries (paths must mirror the repo: web/server resolves
# ../../scripts, ../../personas, ../../reviews and ../uploads ../outputs ../dist).
COPY web/server ./web/server
COPY --from=build /app/web/dist ./web/dist
COPY scripts ./scripts
COPY personas ./personas

# Entrypoint starts the bundled `ollama serve` then the Node server.
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Writable runtime dirs (incl. the baked model store); run as the unprivileged
# `node` user shipped in the base.
RUN mkdir -p web/uploads web/outputs reviews \
    && chown -R node:node /app /opt/ollama
USER node

ENV NODE_ENV=production \
    PORT=3001 \
    OLLAMA_URL=http://localhost:11434

# 3001 = web UI/API. 11434 = bundled Ollama (exposed for debugging/optional reuse).
EXPOSE 3001 11434

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT}/" >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
