import { reactive } from "@vue/reactivity";

class Memori extends EventTarget {


  constructor() {
    super();

    this.scripts = reactive([]);

    
    this.script = reactive({
      name: "hello world",
      key: "hello world",
      code: "console.log('hello world.')",
    });

    this.editScript = reactive({
      name: "hello world",
      key: "hello world",
      code: "console.log('hello world.')",
    });

    
    this.isPlaying = false;

    setInterval(()=>{
      if(this.isPlaying) {
        this.tic();
      }
    }, 100);
  }

  addToPlaylist(){
    
  }

  tic() {
    if (this.script) {
      this.runScript(this.script);
    }

    this.dispatchEvent(new Event("tic"));
  }

  next() { }

  tryInjectIframe() {
    if (!this.iframe) {
      this.injectIframe();
    }
  }

  runScript(script) {

    console.log(script);
    let code;
    if (typeof script == "string") {
      code = script;
    }
    if (script.code) {
      code = script.code;
    }

    this.tryInjectIframe();


    this.iframe.contentWindow.postMessage(code, 'http://localhost:3000');
    //return Function('"use strict";return (' + code + ")")();
  }

  write(script) {
    try {

      const index = this.getIndex(script.key);


      if (index == -1) {
        this.scripts.push({ code: script.code, key: script.key, name: script.name });
      } else {
        this.scripts[index] = { code: script.code, key: script.key, name: script.name };
      }

      const scripts = JSON.stringify(this.scripts);

      localStorage.setItem("scripts", scripts);

    } catch (error) {
      console.log("error running script.", error);
    }
  }

  duplicate(script) {

    this.write({ key: Date.now(), name: script.name, code: script.code });


  }

  getIndex(key) {
    return this.scripts.findIndex((script) => {
      console.log(script.key, key);
      return key === script.key;
    });

  }

  remove(key) {

    console.log(key);

    const index = this.getIndex(key);

    if(index!==-1){
      this.scripts.splice(index, 1);
    }


    localStorage.setItem("scripts", this.scripts);
  }

  injectIframe() {

    console.log('DO I REACH HERE?')
    let iframe = document.getElementById("sandbox");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.sandbox =
        "allow-same-origin allow-scripts allow-popups allow-forms camera microphone";
      iframe.id = "sandbox";

      iframe.className = "fixed-top w-100 h-100";
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.zIndex = "-1";

      iframe.srcdoc =
        "<!-- frame.html --><!DOCTYPE html><html style=\"overflow:hidden;\"><head><title></title><script>window.addEventListener('message', function (e) {var mainWindow = e.source;var result = '';try {result = eval(e.data); } catch (e) {result = 'eval() threw an exception.';}mainWindow.postMessage(result, event.origin);});</script></head></html>";
      iframe.onload = () => {
        this.window = iframe.contentWindow;
      };

      document.body.appendChild(iframe);

      this.iframe = iframe;
    }

 

    try {

      console.log('loading scripts')
      this.scripts = reactive(JSON.parse(localStorage.getItem("scripts")));

      if (this.scripts == null) {
        this.scripts = reactive([]);
      }
    } catch (e) {

      console.log(e);
      this.scripts = reactive([]);
    }
  }

  load(script) {


    if (!this.script) {
       this.script = reactive(script);
    } else {
      this.script.name = script.name;
      this.script.code = script.code;
      this.script.key = script.key;
    }
  }

  edit(script) {

    //this.editScript = reactive(script);

    console.log('update  edit script', script)
    this.editScript.name = script.name;
    this.editScript.code = script.code;
    this.editScript.key = script.key;


  }
  start() {
    console.log("started");

    this.injectIframe();

    if (this.scripts && this.scripts.length > 0) {

      this.script.name = this.scripts[0].name;
      this.script.code = this.scripts[0].code;
      this.script.key = this.scripts[0].key;
    }

    this.tic();
  }

  play(){

    this.isPlaying = true;

  }

  pause(){
    this.isPlaying = false
  }


}

//Memori.scripts=["console.log('hello world')"];

export default new Memori();
