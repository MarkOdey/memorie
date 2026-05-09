<template>
  <div ref="box" class="box">
    <div class="top-menu">
      <div class="d-inline-flex input-group">
        <input type="text" class="border-0 w-auto form-control" v-model="script.name" />
        <input type="text" class="border-0 form-control" v-model="script.key" />
      </div>
    </div>

    <div class="content">
      <div ref="editor" class="editor">
        <MonacoEditor
          @editorDidMount="editorDidMount"
          @change="textChanged($event)"
          :value="script.code"
          language="javascript"
        />
      </div>

      <ai-prompt @chunk="script.code = $event"></ai-prompt>
    </div>

    <div class="bottom-menu">
      <div class="btn-group">
        <button class="btn" @click="saveScript()">
          <i class="fas fa-save"></i>
        </button>
        <button class="btn" @click="runScript()">
          <i class="fas fa-play"></i>
        </button>
        <uploader></uploader>
        <button class="btn">
          <i @click="duplicateScript()" class="far fa-clone"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import MonacoEditor from "monaco-editor-vue3";
import Memori from "../services/Memori";
import Uploader from "./uploader.vue";
import AiPrompt from "./AiPrompt.vue";

export default {
  components: {
    MonacoEditor,
    Uploader,
    AiPrompt,
  },

  data() {
    return {
      script: Memori.editScript,
    };
  },

  created() {
    this._saveHandler = (e) => {
      if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
        e.preventDefault();
        this.saveScript();
      }
    };
    document.addEventListener("keydown", this._saveHandler, false);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this._saveHandler, false);
  },

  methods: {
    textChanged(value) {
      this.script.code = value;
    },

    editorDidMount(editor) {
      new ResizeObserver(() => {
        editor.layout({
          width: this.$refs.editor.offsetWidth,
          height: this.$refs.editor.offsetHeight,
        });
      }).observe(this.$refs.box);

      window.onresize = () => {
        editor.layout({
          width: this.$refs.editor.offsetWidth,
          height: this.$refs.editor.offsetHeight,
        });
      };
    },

    duplicateScript() {
      Memori.duplicate(Memori.editScript);
    },

    runScript() {
      Memori.runScript(Memori.editScript);
    },

    saveScript() {
      Memori.write(Memori.editScript);
    },
  },
};
</script>

<style scoped>
.box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-menu {
  width: 100%;
}

.content {
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor {
  flex-grow: 1;
  width: 100%;
  position: relative;
  min-height: 0;
}

.bottom-menu {
  width: 100%;
}

.form-control {
  flex-basis: content;
}
</style>
