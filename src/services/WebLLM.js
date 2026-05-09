import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { reactive } from "vue";

const MODEL_ID = "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC";

const SYSTEM_PROMPT =
  "You are a JavaScript code generator for a browser-based creative coding sandbox. " +
  "Output only raw JavaScript code — no markdown fences, no prose, no explanations. " +
  "The code runs directly in a browser with full DOM access.";

class WebLLMService {
  constructor() {
    this.engine = null;
    this._loading = null;
    this.state = reactive({
      status: "idle",
      progress: 0,
      progressText: "",
      error: null,
    });
  }

  load() {
    if (this.engine) return Promise.resolve(this.engine);
    if (this._loading) return this._loading;

    this.state.status = "loading";
    this.state.progress = 0;
    this.state.error = null;

    this._loading = CreateMLCEngine(MODEL_ID, {
      initProgressCallback: ({ progress, text }) => {
        this.state.progress = Math.round((progress || 0) * 100);
        this.state.progressText = text || "";
      },
    })
      .then((engine) => {
        this.engine = engine;
        this._loading = null;
        this.state.status = "ready";
        return engine;
      })
      .catch((err) => {
        this._loading = null;
        this.state.status = "error";
        this.state.error = err.message;
        throw err;
      });

    return this._loading;
  }

  async generate(prompt, onChunk) {
    const engine = await this.load();

    this.state.status = "generating";

    try {
      const stream = await engine.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        stream: true,
        temperature: 0.3,
      });

      let output = "";
      for await (const chunk of stream) {
        output += chunk.choices[0]?.delta?.content || "";
        onChunk(output);
      }

      this.state.status = "ready";
      return output;
    } catch (err) {
      this.state.status = "ready";
      throw err;
    }
  }
}

export default new WebLLMService();
