<template>
  <v-app>
    <v-main>
      <Editer/>
    </v-main>
  </v-app>
</template>

<script>
import Editer from './components/Template/Editer';

export default {
  name: 'App',
  components: {
    Editer,
  },
  data: () => ({
    //
  }),
};
</script>
<style lang="sass">
  .v-text-field
    padding-top: 5px !important
    margin-top: 0px !important
    margin-bottom: 5px !important
    input
      margin-top: 5px
</style>
