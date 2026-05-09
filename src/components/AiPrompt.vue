<template>
  <div class="prompt-bar">
    <textarea
      v-model="aiPrompt"
      class="prompt-input"
      placeholder="Describe the JavaScript you want to generate… (Ctrl+Enter)"
      rows="2"
      :disabled="ai.state.status === 'generating'"
      @keydown.ctrl.enter.prevent="generate"
    ></textarea>
    <div class="mode-toggle">
      <label>
        <input type="checkbox" v-model="improveMode" :disabled="ai.state.status === 'generating'" />
        Improve current script
      </label>
    </div>
    <div class="prompt-footer">
      <button
        class="btn btn-sm btn-generate"
        @click="generate"
        :disabled="ai.state.status === 'generating'"
      >
        <span v-if="ai.state.status === 'generating' && retryCount > 0">
          Retrying ({{ retryCount }}/{{ maxRetries }})…
        </span>
        <span v-else-if="ai.state.status === 'generating'">Generating…</span>
        <span v-else-if="ai.state.status === 'error'">✨ Retry</span>
        <span v-else-if="improveMode">✨ Improve</span>
        <span v-else>✨ Generate</span>
      </button>
      <button
        v-if="generatedCode && ai.state.status !== 'generating'"
        class="btn btn-sm btn-save"
        @click="saveAsScript"
      >
        + Save as script
      </button>
      <span v-if="ai.state.error" class="prompt-error">{{ ai.state.error }}</span>
    </div>
  </div>
</template>

<script>
import AI from "../services/AI";
import Memori from "../services/Memori.jsx";

const MAX_RETRIES = 2;

export default {
  emits: ["chunk"],

  data() {
    return {
      ai: AI,
      aiPrompt: "",
      generatedCode: null,
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      improveMode: false,
    };
  },

  created() {
    this._errorHandler = (e) => {
      if (!this._awaitingResult) return;
      this._awaitingResult = false;
      this.onScriptError(e.message);
    };
    Memori.addEventListener("scripterror", this._errorHandler);
  },

  beforeUnmount() {
    Memori.removeEventListener("scripterror", this._errorHandler);
  },

  methods: {
    // Entry point for user-initiated generation — resets retry counter.
    async generate() {
      const prompt = this.aiPrompt.trim();
      if (!prompt) return;
      this.retryCount = 0;
      await this.doGenerate(prompt);
    },

    // Runs the actual generation + auto-play.
    async doGenerate(prompt) {
      this.generatedCode = null;
      this._awaitingResult = false;

      try {
        if (this.improveMode) {
          this.generatedCode = await AI.improve(Memori.editScript.code, prompt);
          this.$emit("chunk", this.generatedCode);
        } else {
          this.generatedCode = await AI.generate(prompt, (partial) => {
            this.$emit("chunk", partial);
          });
        }
      } catch (err) {
        console.error("Generation failed:", err);
        return;
      }

      // Auto-play immediately after generation.
      this._awaitingResult = true;
      Memori.runScript({ code: this.generatedCode, key: "_ai_preview", name: this.aiPrompt.trim() });

      // Only treat errors as retry candidates if they fire within 500ms
      // (immediate throw vs. a later setInterval error).
      setTimeout(() => { this._awaitingResult = false; }, 500);
    },

    // Called when the sandbox reports an error shortly after running.
    async onScriptError(errorMessage) {
      if (this.retryCount >= MAX_RETRIES) {
        this.retryCount = 0;
        return;
      }
      this.retryCount++;
      const retryPrompt =
        `${this.aiPrompt.trim()}\n\n` +
        `The previous attempt threw: "${errorMessage}". ` +
        `Fix the error and output only the corrected JavaScript.`;
      await this.doGenerate(retryPrompt);
    },

    saveAsScript() {
      if (!this.generatedCode) return;
      Memori.write({
        key: String(Date.now()),
        name: this.aiPrompt.trim(),
        code: this.generatedCode,
      });
      this.generatedCode = null;
    },
  },
};
</script>

<style scoped>
.prompt-bar {
  width: 100%;
  border-top: 1px solid #e5e7eb;
  padding: 6px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-toggle {
  font-size: 0.78em;
  color: #6b7280;
}

.mode-toggle input {
  margin-right: 4px;
  cursor: pointer;
}

.prompt-input {
  width: 100%;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 0.85em;
  font-family: inherit;
  outline: none;
  background: #fff;
}

.prompt-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.prompt-input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.prompt-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-generate {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.82em;
  cursor: pointer;
  white-space: nowrap;
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.82em;
  cursor: pointer;
  white-space: nowrap;
}

.btn-save:hover {
  background: #f3f4f6;
}

.prompt-error {
  font-size: 0.75em;
  color: #dc2626;
}
</style>
