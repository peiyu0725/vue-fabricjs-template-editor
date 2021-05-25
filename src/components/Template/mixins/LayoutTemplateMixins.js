import { fabric } from 'fabric'
import CropZone from '../fabric/CropZone'

export default {
  methods: {
    addImageProcess (img, src) {
      return new Promise((resolve) => {
        img.onload = (e) => resolve(e)
        img.onerror = (e) => resolve(e)
        img.src = src
      })
    },
    async addLayout ({ num, data = null }) {
      if (this.fixedCanvas) return
      try {
        this.resetLayoutTemplate()
        var layout = data || this.getLayoutTemplate()[num - 1].source
        layout.sort((a, b) => {
          return a.layer > b.layer ? 1 : -1
        })
        for (var n in layout) {
          const item = layout[n]
          const src = '/img/source/source' + item.source + '.jpg'
          var img = new Image()
          await this.addImageProcess(img, src).then(e => {
            this.createSourceImage(e, item)
          }).catch(() => {
            this.$toast.error(this.$t('toast.fetchFail'))
            return false
          })
        }
      } catch (e) {
        this.$toast.error(this.$t('toast.fetchFail'))
      }
      this.updateScreenImage()
    },
    createSourceImage (e, item) {
      const scale = {
        x: this.canvasWidth / 1920,
        y: this.canvasHeight / 1080
      }
      const img = new fabric.Image(e.target, {
        scaleX: item.geometry[2] / 1920 * scale.x,
        scaleY: item.geometry[3] / 1080 * scale.y,
        left: item.geometry[0] * scale.x + this.originX,
        top: item.geometry[1] * scale.y + this.originY,
        width: 1920,
        height: 1080,
        originWidth: e.target.naturalWidth,
        originHeight: e.target.naturalHeight,
        name: 'source',
        sourceNum: item.source,
        sourceInput: item.input
      })

      if (item.isCrop) {
        const crop = {
          x: item.crop[0],
          y: item.crop[1],
          width: item.crop[2],
          height: item.crop[3],
          scaleX: item.geometry[2] / item.crop[2] * scale.x,
          scaleY: item.geometry[3] / item.crop[3] * scale.y,
          originWidth: e.target.naturalWidth,
          originHeight: e.target.naturalHeight
        }
        img.set({
          cropX: crop.x * (e.target.naturalWidth / 1920),
          cropY: crop.y * (e.target.naturalHeight / 1080),
          width: crop.width * (e.target.naturalWidth / 1920),
          height: crop.height * (e.target.naturalHeight / 1080),
          scaleX: crop.scaleX / (e.target.naturalWidth / 1920),
          scaleY: crop.scaleY / (e.target.naturalHeight / 1080),
          lastScreenLeft: crop.x - crop.x * crop.scaleX,
          lastScreenTop: crop.y - crop.y * crop.scaleY,
          lastScreenScaleX: crop.scaleX,
          lastScreenScaleY: crop.scaleY
        })
        img.cropObj = this.setCropZone(crop)
      }
      this.addFixedObj(img, 'source')
      this.canvas.add(img)
      this.canvas.moveTo(img, this.canvas.getItemsByName('source').length - 1)
    },
    // 重設layout template
    resetLayoutTemplate () {
      if (this.canvas.getItemsByName('source').length > 0) {
        this.canvas.getItemsByName('source').forEach(item => {
          this.canvas.remove(item)
        })
        this.canvas.discardActiveObject().renderAll()
        this.fixedObj.shift()
      }
    },
    // 設定剪裁框
    setCropZone (crop) {
      const cropZone = new CropZone({
        left: crop.x,
        top: crop.y,
        width: crop.width,
        height: crop.height,
        scaleX: crop.scaleX,
        scaleY: crop.scaleY,
        fill: 'transparent',
        hasBorders: false,
        cornerSize: 6,
        transparentCorners: false,
        lockRotation: true,
        hasRotatingPoint: false,
        name: 'crop',
        ratio: 0,
        ratioMode: 'horizontal',
        targetOriginWidth: crop.originWidth,
        targetOriginHeight: crop.originHeight
      })

      cropZone.setControlVisible('mtr', false)
      return cropZone
    },
    getLayoutTemplate () {
      return [
        {
          index: 1,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [0, 0, 1920, 1080]
            }
          ]
        },
        {
          index: 2,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: true,
              geometry: [0, 0, 960, 1080],
              crop: [1920 * 0.25, 0, 1920 * 0.5, 1080]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: true,
              geometry: [960, 0, 960, 1080],
              crop: [1920 * 0.25, 0, 1920 * 0.5, 1080]
            }
          ]
        },
        {
          index: 3,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [0, 1080 * 0.2, 1920 * 0.6, 1080 * 0.6]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.65, 1080 * 0.45, 1920 * 0.35, 1080 * 0.35]
            }
          ]
        },
        {
          index: 4,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [0, 0, 1920, 1080]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1080 * 0.1, 1080 * 0.1, 1920 * 0.4, 1080 * 0.4]
            }
          ]
        },
        {
          index: 5,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.05, 1080 * 0.3, 1920 * 0.5, 1080 * 0.5]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.45, 1080 * 0.2, 1920 * 0.5, 1080 * 0.5]
            }
          ]
        },
        {
          index: 6,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [0, 0, 1920, 1080]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.55, 1080 * 0.08, 1920 * 0.4, 1080 * 0.4]
            },
            {
              source: 3,
              layer: 3,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.55, 1080 * 0.52, 1920 * 0.4, 1080 * 0.4]
            }
          ]
        },
        {
          index: 7,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: true,
              geometry: [0, 0, 1920 * 0.5, 1080],
              crop: [1920 * 0.25, 0, 1920 * 0.5, 1080]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.5, 0, 1920 * 0.5, 1080 * 0.5]
            },
            {
              source: 3,
              layer: 3,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.5, 1080 * 0.5, 1920 * 0.5, 1080 * 0.5]
            }
          ]
        },
        {
          index: 8,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: true,
              geometry: [0, 0, 1920 * 2 / 3, 1080],
              crop: [1920 * 1 / 6, 0, 1920 * 2 / 3, 1080]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 2 / 3, 0, 1920 * 1 / 3, 1080 * 1 / 3]
            },
            {
              source: 3,
              layer: 3,
              input: 0,
              isCrop: false,
              geometry: [1920 * 2 / 3, 1080 * 1 / 3, 1920 * 1 / 3, 1080 * 1 / 3]
            },
            {
              source: 4,
              layer: 4,
              input: 0,
              isCrop: false,
              geometry: [1920 * 2 / 3, 1080 * 2 / 3, 1920 * 1 / 3, 1080 * 1 / 3]
            }
          ]
        },
        {
          index: 9,
          source: [
            {
              source: 1,
              layer: 1,
              input: 0,
              isCrop: false,
              geometry: [0, 0, 1920 * 0.5, 1080 * 0.5]
            },
            {
              source: 2,
              layer: 2,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.5, 0, 1920 * 0.5, 1080 * 0.5]
            },
            {
              source: 3,
              layer: 3,
              input: 0,
              isCrop: false,
              geometry: [0, 1080 * 0.5, 1920 * 0.5, 1080 * 0.5]
            },
            {
              source: 4,
              layer: 4,
              input: 0,
              isCrop: false,
              geometry: [1920 * 0.5, 1080 * 0.5, 1920 * 0.5, 1080 * 0.5]
            }
          ]
        }
      ]
    }
  }
}
