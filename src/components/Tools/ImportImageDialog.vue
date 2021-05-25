<template>
  <v-dialog v-model="showImportImg" max-width="512" :persistent="false">
    <div>
      <div class="a-title dialog-title">{{ setDialogTitle(dialogName) }}</div>
      <div id="canvas-wrapper">
        <canvas id="ImageCanvas"></canvas>
      </div>
      <div
        class="dialog-img-block mb-3 pointer"
        :class="{'bg-fill': bgType === 0, 'bg-contain': bgType === 1 || dialogName !== 'background'}"
        @click="uploadImg"
        @dragover="fileDragHover"
        @dragleave="fileDragHover"
        @drop="fileSelectHandler"
        ref="dialogImgBlock"
      >
        <a-icon
          class="remove-icon"
          name="icon_remove"
          color="#e6ecef"
          size="29"
          v-if="selectedFile"
          @click.native="removeImg"
        ></a-icon>
        <a-icon name="icon_zoomin" color="#e6ecef" size="56" class="mb-2" v-if="!selectedFile"></a-icon>
        <font v-if="!selectedFile" :style="{color: $vuetify.theme.dark?'#ffffff':'#35515f'}">Drag and drop or select an image.</font>
      </div>
      <input ref="uploader" type="file" accept="image/*" @change="onFileChanged" class="d-none" />

      <div class="col-sm-4 pa-0" v-if="dialogName === 'background'">
        <v-select :items="bgTypeItems" v-model="bgType" :light="!$vuetify.theme.dark"></v-select>
      </div>
      <div class="text-right dialog-bottom-btn">
        <custom-btn
          :outlined="true"
          :dialog="true"
          color="cancel"
          class="mr-2"
          @click="cancelDialog"
        >Cancel</custom-btn>
        <custom-btn :dialog="true" @click="save(dialogName)" color="save">Add</custom-btn>
      </div>
    </div>
  </v-dialog>
</template>
<script>
import { fabric } from 'fabric'
import { base64ToFile } from '@/utils/tool'

