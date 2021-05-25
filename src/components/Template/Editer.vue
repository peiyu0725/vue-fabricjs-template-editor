<template>
  <div class="pgm-template">
    <v-card class="a-card mx-auto" outlined>
      <div class="col-sm-12 template-head">
        <div class="template-title">
         <v-text-field
            v-model="templateName"
            placeholder="New Template"
            hide-details
            :outlined="false"
            :light="!$vuetify.theme.dark"
          ></v-text-field>
        </div>
        <div class="template-setting text-right">
          <TooltipBtn
            icon
            iconName="mdi-restore"
            :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
            @click="showDialog=true"
            tooltipText="Clear All"
            content-class="mr-2"
            bottom
          ></TooltipBtn>
          <TooltipBtn
            icon
            iconName="mdi-content-save"
            :iconColor="$vuetify.theme.dark ? 'white' : '#31393e'"
            @click="saveTemplate"
            tooltipText="Save"
            content-class="mr-2"
            bottom
          ></TooltipBtn>
        </div>
      </div>
      <div class="template-body">
        <div class="side-block">
          <setting-block
            :canvas="canvas"
            :textSetting="setting.text"
            :fontSizeSetting="setting.fontSize"
            :colorSetting="setting.color"
            :formatSetting="setting.format"
            :borderSetting="setting.border"
            :sourceSetting="setting.source"
            :activeObj="activeObject"
            :originX="originX"
            :originY="originY"
            :canvasWidth="canvasWidth"
            :canvasHeight="canvasHeight"
            :fixedCanvas="fixedCanvas"
            @updateActiveObject="updateActiveObject"
            @onLockObjScale="onLockObjScale"
          ></setting-block>
          <!-- <material-block
            :canvas="canvas"
            @addImage="addImage"
            @saveImage="saveImage"
            @setColorBg="setColorBg"
            @addLayout="addLayout"
            @transformBackground="transformBackground"
          ></material-block> -->
        </div>
        <div class="center-block" id="centerblock">
          <div class="work-space-block" ref="workspace">
            <tools
              :canvas="canvas"
              @addTextBox="addTextBox"
              @addRectangle="addRect"
              @addTime="addTimeText"
              @deleteItem="removeObject"
              @copyItems="copy"
              @onCrop="onDblclick(activeObject)"
              @updateObjects="getObjects"
            ></tools>
            <zoom :canvas="canvas" @setZoom="setZoom"></zoom>
            <canvas id="Canvas"></canvas>
          </div>
        </div>
        <div class="side-block">
          <layer-block
            :canvas="canvas"
            :items="objects"
            :activeObj="activeObject"
            :fixedItem="fixedObj"
            :bgColor="bgColor"
            @setFObjToActive="setToActive"
            @changeZIndex="changeZIndex"
            @setLockState="setLockState"
            @setColorBg="setColorBg"
            @addImage="addImage"
            @removeBgImage="removeBgImage"
          ></layer-block>
        </div>
      </div>
    </v-card>

    <!-- ClearAll Dialog -->
    <v-dialog content-class="clear-dialog" v-model="showDialog" max-width="484" :persistent="false">
      <v-card>
        <v-card-title>
          Are you sure you want to clear all items on this template?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn coloe="cancel" :outlined="true" :dialog="true" style="margin-right:8.5px" @click="cancelDialog">
            Cancel
          </v-btn>
          <v-btn color="primary" :outlined="true" :dialog="true" style="margin-right:8.5px" @click="clearAll">
            Clear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import SettingBlock from './components/SettingBlock'
// import MaterialBlock from './components/MaterialBlock'
import LayerBlock from './components/LayerBlock'
import Tools from './components/Tools'
import Zoom from './components/Zoom'
import FabricMixins from './mixins/FabricMixins.js'
import LayoutTemplateMixins from './mixins/LayoutTemplateMixins.js'
import { CUSTOM_FABRIC_ATTRS } from './FabricVariable'
import { base64ToFile, checkEvenNum, checkFourNum, downloadFile } from '@/utils/tool'

