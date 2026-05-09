<template>
  <div class=" h-100">
    <ol class="small">
      <li v-for="script in scripts" :key="script.key" :class="{ active: isActive(script) }">
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
  props:{
    scripts:Array
  },
  methods: {
    isActive(script) {
      return Memori.script.key === script.key;
    },
    runScript(script) {
      Memori.runScript(script);
      Memori.load(script);
    },
    editScript(script) {
      Memori.edit(script);
    },
    duplicateScript(script) {
      Memori.duplicate(script);
    },
    loadScript(script) {
      Memori.load(script);
    },
    removeScript(script) {
      if (!confirm(`Delete "${script.name}"?`)) return;
      Memori.remove(script.key);
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

li.active > span {
  font-weight: bold;
}

</style>
