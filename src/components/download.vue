<template>
  <a :href="fileData" :download="fileName">download</a>
</template>

<script>

import Memori from '../services/Memori';


export default {

    data:{

        fileName:'',
        fileData:"",
    },


    computed:{

        scripts(){
            return Memori.scripts;
        },

    }

    

}
</script>

<style>

</style>