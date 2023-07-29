const script = (file) => {
  return {
    name: `Add Image ${file.name}`,
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
  image.src = "${file.dataBase64}";
          
                
    

`,
  };
};

export default script;
