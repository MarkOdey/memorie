<template>
  <div class="box">
    <div class="top-menu">

      <div class="d-inline-flex input-group">
      <input type="text" class="border-0 w-auto form-control " v-model="script.name" />
      <input type="text" class="border-0  form-control" v-model="script.key" />
      </div>
       
    </div>

    <div class="content">
      <div ref="editor" class="editor">
        <MonacoEditor @editorDidMount="editorDidMount"  @change="textChanged($event)" :value="script.code" language="javascript" />

        
      </div>
    </div>
    <div class="bottom-menu">
      <div class="btn-group">
        <button class="btn" @click="saveScript()">
          <i class="fas fa-save"></i>
        </button>
        <button class="btn" @click="runScript()">
          <i class="fas fa-play"></i>
        </button>
        <button class="btn">           
          <i  @click="duplicateScript()" class="far fa-clone"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Memori from "../services/Memori";
import MonacoEditor from "monaco-editor-vue3";

export default {
  components: {
    MonacoEditor,
  },
  data() {
    console.log("at data", Memori.editScript);
    return {
      script: Memori.editScript,
    };
  },

  computed() {
    return {};
  },

  created() {
    console.log("the store", this.$data.script, this.script);
    document.addEventListener("keydown", (e)=> {
      if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
        e.preventDefault();
        // Process the event here (such as click on submit button)
        this.saveScript();
      }
    }, false);
        
  },

  methods: {
    textChanged: function(script) {
      console.log("test", script);

      this.script.code = script;

    },
    editorDidMount(editor) {
      window.onresize = () => {
        console.log('Window resize', this.$refs.editor);
        editor.layout({ width:this.$refs.editor.offsetWidth, height:this.$refs.editor.offsetHeight} );
      };
    },
    duplicateScript:()=>{
      Memori.duplicate(this.editScript);
    },
    runScript: function (payload) {
      console.log("run script", Memori.editScript);
      Memori.runScript(Memori.editScript);
    },
    saveScript: function () {
      console.log(this.editScript);

      Memori.write(Memori.editScript);
    },
  },
};
</script>

<style scoped>
.box{
  height: 100%;
  display:flex; 
  flex-direction:column;

}
.top-menu{
  width:100%;
}
.content{
  flex-grow: 1;
   width:100%;
}

.bottom-menu{
   width:100%;
  
}
.editor {
  width: 100%;
  height:100%;
}

.form-control{
  flex-basis: content;
}
</style>