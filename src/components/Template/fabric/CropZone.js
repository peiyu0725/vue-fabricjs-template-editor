import { fabric } from 'fabric'

export default fabric.util.createClass(fabric.Rect, {
  initialize (opts) {
    this.callSuper('initialize', opts)
    // 這行很重要，沒有這設定的話不能正常 render overlay
    this.objectCaching = false
  },
  _render (ctx) {
    this.callSuper('_render', ctx)

    // Set original scale
    const flipX = this.flipX ? -1 : 1
    const flipY = this.flipY ? -1 : 1
    const scaleX = flipX / this.scaleX
    const scaleY = flipY / this.scaleY
    const dashWidth = 8
    ctx.scale(scaleX, scaleY)

    // Overlay rendering
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    this._renderOverlay(ctx)

    this._renderBorders(ctx)
    // Set dashed borders
    ctx.setLineDash([dashWidth, dashWidth])
    // First lines rendering with black
    ctx.strokeStyle = 'rgba(255, 255, 255, 0)'
    this._renderGrid(ctx)
    ctx.strokeStyle = 'rgba(255, 255, 255)'
    this._renderGrid(ctx)

    // Reset scale
    ctx.scale(1 / scaleX, 1 / scaleY)
  },

  _renderOverlay (ctx) {
    ctx.save()
    const scaledRect = {
      width: this.getRealWidth(),
      height: this.getRealHeight()
    }
    const zoom = this.canvas.getZoom()
    var x0 = -this.canvas.width / 2 / zoom / this.scaleX * (1920 / this.targetOriginWidth) // use canvas origin width (我們先設定了 scaleX & Zoom)
    var x1 = -scaledRect.width / 2
    var x2 = scaledRect.width / 2
    var x3 = this.canvas.width / 2 / zoom / this.scaleX * (1920 / this.targetOriginWidth) // use canvas origin height
    var y0 = -this.canvas.height / 2 / zoom / this.scaleY * (1080 / this.targetOriginHeight)
    var y1 = -scaledRect.height / 2
    var y2 = scaledRect.height / 2
    var y3 = this.canvas.height / 2 / zoom / this.scaleY * (1080 / this.targetOriginHeight)

    ctx.beginPath()

    // Draw outer rectangle.
    // Numbers are +/-1 so that overlay edges don't get blurry.
    ctx.moveTo(x0, y0)
    ctx.lineTo(x3, y0)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x0, y3)
    ctx.lineTo(x0, y0)
    ctx.closePath()
    // Draw inner rectangle.
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1, y2)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x2, y1)
    ctx.lineTo(x1, y1)

    ctx.closePath()
    ctx.fill()

    ctx.restore()
  },

  _renderBorders (ctx) {
    const width = this.getRealWidth()
    const height = this.getRealHeight()
    ctx.save()
    const dashWidth = this.width / 8 * this.scaleX
    const dashVOffset = this.height / 2 * this.scaleY - (dashWidth * 1.5)
    const dashHOffset = this.width / 2 * this.scaleX - (dashWidth * 1.5)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.strokeRect(-width / 2, -height / 2, width, height)
    ctx.restore()

    ctx.save()
    ctx.setLineDash([dashWidth, dashHOffset])
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-width / 2, -height / 2) // upper left
    ctx.lineTo(width / 2, -height / 2) // upper right
    ctx.stroke()
    ctx.moveTo(-width / 2, height / 2) // down left
    ctx.lineTo(width / 2, height / 2) // down right
    ctx.stroke()

    ctx.setLineDash([dashWidth, dashVOffset])
    ctx.beginPath()
    ctx.moveTo(-width / 2, -height / 2) // upper left
    ctx.lineTo(-width / 2, height / 2) // upper right
    ctx.stroke()
    ctx.moveTo(width / 2, -height / 2) // upper right
    ctx.lineTo(width / 2, height / 2) // down right
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  },
  _renderGrid (ctx) {
    const scaledRect = {
      width: this.getRealWidth(),
      height: this.getRealHeight()
    }
    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(-scaledRect.width / 2 + 1 / 3 * scaledRect.width, -scaledRect.height / 2)
    ctx.lineTo(-scaledRect.width / 2 + 1 / 3 * scaledRect.width, scaledRect.height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-scaledRect.width / 2 + 2 / 3 * scaledRect.width, -scaledRect.height / 2)
    ctx.lineTo(-scaledRect.width / 2 + 2 / 3 * scaledRect.width, scaledRect.height / 2)
    ctx.stroke()
    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(-scaledRect.width / 2, -scaledRect.height / 2 + 1 / 3 * scaledRect.height)
    ctx.lineTo(scaledRect.width / 2, -scaledRect.height / 2 + 1 / 3 * scaledRect.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-scaledRect.width / 2, -scaledRect.height / 2 + 2 / 3 * scaledRect.height)
    ctx.lineTo(scaledRect.width / 2, -scaledRect.height / 2 + 2 / 3 * scaledRect.height)
    ctx.stroke()
  }
})
