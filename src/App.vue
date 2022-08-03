<template>
  <div class="main">

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
</template>

<script>
import Memori from "./services/Memori.jsx";
import editor from "./components/editor.vue";
import scriptList from "./components/scriptList.vue";

export default {
  name: "App",
  created() {
    console.log("Created", Memori);
    Memori.start();
  },
  methods:{
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
  },
};
</script>

<style lang="scss">
  .main{
     // height: 500px;
      width: 100%;
      widows: 100%;
      position: absolute;
      bottom: 0;

    background-color:white;

      -webkit-flex-direction: column; 
      flex-direction: column; 
      float: left;
  }
  .middle {

    display: flex; 
    height:500px;
    flex:2;


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

    height: 20px;



  } 
  .bottom {
    width:100%;

  height:20px;
   


  } 


</style>
