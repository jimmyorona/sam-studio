#!/usr/bin/env bash
# Start the bundled Ollama, then the SAM Slide Suite server. Both run in this one
# container; the app reaches Ollama over localhost (OLLAMA_URL). The default model
# is baked into the image at /opt/ollama/models, so it is available immediately.
set -euo pipefail

OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"

# Only manage Ollama if the app is pointed at the in-container instance.
case "$OLLAMA_URL" in
  http://localhost:*|http://127.0.0.1:*)
    echo "[entrypoint] starting bundled ollama serve ..."
    ollama serve &
    OLLAMA_PID=$!

    # Wait for the API to come up (model load is lazy, so this is quick).
    for _ in $(seq 1 60); do
      if curl -fsS "http://localhost:11434/api/tags" >/dev/null 2>&1; then break; fi
      sleep 1
    done

    echo "[entrypoint] ollama models available:"
    ollama list || true

    # Optionally pull an extra model at runtime (e.g. OLLAMA_PULL=llama3.2:3b).
    if [ -n "${OLLAMA_PULL:-}" ]; then
      echo "[entrypoint] pulling extra model: ${OLLAMA_PULL}"
      ollama pull "${OLLAMA_PULL}" || echo "[entrypoint] WARN: pull failed, continuing"
    fi
    ;;
  *)
    echo "[entrypoint] OLLAMA_URL=${OLLAMA_URL} is external; not starting bundled ollama."
    ;;
esac

echo "[entrypoint] starting web server on :${PORT:-3001}"
exec node web/server/index.js
