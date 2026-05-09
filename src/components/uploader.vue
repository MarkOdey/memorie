<template>
  <div class="uploader">
    <i @click="startUpload" class="fas fa-upload"></i>
  </div>
</template>

<script>

  import Memori from '../services/Memori.jsx';
  import addImage from '../scripts/addImage.js';


  export default {
    data: function () {
      return {};
    },
    mounted: function () {

      window.addEventListener("drop", (event) => {
        event.preventDefault();
        if (
          event == undefined ||
          event.dataTransfer == undefined ||
          event.dataTransfer.files == undefined ||
          event.dataTransfer.files[0] == undefined
        ) {
          return;
        }
        this.processFile(event.dataTransfer.files[0]);
      });

      window.addEventListener("dragover", function (event) {
        event.preventDefault();
      });
    },
    methods: {
      async processFile(file) {
        const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => { reject(error); };
        });

        const dataBase64 = await toBase64(file);
        const script = addImage({ name: file.name, dataBase64 });

        Memori.runScript(script);
        Memori.write(script);
      },
      startUpload: function () {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.addEventListener("change", async (event) => {
          const file = event.currentTarget.files[0];
          if (!file) return;
          await this.processFile(file);
        });

        input.click();
      },
    },
  };
</script>

<style></style>
