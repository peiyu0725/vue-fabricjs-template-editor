import { fabric } from 'fabric'
import dayjs from 'dayjs'
import { TIME_FORMAT } from '../FabricVariable'
import CropZone from '../fabric/CropZone'

const DEFAULT_FULL_WIDTH = 1920
const DEFAULT_FULL_HEIGHT = 1080
export default {
  data () {
    return {
      objects: [],
      activeObject: null,
      fixedObj: [
        {
          items: [],
          selectable: false,
          name: 'background'
        }
      ],
      canvas: null,
      fixedCanvas: false,
      setting: {
        text: {
          show: false
        },
        fontSize: {
          show: false
        },
        color: {
          show: false
        },
        format: {
          show: false,
          value: 0
        },
        border: {
          show: false
        },
        source: {
          show: false
        }
      },
      moving: {
        image: null,
        type: '',
        sourceNum: null
      },
      croppedObj: null,
      bgColor: '#ffffff',
      distance: 2
    }
  },
  methods: {
    // 初始化畫布
    initCanvas () {
      this.canvas = new fabric.Canvas('Canvas', {
        backgroundColor: '#eaeaea',
        width: this.workSpaceWidth,
        height: this.workSpaceHeight,
        preserveObjectStacking: true
      })

      this.canvas.onBeforeScaleRotate = function (obj) {
        // 這些是給 scaling 時限制範圍用的！！
        obj.fixedLeft = obj.left
        obj.fixedTop = obj.top
        obj.fixedRight = obj.left + obj.getRealWidth()
        obj.fixedBottom = obj.top + obj.getRealHeight()
      }

      fabric.Object.prototype.transparentCorners = false // 讓選擇時清楚一點！
      fabric.Object.prototype.setControlsVisibility({ mtr: false })
      fabric.Object.prototype.cornerColor = '#ffffff'
      fabric.Object.prototype.borderDashArray = [5, 5]
      fabric.Object.prototype.borderColor = '#000000'
      fabric.Object.prototype.cornerSize = 8
      fabric.Object.prototype.cornerStrokeColor = '#000000'
      fabric.Object.prototype.borderWidth = 5
      // canvas序列化精準度，四捨五入到小數點第5位
      fabric.Object.NUM_FRACTION_DIGITS = 5

      // 取得對應name的物件
      fabric.Canvas.prototype.getItemsByName = function (name) {
        var objectList = []
        var objects = this.getObjects()

        for (var i = 0, len = this.size(); i < len; i++) {
          if (objects[i].name && objects[i].name === name) {
            objectList.push(objects[i])
          }
        }

        return objectList
      }

      // 取得對應物件寬
      fabric.Object.prototype.getRealWidth = function () {
        return this.width * this.scaleX
      }
      // 取得對應物件高
      fabric.Object.prototype.getRealHeight = function () {
        return this.height * this.scaleY
      }

      this.canvas.on({
        drop: e => {
          const event = e.e
          event.preventDefault()
          this.addImage(event)
        },
        'selection:updated': (e) => {
          if (this.fixedCanvas) {
            this.canvas.setActiveObject(this.canvas.getItemsByName('crop')[0])
          }

          this.displayAll()
          this.updateActiveObject()
          this.$nextTick(() => {
            this.checkShow(e.selected)
          })
          this.onLockObjScale(true)
        },
        'selection:created': (e) => {
          if (this.fixedCanvas) {
            this.canvas.setActiveObject(this.canvas.getItemsByName('crop')[0])
            this.setting.source.show = true
          }
          this.updateActiveObject()
          this.checkShow(e.selected)
          this.onLockObjScale(true)
        },
        'selection:cleared': () => {
          this.activeObject = null
          this.getObjects()
          this.displayAll()
          this.setting.source.show = false
          this.onLockObjScale(true)
        },
        'object:added': () => {
          this.updateActiveObject()
          this.$nextTick(() => {
            this.getObjects()
          })
        },
        'object:modified': () => {
        },
        'object:scaled': (e) => {
          if (e.target.name !== 'crop') {
            this.setScaled(e)
          }
        },
        'object:scaling': (e) => {
          if (e.target.name === 'crop') {
            this.setCropScale(e)
          } else if (e.target.name === 'source') {
            this.setSourceScaling(e)
          }
        },
        'object:moving': (e) => {
          if (e.target.name === 'crop') {
            this.cropMoving(e)
          } else {
            this.objMoving(e)
          }
        },
        'mouse:wheel': ({ e }) => {
          const deltaY = e.deltaY
          const newZoom = deltaY / 1000
          this.setZoom(newZoom)
        },
        'mouse:dblclick': (e) => {
          if (e.target) {
            this.onDblclick(e.target)
          }
        }
      })

      this.setColorBg()
    },
    setColorBg (color = '#ffffff') {
      var background = null
      this.bgColor = color
      // 產生預設畫布
      var bg = new fabric.Rect({
        strokeWidth: 0,
        fill: color,
        width: DEFAULT_FULL_WIDTH,
        height: DEFAULT_FULL_HEIGHT,
        scaleX: this.canvasWidth / DEFAULT_FULL_WIDTH,
        scaleY: this.canvasHeight / DEFAULT_FULL_HEIGHT,
        left: this.originX,
        top: this.originY,
        name: 'backgroundColor',
        selectable: false
      })

      if (this.canvas.backgroundImage && this.canvas.backgroundImage._objects) {
        bg = this.canvas.backgroundImage
        bg._objects[0].set({ fill: color })
        background = [this.canvas.backgroundImage._objects[1], this.canvas.backgroundImage._objects[0]]
      } else {
        background = [bg]
      }
      this.canvas.setBackgroundImage(bg, this.canvas.renderAll.bind(this.canvas))
      this.addFixedObj(background, 'background')
    },
    getObjects () {
      this.objects = this.canvas.toObject(['selectable', 'name', 'sourceNum']).objects.sort(this.objectSortZIndex)
    },
    updateActiveObject () {
      this.activeObject = this.canvas.getActiveObject()
    },
    setZoom (value, point) {
      const {
        left: x,
        top: y
      } = this.canvas.getCenter()
      const byPoint = point || { x, y }
      let newZoom = this.canvas.getZoom() + value
      if (newZoom > 1.5) newZoom = 1.5
      if (newZoom < 0.5) newZoom = 0.5
      this.canvas.zoomToPoint(byPoint, newZoom)
    },
    // 設定物件active
    setToActive (idx) {
      if (this.fixedCanvas) return
      this.canvas.setActiveObject(this.canvas.getObjects()[idx])
      this.canvas.renderAll()
    },
    addTimeSet (itemObj) {
      return {
        timeFormat: itemObj.timeFormat,
        timeFormatVal: itemObj.timeFormatVal,
        ampm: itemObj.ampm
      }
    },
    // 複製物件
    copy (item = null) {
      const activeObject = item || this.canvas.getActiveObject()
      if (!activeObject || this.fixedCanvas) return
      if (activeObject.name === 'source' || activeObject.name === 'time') {
        this.$toast.warning(this.$t('template.notCopy'))
        return
      }
      if (activeObject.type === 'activeSelection') {
        activeObject.getObjects().forEach(obj => {
          if (obj.name === 'source') return
          obj.clone(cloned => {
            var setting = Object.assign({
              top: activeObject.top + cloned.top + activeObject.height / 2 + 30,
              left: activeObject.left + cloned.left + activeObject.width / 2 + 30,
              name: obj.name
            }, obj.name === 'time' ? this.addTimeSet(obj) : {})

            cloned.set(setting)
            this.canvas.add(cloned)
          })
        })
      } else {
        activeObject.clone(cloned => {
          var setting = Object.assign({
            top: activeObject.top + 30,
            left: activeObject.left + 30,
            name: activeObject.name
          }, activeObject.name === 'time' ? this.addTimeSet(activeObject) : {})

          cloned.set(setting)
          this.canvas.add(cloned)
        })
      }
    },
    objectSortZIndex (a, b) {
      return this.canvas.getObjects().indexOf(a) - this.canvas.getObjects().indexOf(b)
    },
    // 設定物件鎖定
    setLockState ({ item, idx = null }) {
      if (this.fixedCanvas) return
      const index = (idx !== null) ? idx : this.canvas.getObjects().indexOf(item)
      this.canvas.item(index).selectable = !this.canvas.item(index).selectable
      // 要加上evented才可以真正鎖定不然下一層的物件會被影響
      this.canvas.item(index).evented = !this.canvas.item(index).evented
      this.getObjects()
      this.canvas.discardActiveObject()
      this.canvas.requestRenderAll()
    },
    // 調整物件階層
    changeZIndex (moved) {
      if (this.fixedCanvas) return
      if (!moved.element.name === 'source') {
        this.canvas.moveTo(this.canvas.item(moved.oldIndex), moved.newIndex)
      } else {
        this.canvas.moveTo(this.canvas.item(moved.oldIndex), moved.newIndex)
      }
      this.getObjects()
      this.canvas.renderAll()
    },
    setScaling (event, obj, ratio) {
      const target = event.target
      const targetLeft = Math.round(target.left)
      const targetTop = Math.round(target.top)
      // fix top, left, right, bottom from @initCanvas: onBeforeScaleRotate
      const fixed = {
        left: target.fixedLeft,
        top: target.fixedTop,
        right: target.fixedRight,
        bottom: target.fixedBottom
      }

      if (Math.round(target.left) < obj.left) {
        const limitWidth = Math.abs(fixed.right - obj.left)
        const limitHeight = limitWidth * ratio.height / ratio.width
        const topDiff = event.transform.corner === 'tl'
          ? Math.abs(limitHeight - event.transform.original.scaleY * target.height)
          : 0

        target.set({
          scaleX: limitWidth / target.width,
          scaleY: ratio.fixed ? limitHeight / target.height : target.scaleY,
          left: obj.left,
          top: ratio.fixed ? fixed.top - topDiff : target.top
        })
      }
      if (Math.round(target.getRealWidth() + target.left) > obj.right) {
        const limitWidth = Math.abs(obj.right - targetLeft)
        const limitHeight = limitWidth * ratio.height / ratio.width
        const topDiff = event.transform.corner === 'tr'
          ? Math.abs(limitHeight - event.transform.original.scaleY * target.height)
          : 0
        target.set({
          scaleX: limitWidth / target.width,
          scaleY: ratio.fixed ? limitHeight / target.height : target.scaleY,
          top: ratio.fixed ? fixed.top - topDiff : target.top
        })
      }
      if (Math.round(target.top) < obj.top) {
        const limitHeight = Math.abs(obj.top - fixed.bottom)
        const limitWidth = limitHeight * ratio.width / ratio.height
        const leftDiff = event.transform.corner === 'tl'
          ? Math.abs(limitWidth - event.transform.original.scaleX * target.width)
          : 0
        target.set({
          scaleX: ratio.fixed ? limitWidth / target.width : target.scaleX,
          scaleY: limitHeight / target.height,
          left: ratio.fixed ? fixed.left - leftDiff : target.left,
          top: obj.top
        })
      }

      if (Math.round(target.getRealHeight() + target.top) > obj.bottom) {
        const limitHeight = Math.abs(obj.bottom - targetTop)
        const limitWidth = limitHeight * ratio.width / ratio.height
        const leftDiff = event.transform.corner === 'bl'
          ? Math.abs(limitWidth - event.transform.original.scaleX * target.width)
          : 0
        target.set({
          scaleX: ratio.fixed ? limitWidth / target.width : target.scaleX,
          scaleY: limitHeight / target.height,
          left: ratio.fixed ? fixed.left - leftDiff : target.left
        })
      }
    },
    // 縮放剪裁框
    setCropScale (event) {
      const currentObject = event.target
      const imgLeft = Math.round(this.croppedObj.left)
      const imgTop = Math.round(this.croppedObj.top)
      const isFixedRatio = currentObject.ratio !== 0 // 0 for freeform
      let [ratioWidth, ratioHeight] = isFixedRatio
        ? currentObject.ratio.split(':')
        : []
      if (currentObject.ratioMode === 'vertical') {
        [ratioHeight, ratioWidth] = [ratioWidth, ratioHeight]
      }
      const obj = {
        left: Math.round(this.croppedObj.left),
        top: Math.round(this.croppedObj.top),
        right: Math.round(this.croppedObj.getRealWidth() + imgLeft),
        bottom: Math.round(this.croppedObj.getRealHeight() + imgTop)
      }
      const ratio = {
        fixed: isFixedRatio,
        width: ratioWidth,
        height: ratioHeight
      }
      this.setScaling(event, obj, ratio)
    },
    // 移動剪裁框
    cropMoving (event) {
      var currentObject = event.target
      var cropX1 = currentObject.left
      var cropY1 = currentObject.top
      var cropX2 = currentObject.getRealWidth() + cropX1
      var cropY2 = currentObject.getRealHeight() + cropY1

      var imgX1 = this.croppedObj.left
      var imgY1 = this.croppedObj.top
      var imgX2 = this.croppedObj.getRealWidth() + imgX1
      var imgY2 = this.croppedObj.getRealHeight() + imgY1

      if (cropX1 < imgX1) {
        currentObject.set('left', imgX1)
      }
      if (cropY1 < imgY1) {
        currentObject.set('top', imgY1)
      }
      if (cropX2 > imgX2) {
        currentObject.set('left', imgX2 - currentObject.getRealWidth())
      }
      if (cropY2 > imgY2) {
        currentObject.set('top', imgY2 - currentObject.getRealHeight())
      }

      currentObject.setCoords()
    },
    // 雙撃物件
    onDblclick (target) {
      if (!target) return

      if (target.name === 'source') {
        this.createCrop(target)
      } else if (target.name === 'crop') {
        this.cropImg(target)
      }
    },
    // 建立剪裁框
    createCrop (target) {
      // 正在裁切其他 Screen 就先不要有新的裁切
      const hasCrop = this.canvas.getItemsByName('crop').length > 0
      if (hasCrop) return false
      this.croppedObj = target
      let cropZone
      if (target.cropObj) {
        // 若 cropObj 存在，表示之前有用途裁切，將裁切 Obj 取出
        // 將 Screen 變回完原來的尺寸
        // * 號圍起來的區域長為 translateX
        // * 號圍起來的區域寬為 translateY
        // **********----------
        // *original| cropped |
        // *        |         |
        // **********----------
        const lastCropX = target.cropX
        const lastCropY = target.cropY
        const translateX = (lastCropX / target.width) * (target.scaleX * target.width)
        const translateY = (lastCropY / target.height) * (target.scaleY * target.height)
        // 這裡強制設定將 Screen width & height 設定回 1920 * 1080
        // 因為 screen 來源圖片不一定都是 16:9 解析度
        target.set({
          cropX: 0,
          cropY: 0,
          width: DEFAULT_FULL_WIDTH,
          height: DEFAULT_FULL_HEIGHT,
          left: target.left - translateX,
          top: target.top - translateY,
          scaleX: target.scaleX * (target.originWidth / DEFAULT_FULL_WIDTH), // target.scaleX 此時 target.scaleX 已經被修正過 (cropImg 時)，
          scaleY: target.scaleY * (target.originHeight / DEFAULT_FULL_HEIGHT)
        })
        cropZone = target.cropObj
        // 此時 target.left 已經是調整過後的正確位置
        // 所以 cropZone 只要加上 translateX & translateY 就可以了
        cropZone.set({
          left: target.left + translateX,
          top: target.top + translateY,
          scaleX: cropZone.scaleX * (target.scaleX / target.lastScreenScaleX), // 算出使用者有沒有縮放 screen，並修正
          scaleY: cropZone.scaleY * (target.scaleY / target.lastScreenScaleY)
        })
        if (target.cropObj.ratio === 0) {
          cropZone.setControlsVisibility({
            mb: true,
            ml: true,
            mr: true,
            mt: true
          })
        }
      } else {
        // 這邊沒什麼特別的就是建立新的 cropZone
        cropZone = new CropZone({
          left: target.left,
          top: target.top,
          width: target.width,
          height: target.height,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          fill: 'transparent',
          hasBorders: false,
          cornerSize: 6,
          transparentCorners: false,
          lockRotation: true,
          hasRotatingPoint: false,
          name: 'crop',
          ratio: 0,
          ratioMode: 'horizontal',
          targetOriginWidth: target.originWidth,
          targetOriginHeight: target.originHeight
        })
        cropZone.setControlsVisibility({
          mb: true,
          ml: true,
          mr: true,
          mt: true,
          mtr: false
        })
      }
      this.canvas.add(cropZone)
      target.selectable = false
      this.fixedCanvas = true
      this.canvas.setActiveObject(this.canvas.getItemsByName('crop')[0])
      this.setting.source.show = true
    },
    // 剪裁圖片
    cropImg () {
      const [activeCropObject] = this.canvas.getItemsByName('crop')
      this.croppedObj.cropObj = activeCropObject
      const cropWidth = activeCropObject.width * activeCropObject.scaleX
      const cropHeight = activeCropObject.height * activeCropObject.scaleY
      // 這邊將 screen (croppedObj) 透過使用者設定的 crop 來裁切
      // 因為 cropX, cropY (fabricjs 的裁切屬性) 使用的是原始的大小，所以要算出原始大小是多少才不會出錯
      const scaledCropX = activeCropObject.left - this.croppedObj.left
      const scaledCropY = activeCropObject.top - this.croppedObj.top
      // 原始大小係數 (相較 full hd)
      const originWidthCoefficient = this.croppedObj.originWidth / DEFAULT_FULL_WIDTH
      const originHeightCoefficient = this.croppedObj.originHeight / DEFAULT_FULL_HEIGHT
      this.croppedObj.set({
        left: activeCropObject.left, // 位置跟著移動
        top: activeCropObject.top,
        cropX: scaledCropX / this.croppedObj.scaleX * originWidthCoefficient, // 校正到原始圖片數值
        cropY: scaledCropY / this.croppedObj.scaleY * originHeightCoefficient,
        width: cropWidth / this.croppedObj.scaleX * originWidthCoefficient,
        height: cropHeight / this.croppedObj.scaleY * originHeightCoefficient,
        scaleX: this.croppedObj.scaleX / originWidthCoefficient, // 這邊因為長寬做了修正 所以透過 scaleX scaleY 修正回來，不然比例會跑掉
        scaleY: this.croppedObj.scaleY / originHeightCoefficient,
        lastScreenLeft: this.croppedObj.left, // 紀錄最後一次做裁切時的位置，給之後再次開啟時使用
        lastScreenTop: this.croppedObj.top,
        lastScreenScaleX: this.croppedObj.scaleX, // 紀錄最後一次做裁切時的縮放，給之後再次開啟時使用
        lastScreenScaleY: this.croppedObj.scaleY
      })
      this.canvas.remove(activeCropObject)
      this.fixedCanvas = false
      this.croppedObj.selectable = true
      this.setting.source.show = false
      this.croppedObj.setCoords()
      this.canvas.renderAll()
    },
    setSourceScaling (event) {
      const obj = {
        left: Math.round(this.originX),
        top: Math.round(this.originY),
        right: Math.round(this.canvasWidth + this.originX),
        bottom: Math.round(this.canvasHeight + this.originY)
      }
      const ratio = {
        fixed: true,
        width: event.target.width,
        height: event.target.height
      }
      this.setScaling(event, obj, ratio)
    },
    // 縮放物件時設定寬高
    setScaled (e) {
      const target = e.target
      switch (target.name) {
        case 'image':
          target.set({
            scaleX: target.getRealWidth() / target.width,
            scaleY: target.getRealHeight() / target.height,
            width: target.width,
            height: target.height
          })
          target.setCoords()
          break
        case 'rect':
          target.set({
            scaleX: 1,
            scaleY: 1,
            width: target.getRealWidth() - target.strokeWidth,
            height: target.getRealHeight() - target.strokeWidth
          })
          target.setCoords()
          break
      }
    },
    objMoving (e) {
      const target = e.target
      const obj = {
        top: target.top - this.originY,
        bottom: target.top - this.originY + target.getRealHeight(),
        left: target.left - this.originX,
        right: target.left - this.originX + target.getRealWidth()
      }

      if (target.name === 'source' || target.name === 'time') {
        // 設定移動間隔
        const distance = this.distance * this.canvasWidth / 1920
        target.set({
          left: Math.round(target.left / distance) * distance,
          top: Math.round(target.top / distance) * distance
        })
      }

      if (target.name === 'source' || target.name === 'image' || target.name === 'time') {
        if (obj.top < 0) {
          target.set({
            top: this.originY
          })
        }
        if (obj.left < 0) {
          target.set({
            left: this.originX
          })
        }
        if (obj.bottom > this.canvasHeight) {
          target.set({
            top: this.canvasHeight - target.getRealHeight() + this.originY
          })
        }
        if (obj.right > this.canvasWidth) {
          target.set({
            left: this.canvasWidth - target.getRealWidth() + this.originX
          })
        }
      }
    },
    // 隱藏所有設定
    displayAll () {
      this.setting.color.show = false
      this.setting.text.show = false
      this.setting.fontSize.show = false
      this.setting.format.show = false
      this.setting.border.show = false
    },
    // 選取不同物件時顯示不同設定
    checkShow (selected) {
      if (this.fixedCanvas) return
      if (selected.length === 1) {
        switch (selected[0].name) {
          case 'rect':
            this.setting.color.show = true
            this.setting.border.show = true
            break
          case 'text':
            this.setting.color.show = true
            this.setting.text.show = true
            break
          case 'time':
            this.setting.color.show = true
            this.setting.fontSize.show = true
            this.setting.format.show = true
            break
        }
      } else {
        this.displayAll()
      }
    },
    clearMoving () {
      this.moving = {
        image: null,
        type: '',
        sourceNum: null
      }
    },
    onLockObjScale (isReset = false) {
      if (this.fixedCanvas || !this.activeObject || this.activeObject.name === 'time' || this.activeObject.name === 'text') return
      if (this.activeObject.name === 'source') {
        this.activeObject.setControlsVisibility({
          mb: false,
          ml: false,
          mr: false,
          mt: false
        })
      } else {
        if (!isReset) {
          this.activeObject.locked = !this.activeObject.locked
        }
        this.activeObject.setControlsVisibility({
          mb: !this.activeObject.locked,
          ml: !this.activeObject.locked,
          mr: !this.activeObject.locked,
          mt: !this.activeObject.locked
        })
      }
      this.canvas.renderAll()
    },
    addFixedObj (item, type) {
      const hasSource = this.canvas.getItemsByName('source').length > 0
      switch (type) {
        case 'background':
          if (!hasSource) {
            this.fixedObj[0].items = item
          } else {
            this.fixedObj[1].items = item
          }
          break
        case 'source':
          if (!hasSource) {
            this.fixedObj.unshift({
              name: 'sourceGroup',
              selectable: false,
              items: []
            })
          }
          this.fixedObj[0].items.unshift(item)
          break
      }
    },
    transformBackground ({ event, x, y, width, height, size, url = '' }) {
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
            top: y,
            name: 'backgroundImage',
            selectable: false,
            src: url
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
            top: y,
            name: 'backgroundImage',
            selectable: false,
            src: url
          })
        }
      } else {
        const scale =
            (event.target.naturalWidth / event.target.naturalHeight < 16 / 9)
              ? height / event.target.naturalHeight
              : width / event.target.naturalWidth
        return new fabric.Image(event.target, {
          scaleX: scale,
          scaleY: scale,
          width: event.target.naturalWidth,
          height: event.target.naturalHeight,
          left: x + (width - event.target.naturalWidth * scale) * 0.5,
          top: y + (height - event.target.naturalHeight * scale) * 0.5,
          name: 'backgroundImage',
          selectable: false,
          src: url
        })
      }
    },
    saveImage ({ image, type, sourceNum = null, sourceSetting = null, size = 1, input = 0 }) {
      if (this.fixedCanvas) return
      this.moving.image = image
      this.moving.type = type
      this.moving.size = size
      this.moving.sourceNum = sourceNum
      this.moving.sourceSetting = sourceSetting
      this.moving.sourceInput = input
    },
    // 圖片
    addImage (event = null) {
      if (this.fixedCanvas) return
      let left = 0
      let top = 0
      let img = null
      const image = new Image()
      image.src = this.moving.image
      image.setAttribute('crossOrigin', 'Anonymous')
      image.addEventListener('error', () => {
        return false
      })
      image.addEventListener('load', e => {
        left = event ? event.offsetX : this.originX
        top = event ? event.offsetY : this.originY
        switch (this.moving.type) {
          case 'background':
            img = this.transformBackground({
              event: e,
              x: this.originX,
              y: this.originY,
              width: this.canvasWidth,
              height: this.canvasHeight,
              size: this.moving.size,
              url: this.moving.image,
              name: 'backgroundImage',
              selectable: false
            })
            var rect = new fabric.Rect({
              strokeWidth: 0,
              fill: this.bgColor,
              width: this.canvasWidth,
              height: this.canvasHeight,
              left: this.originX,
              top: this.originY,
              name: 'backgroundColor',
              selectable: false
            })
            var mix = new fabric.Group([rect, img])
            mix.name = 'background'
            this.canvas.setBackgroundImage(mix, this.canvas.renderAll.bind(this.canvas))
            this.addFixedObj([img, rect], 'background')
            break
          case 'source':
            var hasSource = this.canvas.getItemsByName('source').filter(item => item.sourceNum === this.moving.sourceNum).length
            if (hasSource || !e.target.naturalWidth) return
            img = new fabric.Image(e.target, {
              scaleX: this.canvasWidth / DEFAULT_FULL_WIDTH * 0.8,
              scaleY: this.canvasHeight / DEFAULT_FULL_HEIGHT * 0.8,
              width: DEFAULT_FULL_WIDTH,
              height: DEFAULT_FULL_HEIGHT,
              originWidth: e.target.naturalWidth,
              originHeight: e.target.naturalHeight,
              left: left,
              top: top,
              name: this.moving.type,
              sourceNum: this.moving.sourceNum,
              sourceInput: this.moving.sourceInput,
              locked: true
            })
            this.addFixedObj(img, 'source')
            this.canvas.add(img)
            this.canvas.moveTo(img, this.canvas.getItemsByName('source').length - 1)
            break
          case 'image':
            if (e.target.naturalHeight >= this.canvasHeight) {
              img = new fabric.Image(e.target, {
                scaleX: this.canvasHeight / e.target.naturalHeight,
                scaleY: this.canvasHeight / e.target.naturalHeight,
                left: left,
                top: top,
                name: this.moving.type,
                locked: true
              })
            } else if (e.target.naturalWidth >= this.canvasWidth) {
              img = new fabric.Image(e.target, {
                scaleX: this.canvasWidth / e.target.naturalWidth,
                scaleY: this.canvasWidth / e.target.naturalWidth,
                left: left,
                top: top,
                name: this.moving.type,
                locked: true
              })
            } else {
              img = new fabric.Image(e.target, {
                left: left,
                top: top,
                name: this.moving.type,
                locked: true
              })
            }
            img.setControlsVisibility({
              mb: false,
              ml: false,
              mr: false,
              mt: false
            })
            this.canvas.add(img)
            break
        }
        this.clearMoving()
      })
    },
    // 文字方塊
    addTextBox () {
      if (this.fixedCanvas) return
      var text = new fabric.IText('Text', {
        top: this.workSpaceHeight / 2,
        left: this.canvasWidth / 2,
        fontSize: 18,
        fill: '#000000',
        name: 'text'
      })
      text.setControlsVisibility({
        mb: false,
        ml: false,
        mr: false,
        mt: false
      })
      text.set('fontFamily', 'Noto Sans CJK TC Regular')
      this.canvas.add(text)
    },
    // 矩形
    addRect () {
      if (this.fixedCanvas) return
      const rect = new fabric.Rect({
        top: this.workSpaceHeight / 2 - 150 / 2,
        left: (this.canvasWidth - 100) / 2,
        fill: '#000000',
        width: 200,
        height: 150,
        stroke: '#000000',
        strokeWidth: 0,
        name: 'rect'
      })
      this.canvas.add(rect)
    },
    // 時間
    addTimeText (data = null) {
      var hasTime = this.canvas.getItemsByName('time').length > 0
      if (this.fixedCanvas || hasTime) {
        this.$toast.warning(this.$t('template.timestampError'))
        return
      }
      var timeFormat = (data)
        ? data.format
        : TIME_FORMAT[0].text
      const timeFormatVal = TIME_FORMAT.filter(item => item.text === timeFormat)[0].value
      const fontSize = (data)
        ? Math.round(data.size * (this.canvasHeight / DEFAULT_FULL_HEIGHT))
        : 16
      const fill = (data)
        ? data.color
        : '#000000'
      const left = (data)
        ? data.position[0] * (this.canvasWidth / DEFAULT_FULL_WIDTH) + this.originX
        : this.canvasWidth / 2
      const top = (data)
        ? data.position[1] * (this.canvasHeight / DEFAULT_FULL_HEIGHT) + this.originY
        : this.workSpaceHeight / 2
      var ampm = false
      var tramsTimeFormat = timeFormat
      if (data && data.showampm) {
        ampm = data.showampm
        if (timeFormat.match(/HH/)) {
          tramsTimeFormat = timeFormat.replace('HH', 'hh') + ' A'
        }
      }
      const text = new fabric.IText(dayjs().format(tramsTimeFormat), {
        left: left,
        top: top,
        fontSize: fontSize,
        fill: fill,
        hasControls: false,
        editable: false,
        name: 'time',
        ampm: ampm,
        timeFormat: timeFormat,
        timeFormatVal: timeFormatVal
      })
      text.set('fontFamily', 'Noto Sans CJK TC Regular')
      this.canvas.add(text)
    },
    removeBgImage () {
      var bgColor = this.canvas.backgroundImage._objects[0]
      this.canvas.setBackgroundImage(bgColor, this.canvas.renderAll.bind(this.canvas))
      const hasSource = this.canvas.getItemsByName('source').length > 0
      if (!hasSource) {
        this.fixedObj[0].items.shift()
      } else {
        this.fixedObj[1].items.shift()
      }
    },
    // 移除物件
    removeObject () {
      if (this.fixedCanvas) return
      const hasSource = this.canvas.getItemsByName('source').length > 0
      this.canvas.getActiveObjects().forEach((obj) => {
        this.canvas.remove(obj)
      })
      this.canvas.discardActiveObject().renderAll()
      const lastSource = this.canvas.getItemsByName('source').length === 0
      if (hasSource) {
        if (lastSource) {
          this.fixedObj.shift()
        } else {
          this.fixedObj[0].items = this.canvas.getItemsByName('source').reverse()
        }
      }
    },
    clearAll () {
      this.canvas.getObjects().forEach(el => {
        this.canvas.remove(el)
      })
      this.canvas.backgroundImage = null
      this.canvas.renderAll()
      this.fixedObj = [
        {
          items: [],
          selectable: false,
          name: 'background'
        }
      ]
      this.setColorBg()
      this.getObjects()
      this.showDialog = false
    }
  }
}
