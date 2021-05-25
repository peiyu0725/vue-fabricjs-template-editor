<template>
    <div class="zoom"
      :class="$vuetify.theme.dark ? 'theme--dark' : 'theme--light'"
    >
        <v-icon :color="$vuetify.theme.dark ? 'white' : '#31393e'" class="pointer" @click="zoomOut">mdi-minus</v-icon>
        <div class="zoom-value" unselectable="on" onselectstart="return false;" onmousedown="return false;">{{getZoom}}%</div>
        <v-icon :color="$vuetify.theme.dark ? 'white' : '#31393e'" class="pointer" @click="zoomIn">mdi-plus</v-icon>
    </div>
</template>
<script>
export default {
  name: 'Zoom',
  components: {
  },
  props: {
    canvas: Object
  },
  data () {
    return {
    }
  },
  computed: {
    getZoom () {
      return this.canvas ? Number((this.canvas.getZoom() * 100).toFixed(0)) : 100
    }
  },
  methods: {
    zoomOut () {
      this.$emit('setZoom', -0.05)
    },
    zoomIn () {
      this.$emit('setZoom', 0.05)
    }
  }
}
</script>
<style lang="sass" scoped>
.zoom
  width: 144px
  height: 40px
  border-radius: 10px
  box-shadow: 1px 2px 2px 0 #e6ecef
  background-color: #ffffff
  position: absolute
  left: 12px
  bottom: 16px
  z-index: 1
  display: flex
  align-items: center
  justify-content: space-between
  padding: 0 12px
  font-size: 14px
  &.theme--dark
    box-shadow: none
</style>
