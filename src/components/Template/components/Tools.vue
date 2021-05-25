<template>
    <div class="tools"
      :class="$vuetify.theme.dark ? 'theme--dark' : 'theme--light'"
    >
      <TooltipBtn
        icon
        iconName="mdi-format-text"
        :iconColor="iconColor"
        @click="onClickFonts"
        tooltipText="Text"
        right
      ></TooltipBtn>
      <TooltipBtn
        icon
        iconName="mdi-square-outline"
        :iconColor="iconColor"
        @click="onClickRectangle"
        tooltipText="Rectangle"
        content-class="mt-2"
        right
      ></TooltipBtn>
      <TooltipBtn
        icon
        iconName="mdi-clock-outline"
        :iconColor="iconColor"
        @click="onClickTime"
        tooltipText="Time"
        content-class="mt-2"
        right
      ></TooltipBtn>
      <TooltipBtn
        icon
        iconName="mdi-crop"
        :iconColor="iconColor"
        @click="onClickCrop"
        tooltipText="Crop"
        content-class="mt-2"
        right
      ></TooltipBtn>
      <v-menu :offset-x="true" right :nudge-right="10">
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip right>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
                class="mt-2"
              >
                <v-icon :class="{'icon-auto-color': !iconColor}" :color="iconColor">mdi-layers-outline</v-icon>
              </v-btn>
            </template>
            <span>Layer</span>
          </v-tooltip>
        </template>
        <v-card
          class="mx-auto layer-tools"
          max-width="344"
        >
          <v-card-text>
            <div class="layer-tools-row col-sm-12 mx-0 row">
              <div class="layer-tools-row__item col-sm-6" @click="setObjZindex('bringToFront')">
                <v-btn text small>
                  <!-- <a-icon name="icon_layer_front" :color="iconColor" class="pointer mr-2" size="16"></a-icon> -->
                  Bring to Front
                </v-btn>
              </div>
              <div class="layer-tools-row__item col-sm-6" @click="setObjZindex('sendToBack')">
                <v-btn text small>
                  <!-- <a-icon name="icon_layer_back" :color="iconColor" class="pointer mr-2" size="16"></a-icon> -->
                  Send to Back
                </v-btn>
              </div>
            </div>
            <div class="layer-tools-row col-sm-12 mx-0 row">
              <div class="layer-tools-row__item col-sm-6" @click="setObjZindex('bringForward')">
                <v-btn text small>
                  <!-- <a-icon name="icon_layer_forward" :color="iconColor" class="pointer mr-2" size="16"></a-icon> -->
                  Bring Forward
                </v-btn>
              </div>
              <div class="layer-tools-row__item col-sm-6" @click="setObjZindex('sendBackwards')">
                <v-btn text small>
                  <!-- <a-icon name="icon_layer_backward" :color="iconColor" class="pointer mr-2" size="16"></a-icon> -->
                  Send Backward
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
      <TooltipBtn
        icon
        iconName="mdi-content-copy"
        :iconColor="iconColor"
        @click="onClickCopy"
        tooltipText="copy"
        content-class="mt-2"
        right
      ></TooltipBtn>
      <TooltipBtn
        icon
        iconName="mdi-trash-can-outline"
        :iconColor="iconColor"
        @click="onClickDelete"
        tooltipText="delete"
        content-class="mt-2"
        right
      ></TooltipBtn>
    </div>
</template>
<script>
export default {
  name: 'Tools',
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
    iconColor () {
      return this.$vuetify.theme.dark ? 'white' : '#31393e'
    }
  },
  methods: {
    onClickFonts () {
      this.$emit('addTextBox')
    },
    onClickRectangle () {
      this.$emit('addRectangle')
    },
    onClickTime () {
      this.$emit('addTime')
    },
    onClickCrop () {
      this.$emit('onCrop')
    },
    onClickCopy () {
      this.$emit('copyItems')
    },
    onClickDelete () {
      this.$emit('deleteItem')
    },
    getSourceLength () {
      return this.canvas.getItemsByName('source').length
    },
    getObjIndex (activeObject) {
      return this.canvas.getObjects().indexOf(activeObject)
    },
    setObjZindex (type) {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject) return
      switch (type) {
        case 'bringToFront':
          if (activeObject.type === 'activeSelection') {
            activeObject.getObjects().forEach(obj => {
              this.bringToFront(obj)
            })
          } else {
            this.bringToFront(activeObject)
          }
          break
        case 'sendToBack':
          if (activeObject.type === 'activeSelection') {
            activeObject.getObjects().reverse().forEach(obj => {
              this.sendToBack(obj)
            })
          } else {
            this.sendToBack(activeObject)
          }
          break
        case 'bringForward':
          if (activeObject.type === 'activeSelection') {
            activeObject.getObjects().forEach(obj => {
              this.bringForward(obj)
            })
          } else {
            this.bringForward(activeObject)
          }
          break
        case 'sendBackwards':
          if (activeObject.type === 'activeSelection') {
            activeObject.getObjects().reverse().forEach(obj => {
              this.sendBackwards(obj)
            })
          } else {
            this.sendBackwards(activeObject)
          }
          break
      }
      this.$emit('updateObjects')
    },
    bringToFront (obj) {
      if (obj.name === 'source') {
        this.canvas.moveTo(obj, this.getSourceLength() - 1)
      } else {
        this.canvas.bringToFront(obj)
      }
    },
    sendToBack (obj) {
      if (obj.name === 'source') {
        this.canvas.sendToBack(obj)
      } else {
        this.canvas.moveTo(obj, this.getSourceLength())
      }
    },
    bringForward (obj) {
      this.canvas.bringForward(obj)
      if (obj.name === 'source' && this.getObjIndex(obj) >= this.getSourceLength()) {
        this.canvas.moveTo(obj, this.getSourceLength() - 1)
      }
    },
    sendBackwards (obj) {
      this.canvas.sendBackwards(obj)
      if (obj.name !== 'source' && this.getObjIndex(obj) < this.getSourceLength()) {
        this.canvas.moveTo(obj, this.getSourceLength())
      }
    }
  }
}
</script>
<style lang="sass" scoped>
.tools
  width: 40px
  background-color: #ffffff
  position: absolute
  left: 12px
  top: 12px
  display: flex
  flex-direction: column
  border-radius: 10px
  z-index: 1
  align-items: center
  padding: 8px 0
  box-shadow: 1px 2px 2px 0 #e6ecef
  &.theme--dark
    box-shadow: none
.layer-tools
  width: 335px
  height: 77px
  .v-card__text
    padding: 10px 0
    font-size: 12px
    .layer-tools-row
      height: 28.5px
      padding: 0
      &__item
        display: flex
        align-items: center
        padding: 0
        cursor: pointer
        .v-btn
          width: 100%
          justify-content: flex-start
</style>
