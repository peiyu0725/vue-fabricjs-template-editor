<template>
  <v-menu
    :close-on-content-click="false"
    offset-y>
    <template v-slot:activator="{ on }">
          <v-btn class="color-block elevation-0" v-on="on" dark :color="useCanvas?canvas.getActiveObject()[fabricPropName]:color">
          </v-btn>
    </template>
    <Sketch
      v-if="showSketch"
      @input="changeColorByfabricPropName"
      :value="useCanvas?canvas.getActiveObject()[fabricPropName]:color"  />
  </v-menu>
</template>

<script>
import { Sketch } from 'vue-color'
export default {
  components: {
    Sketch
  },
  name: 'color-button',
  props: {
    useCanvas: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: ''
    },
    canvas: Object,
    fabricPropName: String
  },
  methods: {
    showSketch () {
      if (this.useCanvas) {
        return this.canvas.getActiveObject()[this.fabricPropName]
      } else {
        return true
      }
    },
    changeColorByfabricPropName (val) {
      if (this.useCanvas) {
        const activeObject = this.canvas.getActiveObject()
        if (!activeObject) return
        activeObject.set({
          [this.fabricPropName]: val.hex
        })
        this.canvas.renderAll()
      } else {
        this.$emit('changeColor', val)
      }
    }
  }
}
</script>

<style lang="sass">
  .color-block
    border-radius: 5px
    height: 24px
    width: 100%
    border: 1px solid #979797 !important
  .vc-sketch
    input
      color: #000
</style>
