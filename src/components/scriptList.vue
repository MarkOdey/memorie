<template>
  <div class=" h-100">
    <ol class="small">
      <li v-for="script in scripts" :key="script">
        <span @click="loadScript(script)">{{script.name}}</span>
        <div class="button-group">
          <button class="btn">
            <i @click="removeScript(script)" class="fas fa-trash"></i>
          </button>
          <button class="btn">
            <i @click="runScript(script)" class="fas fa-play"></i>
          </button>
          <button class="btn">
            <i @click="editScript(script)" class="fas fa-pen"></i>
          </button>
          <button class="btn">
            <i  @click="duplicateScript(script)" class="far fa-clone"></i>
          </button>
     
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
import Memori from "../services/Memori";
export default {
  data: () => {

    console.log('scripts', Memori.scripts);

  },
  props:{
    scripts:Array
  },
  computed:{
    
  },
  methods: {
    runScript: (script) => {
      console.log("test", script);
      Memori.runScript(script);
      Memori.load(script);
    },
    editScript: (script) => {
      Memori.edit(script);
    },
    duplicateScript:(script)=>{
      Memori.duplicate(script);
    },
    loadScript: (script) => {
      console.log("test", script);
      Memori.load(script);
    },
    removeScript: (script) => {

      Memori.remove(script);
    },
  },

  created() {},
};
</script>

<style lang="scss">

.button-group {
  display: inline-block;

  .btn {
    padding:0.2em;
  }
}

</style>