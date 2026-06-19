# SAM Slide Suite — Docker package

A single, self-contained container image that runs the whole app: the Express
server on **:3001** serving the prebuilt Vue UI, the Python helpers (review /
rewrite / narrate / produce), **and a bundled Ollama backend with the `gpt-oss`
model baked into the image**. Built for deployment to an AWS tenant — push to
**ECR**, pull and run on **ECS/Fargate**, **App Runner**, or an **EC2** host as a
single "docker app" with no external model service to wire up.

> **Ollama is bundled inside the container.** The entrypoint starts `ollama serve`
> alongside the Node server and the app talks to it over `localhost`. The
> `gpt-oss` model is pulled at build time and stored in the image, so it works
> the moment the container starts. To use an *external* Ollama instead, set
> `OLLAMA_URL` to its address and the entrypoint skips the in-container one.

## What's inside

| Layer | Contents |
|-------|----------|
| Base | `node:20-bookworm-slim` |
| System | libreoffice (pptx/docx), poppler-utils (pdf), ffmpeg, chromium |
| Python | venv at `/opt/venv` with edge-tts, python-pptx, python-docx, requests |
| Node | server prod deps + global `@marp-team/marp-cli` |
| **Models** | **Ollama binary + `gpt-oss` baked in at `/opt/ollama/models`** |
| App | `web/server`, `web/dist`, `scripts/`, `personas/` |

The container runs as the unprivileged `node` user. Runtime data is written to
`/app/web/uploads`, `/app/web/outputs`, `/app/reviews`, and the model store at
`/opt/ollama/models` — mount volumes there to persist across restarts.

> **Image size:** baking `gpt-oss` (~14 GB) on top of LibreOffice + chromium makes
> this a **large image (~16–18 GB)**. The build needs internet access to pull the
> model from ollama.com, and the first ECR pull on deploy will take a while.

## Build

Build from the **repo root** (the image needs `scripts/`, `personas/`, `web/`):

```bash
docker build -f docker/Dockerfile -t sam-studio:latest .
```

To bake a different/extra model at build time, override the build arg:

```bash
docker build -f docker/Dockerfile --build-arg OLLAMA_MODEL=gpt-oss -t sam-studio:latest .
```

## Run locally

Everything is in the one image — no model pull, no second service:

```bash
docker compose -f docker/docker-compose.yml up --build
# UI → http://localhost:3001  (gpt-oss is ready immediately)
```

Or run the image directly:

```bash
docker run --rm -p 3001:3001 sam-studio:latest
```

GPU host (much faster inference) — pass the GPUs through to the bundled Ollama:

```bash
docker run --rm --gpus all -p 3001:3001 sam-studio:latest
```

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `PORT` | `3001` | Server listen port |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama endpoint. Defaults to the bundled instance; set to an external URL to bypass it (UI can still override per request) |
| `OLLAMA_PULL` | _(unset)_ | Optionally pull an additional model at startup (gpt-oss is already baked in), e.g. `llama3.2:3b` |
| `OLLAMA_MODEL` (build arg) | `gpt-oss` | Model baked into the image at build time |

See [.env.example](.env.example).

## Deploy to AWS

### 1. Push the image to ECR

```bash
AWS_REGION=us-east-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO=$ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/sam-studio

aws ecr create-repository --repository-name sam-studio --region $AWS_REGION || true
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

# build for the linux/amd64 runtime your AWS hosts use
docker build --platform linux/amd64 -f docker/Dockerfile -t $REPO:latest .
docker push $REPO:latest    # large image — expect a long first push
```

### 2. Run the pulled image

Because Ollama and the model are bundled, you deploy **one** container — no
separate Ollama service and no `OLLAMA_URL` to set.

**EC2 (VPC AMI) Docker host — recommended for the baked-in model:**
```bash
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
docker pull $REPO:latest
docker run -d --restart unless-stopped -p 3001:3001 \
  --gpus all \
  -v /data/sam/outputs:/app/web/outputs \
  -v /data/sam/reviews:/app/reviews \
  $REPO:latest
```
Use a GPU instance (e.g. `g5`/`g6`) so `gpt-oss` runs at a usable speed; drop
`--gpus all` for CPU-only (slow for a model this size). The simplest single-host
path is `docker compose -f docker/docker-compose.yml up -d` on the instance.

**ECS / Fargate (container PaaS):**
- Task definition: container image `…/sam-studio:latest`, port mapping `3001`.
- Size generously — LibreOffice + ffmpeg + a 20B model are heavy. Fargate is
  **CPU-only** and caps task size, so inference will be slow; for real workloads
  prefer **ECS on EC2 GPU instances** with the model.
- Behind an ALB targeting port 3001; health check path `/`.
- Persistence: attach EFS for `/app/web/outputs` and `/app/reviews`. The baked
  model lives in the image, so no model volume is required.

**App Runner:** supports the image + port 3001, but it is CPU-only with request
timeouts and ephemeral storage — not suitable for a 20B model or long renders.
Use it only with `OLLAMA_URL` pointed at an external GPU-backed Ollama.

### Using an external Ollama instead of the bundled one
Set `OLLAMA_URL=http://<ollama-host-in-vpc>:11434`. The entrypoint detects a
non-localhost URL and does **not** start the in-container Ollama (the baked model
just goes unused). Keep both in the same VPC so model traffic stays in-tenant.

## Notes & limits
- **GPU:** the bundled Ollama uses a GPU only if the container gets one
  (`--gpus all`, or the compose `deploy.resources` block, or an EC2 GPU instance).
  Without a GPU, `gpt-oss` will be slow.
- **Persistence of pulled models:** the baked model is in the image. Extra models
  pulled at runtime (via `OLLAMA_PULL` or the UI) live in `/opt/ollama/models` —
  mount the `sam-models` volume (compose does this) to keep them across restarts.
  The named volume is seeded from the image layer, so gpt-oss is preserved; do
  **not** use a bind mount there (it would shadow the baked model).
- **Markdown → video (Marp):** uses chromium as the non-root `node` user; in
  restricted runtimes that block user namespaces you may need chromium
  `--no-sandbox`. The PPTX/PDF/DOCX paths (LibreOffice) are unaffected.