export default {
  name: 'TemplateEditer',
  components: {
    SettingBlock,
    // MaterialBlock,
    LayerBlock,
    Tools,
    Zoom,
  },
  mixins: [FabricMixins, LayoutTemplateMixins],
  data () {
    return {
      template: {
        foreground: '',
        foregroundFile: '',
        time: '',
        screens: [
          {
            source: 1,
            layer: 1,
            input: 0,
            visible: false,
            isCrop: false,
            crop: [0, 0, 0, 0],
            geometry: [0, 0, 0, 0]
          },
          {
            source: 2,
            layer: 1,
            input: 0,
            visible: false,
            isCrop: false,
            crop: [0, 0, 0, 0],
            geometry: [0, 0, 0, 0]
          },
          {
            source: 3,
            layer: 1,
            input: 0,
            visible: false,
            isCrop: false,
            crop: [0, 0, 0, 0],
            geometry: [0, 0, 0, 0]
          },
          {
            source: 4,
            layer: 1,
            input: 0,
            visible: false,
            isCrop: false,
            crop: [0, 0, 0, 0],
            geometry: [0, 0, 0, 0]
          }
        ]
      },
      screenForm: [0, 0, 0, 0],
      templateName: '',
      workSpaceWidth: 0,
      workSpaceHeight: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      originX: 0,
      originY: 0,
      showDialog: false,
      nono: false,
      exportKeys: [],
      copyItem: null
    }
  },
  computed: {
    permission () {
      return this.$store.getters.loginInfo.permission
    }
  },
  methods: {
    goBack () {
      this.$router.push('/template')
    },
    exportKey (key) {
      this.exportKeys.push(key)
      if (this.exportKeys.length === 4) {
        if (this.exportKeys.join('') === 'nono') {
          const exportImageBase64 = this.transformFilterObjs({
            canvas: this.canvas,
            type: 'exportImage'
          })
          downloadFile(exportImageBase64, `image_${Date.now()}`)
          this.$toast.success('Hello Nono!')
        }
        this.exportKeys = []
        this.nono = false
      }
    },
    keydown (e) {
      // Export Template
      if (this.nono) {
        this.exportKey(e.key)
      }
      if (e.key === '/') {
        this.nono = true
        this.exportKeys = []
      }

      if (this.activeObject) {
        const left = this.activeObject.left
        const top = this.activeObject.top
        const obj = {
          top: this.activeObject.top - this.originY,
          bottom: this.activeObject.top - this.originY + this.activeObject.getRealHeight(),
          left: this.activeObject.left - this.originX,
          right: this.activeObject.left - this.originX + this.activeObject.getRealWidth()
        }
        let val = this.distance / 1920 * this.canvasWidth
        if (e.shiftKey) val = this.distance * 4 / 1920 * this.canvasWidth

        switch (e.key) {
          case 'ArrowRight':
            if (this.activeObject.name === 'source' && obj.right >= this.canvasWidth) {
              this.activeObject.set({
                left: this.canvasWidth - this.activeObject.getRealWidth() + this.originX
              })
            } else {
              this.activeObject.set({
                left: left + val
              })
            }
            break
          case 'ArrowLeft':
            if (this.activeObject.name === 'source' && obj.left <= 0) {
              this.activeObject.set({
                left: this.originX
              })
            } else {
              this.activeObject.set({
                left: left - val
              })
            }
            break
          case 'ArrowDown':
            if (this.activeObject.name === 'source' && obj.bottom >= this.canvasHeight) {
              this.activeObject.set({
                top: this.canvasHeight - this.activeObject.getRealHeight() + this.originY
              })
            } else {
              this.activeObject.set({
                top: top + val
              })
            }
            break
          case 'ArrowUp':
            if (this.activeObject.name === 'source' && obj.top <= 0) {
              this.activeObject.set({
                top: this.originY
              })
            } else {
              this.activeObject.set({
                top: top - val
              })
            }
            break
        }
        this.canvas.renderAll()
      }

      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        this.copyItem = this.activeObject
      }

      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        this.copy(this.copyItem)
      }

      if (e.key === 'Delete') this.removeObject()
      if (e.keyCode === 13) e.preventDefault()
    },
    cancelDialog () {
      this.showDialog = false
    },
    onChangeScreen (screenForm) {
      this.screenForm = screenForm
    },
    updateScreenImage () {
      const nowTimestamp = Date.now()
      this.canvas.getItemsByName('source').map(item => {
        if (this.screenForm[item.sourceNum - 1] !== 0) {
          const image = new Image()
          image.src = `/api/inputs/${this.screenForm[item.sourceNum - 1]}/snapshot?time=${nowTimestamp}`
          image.setAttribute('crossOrigin', 'Anonymous')
          image.addEventListener('error', () => {
            image.src = '/img/source/source' + item.sourceNum + '.jpg'
          })
          image.addEventListener('load', e => {
            if (e.target.naturalWidth) {
              item.sourceInput = JSON.parse(JSON.stringify(this.screenForm[item.sourceNum - 1]))
              var orginImage = {
                width: 1920,
                height: 1080,
                originWidth: e.target.naturalWidth,
                originHeight: e.target.naturalHeight
              }
              if (item.cropObj) {
                item.cropObj.targetOriginWidth = e.target.naturalWidth
                item.cropObj.targetOriginHeight = e.target.naturalHeight
                orginImage.cropObj = item.cropObj
                orginImage.width = item.width / (item.originWidth / 1920) * (e.target.naturalWidth / 1920)
                orginImage.height = item.height / (item.originHeight / 1080) * (e.target.naturalHeight / 1080)
                orginImage.cropX = item.cropX / (item.originWidth / 1920) * (e.target.naturalWidth / 1920)
                orginImage.cropY = item.cropY / (item.originHeight / 1080) * (e.target.naturalHeight / 1080)
                orginImage.scaleX = item.scaleX * (item.originWidth / 1920) / (e.target.naturalWidth / 1920)
                orginImage.scaleY = item.scaleY * (item.originHeight / 1080) / (e.target.naturalHeight / 1080)
              }
              item.setElement(e.target)
              item.set(orginImage)
              this.canvas.renderAll()
            }
          })
        }
      })
    },
    addImageProcess (img, src) {
      return new Promise((resolve) => {
        img.onload = (e) => resolve(e)
        img.onerror = (e) => resolve(e)
        img.src = src
      })
    },
    async saveTemplate () {
      const canvasJson = this.canvas.toJSON(CUSTOM_FABRIC_ATTRS)
      if (canvasJson.objects.length === 0) {
        this.$toast.error(this.$t('toast.emptyTemplate'))
        return
      } else if (this.fixedCanvas) {
        this.$toast.error(this.$t('toast.endCrop'))
        return
      } else if (this.templateName === '') {
        this.$toast.error(this.$t('toast.inputTemplateName'))
        return
      }
      this.$loading.show(this.$t('dialog.saveProgress'))
      this.template.name = this.templateName
      this.template.color = canvasJson.backgroundImage.objects ? canvasJson.backgroundImage.objects[0].fill : canvasJson.backgroundImage.fill
      this.template.background = canvasJson.backgroundImage.objects ? canvasJson.backgroundImage.objects[1].src.split('/')[4] : ''
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      this.canvas.discardActiveObject().renderAll()
      const originObjs = this.canvas._objects
      const originBg = this.canvas.backgroundImage
      const nowTimestamp = Date.now()
      // 時間
      if (this.canvas.getItemsByName('time').length > 0) {
        const time = this.canvas.getItemsByName('time')[0]
        this.template.time = {}
        this.template.time.format = time.timeFormat
        this.template.time.size = Math.round(time.fontSize / (this.canvasHeight / 1080))
        this.template.time.color = time.fill
        this.template.time.position = [
          checkEvenNum((time.left - this.originX) / (this.canvasWidth / 1920)),
          checkEvenNum((time.top - this.originY) / (this.canvasHeight / 1080))
        ]
        this.template.time.showampm = time.ampm
        this.template.time = JSON.stringify(this.template.time)
      }

      // change source image
      const changeSourceImage = this.canvas.getItemsByName('source').map(async item => {
        const image = new Image()
        const src = '/img/source/source' + item.sourceNum + '.jpg'
        await this.addImageProcess(image, src).then(e => {
          if (e.target.naturalWidth) {
            item.sourceInput = JSON.parse(JSON.stringify(this.screenForm[item.sourceNum - 1]))
            var orginImage = {
              width: 1920,
              height: 1080,
              originWidth: e.target.naturalWidth,
              originHeight: e.target.naturalHeight
            }
            if (item.cropObj) {
              item.cropObj.targetOriginWidth = e.target.naturalWidth
              item.cropObj.targetOriginHeight = e.target.naturalHeight
              orginImage.cropObj = item.cropObj
              orginImage.width = item.width / (item.originWidth / 1920) * (e.target.naturalWidth / 1920)
              orginImage.height = item.height / (item.originHeight / 1080) * (e.target.naturalHeight / 1080)
              orginImage.cropX = item.cropX / (item.originWidth / 1920) * (e.target.naturalWidth / 1920)
              orginImage.cropY = item.cropY / (item.originHeight / 1080) * (e.target.naturalHeight / 1080)
              orginImage.scaleX = item.scaleX * (item.originWidth / 1920) / (e.target.naturalWidth / 1920)
              orginImage.scaleY = item.scaleY * (item.originHeight / 1080) / (e.target.naturalHeight / 1080)
            }
            item.setElement(e.target)
            item.set(orginImage)
            this.canvas.renderAll()
          }
        })
      })
      await Promise.all(changeSourceImage)

      // 全景
      const templateBase64 = this.transformFilterObjs({
        canvas: this.canvas,
        type: 'template'
      })
      this.template.templateFile = base64ToFile(templateBase64, `template_${nowTimestamp}`)

      // 背景
      const backgroundBase64 = this.transformFilterObjs({
        canvas: this.canvas,
        type: 'background'
      })
      this.template.backgroundFile = base64ToFile(backgroundBase64, `background_${nowTimestamp}`)
      this.canvas._objects = originObjs

      if (this.canvas.getObjects().length > 0) {
        // 前景:移除背景及source
        const foregroundBase64 = this.transformFilterObjs({
          canvas: this.canvas,
          objs: originObjs,
          type: 'foreground'
        })
        this.template.foregroundFile = base64ToFile(foregroundBase64, `foreground_${nowTimestamp}`)

        // 回復物件
        this.canvas._objects = originObjs
        this.canvas.backgroundColor = '#eaeaea'
        this.canvas.setBackgroundImage(originBg, this.canvas.renderAll.bind(this.canvas))
      }

      this.getScreens()
      console.log(this.template)
    },
    getScreens () {
      const screens = this.canvas.getItemsByName('source')
      screens.forEach((item, index) => {
        this.template.screens[item.sourceNum - 1].layer = index + 1
        this.template.screens[item.sourceNum - 1].input = item.sourceInput || 0
        this.template.screens[item.sourceNum - 1].visible = true
        const left = (item.left - this.originX) / (this.canvasWidth / 1920)
        const top = (item.top - this.originY) / (this.canvasHeight / 1080)
        const width = item.width * item.scaleX / (this.canvasWidth / 1920)
        const height = item.height * item.scaleY / (this.canvasHeight / 1080)
        const cropedX = item.cropObj ? item.cropX / (item.originWidth / 1920) : 0
        const cropedY = item.cropObj ? item.cropY / (item.originHeight / 1080) : 0
        const cropWidth = item.cropObj
          ? item.cropObj.width * item.cropObj.scaleX / item.lastScreenScaleX
          : width
        const cropHeight = item.cropObj
          ? item.cropObj.height * item.cropObj.scaleY / item.lastScreenScaleY
          : height
        // 擺放位置超出範圍
        const errorX = item.left < this.originX ? (this.originX - item.left) / (this.canvasWidth / 1920) : 0
        const errorY = item.top < this.originY ? (this.originY - item.top) / (this.canvasHeight / 1080) : 0
        this.template.screens[item.sourceNum - 1].geometry = [
          left + errorX > 0 ? checkFourNum(left + errorX) : 0,
          top + errorY > 0 ? checkFourNum(top + errorY) : 0,
          width - errorX > 1920 ? 1920 : checkFourNum(width - errorX),
          height - errorY > 1080 ? 1080 : checkFourNum(height - errorY)
        ]
        if (item.cropObj || errorX > 0 || errorY > 0) {
          this.template.screens[item.sourceNum - 1].isCrop = true
          this.template.screens[item.sourceNum - 1].crop = [
            cropedX + errorX > 0 ? checkFourNum(cropedX + errorX) : 0,
            cropedY + errorY > 0 ? checkFourNum(cropedY + errorY) : 0,
            checkFourNum(cropWidth),
            checkFourNum(cropHeight)
          ]
        }
      })
      this.template.screens = JSON.stringify(this.template.screens)
    },
    transformFilterObjs ({ canvas, objs = null, type = null }) {
      switch (type) {
        case 'foreground':
          canvas.backgroundColor = null
          canvas.backgroundImage = null
          canvas._objects = objs.filter(item => item.name !== 'source' && item.name !== 'time')
          this.canvas.renderAll()
          break
        case 'background':
          canvas._objects = []
          this.canvas.renderAll()
          break
      }

      if (type === 'foreground') {
        var foreground = canvas.toJSON(CUSTOM_FABRIC_ATTRS)
        foreground.objects.forEach(item => {
          item.left = (item.left - this.originX) * (1920 / this.canvasWidth)
          item.top = (item.top - this.originY) * (1080 / this.canvasHeight)
          item.scaleX *= 1920 / this.canvasWidth
          item.scaleY *= 1080 / this.canvasHeight
          if (item.name === 'image') {
            const src = item.src.split('/')
            item.src = (src[src.length - 1] === 'view') ? src[src.length - 2] : src[src.length - 1]
          }
        })
        this.template.foreground = JSON.stringify(foreground)
      }

      const imageBase64 = canvas.toDataURL({
        left: this.originX,
        top: this.originY,
        width: this.canvasWidth,
        height: this.canvasHeight,
        multiplier:
          type !== 'template'
            ? 1920 / this.canvasWidth
            : type !== 'exportImage'
              ? 960 / this.canvasWidth
              : 192 / this.canvasWidth
      })
      return imageBase64
    },
    setScreens (screens) {
      screens = screens.filter(item => item.visible)
      this.addLayout({ data: screens })
      screens.forEach(item => {
        this.screenForm[item.source - 1] = item.input
      })
    },
    async initTemplate () {
      this.$nextTick()
        .then(() => {
          this.initCanvas()
        })
    },
    setForeground ({ color, screens, time, background }) {
      this.canvas.backgroundColor = '#eaeaea'
      this.setColorBg(color)
      this.setScreens(screens)
      if (background !== '') {
        this.saveImage({ image: `/background/${background}/view`, type: 'background' })
        this.addImage()
      }
      if (time !== '') {
        this.addTimeText(time)
      }
    },
    async getTemplateById (id) {
      try {
        const response = await fetch(id)
        const data = response.data
        this.templateName = data.name
        var foreground = data.foreground !== '' ? JSON.parse(data.foreground) : ''
        var screens = JSON.parse(data.screens)
        var time = data.time !== '' ? JSON.parse(data.time) : ''
        if (foreground !== '') {
          foreground.objects.forEach(item => {
            item.left = item.left * (this.canvasWidth / 1920) + this.originX
            item.top = item.top * (this.canvasHeight / 1080) + this.originY
            item.scaleX *= this.canvasWidth / 1920
            item.scaleY *= this.canvasHeight / 1080
            if (item.name === 'image') {
              item.src = `template/${id}/image/${item.src}`
            }
          })
          this.canvas.loadFromJSON(foreground, () => {
            this.setForeground({
              color: data.color,
              screens: screens,
              time: time,
              background: data.background
            })
            this.canvas.renderAll()
          })
        } else {
          this.setForeground({
            color: data.color,
            screens: screens,
            time: time,
            background: data.background
          })
          this.canvas.renderAll()
        }
      } catch (err) {
        console.error(err)
        this.$toast.error(`${this.$t('toast.fetchFail')}:${err.message}`)
      }
    }
  },
  async mounted () {
    this.workSpaceWidth = Math.round(this.$refs.workspace.clientWidth)
    this.workSpaceHeight = document.body.clientHeight - 58
    const scale = parseFloat((this.workSpaceWidth * 0.9 / 1920).toFixed(1))
    this.canvasWidth = 1920 * scale
    this.canvasHeight = this.canvasWidth * 0.5625
    this.originX = (this.workSpaceWidth - this.canvasWidth) / 2
    this.originY = (this.workSpaceHeight - this.canvasHeight) / 2
    this.initTemplate()
    document.addEventListener('keydown', this.keydown)
    this.$on('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', this.keydown)
    })
  }
}
</script>
<style lang="sass">
.clear-dialog
  color: var(--v-font-base)
</style>
<style lang="sass" scoped>
.pgm-template
  max-width: 1920px
  margin: 0 auto
  &__title
    display: flex
    align-items: center
    height: 44px
  div
    -moz-user-select: none
    -webkit-user-select: none
    -ms-user-select: none
    user-select: none
    -o-user-select: none
  .custom-btn
    svg
      margin-left: 1px
  .template-head
    height: 56px
    display: flex
    align-items: center
    justify-content: space-between
    border-bottom: 2px solid #e6ecef
    .template-setting
      display: inline-flex
  .template-body
    display: flex
    justify-content: space-between
    .side-block
      width: 320px
    .center-block
      width: calc(100% - 640px)
      overflow: hidden
    .work-space-block
      position: relative
@media screen and (max-width: 1024px)
  .pgm-template
    .template-body
      .side-block
        width: 200px
      .center-block
        width: calc(100% - 400px)
</style>
