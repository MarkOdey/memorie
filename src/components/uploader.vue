<template>
  <div class="uploader">
    <i   @click="startUpload" class="fas fa-upload"></i></div>

</template>

<script>

  import Memori from '../services/Memori.jsx';

  export default {
    data: function () {
      return {};
    },
    mounted: function () {

      window.addEventListener("drop", function (event) {
        console.log(event.dataTransfer.files.length);
        if (
          event == undefined ||
          event.dataTransfer == undefined ||
          event.dataTransfer.files == undefined ||
          event.dataTransfer.files[0] == undefined
        ) {
          console.log("nothing to upload");
          return;
        }

        console.log(event.dataTransfer.files[0]);
        event.preventDefault();

        //event.dataTransfer.files[0]
      });

      window.addEventListener("dragover", function (event) {
        event.preventDefault();
      });
    },
    methods: {
      startUpload: function () {
        console.log("upload");

        var input = document.createElement("input");
        input.type = "file";

        input.addEventListener("change", async (event) => {
          console.log("on file changed", event);

          //event.currentTarget.files[0]

          const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => {reject(error)};
          });


          const dataBase64 = await toBase64(event.currentTarget.files[0]);

          console.log(dataBase64);

          const script ={
            name: "Add Image",
            key: "add image",
            code: `
            
              var canvas = document.getElementById('canvas');
              if(!canvas){
              
                canvas=  document.createElement('canvas');
                canvas.id="canvas";
                document.body.append(canvas);

                canvas.width=window.innerWidth;
                canvas.height=window.innerHeight;

                canvas.style.position="absolute";
                canvas.style.top="0";
                canvas.style.left="0";
              }

            

            var image = new Image();
            image.onload = function() {
              var ctx = canvas.getContext("2d");
              ctx.drawImage(image, 0, 0);
            };
            image.src = "${dataBase64}";
                    
                          
              

          `,
          };
          Memori.runScript(script);

          Memori.write(script);



        });

        input.click();
      },
    },
  };
</script>

<style></style>
