<template>
  <div ref="box" class="box">
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
        <button class="btn" @click="runScript()">

        </button>
        <uploader></uploader>
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
import Uploader from './uploader.vue';

export default {
  components: {
    MonacoEditor,
    Uploader,
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


      new ResizeObserver((res)=>{
        console.log(this.$refs.box.offsetHeight);
        editor.layout({ width:this.$refs.editor.offsetWidth, height:this.$refs.editor.offsetHeight} );
   
      }).observe(this.$refs.box);


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
  height:100px;
}

.bottom-menu{
   width:100%;
  
}
.editor {
  width: 100%;
  height:100%;
  position:relative;
}

.form-control{
  flex-basis: content;
}
</style>