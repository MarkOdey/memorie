<template>
  <div class="cover"></div>
  <div class="main">



    <vue-resizable  ref="resizer" :fitParent="true" :disableAttributes="['t']" @resize:end="endResize">

    <div ref="menu" class="menu">

      <div class="top">

        <i @click="play" class="far fa-play-circle"></i>
        <i @click="pause" class="far fa-pause-circle"></i>
        <i @click="cross" class="fas fa-dna"></i>
        
      </div>


      <div class="middle">

          <div class="editor">
            <editor></editor>
          </div>
          <div class="list">
            <script-list></script-list>
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
import VueResizable from 'vue-resizable'

export default {
  name: "App",
  created(){
    console.log("Created", Memori);
    Memori.start();
  },
  mounted() {
    this.$refs.resizer.style.height=Ui.editorHeight+"px";
    this.$refs.resizer.style.top=Ui.editorTop+"px";


  },
  computed:{

  },
  methods:{
    endResize:(res)=>{
      console.log(res,'this is a end resize event!!!');
      Ui.editorHeight=res.height;
      Ui.editorTop  = res.top;
    },
    play:()=>{
      Memori.play();
      console.log('play');
    },
    pause:()=>{
      Memori.pause();
      console.log('pause');
    },
    cross:()=>{
      console.log('pause');
    }
  },
  components: {
    editor: editor,
    scriptList: scriptList,
    VueResizable
  },
};
</script>

<style lang="scss">

.cover{
  position:absolute;
  height: 100%;
  width: 100%;

}
.main{
  
  widows: 100%;
  position: absolute;
  bottom: 0;
  width: 100%;
  height:100%;


  -webkit-flex-direction: column; 
  flex-direction: column; 
    
}

  .menu{

    width:100%;
    height:100%;
    display:flex;
    flex-flow:column;

  }

  .middle {

    display: flex; 
    flex-grow: 1;

    .editor{
      flex-grow: 1;
      
    }

    .list{

      width: 300px;
      overflow: scroll;
      height: 100%;
      
    }

    
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
