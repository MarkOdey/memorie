const script = {
  name: "Turn on camera",
  key: "turn on camera",
  code: `
  
  

  const constraints = {
    audio: true,
    video: { width: 1280, height: 720 }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
    .then((mediaStream) => {

      let video = document.querySelector('video');
      if(!video){
              
        video=  document.createElement('video');
        video.id="video";
        document.body.append(video);

      }
      video = document.querySelector('video');
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
      };
    })
    .catch((err) => {
      // always check for errors at the end.
  
    });
`,
};

export default {
  script,
};