export default {
  name: 'ImportImageDialog',
  props: {
    showImportImg: Boolean,
    dialogName: String
  },
  data () {
    return {
      bgTypeItems: [
        { text: 'FillScreen', value: 0 },
        { text: 'Contain', value: 1 }
      ],
      bgType: 0,
      selectedFile: null
    }
  },
  methods: {
    setDialogTitle (dialogName) {
      if (dialogName === 'image') {
        return 'Add New Image'
      } else if (dialogName === 'background') {
        return 'Add New Background'
      }
    },
    save (name) {
      if (!this.selectedFile) {
        this.$toast.error('Please upload image')
        return
      }
      const src = URL.createObjectURL(this.selectedFile)
      var moveing = null
      if (name === 'background') {
        moveing = {
          image: src,
          type: 'background',
          size: this.bgType
        }
      } else if (name === 'image') {
        moveing = {
          image: src,
          type: 'image',
          file: this.selectedFile
        }
      }
      this.createImage(moveing)
      this.bgType = 0
      this.removeAll()
    },
    cancelDialog () {
      this.$emit('close')
      this.removeAll()
    },
    removeImg (e) {
      e.stopPropagation()
      this.$refs.dialogImgBlock.style.backgroundImage = 'none'
      this.selectedFile = null
    },
    removeAll () {
      this.$refs.dialogImgBlock.style.backgroundImage = 'none'
      this.selectedFile = null
      this.$refs.uploader.value = ''
    },
    showImg (file) {
      const re = /image/
      if (!re.test(file.type)) return
      this.selectedFile = file
      const src = URL.createObjectURL(this.selectedFile)
      this.$refs.dialogImgBlock.style.backgroundImage = 'url(' + src + ')'
    },
    fileSelectHandler (e) {
      if (!e.target && !e.dataTransfer) return
      this.fileDragHover(e)
      const file = e.target.files || e.dataTransfer.files[0]
      this.showImg(file)
    },
    fileDragHover (e) {
      e.stopPropagation()
      e.preventDefault()
    },
    uploadImg () {
      this.$refs.uploader.click()
    },
    checkFileSize (file) {
      const fileSize = file.size / 1024
      switch (file.type) {
        case 'image/jpeg':
          if (fileSize > 3184.64) {
            return false
          }
          break
        case 'image/png':
          if (fileSize > 1239.04) {
            return false
          }
          break
        case 'image/gif':
          if (fileSize > 635) {
            return false
          }
          break
        case 'image/bmp':
          if (fileSize > 6072.32) {
            return false
          }
          break
        default:
          return false
      }
      return true
    },
    onFileChanged (e) {
      if (e.target.files.length < 1) return
      const file = e.target.files[0]
      this.showImg(file)
    },
    createImage (moving) {
      let img = null
      const image = new Image()
      image.src = moving.image
      image.setAttribute('crossOrigin', 'Anonymous')
      image.addEventListener('load', e => {
        if (moving.type === 'background') {
          img = this.transformBackground({
            event: e,
            x: 0,
            y: 0,
            width: 192,
            height: 108,
            size: moving.size,
            url: moving.image
          })
          const ImageCanvas = new fabric.Canvas('ImageCanvas', {
            width: 192,
            height: 108
          })
          ImageCanvas.setBackgroundImage(
            img,
            ImageCanvas.renderAll.bind(ImageCanvas)
          )
          const imageBase64 = ImageCanvas.toDataURL({ multiplier: 10 })
          const nowTimestamp = Date.now()
          const imageFile = base64ToFile(imageBase64, nowTimestamp)
          this.$emit('save', { file: imageFile, type: 'background' })
        } else {
          // img = new fabric.Image(e.target, {
          //   width: e.target.naturalWidth,
          //   height: e.target.naturalHeight
          // })
          // const ImageCanvas = new fabric.Canvas('ImageCanvas', {
          //   width: e.target.naturalWidth,
          //   height: e.target.naturalHeight
          // })
          // ImageCanvas.setBackgroundImage(
          //   img,
          //   ImageCanvas.renderAll.bind(ImageCanvas)
          // )
          // const imageBase64 = ImageCanvas.toDataURL(moving.fileType)
          // const nowTimestamp = Date.now()
          // const imageFile = base64ToFile(imageBase64, nowTimestamp)

          // originalFile format
          // 透過fabric canvas.toDataURL指定檔案類型不知為何都會變成png
          const newFile = new File([moving.file], Date.now(), {
            type: moving.file.type,
            lastModified: moving.file.lastModified
          })
          this.$emit('save', { file: newFile, type: 'image' })
        }
      })
    },
    transformBackground ({ event, x, y, width, height, size}) {
      if (size === 0) {
        if (event.target.naturalWidth / event.target.naturalHeight > 16 / 9) {
          const scale = height / event.target.naturalHeight
          return new fabric.Image(event.target, {
            cropX: (event.target.naturalWidth - width / scale) * 0.5,
            cropY: 0,
            width: width / scale,
            height: event.target.naturalHeight,
            scaleX: scale,
            scaleY: scale,
            left: x,
            top: y
          })
        } else {
          const scale = width / event.target.naturalWidth
          return new fabric.Image(event.target, {
            cropX: 0,
            cropY: (event.target.naturalHeight - height / scale) * 0.5,
            width: event.target.naturalWidth,
            height: height / scale,
            scaleX: scale,
            scaleY: scale,
            left: x,
            top: y
          })
        }
      } else {
        const scale =
          event.target.naturalWidth / event.target.naturalHeight < 16 / 9
            ? height / event.target.naturalHeight
            : width / event.target.naturalWidth
        return new fabric.Image(event.target, {
          scaleX: scale,
          scaleY: scale,
          width: event.target.naturalWidth,
          height: event.target.naturalHeight,
          left: x + (width - event.target.naturalWidth * scale) * 0.5,
          top: y + (height - event.target.naturalHeight * scale) * 0.5
        })
      }
    }
  }
}
</script>
<style lang="sass">
.dialog-img-block
  height: 270px
  border: solid 1px #e6ecef
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  background-position: center
  background-repeat: no-repeat
  position: relative
  &.bg-fill
    background-size: cover
  &.bg-contain
    background-size: contain
  font
    font-size: 12px
  .remove-icon
    right: 4px
    top: 4px
    position: absolute
#canvas-wrapper
  width: 192px
  height: 108px
  position: absolute
  top: 0
  display: none
</style>
