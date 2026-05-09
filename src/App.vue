<template>
  <div ref="cover" class="cover"></div>
  <div class="main">

    <vue-resizable :height="editorHeight" :top="editorTop" class="resizer" ref="resizer" :fitParent="true"  @resize:start="startResize" @resize:end="endResize">

    <div ref="menu" class="menu">

      <div class="top">

        <i @click="play" class="far fa-play-circle"></i>
        <i @click="pause" class="far fa-pause-circle"></i>
        <i @click="clearAll" class="fas fa-trash"></i>
        <download></download>

      </div>

      <div v-if="errorMessage" class="error-bar">
        <span>{{ errorMessage }}</span>
        <i @click="errorMessage = ''" class="fas fa-times"></i>
      </div>

      <div class="middle">

          <div class="editor">
            <editor></editor>
          </div>

          <div class="right">

            <ul>
              <li>scripts</li>
            </ul>

            <div class="list">
              <script-list :scripts="scripts"></script-list>
            </div>

          </div>

      </div>


    <div class="bottom">
      <div class="menu">
        <i class="fa-solid fa-code"></i>
      </div>
    </div>
  </div>

</vue-resizable>

  </div>


</template>

<script>
import Memori from "./services/Memori.jsx";
import Ui from "./services/Ui.jsx";
import editor from "./components/editor.vue";
import scriptList from "./components/scriptList.vue";
import download from "./components/download.vue";
import VueResizable from 'vue-resizable'

export default {
  name: "App",
  data() {
    return {
      errorMessage: '',
    };
  },
  created(){
    Memori.start();
    Memori.addEventListener('scripterror', (e) => {
      this.errorMessage = e.message;
      setTimeout(() => { this.errorMessage = ''; }, 5000);
    });
  },
  mounted() {},
  computed:{

    scripts(){
      return Memori.scripts;
    },

    editorTop(){
      return Ui.editorTop;
    },
    editorHeight(){
      return window.innerHeight-Ui.editorTop;
    }

  },
  methods:{
    endResize(res){
      this.$refs.cover.style.pointerEvents ="none";
      Ui.editorHeight=res.height;
      Ui.editorTop  = res.top;
    },
    startResize(res){
      this.$refs.cover.style.pointerEvents ="auto";
      Ui.editorHeight=res.height;
      Ui.editorTop  = res.top;
    },
    play:()=>{
      Memori.play();
    },
    pause:()=>{
      Memori.pause();
    },
    clearAll() {
      if (!confirm('Delete all scripts?')) return;
      Memori.clearAll();
    }
  },
  components: {
    editor: editor,
    scriptList: scriptList,
    download: download,
    VueResizable
  },
};
</script>

<style lang="scss">

.cover{
  position:absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}
.main{
  pointer-events: none;
  widows: 100%;
  position: absolute;
  bottom: 0;
  width: 100%;
  height:100%;


  -webkit-flex-direction: column;
  flex-direction: column;

}

  .menu{
    pointer-events: auto;
    width:100%;
    height:100%;
    display:flex;
    flex-flow:column;

    background:white;
  }

  .error-bar {
    background: #fee2e2;
    color: #991b1b;
    padding: 4px 8px;
    font-size: 0.85em;
    display: flex;
    justify-content: space-between;
    align-items: center;

    i {
      cursor: pointer;
    }
  }

  .middle {

    display: flex;
    flex-grow: 1;

    .editor{
      flex-grow: 1;

    }

    .right{
      width: 300px;
      overflow: scroll;
      height: 100%;
    }

    .list{



    }


  }

  .resizer {
    pointer-events: auto;
  }

  .top {
    width:100%;
    height: 20px
  }

  .bottom {
    width:100%;
    height:20px;

  }


</style>
