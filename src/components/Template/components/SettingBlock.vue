<template>
  <div class="setting-block">
    <div class="global-setting">
      <div class="align-group">
        <TooltipBtn
          icon
          iconName="mdi-align-horizontal-left"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('left')"
          tooltipText="Align Left"
          top
        ></TooltipBtn>
        <TooltipBtn
          icon
          iconName="mdi-align-horizontal-center"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('center')"
          tooltipText="Align Center"
          top
        ></TooltipBtn>
        <TooltipBtn
          icon
          iconName="mdi-align-horizontal-right"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('right')"
          tooltipText="Align Right"
          top
        ></TooltipBtn>
        <TooltipBtn
          icon
          iconName="mdi-align-vertical-top"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('top')"
          tooltipText="Align Top"
          top
        ></TooltipBtn>
        <TooltipBtn
          icon
          iconName="mdi-align-vertical-center"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('middle')"
          tooltipText="Align Middle"
          top
        ></TooltipBtn>
        <TooltipBtn
          icon
          iconName="mdi-align-vertical-bottom"
          :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
          @click="align('bottom')"
          tooltipText="Align Bottom"
          top
        ></TooltipBtn>
      </div>
      <div class="size-group mt-4">
        <div class="py-0 size-group__text">
          <!-- <font>X</font> -->
          <v-text-field
            type="number"
            label="X"
            :value="activeObj ? Math.round((activeObj.left - originX) * 1920 / canvasWidth) : ''"
            @input="editOrigionX"
            hide-details
            :disabled="fixedCanvas || !activeObj"
            :light="!$vuetify.theme.dark"
          ></v-text-field>
        </div>
        <div class="py-0 size-group__text">
          <!-- <font>Y</font> -->
          <v-text-field
            :light="!$vuetify.theme.dark"
            type="number"
            label="Y"
            :value="activeObj ? Math.round((activeObj.top - originY) * 1080 / canvasHeight) : ''"
            @input="editOrigionY"
            hide-details
            :disabled="fixedCanvas || !activeObj"
          ></v-text-field>
        </div>
      </div>
      <div class="d-flex size-group mt-6">
        <div class="py-0 pl-0 size-group__text">
          <!-- <font>Width</font> -->
          <v-text-field
            type="number"
            label="Width"
            :value="activeObj ? Math.round(activeObj.getRealWidth() * 1920 / canvasWidth) : ''"
            @input="editWidth"
            hide-details
            :disabled="fixedCanvas || !activeObj"
            :light="!$vuetify.theme.dark"
            @blur="forceUpdate"
          ></v-text-field>
        </div>
        <div class="py-0 size-group__icon">
          <v-icon
            :color="activeObj && activeObj.locked ?'#898989':'#e0e0e0'"
            class="pointer"
            @click="onLockObjScale"
          >{{ activeObj && activeObj.locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
        </div>
        <div class="py-0 size-group__text">
          <!-- <font>Height</font> -->
          <v-text-field
            type="number"
            label="Height"
            :value="activeObj ? Math.round(activeObj.getRealHeight() * 1080 / canvasHeight) : ''"
            @input="editHeight"
            hide-details
            :disabled="fixedCanvas || !activeObj"
            :light="!$vuetify.theme.dark"
            @blur="forceUpdate"
          ></v-text-field>
        </div>
      </div>
    </div>

    <div class="custom-setting" v-if="canvas">
      <div class="" v-if="sourceSetting.show">
        <ratio-toggle
          :value="activeObj.ratioMode"
          @input="changeRatioRotate"
        ></ratio-toggle>

        <font>Ratio</font>
        <v-radio-group v-model="activeObj.ratio" row class="mt-0" hide-details @change="onChangeRatio">
          <v-radio :ripple="false" :label="item.text" :value="item.value" v-for="item in ratioItems" :key="item.value"></v-radio>
        </v-radio-group>
      </div>
      <v-row class="my-0" v-if="formatSetting.show">
        <v-col cols="12" class="py-0">
          <font>Time Format</font>
          <v-select
            :light="!$vuetify.theme.dark"
            :items="formatItems"
            v-model="activeObj.timeFormatVal"
            @change="changeTimeFormat"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <v-row class="my-0 format-check" v-if="formatSetting.show">
        <v-col cols="12" class="pt-0 pb-3">
          <v-checkbox
            hide-details
            class="mt-1"
            label="Show AM/PM"
            :ripple="false"
            v-model="canvas.getActiveObject()['ampm']"
            @change="changeTimeFormat"
            ref="ampmCheckbox"
          ></v-checkbox>
        </v-col>
      </v-row>

      <v-row class="my-0" v-if="textSetting.show">
        <v-col cols="12" class="pt-3">
          <v-text-field
            class="text-input"
            label="Text"
            :value="canvas.getActiveObject()['text']"
            @input="editText"
            hide-details
            @focus="exitEditing"
            :light="!$vuetify.theme.dark"
            :outlined="false"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="d-flex align-end justify-space-between my-0">
        <v-col cols="8" class="pt-0" v-if="fontSizeSetting.show">
          <!-- <font>Font Size</font> -->
          <v-text-field
            type="number"
            label="Font Size"
            :value="canvas.getActiveObject()['fontSize']"
            @input="editFontSize"
            hide-details
            :light="!$vuetify.theme.dark"
          ></v-text-field>
        </v-col>

        <v-col cols="8" class="pt-0" v-if="borderSetting.show">
          <!-- <font>Border Width</font> -->
          <v-text-field
            type="number"
            label="Border Width"
            :value="canvas.getActiveObject()['strokeWidth']"
            @input="editStrokeWidth"
            hide-details
            :light="!$vuetify.theme.dark"
            :min="0"
          ></v-text-field>
        </v-col>

        <v-col cols="4" class="pt-0" v-if="borderSetting.show">
          <font>Border Color</font>
          <color-button :canvas="canvas" fabricPropName="stroke"></color-button>
        </v-col>

        <v-col cols="4" class="pt-0" v-if="colorSetting.show">
          <font>Color</font>
          <color-button :canvas="canvas" fabricPropName="fill"></color-button>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
import RatioToggle from './RatioToggle.vue'
import ColorButton from '@/components/Tools/ColorButton'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../FabricVariable'

export default {
  name: 'SettingBlock',
  components: {
    ColorButton,
    RatioToggle
  },
  props: {
    canvas: Object,
    activeObj: Object,
    originX: Number,
    originY: Number,
    canvasWidth: Number,
    canvasHeight: Number,
    formatSetting: {
      type: Object,
      default: function () {
        return {
          show: false,
          value: ''
        }
      }
    },
    textSetting: {
      type: Object,
      default: function () {
        return {
          show: false
        }
      }
    },
    fontSizeSetting: {
      type: Object,
      default: function () {
        return {
          show: false
        }
      }
    },
    colorSetting: {
      type: Object,
      default: function () {
        return {
          show: false
        }
      }
    },
    borderSetting: {
      type: Object,
      default: function () {
        return {
          show: false
        }
      }
    },
    sourceSetting: {
      type: Object,
      default: function () {
        return {
          show: false
        }
      }
    },
    fixedCanvas: Boolean
  },
  data () {
    return {
      ratioMode: 'horizontal',
      lock: false,
      text: '',
      fontSize: '',
      format: 0,
      formatCheck: false,
      formatItems: TIME_FORMAT,
      ratioItems: [
        { value: 0, text: 'Custom Size' },
        { value: '1:1', text: 'Square' },
        { value: '16:9', text: '16:9' },
        { value: '4:3', text: '4:3' }
      ]
    }
  },
  methods: {
    setObj (obj, activeObj = this.canvas.getActiveObject()) {
      if (!activeObj) return
      activeObj.set(obj)
      activeObj.setCoords()
      this.canvas.renderAll()
      this.$emit('updateActiveObject')
    },
    // 物件對齊分成群組、個體
    align (position) {
      var isGroup = false
      if (!this.activeObj || this.fixedCanvas) return
      if (this.activeObj._objects) {
        var groupObjs = this.activeObj._objects
        isGroup = true
      }

      switch (position) {
        case 'left':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  left: 0 - this.activeObj.getRealWidth() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              left: this.originX
            })
          }
          break
        case 'center':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  left: (this.activeObj.getRealWidth() - item.getRealWidth()) * 0.5 - this.activeObj.getRealWidth() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              left: this.originX + this.canvasWidth / 2 - this.activeObj.getRealWidth() / 2
            })
          }
          break
        case 'right':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  left: this.activeObj.getRealWidth() - item.getRealWidth() - this.activeObj.getRealWidth() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              left: this.originX + this.canvasWidth - this.activeObj.getRealWidth()
            })
          }
          break
        case 'top':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  top: 0 - this.activeObj.getRealHeight() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              top: this.originY
            })
          }
          break
        case 'middle':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  top: (this.activeObj.getRealHeight() - item.getRealHeight()) * 0.5 - this.activeObj.getRealHeight() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              top: this.originY + this.canvasHeight / 2 - this.activeObj.getRealHeight() / 2
            })
          }
          break
        case 'bottom':
          if (isGroup) {
            groupObjs.forEach(item => {
              this.setObj(
                {
                  top: this.activeObj.getRealHeight() - item.getRealHeight() - this.activeObj.getRealHeight() * 0.5
                },
                item
              )
            })
          } else {
            this.setObj({
              top: this.originY + this.canvasHeight - this.activeObj.getRealHeight()
            })
          }
          break
      }
    },
    editOrigionX (val) {
      const value = Number(val) / (1920 / this.canvasWidth)
      this.setObj({
        left: value + this.originX
      })
    },
    editOrigionY (val) {
      const value = Number(val) / (1080 / this.canvasHeight)
      this.setObj({
        top: value + this.originY
      })
    },
    editWidth (val) {
      if (!this.activeObj) return
      const scaleHeight = this.activeObj.height * this.activeObj.scaleY
      const scaleWidth = this.activeObj.width * this.activeObj.scaleX
      const value = Number(val) / (1920 / this.canvasWidth)
      var obj = {}
      if (this.activeObj.locked) {
        obj = {
          scaleX: value / this.activeObj.width,
          scaleY: scaleHeight * value / scaleWidth / this.activeObj.height
        }
      } else {
        obj = {
          scaleX: value / this.activeObj.width
        }
      }
      this.setObj(obj)
    },
    editHeight (val) {
      if (!this.activeObj) return
      const scaleHeight = this.activeObj.height * this.activeObj.scaleY
      const scaleWidth = this.activeObj.width * this.activeObj.scaleX
      const value = Number(val) / (1080 / this.canvasHeight)
      var obj = {}
      if (this.activeObj.locked) {
        obj = {
          scaleX: scaleWidth * value / scaleHeight / this.activeObj.width,
          scaleY: value / this.activeObj.height
        }
      } else {
        obj = {
          scaleY: value / this.activeObj.height
        }
      }
      this.setObj(obj)
    },
    forceUpdate () {
      // 強制重新渲染頁面
      this.$forceUpdate()
    },
    // 因為有不同步的問題，所以在點擊文字輸入框時解除物件上的active
    // TODO:如果有更好的方法再改
    exitEditing () {
      this.activeObj.exitEditing()
    },
    editText (newText) {
      this.setObj({
        text: newText
      })
    },
    editFontSize (val) {
      const value = Number(val)
      this.setObj({
        fontSize: parseInt(value, 10)
      })
    },
    editStrokeWidth (val) {
      const value = Number(val)
      this.setObj({
        strokeWidth: parseInt(value, 10)
      })
    },
    editTimeFormat (time) {
      this.setObj({
        text: time,
        timeFormat: this.formatItems[this.activeObj.timeFormatVal].text
      })
    },
    transformFormat () {
      var format = this.formatItems[this.activeObj.timeFormatVal].text
      const ampm = this.activeObj.ampm

      if (ampm) {
        if (format.match(/HH/)) {
          return format.replace('HH', 'hh') + ' A'
        }
      }
      return format
    },
    changeTimeFormat () {
      const time = dayjs().format(this.transformFormat())
      this.editTimeFormat(time)
    },
    onLockObjScale () {
      this.$emit('onLockObjScale')
      this.forceUpdate()
    },
    changeRatioRotate (ratioMode) {
      this.activeObj.ratioMode = ratioMode
      this.onChangeRatio(this.activeObj.ratio)
    },
    onChangeRatio (ratio) {
      const FREEFORM = 0
      const isFreeform = ratio === FREEFORM
      this.activeObj.setControlsVisibility({
        mb: isFreeform,
        ml: isFreeform,
        mr: isFreeform,
        mt: isFreeform
      })
      if (!isFreeform) {
        let [ratioWidth, ratioHeight] = ratio.split(':')
        if (this.activeObj.ratioMode === 'vertical') {
          [ratioHeight, ratioWidth] = [ratioWidth, ratioHeight]
        }
        const newWidth = this.activeObj.scaleX * ratioWidth / ratioHeight * this.activeObj.getRealHeight()
        this.setObj({
          scaleX: newWidth / this.activeObj.getRealWidth()
        })
      }
      this.canvas.renderAll()
    }
  }
}
</script>
<style lang="sass" scoped>
.setting-block
  height: calc(100vh - 58px)
  border-bottom: 1px solid #e6ecef
  .global-setting
    height: 190px
    border-bottom: 1px solid #e6ecef
    padding: 10px
    .align-group
      display: flex
      justify-content: space-between
    .size-group
      display: flex
      justify-content: space-between
      align-items: flex-end
      &__text
        width: 45%
      &__icon
        width: 10%
        text-align: center
  .v-input__slot
    min-height: 36px !important
  .custom-setting
    padding: 10px
    .text-input
      margin-top: 0
      .v-input__slot
        min-height: 30px !important
    .format-check
      display: flex
      align-items: flex-end
    .v-input--selection-controls
      .v-input__slot
        min-height: 30px !important
        .v-input--selection-controls__input
          .v-icon
            font-size: 20px
        .v-label
          font-size: 12px
    .v-input--radio-group__input
      justify-content: space-between
      .v-radio
        margin-right: 0
        margin-bottom: 5px
        width: 50%
        .v-label
          font-size: 14px
  font
    font-size: 12px
</style>
