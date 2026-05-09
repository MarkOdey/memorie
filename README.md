# Memorie

A browser-based JavaScript sandbox with a Monaco editor, script management, and an AI code generation prompt powered by Qwen2.5-Coder-3B running locally via Ollama.

---

## Architecture

| Process | Description | Default port |
|---------|-------------|-------------|
| Vite dev server | Frontend (Vue 3 + Monaco) | 5173 |
| Node API server | Script persistence + AI proxy | 8080 |
| Ollama | Local LLM inference (Qwen2.5-Coder-3B) | 21434 |

---

## Prerequisites

- **Node.js 24** — use [nvm](https://github.com/nvm-sh/nvm): `nvm use`
- **Docker + Docker Compose** — for Ollama and the API server in production
- For local dev without Docker: [Ollama](https://ollama.com) installed natively

---

## Dev environment

### 1. Install frontend dependencies

```bash
nvm use
npm install
```

### 2. Start Ollama with the model

**Option A — Docker (recommended, no local Ollama install needed):**

```bash
docker compose up ollama model-pull
```

Wait until `model-pull` exits cleanly. The ~2 GB model is cached in the `ollama_data` Docker volume; subsequent starts are instant.

**Option B — native Ollama:**

```bash
ollama serve &
ollama pull qwen2.5-coder:3b
```

### 3. Start the API server

```bash
npm run server
```

The server reads `OLLAMA_URL` from the environment (defaults to `http://localhost:11434`).

### 4. Start the frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## All-in-one (production / demo)

Runs Ollama, the API server, and serves the built frontend — everything in Docker:

```bash
npm run build
docker compose up --build
```

The API is available on port 8080. Serve the `dist/` folder with any static file server for the frontend.

---

## How the AI prompt works

1. Type a description in the prompt bar inside the editor panel.
2. Press **Ctrl+Enter** or click **✨ Generate**.
3. The request goes to the API server (`POST http://localhost:8080/generate`), which streams a response from Ollama.
4. Generated code streams token-by-token into the Monaco editor.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run server` | Build and start the API server in Docker (`docker compose up --build api`) |

---

## Project structure

```
memorie/
├── src/
│   ├── App.vue                  # Root layout, error display
│   ├── components/
│   │   ├── editor.vue           # Monaco editor wrapper
│   │   ├── AiPrompt.vue         # AI code generation prompt
│   │   ├── scriptList.vue       # Script list with run/edit/delete actions
│   │   ├── uploader.vue         # Image file upload → canvas script
│   │   └── download.vue         # Export all scripts as JSON
│   ├── services/
│   │   ├── Memori.jsx           # Script state, localStorage, iframe sandbox
│   │   ├── Ui.jsx               # Editor layout persistence
│   │   └── AI.js                # Fetch wrapper for the /generate endpoint
│   └── scripts/
│       ├── addImage.js          # Template: render an uploaded image on canvas
│       └── turnOnCamera.js      # Template: access camera/microphone
├── server/
│   ├── index.js                 # Node HTTP server: /generate → Ollama, POST / → scripts
│   ├── package.json             # Server-only package (no frontend deps)
│   └── Dockerfile               # node:24-alpine image for the API
└── docker-compose.yml           # ollama + model-pull + api
```
