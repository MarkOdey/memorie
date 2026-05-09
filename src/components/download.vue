<template>
  <button class="btn" @click="downloadScripts" title="Export scripts">
    <i class="fas fa-download"></i>
  </button>
</template>

<script>

import Memori from '../services/Memori';

export default {
  methods: {
    downloadScripts() {
      const data = JSON.stringify(Memori.scripts, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memorie-scripts.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
</script>

<style>

</style>
