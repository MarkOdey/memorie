import { reactive } from "@vue/reactivity";

class Ui  {


  get editorHeight(){
    return this.editor.height;
  }

  set editorHeight(height){
    this.editor.height=height;
    localStorage.setItem('editorHeight', height);
  }


  get editorTop(){
    return this.editor.top;
  }

  set editorTop(top){
    this.editor.top=top;
    localStorage.setItem('editorTop', top);
  }



  constructor() {
    

    this.editor = reactive({
      height:  Number(localStorage.getItem('editorHeight')|| 200),
      top: Number(localStorage.getItem('editorTop')|| 200),
    });


  }


}

//Memori.scripts=["console.log('hello world')"];

export default new Ui();
