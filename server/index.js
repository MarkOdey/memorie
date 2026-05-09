import http from "http";
import vm from "vm";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = "qwen2.5-coder:3b";
const EMBED_MODEL = "nomic-embed-text";

const SYSTEM_PROMPT =
  "You are a JavaScript code generator. " +
  "Rules you must never break:\n" +
  "- Output ONLY raw JavaScript. No markdown. No code fences. No backticks.\n" +
  "- Do not write ``` or ```javascript under any circumstances.\n" +
  "- Do not explain. Do not add comments unless asked.\n" +
  "- The very first character of your response must be valid JavaScript.\n" +
  "Environment: the code runs in a browser sandbox. A full-viewport canvas is available as window.canvas. " +
  "Always use window.canvas for any drawing. Do not create new canvas elements.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// --- Vector store -----------------------------------------------------------

const vectorStore = new Map(); // key → { name, code, vector }

function cosine(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

function retrieve(queryVec, k = 3) {
  if (vectorStore.size === 0) return [];
  return [...vectorStore.values()]
    .map((entry) => ({ ...entry, score: cosine(queryVec, entry.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

async function embed(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Embed error ${res.status}`);
  const { embeddings } = await res.json();
  return embeddings[0];
}

async function indexScripts(scripts) {
  await Promise.all(
    scripts.map(async ({ key, name, code }) => {
      try {
        const vector = await embed(`${name}\n${code}`);
        vectorStore.set(key, { name, code, vector });
      } catch (err) {
        console.warn(`Failed to embed script "${name}":`, err.message);
      }
    })
  );
  console.log(`Vector store: ${vectorStore.size} script(s) indexed`);
}

// --- Message builder --------------------------------------------------------

function buildMessages(prompt, relevant) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  if (relevant.length > 0) {
    const context = relevant
      .map((s) => `// ${s.name}\n${s.code}`)
      .join("\n\n---\n\n");
    messages.push({
      role: "user",
      content: `Reference scripts (use these as context, do not repeat them verbatim):\n\n${context}`,
    });
    messages.push({
      role: "assistant",
      content: "Understood. I will use those scripts as reference.",
    });
  }

  messages.push({ role: "user", content: prompt });
  return messages;
}

// --- Ollama streaming -------------------------------------------------------

function stripFences(code) {
  return code
    .replace(/^```[a-zA-Z]*\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
  });
}

async function streamGenerate(messages, onChunk) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, stream: true, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama ${response.status}: ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        const text = data.message?.content;
        if (text) onChunk(text);
      } catch { /* skip malformed lines */ }
    }
  }
}

// --- Shared: collect → strip → validate → respond --------------------------

async function generateAndRespond(messages, res) {
  let code = "";
  try {
    await streamGenerate(messages, (chunk) => { code += chunk; });
  } catch (err) {
    console.error("Ollama error:", err.message);
    res.writeHead(502, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
    return;
  }

  code = stripFences(code);

  try {
    new vm.Script(code);
  } catch (err) {
    console.warn("Syntax error in generated code:", err.message);
    res.writeHead(422, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Syntax error: ${err.message}` }));
    return;
  }

  res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
  res.end(JSON.stringify({ code }));
}

// --- HTTP server ------------------------------------------------------------

http
  .createServer(async (req, res) => {

    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/generate") {
      const body = await readBody(req);
      let prompt;

      try {
        ({ prompt } = JSON.parse(body));
      } catch {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      let relevant = [];
      try {
        const queryVec = await embed(prompt);
        relevant = retrieve(queryVec);
        if (relevant.length > 0) {
          console.log(`Retrieved: ${relevant.map((s) => s.name).join(", ")}`);
        }
      } catch (err) {
        console.warn("Embedding failed, generating without context:", err.message);
      }

      const messages = buildMessages(prompt, relevant);
      await generateAndRespond(messages, res);
      return;
    }

    if (req.method === "POST" && req.url === "/improve") {
      const body = await readBody(req);
      let code, prompt;

      try {
        ({ code, prompt } = JSON.parse(body));
      } catch {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      if (!code || !prompt) {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Both 'code' and 'prompt' are required" }));
        return;
      }

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Improve the following JavaScript.\n\nInstruction: ${prompt}\n\nCurrent code:\n${code}`,
        },
      ];

      await generateAndRespond(messages, res);
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      try {
        const { scripts } = JSON.parse(body);
        if (Array.isArray(scripts) && scripts.length > 0) {
          indexScripts(scripts);
        }
      } catch { /* non-JSON body */ }
      res.writeHead(200, CORS);
      res.end();
      return;
    }

    res.writeHead(404);
    res.end();
  })
  .listen(8080, () =>
    console.log(`Server on :8080  →  Ollama at ${OLLAMA_URL}`)
  );
